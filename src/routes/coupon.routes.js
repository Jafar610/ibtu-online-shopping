/**
 * IBTU E-Commerce Backend
 * src/routes/coupon.routes.js
 *
 * Public & Customer Coupon Routes
 */

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const CouponController = require('../controllers/coupon.controller');
const { validateCouponCode } = require('../validators/coupon.validator');
const { pool } = require('../config/database');

/**
 * Optional authentication middleware for coupon validation:
 * Extracts user if valid token is provided, without blocking guest requests.
 */
const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.user = null;
    return next();
  }

  const token = authHeader.split(' ')[1];
  try {
    const secret = process.env.JWT_SECRET || 'ibtu_default_secure_secret_key';
    const decoded = jwt.verify(token, secret);
    const [userRows] = await pool.execute(
      'SELECT id, email, is_active FROM users WHERE id = ? LIMIT 1',
      [decoded.id]
    );

    if (userRows.length > 0 && userRows[0].is_active) {
      req.user = {
        id: userRows[0].id,
        email: userRows[0].email,
      };
    } else {
      req.user = null;
    }
  } catch {
    req.user = null;
  }
  next();
};

// POST /api/coupons/validate (Validate coupon eligibility for current cart)
router.post('/validate', optionalAuth, validateCouponCode, CouponController.validateCoupon);

module.exports = router;
