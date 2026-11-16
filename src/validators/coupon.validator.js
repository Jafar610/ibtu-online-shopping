/**
 * IBTU E-Commerce Backend
 * src/validators/coupon.validator.js
 *
 * Input Validation for Coupon Management & Checkout Validation
 */

const { body, param, query } = require('express-validator');
const validate = require('../middleware/validate');

const validateCreateCoupon = [
  body('code')
    .trim()
    .notEmpty()
    .withMessage('Coupon code is required.')
    .bail()
    .isLength({ min: 2, max: 50 })
    .withMessage('Coupon code must be between 2 and 50 characters.')
    .bail()
    .matches(/^[A-Za-z0-9_-]+$/)
    .withMessage('Coupon code may only contain letters, numbers, hyphens, and underscores.'),

  body('description')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 255 })
    .withMessage('Description cannot exceed 255 characters.'),

  body('discount_type')
    .notEmpty()
    .withMessage('discount_type is required.')
    .bail()
    .isIn(['percentage', 'fixed'])
    .withMessage('discount_type must be either "percentage" or "fixed".'),

  body('discount_value')
    .notEmpty()
    .withMessage('discount_value is required.')
    .bail()
    .isFloat({ min: 0.01 })
    .withMessage('discount_value must be a positive number greater than 0.')
    .bail()
    .custom((val, { req }) => {
      if (req.body.discount_type === 'percentage' && parseFloat(val) > 100) {
        throw new Error('Percentage discount cannot exceed 100%.');
      }
      return true;
    }),

  body('minimum_order_amount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('minimum_order_amount must be 0 or a positive number.'),

  body('maximum_discount_amount')
    .optional({ nullable: true })
    .isFloat({ min: 0.01 })
    .withMessage('maximum_discount_amount must be a positive number.'),

  body('usage_limit')
    .optional({ nullable: true })
    .isInt({ min: 1 })
    .withMessage('usage_limit must be a positive integer of at least 1.'),

  body('usage_limit_per_customer')
    .optional({ nullable: true })
    .isInt({ min: 1 })
    .withMessage('usage_limit_per_customer must be a positive integer of at least 1.'),

  body('starts_at')
    .optional({ nullable: true })
    .isISO8601()
    .withMessage('starts_at must be a valid date/time format.'),

  body('expires_at')
    .optional({ nullable: true })
    .isISO8601()
    .withMessage('expires_at must be a valid date/time format.')
    .bail()
    .custom((expiresAt, { req }) => {
      if (expiresAt && req.body.starts_at) {
        const start = new Date(req.body.starts_at);
        const expire = new Date(expiresAt);
        if (expire < start) {
          throw new Error('expires_at must be equal to or later than starts_at.');
        }
      }
      return true;
    }),

  body('is_active')
    .optional()
    .isBoolean()
    .withMessage('is_active must be a boolean.'),

  validate,
];

const validateUpdateCoupon = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Coupon ID must be a positive integer.'),

  body('code')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Coupon code must be between 2 and 50 characters.')
    .bail()
    .matches(/^[A-Za-z0-9_-]+$/)
    .withMessage('Coupon code may only contain letters, numbers, hyphens, and underscores.'),

  body('description')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 255 })
    .withMessage('Description cannot exceed 255 characters.'),

  body('discount_type')
    .optional()
    .isIn(['percentage', 'fixed'])
    .withMessage('discount_type must be either "percentage" or "fixed".'),

  body('discount_value')
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage('discount_value must be a positive number greater than 0.')
    .bail()
    .custom((val, { req }) => {
      if (req.body.discount_type === 'percentage' && parseFloat(val) > 100) {
        throw new Error('Percentage discount cannot exceed 100%.');
      }
      return true;
    }),

  body('minimum_order_amount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('minimum_order_amount must be 0 or a positive number.'),

  body('maximum_discount_amount')
    .optional({ nullable: true })
    .isFloat({ min: 0.01 })
    .withMessage('maximum_discount_amount must be a positive number.'),

  body('usage_limit')
    .optional({ nullable: true })
    .isInt({ min: 1 })
    .withMessage('usage_limit must be a positive integer of at least 1.'),

  body('usage_limit_per_customer')
    .optional({ nullable: true })
    .isInt({ min: 1 })
    .withMessage('usage_limit_per_customer must be a positive integer of at least 1.'),

  body('starts_at')
    .optional({ nullable: true })
    .isISO8601()
    .withMessage('starts_at must be a valid date/time format.'),

  body('expires_at')
    .optional({ nullable: true })
    .isISO8601()
    .withMessage('expires_at must be a valid date/time format.')
    .bail()
    .custom((expiresAt, { req }) => {
      if (expiresAt && req.body.starts_at) {
        const start = new Date(req.body.starts_at);
        const expire = new Date(expiresAt);
        if (expire < start) {
          throw new Error('expires_at must be equal to or later than starts_at.');
        }
      }
      return true;
    }),

  body('is_active')
    .optional()
    .isBoolean()
    .withMessage('is_active must be a boolean.'),

  validate,
];

const validateCouponStatus = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Coupon ID must be a positive integer.'),

  body('is_active')
    .notEmpty()
    .withMessage('is_active is required.')
    .bail()
    .isBoolean()
    .withMessage('is_active must be a boolean.'),

  validate,
];

const validateCouponCode = [
  body('code')
    .trim()
    .notEmpty()
    .withMessage('Coupon code is required.')
    .bail()
    .isLength({ min: 2, max: 50 })
    .withMessage('Coupon code must be between 2 and 50 characters.'),

  validate,
];

module.exports = {
  validateCreateCoupon,
  validateUpdateCoupon,
  validateCouponStatus,
  validateCouponCode,
};
