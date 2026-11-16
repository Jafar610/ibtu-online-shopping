/**
 * IBTU E-Commerce Backend
 * src/controllers/payment.controller.js
 *
 * Payment Controller
 * Handles customer receipt uploads, payment status queries, and Admin review/approvals.
 */

const PaymentService = require('../services/payment.service');
const PaymentInstructions = require('../config/payment-instructions');
const ApiResponse = require('../utils/api-response');

class PaymentController {
  /**
   * GET /api/payments/instructions
   * Retrieve active payment instructions
   */
  static getInstructions(req, res, next) {
    try {
      const instructions = PaymentInstructions.getAll();
      return ApiResponse.success(res, 'Payment instructions retrieved successfully.', instructions);
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/payments/:paymentId/receipt
   * Customer uploads payment receipt image
   */
  static async uploadReceipt(req, res, next) {
    try {
      const paymentId = parseInt(req.params.paymentId, 10);
      const result = await PaymentService.uploadReceipt(req.user.id, paymentId, req.file);

      return ApiResponse.success(res, result.message, result);
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/payments/:paymentId
   * Retrieve customer payment status and details
   */
  static async getPaymentDetails(req, res, next) {
    try {
      const paymentId = parseInt(req.params.paymentId, 10);
      const details = await PaymentService.getPaymentDetails(paymentId, req.user);

      return ApiResponse.success(res, 'Payment details retrieved successfully.', details);
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/payments/:paymentId/receipt
   * Securely stream receipt image file to authorized user
   */
  static async viewReceipt(req, res, next) {
    try {
      const paymentId = parseInt(req.params.paymentId, 10);
      const { filePath, mimeType } = await PaymentService.getReceiptFilePath(paymentId, req.user);

      res.setHeader('Content-Type', mimeType);
      res.setHeader('Cache-Control', 'private, max-age=3600');
      return res.sendFile(filePath);
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/admin/payments/pending
   * Shop Owner / Admin: Retrieve pending payments awaiting review
   */
  static async getPendingPayments(req, res, next) {
    try {
      const pending = await PaymentService.getPendingPayments();
      return ApiResponse.success(res, 'Pending payments retrieved successfully.', {
        total: pending.length,
        payments: pending,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * PATCH /api/admin/payments/:paymentId/approve
   * Shop Owner / Admin: Approve verified payment
   */
  static async approvePayment(req, res, next) {
    try {
      const paymentId = parseInt(req.params.paymentId, 10);
      const result = await PaymentService.approvePayment(paymentId, req.user, req.ip);

      return ApiResponse.success(res, result.message, result);
    } catch (err) {
      next(err);
    }
  }

  /**
   * PATCH /api/admin/payments/:paymentId/reject
   * Shop Owner / Admin: Reject payment with reason
   */
  static async rejectPayment(req, res, next) {
    try {
      const paymentId = parseInt(req.params.paymentId, 10);
      const { rejection_reason } = req.body;

      const result = await PaymentService.rejectPayment(
        paymentId,
        req.user,
        rejection_reason,
        req.ip
      );

      return ApiResponse.success(res, result.message, result);
    } catch (err) {
      next(err);
    }
  }

  /**
   * PUT /api/admin/payments/instructions/:method
   * Shop Owner / Admin: Update configurable payment instructions
   */
  static updateInstructions(req, res, next) {
    try {
      const { method } = req.params;
      const updated = PaymentInstructions.update(method, req.body);
      return ApiResponse.success(res, `Payment instructions for ${method} updated successfully.`, updated);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = PaymentController;
