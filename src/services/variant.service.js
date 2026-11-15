/**
 * variant.service.js
 * All database logic for Product Variant Management.
 *
 * Key design decisions:
 *  - stock_quantity is NEVER modified by normal variant updates (updateVariant).
 *  - Initial stock on creation is recorded as an inventory_movements row (opening_stock).
 *  - Reserved quantity is managed only through order-flow, never via this service directly.
 *  - All multi-step writes run inside transactions.
 *  - Soft-delete pattern: variants are deactivated, not deleted, when they have order history.
 */

const { pool } = require('../config/database');
const AppError = require('../utils/app-error');

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

/**
 * Build the standard variant response shape.
 * "available_quantity" = stock_quantity - reserved_quantity.
 * Internal inventory counters (reserved_quantity) are hidden from public callers.
 *
 * @param {object} row  - Raw DB row from product_variants (optionally joined with products)
 * @param {boolean} isAdmin - When true, include internal stock details
 */
function formatVariant(row, isAdmin = false) {
  const availableQty = Math.max(0, (row.stock_quantity || 0) - (row.reserved_quantity || 0));

  const result = {
    id: row.id,
    product_id: row.product_id,
    product_name: row.product_name || null,   // populated from JOIN when available
    sku: row.sku,
    size: row.size || null,
    color: row.color || null,
    price: parseFloat(row.price),
    sale_price: row.sale_price ? parseFloat(row.sale_price) : null,
    // effective_price: the price customers actually pay
    effective_price: row.sale_price ? parseFloat(row.sale_price) : parseFloat(row.price),
    available_quantity: availableQty,
    is_active: Boolean(row.is_active),
    low_stock_threshold: row.low_stock_threshold,
    is_low_stock: availableQty > 0 && availableQty <= row.low_stock_threshold,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };

  // Admin/staff: expose full inventory counters
  if (isAdmin) {
    result.stock_quantity = row.stock_quantity;
    result.reserved_quantity = row.reserved_quantity;
  }

  return result;
}

// ─────────────────────────────────────────────
// Service functions
// ─────────────────────────────────────────────

/**
 * getVariantsByProductId
 * Returns all variants for a product.
 * Public callers see only active variants of active products.
 * Admin/staff see all variants regardless of status.
 *
 * @param {number} productId
 * @param {object} options  - { isAdmin: boolean }
 */
async function getVariantsByProductId(productId, { isAdmin = false } = {}) {
  const conn = await pool.getConnection();
  try {
    // Confirm product exists
    const [[product]] = await conn.query(
      'SELECT id, name, status FROM products WHERE id = ?',
      [productId]
    );
    if (!product) throw AppError.notFound('Product not found');

    // Public users cannot browse variants of inactive products
    if (!isAdmin && product.status !== 'active') {
      throw AppError.notFound('Product not found');
    }

    let sql = `
      SELECT
        pv.*,
        p.name AS product_name
      FROM product_variants pv
      JOIN products p ON p.id = pv.product_id
      WHERE pv.product_id = ?
    `;
    const params = [productId];

    if (!isAdmin) {
      sql += ' AND pv.is_active = 1';
    }

    sql += ' ORDER BY pv.created_at ASC';

    const [variants] = await conn.query(sql, params);
    return {
      product: { id: product.id, name: product.name, status: product.status },
      variants: variants.map(v => formatVariant(v, isAdmin)),
    };
  } finally {
    conn.release();
  }
}

/**
 * getVariantById
 * Returns a single variant with its parent product info.
 * Public callers only see active variants of active products.
 *
 * @param {number} id
 * @param {object} options  - { isAdmin: boolean }
 */
async function getVariantById(id, { isAdmin = false } = {}) {
  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.query(
      `SELECT pv.*, p.name AS product_name, p.status AS product_status
       FROM product_variants pv
       JOIN products p ON p.id = pv.product_id
       WHERE pv.id = ?`,
      [id]
    );
    const row = rows[0];
    if (!row) throw AppError.notFound('Variant not found');

    // Public visibility rules
    if (!isAdmin) {
      if (!row.is_active || row.product_status !== 'active') {
        throw AppError.notFound('Variant not found');
      }
    }

    return formatVariant(row, isAdmin);
  } finally {
    conn.release();
  }
}

/**
 * createVariant
 * Inserts a new variant. If initial stock_quantity > 0, records an opening_stock
 * movement in inventory_movements — all inside a single transaction.
 *
 * @param {number} productId
 * @param {object} data  - Validated body fields
 * @param {number} userId - Authenticated user creating the variant
 */
async function createVariant(productId, data, userId) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // 1. Confirm product exists and is not archived
    const [[product]] = await conn.query(
      'SELECT id, name, status FROM products WHERE id = ?',
      [productId]
    );
    if (!product) throw AppError.notFound('Product not found');
    if (product.status === 'archived') {
      throw AppError.badRequest('Cannot add variants to an archived product');
    }

    // 2. Check SKU uniqueness globally
    const [[existingSku]] = await conn.query(
      'SELECT id FROM product_variants WHERE sku = ?',
      [data.sku]
    );
    if (existingSku) {
      throw AppError.conflict('A variant with this SKU already exists: ' + data.sku);
    }

    // 3. Validate sale_price < price (belt-and-suspenders beyond validator)
    if (data.sale_price != null && data.sale_price >= data.price) {
      throw AppError.badRequest('Sale price must be less than the regular price');
    }

    // 4. Determine initial stock (defaults to 0)
    const initialStock = data.stock_quantity != null ? data.stock_quantity : 0;

    // 5. Insert variant (stock_quantity = initialStock, reserved_quantity = 0)
    const [insertResult] = await conn.query(
      `INSERT INTO product_variants
         (product_id, sku, size, color, price, sale_price,
          stock_quantity, reserved_quantity, low_stock_threshold, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?, ?)`,
      [
        productId,
        data.sku,
        data.size || null,
        data.color || null,
        data.price,
        data.sale_price || null,
        initialStock,
        data.low_stock_threshold != null ? data.low_stock_threshold : 5,
        data.is_active != null ? (data.is_active ? 1 : 0) : 1,
      ]
    );
    const variantId = insertResult.insertId;

    // 6. If opening stock > 0 → record inventory movement
    if (initialStock > 0) {
      await conn.query(
        `INSERT INTO inventory_movements
           (variant_id, user_id, movement_type, quantity, quantity_before, quantity_after,
            reference_type, reason)
         VALUES (?, ?, 'opening_stock', ?, 0, ?, 'variant_create', ?)`,
        [
          variantId,
          userId,
          initialStock,
          initialStock,
          'Opening stock recorded on variant creation',
        ]
      );
    }

    await conn.commit();

    // 7. Fetch and return the full variant record
    const [[created]] = await conn.query(
      `SELECT pv.*, p.name AS product_name
       FROM product_variants pv
       JOIN products p ON p.id = pv.product_id
       WHERE pv.id = ?`,
      [variantId]
    );
    return formatVariant(created, true);
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

/**
 * updateVariant
 * Updates non-stock fields of a variant.
 * stock_quantity and reserved_quantity are NEVER touched here.
 *
 * @param {number} id
 * @param {object} data  - Validated update fields
 */
async function updateVariant(id, data) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // 1. Confirm variant exists
    const [[existing]] = await conn.query(
      'SELECT id, sku, price FROM product_variants WHERE id = ?',
      [id]
    );
    if (!existing) throw AppError.notFound('Variant not found');

    // 2. If SKU is changing, check uniqueness
    if (data.sku && data.sku !== existing.sku) {
      const [[dupSku]] = await conn.query(
        'SELECT id FROM product_variants WHERE sku = ? AND id != ?',
        [data.sku, id]
      );
      if (dupSku) throw AppError.conflict('A variant with this SKU already exists: ' + data.sku);
    }

    // 3. Validate sale_price vs effective price
    const effectivePrice = data.price != null ? data.price : parseFloat(existing.price);
    if (data.sale_price != null && data.sale_price >= effectivePrice) {
      throw AppError.badRequest('Sale price must be less than the regular price');
    }

    // 4. Build dynamic SET clause (only update provided fields)
    const allowed = ['sku', 'size', 'color', 'price', 'sale_price', 'low_stock_threshold', 'is_active'];
    const setClauses = [];
    const values = [];

    for (const field of allowed) {
      if (data[field] !== undefined) {
        // Handle explicit null for sale_price
        if (field === 'sale_price' && data[field] === null) {
          setClauses.push('sale_price = NULL');
        } else {
          setClauses.push(`${field} = ?`);
          values.push(field === 'is_active' ? (data[field] ? 1 : 0) : data[field]);
        }
      }
    }

    if (setClauses.length === 0) {
      throw AppError.badRequest('No valid fields provided for update');
    }

    values.push(id);
    await conn.query(
      `UPDATE product_variants SET ${setClauses.join(', ')} WHERE id = ?`,
      values
    );

    await conn.commit();

    // 5. Return updated record
    const [[updated]] = await conn.query(
      `SELECT pv.*, p.name AS product_name
       FROM product_variants pv
       JOIN products p ON p.id = pv.product_id
       WHERE pv.id = ?`,
      [id]
    );
    return formatVariant(updated, true);
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

/**
 * activateVariant
 * Sets is_active = 1 on a variant.
 *
 * @param {number} id
 */
async function activateVariant(id) {
  const conn = await pool.getConnection();
  try {
    const [[existing]] = await conn.query(
      'SELECT id, is_active FROM product_variants WHERE id = ?',
      [id]
    );
    if (!existing) throw AppError.notFound('Variant not found');
    if (existing.is_active) throw AppError.badRequest('Variant is already active');

    await conn.query('UPDATE product_variants SET is_active = 1 WHERE id = ?', [id]);

    const [[updated]] = await conn.query(
      `SELECT pv.*, p.name AS product_name
       FROM product_variants pv
       JOIN products p ON p.id = pv.product_id
       WHERE pv.id = ?`,
      [id]
    );
    return formatVariant(updated, true);
  } finally {
    conn.release();
  }
}

/**
 * deactivateVariant
 * Sets is_active = 0 on a variant.
 * Does NOT delete — preserves order history.
 *
 * @param {number} id
 */
async function deactivateVariant(id) {
  const conn = await pool.getConnection();
  try {
    const [[existing]] = await conn.query(
      'SELECT id, is_active FROM product_variants WHERE id = ?',
      [id]
    );
    if (!existing) throw AppError.notFound('Variant not found');
    if (!existing.is_active) throw AppError.badRequest('Variant is already inactive');

    await conn.query('UPDATE product_variants SET is_active = 0 WHERE id = ?', [id]);

    const [[updated]] = await conn.query(
      `SELECT pv.*, p.name AS product_name
       FROM product_variants pv
       JOIN products p ON p.id = pv.product_id
       WHERE pv.id = ?`,
      [id]
    );
    return formatVariant(updated, true);
  } finally {
    conn.release();
  }
}

module.exports = {
  getVariantsByProductId,
  getVariantById,
  createVariant,
  updateVariant,
  activateVariant,
  deactivateVariant,
};
