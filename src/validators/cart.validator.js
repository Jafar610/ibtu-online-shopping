/**
 * IBTU E-Commerce Backend
 * src/validators/cart.validator.js
 *
 * Input validation for Shopping Cart API endpoints.
 */

const { body, param } = require('express-validator');

// Validate adding an item to the cart
const validateAddToCart = [
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

// Validate updating an item quantity
const validateUpdateQuantity = [
  param('itemId')
    .notEmpty()
    .withMessage('itemId is required')
    .isInt({ min: 1 })
    .withMessage('itemId must be a positive integer')
    .toInt(),
  body('quantity')
    .notEmpty()
    .withMessage('quantity is required')
    .isInt({ min: 1, max: 100 })
    .withMessage('quantity must be an integer between 1 and 100')
    .toInt(),
];

// Validate item ID parameter for deletion
const validateItemIdParam = [
  param('itemId')
    .notEmpty()
    .withMessage('itemId is required')
    .isInt({ min: 1 })
    .withMessage('itemId must be a positive integer')
    .toInt(),
];

// Validate guest cart merge body
const validateMergeCart = [
  body('guest_token')
    .optional()
    .trim()
    .isLength({ min: 16, max: 128 })
    .withMessage('guest_token must be a valid token string if provided in request body'),
];

module.exports = {
  validateAddToCart,
  validateUpdateQuantity,
  validateItemIdParam,
  validateMergeCart,
};
