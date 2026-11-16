/**
 * IBTU E-Commerce Backend
 * src/routes/checkout.routes.js
 *
 * Checkout & Order Placement Routes
 */

const express = require('express');
const router = express.Router();
const CheckoutController = require('../controllers/checkout.controller');
const { authenticate } = require('../middleware/auth.middleware');
const {
  validateCheckoutPreview,
  validateCreateOrder,
} = require('../validators/checkout.validator');

// All checkout endpoints require customer authentication
router.use(authenticate);

// POST /api/checkout/preview
router.post('/preview', validateCheckoutPreview, CheckoutController.preview);

// POST /api/checkout/orders
router.post('/orders', validateCreateOrder, CheckoutController.createOrder);

module.exports = router;
