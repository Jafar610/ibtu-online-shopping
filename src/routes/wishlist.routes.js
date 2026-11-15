/**
 * IBTU E-Commerce Backend
 * src/routes/wishlist.routes.js
 *
 * Wishlist Routes
 * All endpoints require customer authentication.
 */

const express = require('express');
const { authenticate } = require('../middleware/auth.middleware');
const AppError = require('../utils/app-error');
const WishlistController = require('../controllers/wishlist.controller');
const {
  validateAddToWishlist,
  validateProductIdParam,
  validateMoveToCart,
} = require('../validators/wishlist.validator');

const router = express.Router();

/**
 * Middleware: Verify caller is an authenticated customer account
 */
function authorizeCustomer(req, res, next) {
  if (!req.user) {
    return next(AppError.unauthorized('Authentication required.'));
  }
  const roles = (req.user.roles || (req.user.role ? [req.user.role] : [])).map((r) =>
    String(r).toLowerCase()
  );

  if (!roles.includes('customer')) {
    return next(
      AppError.forbidden('Access denied. Wishlist is available only to customer accounts.')
    );
  }
  next();
}

// All wishlist routes require authentication and customer role
router.use(authenticate, authorizeCustomer);

// GET /api/wishlist - Get customer wishlist
router.get('/', WishlistController.getWishlist);

// POST /api/wishlist/items - Add product to wishlist
router.post('/items', validateAddToWishlist, WishlistController.addItem);

// DELETE /api/wishlist/items/:productId - Remove product from wishlist
router.delete('/items/:productId', validateProductIdParam, WishlistController.removeItem);

// GET /api/wishlist/check/:productId - Check if product is in customer wishlist
router.get('/check/:productId', validateProductIdParam, WishlistController.checkStatus);

// DELETE /api/wishlist - Clear customer wishlist
router.delete('/', WishlistController.clearWishlist);

// POST /api/wishlist/items/:productId/add-to-cart - Move product from wishlist to cart
router.post('/items/:productId/add-to-cart', validateMoveToCart, WishlistController.moveToCart);

module.exports = router;
