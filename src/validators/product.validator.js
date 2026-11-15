/**
 * IBTU E-Commerce Backend
 * src/validators/product.validator.js
 *
 * Input validation and sanitization rules for product endpoints.
 */

const { body, query, validationResult } = require('express-validator');
const AppError = require('../utils/app-error');

// Middleware to evaluate validation results and throw AppError with details
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formatted = errors.array().map((err) => ({
      field: err.path,
      message: err.msg,
    }));
    return next(new AppError('Validation failed. Please check your input.', 422, formatted));
  }
  next();
};

/**
 * Validation rules for creating a product
 * POST /api/products
 */
const createProductValidators = [
  body('name')
    .trim()
    .notEmpty().withMessage('Product name is required.')
    .isLength({ min: 2, max: 200 }).withMessage('Product name must be between 2 and 200 characters.'),

  body('slug')
    .optional({ checkFalsy: true })
    .trim()
    .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .withMessage('Slug must be URL-friendly (lowercase letters, numbers, and single hyphens).'),

  body('category_id')
    .notEmpty().withMessage('Category ID is required.')
    .isInt({ min: 1 }).withMessage('Category ID must be a valid positive integer.'),

  body('short_description')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 500 }).withMessage('Short description cannot exceed 500 characters.'),

  body('description')
    .optional({ nullable: true })
    .trim(),

  body('material')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 150 }).withMessage('Material cannot exceed 150 characters.'),

  body('care_instructions')
    .optional({ nullable: true })
    .trim(),

  body('status')
    .optional()
    .isIn(['draft', 'active', 'archived'])
    .withMessage('Status must be one of: "draft", "active", "archived".'),

  body('is_featured')
    .optional()
    .isBoolean().withMessage('is_featured must be a boolean (true/false or 1/0).'),
];

/**
 * Validation rules for updating a product
 * PUT /api/products/:id
 */
const updateProductValidators = [
  body('name')
    .optional()
    .trim()
    .notEmpty().withMessage('Product name cannot be empty.')
    .isLength({ min: 2, max: 200 }).withMessage('Product name must be between 2 and 200 characters.'),

  body('slug')
    .optional()
    .trim()
    .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .withMessage('Slug must be URL-friendly (lowercase letters, numbers, and single hyphens).'),

  body('category_id')
    .optional()
    .isInt({ min: 1 }).withMessage('Category ID must be a valid positive integer.'),

  body('short_description')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 500 }).withMessage('Short description cannot exceed 500 characters.'),

  body('description')
    .optional({ nullable: true })
    .trim(),

  body('material')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 150 }).withMessage('Material cannot exceed 150 characters.'),

  body('care_instructions')
    .optional({ nullable: true })
    .trim(),

  body('status')
    .optional()
    .isIn(['draft', 'active', 'archived'])
    .withMessage('Status must be one of: "draft", "active", "archived".'),

  body('is_featured')
    .optional()
    .isBoolean().withMessage('is_featured must be a boolean (true/false).'),
];

/**
 * Validation rules for updating product status
 * PATCH /api/products/:id/status
 */
const updateStatusValidators = [
  body('status')
    .notEmpty().withMessage('Status is required.')
    .isIn(['draft', 'active', 'archived'])
    .withMessage('Status must be one of: "draft", "active", "archived".'),
];

/**
 * Validation rules for filtering products
 * GET /api/products
 */
const filterProductValidators = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer.'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100.'),

  query('category_id')
    .optional()
    .isInt({ min: 1 }).withMessage('category_id must be a positive integer.'),

  query('status')
    .optional()
    .isIn(['draft', 'active', 'archived']).withMessage('status must be "draft", "active", or "archived".'),

  query('is_featured')
    .optional()
    .isIn(['0', '1', 'true', 'false']).withMessage('is_featured must be boolean or 0/1.'),

  query('sort')
    .optional()
    .isIn(['created_at', 'name', 'price', 'status']).withMessage('Invalid sort field.'),

  query('order')
    .optional()
    .isIn(['ASC', 'DESC', 'asc', 'desc']).withMessage('Order must be ASC or DESC.'),
];

module.exports = {
  validate,
  createProductValidators,
  updateProductValidators,
  updateStatusValidators,
  filterProductValidators,
};
