/**
 * IBTU E-Commerce Backend
 * src/services/notification.service.js
 *
 * Notification Service
 * Dispatches notification events for payment lifecycle events:
 *  - Receipt uploaded (alerts shop owner)
 *  - Payment approved (notifies customer)
 *  - Payment rejected (notifies customer with rejection reason)
 *  - Receipt resubmission requested
 *
 * Currently logs events cleanly to server console/logs and serves as the integration
 * bridge for future SMS (e.g. Ethio Telecom), Email (SMTP/SES), or WebPush services.
 */

class NotificationService {
  /**
   * Notify shop owner that a customer uploaded a payment receipt
   */
  static async notifyReceiptUploaded({ orderId, orderNumber, paymentId, paymentReference, customerName, amount }) {
    const payload = {
      type: 'PAYMENT_RECEIPT_UPLOADED',
      recipient: 'admin',
      title: 'New Payment Receipt Awaiting Review',
      message: `Customer ${customerName} uploaded a receipt for Order #${orderNumber} (${amount} ETB, Ref: ${paymentReference}).`,
      orderId,
      paymentId,
      timestamp: new Date().toISOString(),
    };

    console.log(`[NOTIFICATION:ADMIN] ${payload.title} - ${payload.message}`);
    return { dispatched: true, channel: 'in_app_log', payload };
  }

  /**
   * Notify customer that payment was approved
   */
  static async notifyPaymentApproved({ orderId, orderNumber, customerEmail, customerPhone, paymentReference, amount }) {
    const payload = {
      type: 'PAYMENT_APPROVED',
      recipient: customerEmail || customerPhone,
      title: 'Payment Approved - Order Confirmed',
      message: `Your payment of ${amount} ETB for Order #${orderNumber} (Ref: ${paymentReference}) has been verified and approved. Your order is now confirmed!`,
      orderId,
      timestamp: new Date().toISOString(),
    };

    console.log(`[NOTIFICATION:CUSTOMER] ${payload.title} -> ${payload.recipient} - ${payload.message}`);
    return { dispatched: true, channel: 'in_app_log', payload };
  }

  /**
   * Notify customer that payment was rejected
   */
  static async notifyPaymentRejected({ orderId, orderNumber, customerEmail, customerPhone, paymentReference, rejectionReason }) {
    const payload = {
      type: 'PAYMENT_REJECTED',
      recipient: customerEmail || customerPhone,
      title: 'Payment Verification Action Required',
      message: `Your payment receipt for Order #${orderNumber} (Ref: ${paymentReference}) could not be verified. Reason: ${rejectionReason}. Please resubmit a valid receipt.`,
      orderId,
      rejectionReason,
      timestamp: new Date().toISOString(),
    };

    console.log(`[NOTIFICATION:CUSTOMER] ${payload.title} -> ${payload.recipient} - ${payload.message}`);
    return { dispatched: true, channel: 'in_app_log', payload };
  }
}

module.exports = NotificationService;
