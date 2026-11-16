/**
 * IBTU E-Commerce Backend
 * src/routes/admin-payment.routes.js
 *
 * Shop Owner / Admin Payment Review & Verification Routes
 * Enforces authentication and Admin role check.
 */

const express = require('express');
const router = express.Router();
const PaymentController = require('../controllers/payment.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/permission.middleware');
const {
  validatePaymentId,
  validateRejectPayment,
  validateUpdateInstructions,
} = require('../validators/payment.validator');

// All admin payment routes require authentication and Admin role
router.use(authenticate);
router.use(requireRole('Admin'));

// GET /api/admin/payments/pending
router.get('/pending', PaymentController.getPendingPayments);

// GET /api/admin/payments/:paymentId
router.get('/:paymentId', validatePaymentId, PaymentController.getPaymentDetails);

// GET /api/admin/payments/:paymentId/receipt
router.get('/:paymentId/receipt', validatePaymentId, PaymentController.viewReceipt);

// PATCH /api/admin/payments/:paymentId/approve
router.patch('/:paymentId/approve', validatePaymentId, PaymentController.approvePayment);

// PATCH /api/admin/payments/:paymentId/reject
router.patch('/:paymentId/reject', validateRejectPayment, PaymentController.rejectPayment);

// PUT /api/admin/payments/instructions/:method
router.put('/instructions/:method', validateUpdateInstructions, PaymentController.updateInstructions);

module.exports = router;
