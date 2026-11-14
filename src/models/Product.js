/**
 * IBTU E-Commerce Backend
 * src/models/Product.js
 *
 * All database queries related to the `products` table.
 */

const { pool } = require('../config/database');

const Product = {
  /**
   * Find all products with optional filters, sorting, and pagination.
   * @param {object} options
   */
  async findAll({ category_id, search, min_price, max_price, sort = 'created_at', order = 'DESC', limit = 12, offset = 0 } = {}) {
    let sql = `
      SELECT p.*, c.name AS category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.is_active = 1
    `;
    const params = [];

    if (category_id) {
      sql += ' AND p.category_id = ?';
      params.push(category_id);
    }

    if (search) {
      sql += ' AND (p.name LIKE ? OR p.amharic_name LIKE ? OR p.description LIKE ?)';
      const q = `%${search}%`;
      params.push(q, q, q);
    }

    if (min_price !== undefined && min_price !== null) {
      sql += ' AND p.price >= ?';
      params.push(Number(min_price));
    }

    if (max_price !== undefined && max_price !== null) {
      sql += ' AND p.price <= ?';
      params.push(Number(max_price));
    }

    // Whitelist sort columns to prevent SQL injection
    const allowedSort = ['created_at', 'price', 'name', 'rating'];
    const safeSort = allowedSort.includes(sort) ? sort : 'created_at';
    const safeOrder = order === 'ASC' ? 'ASC' : 'DESC';

    sql += ` ORDER BY p.${safeSort} ${safeOrder} LIMIT ? OFFSET ?`;
    params.push(Number(limit), Number(offset));

    const [rows] = await pool.execute(sql, params);
    return rows;
  },

  /**
   * Count products matching the same filters (for pagination).
   */
  async count({ category_id, search, min_price, max_price } = {}) {
    let sql = 'SELECT COUNT(*) AS total FROM products p WHERE p.is_active = 1';
    const params = [];

    if (category_id) { sql += ' AND p.category_id = ?'; params.push(category_id); }
    if (search) {
      sql += ' AND (p.name LIKE ? OR p.amharic_name LIKE ? OR p.description LIKE ?)';
      const q = `%${search}%`;
      params.push(q, q, q);
    }
    if (min_price !== undefined && min_price !== null) { sql += ' AND p.price >= ?'; params.push(Number(min_price)); }
    if (max_price !== undefined && max_price !== null) { sql += ' AND p.price <= ?'; params.push(Number(max_price)); }

    const [rows] = await pool.execute(sql, params);
    return rows[0].total;
  },

  /**
   * Find a single product by its id.
   */
  async findById(id) {
    const [rows] = await pool.execute(
      `SELECT p.*, c.name AS category_name
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.id = ? AND p.is_active = 1 LIMIT 1`,
      [id]
    );
    return rows[0] || null;
  },

  /**
   * Find a single product by its slug.
   */
  async findBySlug(slug) {
    const [rows] = await pool.execute(
      `SELECT p.*, c.name AS category_name
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.slug = ? AND p.is_active = 1 LIMIT 1`,
      [slug]
    );
    return rows[0] || null;
  },

  /**
   * Get featured/best-seller/new-arrival products.
   * @param {string} type - 'featured' | 'best_seller' | 'new_arrival'
   * @param {number} limit
   */
  async findByType(type, limit = 8) {
    const allowedTypes = ['is_featured', 'is_best_seller', 'is_new_arrival'];
    const col = type === 'featured' ? 'is_featured'
      : type === 'best_seller' ? 'is_best_seller'
      : 'is_new_arrival';

    if (!allowedTypes.includes(col)) return [];

    const [rows] = await pool.execute(
      `SELECT p.*, c.name AS category_name
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.${col} = 1 AND p.is_active = 1
       ORDER BY p.created_at DESC LIMIT ?`,
      [Number(limit)]
    );
    return rows;
  },

  /**
   * Get related products from the same category.
   */
  async findRelated(productId, categoryId, limit = 4) {
    const [rows] = await pool.execute(
      `SELECT p.*, c.name AS category_name
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.category_id = ? AND p.id != ? AND p.is_active = 1
       ORDER BY RAND() LIMIT ?`,
      [categoryId, productId, Number(limit)]
    );
    return rows;
  },

  /**
   * Create a new product (admin).
   */
  async create(data) {
    const {
      name, amharic_name, slug, category_id, description,
      price, original_price = null, stock_count, fabric = null,
      sizes = '[]', colors = '[]', images = '[]',
      is_featured = 0, is_best_seller = 0, is_new_arrival = 0,
      is_traditional = 0, badge = null
    } = data;

    const sql = `
      INSERT INTO products
        (name, amharic_name, slug, category_id, description, price, original_price,
         stock_count, fabric, sizes, colors, images, is_featured, is_best_seller,
         is_new_arrival, is_traditional, badge)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await pool.execute(sql, [
      name, amharic_name, slug, category_id, description, price, original_price,
      stock_count, fabric, JSON.stringify(sizes), JSON.stringify(colors), JSON.stringify(images),
      is_featured, is_best_seller, is_new_arrival, is_traditional, badge
    ]);
    return result.insertId;
  },

  /**
   * Update a product (admin).
   */
  async update(id, data) {
    const allowed = [
      'name', 'amharic_name', 'slug', 'category_id', 'description',
      'price', 'original_price', 'stock_count', 'fabric',
      'is_featured', 'is_best_seller', 'is_new_arrival', 'is_traditional',
      'badge', 'is_active'
    ];
    const updates = [];
    const values = [];

    for (const key of allowed) {
      if (data[key] !== undefined) {
        updates.push(`${key} = ?`);
        values.push(data[key]);
      }
    }

    if (updates.length === 0) return false;
    values.push(id);
    const [result] = await pool.execute(
      `UPDATE products SET ${updates.join(', ')}, updated_at = NOW() WHERE id = ?`,
      values
    );
    return result.affectedRows > 0;
  },

  /**
   * Soft-delete a product (set is_active = 0).
   */
  async delete(id) {
    const [result] = await pool.execute(
      'UPDATE products SET is_active = 0, updated_at = NOW() WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  },
};

module.exports = Product;
