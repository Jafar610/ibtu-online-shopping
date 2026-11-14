/**
 * IBTU E-Commerce Backend
 * src/models/User.js
 *
 * All database queries related to the `users` table.
 * Controllers call these methods — no raw SQL in controllers.
 */

const { pool } = require('../config/database');

const User = {
  /**
   * Create a new user record.
   * @param {object} userData - { first_name, last_name, email, password_hash, phone?, role? }
   * @returns {object} The inserted row (with generated id)
   */
  async create(userData) {
    const { first_name, last_name, email, password_hash, phone = null, role = 'customer' } = userData;
    const sql = `
      INSERT INTO users (first_name, last_name, email, password_hash, phone, role)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const [result] = await pool.execute(sql, [first_name, last_name, email, password_hash, phone, role]);
    return { id: result.insertId, first_name, last_name, email, phone, role };
  },

  /**
   * Find a user by their email address.
   * @param {string} email
   * @returns {object|null}
   */
  async findByEmail(email) {
    const [rows] = await pool.execute(
      'SELECT * FROM users WHERE email = ? LIMIT 1',
      [email]
    );
    return rows[0] || null;
  },

  /**
   * Find a user by their primary key id.
   * Returns the user without the password_hash field.
   * @param {number} id
   * @returns {object|null}
   */
  async findById(id) {
    const [rows] = await pool.execute(
      'SELECT id, first_name, last_name, email, phone, role, created_at, updated_at FROM users WHERE id = ? LIMIT 1',
      [id]
    );
    return rows[0] || null;
  },

  /**
   * Update a user's profile fields.
   * @param {number} id
   * @param {object} fields - partial { first_name, last_name, phone }
   * @returns {boolean} true if any row was updated
   */
  async update(id, fields) {
    const allowed = ['first_name', 'last_name', 'phone'];
    const updates = [];
    const values = [];

    for (const key of allowed) {
      if (fields[key] !== undefined) {
        updates.push(`${key} = ?`);
        values.push(fields[key]);
      }
    }

    if (updates.length === 0) return false;
    values.push(id);

    const sql = `UPDATE users SET ${updates.join(', ')}, updated_at = NOW() WHERE id = ?`;
    const [result] = await pool.execute(sql, values);
    return result.affectedRows > 0;
  },

  /**
   * Update the user's hashed password.
   * @param {number} id
   * @param {string} password_hash
   */
  async updatePassword(id, password_hash) {
    await pool.execute(
      'UPDATE users SET password_hash = ?, updated_at = NOW() WHERE id = ?',
      [password_hash, id]
    );
  },

  /**
   * Store a password-reset token and its expiry.
   * @param {string} email
   * @param {string} token        - hashed reset token
   * @param {Date}   expiresAt    - expiry Date object
   */
  async setResetToken(email, token, expiresAt) {
    await pool.execute(
      'UPDATE users SET reset_token = ?, reset_token_expires = ?, updated_at = NOW() WHERE email = ?',
      [token, expiresAt, email]
    );
  },

  /**
   * Find a user whose reset token matches and has not expired.
   * @param {string} token - hashed token
   * @returns {object|null}
   */
  async findByResetToken(token) {
    const [rows] = await pool.execute(
      'SELECT * FROM users WHERE reset_token = ? AND reset_token_expires > NOW() LIMIT 1',
      [token]
    );
    return rows[0] || null;
  },

  /**
   * Clear the reset token fields after a successful password reset.
   * @param {number} id
   */
  async clearResetToken(id) {
    await pool.execute(
      'UPDATE users SET reset_token = NULL, reset_token_expires = NULL, updated_at = NOW() WHERE id = ?',
      [id]
    );
  },

  /**
   * List all users (admin use).
   * @param {number} limit
   * @param {number} offset
   * @returns {Array}
   */
  async findAll(limit = 20, offset = 0) {
    const [rows] = await pool.execute(
      'SELECT id, first_name, last_name, email, phone, role, created_at FROM users ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [limit, offset]
    );
    return rows;
  },

  /**
   * Count total users (for pagination).
   * @returns {number}
   */
  async count() {
    const [rows] = await pool.execute('SELECT COUNT(*) AS total FROM users');
    return rows[0].total;
  },
};

module.exports = User;
