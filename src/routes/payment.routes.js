/**
 * IBTU E-Commerce Backend
 * src/routes/payment.routes.js
 *
 * Customer Payment & Receipt Routes
 */

const express = require('express');
const router = express.Router();
const PaymentController = require('../controllers/payment.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { handleReceiptUpload } = require('../middleware/payment-upload.middleware');
const { validatePaymentId } = require('../validators/payment.validator');

// Public / Authenticated: Payment Instructions
router.get('/instructions', PaymentController.getInstructions);

// All subsequent routes require user authentication
router.use(authenticate);

// POST /api/payments/:paymentId/receipt (Customer uploads payment receipt image)
router.post(
  '/:paymentId/receipt',
  validatePaymentId,
  handleReceiptUpload,
  PaymentController.uploadReceipt
);

// GET /api/payments/:paymentId (Customer views payment status and details)
router.get('/:paymentId', validatePaymentId, PaymentController.getPaymentDetails);

// GET /api/payments/:paymentId/receipt (Securely streams receipt image to owner or Admin)
router.get('/:paymentId/receipt', validatePaymentId, PaymentController.viewReceipt);

module.exports = router;
