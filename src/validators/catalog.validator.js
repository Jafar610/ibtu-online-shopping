/**
 * IBTU E-Commerce Backend
 * src/validators/catalog.validator.js
 *
 * Query parameter and path validators for public catalog endpoints.
 */

const { query, param } = require('express-validator');

// Sorting whitelist
const ALLOWED_SORTS = new Set([
  'newest',
  'oldest',
  'price_asc',
  'price_desc',
  'name_asc',
  'name_desc',
]);

// Product listing & filtering validator
const validateCatalogFilter = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('page must be a positive integer')
    .toInt(),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('limit must be an integer between 1 and 50')
    .toInt(),
  query('category')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('category cannot be empty if provided'),
  query('search')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('search term cannot exceed 100 characters'),
  query('min_price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('min_price must be a non-negative number')
    .toFloat(),
  query('max_price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('max_price must be a non-negative number')
    .toFloat()
    .custom((val, { req }) => {
      if (req.query.min_price !== undefined && val < req.query.min_price) {
        throw new Error('max_price must be greater than or equal to min_price');
      }
      return true;
    }),
  query('size')
    .optional()
    .trim()
    .isLength({ max: 30 })
    .withMessage('size must not exceed 30 characters'),
  query('color')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('color must not exceed 50 characters'),
  query('featured')
    .optional()
    .isIn(['true', 'false', '1', '0'])
    .withMessage('featured must be a boolean (true/false)'),
  query('in_stock')
    .optional()
    .isIn(['true', 'false', '1', '0'])
    .withMessage('in_stock must be a boolean (true/false)'),
  query('sort')
    .optional()
    .custom((val) => {
      if (!ALLOWED_SORTS.has(val.toLowerCase())) {
        throw new Error(
          `Invalid sort option. Allowed options are: ${Array.from(ALLOWED_SORTS).join(', ')}`
        );
      }
      return true;
    }),
];

// Product slug or ID validator
const validateProductIdentifier = [
  param('slug')
    .trim()
    .notEmpty()
    .withMessage('Product slug or ID is required'),
];

// Category slug validator
const validateCategorySlug = [
  param('slug')
    .trim()
    .notEmpty()
    .withMessage('Category slug is required'),
];

// Related products identifier
const validateRelatedParam = [
  param('id')
    .trim()
    .notEmpty()
    .withMessage('Product id or slug is required'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 20 })
    .withMessage('limit must be between 1 and 20')
    .toInt(),
];

// Featured products query validator
const validateFeaturedQuery = [
  query('limit')
    .optional()
    .isInt({ min: 1, max: 24 })
    .withMessage('limit must be between 1 and 24')
    .toInt(),
];

module.exports = {
  validateCatalogFilter,
  validateProductIdentifier,
  validateCategorySlug,
  validateRelatedParam,
  validateFeaturedQuery,
};
