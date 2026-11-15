/**
 * IBTU E-Commerce Backend
 * src/models/Cart.js
 */

const { pool } = require('../config/database');

const Cart = {
  /**
   * Get all cart items for a user (joins product data).
   */
  async findByUser(user_id) {
    const [rows] = await pool.execute(
      `SELECT ci.*, p.name, p.amharic_name, p.price, p.stock_count, p.slug,
              JSON_UNQUOTE(JSON_EXTRACT(p.images, '$[0]')) AS image
       FROM cart_items ci
       JOIN products p ON ci.product_id = p.id
       WHERE ci.user_id = ?`,
      [user_id]
    );
    return rows;
  },

  /**
   * Add or update an item in the cart (upsert by user+product+size+color).
   */
  async upsert(user_id, product_id, quantity, size = null, color = null) {
    const [existing] = await pool.execute(
      'SELECT id, quantity FROM cart_items WHERE user_id = ? AND product_id = ? AND size <=> ? AND color <=> ?',
      [user_id, product_id, size, color]
    );

    if (existing.length > 0) {
      await pool.execute(
        'UPDATE cart_items SET quantity = quantity + ?, updated_at = NOW() WHERE id = ?',
        [quantity, existing[0].id]
      );
      return existing[0].id;
    }

    const [result] = await pool.execute(
      'INSERT INTO cart_items (user_id, product_id, quantity, size, color) VALUES (?, ?, ?, ?, ?)',
      [user_id, product_id, quantity, size, color]
    );
    return result.insertId;
  },

  /**
   * Update the quantity of a specific cart item.
   */
  async updateQuantity(id, user_id, quantity) {
    const [result] = await pool.execute(
      'UPDATE cart_items SET quantity = ?, updated_at = NOW() WHERE id = ? AND user_id = ?',
      [quantity, id, user_id]
    );
    return result.affectedRows > 0;
  },

  /**
   * Remove a single cart item.
   */
  async remove(id, user_id) {
    const [result] = await pool.execute(
      'DELETE FROM cart_items WHERE id = ? AND user_id = ?',
      [id, user_id]
    );
    return result.affectedRows > 0;
  },

  /**
   * Clear the entire cart for a user (called after order placement).
   */
  async clear(user_id) {
    await pool.execute('DELETE FROM cart_items WHERE user_id = ?', [user_id]);
  },
};

module.exports = Cart;
