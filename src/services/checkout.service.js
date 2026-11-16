/**
 * IBTU E-Commerce Backend
 * src/services/checkout.service.js
 *
 * Checkout & Order Placement Business Logic
 *
 * Handles:
 *  - Real-time stock validation and server-side pricing.
 *  - Delivery address validation and snapshotting.
 *  - Coupon validation, discount calculation, and usage reservation.
 *  - Unique order number & payment reference generation.
 *  - Atomic transactions for order, items, payments, inventory reservation, and cart clearing.
 *  - Inventory movements audit trail.
 */

const crypto = require('crypto');
const { pool } = require('../config/database');
const AppError = require('../utils/app-error');
const PaymentInstructions = require('../config/payment-instructions');
const CouponService = require('./coupon.service');

class CheckoutService {
  /**
   * Preview checkout: calculates subtotals, optional coupon discounts, shipping, and verifies live stock
   */
  static async previewCheckout(userId, { shippingAddressId, couponCode } = {}) {
    // 1. Fetch user's cart
    const [[cart]] = await pool.query('SELECT id FROM carts WHERE user_id = ?', [userId]);
    if (!cart) {
      throw AppError.badRequest('Your shopping cart is empty.');
    }

    // 2. Fetch cart items with live pricing and variant inventory
    const [items] = await pool.query(
      `SELECT
         ci.id AS cart_item_id,
         ci.variant_id,
         ci.quantity,
         pv.sku,
         pv.size,
         pv.color,
         pv.price,
         pv.sale_price,
         pv.stock_quantity,
         pv.reserved_quantity,
         pv.is_active AS variant_active,
         p.id AS product_id,
         p.name AS product_name,
         p.slug AS product_slug,
         p.status AS product_status,
         (
           SELECT pi.image_url
           FROM product_images pi
           WHERE pi.product_id = p.id
             AND (pi.variant_id = pv.id OR pi.variant_id IS NULL)
           ORDER BY pi.is_primary DESC, pi.sort_order ASC, pi.id ASC
           LIMIT 1
         ) AS image_url
       FROM cart_items ci
       JOIN product_variants pv ON ci.variant_id = pv.id
       JOIN products p ON pv.product_id = p.id
       WHERE ci.cart_id = ?
       ORDER BY ci.created_at ASC`,
      [cart.id]
    );

    if (!items || items.length === 0) {
      throw AppError.badRequest('Your shopping cart is empty.');
    }

    // 3. Process items and check availability
    let subtotal = 0;
    let totalItems = 0;
    const validatedItems = [];
    let hasStockIssues = false;

    for (const item of items) {
      const price = parseFloat(item.price);
      const salePrice = item.sale_price !== null ? parseFloat(item.sale_price) : null;
      const unitPrice = salePrice !== null ? salePrice : price;
      const lineTotal = Math.round(unitPrice * item.quantity * 100) / 100;

      const availableStock = Math.max(0, item.stock_quantity - item.reserved_quantity);
      const isAvailable = Boolean(item.variant_active && item.product_status === 'active');
      const inStock = isAvailable && availableStock >= item.quantity;

      if (!inStock) {
        hasStockIssues = true;
      }

      subtotal += lineTotal;
      totalItems += item.quantity;

      validatedItems.push({
        variant_id: item.variant_id,
        product_id: item.product_id,
        product_name: item.product_name,
        product_slug: item.product_slug,
        sku: item.sku,
        size: item.size,
        color: item.color,
        quantity: item.quantity,
        unit_price: unitPrice,
        original_price: price,
        sale_price: salePrice,
        line_total: lineTotal,
        image_url: item.image_url,
        in_stock: inStock,
        available_stock: availableStock,
      });
    }

    subtotal = Math.round(subtotal * 100) / 100;

    // 4. Validate Coupon if provided
    let discountAmount = 0.0;
    let couponDetails = null;

    if (couponCode && couponCode.trim()) {
      const couponValidation = await CouponService.validateCouponForSubtotal({
        code: couponCode,
        userId,
        subtotal,
      });
      discountAmount = couponValidation.discount_amount;
      couponDetails = {
        id: couponValidation.coupon_id,
        code: couponValidation.coupon_code,
        discount_type: couponValidation.discount_type,
        discount_value: couponValidation.discount_value,
        discount_amount: discountAmount,
      };
    }

    // 5. Calculate fees (Ethiopian e-commerce model: free shipping for orders >= 2000 ETB, else 150 ETB)
    const taxAmount = 0.0;
    const shippingFee = subtotal >= 2000 ? 0.0 : 150.0;
    const totalAmount = Math.max(
      0,
      Math.round((subtotal - discountAmount + taxAmount + shippingFee) * 100) / 100
    );

    // 6. Delivery address
    let selectedAddress = null;
    if (shippingAddressId) {
      const [[addr]] = await pool.query(
        'SELECT * FROM customer_addresses WHERE id = ? AND user_id = ?',
        [shippingAddressId, userId]
      );
      if (addr) {
        selectedAddress = addr;
      }
    }

    if (!selectedAddress) {
      // Default address fallback
      const [[defaultAddr]] = await pool.query(
        'SELECT * FROM customer_addresses WHERE user_id = ? AND is_default = 1 LIMIT 1',
        [userId]
      );
      selectedAddress = defaultAddr || null;
    }

    return {
      can_checkout: !hasStockIssues && validatedItems.length > 0,
      total_items: totalItems,
      subtotal,
      discount_amount: discountAmount,
      coupon: couponDetails,
      tax_amount: taxAmount,
      shipping_fee: shippingFee,
      shipping_cost: shippingFee,
      total_amount: totalAmount,
      currency: 'ETB',
      shipping_address: selectedAddress,
      items: validatedItems,
      available_payment_methods: [
        {
          id: 'telebirr',
          name: 'Telebirr',
          requires_receipt: true,
          description: 'Transfer via Telebirr and upload transaction confirmation.',
        },
        {
          id: 'cbe_birr',
          name: 'CBE Birr',
          requires_receipt: true,
          description: 'Transfer via CBE Birr and upload receipt image.',
        },
        {
          id: 'bank_transfer',
          name: 'Bank Transfer (CBE)',
          requires_receipt: true,
          description: 'Transfer directly to our CBE Bank account and upload deposit slip.',
        },
        {
          id: 'cash_on_delivery',
          name: 'Cash on Delivery',
          requires_receipt: false,
          description: 'Pay cash or mobile transfer to courier upon delivery.',
        },
      ],
    };
  }

  /**
   * Submit and finalize checkout: creates order, reserves inventory, creates payment record, and clears cart
   */
  static async createOrder(
    userId,
    { shipping_address_id, payment_method, coupon_code, customer_notes }
  ) {
    // 1. Fetch and validate delivery address
    const [[address]] = await pool.query(
      'SELECT * FROM customer_addresses WHERE id = ? AND user_id = ?',
      [shipping_address_id, userId]
    );
    if (!address) {
      throw AppError.badRequest('Selected shipping address is invalid or does not belong to you.');
    }

    // 2. Fetch customer details
    const [[user]] = await pool.query(
      'SELECT id, first_name, last_name, email, phone FROM users WHERE id = ?',
      [userId]
    );
    if (!user) {
      throw AppError.unauthorized('User account not found.');
    }

    // 3. Fetch user's cart
    const [[cart]] = await pool.query('SELECT id FROM carts WHERE user_id = ?', [userId]);
    if (!cart) {
      throw AppError.badRequest('Your shopping cart is empty.');
    }

    const conn = await pool.getConnection();

    try {
      await conn.beginTransaction();

      // 4. Lock and validate cart items with variant stock
      const [items] = await conn.query(
        `SELECT
           ci.id AS cart_item_id,
           ci.variant_id,
           ci.quantity,
           pv.sku,
           pv.size,
           pv.color,
           pv.price,
           pv.sale_price,
           pv.stock_quantity,
           pv.reserved_quantity,
           pv.is_active AS variant_active,
           p.id AS product_id,
           p.name AS product_name,
           p.status AS product_status
         FROM cart_items ci
         JOIN product_variants pv ON ci.variant_id = pv.id
         JOIN products p ON pv.product_id = p.id
         WHERE ci.cart_id = ?
         FOR UPDATE`,
        [cart.id]
      );

      if (!items || items.length === 0) {
        throw AppError.badRequest('Your shopping cart is empty.');
      }

      let subtotal = 0;
      const orderItemsToInsert = [];

      for (const item of items) {
        if (!item.variant_active || item.product_status !== 'active') {
          throw AppError.badRequest(
            `Product "${item.product_name}" (${item.sku}) is currently not available.`
          );
        }

        const availableStock = item.stock_quantity - item.reserved_quantity;
        if (availableStock < item.quantity) {
          throw AppError.badRequest(
            `Insufficient stock for "${item.product_name}" (${item.sku}). Available: ${Math.max(
              0,
              availableStock
            )}, requested: ${item.quantity}.`
          );
        }

        const price = parseFloat(item.price);
        const salePrice = item.sale_price !== null ? parseFloat(item.sale_price) : null;
        const unitPrice = salePrice !== null ? salePrice : price;
        const lineTotal = Math.round(unitPrice * item.quantity * 100) / 100;

        subtotal += lineTotal;

        orderItemsToInsert.push({
          product_id: item.product_id,
          variant_id: item.variant_id,
          product_name: item.product_name,
          sku: item.sku,
          size: item.size,
          color: item.color,
          quantity: item.quantity,
          unit_price: unitPrice,
          total_price: lineTotal,
          current_stock: item.stock_quantity,
          current_reserved: item.reserved_quantity,
        });
      }

      subtotal = Math.round(subtotal * 100) / 100;

      // 5. Validate Coupon inside transaction with row lock
      let discountAmount = 0.0;
      let appliedCoupon = null;

      if (coupon_code && coupon_code.trim()) {
        const couponVal = await CouponService.validateCouponForSubtotal({
          code: coupon_code,
          userId,
          subtotal,
          conn,
        });
        discountAmount = couponVal.discount_amount;
        appliedCoupon = couponVal;
      }

      const taxAmount = 0.0;
      const shippingFee = subtotal >= 2000 ? 0.0 : 150.0;
      const totalAmount = Math.max(
        0,
        Math.round((subtotal - discountAmount + taxAmount + shippingFee) * 100) / 100
      );

      // 6. Generate unique order number
      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const randomSuffix = crypto.randomBytes(3).toString('hex').toUpperCase();
      const orderNumber = `IBTU-${dateStr}-${randomSuffix}`;

      // Customer name fallback
      const customerFullName =
        address.recipient_name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Customer';

      // 7. Insert Order
      const [orderResult] = await conn.query(
        `INSERT INTO orders (
           order_number,
           user_id,
           shipping_address_id,
           customer_name,
           customer_email,
           customer_phone,
           shipping_address_line1,
           shipping_address_line2,
           shipping_city,
           shipping_region,
           shipping_postal_code,
           shipping_country,
           subtotal,
           discount_amount,
           shipping_cost,
           tax_amount,
           total_amount,
           currency,
           order_status,
           payment_status,
           customer_notes,
           placed_at
         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'ETB', 'pending', ?, ?, NOW())`,
        [
          orderNumber,
          userId,
          address.id,
          customerFullName,
          user.email || null,
          address.phone || user.phone,
          address.address_line1,
          address.address_line2 || null,
          address.city,
          address.region || null,
          address.postal_code || null,
          address.country || 'Ethiopia',
          subtotal,
          discountAmount,
          shippingFee,
          taxAmount,
          totalAmount,
          payment_method === 'cash_on_delivery' ? 'unpaid' : 'pending',
          customer_notes || null,
        ]
      );

      const orderId = orderResult.insertId;

      // 8. If coupon was applied, create reserved coupon_usages record and increment usage_count
      if (appliedCoupon) {
        await conn.query(
          `INSERT INTO coupon_usages (
             coupon_id,
             user_id,
             order_id,
             discount_amount,
             usage_status,
             used_at
           ) VALUES (?, ?, ?, ?, 'reserved', NOW())`,
          [appliedCoupon.coupon_id, userId, orderId, discountAmount]
        );

        await conn.query(
          'UPDATE coupons SET usage_count = usage_count + 1 WHERE id = ?',
          [appliedCoupon.coupon_id]
        );
      }

      // 9. Insert Order Items & Reserve Inventory
      for (const item of orderItemsToInsert) {
        // Insert snapshot
        await conn.query(
          `INSERT INTO order_items (
             order_id,
             product_id,
             variant_id,
             product_name,
             sku,
             size,
             color,
             quantity,
             unit_price,
             discount_amount,
             total_price
           ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0.00, ?)`,
          [
            orderId,
            item.product_id,
            item.variant_id,
            item.product_name,
            item.sku,
            item.size,
            item.color,
            item.quantity,
            item.unit_price,
            item.total_price,
          ]
        );

        // Reserve inventory in product_variants
        await conn.query(
          'UPDATE product_variants SET reserved_quantity = reserved_quantity + ? WHERE id = ?',
          [item.quantity, item.variant_id]
        );

        // Record inventory movement
        await conn.query(
          `INSERT INTO inventory_movements (
             variant_id,
             user_id,
             movement_type,
             quantity,
             quantity_before,
             quantity_after,
             reference_type,
             reference_id,
             reason,
             notes
           ) VALUES (?, ?, 'reserved', ?, ?, ?, 'order', ?, 'Checkout inventory reservation', ?)`,
          [
            item.variant_id,
            userId,
            item.quantity,
            item.current_reserved,
            item.current_reserved + item.quantity,
            orderId,
            `Order #${orderNumber}`,
          ]
        );
      }

      // 10. Payment Provider Label
      const providerLabels = {
        telebirr: 'Telebirr',
        cbe_birr: 'CBE Birr',
        bank_transfer: 'Bank Transfer',
        cash_on_delivery: 'Cash on Delivery',
      };
      const paymentProvider = providerLabels[payment_method] || 'Other';

      // 11. Initial Payment Record
      const payRefSuffix = crypto.randomBytes(4).toString('hex').toUpperCase();
      const paymentReference = `PAY-${dateStr}-${payRefSuffix}`;

      const initialTransactionResponse = {
        verification_status:
          payment_method === 'cash_on_delivery' ? 'not_required' : 'pending_upload',
        receipt_filename: null,
        receipt_original_name: null,
        uploaded_at: null,
        reviewed_by: null,
        reviewed_at: null,
        rejection_reason: null,
        history: [
          {
            action: 'payment_initialized',
            status:
              payment_method === 'cash_on_delivery' ? 'not_required' : 'pending_upload',
            timestamp: new Date().toISOString(),
          },
        ],
      };

      const [paymentResult] = await conn.query(
        `INSERT INTO payments (
           order_id,
           payment_reference,
           payment_method,
           payment_provider,
           amount,
           currency,
           payment_status,
           transaction_response
         ) VALUES (?, ?, ?, ?, ?, 'ETB', 'pending', ?)`,
        [
          orderId,
          paymentReference,
          payment_method,
          paymentProvider,
          totalAmount,
          JSON.stringify(initialTransactionResponse),
        ]
      );

      const paymentId = paymentResult.insertId;

      // 12. Clear Customer's Cart Items
      await conn.query('DELETE FROM cart_items WHERE cart_id = ?', [cart.id]);

      await conn.commit();

      // Retrieve relevant payment instructions
      const paymentInstructions = PaymentInstructions.getByMethod(payment_method);

      return {
        order: {
          id: orderId,
          order_number: orderNumber,
          order_status: 'pending',
          payment_status: payment_method === 'cash_on_delivery' ? 'unpaid' : 'pending',
          subtotal,
          discount_amount: discountAmount,
          tax_amount: taxAmount,
          shipping_fee: shippingFee,
          shipping_cost: shippingFee,
          total_amount: totalAmount,
          currency: 'ETB',
          customer_name: customerFullName,
          customer_phone: address.phone || user.phone,
          customer_email: user.email,
          coupon: appliedCoupon
            ? {
                code: appliedCoupon.coupon_code,
                discount_amount: discountAmount,
              }
            : null,
          items_count: orderItemsToInsert.length,
          placed_at: new Date().toISOString(),
        },
        payment: {
          id: paymentId,
          payment_reference: paymentReference,
          payment_method,
          payment_provider: paymentProvider,
          amount: totalAmount,
          currency: 'ETB',
          verification_status:
            payment_method === 'cash_on_delivery' ? 'not_required' : 'pending_upload',
          instructions: paymentInstructions,
        },
      };
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  }
}

module.exports = CheckoutService;
