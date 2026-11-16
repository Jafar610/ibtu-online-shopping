/**
 * checkout-payment.test.js
 * Automated test suite for Phase 13 / Phase 4 Step 1:
 * Checkout, Order Creation and Manual Payment Verification.
 *
 * Port: 5088
 *
 * Test Scenarios:
 *  1. Create a Telebirr order
 *  2. Create a CBE Birr order
 *  3. Create a bank-transfer order
 *  4. Create a cash-on-delivery order
 *  5. Verify initial payment status
 *  6. Upload a valid receipt
 *  7. Upload an invalid file (disguised content)
 *  8. Upload a file exceeding size limit (> 5MB)
 *  9. Attempt receipt upload without authentication
 * 10. Attempt to upload a receipt for another customer's payment (403)
 * 11. Retrieve pending payments as Admin
 * 12. Attempt payment approval as a Customer (403)
 * 13. Approve a valid payment as Admin
 * 14. Reject a payment with a reason
 * 15. Attempt duplicate approval (400)
 * 16. Attempt to approve an already rejected payment without resubmission (400)
 * 17. Verify customer payment status after approval
 * 18. Verify customer payment status after rejection
 * 19. Verify order payment status remains unpaid after rejection
 * 20. Verify receipt access is restricted
 * 21. Verify audit logs are created
 * 22. Verify database rollback if an approval transaction fails
 */

'use strict';

const http = require('http');
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = require('../src/app');

const TEST_PORT = 5088;
let server;
let pool;

let customer1Id, customer2Id, adminUserId;
let customer1Token, customer2Token, adminToken;
let testAddress1Id, testAddress2Id;
let testCategoryId, testProductId, testVariantId1, testVariantId2;

let telebirrPaymentId, telebirrOrderId;
let cbePaymentId, cbeOrderId;
let bankPaymentId, bankOrderId;
let codPaymentId, codOrderId;

// 1x1 pixel valid PNG buffer
const VALID_PNG_BUFFER = Buffer.from(
  '89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c4890000000a49444154789c63000100000500010d0a2d450000000049454e44ae426082',
  'hex'
);

// Fake image with text content (disguised)
const INVALID_IMAGE_BUFFER = Buffer.from('NOT_AN_IMAGE_DISGUISED_AS_PNG_DATA_FOR_TESTING');

function buildMultipart({ fields = {}, files = [] }) {
  const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);
  const crlf = '\r\n';
  const parts = [];

  for (const [key, value] of Object.entries(fields)) {
    parts.push(
      `--${boundary}${crlf}` +
      `Content-Disposition: form-data; name="${key}"${crlf}${crlf}` +
      `${value}${crlf}`
    );
  }

  for (const file of files) {
    const header =
      `--${boundary}${crlf}` +
      `Content-Disposition: form-data; name="${file.fieldName}"; filename="${file.filename}"${crlf}` +
      `Content-Type: ${file.contentType}${crlf}${crlf}`;
    parts.push(Buffer.from(header, 'utf8'));
    parts.push(file.buffer);
    parts.push(Buffer.from(crlf, 'utf8'));
  }

  parts.push(Buffer.from(`--${boundary}--${crlf}`, 'utf8'));
  const bodyBuffer = Buffer.concat(parts.map((p) => (Buffer.isBuffer(p) ? p : Buffer.from(p, 'utf8'))));

  return {
    contentType: `multipart/form-data; boundary=${boundary}`,
    buffer: bodyBuffer,
  };
}

function req(method, pathName, body = null, token = null, isMultipart = false) {
  return new Promise((resolve, reject) => {
    let payload = null;
    let headers = {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    if (isMultipart && body) {
      payload = body.buffer;
      headers['Content-Type'] = body.contentType;
      headers['Content-Length'] = payload.length;
    } else if (body) {
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

// ─────────────────────────────────────────────
// Test Suite Setup and Execution
// ─────────────────────────────────────────────
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
    console.log(`Checkout & Payment test server running on port ${TEST_PORT}\n`);
  });

  const pwdHash = await bcrypt.hash('Password123!', 10);
  const ts = Date.now();

  try {
    // 1. Create test users
    const [u1] = await pool.query(
      `INSERT INTO users (first_name, last_name, email, password_hash, is_active)
       VALUES ('Abebe', 'Customer', 'abebe_chk_${ts}@example.com', ?, 1)`,
      [pwdHash]
    );
    customer1Id = u1.insertId;

    const [u2] = await pool.query(
      `INSERT INTO users (first_name, last_name, email, password_hash, is_active)
       VALUES ('Chala', 'Customer', 'chala_chk_${ts}@example.com', ?, 1)`,
      [pwdHash]
    );
    customer2Id = u2.insertId;

    const [uAdm] = await pool.query(
      `INSERT INTO users (first_name, last_name, email, password_hash, is_active)
       VALUES ('Admin', 'Boss', 'admin_chk_${ts}@example.com', ?, 1)`,
      [pwdHash]
    );
    adminUserId = uAdm.insertId;

    // Assign roles
    const [[custRole]] = await pool.query("SELECT id FROM roles WHERE name = 'Customer'");
    const [[admRole]] = await pool.query("SELECT id FROM roles WHERE name = 'Admin'");

    await pool.query('INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)', [customer1Id, custRole.id]);
    await pool.query('INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)', [customer2Id, custRole.id]);
    await pool.query('INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)', [adminUserId, admRole.id]);

    // Login tokens
    const l1 = await req('POST', '/auth/login', { email: `abebe_chk_${ts}@example.com`, password: 'Password123!' });
    customer1Token = l1.data.data.token;

    const l2 = await req('POST', '/auth/login', { email: `chala_chk_${ts}@example.com`, password: 'Password123!' });
    customer2Token = l2.data.data.token;

    const lAdm = await req('POST', '/auth/login', { email: `admin_chk_${ts}@example.com`, password: 'Password123!' });
    adminToken = lAdm.data.data.token;

    // 2. Create customer addresses
    const [addr1] = await pool.query(
      `INSERT INTO customer_addresses (user_id, recipient_name, phone, address_line1, city, is_default)
       VALUES (?, 'Abebe Customer', '+251911112233', 'Bole Atlas 12', 'Addis Ababa', 1)`,
      [customer1Id]
    );
    testAddress1Id = addr1.insertId;

    const [addr2] = await pool.query(
      `INSERT INTO customer_addresses (user_id, recipient_name, phone, address_line1, city, is_default)
       VALUES (?, 'Chala Customer', '+251922334455', 'Kazanchis St', 'Addis Ababa', 1)`,
      [customer2Id]
    );
    testAddress2Id = addr2.insertId;

    // 3. Create test product & variants
    const [cat] = await pool.query(
      `INSERT INTO categories (name, slug, is_active) VALUES ('Checkout Cat ${ts}', 'chk-cat-${ts}', 1)`
    );
    testCategoryId = cat.insertId;

    const [prod] = await pool.query(
      `INSERT INTO products (category_id, name, slug, status)
       VALUES (?, 'Tibeb Shawl ${ts}', 'tibeb-shawl-${ts}', 'active')`,
      [testCategoryId]
    );
    testProductId = prod.insertId;

    const [var1] = await pool.query(
      `INSERT INTO product_variants (product_id, sku, size, color, price, sale_price, stock_quantity, reserved_quantity, is_active)
       VALUES (?, 'VAR-TS1-${ts}', 'M', 'White', 1200.00, 1000.00, 50, 0, 1)`,
      [testProductId]
    );
    testVariantId1 = var1.insertId;

    const [var2] = await pool.query(
      `INSERT INTO product_variants (product_id, sku, size, color, price, sale_price, stock_quantity, reserved_quantity, is_active)
       VALUES (?, 'VAR-TS2-${ts}', 'L', 'Gold', 2500.00, NULL, 50, 0, 1)`,
      [testProductId]
    );
    testVariantId2 = var2.insertId;

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
    console.log('  Checkout, Order & Manual Payment Verification Tests');
    console.log('───────────────────────────────────────────────────────\n');

    // ─── Test 1: Create a Telebirr order ───
    console.log('[Test 1] Create a Telebirr order');
    await addVariantToCart(customer1Id, testVariantId1, 2); // 2 * 1000 = 2000 ETB -> free shipping
    const res1 = await req('POST', '/checkout/orders', {
      shipping_address_id: testAddress1Id,
      payment_method: 'telebirr',
      customer_notes: 'Please deliver in morning',
    }, customer1Token);

    assert(res1.status === 201, `Status 201 Created (got ${res1.status})`);
    assert(res1.data.success === true, 'success: true');
    assert(res1.data.data.order && res1.data.data.order.order_number, 'Generated unique order_number');
    assert(res1.data.data.payment.payment_method === 'telebirr', 'Payment method is telebirr');
    assert(res1.data.data.payment.instructions !== null, 'Returned Telebirr payment instructions');
    telebirrOrderId = res1.data.data.order.id;
    telebirrPaymentId = res1.data.data.payment.id;

    // ─── Test 2: Create a CBE Birr order ───
    console.log('\n[Test 2] Create a CBE Birr order');
    await addVariantToCart(customer1Id, testVariantId1, 1); // 1 * 1000 = 1000 + 150 shipping = 1150 ETB
    const res2 = await req('POST', '/checkout/orders', {
      shipping_address_id: testAddress1Id,
      payment_method: 'cbe_birr',
    }, customer1Token);

    assert(res2.status === 201, `Status 201 Created (got ${res2.status})`);
    assert(res2.data.data.payment.payment_method === 'cbe_birr', 'Payment method is cbe_birr');
    assert(res2.data.data.payment.amount === 1150, 'Calculated total with shipping fee (1150 ETB)');
    cbeOrderId = res2.data.data.order.id;
    cbePaymentId = res2.data.data.payment.id;

    // ─── Test 3: Create a bank-transfer order ───
    console.log('\n[Test 3] Create a bank-transfer order');
    await addVariantToCart(customer1Id, testVariantId2, 1); // 2500 ETB
    const res3 = await req('POST', '/checkout/orders', {
      shipping_address_id: testAddress1Id,
      payment_method: 'bank_transfer',
    }, customer1Token);

    assert(res3.status === 201, `Status 201 Created (got ${res3.status})`);
    assert(res3.data.data.payment.payment_method === 'bank_transfer', 'Payment method is bank_transfer');
    assert(res3.data.data.payment.instructions.account_number === '1000123456789', 'Bank account details included');
    bankOrderId = res3.data.data.order.id;
    bankPaymentId = res3.data.data.payment.id;

    // ─── Test 4: Create a cash-on-delivery order ───
    console.log('\n[Test 4] Create a cash-on-delivery order');
    await addVariantToCart(customer1Id, testVariantId1, 1);
    const res4 = await req('POST', '/checkout/orders', {
      shipping_address_id: testAddress1Id,
      payment_method: 'cash_on_delivery',
    }, customer1Token);

    assert(res4.status === 201, `Status 201 Created (got ${res4.status})`);
    assert(res4.data.data.order.payment_status === 'unpaid', 'COD order payment_status is unpaid');
    assert(res4.data.data.payment.verification_status === 'not_required', 'COD verification_status is not_required');
    codOrderId = res4.data.data.order.id;
    codPaymentId = res4.data.data.payment.id;

    // ─── Test 5: Verify initial payment status ───
    console.log('\n[Test 5] Verify initial payment status');
    const res5 = await req('GET', `/payments/${telebirrPaymentId}`, null, customer1Token);
    assert(res5.status === 200, 'Status 200 OK');
    assert(res5.data.data.payment_status === 'pending', 'payment_status is pending');
    assert(res5.data.data.verification_status === 'pending_upload', 'verification_status is pending_upload');
    assert(res5.data.data.receipt_uploaded === false, 'receipt_uploaded is false');

    // ─── Test 6: Upload a valid receipt ───
    console.log('\n[Test 6] Upload a valid receipt');
    const multi6 = buildMultipart({
      files: [{ fieldName: 'receipt', filename: 'telebirr-receipt.png', contentType: 'image/png', buffer: VALID_PNG_BUFFER }],
    });
    const res6 = await req('POST', `/payments/${telebirrPaymentId}/receipt`, multi6, customer1Token, true);
    assert(res6.status === 200, `Status 200 OK (got ${res6.status})`);
    assert(res6.data.data.verification_status === 'awaiting_review', 'verification_status updated to awaiting_review');
    assert(Boolean(res6.data.data.receipt_filename), 'Receipt filename stored in response');

    // Verify order payment status is NOT marked paid automatically
    const [[chkOrder]] = await pool.query('SELECT order_status, payment_status FROM orders WHERE id = ?', [telebirrOrderId]);
    assert(chkOrder.payment_status === 'pending', 'Order payment_status is still pending (not auto-paid)');
    assert(chkOrder.order_status === 'pending', 'Order order_status is still pending');

    // ─── Test 7: Upload an invalid file (disguised content) ───
    console.log('\n[Test 7] Upload an invalid file (disguised non-image content)');
    const multi7 = buildMultipart({
      files: [{ fieldName: 'receipt', filename: 'fake-receipt.png', contentType: 'image/png', buffer: INVALID_IMAGE_BUFFER }],
    });
    const res7 = await req('POST', `/payments/${cbePaymentId}/receipt`, multi7, customer1Token, true);
    assert(res7.status === 400, `Status 400 Bad Request for fake image (got ${res7.status})`);

    // ─── Test 8: Upload a file exceeding size limit (> 5MB) ───
    console.log('\n[Test 8] Upload a file exceeding size limit (> 5MB)');
    const bigBuffer = Buffer.alloc(5.5 * 1024 * 1024, 0xff); // 5.5MB
    const multi8 = buildMultipart({
      files: [{ fieldName: 'receipt', filename: 'oversized.jpg', contentType: 'image/jpeg', buffer: bigBuffer }],
    });
    const res8 = await req('POST', `/payments/${cbePaymentId}/receipt`, multi8, customer1Token, true);
    assert(res8.status === 400, `Status 400 Bad Request for oversized file (got ${res8.status})`);

    // ─── Test 9: Attempt receipt upload without authentication ───
    console.log('\n[Test 9] Attempt receipt upload without authentication');
    const res9 = await req('POST', `/payments/${cbePaymentId}/receipt`, multi6, null, true);
    assert(res9.status === 401, `Status 401 Unauthorized (got ${res9.status})`);

    // ─── Test 10: Attempt to upload a receipt for another customer's payment ───
    console.log('\n[Test 10] Attempt to upload a receipt for another customer\'s payment');
    const res10 = await req('POST', `/payments/${cbePaymentId}/receipt`, multi6, customer2Token, true);
    assert(res10.status === 403, `Status 403 Forbidden for cross-customer upload (got ${res10.status})`);

    // Now upload a valid receipt for CBE Birr by customer 1
    const res10b = await req('POST', `/payments/${cbePaymentId}/receipt`, multi6, customer1Token, true);
    assert(res10b.status === 200, 'Uploaded valid receipt for CBE Birr payment');

    // ─── Test 11: Retrieve pending payments as Admin ───
    console.log('\n[Test 11] Retrieve pending payments as Admin');
    const res11 = await req('GET', '/admin/payments/pending', null, adminToken);
    assert(res11.status === 200, `Status 200 OK (got ${res11.status})`);
    assert(res11.data.data.total >= 2, `Returns pending payments (found ${res11.data.data.total})`);
    const foundTelebirr = res11.data.data.payments.find((p) => p.payment_id === telebirrPaymentId);
    assert(Boolean(foundTelebirr), 'Telebirr payment found in pending list');
    assert(foundTelebirr && foundTelebirr.verification_status === 'awaiting_review', 'Verification status is awaiting_review');

    // ─── Test 12: Attempt payment approval as a Customer ───
    console.log('\n[Test 12] Attempt payment approval as a Customer');
    const res12 = await req('PATCH', `/admin/payments/${telebirrPaymentId}/approve`, {}, customer1Token);
    assert(res12.status === 403, `Status 403 Forbidden for Customer approving payment (got ${res12.status})`);

    // ─── Test 13: Approve a valid payment as Admin ───
    console.log('\n[Test 13] Approve a valid payment as Admin');
    const res13 = await req('PATCH', `/admin/payments/${telebirrPaymentId}/approve`, {}, adminToken);
    assert(res13.status === 200, `Status 200 OK (got ${res13.status})`);
    assert(res13.data.data.payment_status === 'successful', 'Payment status updated to successful');
    assert(res13.data.data.order_payment_status === 'paid', 'Order payment status updated to paid');
    assert(res13.data.data.order_status === 'confirmed', 'Order order_status updated to confirmed');

    // ─── Test 14: Reject a payment with a reason ───
    console.log('\n[Test 14] Reject a payment with a reason');
    const res14 = await req('PATCH', `/admin/payments/${cbePaymentId}/reject`, {
      rejection_reason: 'The transaction reference does not match our bank statement amount.',
    }, adminToken);
    assert(res14.status === 200, `Status 200 OK (got ${res14.status})`);
    assert(res14.data.data.verification_status === 'rejected', 'Verification status is rejected');
    assert(res14.data.data.rejection_reason.includes('bank statement'), 'Rejection reason is recorded');

    // ─── Test 15: Attempt duplicate approval ───
    console.log('\n[Test 15] Attempt duplicate approval on already approved payment');
    const res15 = await req('PATCH', `/admin/payments/${telebirrPaymentId}/approve`, {}, adminToken);
    assert(res15.status === 400, `Status 400 Bad Request for duplicate approval (got ${res15.status})`);

    // ─── Test 16: Attempt to approve an already rejected payment without resubmission ───
    console.log('\n[Test 16] Attempt to approve an already rejected payment without resubmission');
    const res16 = await req('PATCH', `/admin/payments/${cbePaymentId}/approve`, {}, adminToken);
    assert(res16.status === 400, `Status 400 Bad Request for approving rejected payment without resubmission (got ${res16.status})`);

    // ─── Test 17: Verify customer payment status after approval ───
    console.log('\n[Test 17] Verify customer payment status after approval');
    const res17 = await req('GET', `/payments/${telebirrPaymentId}`, null, customer1Token);
    assert(res17.status === 200, 'Status 200 OK');
    assert(res17.data.data.payment_status === 'successful', 'Customer sees payment_status: successful');
    assert(res17.data.data.verification_status === 'successful', 'Customer sees verification_status: successful');
    assert(Boolean(res17.data.data.paid_at), 'Customer sees paid_at timestamp');
    assert(Boolean(res17.data.data.reviewed_by), 'Customer sees reviewed_by');

    // ─── Test 18: Verify customer payment status after rejection ───
    console.log('\n[Test 18] Verify customer payment status after rejection');
    const res18 = await req('GET', `/payments/${cbePaymentId}`, null, customer1Token);
    assert(res18.status === 200, 'Status 200 OK');
    assert(res18.data.data.verification_status === 'rejected', 'Customer sees verification_status: rejected');
    assert(res18.data.data.rejection_reason.includes('bank statement'), 'Customer sees clear rejection reason');

    // ─── Test 19: Verify order payment status remains unpaid after rejection ───
    console.log('\n[Test 19] Verify order payment status remains unpaid after rejection');
    const res19 = await req('GET', `/orders/${cbeOrderId}`, null, customer1Token);
    assert(res19.status === 200, 'Status 200 OK');
    assert(res19.data.data.order.payment_status === 'unpaid', 'Order payment_status remains unpaid');
    assert(res19.data.data.order.order_status === 'pending', 'Order order_status remains pending');

    // ─── Test 20: Verify receipt access is restricted ───
    console.log('\n[Test 20] Verify receipt access is restricted');
    const res20a = await req('GET', `/payments/${telebirrPaymentId}/receipt`, null, null);
    assert(res20a.status === 401, 'Unauthenticated receipt access returns 401');

    const res20b = await req('GET', `/payments/${telebirrPaymentId}/receipt`, null, customer2Token);
    assert(res20b.status === 403, 'Unauthorized customer receipt access returns 403');

    const res20c = await req('GET', `/payments/${telebirrPaymentId}/receipt`, null, customer1Token);
    assert(res20c.status === 200, 'Owning customer can stream receipt (200 OK)');
    assert(res20c.headers['content-type'].includes('image/png'), 'Content-Type is image/png');

    const res20d = await req('GET', `/payments/${telebirrPaymentId}/receipt`, null, adminToken);
    assert(res20d.status === 200, 'Admin can stream receipt (200 OK)');

    // ─── Test 21: Verify audit logs are created ───
    console.log('\n[Test 21] Verify audit logs are created');
    const [auditRows] = await pool.query(
      `SELECT * FROM audit_logs
       WHERE entity_type = 'payment' AND entity_id IN (?, ?)
       ORDER BY created_at ASC`,
      [telebirrPaymentId, cbePaymentId]
    );
    assert(auditRows.length >= 2, `Audit logs created for approve and reject (count: ${auditRows.length})`);
    const approveLog = auditRows.find((l) => l.action === 'PAYMENT_APPROVE');
    const rejectLog = auditRows.find((l) => l.action === 'PAYMENT_REJECT');
    assert(Boolean(approveLog), 'PAYMENT_APPROVE audit log entry recorded');
    assert(Boolean(rejectLog), 'PAYMENT_REJECT audit log entry recorded');

    // ─── Test 22: Verify database rollback if an approval transaction fails ───
    console.log('\n[Test 22] Verify database rollback if an approval transaction fails');
    // Upload receipt for bank transfer order
    await req('POST', `/payments/${bankPaymentId}/receipt`, multi6, customer1Token, true);

    const PaymentService = require('../src/services/payment.service');
    let rollbackErrorCaught = false;
    try {
      await PaymentService.approvePayment(bankPaymentId, {
        id: adminUserId,
        first_name: 'Admin',
        last_name: 'Boss',
        roles: ['Admin'],
        _simulateRollback: true,
      });
    } catch (err) {
      if (err.message === 'SIMULATED_TRANSACTION_ROLLBACK_TEST') {
        rollbackErrorCaught = true;
      }
    }
    assert(rollbackErrorCaught === true, 'Approval transaction error caught');

    // Check payment status was not modified (rollback successful)
    const [[postRollback]] = await pool.query('SELECT payment_status, paid_at FROM payments WHERE id = ?', [bankPaymentId]);
    assert(postRollback.payment_status === 'processing', 'Payment status rolled back safely (remains processing)');
    assert(postRollback.paid_at === null, 'paid_at timestamp rolled back (remains null)');

    console.log('\n───────────────────────────────────────────────────────');
    console.log(`  Results: ${passed} passed, ${failed} failed`);
    console.log('───────────────────────────────────────────────────────\n');

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Test execution error:', err);
    process.exit(1);
  } finally {
    // Clean up created records
    try {
      if (customer1Id) {
        await pool.query('DELETE FROM cart_items WHERE cart_id IN (SELECT id FROM carts WHERE user_id = ?)', [customer1Id]);
        await pool.query('DELETE FROM carts WHERE user_id = ?', [customer1Id]);
        await pool.query('DELETE FROM order_items WHERE order_id IN (?, ?, ?, ?)', [telebirrOrderId, cbeOrderId, bankOrderId, codOrderId]);
        await pool.query('DELETE FROM payments WHERE order_id IN (?, ?, ?, ?)', [telebirrOrderId, cbeOrderId, bankOrderId, codOrderId]);
        await pool.query('DELETE FROM inventory_movements WHERE reference_id IN (?, ?, ?, ?)', [telebirrOrderId, cbeOrderId, bankOrderId, codOrderId]);
        await pool.query('DELETE FROM orders WHERE user_id IN (?, ?)', [customer1Id, customer2Id]);
        await pool.query('DELETE FROM customer_addresses WHERE user_id IN (?, ?)', [customer1Id, customer2Id]);
        await pool.query('DELETE FROM user_roles WHERE user_id IN (?, ?, ?)', [customer1Id, customer2Id, adminUserId]);
        await pool.query('DELETE FROM users WHERE id IN (?, ?, ?)', [customer1Id, customer2Id, adminUserId]);
      }
      if (testProductId) {
        await pool.query('DELETE FROM product_variants WHERE product_id = ?', [testProductId]);
        await pool.query('DELETE FROM products WHERE id = ?', [testProductId]);
      }
      if (testCategoryId) {
        await pool.query('DELETE FROM categories WHERE id = ?', [testCategoryId]);
      }
    } catch (cleanErr) {
      console.error('Cleanup error:', cleanErr.message);
    }

    if (pool) await pool.end();
    if (server) server.close();
    process.exit(0);
  }
}

runTests();
