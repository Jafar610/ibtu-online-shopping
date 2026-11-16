/**
 * IBTU E-Commerce Backend
 * src/controllers/orderController.js
 */

const Order = require('../models/Order');
const ApiResponse = require('../utils/api-response');
const AppError = require('../utils/app-error');

/**
 * GET /api/orders
 * Get all orders for the authenticated customer.
 */
const getMyOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(50, parseInt(limit, 10));
    const offset = (pageNum - 1) * limitNum;
    const orders = await Order.findByUser(req.user.id, limitNum, offset);
    return ApiResponse.success(res, 'Orders retrieved successfully.', { orders });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/orders/:id
 * Get a single order by id (customer can only see their own, Admin can see all).
 */
const getOrder = async (req, res, next) => {
  try {
    const orderId = parseInt(req.params.id, 10);
    const order = await Order.findById(orderId);
    if (!order) {
      throw AppError.notFound('Order not found.');
    }

    const isAdmin =
      (req.user.roles && req.user.roles.includes('Admin')) || req.user.role === 'admin';

    if (!isAdmin && order.user_id !== req.user.id) {
      throw AppError.forbidden('Access denied. You do not have permission to view this order.');
    }

    return ApiResponse.success(res, 'Order retrieved successfully.', { order });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/admin/orders
 */
const getAllOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, parseInt(limit, 10));
    const offset = (pageNum - 1) * limitNum;
    const [orders, total] = await Promise.all([Order.findAll(limitNum, offset), Order.count()]);
    return ApiResponse.success(res, 'All orders retrieved successfully.', {
      orders,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/admin/orders/:id/status
 */
const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!status) {
      throw AppError.badRequest('Status is required.');
    }
    const orderId = parseInt(req.params.id, 10);
    const updated = await Order.updateStatus(orderId, status);
    if (!updated) {
      throw AppError.notFound('Order not found.');
    }
    const order = await Order.findById(orderId);
    return ApiResponse.success(res, 'Order status updated successfully.', { order });
  } catch (err) {
    next(err);
  }
};

module.exports = { getMyOrders, getOrder, getAllOrders, updateOrderStatus };
