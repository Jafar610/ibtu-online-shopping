/**
 * IBTU E-Commerce Backend
 * src/validators/order.validator.js
 *
 * Input Validation for Order Management & Status Transitions
 */

const { body, param, query } = require('express-validator');
const validate = require('../middleware/validate');

const ALLOWED_ORDER_STATUSES = [
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
  'refunded',
];

const validateOrderId = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Order ID must be a positive integer.'),
  validate,
];

const validateUpdateOrderStatus = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Order ID must be a positive integer.'),

  body('status')
    .notEmpty()
    .withMessage('status is required.')
    .bail()
    .isIn(ALLOWED_ORDER_STATUSES)
    .withMessage(`status must be one of: ${ALLOWED_ORDER_STATUSES.join(', ')}.`),

  body('admin_notes')
    .optional({ checkFalsy: true })
    .isString()
    .isLength({ max: 500 })
    .withMessage('admin_notes cannot exceed 500 characters.'),

  validate,
];

const validateCancelOrder = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Order ID must be a positive integer.'),

  body('cancellation_reason')
    .trim()
    .notEmpty()
    .withMessage('cancellation_reason is required.')
    .bail()
    .isLength({ min: 3, max: 500 })
    .withMessage('cancellation_reason must be between 3 and 500 characters.'),

  validate,
];

module.exports = {
  ALLOWED_ORDER_STATUSES,
  validateOrderId,
  validateUpdateOrderStatus,
  validateCancelOrder,
};
