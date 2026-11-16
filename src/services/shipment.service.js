/**
 * IBTU E-Commerce Backend
 * src/services/shipment.service.js
 *
 * Shipment Management & Customer Tracking Service
 *
 * Features:
 *  - Enforces single active shipment per order (prevents duplicate shipments).
 *  - Generates collision-resistant tracking numbers.
 *  - Enforces allowed shipment status state transitions.
 *  - Automatically synchronizes shipment events with order status and fulfillment.
 *  - Customer tracking restricted to order owner.
 *  - Append-only audit logging for shipment creation and updates.
 */

const crypto = require('crypto');
const { pool } = require('../config/database');
const AppError = require('../utils/app-error');
const OrderService = require('./order.service');

const VALID_SHIPMENT_TRANSITIONS = {
  pending: ['processing', 'shipped', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped: ['in_transit', 'delivered', 'failed', 'returned', 'cancelled'],
  in_transit: ['out_for_delivery', 'delivered', 'failed', 'returned'],
  out_for_delivery: ['delivered', 'failed', 'returned'],
  delivered: ['returned'],
  failed: ['returned', 'cancelled'],
  returned: [],
  cancelled: [],
};

class ShipmentService {
  /**
   * Shop Owner / Admin: Create Shipment for an Order
   */
  static async createShipment(orderId, adminUser, data, ipAddress = null) {
    const [[order]] = await pool.query('SELECT * FROM orders WHERE id = ?', [orderId]);
    if (!order) {
      throw AppError.notFound('Order not found.');
    }

    if (['cancelled', 'refunded'].includes(order.order_status)) {
      throw AppError.badRequest(`Cannot create a shipment for a "${order.order_status}" order.`);
    }

    // Enforce single active shipment rule
    const [[activeShipment]] = await pool.query(
      `SELECT id, tracking_number FROM shipments
       WHERE order_id = ? AND shipment_status NOT IN ('cancelled', 'returned')
       LIMIT 1`,
      [orderId]
    );

    if (activeShipment) {
      throw AppError.badRequest(
        `An active shipment already exists for Order #${order.order_number} (Tracking: ${activeShipment.tracking_number}). Multiple active shipments per order are not permitted.`
      );
    }

    // Tracking number generation or validation
    let trackingNumber = data.tracking_number ? data.tracking_number.trim() : null;
    if (!trackingNumber) {
      const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const randPart = crypto.randomBytes(3).toString('hex').toUpperCase();
      trackingNumber = `TRK-${datePart}-${randPart}`;
    } else {
      // Check duplicate tracking number
      const [[dup]] = await pool.query('SELECT id FROM shipments WHERE tracking_number = ?', [
        trackingNumber,
      ]);
      if (dup) {
        throw AppError.conflict(`Tracking number "${trackingNumber}" is already in use.`);
      }
    }

    const courierName = data.courier_name ? data.courier_name.trim() : null;
    const courierPhone = data.courier_phone ? data.courier_phone.trim() : null;
    const estimatedDeliveryDate = data.estimated_delivery_date || null;
    const shippingCost = data.shipping_cost !== undefined ? parseFloat(data.shipping_cost) : 0.0;
    const deliveryNotes = data.delivery_notes ? data.delivery_notes.trim() : null;

    const [result] = await pool.query(
      `INSERT INTO shipments (
         order_id,
         tracking_number,
         courier_name,
         courier_phone,
         shipment_status,
         shipping_cost,
         estimated_delivery_date,
         delivery_notes
       ) VALUES (?, ?, ?, ?, 'pending', ?, ?, ?)`,
      [
        orderId,
        trackingNumber,
        courierName,
        courierPhone,
        shippingCost,
        estimatedDeliveryDate,
        deliveryNotes,
      ]
    );

    const shipmentId = result.insertId;

    // Record Audit Log
    const adminName = `${adminUser.first_name || 'Admin'} ${adminUser.last_name || ''}`.trim();
    await pool.query(
      `INSERT INTO audit_logs (
         user_id,
         action,
         entity_type,
         entity_id,
         description,
         new_values,
         ip_address
       ) VALUES (?, 'SHIPMENT_CREATE', 'shipment', ?, ?, ?, ?)`,
      [
        adminUser.id,
        shipmentId,
        `Admin ${adminName} created shipment ${trackingNumber} for Order #${order.order_number}`,
        JSON.stringify({
          shipment_id: shipmentId,
          order_id: orderId,
          tracking_number: trackingNumber,
          courier_name: courierName,
          shipping_cost: shippingCost,
        }),
        ipAddress,
      ]
    );

    const [[created]] = await pool.query('SELECT * FROM shipments WHERE id = ?', [shipmentId]);
    return {
      ...created,
      shipping_cost: parseFloat(created.shipping_cost),
      order_number: order.order_number,
    };
  }

  /**
   * Shop Owner / Admin: Retrieve Shipments for an Order
   */
  static async getOrderShipments(orderId) {
    const [[order]] = await pool.query('SELECT id, order_number FROM orders WHERE id = ?', [orderId]);
    if (!order) {
      throw AppError.notFound('Order not found.');
    }

    const [shipments] = await pool.query(
      'SELECT * FROM shipments WHERE order_id = ? ORDER BY id DESC',
      [orderId]
    );

    return shipments.map((s) => ({
      ...s,
      shipping_cost: parseFloat(s.shipping_cost),
      order_number: order.order_number,
    }));
  }

  /**
   * Shop Owner / Admin: Update Shipment Status & Synchronize with Order / Inventory
   */
  static async updateShipmentStatus(shipmentId, newStatus, adminUser, deliveryNotes = null, ipAddress = null) {
    const conn = await pool.getConnection();

    try {
      await conn.beginTransaction();

      const [[shipment]] = await conn.query(
        `SELECT s.*, o.order_number, o.order_status, o.payment_status
         FROM shipments s
         JOIN orders o ON s.order_id = o.id
         WHERE s.id = ?
         FOR UPDATE`,
        [shipmentId]
      );

      if (!shipment) {
        throw AppError.notFound('Shipment not found.');
      }

      const currentStatus = shipment.shipment_status;
      const allowedNext = VALID_SHIPMENT_TRANSITIONS[currentStatus] || [];

      if (!allowedNext.includes(newStatus)) {
        throw AppError.badRequest(
          `Invalid shipment status transition from "${currentStatus}" to "${newStatus}". Allowed transitions: [${allowedNext.join(
            ', '
          )}].`
        );
      }

      let shippedAt = shipment.shipped_at;
      let deliveredAt = shipment.delivered_at;

      if (newStatus === 'shipped' && !shippedAt) {
        shippedAt = new Date();
      }
      if (newStatus === 'delivered' && !deliveredAt) {
        deliveredAt = new Date();
      }

      const updatedNotes = deliveryNotes ? deliveryNotes.trim() : shipment.delivery_notes;

      // Update shipment record
      await conn.query(
        `UPDATE shipments
         SET shipment_status = ?,
             shipped_at = ?,
             delivered_at = ?,
             delivery_notes = ?,
             updated_at = NOW()
         WHERE id = ?`,
        [newStatus, shippedAt, deliveredAt, updatedNotes, shipmentId]
      );

      // Record Audit Log
      const adminName = `${adminUser.first_name || 'Admin'} ${adminUser.last_name || ''}`.trim();
      await conn.query(
        `INSERT INTO audit_logs (
           user_id,
           action,
           entity_type,
           entity_id,
           description,
           old_values,
           new_values,
           ip_address
         ) VALUES (?, 'SHIPMENT_STATUS_UPDATE', 'shipment', ?, ?, ?, ?, ?)`,
        [
          adminUser.id,
          shipmentId,
          `Admin ${adminName} updated shipment ${shipment.tracking_number} status from "${currentStatus}" to "${newStatus}"`,
          JSON.stringify({ shipment_status: currentStatus }),
          JSON.stringify({ shipment_status: newStatus, delivery_notes: updatedNotes }),
          ipAddress,
        ]
      );

      await conn.commit();

      // Synchronize order status if shipment reached 'shipped' or 'delivered'
      if (newStatus === 'shipped' && shipment.order_status !== 'shipped') {
        try {
          await OrderService.updateOrderStatus(
            shipment.order_id,
            'shipped',
            adminUser,
            `Shipment dispatched with tracking ${shipment.tracking_number}`,
            ipAddress
          );
        } catch (syncErr) {
          console.warn('Note on order sync from shipment shipped:', syncErr.message);
        }
      } else if (newStatus === 'delivered' && shipment.order_status !== 'delivered') {
        try {
          await OrderService.updateOrderStatus(
            shipment.order_id,
            'delivered',
            adminUser,
            `Delivered by courier ${shipment.courier_name || ''}`,
            ipAddress
          );
        } catch (syncErr) {
          console.warn('Note on order sync from shipment delivered:', syncErr.message);
        }
      }

      return {
        shipment_id: shipmentId,
        order_id: shipment.order_id,
        order_number: shipment.order_number,
        tracking_number: shipment.tracking_number,
        previous_status: currentStatus,
        shipment_status: newStatus,
        shipped_at: shippedAt,
        delivered_at: deliveredAt,
        message: `Shipment status updated to "${newStatus}".`,
      };
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  }

  /**
   * Customer: Get Tracking Information for an Order
   */
  static async getCustomerTracking(orderId, user) {
    const [[order]] = await pool.query(
      'SELECT id, user_id, order_number, order_status FROM orders WHERE id = ?',
      [orderId]
    );

    if (!order) {
      throw AppError.notFound('Order not found.');
    }

    const isAdmin = user.roles && user.roles.includes('Admin');
    if (!isAdmin && order.user_id !== user.id) {
      throw AppError.forbidden('Access denied. You do not have permission to track this order.');
    }

    const [[shipment]] = await pool.query(
      `SELECT * FROM shipments
       WHERE order_id = ?
       ORDER BY id DESC
       LIMIT 1`,
      [orderId]
    );

    if (!shipment) {
      throw AppError.notFound('No shipment or tracking information found for this order.');
    }

    return {
      order_id: order.id,
      order_number: order.order_number,
      order_status: order.order_status,
      shipment_status: shipment.shipment_status,
      courier_name: shipment.courier_name,
      courier_phone: shipment.courier_phone,
      tracking_number: shipment.tracking_number,
      shipping_cost: parseFloat(shipment.shipping_cost),
      estimated_delivery_date: shipment.estimated_delivery_date,
      shipped_at: shipment.shipped_at,
      delivered_at: shipment.delivered_at,
      delivery_notes: shipment.delivery_notes,
    };
  }
}

module.exports = ShipmentService;
