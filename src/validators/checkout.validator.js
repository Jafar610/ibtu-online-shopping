/**
 * IBTU E-Commerce Backend
 * src/validators/checkout.validator.js
 *
 * Input Validation for Checkout & Order Creation
 */

const { body } = require('express-validator');
const validate = require('../middleware/validate');

const ALLOWED_PAYMENT_METHODS = ['telebirr', 'cbe_birr', 'bank_transfer', 'cash_on_delivery'];

const validateCheckoutPreview = [
  body('shipping_address_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('shipping_address_id must be a positive integer.'),
  validate,
];

const validateCreateOrder = [
  body('shipping_address_id')
    .notEmpty()
    .withMessage('shipping_address_id is required.')
    .bail()
    .isInt({ min: 1 })
    .withMessage('shipping_address_id must be a positive integer.'),

  body('payment_method')
    .notEmpty()
    .withMessage('payment_method is required.')
    .bail()
    .isIn(ALLOWED_PAYMENT_METHODS)
    .withMessage(`payment_method must be one of: ${ALLOWED_PAYMENT_METHODS.join(', ')}.`),

  body('customer_notes')
    .optional({ checkFalsy: true })
    .isString()
    .withMessage('customer_notes must be a string.')
    .isLength({ max: 500 })
    .withMessage('customer_notes cannot exceed 500 characters.'),

  validate,
];

module.exports = {
  validateCheckoutPreview,
  validateCreateOrder,
  ALLOWED_PAYMENT_METHODS,
};
