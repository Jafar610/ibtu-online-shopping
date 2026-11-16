/**
 * IBTU E-Commerce Backend
 * src/routes/admin-coupon.routes.js
 *
 * Shop Owner / Admin Coupon Management Routes
 * Restricted to authenticated users with 'Admin' role.
 */

const express = require('express');
const router = express.Router();
const CouponController = require('../controllers/coupon.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/permission.middleware');
const {
  validateCreateCoupon,
  validateUpdateCoupon,
  validateCouponStatus,
} = require('../validators/coupon.validator');

// All admin coupon routes require Admin authentication
router.use(authenticate);
router.use(requireRole('Admin'));

// POST /api/admin/coupons (Create coupon)
router.post('/', validateCreateCoupon, CouponController.createCoupon);

// GET /api/admin/coupons (List all coupons with filters & pagination)
router.get('/', CouponController.getCoupons);

// GET /api/admin/coupons/:id (Get coupon details & usage statistics)
router.get('/:id', CouponController.getCouponById);

// PUT /api/admin/coupons/:id (Update coupon)
router.put('/:id', validateUpdateCoupon, CouponController.updateCoupon);

// PATCH /api/admin/coupons/:id/status (Activate or Deactivate coupon)
router.patch('/:id/status', validateCouponStatus, CouponController.setCouponStatus);

// DELETE /api/admin/coupons/:id (Delete coupon if no usages exist)
router.delete('/:id', CouponController.deleteCoupon);

// GET /api/admin/coupons/:id/usages (View coupon usage records)
router.get('/:id/usages', CouponController.getCouponUsages);

module.exports = router;
