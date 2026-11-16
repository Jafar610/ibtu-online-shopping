/**
 * IBTU E-Commerce Backend
 * src/routes/cart.routes.js
 *
 * Shopping Cart Routes
 * Supports both guest sessions (via cookies/headers) and authenticated users.
 */

const express = require('express');
const { authenticate } = require('../middleware/auth.middleware');
const { optionalAuth } = require('../middleware/auth');
const CartController = require('../controllers/cart.controller');
const {
  validateAddToCart,
  validateUpdateQuantity,
  validateItemIdParam,
  validateMergeCart,
} = require('../validators/cart.validator');

const router = express.Router();

// ─────────────────────────────────────────────
// Standard Phase 10 REST Endpoints
// ─────────────────────────────────────────────

// GET /api/cart - Get active cart
router.get('/', optionalAuth, CartController.getCart);

// POST /api/cart/items - Add variant to cart
router.post('/items', optionalAuth, validateAddToCart, CartController.addItem);

// PATCH /api/cart/items/:itemId - Update item quantity
router.patch('/items/:itemId', optionalAuth, validateUpdateQuantity, CartController.updateQuantity);

// DELETE /api/cart/items/:itemId - Remove item from cart
router.delete('/items/:itemId', optionalAuth, validateItemIdParam, CartController.removeItem);

// DELETE /api/cart - Clear cart
router.delete('/', optionalAuth, CartController.clearCart);

// POST /api/cart/merge - Merge guest cart after customer login (requires auth)
router.post('/merge', authenticate, validateMergeCart, CartController.mergeCart);

// ─────────────────────────────────────────────
// Legacy Aliases (Phase 1 backward compatibility)
// ─────────────────────────────────────────────
router.post('/', optionalAuth, validateAddToCart, CartController.addItem);
router.put('/:id', optionalAuth, validateUpdateQuantity, CartController.updateQuantity);
router.delete('/clear', optionalAuth, CartController.clearCart);
router.delete('/:id', optionalAuth, validateItemIdParam, CartController.removeItem);

module.exports = router;
