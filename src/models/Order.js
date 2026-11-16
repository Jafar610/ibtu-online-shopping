/**
 * IBTU E-Commerce Backend
 * src/models/Order.js
 */

const { pool } = require('../config/database');

const Order = {
  /**
   * Create a new order and its items in a single transaction.
   * @param {object} orderData - { user_id, shipping_address, items[], total_amount, shipping_fee }
   * @returns {number} The new order's id
   */
  async create(orderData) {
    const { user_id, shipping_address, items, total_amount, shipping_fee = 0, payment_method = 'cod' } = orderData;
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      // 1. Insert the order header
      const [orderResult] = await connection.execute(
        `INSERT INTO orders (user_id, shipping_address_line1, total_amount, shipping_fee, order_status, payment_status)
         VALUES (?, ?, ?, ?, 'pending', 'unpaid')`,
        [user_id, JSON.stringify(shipping_address), total_amount, shipping_fee]
      );
      const orderId = orderResult.insertId;

      // 2. Insert each order item
      for (const item of items) {
        await connection.execute(
          `INSERT INTO order_items (order_id, product_id, product_name, sku, quantity, unit_price, total_price, size, color)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [orderId, item.product_id, item.product_name, item.sku || 'N/A', item.quantity, item.unit_price, item.unit_price * item.quantity, item.size || null, item.color || null]
        );
      }

      await connection.commit();
      return orderId;
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  },

  async findByUser(user_id, limit = 10, offset = 0) {
    const [rows] = await pool.execute(
      `SELECT o.*, COUNT(oi.id) AS item_count
       FROM orders o
       LEFT JOIN order_items oi ON o.id = oi.order_id
       WHERE o.user_id = ?
       GROUP BY o.id
       ORDER BY o.created_at DESC LIMIT ? OFFSET ?`,
      [user_id, Number(limit), Number(offset)]
    );
    return rows;
  },

  async findById(id) {
    const [orders] = await pool.execute('SELECT * FROM orders WHERE id = ? LIMIT 1', [id]);
    if (!orders[0]) return null;

    const [items] = await pool.execute(
      `SELECT oi.*, p.slug AS product_slug
       FROM order_items oi
       LEFT JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = ?`,
      [id]
    );

    const [payments] = await pool.execute(
      'SELECT * FROM payments WHERE order_id = ? ORDER BY id DESC LIMIT 1',
      [id]
    );

    let paymentInfo = null;
    if (payments[0]) {
      let tx = {};
      try {
        tx = typeof payments[0].transaction_response === 'string'
          ? JSON.parse(payments[0].transaction_response)
          : payments[0].transaction_response || {};
      } catch {}

      paymentInfo = {
        id: payments[0].id,
        payment_reference: payments[0].payment_reference,
        payment_method: payments[0].payment_method,
        payment_provider: payments[0].payment_provider,
        amount: parseFloat(payments[0].amount),
        currency: payments[0].currency,
        payment_status: payments[0].payment_status,
        verification_status: tx.verification_status || 'pending',
        receipt_filename: tx.receipt_filename || null,
        receipt_url: tx.receipt_filename ? `/api/payments/${payments[0].id}/receipt` : null,
        uploaded_at: tx.uploaded_at || null,
        rejection_reason: tx.rejection_reason || null,
        reviewed_by: tx.reviewed_by_name || null,
        reviewed_at: tx.reviewed_at || null,
        paid_at: payments[0].paid_at,
      };
    }

    // Attach coupon usage if any
    const [couponUsages] = await pool.query(
      `SELECT cu.*, c.code AS coupon_code, c.discount_type
       FROM coupon_usages cu
       JOIN coupons c ON cu.coupon_id = c.id
       WHERE cu.order_id = ?
       LIMIT 1`,
      [id]
    );

    const couponInfo = couponUsages[0]
      ? {
          coupon_id: couponUsages[0].coupon_id,
          coupon_code: couponUsages[0].coupon_code,
          discount_type: couponUsages[0].discount_type,
          discount_amount: parseFloat(couponUsages[0].discount_amount),
          usage_status: couponUsages[0].usage_status,
        }
      : null;

    return { ...orders[0], items, payment: paymentInfo, coupon: couponInfo };
  },

  async findAll(limit = 20, offset = 0) {
    const [rows] = await pool.execute(
      `SELECT o.*, u.first_name, u.last_name, u.email, COUNT(oi.id) AS item_count
       FROM orders o
       LEFT JOIN users u ON o.user_id = u.id
       LEFT JOIN order_items oi ON o.id = oi.order_id
       GROUP BY o.id
       ORDER BY o.created_at DESC LIMIT ? OFFSET ?`,
      [Number(limit), Number(offset)]
    );
    return rows;
  },

  async updateStatus(id, status) {
    const allowed = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!allowed.includes(status)) throw new Error(`Invalid status: ${status}`);
    const [result] = await pool.execute(
      'UPDATE orders SET order_status = ?, updated_at = NOW() WHERE id = ?',
      [status, id]
    );

    if (status === 'cancelled') {
      // Release any reserved coupon usages
      const [couponUsages] = await pool.query(
        'SELECT id, coupon_id FROM coupon_usages WHERE order_id = ? AND usage_status = "reserved"',
        [id]
      );
      for (const cu of couponUsages) {
        await pool.query(
          'UPDATE coupon_usages SET usage_status = "cancelled" WHERE id = ?',
          [cu.id]
        );
        await pool.query(
          'UPDATE coupons SET usage_count = GREATEST(0, usage_count - 1) WHERE id = ?',
          [cu.coupon_id]
        );
      }
    }

    return result.affectedRows > 0;
  },

  async count() {
    const [rows] = await pool.execute('SELECT COUNT(*) AS total FROM orders');
    return rows[0].total;
  },
};

module.exports = Order;
