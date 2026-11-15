/**
 * IBTU E-Commerce Backend
 * src/controllers/cartController.js
 */

const Cart = require('../models/Cart');
const { sendSuccess, sendError } = require('../utils/response');

const getCart = async (req, res, next) => {
  try {
    const items = await Cart.findByUser(req.user.id);
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    return sendSuccess(res, 200, 'Cart retrieved.', { items, subtotal });
  } catch (err) { next(err); }
};

const addToCart = async (req, res, next) => {
  try {
    const { product_id, quantity = 1, size, color } = req.body;
    if (!product_id) return sendError(res, 400, 'product_id is required.');
    await Cart.upsert(req.user.id, product_id, quantity, size, color);
    const items = await Cart.findByUser(req.user.id);
    return sendSuccess(res, 200, 'Item added to cart.', { items });
  } catch (err) { next(err); }
};

const updateCartItem = async (req, res, next) => {
  try {
    const { quantity } = req.body;
    if (!quantity || quantity < 1) return sendError(res, 400, 'Quantity must be at least 1.');
    const updated = await Cart.updateQuantity(parseInt(req.params.id), req.user.id, quantity);
    if (!updated) return sendError(res, 404, 'Cart item not found.');
    const items = await Cart.findByUser(req.user.id);
    return sendSuccess(res, 200, 'Cart item updated.', { items });
  } catch (err) { next(err); }
};

const removeFromCart = async (req, res, next) => {
  try {
    const removed = await Cart.remove(parseInt(req.params.id), req.user.id);
    if (!removed) return sendError(res, 404, 'Cart item not found.');
    const items = await Cart.findByUser(req.user.id);
    return sendSuccess(res, 200, 'Item removed from cart.', { items });
  } catch (err) { next(err); }
};

const clearCart = async (req, res, next) => {
  try {
    await Cart.clear(req.user.id);
    return sendSuccess(res, 200, 'Cart cleared.');
  } catch (err) { next(err); }
};

module.exports = { getCart, addToCart, updateCartItem, removeFromCart, clearCart };
