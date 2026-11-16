/**
 * IBTU E-Commerce Backend
 * src/services/product.service.js
 *
 * Product Business Logic Service
 * Enforces catalog isolation, safe slug generation, category validation,
 * status transitions, and dependency protection.
 */

const { pool } = require('../config/database');
const AppError = require('../utils/app-error');
const slugify = require('../utils/slugify');

class ProductService {
  /**
   * List products with filtering, search, and pagination
   * @param {object} options
   */
  static async getAllProducts({
    search,
    category_id,
    status,
    is_featured,
    sort = 'created_at',
    order = 'DESC',
    page = 1,
    limit = 12,
    isStaff = false, // true if user is Admin or Data Encoder
  } = {}) {
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const offset = (pageNum - 1) * limitNum;

    let baseSql = `
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN product_variants pv ON pv.product_id = p.id AND pv.is_active = 1
      WHERE 1=1
    `;
    const params = [];

    // Catalog visibility: Public/customers can ONLY see 'active' products
    if (!isStaff) {
      baseSql += ' AND p.status = "active"';
    } else if (status) {
      baseSql += ' AND p.status = ?';
      params.push(status);
    }

    // Category filter (includes exact category or children)
    if (category_id) {
      baseSql += ' AND (p.category_id = ? OR c.parent_id = ?)';
      params.push(Number(category_id), Number(category_id));
    }

    // Featured filter
    if (is_featured !== undefined) {
      const featVal = is_featured === 'true' || is_featured === '1' || is_featured === true ? 1 : 0;
      baseSql += ' AND p.is_featured = ?';
      params.push(featVal);
    }

    // Search query
    if (search) {
      baseSql += ' AND (p.name LIKE ? OR p.short_description LIKE ? OR p.description LIKE ?)';
      const q = `%${search}%`;
      params.push(q, q, q);
    }

    // Total distinct products count
    const [countRows] = await pool.execute(
      `SELECT COUNT(DISTINCT p.id) AS total ${baseSql}`,
      params
    );
    const total = countRows[0]?.total || 0;

    // Sorting
    const allowedSort = ['created_at', 'name', 'status'];
    const safeSort = allowedSort.includes(sort) ? `p.${sort}` : 'p.created_at';
    const safeOrder = order && order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    // Select query
    const selectSql = `
      SELECT
        p.id,
        p.category_id,
        p.name,
        p.slug,
        p.short_description,
        p.material,
        p.status,
        p.is_featured,
        p.created_at,
        p.updated_at,
        c.name AS category_name,
        c.slug AS category_slug,
        COALESCE(MIN(pv.price), 0) AS price,
        COALESCE(MIN(pv.sale_price), NULL) AS sale_price,
        COALESCE(SUM(pv.stock_quantity), 0) AS total_stock,
        (
          SELECT pi.image_url
          FROM product_images pi
          WHERE pi.product_id = p.id
          ORDER BY pi.is_primary DESC, pi.sort_order ASC
          LIMIT 1
        ) AS primary_image
      ${baseSql}
      GROUP BY p.id
      ORDER BY ${safeSort} ${safeOrder}
      LIMIT ? OFFSET ?
    `;

    const [rows] = await pool.execute(selectSql, [...params, limitNum, offset]);

    return {
      products: rows.map((p) => ({
        ...p,
        is_featured: Boolean(p.is_featured),
        price: Number(p.price) || 0,
        sale_price: p.sale_price ? Number(p.sale_price) : null,
        total_stock: Number(p.total_stock) || 0,
      })),
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
    };
  }

  /**
   * Get single product details by ID or Slug with variants, sizes, colors, and gallery images
   */
  static async getProductById(identifier, isStaff = false) {
    const isNumeric = /^\d+$/.test(identifier);
    const whereClause = isNumeric ? 'p.id = ?' : 'p.slug = ?';

    const [rows] = await pool.execute(
      `SELECT
         p.*,
         c.name AS category_name,
         c.slug AS category_slug,
         u.first_name AS creator_first_name,
         u.last_name AS creator_last_name
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       LEFT JOIN users u ON p.created_by = u.id
       WHERE ${whereClause}
       LIMIT 1`,
      [identifier]
    );

    if (rows.length === 0) {
      throw new AppError('Product not found.', 404);
    }

    const product = rows[0];

    // Public cannot view draft or archived products
    if (!isStaff && product.status !== 'active') {
      throw new AppError('Product not found.', 404);
    }

    // Fetch variants
    const [variants] = await pool.execute(
      `SELECT id, sku, size, color, price, sale_price, stock_quantity, reserved_quantity, low_stock_threshold, is_active
       FROM product_variants
       WHERE product_id = ? AND is_active = 1
       ORDER BY id ASC`,
      [product.id]
    );

    // Fetch images
    const [images] = await pool.execute(
      `SELECT id, variant_id, image_url, alt_text, is_primary, sort_order
       FROM product_images
       WHERE product_id = ?
       ORDER BY is_primary DESC, sort_order ASC`,
      [product.id]
    );

    // Extract available sizes & colors
    const sizes = [...new Set(variants.map((v) => v.size).filter(Boolean))];
    const colors = [...new Set(variants.map((v) => v.color).filter(Boolean))];

    return {
      ...product,
      is_featured: Boolean(product.is_featured),
      sizes,
      colors,
      variants,
      images,
    };
  }

  /**
   * Create a new product
   */
  static async createProduct(data, userId) {
    const {
      name,
      slug: customSlug,
      category_id,
      short_description = null,
      description = null,
      material = null,
      care_instructions = null,
      status = 'draft',
      is_featured = 0,
    } = data;

    // 1. Validate category existence
    const [catRows] = await pool.execute('SELECT id FROM categories WHERE id = ? LIMIT 1', [category_id]);
    if (catRows.length === 0) {
      throw new AppError(`Category with ID ${category_id} does not exist.`, 400, [
        { field: 'category_id', message: 'Selected category does not exist.' },
      ]);
    }

    // 2. Generate slug and verify uniqueness
    const finalSlug = customSlug ? slugify(customSlug) : slugify(name);
    if (!finalSlug) {
      throw new AppError('Could not generate a valid URL slug for this product.', 422);
    }

    const [existingSlug] = await pool.execute('SELECT id FROM products WHERE slug = ? LIMIT 1', [finalSlug]);
    if (existingSlug.length > 0) {
      throw new AppError(`A product with the slug "${finalSlug}" already exists.`, 409, [
        { field: 'slug', message: 'Product slug must be unique.' },
      ]);
    }

    // 3. Insert product
    const [result] = await pool.execute(
      `INSERT INTO products
        (category_id, name, slug, short_description, description, material, care_instructions, status, is_featured, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        category_id,
        name.trim(),
        finalSlug,
        short_description ? short_description.trim() : null,
        description ? description.trim() : null,
        material ? material.trim() : null,
        care_instructions ? care_instructions.trim() : null,
        status,
        is_featured ? 1 : 0,
        userId || null,
      ]
    );

    return ProductService.getProductById(result.insertId, true);
  }

  /**
   * Update product details
   */
  static async updateProduct(id, data) {
    const productId = Number(id);

    // 1. Verify product exists
    const [existingRows] = await pool.execute('SELECT * FROM products WHERE id = ? LIMIT 1', [productId]);
    if (existingRows.length === 0) {
      throw new AppError('Product not found.', 404);
    }
    const current = existingRows[0];

    // 2. Validate category if changed
    if (data.category_id !== undefined && Number(data.category_id) !== current.category_id) {
      const [catRows] = await pool.execute('SELECT id FROM categories WHERE id = ? LIMIT 1', [data.category_id]);
      if (catRows.length === 0) {
        throw new AppError(`Category with ID ${data.category_id} does not exist.`, 400, [
          { field: 'category_id', message: 'Selected category does not exist.' },
        ]);
      }
    }

    // 3. Validate slug if changed
    let finalSlug = current.slug;
    if (data.slug) {
      finalSlug = slugify(data.slug);
      const [slugConflict] = await pool.execute(
        'SELECT id FROM products WHERE slug = ? AND id != ? LIMIT 1',
        [finalSlug, productId]
      );
      if (slugConflict.length > 0) {
        throw new AppError(`A product with the slug "${finalSlug}" already exists.`, 409, [
          { field: 'slug', message: 'Product slug must be unique.' },
        ]);
      }
    }

    // 4. Update fields
    const updates = [];
    const values = [];

    if (data.category_id !== undefined) { updates.push('category_id = ?'); values.push(Number(data.category_id)); }
    if (data.name !== undefined) { updates.push('name = ?'); values.push(data.name.trim()); }
    if (data.slug !== undefined) { updates.push('slug = ?'); values.push(finalSlug); }
    if (data.short_description !== undefined) { updates.push('short_description = ?'); values.push(data.short_description ? data.short_description.trim() : null); }
    if (data.description !== undefined) { updates.push('description = ?'); values.push(data.description ? data.description.trim() : null); }
    if (data.material !== undefined) { updates.push('material = ?'); values.push(data.material ? data.material.trim() : null); }
    if (data.care_instructions !== undefined) { updates.push('care_instructions = ?'); values.push(data.care_instructions ? data.care_instructions.trim() : null); }
    if (data.status !== undefined) { updates.push('status = ?'); values.push(data.status); }
    if (data.is_featured !== undefined) { updates.push('is_featured = ?'); values.push(data.is_featured ? 1 : 0); }

    if (updates.length > 0) {
      values.push(productId);
      await pool.execute(
        `UPDATE products SET ${updates.join(', ')}, updated_at = NOW() WHERE id = ?`,
        values
      );
    }

    return ProductService.getProductById(productId, true);
  }

  /**
   * Change product status (draft, active, archived)
   */
  static async updateStatus(id, status) {
    const productId = Number(id);

    const [existing] = await pool.execute('SELECT id FROM products WHERE id = ? LIMIT 1', [productId]);
    if (existing.length === 0) {
      throw new AppError('Product not found.', 404);
    }

    await pool.execute('UPDATE products SET status = ?, updated_at = NOW() WHERE id = ?', [status, productId]);

    return ProductService.getProductById(productId, true);
  }

  /**
   * Delete product safely or archive if historical records exist
   */
  static async deleteProduct(id) {
    const productId = Number(id);

    // 1. Verify product exists
    const [existing] = await pool.execute('SELECT id, name FROM products WHERE id = ? LIMIT 1', [productId]);
    if (existing.length === 0) {
      throw new AppError('Product not found.', 404);
    }
    const product = existing[0];

    // 2. Check for dependent order items
    const [orderRows] = await pool.execute(
      'SELECT COUNT(*) AS order_count FROM order_items WHERE product_id = ?',
      [productId]
    );
    if (orderRows[0]?.order_count > 0) {
      throw new AppError(
        `Cannot permanently delete product "${product.name}" because it is referenced in ${orderRows[0].order_count} historical orders. Please archive the product instead.`,
        400
      );
    }

    // 3. Check for inventory movements
    const [movementRows] = await pool.execute(
      `SELECT COUNT(*) AS move_count
       FROM inventory_movements im
       JOIN product_variants pv ON im.variant_id = pv.id
       WHERE pv.product_id = ?`,
      [productId]
    );
    if (movementRows[0]?.move_count > 0) {
      throw new AppError(
        `Cannot permanently delete product "${product.name}" because it has ${movementRows[0].move_count} audit/inventory movement logs. Please archive the product instead.`,
        400
      );
    }

    // 4. Safe delete: Remove dependent images, variants, then product inside a transaction
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      await connection.execute('DELETE FROM product_images WHERE product_id = ?', [productId]);
      await connection.execute('DELETE FROM product_variants WHERE product_id = ?', [productId]);
      await connection.execute('DELETE FROM products WHERE id = ?', [productId]);

      await connection.commit();
      return { id: productId, name: product.name };
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  }
}

module.exports = ProductService;
