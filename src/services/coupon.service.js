/**
 * IBTU E-Commerce Backend
 * src/services/coupon.service.js
 *
 * Coupon Business Logic & Validation Engine
 *
 * Features:
 *  - Secure admin CRUD operations for coupons.
 *  - Real-time customer cart coupon eligibility checks.
 *  - Strict validation of start/expiry dates, global usage limits, and per-customer limits.
 *  - Precise discount calculation (percentage with cap, fixed with subtotal bounding).
 *  - Foreign-key protected deletion (deactivate instead of deleting used coupons).
 *  - Concurrency safe with row-level locks for checkout operations.
 */

const { pool } = require('../config/database');
const AppError = require('../utils/app-error');

class CouponService {
  /**
   * Calculate discount amount from eligible subtotal
   */
  static calculateDiscount(coupon, subtotal) {
    const numSubtotal = parseFloat(subtotal) || 0;
    const minOrder = parseFloat(coupon.minimum_order_amount) || 0;

    if (numSubtotal < minOrder || numSubtotal <= 0) {
      return 0.0;
    }

    let discount = 0.0;
    const discountVal = parseFloat(coupon.discount_value);

    if (coupon.discount_type === 'percentage') {
      discount = (numSubtotal * discountVal) / 100.0;
      if (coupon.maximum_discount_amount !== null && coupon.maximum_discount_amount !== undefined) {
        const maxDiscount = parseFloat(coupon.maximum_discount_amount);
        if (discount > maxDiscount) {
          discount = maxDiscount;
        }
      }
    } else if (coupon.discount_type === 'fixed') {
      discount = discountVal;
    }

    // Never allow negative discount and never exceed subtotal
    discount = Math.max(0, Math.min(discount, numSubtotal));

    return Math.round(discount * 100) / 100;
  }

  /**
   * Validate coupon eligibility for an order subtotal
   */
  static async validateCouponForSubtotal({ code, userId, subtotal, conn = null }) {
    if (!code || typeof code !== 'string') {
      throw AppError.badRequest('Coupon code is required.');
    }

    const normalizedCode = code.trim().toUpperCase();
    const db = conn || pool;

    const lockClause = conn ? 'FOR UPDATE' : '';
    const [[coupon]] = await db.query(
      `SELECT * FROM coupons WHERE code = ? ${lockClause}`,
      [normalizedCode]
    );

    if (!coupon) {
      throw AppError.notFound(`Coupon code "${normalizedCode}" does not exist.`);
    }

    // 1. Active status check
    if (!coupon.is_active) {
      throw AppError.badRequest(`Coupon "${normalizedCode}" is currently inactive.`);
    }

    const now = new Date();

    // 2. Start date check
    if (coupon.starts_at && now < new Date(coupon.starts_at)) {
      throw AppError.badRequest(`Coupon "${normalizedCode}" is not active yet.`);
    }

    // 3. Expiry date check
    if (coupon.expires_at && now > new Date(coupon.expires_at)) {
      throw AppError.badRequest(`Coupon "${normalizedCode}" has expired.`);
    }

    // 4. Global usage limit check
    if (coupon.usage_limit !== null && coupon.usage_count >= coupon.usage_limit) {
      throw AppError.badRequest(
        `Coupon "${normalizedCode}" has reached its maximum global usage limit.`
      );
    }

    // 5. Minimum order amount check
    const numSubtotal = parseFloat(subtotal) || 0;
    const minOrder = parseFloat(coupon.minimum_order_amount) || 0;
    if (numSubtotal < minOrder) {
      throw AppError.badRequest(
        `Order subtotal of ${numSubtotal} ETB is below the minimum required amount of ${minOrder} ETB for this coupon.`
      );
    }

    // 6. Per-customer usage limit check
    if (userId && coupon.usage_limit_per_customer !== null) {
      const [[usageRecord]] = await db.query(
        `SELECT COUNT(*) AS userCount
         FROM coupon_usages
         WHERE coupon_id = ? AND user_id = ? AND usage_status != 'cancelled'`,
        [coupon.id, userId]
      );

      const userCount = usageRecord ? usageRecord.userCount : 0;
      if (userCount >= coupon.usage_limit_per_customer) {
        throw AppError.badRequest(
          `You have already reached the maximum usage limit (${coupon.usage_limit_per_customer}) for coupon "${normalizedCode}".`
        );
      }
    }

    // 7. Calculate discount
    const discountAmount = this.calculateDiscount(coupon, numSubtotal);
    const totalAfterDiscount = Math.round((numSubtotal - discountAmount) * 100) / 100;

    return {
      valid: true,
      coupon_id: coupon.id,
      coupon_code: coupon.code,
      discount_type: coupon.discount_type,
      discount_value: parseFloat(coupon.discount_value),
      minimum_order_amount: minOrder,
      maximum_discount_amount:
        coupon.maximum_discount_amount !== null
          ? parseFloat(coupon.maximum_discount_amount)
          : null,
      subtotal: numSubtotal,
      discount_amount: discountAmount,
      total_after_discount: totalAfterDiscount,
      currency: 'ETB',
    };
  }

  /**
   * Shop Owner / Admin: Create Coupon
   */
  static async createCoupon(adminId, data) {
    const code = data.code.trim().toUpperCase();

    // Check for duplicate code
    const [[existing]] = await pool.query('SELECT id FROM coupons WHERE code = ?', [code]);
    if (existing) {
      throw AppError.conflict(`A coupon with code "${code}" already exists.`);
    }

    const discountType = data.discount_type;
    const discountValue = parseFloat(data.discount_value);
    const minOrder = data.minimum_order_amount !== undefined ? parseFloat(data.minimum_order_amount) : 0.0;
    const maxDiscount = data.maximum_discount_amount !== undefined && data.maximum_discount_amount !== null
      ? parseFloat(data.maximum_discount_amount)
      : null;
    const usageLimit = data.usage_limit !== undefined && data.usage_limit !== null
      ? parseInt(data.usage_limit, 10)
      : null;
    const usageLimitPerCust = data.usage_limit_per_customer !== undefined && data.usage_limit_per_customer !== null
      ? parseInt(data.usage_limit_per_customer, 10)
      : null;
    const startsAt = data.starts_at || null;
    const expiresAt = data.expires_at || null;
    const isActive = data.is_active !== undefined ? (Boolean(data.is_active) ? 1 : 0) : 1;
    const description = data.description ? data.description.trim() : null;

    const [result] = await pool.query(
      `INSERT INTO coupons (
         code,
         description,
         discount_type,
         discount_value,
         minimum_order_amount,
         maximum_discount_amount,
         usage_limit,
         usage_limit_per_customer,
         starts_at,
         expires_at,
         is_active,
         created_by
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        code,
        description,
        discountType,
        discountValue,
        minOrder,
        maxDiscount,
        usageLimit,
        usageLimitPerCust,
        startsAt,
        expiresAt,
        isActive,
        adminId,
      ]
    );

    return this.getCouponById(result.insertId);
  }

  /**
   * Shop Owner / Admin: Get all coupons with filtering & pagination
   */
  static async getCoupons({
    search,
    is_active,
    discount_type,
    page = 1,
    limit = 10,
    sort_by = 'created_at',
    sort_order = 'DESC',
  } = {}) {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
    const offset = (pageNum - 1) * limitNum;

    const sortWhitelist = [
      'id',
      'code',
      'discount_type',
      'discount_value',
      'usage_count',
      'starts_at',
      'expires_at',
      'created_at',
    ];
    const safeSortBy = sortWhitelist.includes(sort_by) ? sort_by : 'created_at';
    const safeOrder = sort_order && sort_order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const conditions = [];
    const params = [];

    if (search) {
      conditions.push('(c.code LIKE ? OR c.description LIKE ?)');
      params.push(`%${search.trim()}%`, `%${search.trim()}%`);
    }

    if (is_active !== undefined && is_active !== null && is_active !== '') {
      const activeBool = is_active === true || is_active === 'true' || is_active === 1 || is_active === '1';
      conditions.push('c.is_active = ?');
      params.push(activeBool ? 1 : 0);
    }

    if (discount_type && ['percentage', 'fixed'].includes(discount_type)) {
      conditions.push('c.discount_type = ?');
      params.push(discount_type);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Total count
    const [[countRow]] = await pool.query(
      `SELECT COUNT(*) AS total FROM coupons c ${whereClause}`,
      params
    );
    const total = countRow.total;

    // Fetch coupons
    const [rows] = await pool.query(
      `SELECT
         c.*,
         u.first_name AS creator_first_name,
         u.last_name AS creator_last_name
       FROM coupons c
       LEFT JOIN users u ON c.created_by = u.id
       ${whereClause}
       ORDER BY c.${safeSortBy} ${safeOrder}
       LIMIT ? OFFSET ?`,
      [...params, limitNum, offset]
    );

    const formatted = rows.map((c) => ({
      id: c.id,
      code: c.code,
      description: c.description,
      discount_type: c.discount_type,
      discount_value: parseFloat(c.discount_value),
      minimum_order_amount: parseFloat(c.minimum_order_amount),
      maximum_discount_amount:
        c.maximum_discount_amount !== null ? parseFloat(c.maximum_discount_amount) : null,
      usage_limit: c.usage_limit,
      usage_count: c.usage_count,
      usage_limit_per_customer: c.usage_limit_per_customer,
      starts_at: c.starts_at,
      expires_at: c.expires_at,
      is_active: Boolean(c.is_active),
      created_by: c.created_by,
      creator_name: c.creator_first_name
        ? `${c.creator_first_name} ${c.creator_last_name || ''}`.trim()
        : null,
      created_at: c.created_at,
      updated_at: c.updated_at,
    }));

    return {
      coupons: formatted,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        total_pages: Math.ceil(total / limitNum),
      },
    };
  }

  /**
   * Shop Owner / Admin: Get Coupon Details
   */
  static async getCouponById(couponId) {
    const [[c]] = await pool.query(
      `SELECT
         c.*,
         u.first_name AS creator_first_name,
         u.last_name AS creator_last_name
       FROM coupons c
       LEFT JOIN users u ON c.created_by = u.id
       WHERE c.id = ?`,
      [couponId]
    );

    if (!c) {
      throw AppError.notFound('Coupon not found.');
    }

    // Usage statistics
    const [[stats]] = await pool.query(
      `SELECT
         COUNT(*) AS total_usages,
         SUM(CASE WHEN usage_status = 'applied' THEN 1 ELSE 0 END) AS applied_usages,
         SUM(CASE WHEN usage_status = 'reserved' THEN 1 ELSE 0 END) AS reserved_usages,
         SUM(CASE WHEN usage_status = 'cancelled' THEN 1 ELSE 0 END) AS cancelled_usages,
         COALESCE(SUM(CASE WHEN usage_status = 'applied' THEN discount_amount ELSE 0 END), 0) AS total_discount_given
       FROM coupon_usages
       WHERE coupon_id = ?`,
      [couponId]
    );

    return {
      id: c.id,
      code: c.code,
      description: c.description,
      discount_type: c.discount_type,
      discount_value: parseFloat(c.discount_value),
      minimum_order_amount: parseFloat(c.minimum_order_amount),
      maximum_discount_amount:
        c.maximum_discount_amount !== null ? parseFloat(c.maximum_discount_amount) : null,
      usage_limit: c.usage_limit,
      usage_count: c.usage_count,
      usage_limit_per_customer: c.usage_limit_per_customer,
      starts_at: c.starts_at,
      expires_at: c.expires_at,
      is_active: Boolean(c.is_active),
      created_by: c.created_by,
      creator_name: c.creator_first_name
        ? `${c.creator_first_name} ${c.creator_last_name || ''}`.trim()
        : null,
      stats: {
        total_usages: parseInt(stats.total_usages, 10) || 0,
        applied_usages: parseInt(stats.applied_usages, 10) || 0,
        reserved_usages: parseInt(stats.reserved_usages, 10) || 0,
        cancelled_usages: parseInt(stats.cancelled_usages, 10) || 0,
        total_discount_given: parseFloat(stats.total_discount_given) || 0.0,
      },
      created_at: c.created_at,
      updated_at: c.updated_at,
    };
  }

  /**
   * Shop Owner / Admin: Update Coupon
   */
  static async updateCoupon(couponId, data) {
    const [[coupon]] = await pool.query('SELECT * FROM coupons WHERE id = ?', [couponId]);
    if (!coupon) {
      throw AppError.notFound('Coupon not found.');
    }

    let code = coupon.code;
    if (data.code && data.code.trim().toUpperCase() !== coupon.code) {
      code = data.code.trim().toUpperCase();
      const [[duplicate]] = await pool.query(
        'SELECT id FROM coupons WHERE code = ? AND id != ?',
        [code, couponId]
      );
      if (duplicate) {
        throw AppError.conflict(`A coupon with code "${code}" already exists.`);
      }
    }

    const description =
      data.description !== undefined ? data.description : coupon.description;
    const discountType = data.discount_type || coupon.discount_type;
    const discountValue =
      data.discount_value !== undefined ? parseFloat(data.discount_value) : coupon.discount_value;
    const minOrder =
      data.minimum_order_amount !== undefined
        ? parseFloat(data.minimum_order_amount)
        : coupon.minimum_order_amount;
    const maxDiscount =
      data.maximum_discount_amount !== undefined
        ? (data.maximum_discount_amount !== null ? parseFloat(data.maximum_discount_amount) : null)
        : coupon.maximum_discount_amount;
    const usageLimit =
      data.usage_limit !== undefined
        ? (data.usage_limit !== null ? parseInt(data.usage_limit, 10) : null)
        : coupon.usage_limit;
    const usageLimitPerCust =
      data.usage_limit_per_customer !== undefined
        ? (data.usage_limit_per_customer !== null
            ? parseInt(data.usage_limit_per_customer, 10)
            : null)
        : coupon.usage_limit_per_customer;
    const startsAt = data.starts_at !== undefined ? data.starts_at : coupon.starts_at;
    const expiresAt = data.expires_at !== undefined ? data.expires_at : coupon.expires_at;
    const isActive =
      data.is_active !== undefined
        ? (Boolean(data.is_active) ? 1 : 0)
        : coupon.is_active;

    await pool.query(
      `UPDATE coupons
       SET code = ?,
           description = ?,
           discount_type = ?,
           discount_value = ?,
           minimum_order_amount = ?,
           maximum_discount_amount = ?,
           usage_limit = ?,
           usage_limit_per_customer = ?,
           starts_at = ?,
           expires_at = ?,
           is_active = ?,
           updated_at = NOW()
       WHERE id = ?`,
      [
        code,
        description,
        discountType,
        discountValue,
        minOrder,
        maxDiscount,
        usageLimit,
        usageLimitPerCust,
        startsAt,
        expiresAt,
        isActive,
        couponId,
      ]
    );

    return this.getCouponById(couponId);
  }

  /**
   * Shop Owner / Admin: Activate or Deactivate Coupon
   */
  static async setCouponStatus(couponId, isActive) {
    const [[coupon]] = await pool.query('SELECT id FROM coupons WHERE id = ?', [couponId]);
    if (!coupon) {
      throw AppError.notFound('Coupon not found.');
    }

    const activeFlag = Boolean(isActive) ? 1 : 0;
    await pool.query('UPDATE coupons SET is_active = ?, updated_at = NOW() WHERE id = ?', [
      activeFlag,
      couponId,
    ]);

    return {
      id: couponId,
      is_active: Boolean(activeFlag),
      message: `Coupon has been ${activeFlag ? 'activated' : 'deactivated'} successfully.`,
    };
  }

  /**
   * Shop Owner / Admin: Delete Coupon
   * Rejects deletion if coupon has historical usage records to maintain audit history
   */
  static async deleteCoupon(couponId) {
    const [[coupon]] = await pool.query('SELECT * FROM coupons WHERE id = ?', [couponId]);
    if (!coupon) {
      throw AppError.notFound('Coupon not found.');
    }

    // Inspect usage history
    const [[usageCheck]] = await pool.query(
      'SELECT COUNT(*) AS usageCount FROM coupon_usages WHERE coupon_id = ?',
      [couponId]
    );

    if (usageCheck && usageCheck.usageCount > 0) {
      throw AppError.badRequest(
        `Cannot delete coupon "${coupon.code}" because it has ${usageCheck.usageCount} historical usage record(s). Please deactivate it instead.`
      );
    }

    await pool.query('DELETE FROM coupons WHERE id = ?', [couponId]);

    return {
      id: couponId,
      code: coupon.code,
      message: `Coupon "${coupon.code}" deleted successfully.`,
    };
  }

  /**
   * Shop Owner / Admin: Retrieve Usage Records for a Coupon
   */
  static async getCouponUsages(couponId, { page = 1, limit = 20 } = {}) {
    const [[coupon]] = await pool.query('SELECT id, code FROM coupons WHERE id = ?', [couponId]);
    if (!coupon) {
      throw AppError.notFound('Coupon not found.');
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const offset = (pageNum - 1) * limitNum;

    const [[countRow]] = await pool.query(
      'SELECT COUNT(*) AS total FROM coupon_usages WHERE coupon_id = ?',
      [couponId]
    );
    const total = countRow.total;

    const [rows] = await pool.query(
      `SELECT
         cu.id AS usage_id,
         cu.coupon_id,
         cu.order_id,
         cu.user_id,
         cu.discount_amount,
         cu.usage_status,
         cu.used_at,
         cu.created_at,
         o.order_number,
         o.total_amount AS order_total,
         o.payment_status AS order_payment_status,
         o.order_status,
         u.first_name,
         u.last_name,
         u.email,
         u.phone
       FROM coupon_usages cu
       JOIN orders o ON cu.order_id = o.id
       LEFT JOIN users u ON cu.user_id = u.id
       WHERE cu.coupon_id = ?
       ORDER BY cu.created_at DESC
       LIMIT ? OFFSET ?`,
      [couponId, limitNum, offset]
    );

    const formatted = rows.map((r) => ({
      usage_id: r.usage_id,
      coupon_code: coupon.code,
      order_id: r.order_id,
      order_number: r.order_number,
      order_total: parseFloat(r.order_total),
      order_status: r.order_status,
      order_payment_status: r.order_payment_status,
      discount_amount: parseFloat(r.discount_amount),
      usage_status: r.usage_status,
      used_at: r.used_at,
      customer: r.user_id
        ? {
            id: r.user_id,
            name: `${r.first_name || ''} ${r.last_name || ''}`.trim(),
            email: r.email,
            phone: r.phone,
          }
        : null,
    }));

    return {
      coupon: {
        id: coupon.id,
        code: coupon.code,
      },
      usages: formatted,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        total_pages: Math.ceil(total / limitNum),
      },
    };
  }
}

module.exports = CouponService;
