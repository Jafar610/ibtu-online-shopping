/**
 * IBTU E-Commerce Backend
 * src/validators/product-image.validator.js
 *
 * Input validation for product image endpoints using express-validator.
 */

const { body, param } = require('express-validator');

// Validate productId param
const validateProductIdParam = [
  param('productId')
    .isInt({ min: 1 })
    .withMessage('productId must be a positive integer')
    .toInt(),
];

// Validate image id param
const validateImageIdParam = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Image id must be a positive integer')
    .toInt(),
];

// Validate upload body and files
const validateUploadImage = [
  param('productId')
    .isInt({ min: 1 })
    .withMessage('productId must be a positive integer')
    .toInt(),
  body('variant_id')
    .optional({ nullable: true, checkFalsy: true })
    .isInt({ min: 1 })
    .withMessage('variant_id must be a positive integer when provided')
    .toInt(),
  body('alt_text')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 255 })
    .withMessage('alt_text must not exceed 255 characters'),
  body('is_primary')
    .optional()
    .custom((val) => {
      if (val === true || val === 'true' || val === false || val === 'false' || val === 1 || val === '1' || val === 0 || val === '0') {
        return true;
      }
      throw new Error('is_primary must be a boolean');
    }),
  body('sort_order')
    .optional()
    .isInt({ min: 0 })
    .withMessage('sort_order must be a non-negative integer')
    .toInt(),
  // Custom check for uploaded files
  (req, res, next) => {
    if (!req.uploadedFiles || req.uploadedFiles.length === 0) {
      const AppError = require('../utils/app-error');
      return next(AppError.badRequest('At least one image file is required for upload.'));
    }
    next();
  },
];

// Validate updating image metadata
const validateUpdateImage = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Image id must be a positive integer')
    .toInt(),
  body('variant_id')
    .optional({ nullable: true })
    .custom((val) => {
      if (val === null || val === '') return true;
      const num = parseInt(val, 10);
      if (isNaN(num) || num < 1) {
        throw new Error('variant_id must be a positive integer or null');
      }
      return true;
    }),
  body('alt_text')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 255 })
    .withMessage('alt_text must not exceed 255 characters'),
  body('sort_order')
    .optional()
    .isInt({ min: 0 })
    .withMessage('sort_order must be a non-negative integer')
    .toInt(),
];

// Validate reordering images
const validateReorderImages = [
  param('productId')
    .isInt({ min: 1 })
    .withMessage('productId must be a positive integer')
    .toInt(),
  body('image_orders')
    .isArray({ min: 1 })
    .withMessage('image_orders must be a non-empty array of image sort positions'),
  body('image_orders.*.id')
    .isInt({ min: 1 })
    .withMessage('Each item in image_orders must have a valid integer id')
    .toInt(),
  body('image_orders.*.sort_order')
    .isInt({ min: 0 })
    .withMessage('Each item in image_orders must have a valid non-negative sort_order')
    .toInt(),
];

module.exports = {
  validateProductIdParam,
  validateImageIdParam,
  validateUploadImage,
  validateUpdateImage,
  validateReorderImages,
};
