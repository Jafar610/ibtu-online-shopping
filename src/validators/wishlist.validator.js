/**
 * IBTU E-Commerce Backend
 * src/validators/wishlist.validator.js
 *
 * Input validation for Wishlist API endpoints.
 */

const { body, param } = require('express-validator');

// Validate adding a product to the wishlist
const validateAddToWishlist = [
  body('product_id')
    .notEmpty()
    .withMessage('product_id is required')
    .isInt({ min: 1 })
    .withMessage('product_id must be a positive integer')
    .toInt(),
];

// Validate productId parameter
const validateProductIdParam = [
  param('productId')
    .notEmpty()
    .withMessage('productId is required')
    .isInt({ min: 1 })
    .withMessage('productId must be a positive integer')
    .toInt(),
];

// Validate moving an item from wishlist to cart
const validateMoveToCart = [
  param('productId')
    .notEmpty()
    .withMessage('productId is required')
    .isInt({ min: 1 })
    .withMessage('productId must be a positive integer')
    .toInt(),
  body('variant_id')
    .notEmpty()
    .withMessage('variant_id is required')
    .isInt({ min: 1 })
    .withMessage('variant_id must be a positive integer')
    .toInt(),
  body('quantity')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('quantity must be an integer between 1 and 100')
    .toInt(),
];

module.exports = {
  validateAddToWishlist,
  validateProductIdParam,
  validateMoveToCart,
};
