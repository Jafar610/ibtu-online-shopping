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
    const connection = await require('../config/database').pool.getConnection();

    try {
      await connection.beginTransaction();

      // 1. Insert the order header
      const [orderResult] = await connection.execute(
        `INSERT INTO orders (user_id, shipping_address, total_amount, shipping_fee, payment_method, status)
         VALUES (?, ?, ?, ?, ?, 'pending')`,
        [user_id, JSON.stringify(shipping_address), total_amount, shipping_fee, payment_method]
      );
      const orderId = orderResult.insertId;

      // 2. Insert each order item
      for (const item of items) {
        await connection.execute(
          `INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price, size, color)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [orderId, item.product_id, item.product_name, item.quantity, item.unit_price, item.size || null, item.color || null]
        );

        // 3. Decrement stock
        await connection.execute(
          'UPDATE products SET stock_count = GREATEST(0, stock_count - ?) WHERE id = ?',
          [item.quantity, item.product_id]
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

    return { ...orders[0], items };
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
      'UPDATE orders SET status = ?, updated_at = NOW() WHERE id = ?',
      [status, id]
    );
    return result.affectedRows > 0;
  },

  async count() {
    const [rows] = await pool.execute('SELECT COUNT(*) AS total FROM orders');
    return rows[0].total;
  },
};

module.exports = Order;
