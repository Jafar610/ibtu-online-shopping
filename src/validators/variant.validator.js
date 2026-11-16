/**
 * variant.validator.js
 * Input validation rules for Product Variant endpoints.
 *
 * Uses the same express-validator pattern as category and product validators.
 */

const { body, param, query } = require('express-validator');

// ─────────────────────────────────────────────
// Re-usable field rules
// ─────────────────────────────────────────────

/** productId route param must be a positive integer */
const productIdParam = param('productId')
  .isInt({ min: 1 })
  .withMessage('productId must be a positive integer')
  .toInt();

/** id route param must be a positive integer */
const idParam = param('id')
  .isInt({ min: 1 })
  .withMessage('Variant id must be a positive integer')
  .toInt();

/** SKU: 2–100 printable characters, trimmed */
const skuField = body('sku')
  .trim()
  .notEmpty().withMessage('SKU is required')
  .isLength({ min: 2, max: 100 }).withMessage('SKU must be between 2 and 100 characters')
  .matches(/^[A-Za-z0-9_\-]+$/).withMessage('SKU may only contain letters, digits, hyphens, and underscores');

/** size: optional, max 30 chars */
const sizeField = body('size')
  .optional({ nullable: true })
  .trim()
  .isLength({ max: 30 }).withMessage('Size must be at most 30 characters');

/** color: optional, max 50 chars */
const colorField = body('color')
  .optional({ nullable: true })
  .trim()
  .isLength({ max: 50 }).withMessage('Color must be at most 50 characters');

/** price: required, positive decimal */
const priceField = body('price')
  .notEmpty().withMessage('Price is required')
  .isFloat({ min: 0.01 }).withMessage('Price must be greater than zero')
  .toFloat();

/** sale_price: optional, must be less than price when provided */
const salePriceField = body('sale_price')
  .optional({ nullable: true })
  .isFloat({ min: 0.01 }).withMessage('Sale price must be greater than zero when provided')
  .toFloat()
  .custom((value, { req }) => {
    if (value !== null && value !== undefined && req.body.price !== undefined) {
      if (value >= req.body.price) {
        throw new Error('Sale price must be strictly less than the regular price');
      }
    }
    return true;
  });

/** stock_quantity: non-negative integer (create only) */
const stockQuantityField = body('stock_quantity')
  .optional()
  .isInt({ min: 0 }).withMessage('stock_quantity must be a non-negative integer')
  .toInt();

/** low_stock_threshold: non-negative integer */
const lowStockThresholdField = body('low_stock_threshold')
  .optional()
  .isInt({ min: 0 }).withMessage('low_stock_threshold must be a non-negative integer')
  .toInt();

/** is_active: boolean */
const isActiveField = body('is_active')
  .optional()
  .isBoolean().withMessage('is_active must be true or false')
  .toBoolean();

// ─────────────────────────────────────────────
// Exported validator arrays
// ─────────────────────────────────────────────

/**
 * validateCreateVariant
 * Used on POST /api/products/:productId/variants
 */
const validateCreateVariant = [
  productIdParam,
  skuField,
  sizeField,
  colorField,
  priceField,
  salePriceField,
  stockQuantityField,
  lowStockThresholdField,
  isActiveField,
  // Reject unexpected stock manipulation fields
  body('reserved_quantity')
    .not().exists()
    .withMessage('reserved_quantity cannot be set directly — use the inventory service'),
];

/**
 * validateUpdateVariant
 * Used on PUT /api/variants/:id
 * All fields optional (partial updates allowed).
 * stock_quantity is intentionally excluded — stock is managed by inventory service.
 */
const validateUpdateVariant = [
  idParam,
  body('sku')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('SKU must be between 2 and 100 characters')
    .matches(/^[A-Za-z0-9_\-]+$/).withMessage('SKU may only contain letters, digits, hyphens, and underscores'),
  sizeField,
  colorField,
  body('price')
    .optional()
    .isFloat({ min: 0.01 }).withMessage('Price must be greater than zero')
    .toFloat(),
  body('sale_price')
    .optional({ nullable: true })
    .custom((value, { req }) => {
      if (value !== null && value !== undefined) {
        if (typeof value !== 'number' && isNaN(parseFloat(value))) {
          throw new Error('Sale price must be a number when provided');
        }
        const sp = parseFloat(value);
        if (sp <= 0) throw new Error('Sale price must be greater than zero when provided');
        const price = req.body.price !== undefined ? parseFloat(req.body.price) : null;
        if (price !== null && sp >= price) {
          throw new Error('Sale price must be strictly less than the regular price');
        }
      }
      return true;
    }),
  lowStockThresholdField,
  isActiveField,
  // Explicitly block direct stock changes
  body('stock_quantity')
    .not().exists()
    .withMessage('stock_quantity cannot be changed via variant update — use the inventory service'),
  body('reserved_quantity')
    .not().exists()
    .withMessage('reserved_quantity cannot be set directly — use the inventory service'),
];

/** validateVariantIdParam — for GET/PATCH/:id routes */
const validateVariantIdParam = [idParam];

/** validateProductIdParam — for GET /api/products/:productId/variants */
const validateProductIdParam = [productIdParam];

module.exports = {
  validateCreateVariant,
  validateUpdateVariant,
  validateVariantIdParam,
  validateProductIdParam,
};
