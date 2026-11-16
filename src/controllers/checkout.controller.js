/**
 * IBTU E-Commerce Backend
 * src/controllers/checkout.controller.js
 *
 * Checkout Controller
 * Dispatches checkout preview and order creation requests.
 */

const CheckoutService = require('../services/checkout.service');
const ApiResponse = require('../utils/api-response');

class CheckoutController {
  /**
   * POST /api/checkout/preview
   * Preview checkout with server-side price calculation, coupon discount, and stock check
   */
  static async preview(req, res, next) {
    try {
      const shippingAddressId = req.body.shipping_address_id
        ? parseInt(req.body.shipping_address_id, 10)
        : null;
      const couponCode = req.body.coupon_code || null;

      const preview = await CheckoutService.previewCheckout(req.user.id, {
        shippingAddressId,
        couponCode,
      });

      return ApiResponse.success(res, 'Checkout preview calculated successfully.', preview);
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/checkout/orders
   * Submit and finalize order placement
   */
  static async createOrder(req, res, next) {
    try {
      const { shipping_address_id, payment_method, coupon_code, customer_notes } = req.body;

      const result = await CheckoutService.createOrder(req.user.id, {
        shipping_address_id: parseInt(shipping_address_id, 10),
        payment_method,
        coupon_code,
        customer_notes,
      });

      return ApiResponse.created(
        res,
        'Order placed successfully. Please follow the payment instructions to complete your order.',
        result
      );
    } catch (err) {
      next(err);
    }
  }
}

module.exports = CheckoutController;
