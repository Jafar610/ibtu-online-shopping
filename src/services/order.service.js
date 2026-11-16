/**
 * IBTU E-Commerce Backend
 * src/services/order.service.js
 *
 * Order Management & Fulfillment Service
 *
 * Implements:
 *  - Filtering, searching, sorting, and pagination for Admin orders.
 *  - Full order detail aggregation (items, snapshots, payments, coupon, shipments).
 *  - Enforced status transition state-machine.
 *  - Atomic inventory deduction during fulfillment (physical stock down, reserved down, sale movement logged).
 *  - Atomic inventory release during cancellation (reserved down, released movement logged).
 *  - Strict coupon usage release during cancellation.
 *  - Payment rules (non-COD requires payment verification before dispatch).
 *  - Append-only audit logging.
 */

const { pool } = require('../config/database');
const AppError = require('../utils/app-error');

// Allowed status transitions map
const VALID_TRANSITIONS = {
  pending: ['confirmed', 'processing', 'cancelled'],
  confirmed: ['processing', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped: ['delivered', 'cancelled', 'refunded'],
  delivered: ['refunded'],
  cancelled: [],
  refunded: [],
};

class OrderService {
  /**
   * Shop Owner / Admin: Retrieve all orders with filters, search, and pagination
   */
  static async getAllOrders({
    search,
    order_status,
    payment_status,
    payment_method,
    date_from,
    date_to,
    page = 1,
    limit = 20,
    sort_by = 'placed_at',
    sort_order = 'DESC',
  } = {}) {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const offset = (pageNum - 1) * limitNum;

    const sortWhitelist = [
      'id',
      'order_number',
      'total_amount',
      'placed_at',
      'order_status',
      'payment_status',
      'customer_name',
    ];
    const safeSortBy = sortWhitelist.includes(sort_by) ? sort_by : 'placed_at';
    const safeOrder = sort_order && sort_order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const conditions = [];
    const params = [];

    if (search) {
      conditions.push(
        '(o.order_number LIKE ? OR o.customer_name LIKE ? OR o.customer_email LIKE ? OR o.customer_phone LIKE ?)'
      );
      const s = `%${search.trim()}%`;
      params.push(s, s, s, s);
    }

    if (order_status) {
      conditions.push('o.order_status = ?');
      params.push(order_status);
    }

    if (payment_status) {
      conditions.push('o.payment_status = ?');
      params.push(payment_status);
    }

    if (payment_method) {
      conditions.push('p.payment_method = ?');
      params.push(payment_method);
    }

    if (date_from) {
      conditions.push('o.placed_at >= ?');
      params.push(date_from);
    }

    if (date_to) {
      conditions.push('o.placed_at <= ?');
      params.push(date_to);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Total count query
    const [[countRow]] = await pool.query(
      `SELECT COUNT(DISTINCT o.id) AS total
       FROM orders o
       LEFT JOIN payments p ON p.order_id = o.id
       ${whereClause}`,
      params
    );
    const total = countRow.total;

    // Data query
    const [rows] = await pool.query(
      `SELECT
         o.*,
         p.id AS payment_id,
         p.payment_reference,
         p.payment_method,
         p.payment_provider,
         p.payment_status AS detailed_payment_status,
         (SELECT COUNT(*) FROM order_items oi WHERE oi.order_id = o.id) AS total_items,
         (SELECT s.shipment_status FROM shipments s WHERE s.order_id = o.id ORDER BY s.id DESC LIMIT 1) AS shipment_status,
         (SELECT s.tracking_number FROM shipments s WHERE s.order_id = o.id ORDER BY s.id DESC LIMIT 1) AS tracking_number
       FROM orders o
       LEFT JOIN payments p ON p.order_id = o.id
       ${whereClause}
       GROUP BY o.id
       ORDER BY o.${safeSortBy} ${safeOrder}
       LIMIT ? OFFSET ?`,
      [...params, limitNum, offset]
    );

    const formatted = rows.map((r) => ({
      id: r.id,
      order_number: r.order_number,
      customer_name: r.customer_name,
      customer_email: r.customer_email,
      customer_phone: r.customer_phone,
      subtotal: parseFloat(r.subtotal),
      discount_amount: parseFloat(r.discount_amount),
      shipping_cost: parseFloat(r.shipping_cost),
      tax_amount: parseFloat(r.tax_amount),
      total_amount: parseFloat(r.total_amount),
      currency: r.currency,
      order_status: r.order_status,
      payment_status: r.payment_status,
      payment_method: r.payment_method || null,
      payment_provider: r.payment_provider || null,
      payment_reference: r.payment_reference || null,
      shipment_status: r.shipment_status || 'not_created',
      tracking_number: r.tracking_number || null,
      total_items: parseInt(r.total_items, 10) || 0,
      placed_at: r.placed_at,
      created_at: r.created_at,
    }));

    return {
      orders: formatted,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        total_pages: Math.ceil(total / limitNum),
      },
    };
  }

  /**
   * Retrieve single order details with full relations (Customer or Admin)
   */
  static async getOrderDetails(orderId, user) {
    const [[order]] = await pool.query('SELECT * FROM orders WHERE id = ?', [orderId]);
    if (!order) {
      throw AppError.notFound('Order not found.');
    }

    const isAdmin = user.roles && user.roles.includes('Admin');
    if (!isAdmin && order.user_id !== user.id) {
      throw AppError.forbidden('Access denied. You do not have permission to view this order.');
    }

    // 1. Order Items
    const [items] = await pool.query(
      `SELECT
         oi.*,
         pv.price AS current_price,
         pv.sale_price AS current_sale_price,
         pv.stock_quantity AS current_stock,
         p.slug AS product_slug
       FROM order_items oi
       LEFT JOIN product_variants pv ON oi.variant_id = pv.id
       LEFT JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = ?`,
      [orderId]
    );

    // 2. Payments list
    const [payments] = await pool.query(
      'SELECT * FROM payments WHERE order_id = ? ORDER BY id DESC',
      [orderId]
    );

    const formattedPayments = payments.map((p) => {
      let tx = {};
      try {
        tx = typeof p.transaction_response === 'string'
          ? JSON.parse(p.transaction_response)
          : p.transaction_response || {};
      } catch {}

      return {
        id: p.id,
        payment_reference: p.payment_reference,
        payment_method: p.payment_method,
        payment_provider: p.payment_provider,
        amount: parseFloat(p.amount),
        currency: p.currency,
        payment_status: p.payment_status,
        verification_status: tx.verification_status || 'pending',
        receipt_filename: tx.receipt_filename || null,
        receipt_url: tx.receipt_filename ? `/api/payments/${p.id}/receipt` : null,
        uploaded_at: tx.uploaded_at || null,
        rejection_reason: tx.rejection_reason || null,
        reviewed_by: tx.reviewed_by_name || null,
        reviewed_at: tx.reviewed_at || null,
        paid_at: p.paid_at,
        created_at: p.created_at,
      };
    });

    // 3. Coupon usage if any
    const [couponRows] = await pool.query(
      `SELECT cu.*, c.code AS coupon_code, c.discount_type
       FROM coupon_usages cu
       JOIN coupons c ON cu.coupon_id = c.id
       WHERE cu.order_id = ?
       LIMIT 1`,
      [orderId]
    );

    const couponInfo = couponRows[0]
      ? {
          coupon_id: couponRows[0].coupon_id,
          coupon_code: couponRows[0].coupon_code,
          discount_type: couponRows[0].discount_type,
          discount_amount: parseFloat(couponRows[0].discount_amount),
          usage_status: couponRows[0].usage_status,
        }
      : null;

    // 4. Shipments list
    const [shipments] = await pool.query(
      'SELECT * FROM shipments WHERE order_id = ? ORDER BY id DESC',
      [orderId]
    );

    const formattedShipments = shipments.map((s) => ({
      id: s.id,
      tracking_number: s.tracking_number,
      courier_name: s.courier_name,
      courier_phone: s.courier_phone,
      shipment_status: s.shipment_status,
      shipping_cost: parseFloat(s.shipping_cost),
      estimated_delivery_date: s.estimated_delivery_date,
      shipped_at: s.shipped_at,
      delivered_at: s.delivered_at,
      delivery_notes: s.delivery_notes,
      created_at: s.created_at,
      updated_at: s.updated_at,
    }));

    return {
      order: {
        id: order.id,
        order_number: order.order_number,
        user_id: order.user_id,
        customer_name: order.customer_name,
        customer_email: order.customer_email,
        customer_phone: order.customer_phone,
        shipping_address: {
          id: order.shipping_address_id,
          address_line1: order.shipping_address_line1,
          address_line2: order.shipping_address_line2,
          city: order.shipping_city,
          region: order.shipping_region,
          postal_code: order.shipping_postal_code,
          country: order.shipping_country,
        },
        subtotal: parseFloat(order.subtotal),
        discount_amount: parseFloat(order.discount_amount),
        shipping_cost: parseFloat(order.shipping_cost),
        tax_amount: parseFloat(order.tax_amount),
        total_amount: parseFloat(order.total_amount),
        currency: order.currency,
        order_status: order.order_status,
        payment_status: order.payment_status,
        customer_notes: order.customer_notes,
        admin_notes: order.admin_notes,
        placed_at: order.placed_at,
        created_at: order.created_at,
        updated_at: order.updated_at,
      },
      items: items.map((i) => ({
        id: i.id,
        product_id: i.product_id,
        variant_id: i.variant_id,
        product_name: i.product_name,
        product_slug: i.product_slug,
        sku: i.sku,
        size: i.size,
        color: i.color,
        quantity: i.quantity,
        unit_price: parseFloat(i.unit_price),
        discount_amount: parseFloat(i.discount_amount),
        total_price: parseFloat(i.total_price),
      })),
      payments: formattedPayments,
      coupon: couponInfo,
      shipments: formattedShipments,
    };
  }

  /**
   * Shop Owner / Admin: Update Order Status & Handle Inventory Fulfillment
   */
  static async updateOrderStatus(orderId, newStatus, adminUser, adminNotes = null, ipAddress = null) {
    const conn = await pool.getConnection();

    try {
      await conn.beginTransaction();

      // 1. Lock order row
      const [[order]] = await conn.query(
        'SELECT * FROM orders WHERE id = ? FOR UPDATE',
        [orderId]
      );

      if (!order) {
        throw AppError.notFound('Order not found.');
      }

      const currentStatus = order.order_status;

      // Check valid transitions
      const allowedNext = VALID_TRANSITIONS[currentStatus] || [];
      if (!allowedNext.includes(newStatus)) {
        throw AppError.badRequest(
          `Invalid order status transition from "${currentStatus}" to "${newStatus}". Allowed transitions: [${allowedNext.join(
            ', '
          )}].`
        );
      }

      // Check payment approval rule for non-COD orders (Section 9 #4)
      const [[payment]] = await conn.query(
        'SELECT payment_method, payment_status FROM payments WHERE order_id = ? ORDER BY id DESC LIMIT 1',
        [orderId]
      );

      const isCOD = payment && payment.payment_method === 'cash_on_delivery';
      if (!isCOD && ['processing', 'shipped'].includes(newStatus)) {
        if (order.payment_status !== 'paid') {
          throw AppError.badRequest(
            'Cannot advance order to processing or shipped because payment has not been verified and marked as paid.'
          );
        }
      }

      // 2. Inventory Fulfillment: When transitioning to 'shipped' (Section 8 A)
      if (newStatus === 'shipped') {
        // Verify whether physical stock has already been deducted for this order
        const [[deductedCheck]] = await conn.query(
          `SELECT COUNT(*) AS count
           FROM inventory_movements
           WHERE reference_type = 'order' AND reference_id = ? AND movement_type = 'sale'`,
          [orderId]
        );

        if (!deductedCheck || deductedCheck.count === 0) {
          // Lock and process order items
          const [orderItems] = await conn.query(
            'SELECT variant_id, quantity FROM order_items WHERE order_id = ?',
            [orderId]
          );

          for (const item of orderItems) {
            const [[variant]] = await conn.query(
              'SELECT id, stock_quantity, reserved_quantity FROM product_variants WHERE id = ? FOR UPDATE',
              [item.variant_id]
            );

            if (variant) {
              const qtyBefore = variant.stock_quantity;
              const qtyAfter = Math.max(0, variant.stock_quantity - item.quantity);

              // Deduct physical stock and release reserved stock
              await conn.query(
                `UPDATE product_variants
                 SET stock_quantity = GREATEST(0, stock_quantity - ?),
                     reserved_quantity = GREATEST(0, reserved_quantity - ?)
                 WHERE id = ?`,
                [item.quantity, item.quantity, item.variant_id]
              );

              // Record sale inventory movement
              await conn.query(
                `INSERT INTO inventory_movements (
                   variant_id,
                   user_id,
                   movement_type,
                   quantity,
                   quantity_before,
                   quantity_after,
                   reference_type,
                   reference_id,
                   reason,
                   notes
                 ) VALUES (?, ?, 'sale', ?, ?, ?, 'order', ?, 'Order fulfilled & dispatched', ?)`,
                [
                  item.variant_id,
                  adminUser.id,
                  item.quantity,
                  qtyBefore,
                  qtyAfter,
                  orderId,
                  `Order #${order.order_number}`,
                ]
              );
            }
          }
        }
      }

      // 3. If transitioning to 'delivered' for Cash on Delivery orders, mark payment paid
      let updatedPaymentStatus = order.payment_status;
      if (newStatus === 'delivered' && isCOD) {
        updatedPaymentStatus = 'paid';
        await conn.query(
          'UPDATE payments SET payment_status = "successful", paid_at = NOW() WHERE order_id = ?',
          [orderId]
        );
      }

      // 4. Update Order
      const updatedNotes = adminNotes ? adminNotes.trim() : order.admin_notes;
      await conn.query(
        `UPDATE orders
         SET order_status = ?,
             payment_status = ?,
             admin_notes = ?,
             updated_at = NOW()
         WHERE id = ?`,
        [newStatus, updatedPaymentStatus, updatedNotes, orderId]
      );

      // 5. Append-only Audit Log
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
         ) VALUES (?, 'ORDER_STATUS_UPDATE', 'order', ?, ?, ?, ?, ?)`,
        [
          adminUser.id,
          orderId,
          `Admin ${adminName} updated status of Order #${order.order_number} from "${currentStatus}" to "${newStatus}"`,
          JSON.stringify({
            order_status: currentStatus,
            payment_status: order.payment_status,
          }),
          JSON.stringify({
            order_status: newStatus,
            payment_status: updatedPaymentStatus,
            admin_notes: updatedNotes,
          }),
          ipAddress,
        ]
      );

      await conn.commit();

      return {
        order_id: orderId,
        order_number: order.order_number,
        previous_status: currentStatus,
        order_status: newStatus,
        payment_status: updatedPaymentStatus,
        message: `Order status successfully updated to "${newStatus}".`,
      };
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  }

  /**
   * Cancel an Order (Customer or Admin)
   */
  static async cancelOrder(orderId, user, cancellationReason, ipAddress = null) {
    if (!cancellationReason || typeof cancellationReason !== 'string' || cancellationReason.trim().length === 0) {
      throw AppError.badRequest('Cancellation reason is required.');
    }

    const conn = await pool.getConnection();

    try {
      await conn.beginTransaction();

      // 1. Lock order row
      const [[order]] = await conn.query(
        'SELECT * FROM orders WHERE id = ? FOR UPDATE',
        [orderId]
      );

      if (!order) {
        throw AppError.notFound('Order not found.');
      }

      const isAdmin = user.roles && user.roles.includes('Admin');

      // Ownership check for customers
      if (!isAdmin && order.user_id !== user.id) {
        throw AppError.forbidden('Access denied. You do not own this order.');
      }

      // Customer cancellation eligibility: only 'pending' or 'confirmed'
      if (!isAdmin) {
        if (!['pending', 'confirmed'].includes(order.order_status)) {
          throw AppError.badRequest(
            `Order #${order.order_number} cannot be cancelled because it is in "${order.order_status}" status.`
          );
        }
      } else {
        // Admin cancellation eligibility: cannot cancel if already shipped or delivered
        if (['shipped', 'delivered', 'refunded', 'cancelled'].includes(order.order_status)) {
          throw AppError.badRequest(
            `Order #${order.order_number} cannot be cancelled because it is already "${order.order_status}".`
          );
        }
      }

      // 2. Release Reserved Inventory (Section 8 B)
      // Check if reservation was already released
      const [[releasedCheck]] = await conn.query(
        `SELECT COUNT(*) AS count
         FROM inventory_movements
         WHERE reference_type = 'order' AND reference_id = ? AND movement_type = 'released'`,
        [orderId]
      );

      if (!releasedCheck || releasedCheck.count === 0) {
        const [items] = await conn.query(
          'SELECT variant_id, quantity FROM order_items WHERE order_id = ?',
          [orderId]
        );

        for (const item of items) {
          const [[variant]] = await conn.query(
            'SELECT id, stock_quantity, reserved_quantity FROM product_variants WHERE id = ? FOR UPDATE',
            [item.variant_id]
          );

          if (variant) {
            const reservedBefore = variant.reserved_quantity;
            const reservedAfter = Math.max(0, variant.reserved_quantity - item.quantity);

            // Release reserved stock without touching physical stock
            await conn.query(
              'UPDATE product_variants SET reserved_quantity = GREATEST(0, reserved_quantity - ?) WHERE id = ?',
              [item.quantity, item.variant_id]
            );

            // Insert inventory movement
            await conn.query(
              `INSERT INTO inventory_movements (
                 variant_id,
                 user_id,
                 movement_type,
                 quantity,
                 quantity_before,
                 quantity_after,
                 reference_type,
                 reference_id,
                 reason,
                 notes
               ) VALUES (?, ?, 'released', ?, ?, ?, 'order', ?, 'Order cancelled - stock reservation released', ?)`,
              [
                item.variant_id,
                user.id,
                item.quantity,
                reservedBefore,
                reservedAfter,
                orderId,
                `Order #${order.order_number}`,
              ]
            );
          }
        }
      }

      // 3. Release Reserved Coupon Usages (Section 10)
      const [couponUsages] = await conn.query(
        'SELECT id, coupon_id FROM coupon_usages WHERE order_id = ? AND usage_status = "reserved"',
        [orderId]
      );

      for (const cu of couponUsages) {
        await conn.query(
          'UPDATE coupon_usages SET usage_status = "cancelled" WHERE id = ?',
          [cu.id]
        );
        await conn.query(
          'UPDATE coupons SET usage_count = GREATEST(0, usage_count - 1) WHERE id = ?',
          [cu.coupon_id]
        );
      }

      // 4. Cancel active shipments if any
      await conn.query(
        `UPDATE shipments
         SET shipment_status = 'cancelled', updated_at = NOW()
         WHERE order_id = ? AND shipment_status NOT IN ('delivered', 'cancelled')`,
        [orderId]
      );

      // 5. Update Order status
      const updatedNotes = `Cancelled: ${cancellationReason.trim()}${
        order.admin_notes ? ` | Previous notes: ${order.admin_notes}` : ''
      }`;

      await conn.query(
        `UPDATE orders
         SET order_status = 'cancelled',
             admin_notes = ?,
             updated_at = NOW()
         WHERE id = ?`,
        [updatedNotes, orderId]
      );

      // 6. Record Audit Log
      const actorLabel = isAdmin ? `Admin ${user.first_name || 'Admin'}` : `Customer ${user.email}`;
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
         ) VALUES (?, 'ORDER_CANCEL', 'order', ?, ?, ?, ?, ?)`,
        [
          user.id,
          orderId,
          `${actorLabel} cancelled Order #${order.order_number}. Reason: ${cancellationReason.trim()}`,
          JSON.stringify({ order_status: order.order_status }),
          JSON.stringify({
            order_status: 'cancelled',
            cancellation_reason: cancellationReason.trim(),
          }),
          ipAddress,
        ]
      );

      await conn.commit();

      return {
        order_id: orderId,
        order_number: order.order_number,
        order_status: 'cancelled',
        message: `Order #${order.order_number} has been cancelled successfully.`,
      };
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  }

  /**
   * Customer: Get list of authenticated customer's own orders
   */
  static async getCustomerOrders(userId, { page = 1, limit = 10 } = {}) {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));
    const offset = (pageNum - 1) * limitNum;

    const [[countRow]] = await pool.query(
      'SELECT COUNT(*) AS total FROM orders WHERE user_id = ?',
      [userId]
    );
    const total = countRow.total;

    const [rows] = await pool.query(
      `SELECT
         o.*,
         p.payment_method,
         p.payment_provider,
         p.payment_reference,
         (SELECT COUNT(*) FROM order_items oi WHERE oi.order_id = o.id) AS total_items,
         (SELECT s.shipment_status FROM shipments s WHERE s.order_id = o.id ORDER BY s.id DESC LIMIT 1) AS shipment_status,
         (SELECT s.tracking_number FROM shipments s WHERE s.order_id = o.id ORDER BY s.id DESC LIMIT 1) AS tracking_number
       FROM orders o
       LEFT JOIN payments p ON p.order_id = o.id
       WHERE o.user_id = ?
       GROUP BY o.id
       ORDER BY o.placed_at DESC
       LIMIT ? OFFSET ?`,
      [userId, limitNum, offset]
    );

    const formatted = rows.map((r) => ({
      id: r.id,
      order_number: r.order_number,
      total_amount: parseFloat(r.total_amount),
      currency: r.currency,
      order_status: r.order_status,
      payment_status: r.payment_status,
      payment_method: r.payment_method || null,
      payment_provider: r.payment_provider || null,
      payment_reference: r.payment_reference || null,
      shipment_status: r.shipment_status || 'not_created',
      tracking_number: r.tracking_number || null,
      total_items: parseInt(r.total_items, 10) || 0,
      placed_at: r.placed_at,
    }));

    return {
      orders: formatted,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        total_pages: Math.ceil(total / limitNum),
      },
    };
  }
}

module.exports = OrderService;
