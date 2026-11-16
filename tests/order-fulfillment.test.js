/**
 * order-fulfillment.test.js
 * Automated test suite for Phase 15 / Phase 4 Step 3:
 * Order Management and Fulfillment API.
 *
 * Port: 5086
 *
 * Test Scenarios:
 *   1. Admin view all orders (pagination & total count)
 *   2. Admin filter orders by order_status
 *   3. Admin filter orders by payment_status
 *   4. Admin filter orders by payment_method
 *   5. Admin filter orders by date range
 *   6. Admin search orders by order_number, customer name, and customer email
 *   7. Admin sort orders using sort_by & sort_order whitelist
 *   8. Admin retrieve full order details (items, payments, coupon, shipments)
 *   9. Customer view only own orders (data isolation)
 *  10. Customer cross-access forbidden (403 on another customer's order)
 *  11. Unauthenticated customer order request rejected (401)
 *  12. Non-admin access to admin order endpoints rejected (403)
 *  13. Invalid order status transitions rejected (400)
 *  14. Payment gate: Non-COD order cannot advance to processing/shipped if unpaid (400)
 *  15. Admin updates order status through allowed transitions (pending -> confirmed)
 *  16. Admin fulfills order to shipped: Physical stock decreases, reserved stock releases, sale movement logged
 *  17. Duplicate fulfillment protection (physical stock not deducted twice)
 *  18. Admin creates a shipment with courier info & tracking number
 *  19. Single active shipment rule enforced (reject duplicate active shipment)
 *  20. Cannot create shipment for cancelled order (400)
 *  21. Admin retrieves shipments for an order
 *  22. Shipment status transition validation (reject invalid jump)
 *  23. Admin updates shipment to shipped -> auto-syncs order to shipped
 *  24. Admin updates shipment to delivered -> auto-syncs order to delivered
 *  25. COD order marked paid when delivered
 *  26. Customer tracks own shipment
 *  27. Customer tracking cross-access rejected (403)
 *  28. Customer tracking 404 when no shipment exists
 *  29. Customer cancels eligible order (pending/confirmed) with reason
 *  30. Cancellation releases reserved stock without decreasing physical stock (released movement logged)
 *  31. Cancellation releases reserved coupon usage (usage_status cancelled, usage_count decremented)
 *  32. Ineligible order cancellation rejected (cannot cancel shipped/delivered order)
 *  33. Customer cannot cancel another customer's order (403)
 *  34. Audit logs verified for ORDER_STATUS_UPDATE, ORDER_CANCEL, SHIPMENT_CREATE, SHIPMENT_STATUS_UPDATE
 */

'use strict';

const http = require('http');
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
require('dotenv').config();

const app = require('../src/app');

const TEST_PORT = 5086;
let server;
let pool;

let customer1Id, customer2Id, adminUserId;
let customer1Token, customer2Token, adminToken;
let address1Id, address2Id;
let testCategoryId, testProductId, testVariantId1, testVariantId2;
let couponId, couponCode;

let telebirrOrderId, codOrderId, couponOrderId, customer2OrderId;
let testShipmentId;

function req(method, pathName, body = null, token = null) {
  return new Promise((resolve, reject) => {
    let payload = null;
    const headers = {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    if (body) {
      payload = JSON.stringify(body);
      headers['Content-Type'] = 'application/json';
      headers['Content-Length'] = Buffer.byteLength(payload);
    }

    const opts = {
      hostname: 'localhost',
      port: TEST_PORT,
      path: `/api${pathName}`,
      method,
      headers,
    };

    const r = http.request(opts, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => {
        let parsed = data;
        try {
          parsed = JSON.parse(data);
        } catch {}
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: parsed,
          raw: data,
        });
      });
    });

    r.on('error', reject);
    if (payload) r.write(payload);
    r.end();
  });
}

async function addVariantToCart(userId, variantId, quantity = 1) {
  const [[cart]] = await pool.query('SELECT id FROM carts WHERE user_id = ?', [userId]);
  let cartId = cart ? cart.id : null;
  if (!cartId) {
    const [res] = await pool.query('INSERT INTO carts (user_id, last_activity_at) VALUES (?, NOW())', [userId]);
    cartId = res.insertId;
  }
  await pool.query(
    'INSERT INTO cart_items (cart_id, variant_id, quantity) VALUES (?, ?, ?)',
    [cartId, variantId, quantity]
  );
}

async function runTests() {
  pool = await mysql.createPool({
    host: '127.0.0.1',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'ibutu_ecommerce',
    port: 3306,
    waitForConnections: true,
    connectionLimit: 10,
  });

  server = app.listen(TEST_PORT, () => {
    console.log(`Order Fulfillment test server running on port ${TEST_PORT}\n`);
  });

  const pwdHash = await bcrypt.hash('Password123!', 10);
  const ts = Date.now();

  try {
    // 1. Create test users
    const [u1] = await pool.query(
      `INSERT INTO users (first_name, last_name, email, phone, password_hash, is_active)
       VALUES ('Almaz', 'Ayana', 'almaz_${ts}@example.com', '+251911000001', ?, 1)`,
      [pwdHash]
    );
    customer1Id = u1.insertId;

    const [u2] = await pool.query(
      `INSERT INTO users (first_name, last_name, email, phone, password_hash, is_active)
       VALUES ('Bekele', 'Dibaba', 'bekele_${ts}@example.com', '+251911000002', ?, 1)`,
      [pwdHash]
    );
    customer2Id = u2.insertId;

    const [uAdm] = await pool.query(
      `INSERT INTO users (first_name, last_name, email, phone, password_hash, is_active)
       VALUES ('Super', 'Admin', 'admin_ord_${ts}@example.com', '+251911999999', ?, 1)`,
      [pwdHash]
    );
    adminUserId = uAdm.insertId;

    // Roles
    const [[custRole]] = await pool.query("SELECT id FROM roles WHERE name = 'Customer'");
    const [[admRole]] = await pool.query("SELECT id FROM roles WHERE name = 'Admin'");

    await pool.query('INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)', [customer1Id, custRole.id]);
    await pool.query('INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)', [customer2Id, custRole.id]);
    await pool.query('INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)', [adminUserId, admRole.id]);

    // Tokens
    const l1 = await req('POST', '/auth/login', { email: `almaz_${ts}@example.com`, password: 'Password123!' });
    customer1Token = l1.data.data.token;

    const l2 = await req('POST', '/auth/login', { email: `bekele_${ts}@example.com`, password: 'Password123!' });
    customer2Token = l2.data.data.token;

    const lAdm = await req('POST', '/auth/login', { email: `admin_ord_${ts}@example.com`, password: 'Password123!' });
    adminToken = lAdm.data.data.token;

    // Addresses
    const [addr1] = await pool.query(
      `INSERT INTO customer_addresses (user_id, recipient_name, phone, address_line1, city, is_default)
       VALUES (?, 'Almaz Ayana', '+251911000001', 'Bole Medhanialem', 'Addis Ababa', 1)`,
      [customer1Id]
    );
    address1Id = addr1.insertId;

    const [addr2] = await pool.query(
      `INSERT INTO customer_addresses (user_id, recipient_name, phone, address_line1, city, is_default)
       VALUES (?, 'Bekele Dibaba', '+251911000002', 'Piazza Churchill', 'Addis Ababa', 1)`,
      [customer2Id]
    );
    address2Id = addr2.insertId;

    // Category & Product
    const [cat] = await pool.query(
      `INSERT INTO categories (name, slug, is_active) VALUES ('OrdFulfill Cat ${ts}', 'ord-cat-${ts}', 1)`
    );
    testCategoryId = cat.insertId;

    const [prod] = await pool.query(
      `INSERT INTO products (category_id, name, slug, status)
       VALUES (?, 'Habesha Kemis ${ts}', 'kemis-${ts}', 'active')`,
      [testCategoryId]
    );
    testProductId = prod.insertId;

    // Variants with 100 physical stock and 0 reserved
    const [var1] = await pool.query(
      `INSERT INTO product_variants (product_id, sku, size, color, price, sale_price, stock_quantity, reserved_quantity, is_active)
       VALUES (?, 'SKU-KM1-${ts}', 'M', 'White/Gold', 3000.00, 2800.00, 100, 0, 1)`,
      [testProductId]
    );
    testVariantId1 = var1.insertId;

    const [var2] = await pool.query(
      `INSERT INTO product_variants (product_id, sku, size, color, price, sale_price, stock_quantity, reserved_quantity, is_active)
       VALUES (?, 'SKU-KM2-${ts}', 'L', 'White/Green', 4500.00, NULL, 100, 0, 1)`,
      [testProductId]
    );
    testVariantId2 = var2.insertId;

    // Create a coupon for testing cancellation release
    couponCode = `ORDDISC${ts}`.slice(0, 18);
    const [cpn] = await pool.query(
      `INSERT INTO coupons (code, discount_type, discount_value, min_purchase_amount, usage_limit, usage_count, is_active, start_date, end_date)
       VALUES (?, 'fixed', 200.00, 500.00, 10, 0, 1, DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_ADD(NOW(), INTERVAL 30 DAY))`,
      [couponCode]
    );
    couponId = cpn.insertId;

    // ─────────────────────────────────────────────────────────
    // Setup Initial Orders via Checkout API
    // ─────────────────────────────────────────────────────────
    // Order 1: Customer 1 -> Telebirr (unpaid), variant 1 (qty 2) -> 2 * 2800 = 5600 ETB
    await addVariantToCart(customer1Id, testVariantId1, 2);
    const co1 = await req('POST', '/checkout/orders', {
      shipping_address_id: address1Id,
      payment_method: 'telebirr',
      customer_notes: 'Urgent habesha dress',
    }, customer1Token);
    telebirrOrderId = co1.data.data.order.id;

    // Order 2: Customer 1 -> COD (Cash on Delivery), variant 1 (qty 1) -> 2800 ETB
    await addVariantToCart(customer1Id, testVariantId1, 1);
    const co2 = await req('POST', '/checkout/orders', {
      shipping_address_id: address1Id,
      payment_method: 'cash_on_delivery',
      customer_notes: 'COD order',
    }, customer1Token);
    codOrderId = co2.data.data.order.id;

    // Order 3: Customer 1 -> Bank Transfer with Coupon, variant 2 (qty 2) -> 2 * 4500 = 9000 - 200 = 8800 ETB
    await addVariantToCart(customer1Id, testVariantId2, 2);
    const co3 = await req('POST', '/checkout/orders', {
      shipping_address_id: address1Id,
      payment_method: 'bank_transfer',
      coupon_code: couponCode,
    }, customer1Token);
    couponOrderId = co3.data.data.order.id;

    // Order 4: Customer 2 -> Telebirr, variant 1 (qty 1) -> 2800 ETB
    await addVariantToCart(customer2Id, testVariantId1, 1);
    const co4 = await req('POST', '/checkout/orders', {
      shipping_address_id: address2Id,
      payment_method: 'telebirr',
    }, customer2Token);
    customer2OrderId = co4.data.data.order.id;

    let passed = 0;
    let failed = 0;

    function assert(cond, desc) {
      if (cond) {
        console.log(`  [PASS] ${desc}`);
        passed++;
      } else {
        console.error(`  [FAIL] ${desc}`);
        failed++;
      }
    }

    console.log('───────────────────────────────────────────────────────');
    console.log('  IBTU Phase 4 Step 3: Order Management & Fulfillment');
    console.log('───────────────────────────────────────────────────────\n');

    // ─── Test 1: Admin view all orders (pagination & total count) ───
    console.log('[Test 1] Admin view all orders (pagination & total count)');
    const r1 = await req('GET', '/admin/orders?page=1&limit=10', null, adminToken);
    assert(r1.status === 200, `Status 200 OK (got ${r1.status})`);
    assert(r1.data.success === true, 'success: true');
    assert(Array.isArray(r1.data.data.orders), 'Returns orders array');
    assert(r1.data.data.pagination && r1.data.data.pagination.total >= 4, 'Total orders count >= 4');

    // ─── Test 2: Admin filter orders by order_status ───
    console.log('\n[Test 2] Admin filter orders by order_status');
    const r2 = await req('GET', '/admin/orders?order_status=pending', null, adminToken);
    assert(r2.status === 200, 'Status 200 OK');
    const allPending = r2.data.data.orders.every((o) => o.order_status === 'pending');
    assert(allPending, 'All returned orders have order_status = pending');

    // ─── Test 3: Admin filter orders by payment_status ───
    console.log('\n[Test 3] Admin filter orders by payment_status');
    const r3 = await req('GET', '/admin/orders?payment_status=unpaid', null, adminToken);
    assert(r3.status === 200, 'Status 200 OK');
    const allUnpaid = r3.data.data.orders.every((o) => o.payment_status === 'unpaid');
    assert(allUnpaid, 'All returned orders have payment_status = unpaid');

    // ─── Test 4: Admin filter orders by payment_method ───
    console.log('\n[Test 4] Admin filter orders by payment_method');
    const r4 = await req('GET', '/admin/orders?payment_method=cash_on_delivery', null, adminToken);
    assert(r4.status === 200, 'Status 200 OK');
    const hasCOD = r4.data.data.orders.some((o) => o.id === codOrderId);
    assert(hasCOD, 'Returned filtered orders includes the COD order');

    // ─── Test 5: Admin filter orders by date range ───
    console.log('\n[Test 5] Admin filter orders by date range');
    const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    const r5 = await req('GET', `/admin/orders?date_from=${yesterday}&date_to=${tomorrow}`, null, adminToken);
    assert(r5.status === 200, 'Status 200 OK');
    assert(r5.data.data.orders.length >= 4, 'Returns orders within date range');

    // ─── Test 6: Admin search orders by order_number and customer details ───
    console.log('\n[Test 6] Admin search orders by order_number, customer name, and customer email');
    const [[ordRow]] = await pool.query('SELECT order_number FROM orders WHERE id = ?', [telebirrOrderId]);
    const r6a = await req('GET', `/admin/orders?search=${ordRow.order_number}`, null, adminToken);
    assert(r6a.status === 200 && r6a.data.data.orders.length >= 1, 'Search by exact order_number returns order');
    assert(r6a.data.data.orders[0].id === telebirrOrderId, 'Matched correct order ID');

    const r6b = await req('GET', `/admin/orders?search=Ayana`, null, adminToken);
    assert(r6b.status === 200 && r6b.data.data.orders.length >= 1, 'Search by customer last name succeeds');

    const r6c = await req('GET', `/admin/orders?search=almaz_${ts}`, null, adminToken);
    assert(r6c.status === 200 && r6c.data.data.orders.length >= 1, 'Search by customer email succeeds');

    // ─── Test 7: Admin sort orders whitelist ───
    console.log('\n[Test 7] Admin sort orders using sort_by & sort_order whitelist');
    const r7 = await req('GET', '/admin/orders?sort_by=total_amount&sort_order=DESC', null, adminToken);
    assert(r7.status === 200, 'Status 200 OK');
    const amounts = r7.data.data.orders.map((o) => o.total_amount);
    let isSortedDesc = true;
    for (let i = 0; i < amounts.length - 1; i++) {
      if (amounts[i] < amounts[i + 1]) isSortedDesc = false;
    }
    assert(isSortedDesc, 'Orders correctly sorted DESC by total_amount');

    // ─── Test 8: Admin retrieve full order details ───
    console.log('\n[Test 8] Admin retrieve full order details (items, payments, coupon, shipments)');
    const r8 = await req('GET', `/admin/orders/${couponOrderId}`, null, adminToken);
    assert(r8.status === 200, 'Status 200 OK');
    assert(r8.data.data.order && r8.data.data.order.id === couponOrderId, 'Contains order info');
    assert(Array.isArray(r8.data.data.items) && r8.data.data.items.length === 1, 'Contains order items snapshot');
    assert(r8.data.data.items[0].quantity === 2, 'Item quantity matches (2)');
    assert(Array.isArray(r8.data.data.payments) && r8.data.data.payments.length >= 1, 'Contains payment details');
    assert(r8.data.data.coupon && r8.data.data.coupon.coupon_code === couponCode, 'Contains applied coupon info');
    assert(Array.isArray(r8.data.data.shipments), 'Contains shipments array');

    // ─── Test 9: Customer view only own orders (data isolation) ───
    console.log('\n[Test 9] Customer view only own orders (data isolation)');
    const r9a = await req('GET', '/orders', null, customer1Token);
    assert(r9a.status === 200, 'Customer 1 status 200 OK');
    assert(r9a.data.data.orders.length === 3, 'Customer 1 sees exactly their 3 orders');
    const noCrossData1 = r9a.data.data.orders.every((o) => o.id !== customer2OrderId);
    assert(noCrossData1, 'Customer 1 does NOT see Customer 2 order');

    const r9b = await req('GET', '/orders', null, customer2Token);
    assert(r9b.status === 200, 'Customer 2 status 200 OK');
    assert(r9b.data.data.orders.length === 1, 'Customer 2 sees exactly their 1 order');
    assert(r9b.data.data.orders[0].id === customer2OrderId, 'Customer 2 sees only their order');

    // ─── Test 10: Customer cross-access forbidden (403 on another customer's order) ───
    console.log('\n[Test 10] Customer cross-access forbidden (403 on another customer order)');
    const r10 = await req('GET', `/orders/${customer2OrderId}`, null, customer1Token);
    assert(r10.status === 403, `Status 403 Forbidden (got ${r10.status})`);
    assert(r10.data.success === false, 'Access denied for foreign customer');

    // ─── Test 11: Unauthenticated customer order request rejected (401) ───
    console.log('\n[Test 11] Unauthenticated customer order request rejected (401)');
    const r11 = await req('GET', '/orders', null, null);
    assert(r11.status === 401, `Status 401 Unauthorized (got ${r11.status})`);

    // ─── Test 12: Non-admin access to admin order endpoints rejected (403) ───
    console.log('\n[Test 12] Non-admin access to admin order endpoints rejected (403)');
    const r12 = await req('GET', '/admin/orders', null, customer1Token);
    assert(r12.status === 403, `Status 403 Forbidden for Customer on /admin/orders (got ${r12.status})`);

    // ─── Test 13: Invalid order status transitions rejected (400) ───
    console.log('\n[Test 13] Invalid order status transitions rejected (400)');
    // pending -> delivered is an invalid leap
    const r13 = await req('PATCH', `/admin/orders/${telebirrOrderId}/status`, {
      status: 'delivered',
    }, adminToken);
    assert(r13.status === 400, `Status 400 Bad Request on invalid transition (got ${r13.status})`);
    assert(r13.data.message.includes('Invalid order status transition'), 'Error message specifies invalid transition');

    // ─── Test 14: Payment gate: Non-COD order cannot advance to processing/shipped if unpaid (400) ───
    console.log('\n[Test 14] Payment gate: Non-COD order cannot advance to processing/shipped if unpaid (400)');
    // Telebirr order is unpaid; attempting to advance pending -> processing directly
    const r14 = await req('PATCH', `/admin/orders/${telebirrOrderId}/status`, {
      status: 'processing',
    }, adminToken);
    assert(r14.status === 400, `Status 400 Bad Request on unpaid non-COD order dispatch (got ${r14.status})`);
    assert(r14.data.message.includes('payment has not been verified'), 'Rejects dispatch due to unverified payment');

    // ─── Test 15: Admin updates order status through allowed transitions (pending -> confirmed) ───
    console.log('\n[Test 15] Admin updates order status through allowed transitions (pending -> confirmed)');
    const r15 = await req('PATCH', `/admin/orders/${telebirrOrderId}/status`, {
      status: 'confirmed',
      admin_notes: 'Verified stock availability',
    }, adminToken);
    assert(r15.status === 200, `Status 200 OK (got ${r15.status})`);
    assert(r15.data.data.order_status === 'confirmed', 'Order status is now confirmed');

    // Mark payment paid for Telebirr order so we can fulfill it
    await pool.query(
      `UPDATE orders SET payment_status = 'paid' WHERE id = ?`,
      [telebirrOrderId]
    );
    await pool.query(
      `UPDATE payments SET payment_status = 'successful', paid_at = NOW() WHERE order_id = ?`,
      [telebirrOrderId]
    );

    // Advance confirmed -> processing
    const r15b = await req('PATCH', `/admin/orders/${telebirrOrderId}/status`, {
      status: 'processing',
      admin_notes: 'In packaging',
    }, adminToken);
    assert(r15b.status === 200, 'Status 200 OK on transition to processing');

    // ─── Test 16: Admin fulfills order to shipped: Physical stock decreases, reserved stock releases, sale movement logged ───
    console.log('\n[Test 16] Admin fulfills order to shipped: Inventory deduction & movement');
    // Check variant 1 stock before fulfillment (qty 2 was reserved for telebirrOrderId)
    const [[var1Before]] = await pool.query('SELECT stock_quantity, reserved_quantity FROM product_variants WHERE id = ?', [testVariantId1]);
    const stockBefore = var1Before.stock_quantity;
    const reservedBefore = var1Before.reserved_quantity;

    const r16 = await req('PATCH', `/admin/orders/${telebirrOrderId}/status`, {
      status: 'shipped',
      admin_notes: 'Dispatched via express delivery',
    }, adminToken);
    assert(r16.status === 200, `Status 200 OK (got ${r16.status})`);
    assert(r16.data.data.order_status === 'shipped', 'Order status updated to shipped');

    const [[var1After]] = await pool.query('SELECT stock_quantity, reserved_quantity FROM product_variants WHERE id = ?', [testVariantId1]);
    assert(var1After.stock_quantity === stockBefore - 2, `Physical stock decreased by 2 (${stockBefore} -> ${var1After.stock_quantity})`);
    assert(var1After.reserved_quantity === reservedBefore - 2, `Reserved stock decreased by 2 (${reservedBefore} -> ${var1After.reserved_quantity})`);

    const [[movement]] = await pool.query(
      `SELECT * FROM inventory_movements WHERE reference_type = 'order' AND reference_id = ? AND movement_type = 'sale'`,
      [telebirrOrderId]
    );
    assert(movement && movement.quantity === 2, 'Recorded inventory movement of type sale for 2 items');
    assert(movement.variant_id === testVariantId1, 'Movement references correct variant');

    // ─── Test 17: Duplicate fulfillment protection ───
    console.log('\n[Test 17] Duplicate fulfillment protection (stock not deducted twice)');
    // Calling fulfillment logic again or transitioning to delivered should NOT deduct stock again
    const r17 = await req('PATCH', `/admin/orders/${telebirrOrderId}/status`, {
      status: 'delivered',
      admin_notes: 'Customer confirmed delivery',
    }, adminToken);
    assert(r17.status === 200, 'Order transitioned to delivered');

    const [[var1AfterDelivered]] = await pool.query('SELECT stock_quantity, reserved_quantity FROM product_variants WHERE id = ?', [testVariantId1]);
    assert(var1AfterDelivered.stock_quantity === var1After.stock_quantity, 'Physical stock remains unchanged after delivery');

    const [saleMovements] = await pool.query(
      `SELECT * FROM inventory_movements WHERE reference_type = 'order' AND reference_id = ? AND movement_type = 'sale'`,
      [telebirrOrderId]
    );
    assert(saleMovements.length === 1, 'Exactly one sale movement exists for order (idempotent fulfillment)');

    // ─── Test 18: Admin creates a shipment with courier info & tracking number ───
    console.log('\n[Test 18] Admin creates a shipment with courier info & tracking number');
    const r18 = await req('POST', `/admin/orders/${codOrderId}/shipments`, {
      courier_name: 'Tikur Abay Express',
      courier_phone: '+251911223344',
      shipping_cost: 150.00,
      estimated_delivery_date: '2026-11-20T10:00:00Z',
      delivery_notes: 'Fragile traditional clothing',
    }, adminToken);
    assert(r18.status === 201, `Status 201 Created (got ${r18.status})`);
    assert(r18.data.success === true, 'success: true');
    assert(r18.data.data.tracking_number.startsWith('TRK-'), 'Auto-generated valid tracking number');
    assert(r18.data.data.courier_name === 'Tikur Abay Express', 'Courier name stored correctly');
    testShipmentId = r18.data.data.id;

    // ─── Test 19: Single active shipment rule enforced ───
    console.log('\n[Test 19] Single active shipment rule enforced (reject duplicate active shipment)');
    const r19 = await req('POST', `/admin/orders/${codOrderId}/shipments`, {
      courier_name: 'Another Courier',
    }, adminToken);
    assert(r19.status === 400, `Status 400 Bad Request on second active shipment (got ${r19.status})`);
    assert(r19.data.message.includes('active shipment already exists'), 'Rejects multiple active shipments');

    // ─── Test 20: Cannot create shipment for cancelled order (400) ───
    console.log('\n[Test 20] Cannot create shipment for cancelled order (400)');
    // Cancel customer 2's order first
    await req('POST', `/orders/${customer2OrderId}/cancel`, {
      cancellation_reason: 'Changed my mind',
    }, customer2Token);

    const r20 = await req('POST', `/admin/orders/${customer2OrderId}/shipments`, {
      courier_name: 'DHL Express',
    }, adminToken);
    assert(r20.status === 400, `Status 400 Bad Request for cancelled order shipment (got ${r20.status})`);

    // ─── Test 21: Admin retrieves shipments for an order ───
    console.log('\n[Test 21] Admin retrieves shipments for an order');
    const r21 = await req('GET', `/admin/orders/${codOrderId}/shipments`, null, adminToken);
    assert(r21.status === 200, 'Status 200 OK');
    assert(Array.isArray(r21.data.data) && r21.data.data.length === 1, 'Returns 1 shipment for the COD order');
    assert(r21.data.data[0].id === testShipmentId, 'Shipment ID matches');

    // ─── Test 22: Shipment status transition validation (reject invalid jump) ───
    console.log('\n[Test 22] Shipment status transition validation (reject invalid jump)');
    // pending -> delivered directly is invalid
    const r22 = await req('PATCH', `/admin/shipments/${testShipmentId}/status`, {
      status: 'delivered',
    }, adminToken);
    assert(r22.status === 400, `Status 400 Bad Request on invalid shipment transition (got ${r22.status})`);

    // ─── Test 23: Admin updates shipment to shipped -> auto-syncs order to shipped ───
    console.log('\n[Test 23] Admin updates shipment to shipped -> auto-syncs order to shipped');
    // First advance shipment to processing
    await req('PATCH', `/admin/shipments/${testShipmentId}/status`, { status: 'processing' }, adminToken);
    // Advance COD order to processing as well (COD is allowed to advance)
    await req('PATCH', `/admin/orders/${codOrderId}/status`, { status: 'confirmed' }, adminToken);
    await req('PATCH', `/admin/orders/${codOrderId}/status`, { status: 'processing' }, adminToken);

    // Now advance shipment to shipped
    const r23 = await req('PATCH', `/admin/shipments/${testShipmentId}/status`, {
      status: 'shipped',
      delivery_notes: 'Driver picked up parcel',
    }, adminToken);
    assert(r23.status === 200, `Status 200 OK (got ${r23.status})`);
    assert(r23.data.data.shipment_status === 'shipped', 'Shipment status is shipped');
    assert(r23.data.data.shipped_at !== null, 'shipped_at timestamp recorded');

    // Verify order was synced to 'shipped'
    const [[syncedOrder]] = await pool.query('SELECT order_status FROM orders WHERE id = ?', [codOrderId]);
    assert(syncedOrder.order_status === 'shipped', 'Order status auto-synchronized to shipped');

    // ─── Test 24: Admin updates shipment to delivered -> auto-syncs order to delivered ───
    console.log('\n[Test 24] Admin updates shipment to delivered -> auto-syncs order to delivered');
    // in_transit -> delivered
    await req('PATCH', `/admin/shipments/${testShipmentId}/status`, { status: 'in_transit' }, adminToken);
    const r24 = await req('PATCH', `/admin/shipments/${testShipmentId}/status`, {
      status: 'delivered',
      delivery_notes: 'Delivered to recipient in person',
    }, adminToken);
    assert(r24.status === 200, 'Shipment updated to delivered');
    assert(r24.data.data.delivered_at !== null, 'delivered_at timestamp recorded');

    const [[deliveredOrder]] = await pool.query('SELECT order_status, payment_status FROM orders WHERE id = ?', [codOrderId]);
    assert(deliveredOrder.order_status === 'delivered', 'Order status auto-synchronized to delivered');

    // ─── Test 25: COD order marked paid when delivered ───
    console.log('\n[Test 25] COD order marked paid when delivered');
    assert(deliveredOrder.payment_status === 'paid', 'COD order payment_status updated to paid upon delivery');
    const [[codPayment]] = await pool.query('SELECT payment_status, paid_at FROM payments WHERE order_id = ?', [codOrderId]);
    assert(codPayment.payment_status === 'successful' && codPayment.paid_at !== null, 'COD payment record marked successful with paid_at');

    // ─── Test 26: Customer tracks own shipment ───
    console.log('\n[Test 26] Customer tracks own shipment');
    const r26 = await req('GET', `/orders/${codOrderId}/tracking`, null, customer1Token);
    assert(r26.status === 200, `Status 200 OK (got ${r26.status})`);
    assert(r26.data.success === true, 'success: true');
    assert(r26.data.data.tracking_number.startsWith('TRK-'), 'Returns tracking number');
    assert(r26.data.data.shipment_status === 'delivered', 'Shipment status matches delivered');
    assert(r26.data.data.courier_name === 'Tikur Abay Express', 'Courier name returned');

    // ─── Test 27: Customer tracking cross-access rejected (403) ───
    console.log('\n[Test 27] Customer tracking cross-access rejected (403)');
    const r27 = await req('GET', `/orders/${codOrderId}/tracking`, null, customer2Token);
    assert(r27.status === 403, `Status 403 Forbidden for non-owner customer (got ${r27.status})`);

    // ─── Test 28: Customer tracking 404 when no shipment exists ───
    console.log('\n[Test 28] Customer tracking 404 when no shipment exists');
    const r28 = await req('GET', `/orders/${couponOrderId}/tracking`, null, customer1Token);
    assert(r28.status === 404, `Status 404 Not Found (got ${r28.status})`);

    // ─── Test 29: Customer cancels eligible order (pending/confirmed) with reason ───
    console.log('\n[Test 29] Customer cancels eligible order with coupon (pending) with reason');
    const [[var2BeforeCancel]] = await pool.query('SELECT stock_quantity, reserved_quantity FROM product_variants WHERE id = ?', [testVariantId2]);
    const [[cpnBeforeCancel]] = await pool.query('SELECT usage_count FROM coupons WHERE id = ?', [couponId]);

    const r29 = await req('POST', `/orders/${couponOrderId}/cancel`, {
      cancellation_reason: 'Found another outfit for the ceremony',
    }, customer1Token);
    assert(r29.status === 200, `Status 200 OK (got ${r29.status})`);
    assert(r29.data.data.order_status === 'cancelled', 'Order status is now cancelled');

    // ─── Test 30: Cancellation releases reserved stock without decreasing physical stock ───
    console.log('\n[Test 30] Cancellation releases reserved stock without decreasing physical stock');
    const [[var2AfterCancel]] = await pool.query('SELECT stock_quantity, reserved_quantity FROM product_variants WHERE id = ?', [testVariantId2]);
    assert(var2AfterCancel.stock_quantity === var2BeforeCancel.stock_quantity, 'Physical stock is UNTOUCHED (did not decrease)');
    assert(var2AfterCancel.reserved_quantity === var2BeforeCancel.reserved_quantity - 2, 'Reserved quantity decreased by 2 (reservation released)');

    const [[releasedMv]] = await pool.query(
      `SELECT * FROM inventory_movements WHERE reference_type = 'order' AND reference_id = ? AND movement_type = 'released'`,
      [couponOrderId]
    );
    assert(releasedMv && releasedMv.quantity === 2, 'Recorded inventory movement of type released');

    // ─── Test 31: Cancellation releases reserved coupon usage ───
    console.log('\n[Test 31] Cancellation releases reserved coupon usage');
    const [[cpnAfterCancel]] = await pool.query('SELECT usage_count FROM coupons WHERE id = ?', [couponId]);
    assert(cpnAfterCancel.usage_count === Math.max(0, cpnBeforeCancel.usage_count - 1), 'Coupon usage_count decremented by 1');

    const [[cpnUsageRow]] = await pool.query('SELECT usage_status FROM coupon_usages WHERE order_id = ?', [couponOrderId]);
    assert(cpnUsageRow && cpnUsageRow.usage_status === 'cancelled', 'coupon_usages status updated to cancelled');

    // ─── Test 32: Ineligible order cancellation rejected (cannot cancel shipped/delivered order) ───
    console.log('\n[Test 32] Ineligible order cancellation rejected (cannot cancel shipped/delivered order)');
    const r32a = await req('POST', `/orders/${telebirrOrderId}/cancel`, {
      cancellation_reason: 'Trying to cancel delivered order',
    }, customer1Token);
    assert(r32a.status === 400, `Customer cannot cancel delivered order (got status ${r32a.status})`);

    const r32b = await req('POST', `/admin/orders/${telebirrOrderId}/cancel`, {
      cancellation_reason: 'Admin cancel delivered order',
    }, adminToken);
    assert(r32b.status === 400, `Admin cannot cancel delivered order (got status ${r32b.status})`);

    // ─── Test 33: Customer cannot cancel another customer's order (403) ───
    console.log('\n[Test 33] Customer cannot cancel another customer order (403)');
    const r33 = await req('POST', `/orders/${telebirrOrderId}/cancel`, {
      cancellation_reason: 'Customer 2 attacking Customer 1 order',
    }, customer2Token);
    assert(r33.status === 403, `Status 403 Forbidden (got ${r33.status})`);

    // ─── Test 34: Audit logs verified ───
    console.log('\n[Test 34] Audit logs verified for order & shipment actions');
    const [auditRows] = await pool.query(
      `SELECT action, entity_type FROM audit_logs
       WHERE entity_type IN ('order', 'shipment')
       ORDER BY id DESC LIMIT 20`
    );
    const actions = auditRows.map((a) => a.action);
    assert(actions.includes('ORDER_STATUS_UPDATE'), 'Audit log includes ORDER_STATUS_UPDATE');
    assert(actions.includes('ORDER_CANCEL'), 'Audit log includes ORDER_CANCEL');
    assert(actions.includes('SHIPMENT_CREATE'), 'Audit log includes SHIPMENT_CREATE');
    assert(actions.includes('SHIPMENT_STATUS_UPDATE'), 'Audit log includes SHIPMENT_STATUS_UPDATE');

    console.log('\n───────────────────────────────────────────────────────');
    console.log(`  Tests completed: ${passed} passed, ${failed} failed`);
    console.log('───────────────────────────────────────────────────────\n');

    if (failed > 0) {
      process.exitCode = 1;
    }
  } catch (err) {
    console.error('Fatal test error:', err);
    process.exitCode = 1;
  } finally {
    if (server) {
      server.close();
    }
    if (pool) {
      await pool.end();
    }
    process.exit(process.exitCode || 0);
  }
}

runTests();
