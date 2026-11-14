/**
 * IBTU E-Commerce Backend
 * src/controllers/orderController.js
 */

const Order = require('../models/Order');
const Cart = require('../models/Cart');
const { sendSuccess, sendError } = require('../utils/response');

/**
 * POST /api/orders
 * Place a new order using the user's current cart items.
 */
const createOrder = async (req, res, next) => {
  try {
    const { shipping_address, payment_method = 'cod' } = req.body;

    if (!shipping_address) return sendError(res, 400, 'Shipping address is required.');

    // Pull items from the authenticated user's cart
    const cartItems = await Cart.findByUser(req.user.id);
    if (!cartItems.length) return sendError(res, 400, 'Your cart is empty.');

    // Build order items array
    const items = cartItems.map((item) => ({
      product_id: item.product_id,
      product_name: item.name,
      quantity: item.quantity,
      unit_price: item.price,
      size: item.size,
      color: item.color,
    }));

    const subtotal = items.reduce((s, i) => s + i.unit_price * i.quantity, 0);
    const shipping_fee = subtotal >= 2000 ? 0 : 150; // Free shipping over 2000 ETB
    const total_amount = subtotal + shipping_fee;

    const orderId = await Order.create({
      user_id: req.user.id,
      shipping_address,
      items,
      total_amount,
      shipping_fee,
      payment_method,
    });

    // Clear the cart after a successful order
    await Cart.clear(req.user.id);

    const order = await Order.findById(orderId);
    return sendSuccess(res, 201, 'Order placed successfully.', { order });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/orders
 * Get all orders for the authenticated customer.
 */
const getMyOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, parseInt(limit));
    const offset = (pageNum - 1) * limitNum;
    const orders = await Order.findByUser(req.user.id, limitNum, offset);
    return sendSuccess(res, 200, 'Orders retrieved.', { orders });
  } catch (err) { next(err); }
};

/**
 * GET /api/orders/:id
 * Get a single order by id (customer can only see their own).
 */
const getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(parseInt(req.params.id));
    if (!order) return sendError(res, 404, 'Order not found.');
    // Customers can only view their own orders
    if (req.user.role !== 'admin' && order.user_id !== req.user.id) {
      return sendError(res, 403, 'Access denied.');
    }
    return sendSuccess(res, 200, 'Order retrieved.', { order });
  } catch (err) { next(err); }
};

/**
 * GET /api/admin/orders  [admin only]
 */
const getAllOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, parseInt(limit));
    const offset = (pageNum - 1) * limitNum;
    const [orders, total] = await Promise.all([Order.findAll(limitNum, offset), Order.count()]);
    return sendSuccess(res, 200, 'All orders retrieved.', {
      orders,
      pagination: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (err) { next(err); }
};

/**
 * PATCH /api/admin/orders/:id/status  [admin only]
 */
const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!status) return sendError(res, 400, 'Status is required.');
    const updated = await Order.updateStatus(parseInt(req.params.id), status);
    if (!updated) return sendError(res, 404, 'Order not found.');
    const order = await Order.findById(parseInt(req.params.id));
    return sendSuccess(res, 200, 'Order status updated.', { order });
  } catch (err) { next(err); }
};

module.exports = { createOrder, getMyOrders, getOrder, getAllOrders, updateOrderStatus };
