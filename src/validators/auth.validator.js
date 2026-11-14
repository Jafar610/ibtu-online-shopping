/**
 * IBTU E-Commerce Backend
 * src/validators/auth.validator.js
 *
 * Input validation and sanitization rules for authentication endpoints.
 * Uses express-validator to enforce data integrity before controllers run.
 */

const { body, validationResult } = require('express-validator');
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
 * Validation rules for Customer Registration
 * POST /api/auth/register
 */
const registerValidationRules = [
  body('first_name')
    .trim()
    .notEmpty().withMessage('First name is required.')
    .isLength({ min: 2, max: 100 }).withMessage('First name must be between 2 and 100 characters.'),

  body('last_name')
    .trim()
    .notEmpty().withMessage('Last name is required.')
    .isLength({ min: 2, max: 100 }).withMessage('Last name must be between 2 and 100 characters.'),

  body('email')
    .trim()
    .notEmpty().withMessage('Email address is required.')
    .isEmail().withMessage('Please provide a valid email address.')
    .normalizeEmail(),

  body('phone')
    .optional({ checkFalsy: true })
    .trim()
    .matches(/^[+]?[0-9\s\-()]{7,25}$/)
    .withMessage('Please provide a valid phone number (e.g. +251 91 123 4567).'),

  body('password')
    .notEmpty().withMessage('Password is required.')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long.')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter.')
    .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter.')
    .matches(/[0-9]/).withMessage('Password must contain at least one number.'),

  body('confirm_password')
    .notEmpty().withMessage('Password confirmation is required.')
    .custom((val, { req }) => {
      if (val !== req.body.password) {
        throw new Error('Passwords do not match.');
      }
      return true;
    }),
];

/**
 * Validation rules for User Login
 * POST /api/auth/login
 */
const loginValidationRules = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email address is required.')
    .isEmail().withMessage('Please provide a valid email address.')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password is required.'),
];

module.exports = {
  validate,
  registerValidationRules,
  loginValidationRules,
};
