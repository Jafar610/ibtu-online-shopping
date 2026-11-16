/**
 * IBTU E-Commerce Backend
 * src/services/payment.service.js
 *
 * Payment Service & Verification Operations
 *
 * Handles:
 *  - Customer payment receipt uploads with security checks.
 *  - Shop owner / Admin receipt review (approve / reject).
 *  - Race condition prevention using SELECT ... FOR UPDATE transactions.
 *  - Audit logging of approval and rejection actions.
 *  - Customer notification triggers.
 *  - Private receipt streaming with role-based access control.
 */

const path = require('path');
const fs = require('fs');
const { pool } = require('../config/database');
const AppError = require('../utils/app-error');
const NotificationService = require('./notification.service');
const { receiptStorageDir } = require('../config/payment-upload');

class PaymentService {
  /**
   * Helper to parse transaction_response JSON safely
   */
  static parseTransactionResponse(raw) {
    if (!raw) return {};
    if (typeof raw === 'object') return raw;
    try {
      return JSON.parse(raw);
    } catch {
      return {};
    }
  }

  /**
   * Customer uploads payment receipt
   */
  static async uploadReceipt(userId, paymentId, file) {
    if (!file) {
      throw AppError.badRequest('Please upload a valid receipt image.');
    }

    // 1. Fetch payment and parent order
    const [[payment]] = await pool.query(
      `SELECT
         p.*,
         o.user_id,
         o.order_number,
         o.customer_name,
         o.customer_email,
         o.customer_phone,
         o.total_amount,
         o.order_status
       FROM payments p
       JOIN orders o ON p.order_id = o.id
       WHERE p.id = ?`,
      [paymentId]
    );

    if (!payment) {
      // Clean up uploaded file if payment doesn't exist
      if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
      throw AppError.notFound('Payment record not found.');
    }

    // Verify ownership
    if (payment.user_id !== userId) {
      if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
      throw AppError.forbidden('Access denied. You do not own this order or payment.');
    }

    // Check payment method
    if (payment.payment_method === 'cash_on_delivery') {
      if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
      throw AppError.badRequest('Cash on delivery orders do not require a payment receipt.');
    }

    // Check payment status
    if (payment.payment_status === 'successful') {
      if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
      throw AppError.badRequest('Payment has already been approved and cannot be updated.');
    }

    const txData = this.parseTransactionResponse(payment.transaction_response);

    // Prevent duplicate upload if currently awaiting review
    if (txData.verification_status === 'awaiting_review') {
      if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
      throw AppError.badRequest(
        'A payment receipt has already been submitted and is currently awaiting review by the shop owner.'
      );
    }

    // Prepare updated metadata
    const history = Array.isArray(txData.history) ? txData.history : [];
    history.push({
      action: 'receipt_uploaded',
      filename: file.filename,
      original_name: file.originalname,
      uploaded_at: new Date().toISOString(),
    });

    const updatedTx = {
      ...txData,
      verification_status: 'awaiting_review',
      receipt_filename: file.filename,
      receipt_original_name: file.originalname,
      receipt_mime_type: file.mimetype,
      receipt_size: file.size,
      uploaded_at: new Date().toISOString(),
      rejection_reason: null, // Clear past rejection on resubmission
      history,
    };

    // Update payment record in database
    await pool.query(
      `UPDATE payments
       SET payment_status = 'processing',
           transaction_response = ?,
           updated_at = NOW()
       WHERE id = ?`,
      [JSON.stringify(updatedTx), paymentId]
    );

    // Notify shop owner
    await NotificationService.notifyReceiptUploaded({
      orderId: payment.order_id,
      orderNumber: payment.order_number,
      paymentId: payment.id,
      paymentReference: payment.payment_reference,
      customerName: payment.customer_name,
      amount: payment.amount,
    });

    return {
      payment_id: payment.id,
      order_id: payment.order_id,
      order_number: payment.order_number,
      payment_reference: payment.payment_reference,
      payment_method: payment.payment_method,
      amount: parseFloat(payment.amount),
      currency: payment.currency,
      payment_status: 'processing',
      verification_status: 'awaiting_review',
      uploaded_at: updatedTx.uploaded_at,
      receipt_filename: file.filename,
      message:
        'Payment receipt uploaded successfully. Your payment is now awaiting shop owner verification.',
    };
  }

  /**
   * Shop Owner / Admin: Retrieve all pending payments awaiting verification
   */
  static async getPendingPayments() {
    const [rows] = await pool.query(
      `SELECT
         p.id AS payment_id,
         p.order_id,
         p.payment_reference,
         p.payment_method,
         p.payment_provider,
         p.amount,
         p.currency,
         p.payment_status,
         p.transaction_response,
         p.created_at,
         o.order_number,
         o.customer_name,
         o.customer_email,
         o.customer_phone,
         o.order_status,
         o.placed_at
       FROM payments p
       JOIN orders o ON p.order_id = o.id
       WHERE p.payment_method != 'cash_on_delivery'
         AND p.payment_status != 'successful'
       ORDER BY p.updated_at DESC, p.created_at DESC`
    );

    const pending = [];

    for (const row of rows) {
      const tx = this.parseTransactionResponse(row.transaction_response);
      const verificationStatus = tx.verification_status || 'pending_upload';

      // Include payments awaiting review or pending upload
      pending.push({
        payment_id: row.payment_id,
        order_id: row.order_id,
        order_number: row.order_number,
        payment_reference: row.payment_reference,
        customer_name: row.customer_name,
        customer_email: row.customer_email,
        customer_phone: row.customer_phone,
        payment_method: row.payment_method,
        payment_provider: row.payment_provider,
        amount_expected: parseFloat(row.amount),
        currency: row.currency,
        order_status: row.order_status,
        payment_status: row.payment_status,
        verification_status: verificationStatus,
        receipt_filename: tx.receipt_filename || null,
        receipt_uploaded_at: tx.uploaded_at || null,
        rejection_reason: tx.rejection_reason || null,
        created_at: row.created_at,
      });
    }

    return pending;
  }

  /**
   * Get payment details (Accessible to Admin or owning Customer)
   */
  static async getPaymentDetails(paymentId, user) {
    const [[payment]] = await pool.query(
      `SELECT
         p.*,
         o.user_id,
         o.order_number,
         o.customer_name,
         o.customer_email,
         o.customer_phone,
         o.total_amount,
         o.order_status,
         o.payment_status AS order_payment_status,
         o.placed_at
       FROM payments p
       JOIN orders o ON p.order_id = o.id
       WHERE p.id = ?`,
      [paymentId]
    );

    if (!payment) {
      throw AppError.notFound('Payment record not found.');
    }

    const isAdmin = user.roles && user.roles.includes('Admin');
    if (!isAdmin && payment.user_id !== user.id) {
      throw AppError.forbidden('Access denied. You do not have permission to view this payment.');
    }

    const tx = this.parseTransactionResponse(payment.transaction_response);

    return {
      payment_id: payment.id,
      order_id: payment.order_id,
      order_number: payment.order_number,
      payment_reference: payment.payment_reference,
      payment_method: payment.payment_method,
      payment_provider: payment.payment_provider,
      amount: parseFloat(payment.amount),
      currency: payment.currency,
      payment_status: payment.payment_status,
      order_payment_status: payment.order_payment_status,
      order_status: payment.order_status,
      verification_status: tx.verification_status || 'pending',
      receipt_uploaded: Boolean(tx.receipt_filename),
      receipt_filename: tx.receipt_filename || null,
      receipt_url: tx.receipt_filename
        ? `/api/payments/${payment.id}/receipt`
        : null,
      uploaded_at: tx.uploaded_at || null,
      reviewed_by: tx.reviewed_by_name || null,
      reviewed_at: tx.reviewed_at || null,
      rejection_reason: tx.rejection_reason || null,
      paid_at: payment.paid_at,
      history: tx.history || [],
      created_at: payment.created_at,
    };
  }

  /**
   * Shop Owner / Admin: Approve Payment
   */
  static async approvePayment(paymentId, adminUser, ipAddress = null) {
    const conn = await pool.getConnection();

    try {
      await conn.beginTransaction();

      // 1. Lock payment row to prevent race conditions
      const [[payment]] = await conn.query(
        `SELECT
           p.*,
           o.id AS order_id,
           o.order_number,
           o.customer_email,
           o.customer_phone,
           o.order_status,
           o.payment_status AS order_payment_status,
           o.total_amount
         FROM payments p
         JOIN orders o ON p.order_id = o.id
         WHERE p.id = ?
         FOR UPDATE`,
        [paymentId]
      );

      if (!payment) {
        throw AppError.notFound('Payment record not found.');
      }

      // Check if already approved
      if (payment.payment_status === 'successful') {
        throw AppError.badRequest('Payment has already been approved.');
      }

      const tx = this.parseTransactionResponse(payment.transaction_response);

      // Verify that receipt is awaiting review
      if (tx.verification_status !== 'awaiting_review') {
        throw AppError.badRequest(
          `Payment cannot be approved. Current verification status is "${tx.verification_status || 'pending'}". A valid receipt must be awaiting review.`
        );
      }

      const history = Array.isArray(tx.history) ? tx.history : [];
      const adminName = `${adminUser.first_name || 'Admin'} ${adminUser.last_name || ''}`.trim();

      history.push({
        action: 'payment_approved',
        admin_id: adminUser.id,
        admin_name: adminName,
        timestamp: new Date().toISOString(),
      });

      const updatedTx = {
        ...tx,
        verification_status: 'successful',
        reviewed_by: adminUser.id,
        reviewed_by_name: adminName,
        reviewed_at: new Date().toISOString(),
        history,
      };

      // 2. Update Payment
      await conn.query(
        `UPDATE payments
         SET payment_status = 'successful',
             paid_at = NOW(),
             transaction_response = ?,
             updated_at = NOW()
         WHERE id = ?`,
        [JSON.stringify(updatedTx), paymentId]
      );

      // Rollback test hook
      if (adminUser && adminUser._simulateRollback) {
        throw new Error('SIMULATED_TRANSACTION_ROLLBACK_TEST');
      }

      // 3. Update Order status
      await conn.query(
        `UPDATE orders
         SET payment_status = 'paid',
             order_status = 'confirmed',
             updated_at = NOW()
         WHERE id = ?`,
        [payment.order_id]
      );

      // 4. Record Audit Log
      await conn.query(
        `INSERT INTO audit_logs (
           user_id,
           action,
           entity_type,
           entity_id,
           description,
           old_values,
           new_values,
           ip_address
         ) VALUES (?, 'PAYMENT_APPROVE', 'payment', ?, ?, ?, ?, ?)`,
        [
          adminUser.id,
          paymentId,
          `Admin ${adminName} approved payment for Order #${payment.order_number}`,
          JSON.stringify({
            payment_status: payment.payment_status,
            order_payment_status: payment.order_payment_status,
            verification_status: tx.verification_status,
          }),
          JSON.stringify({
            payment_status: 'successful',
            order_payment_status: 'paid',
            order_status: 'confirmed',
            verification_status: 'successful',
          }),
          ipAddress,
        ]
      );

      await conn.commit();

      // 5. Notify customer
      await NotificationService.notifyPaymentApproved({
        orderId: payment.order_id,
        orderNumber: payment.order_number,
        customerEmail: payment.customer_email,
        customerPhone: payment.customer_phone,
        paymentReference: payment.payment_reference,
        amount: payment.amount,
      });

      return {
        payment_id: payment.id,
        order_id: payment.order_id,
        order_number: payment.order_number,
        payment_status: 'successful',
        order_status: 'confirmed',
        order_payment_status: 'paid',
        verification_status: 'successful',
        approved_by: adminName,
        approved_at: updatedTx.reviewed_at,
        message: 'Payment has been successfully approved and the order is confirmed.',
      };
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  }

  /**
   * Shop Owner / Admin: Reject Payment
   */
  static async rejectPayment(paymentId, adminUser, rejectionReason, ipAddress = null) {
    if (!rejectionReason || typeof rejectionReason !== 'string' || rejectionReason.trim().length === 0) {
      throw AppError.badRequest('Rejection reason is required.');
    }

    const conn = await pool.getConnection();

    try {
      await conn.beginTransaction();

      // 1. Lock payment row
      const [[payment]] = await conn.query(
        `SELECT
           p.*,
           o.id AS order_id,
           o.order_number,
           o.customer_email,
           o.customer_phone,
           o.order_status,
           o.payment_status AS order_payment_status
         FROM payments p
         JOIN orders o ON p.order_id = o.id
         WHERE p.id = ?
         FOR UPDATE`,
        [paymentId]
      );

      if (!payment) {
        throw AppError.notFound('Payment record not found.');
      }

      if (payment.payment_status === 'successful') {
        throw AppError.badRequest('Payment has already been approved and cannot be rejected.');
      }

      const tx = this.parseTransactionResponse(payment.transaction_response);

      if (tx.verification_status !== 'awaiting_review') {
        throw AppError.badRequest(
          `Payment cannot be rejected. Current verification status is "${tx.verification_status || 'pending'}". Only payments awaiting review can be rejected.`
        );
      }

      const history = Array.isArray(tx.history) ? tx.history : [];
      const adminName = `${adminUser.first_name || 'Admin'} ${adminUser.last_name || ''}`.trim();

      history.push({
        action: 'payment_rejected',
        admin_id: adminUser.id,
        admin_name: adminName,
        reason: rejectionReason.trim(),
        timestamp: new Date().toISOString(),
      });

      const updatedTx = {
        ...tx,
        verification_status: 'rejected',
        rejection_reason: rejectionReason.trim(),
        reviewed_by: adminUser.id,
        reviewed_by_name: adminName,
        reviewed_at: new Date().toISOString(),
        history,
      };

      // 2. Update Payment (mark failed/rejected while leaving order unpaid for resubmission)
      await conn.query(
        `UPDATE payments
         SET payment_status = 'failed',
             transaction_response = ?,
             updated_at = NOW()
         WHERE id = ?`,
        [JSON.stringify(updatedTx), paymentId]
      );

      // 3. Ensure Order payment status remains unpaid
      await conn.query(
        `UPDATE orders
         SET payment_status = 'unpaid',
             updated_at = NOW()
         WHERE id = ?`,
        [payment.order_id]
      );

      // 4. Record Audit Log
      await conn.query(
        `INSERT INTO audit_logs (
           user_id,
           action,
           entity_type,
           entity_id,
           description,
           old_values,
           new_values,
           ip_address
         ) VALUES (?, 'PAYMENT_REJECT', 'payment', ?, ?, ?, ?, ?)`,
        [
          adminUser.id,
          paymentId,
          `Admin ${adminName} rejected payment for Order #${payment.order_number}. Reason: ${rejectionReason.trim()}`,
          JSON.stringify({
            payment_status: payment.payment_status,
            verification_status: tx.verification_status,
          }),
          JSON.stringify({
            payment_status: 'failed',
            verification_status: 'rejected',
            rejection_reason: rejectionReason.trim(),
          }),
          ipAddress,
        ]
      );

      await conn.commit();

      // 5. Notify Customer
      await NotificationService.notifyPaymentRejected({
        orderId: payment.order_id,
        orderNumber: payment.order_number,
        customerEmail: payment.customer_email,
        customerPhone: payment.customer_phone,
        paymentReference: payment.payment_reference,
        rejectionReason: rejectionReason.trim(),
      });

      return {
        payment_id: payment.id,
        order_id: payment.order_id,
        order_number: payment.order_number,
        payment_status: 'failed',
        order_payment_status: 'unpaid',
        verification_status: 'rejected',
        rejection_reason: rejectionReason.trim(),
        rejected_by: adminName,
        rejected_at: updatedTx.reviewed_at,
        resubmission_allowed: true,
        message:
          'Payment has been rejected. The customer has been notified and may resubmit a valid receipt.',
      };
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  }

  /**
   * Secure receipt file stream path (Verifies access rights)
   */
  static async getReceiptFilePath(paymentId, user) {
    const [[payment]] = await pool.query(
      `SELECT p.id, p.transaction_response, o.user_id
       FROM payments p
       JOIN orders o ON p.order_id = o.id
       WHERE p.id = ?`,
      [paymentId]
    );

    if (!payment) {
      throw AppError.notFound('Payment record not found.');
    }

    const isAdmin = user.roles && user.roles.includes('Admin');
    if (!isAdmin && payment.user_id !== user.id) {
      throw AppError.forbidden('Access denied. You do not have permission to view this receipt.');
    }

    const tx = this.parseTransactionResponse(payment.transaction_response);
    if (!tx.receipt_filename) {
      throw AppError.notFound('No receipt has been uploaded for this payment.');
    }

    const absolutePath = path.join(receiptStorageDir, tx.receipt_filename);
    if (!fs.existsSync(absolutePath)) {
      throw AppError.notFound('Receipt file does not exist on storage.');
    }

    return {
      filePath: absolutePath,
      mimeType: tx.receipt_mime_type || 'image/jpeg',
      filename: tx.receipt_filename,
    };
  }
}

module.exports = PaymentService;
