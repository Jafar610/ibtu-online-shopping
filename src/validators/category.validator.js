/**
 * IBTU E-Commerce Backend
 * src/validators/category.validator.js
 *
 * Input validation rules for category endpoints using express-validator.
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
 * Validation rules for creating a new category
 * POST /api/categories
 */
const createCategoryValidators = [
  body('name')
    .trim()
    .notEmpty().withMessage('Category name is required.')
    .isLength({ min: 2, max: 150 }).withMessage('Category name must be between 2 and 150 characters.'),

  body('slug')
    .optional({ checkFalsy: true })
    .trim()
    .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .withMessage('Slug must be URL-friendly (lowercase letters, numbers, and single hyphens).'),

  body('parent_id')
    .optional({ nullable: true, checkFalsy: true })
    .isInt({ min: 1 }).withMessage('Parent ID must be a positive integer.'),

  body('description')
    .optional({ nullable: true })
    .trim(),

  body('image_url')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 500 }).withMessage('Image URL cannot exceed 500 characters.'),

  body('is_active')
    .optional()
    .isBoolean().withMessage('is_active must be a boolean (true/false or 1/0).'),

  body('sort_order')
    .optional()
    .isInt({ min: 0 }).withMessage('Sort order must be a non-negative integer.'),
];

/**
 * Validation rules for updating an existing category
 * PUT /api/categories/:id
 */
const updateCategoryValidators = [
  body('name')
    .optional()
    .trim()
    .notEmpty().withMessage('Category name cannot be empty.')
    .isLength({ min: 2, max: 150 }).withMessage('Category name must be between 2 and 150 characters.'),

  body('slug')
    .optional()
    .trim()
    .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .withMessage('Slug must be URL-friendly (lowercase letters, numbers, and single hyphens).'),

  body('parent_id')
    .optional({ nullable: true })
    .custom((val) => {
      if (val === null || val === '') return true;
      if (!Number.isInteger(Number(val)) || Number(val) < 1) {
        throw new Error('Parent ID must be a positive integer or null.');
      }
      return true;
    }),

  body('description')
    .optional({ nullable: true })
    .trim(),

  body('image_url')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 500 }).withMessage('Image URL cannot exceed 500 characters.'),

  body('is_active')
    .optional()
    .isBoolean().withMessage('is_active must be a boolean (true/false).'),

  body('sort_order')
    .optional()
    .isInt({ min: 0 }).withMessage('Sort order must be a non-negative integer.'),
];

/**
 * Validation rules for category query filters
 * GET /api/categories
 */
const filterCategoryValidators = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer.'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100.'),

  query('parent_id')
    .optional()
    .custom((val) => {
      if (val === 'null' || val === 'root') return true;
      if (!Number.isInteger(Number(val)) || Number(val) < 1) {
        throw new Error('parent_id query filter must be a valid ID or "null".');
      }
      return true;
    }),

  query('is_active')
    .optional()
    .isIn(['0', '1', 'true', 'false']).withMessage('is_active filter must be boolean or 0/1.'),
];

module.exports = {
  validate,
  createCategoryValidators,
  updateCategoryValidators,
  filterCategoryValidators,
};
