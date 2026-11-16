/**
 * IBTU E-Commerce Backend
 * src/controllers/order.controller.js
 *
 * Order Controller
 * Dispatches Customer & Admin Order requests.
 */

const OrderService = require('../services/order.service');
const ApiResponse = require('../utils/api-response');

class OrderController {
  /**
   * GET /api/admin/orders
   * Admin: List all orders with filters, search, and pagination
   */
  static async getAllOrders(req, res, next) {
    try {
      const result = await OrderService.getAllOrders(req.query);
      return ApiResponse.success(res, 'Orders retrieved successfully.', result);
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/orders/:id or /api/admin/orders/:id
   * Customer / Admin: Retrieve full order details
   */
  static async getOrderDetails(req, res, next) {
    try {
      const orderId = parseInt(req.params.id, 10);
      const details = await OrderService.getOrderDetails(orderId, req.user);
      return ApiResponse.success(res, 'Order details retrieved successfully.', details);
    } catch (err) {
      next(err);
    }
  }

  /**
   * PATCH /api/admin/orders/:id/status
   * Admin: Update order status & trigger inventory fulfillment
   */
  static async updateOrderStatus(req, res, next) {
    try {
      const orderId = parseInt(req.params.id, 10);
      const { status, admin_notes } = req.body;
      const result = await OrderService.updateOrderStatus(
        orderId,
        status,
        req.user,
        admin_notes,
        req.ip
      );
      return ApiResponse.success(res, result.message, result);
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/orders/:id/cancel or /api/admin/orders/:id/cancel
   * Customer / Admin: Cancel an eligible order
   */
  static async cancelOrder(req, res, next) {
    try {
      const orderId = parseInt(req.params.id, 10);
      const { cancellation_reason } = req.body;
      const result = await OrderService.cancelOrder(
        orderId,
        req.user,
        cancellation_reason,
        req.ip
      );
      return ApiResponse.success(res, result.message, result);
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/orders
   * Customer: View list of own orders
   */
  static async getCustomerOrders(req, res, next) {
    try {
      const result = await OrderService.getCustomerOrders(req.user.id, req.query);
      return ApiResponse.success(res, 'Your orders retrieved successfully.', result);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = OrderController;
