/**
 * IBTU E-Commerce Backend
 * src/validators/payment.validator.js
 *
 * Input Validation for Payment Review & Management
 */

const { body, param } = require('express-validator');
const validate = require('../middleware/validate');

const validatePaymentId = [
  param('paymentId')
    .isInt({ min: 1 })
    .withMessage('paymentId must be a positive integer.'),
  validate,
];

const validateRejectPayment = [
  param('paymentId')
    .isInt({ min: 1 })
    .withMessage('paymentId must be a positive integer.'),

  body('rejection_reason')
    .trim()
    .notEmpty()
    .withMessage('rejection_reason is required.')
    .bail()
    .isLength({ min: 3, max: 500 })
    .withMessage('rejection_reason must be between 3 and 500 characters.'),

  validate,
];

const validateUpdateInstructions = [
  param('method')
    .isIn(['telebirr', 'cbe_birr', 'bank_transfer', 'cash_on_delivery'])
    .withMessage('Invalid payment method.'),

  body('instructions')
    .optional()
    .isString()
    .isLength({ min: 5, max: 1000 })
    .withMessage('instructions must be between 5 and 1000 characters.'),

  body('account_name')
    .optional()
    .isString()
    .isLength({ min: 2, max: 150 })
    .withMessage('account_name must be between 2 and 150 characters.'),

  body('account_number')
    .optional()
    .isString()
    .isLength({ min: 2, max: 100 })
    .withMessage('account_number must be between 2 and 100 characters.'),

  body('bank_name')
    .optional()
    .isString()
    .isLength({ min: 2, max: 150 })
    .withMessage('bank_name must be between 2 and 150 characters.'),

  body('branch')
    .optional()
    .isString()
    .isLength({ min: 2, max: 150 })
    .withMessage('branch must be between 2 and 150 characters.'),

  validate,
];

module.exports = {
  validatePaymentId,
  validateRejectPayment,
  validateUpdateInstructions,
};
