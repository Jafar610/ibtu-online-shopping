/**
 * IBTU E-Commerce Backend
 * src/validators/shipment.validator.js
 *
 * Input Validation for Shipment Management & Tracking
 */

const { body, param } = require('express-validator');
const validate = require('../middleware/validate');

const ALLOWED_SHIPMENT_STATUSES = [
  'pending',
  'processing',
  'shipped',
  'in_transit',
  'out_for_delivery',
  'delivered',
  'failed',
  'returned',
  'cancelled',
];

const validateCreateShipment = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Order ID must be a positive integer.'),

  body('courier_name')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ min: 2, max: 150 })
    .withMessage('courier_name must be between 2 and 150 characters.'),

  body('courier_phone')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ min: 5, max: 30 })
    .withMessage('courier_phone must be between 5 and 30 characters.'),

  body('tracking_number')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ min: 3, max: 150 })
    .withMessage('tracking_number must be between 3 and 150 characters.'),

  body('estimated_delivery_date')
    .optional({ checkFalsy: true })
    .isISO8601()
    .withMessage('estimated_delivery_date must be a valid ISO date format.'),

  body('shipping_cost')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('shipping_cost must be 0 or a positive number.'),

  body('delivery_notes')
    .optional({ checkFalsy: true })
    .isString()
    .isLength({ max: 500 })
    .withMessage('delivery_notes cannot exceed 500 characters.'),

  validate,
];

const validateUpdateShipmentStatus = [
  param('shipmentId')
    .isInt({ min: 1 })
    .withMessage('shipmentId must be a positive integer.'),

  body('status')
    .notEmpty()
    .withMessage('status is required.')
    .bail()
    .isIn(ALLOWED_SHIPMENT_STATUSES)
    .withMessage(`status must be one of: ${ALLOWED_SHIPMENT_STATUSES.join(', ')}.`),

  body('delivery_notes')
    .optional({ checkFalsy: true })
    .isString()
    .isLength({ max: 500 })
    .withMessage('delivery_notes cannot exceed 500 characters.'),

  validate,
];

module.exports = {
  ALLOWED_SHIPMENT_STATUSES,
  validateCreateShipment,
  validateUpdateShipmentStatus,
};
