/**
 * IBTU E-Commerce Backend
 * src/validators/address.validator.js
 *
 * Input validation for Customer Address Management endpoints.
 */

const { body, param } = require('express-validator');

const validateAddressIdParam = [
  param('id')
    .notEmpty()
    .withMessage('Address ID is required')
    .isInt({ min: 1 })
    .withMessage('Address ID must be a positive integer')
    .toInt(),
];

const validateCreateAddress = [
  body('address_type')
    .optional()
    .isIn(['home', 'work', 'other'])
    .withMessage('address_type must be one of: home, work, other'),
  body('recipient_name')
    .trim()
    .notEmpty()
    .withMessage('recipient_name is required')
    .isLength({ min: 2, max: 150 })
    .withMessage('recipient_name must be between 2 and 150 characters'),
  body('phone')
    .trim()
    .notEmpty()
    .withMessage('phone is required')
    .matches(/^[+0-9\s\-()]{7,30}$/)
    .withMessage('phone must be a valid phone number (7 to 30 characters)'),
  body('address_line1')
    .trim()
    .notEmpty()
    .withMessage('address_line1 is required')
    .isLength({ max: 255 })
    .withMessage('address_line1 cannot exceed 255 characters'),
  body('address_line2')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 255 })
    .withMessage('address_line2 cannot exceed 255 characters'),
  body('city')
    .trim()
    .notEmpty()
    .withMessage('city is required')
    .isLength({ max: 100 })
    .withMessage('city cannot exceed 100 characters'),
  body('region')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 100 })
    .withMessage('region cannot exceed 100 characters'),
  body('postal_code')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 20 })
    .withMessage('postal_code cannot exceed 20 characters'),
  body('country')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('country cannot exceed 100 characters'),
  body('is_default')
    .optional()
    .isBoolean()
    .withMessage('is_default must be a boolean')
    .toBoolean(),
];

const validateUpdateAddress = [
  ...validateAddressIdParam,
  body('address_type')
    .optional()
    .isIn(['home', 'work', 'other'])
    .withMessage('address_type must be one of: home, work, other'),
  body('recipient_name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 150 })
    .withMessage('recipient_name must be between 2 and 150 characters'),
  body('phone')
    .optional()
    .trim()
    .matches(/^[+0-9\s\-()]{7,30}$/)
    .withMessage('phone must be a valid phone number (7 to 30 characters)'),
  body('address_line1')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('address_line1 cannot be empty')
    .isLength({ max: 255 })
    .withMessage('address_line1 cannot exceed 255 characters'),
  body('address_line2')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 255 })
    .withMessage('address_line2 cannot exceed 255 characters'),
  body('city')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('city cannot be empty')
    .isLength({ max: 100 })
    .withMessage('city cannot exceed 100 characters'),
  body('region')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 100 })
    .withMessage('region cannot exceed 100 characters'),
  body('postal_code')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 20 })
    .withMessage('postal_code cannot exceed 20 characters'),
  body('country')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('country cannot exceed 100 characters'),
  body('is_default')
    .optional()
    .isBoolean()
    .withMessage('is_default must be a boolean')
    .toBoolean(),
];

module.exports = {
  validateAddressIdParam,
  validateCreateAddress,
  validateUpdateAddress,
};
