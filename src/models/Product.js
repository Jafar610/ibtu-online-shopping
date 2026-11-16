/**
 * IBTU E-Commerce Backend
 * src/models/Product.js
 *
 * Real MariaDB Database Model for `products` table
 * Coordinates with `categories`, `product_variants`, and `product_images`.
 */

const { pool } = require('../config/database');

const Product = {
  /**
   * Find products with optional filtering, search, and pagination
   */
  async findAll({
    category_id,
    search,
    min_price,
    max_price,
    sort = 'created_at',
    order = 'DESC',
    limit = 12,
    offset = 0,
  } = {}) {
    let sql = `
      SELECT
        p.id,
        p.name,
        p.slug,
        p.short_description,
        p.description,
        p.material,
        p.status,
        p.is_featured,
        p.created_at,
        c.id AS category_id,
        c.name AS category_name,
        COALESCE(MIN(pv.price), 0) AS price,
        COALESCE(MIN(pv.sale_price), NULL) AS sale_price,
        COALESCE(SUM(pv.stock_quantity), 0) AS total_stock,
        (
          SELECT pi.image_url
          FROM product_images pi
          WHERE pi.product_id = p.id
          ORDER BY pi.is_primary DESC, pi.sort_order ASC
          LIMIT 1
        ) AS image_url
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN product_variants pv ON pv.product_id = p.id AND pv.is_active = 1
      WHERE p.status = 'active'
    `;
    const params = [];

    if (category_id) {
      sql += ' AND p.category_id = ?';
      params.push(Number(category_id));
    }

    if (search) {
      sql += ' AND (p.name LIKE ? OR p.description LIKE ?)';
      const q = `%${search}%`;
      params.push(q, q);
    }

    sql += ' GROUP BY p.id';

    const havingClauses = [];
    if (min_price !== undefined && min_price !== null) {
      havingClauses.push('price >= ?');
      params.push(Number(min_price));
    }
    if (max_price !== undefined && max_price !== null) {
      havingClauses.push('price <= ?');
      params.push(Number(max_price));
    }

    if (havingClauses.length > 0) {
      sql += ` HAVING ${havingClauses.join(' AND ')}`;
    }

    const allowedSort = ['created_at', 'name', 'price'];
    const safeSort = allowedSort.includes(sort) ? sort : 'created_at';
    const safeOrder = order === 'ASC' ? 'ASC' : 'DESC';

    sql += ` ORDER BY ${safeSort} ${safeOrder} LIMIT ? OFFSET ?`;
    params.push(Number(limit), Number(offset));

    const [rows] = await pool.execute(sql, params);
    return rows;
  },

  /**
   * Count total products matching search & category filters
   */
  async count({ category_id, search } = {}) {
    let sql = 'SELECT COUNT(*) AS total FROM products p WHERE p.status = "active"';
    const params = [];

    if (category_id) {
      sql += ' AND p.category_id = ?';
      params.push(Number(category_id));
    }

    if (search) {
      sql += ' AND (p.name LIKE ? OR p.description LIKE ?)';
      const q = `%${search}%`;
      params.push(q, q);
    }

    const [rows] = await pool.execute(sql, params);
    return rows[0]?.total || 0;
  },

  /**
   * Find product by numeric ID or slug with all variants and images
   */
  async findByIdOrSlug(identifier) {
    const isNumeric = /^\d+$/.test(identifier);
    const whereClause = isNumeric ? 'p.id = ?' : 'p.slug = ?';

    const [productRows] = await pool.execute(
      `SELECT
         p.*,
         c.name AS category_name,
         c.slug AS category_slug
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE ${whereClause} AND p.status != 'archived'
       LIMIT 1`,
      [identifier]
    );

    if (productRows.length === 0) return null;
    const product = productRows[0];

    // Fetch all variants (sizes, colors, stock)
    const [variants] = await pool.execute(
      `SELECT * FROM product_variants WHERE product_id = ? AND is_active = 1`,
      [product.id]
    );

    // Fetch all gallery images
    const [images] = await pool.execute(
      `SELECT * FROM product_images WHERE product_id = ? ORDER BY is_primary DESC, sort_order ASC`,
      [product.id]
    );

    return {
      ...product,
      variants,
      images,
    };
  },

  async findById(id) {
    return this.findByIdOrSlug(id);
  },

  async findBySlug(slug) {
    return this.findByIdOrSlug(slug);
  },

  /**
   * Create a new product in the live database schema
   */
  async create(data) {
    const {
      category_id = 1,
      name,
      slug,
      short_description = null,
      description = null,
      material = null,
      care_instructions = null,
      status = 'active',
      is_featured = 0,
      created_by = null,
    } = data;

    const sql = `
      INSERT INTO products
        (category_id, name, slug, short_description, description, material, care_instructions, status, is_featured, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await pool.execute(sql, [
      category_id,
      name,
      slug,
      short_description,
      description,
      material,
      care_instructions,
      status,
      is_featured ? 1 : 0,
      created_by,
    ]);

    return result.insertId;
  },

  /**
   * Update product
   */
  async update(id, data) {
    const allowed = [
      'category_id',
      'name',
      'slug',
      'short_description',
      'description',
      'material',
      'care_instructions',
      'status',
      'is_featured',
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
   * Soft delete (archive product)
   */
  async delete(id) {
    const [result] = await pool.execute(
      "UPDATE products SET status = 'archived', updated_at = NOW() WHERE id = ?",
      [id]
    );
    return result.affectedRows > 0;
  },
};

module.exports = Product;
