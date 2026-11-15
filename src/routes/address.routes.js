/**
 * IBTU E-Commerce Backend
 * src/routes/address.routes.js
 *
 * Customer Address Routes
 * All endpoints require customer authentication.
 */

const express = require('express');
const { authenticate } = require('../middleware/auth.middleware');
const AppError = require('../utils/app-error');
const AddressController = require('../controllers/address.controller');
const {
  validateAddressIdParam,
  validateCreateAddress,
  validateUpdateAddress,
} = require('../validators/address.validator');

const router = express.Router();

/**
 * Middleware: Verify caller is an authenticated customer account
 */
function authorizeCustomer(req, res, next) {
  if (!req.user) {
    return next(AppError.unauthorized('Authentication required.'));
  }
  const roles = (req.user.roles || (req.user.role ? [req.user.role] : [])).map((r) =>
    String(r).toLowerCase()
  );

  if (!roles.includes('customer')) {
    return next(
      AppError.forbidden('Access denied. Address management is available only to customer accounts.')
    );
  }
  next();
}

// All address routes require authentication and customer role
router.use(authenticate, authorizeCustomer);

// GET /api/addresses - List all saved addresses for the customer
router.get('/', AddressController.listAddresses);

// GET /api/addresses/:id - Get a single address
router.get('/:id', validateAddressIdParam, AddressController.getAddress);

// POST /api/addresses - Create a new address
router.post('/', validateCreateAddress, AddressController.createAddress);

// PUT /api/addresses/:id - Update an address
router.put('/:id', validateUpdateAddress, AddressController.updateAddress);

// DELETE /api/addresses/:id - Delete an address
router.delete('/:id', validateAddressIdParam, AddressController.deleteAddress);

// PATCH /api/addresses/:id/default - Set as default address
router.patch('/:id/default', validateAddressIdParam, AddressController.setDefault);

module.exports = router;
