/**
 * IBTU E-Commerce Backend
 * src/controllers/coupon.controller.js
 *
 * Coupon Controller
 * Handles customer coupon validation and Admin coupon management.
 */

const CouponService = require('../services/coupon.service');
const CartService = require('../services/cart.service');
const ApiResponse = require('../utils/api-response');
const AppError = require('../utils/app-error');

class CouponController {
  /**
   * POST /api/coupons/validate
   * Customer / Public: Validate coupon eligibility against current cart
   */
  static async validateCoupon(req, res, next) {
    try {
      const { code, guest_token } = req.body;
      const rawGuestToken = req.headers['x-guest-token'] || guest_token;
      const userId = req.user ? req.user.id : null;

      // 1. Fetch current cart
      const { cart } = await CartService.getOrCreateCart({
        userId,
        guestToken: rawGuestToken,
      });

      // 2. Fetch server-calculated cart subtotal
      const cartDetails = await CartService.getCartDetails(cart.id);
      if (!cartDetails.items || cartDetails.items.length === 0) {
        throw AppError.badRequest('Your cart is empty. Add items before validating a coupon.');
      }

      // 3. Validate coupon against server-calculated subtotal
      const validation = await CouponService.validateCouponForSubtotal({
        code,
        userId,
        subtotal: cartDetails.subtotal,
      });

      return ApiResponse.success(res, 'Coupon is valid and eligible for your order.', validation);
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/admin/coupons
   * Shop Owner / Admin: Create coupon
   */
  static async createCoupon(req, res, next) {
    try {
      const coupon = await CouponService.createCoupon(req.user.id, req.body);
      return ApiResponse.created(res, 'Coupon created successfully.', coupon);
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/admin/coupons
   * Shop Owner / Admin: List all coupons with filters & pagination
   */
  static async getCoupons(req, res, next) {
    try {
      const result = await CouponService.getCoupons(req.query);
      return ApiResponse.success(res, 'Coupons retrieved successfully.', result);
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/admin/coupons/:id
   * Shop Owner / Admin: Get coupon details & usage statistics
   */
  static async getCouponById(req, res, next) {
    try {
      const couponId = parseInt(req.params.id, 10);
      const coupon = await CouponService.getCouponById(couponId);
      return ApiResponse.success(res, 'Coupon details retrieved successfully.', coupon);
    } catch (err) {
      next(err);
    }
  }

  /**
   * PUT /api/admin/coupons/:id
   * Shop Owner / Admin: Update coupon
   */
  static async updateCoupon(req, res, next) {
    try {
      const couponId = parseInt(req.params.id, 10);
      const updated = await CouponService.updateCoupon(couponId, req.body);
      return ApiResponse.success(res, 'Coupon updated successfully.', updated);
    } catch (err) {
      next(err);
    }
  }

  /**
   * PATCH /api/admin/coupons/:id/status
   * Shop Owner / Admin: Activate or Deactivate coupon
   */
  static async setCouponStatus(req, res, next) {
    try {
      const couponId = parseInt(req.params.id, 10);
      const { is_active } = req.body;
      const result = await CouponService.setCouponStatus(couponId, is_active);
      return ApiResponse.success(res, result.message, result);
    } catch (err) {
      next(err);
    }
  }

  /**
   * DELETE /api/admin/coupons/:id
   * Shop Owner / Admin: Delete coupon (prevented if historical usages exist)
   */
  static async deleteCoupon(req, res, next) {
    try {
      const couponId = parseInt(req.params.id, 10);
      const result = await CouponService.deleteCoupon(couponId);
      return ApiResponse.success(res, result.message, result);
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/admin/coupons/:id/usages
   * Shop Owner / Admin: Retrieve coupon usage history
   */
  static async getCouponUsages(req, res, next) {
    try {
      const couponId = parseInt(req.params.id, 10);
      const result = await CouponService.getCouponUsages(couponId, req.query);
      return ApiResponse.success(res, 'Coupon usage history retrieved successfully.', result);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = CouponController;
