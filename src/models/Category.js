/**
 * IBTU E-Commerce Backend
 * src/models/Category.js
 */

const { pool } = require('../config/database');

const Category = {
  async findAll() {
    const [rows] = await pool.execute(
      'SELECT * FROM categories WHERE is_active = 1 ORDER BY display_order ASC, name ASC'
    );
    return rows;
  },

  async findById(id) {
    const [rows] = await pool.execute('SELECT * FROM categories WHERE id = ? LIMIT 1', [id]);
    return rows[0] || null;
  },

  async findBySlug(slug) {
    const [rows] = await pool.execute('SELECT * FROM categories WHERE slug = ? LIMIT 1', [slug]);
    return rows[0] || null;
  },

  async create(data) {
    const { name, amharic_name, slug, description = null, image = null, display_order = 0 } = data;
    const [result] = await pool.execute(
      'INSERT INTO categories (name, amharic_name, slug, description, image, display_order) VALUES (?, ?, ?, ?, ?, ?)',
      [name, amharic_name, slug, description, image, display_order]
    );
    return result.insertId;
  },

  async update(id, data) {
    const allowed = ['name', 'amharic_name', 'slug', 'description', 'image', 'display_order', 'is_active'];
    const updates = [];
    const values = [];
    for (const key of allowed) {
      if (data[key] !== undefined) { updates.push(`${key} = ?`); values.push(data[key]); }
    }
    if (updates.length === 0) return false;
    values.push(id);
    const [result] = await pool.execute(
      `UPDATE categories SET ${updates.join(', ')}, updated_at = NOW() WHERE id = ?`,
      values
    );
    return result.affectedRows > 0;
  },

  async delete(id) {
    const [result] = await pool.execute(
      'UPDATE categories SET is_active = 0, updated_at = NOW() WHERE id = ?', [id]
    );
    return result.affectedRows > 0;
  },
};

module.exports = Category;
