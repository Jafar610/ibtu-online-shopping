/**
 * coupon.test.js
 * Automated test suite for Phase 14 / Phase 4 Step 2:
 * Coupon and Discount Management API.
 *
 * Port: 5087
 *
 * Test Scenarios:
 * Admin Tests:
 *   1. Create a percentage coupon
 *   2. Create a fixed discount coupon
 *   3. Attempt a duplicate coupon code (409)
 *   4. Create a coupon with invalid dates (422)
 *   5. Create a coupon with invalid discount values (422)
 *   6. Retrieve all coupons (pagination)
 *   7. Search coupons
 *   8. Filter active and inactive coupons
 *   9. Update a coupon
 *  10. Deactivate a coupon
 *  11. Reactivate a coupon
 *  12. View coupon usage statistics
 *
 * Customer Tests:
 *  13. Validate a valid coupon
 *  14. Validate an unknown coupon (404)
 *  15. Validate an inactive coupon (400)
 *  16. Validate an expired coupon (400)
 *  17. Validate a coupon before its start date (400)
 *  18. Validate a coupon below the minimum order amount (400)
 *  19. Validate an exhausted coupon (400)
 *  20. Validate a coupon after reaching per-customer usage limit (400)
 *  21. Test percentage discount calculation
 *  22. Test fixed discount calculation
 *  23. Test maximum discount limits
 *  24. Attempt to submit a manipulated discount amount
 *
 * Checkout Integration Tests:
 *  25. Create an eligible order with a coupon
 *  26. Verify order discount snapshot
 *  27. Verify reserved coupon usage in database
 *  28. Approve payment and verify usage becomes applied
 *  29. Reject payment and verify usage is released (cancelled + counter decremented)
 *  30. Cancel an eligible order and verify coupon counters
 *  31. Test simultaneous orders competing for the last coupon usage (concurrency)
 *  32. Verify transaction rollback after a failure
 */

'use strict';

const http = require('http');
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
require('dotenv').config();

const app = require('../src/app');

const TEST_PORT = 5087;
let server;
let pool;

let customer1Id, customer2Id, adminUserId;
let customer1Token, customer2Token, adminToken;
let testAddress1Id, testAddress2Id;
let testCategoryId, testProductId, testVariantId;

let percentageCouponId, fixedCouponId, cappedCouponId, exhaustedCouponId, futureCouponId, expiredCouponId;
let order1Id, payment1Id;
let order2Id, payment2Id;
let order3Id, payment3Id;

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

async function clearCart(userId) {
  const [[cart]] = await pool.query('SELECT id FROM carts WHERE user_id = ?', [userId]);
  if (cart) {
    await pool.query('DELETE FROM cart_items WHERE cart_id = ?', [cart.id]);
  }
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
    console.log(`Coupon test server running on port ${TEST_PORT}\n`);
  });

  const pwdHash = await bcrypt.hash('Password123!', 10);
  const ts = Date.now();

  try {
    // 1. Create test users
    const [u1] = await pool.query(
      `INSERT INTO users (first_name, last_name, email, password_hash, is_active)
       VALUES ('Abebe', 'CouponUser', 'abebe_cpn_${ts}@example.com', ?, 1)`,
      [pwdHash]
    );
    customer1Id = u1.insertId;

    const [u2] = await pool.query(
      `INSERT INTO users (first_name, last_name, email, password_hash, is_active)
       VALUES ('Chala', 'CouponUser', 'chala_cpn_${ts}@example.com', ?, 1)`,
      [pwdHash]
    );
    customer2Id = u2.insertId;

    const [uAdm] = await pool.query(
      `INSERT INTO users (first_name, last_name, email, password_hash, is_active)
       VALUES ('Admin', 'CouponBoss', 'admin_cpn_${ts}@example.com', ?, 1)`,
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
    const l1 = await req('POST', '/auth/login', { email: `abebe_cpn_${ts}@example.com`, password: 'Password123!' });
    customer1Token = l1.data.data.token;

    const l2 = await req('POST', '/auth/login', { email: `chala_cpn_${ts}@example.com`, password: 'Password123!' });
    customer2Token = l2.data.data.token;

    const lAdm = await req('POST', '/auth/login', { email: `admin_cpn_${ts}@example.com`, password: 'Password123!' });
    adminToken = lAdm.data.data.token;

    // 2. Addresses
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

    // 3. Product & Variant for cart
    const [cat] = await pool.query(
      `INSERT INTO categories (name, slug, is_active) VALUES ('Coupon Cat ${ts}', 'cpn-cat-${ts}', 1)`
    );
    testCategoryId = cat.insertId;

    const [prod] = await pool.query(
      `INSERT INTO products (category_id, name, slug, status)
       VALUES (?, 'Habesha Tibeb ${ts}', 'habesha-tibeb-${ts}', 'active')`,
      [testCategoryId]
    );
    testProductId = prod.insertId;

    const [var1] = await pool.query(
      `INSERT INTO product_variants (product_id, sku, size, color, price, sale_price, stock_quantity, reserved_quantity, is_active)
       VALUES (?, 'VAR-CPN-${ts}', 'M', 'White', 2000.00, NULL, 50, 0, 1)`,
      [testProductId]
    );
    testVariantId = var1.insertId;

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
    console.log('  Coupon & Discount Management API Tests');
    console.log('───────────────────────────────────────────────────────\n');

    // ==========================================
    // ADMIN TESTS (1 - 12)
    // ==========================================

    // Test 1: Create a percentage coupon
    console.log('[Test 1] Create a percentage coupon');
    const res1 = await req('POST', '/admin/coupons', {
      code: `WELCOME10_${ts}`,
      description: 'Welcome discount for new customers',
      discount_type: 'percentage',
      discount_value: 10,
      minimum_order_amount: 1000,
      maximum_discount_amount: 500,
      usage_limit: 100,
      usage_limit_per_customer: 1,
      is_active: true,
    }, adminToken);

    assert(res1.status === 201, `Status 201 Created (got ${res1.status})`);
    assert(res1.data.data.discount_type === 'percentage', 'discount_type is percentage');
    assert(res1.data.data.discount_value === 10, 'discount_value is 10');
    percentageCouponId = res1.data.data.id;

    // Test 2: Create a fixed discount coupon
    console.log('\n[Test 2] Create a fixed discount coupon');
    const res2 = await req('POST', '/admin/coupons', {
      code: `SAVE300_${ts}`,
      description: 'Flat 300 ETB discount on orders over 1500',
      discount_type: 'fixed',
      discount_value: 300,
      minimum_order_amount: 1500,
      usage_limit: 50,
      usage_limit_per_customer: 2,
      is_active: true,
    }, adminToken);

    assert(res2.status === 201, `Status 201 Created (got ${res2.status})`);
    assert(res2.data.data.discount_type === 'fixed', 'discount_type is fixed');
    assert(res2.data.data.discount_value === 300, 'discount_value is 300');
    fixedCouponId = res2.data.data.id;

    // Test 3: Attempt a duplicate coupon code
    console.log('\n[Test 3] Attempt duplicate coupon code');
    const res3 = await req('POST', '/admin/coupons', {
      code: `WELCOME10_${ts}`,
      discount_type: 'percentage',
      discount_value: 15,
    }, adminToken);
    assert(res3.status === 409, `Status 409 Conflict for duplicate code (got ${res3.status})`);

    // Test 4: Create a coupon with invalid dates (expires_at < starts_at)
    console.log('\n[Test 4] Create a coupon with invalid dates');
    const res4 = await req('POST', '/admin/coupons', {
      code: `DATEFAIL_${ts}`,
      discount_type: 'fixed',
      discount_value: 50,
      starts_at: '2026-12-01T00:00:00Z',
      expires_at: '2026-11-01T00:00:00Z', // Earlier than starts_at
    }, adminToken);
    assert(res4.status === 422, `Status 422 Unprocessable for invalid date sequence (got ${res4.status})`);

    // Test 5: Create a coupon with invalid discount values (> 100% or negative)
    console.log('\n[Test 5] Create a coupon with invalid discount values');
    const res5 = await req('POST', '/admin/coupons', {
      code: `VALFAIL_${ts}`,
      discount_type: 'percentage',
      discount_value: 150, // > 100%
    }, adminToken);
    assert(res5.status === 422, `Status 422 Unprocessable for percentage > 100 (got ${res5.status})`);

    // Test 6: Retrieve all coupons (pagination)
    console.log('\n[Test 6] Retrieve all coupons with pagination');
    const res6 = await req('GET', '/admin/coupons?page=1&limit=2', null, adminToken);
    assert(res6.status === 200, 'Status 200 OK');
    assert(res6.data.data.coupons.length === 2, 'Returns 2 coupons per page');
    assert(res6.data.data.pagination.total >= 2, 'Total coupons >= 2');

    // Test 7: Search coupons
    console.log('\n[Test 7] Search coupons');
    const res7 = await req('GET', `/admin/coupons?search=SAVE300`, null, adminToken);
    assert(res7.status === 200, 'Status 200 OK');
    assert(res7.data.data.coupons.length >= 1, 'Found searched coupon');
    assert(res7.data.data.coupons[0].code.includes('SAVE300'), 'Code matches search query');

    // Test 8: Filter active and inactive coupons
    console.log('\n[Test 8] Filter active and inactive coupons');
    // Create an inactive coupon
    const resInact = await req('POST', '/admin/coupons', {
      code: `INACTIVE_${ts}`,
      discount_type: 'fixed',
      discount_value: 50,
      is_active: false,
    }, adminToken);
    const inactiveCouponId = resInact.data.data.id;

    const res8Active = await req('GET', '/admin/coupons?is_active=true', null, adminToken);
    assert(res8Active.status === 200, 'Status 200 for active filter');
    const foundInactiveInActiveList = res8Active.data.data.coupons.find(c => c.id === inactiveCouponId);
    assert(!foundInactiveInActiveList, 'Inactive coupon excluded from active filter');

    const res8Inactive = await req('GET', '/admin/coupons?is_active=false', null, adminToken);
    assert(res8Inactive.status === 200, 'Status 200 for inactive filter');
    const foundInactive = res8Inactive.data.data.coupons.find(c => c.id === inactiveCouponId);
    assert(Boolean(foundInactive), 'Inactive coupon found in inactive filter');

    // Test 9: Update a coupon
    console.log('\n[Test 9] Update a coupon');
    const res9 = await req('PUT', `/admin/coupons/${fixedCouponId}`, {
      description: 'Updated description for SAVE300',
      minimum_order_amount: 1800,
    }, adminToken);
    assert(res9.status === 200, 'Status 200 OK');
    assert(res9.data.data.description === 'Updated description for SAVE300', 'Description updated');
    assert(res9.data.data.minimum_order_amount === 1800, 'minimum_order_amount updated');

    // Restore min order for later tests
    await req('PUT', `/admin/coupons/${fixedCouponId}`, { minimum_order_amount: 1500 }, adminToken);

    // Test 10: Deactivate a coupon
    console.log('\n[Test 10] Deactivate a coupon');
    const res10 = await req('PATCH', `/admin/coupons/${fixedCouponId}/status`, { is_active: false }, adminToken);
    assert(res10.status === 200, 'Status 200 OK');
    assert(res10.data.data.is_active === false, 'is_active is false');

    // Test 11: Reactivate a coupon
    console.log('\n[Test 11] Reactivate a coupon');
    const res11 = await req('PATCH', `/admin/coupons/${fixedCouponId}/status`, { is_active: true }, adminToken);
    assert(res11.status === 200, 'Status 200 OK');
    assert(res11.data.data.is_active === true, 'is_active is true');

    // Test 12: View coupon usage statistics
    console.log('\n[Test 12] View coupon usage statistics');
    const res12 = await req('GET', `/admin/coupons/${percentageCouponId}`, null, adminToken);
    assert(res12.status === 200, 'Status 200 OK');
    assert(res12.data.data.stats !== undefined, 'Stats object included in coupon details');
    assert(res12.data.data.stats.total_usages === 0, 'Initial total_usages is 0');

    // ==========================================
    // CUSTOMER TESTS (13 - 24)
    // ==========================================

    // Test 13: Validate a valid coupon
    console.log('\n[Test 13] Validate a valid coupon');
    await addVariantToCart(customer1Id, testVariantId, 1); // 2000 ETB
    const res13 = await req('POST', '/coupons/validate', { code: `WELCOME10_${ts}` }, customer1Token);
    assert(res13.status === 200, `Status 200 OK (got ${res13.status})`);
    assert(res13.data.data.valid === true, 'valid: true');
    assert(res13.data.data.subtotal === 2000, 'subtotal is 2000');
    assert(res13.data.data.discount_amount === 200, 'discount_amount is 200 (10% of 2000)');
    assert(res13.data.data.total_after_discount === 1800, 'total_after_discount is 1800');

    // Test 14: Validate an unknown coupon
    console.log('\n[Test 14] Validate an unknown coupon');
    const res14 = await req('POST', '/coupons/validate', { code: 'NONEXISTENT_CODE_XYZ' }, customer1Token);
    assert(res14.status === 404, `Status 404 Not Found (got ${res14.status})`);

    // Test 15: Validate an inactive coupon
    console.log('\n[Test 15] Validate an inactive coupon');
    const res15 = await req('POST', '/coupons/validate', { code: `INACTIVE_${ts}` }, customer1Token);
    assert(res15.status === 400, `Status 400 Bad Request (got ${res15.status})`);
    assert(res15.data.message.includes('inactive'), 'Clear inactive message');

    // Test 16: Validate an expired coupon
    console.log('\n[Test 16] Validate an expired coupon');
    const [cExp] = await pool.query(
      `INSERT INTO coupons (code, discount_type, discount_value, expires_at, is_active)
       VALUES ('EXPIRED_${ts}', 'fixed', 100, DATE_SUB(NOW(), INTERVAL 1 DAY), 1)`
    );
    expiredCouponId = cExp.insertId;

    const res16 = await req('POST', '/coupons/validate', { code: `EXPIRED_${ts}` }, customer1Token);
    assert(res16.status === 400, `Status 400 Bad Request (got ${res16.status})`);
    assert(res16.data.message.includes('expired'), 'Clear expired message');

    // Test 17: Validate a coupon before its start date
    console.log('\n[Test 17] Validate a coupon before its start date');
    const [cFuture] = await pool.query(
      `INSERT INTO coupons (code, discount_type, discount_value, starts_at, is_active)
       VALUES ('FUTURE_${ts}', 'fixed', 100, DATE_ADD(NOW(), INTERVAL 5 DAY), 1)`
    );
    futureCouponId = cFuture.insertId;

    const res17 = await req('POST', '/coupons/validate', { code: `FUTURE_${ts}` }, customer1Token);
    assert(res17.status === 400, `Status 400 Bad Request (got ${res17.status})`);
    assert(res17.data.message.includes('not active yet'), 'Clear not active yet message');

    // Test 18: Validate a coupon below minimum order amount
    console.log('\n[Test 18] Validate a coupon below minimum order amount');
    const [cHighMin] = await pool.query(
      `INSERT INTO coupons (code, discount_type, discount_value, minimum_order_amount, is_active)
       VALUES ('MIN5000_${ts}', 'fixed', 500, 5000, 1)`
    );

    const res18 = await req('POST', '/coupons/validate', { code: `MIN5000_${ts}` }, customer1Token);
    assert(res18.status === 400, `Status 400 Bad Request (got ${res18.status})`);
    assert(res18.data.message.includes('minimum required amount'), 'Clear minimum required message');

    // Test 19: Validate an exhausted coupon (usage_limit reached)
    console.log('\n[Test 19] Validate an exhausted coupon');
    const [cExh] = await pool.query(
      `INSERT INTO coupons (code, discount_type, discount_value, usage_limit, usage_count, is_active)
       VALUES ('EXHAUSTED_${ts}', 'fixed', 100, 1, 1, 1)`
    );
    exhaustedCouponId = cExh.insertId;

    const res19 = await req('POST', '/coupons/validate', { code: `EXHAUSTED_${ts}` }, customer1Token);
    assert(res19.status === 400, `Status 400 Bad Request (got ${res19.status})`);
    assert(res19.data.message.includes('usage limit'), 'Clear usage limit message');

    // Test 20: Validate a coupon after reaching per-customer usage limit
    console.log('\n[Test 20] Validate a coupon after reaching per-customer usage limit');
    // Pre-insert a usage for customer 1
    const [cOnePer] = await pool.query(
      `INSERT INTO coupons (code, discount_type, discount_value, usage_limit_per_customer, is_active)
       VALUES ('ONEPERCUST_${ts}', 'fixed', 100, 1, 1)`
    );
    const onePerCustId = cOnePer.insertId;

    // Insert dummy order to attach usage
    const [dOrder] = await pool.query(
      `INSERT INTO orders (order_number, user_id, customer_name, customer_phone, total_amount, order_status, payment_status)
       VALUES ('DUMMY-ORD-${ts}', ?, 'Abebe Customer', '+251911112233', 1000, 'pending', 'unpaid')`,
      [customer1Id]
    );
    await pool.query(
      `INSERT INTO coupon_usages (coupon_id, user_id, order_id, discount_amount, usage_status)
       VALUES (?, ?, ?, 100, 'applied')`,
      [onePerCustId, customer1Id, dOrder.insertId]
    );

    const res20 = await req('POST', '/coupons/validate', { code: `ONEPERCUST_${ts}` }, customer1Token);
    assert(res20.status === 400, `Status 400 Bad Request (got ${res20.status})`);
    assert(res20.data.message.includes('maximum usage limit (1)'), 'Clear per-customer usage limit message');

    // Test 21: Percentage discount calculation
    console.log('\n[Test 21] Percentage discount calculation');
    const res21 = await req('POST', '/coupons/validate', { code: `WELCOME10_${ts}` }, customer1Token);
    assert(res21.status === 200, 'Status 200 OK');
    assert(res21.data.data.discount_amount === 200, 'Calculates 10% of 2000 ETB = 200 ETB');

    // Test 22: Fixed discount calculation
    console.log('\n[Test 22] Fixed discount calculation');
    const res22 = await req('POST', '/coupons/validate', { code: `SAVE300_${ts}` }, customer1Token);
    assert(res22.status === 200, 'Status 200 OK');
    assert(res22.data.data.discount_amount === 300, 'Calculates fixed 300 ETB discount');
    assert(res22.data.data.total_after_discount === 1700, 'total_after_discount is 1700 ETB');

    // Test 23: Test maximum discount limits
    console.log('\n[Test 23] Test maximum discount limits');
    // Set 50% discount with 500 ETB max cap on 2000 ETB subtotal (50% would be 1000 ETB, but capped at 500)
    const [cCap] = await pool.query(
      `INSERT INTO coupons (code, discount_type, discount_value, maximum_discount_amount, is_active)
       VALUES ('MAXCAP_${ts}', 'percentage', 50, 500, 1)`
    );
    cappedCouponId = cCap.insertId;

    const res23 = await req('POST', '/coupons/validate', { code: `MAXCAP_${ts}` }, customer1Token);
    assert(res23.status === 200, 'Status 200 OK');
    assert(res23.data.data.discount_amount === 500, 'Discount capped at maximum_discount_amount (500 ETB)');

    // Test 24: Attempt to submit a manipulated discount amount
    console.log('\n[Test 24] Attempt to submit manipulated discount amount during checkout preview');
    const res24 = await req('POST', '/checkout/preview', {
      shipping_address_id: testAddress1Id,
      coupon_code: `WELCOME10_${ts}`,
      discount_amount: 999999, // Fake frontend discount
    }, customer1Token);
    assert(res24.status === 200, 'Status 200 OK');
    assert(res24.data.data.discount_amount === 200, 'Server recalculated discount (200 ETB), ignoring manipulated input');

    // ==========================================
    // CHECKOUT INTEGRATION TESTS (25 - 32)
    // ==========================================

    // Test 25: Create an eligible order with a coupon
    console.log('\n[Test 25] Create an eligible order with a coupon');
    const res25 = await req('POST', '/checkout/orders', {
      shipping_address_id: testAddress1Id,
      payment_method: 'telebirr',
      coupon_code: `WELCOME10_${ts}`,
    }, customer1Token);

    assert(res25.status === 201, `Status 201 Created (got ${res25.status})`);
    assert(res25.data.data.order.discount_amount === 200, 'Order created with discount_amount: 200');
    assert(res25.data.data.order.total_amount === 1800, 'Total amount reduced to 1800 ETB');
    assert(res25.data.data.order.coupon.code === `WELCOME10_${ts}`, 'Order confirmation includes coupon code');
    order1Id = res25.data.data.order.id;
    payment1Id = res25.data.data.payment.id;

    // Test 26: Verify order discount snapshot in database
    console.log('\n[Test 26] Verify order discount snapshot in database');
    const [[savedOrder]] = await pool.query('SELECT subtotal, discount_amount, total_amount FROM orders WHERE id = ?', [order1Id]);
    assert(parseFloat(savedOrder.discount_amount) === 200.0, 'orders.discount_amount is 200.00');
    assert(parseFloat(savedOrder.total_amount) === 1800.0, 'orders.total_amount is 1800.00');

    // Test 27: Verify reserved coupon usage in database
    console.log('\n[Test 27] Verify reserved coupon usage');
    const [[usageRow]] = await pool.query(
      'SELECT * FROM coupon_usages WHERE order_id = ? AND coupon_id = ?',
      [order1Id, percentageCouponId]
    );
    assert(Boolean(usageRow), 'coupon_usages record created');
    assert(usageRow.usage_status === 'reserved', 'usage_status is "reserved"');
    assert(parseFloat(usageRow.discount_amount) === 200.0, 'usage discount_amount is 200.00');

    // Check usage_count incremented
    const [[cpnAfterRes]] = await pool.query('SELECT usage_count FROM coupons WHERE id = ?', [percentageCouponId]);
    assert(cpnAfterRes.usage_count === 1, 'coupons.usage_count incremented to 1');

    // Test 28: Approve payment and verify usage becomes applied
    console.log('\n[Test 28] Approve payment and verify usage becomes applied');
    // Upload receipt first
    const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);
    const crlf = '\r\n';
    const VALID_PNG_BUFFER = Buffer.from(
      '89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c4890000000a49444154789c63000100000500010d0a2d450000000049454e44ae426082',
      'hex'
    );
    const parts = [
      Buffer.from(`--${boundary}${crlf}Content-Disposition: form-data; name="receipt"; filename="receipt.png"${crlf}Content-Type: image/png${crlf}${crlf}`),
      VALID_PNG_BUFFER,
      Buffer.from(`${crlf}--${boundary}--${crlf}`),
    ];
    const receiptBody = {
      buffer: Buffer.concat(parts),
      contentType: `multipart/form-data; boundary=${boundary}`,
    };

    // Helper for multipart in this test file
    function reqMulti(pathName, body, token) {
      return new Promise((resolve, reject) => {
        const opts = {
          hostname: 'localhost',
          port: TEST_PORT,
          path: `/api${pathName}`,
          method: 'POST',
          headers: {
            'Content-Type': body.contentType,
            'Content-Length': body.buffer.length,
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        };
        const r = http.request(opts, (res) => {
          let data = '';
          res.on('data', c => data += c);
          res.on('end', () => resolve({ status: res.statusCode, data: JSON.parse(data) }));
        });
        r.on('error', reject);
        r.write(body.buffer);
        r.end();
      });
    }

    await reqMulti(`/payments/${payment1Id}/receipt`, receiptBody, customer1Token);

    // Admin approves payment
    const res28 = await req('PATCH', `/admin/payments/${payment1Id}/approve`, {}, adminToken);
    assert(res28.status === 200, 'Status 200 OK for payment approval');

    // Verify coupon_usage status transitioned to 'applied'
    const [[usageAfterApprove]] = await pool.query(
      'SELECT usage_status FROM coupon_usages WHERE order_id = ? AND coupon_id = ?',
      [order1Id, percentageCouponId]
    );
    assert(usageAfterApprove.usage_status === 'applied', 'coupon_usages.usage_status is now "applied"');

    // Test 29: Reject payment and verify usage is released according to policy
    console.log('\n[Test 29] Reject payment and verify usage is released');
    // Create order 2 with SAVE300
    await addVariantToCart(customer1Id, testVariantId, 1);
    const resOrder2 = await req('POST', '/checkout/orders', {
      shipping_address_id: testAddress1Id,
      payment_method: 'cbe_birr',
      coupon_code: `SAVE300_${ts}`,
    }, customer1Token);

    order2Id = resOrder2.data.data.order.id;
    payment2Id = resOrder2.data.data.payment.id;

    // Check usage reserved
    const [[usage2Before]] = await pool.query(
      'SELECT usage_status FROM coupon_usages WHERE order_id = ?',
      [order2Id]
    );
    assert(usage2Before.usage_status === 'reserved', 'Order 2 usage is reserved');

    const [[cpn2Before]] = await pool.query('SELECT usage_count FROM coupons WHERE id = ?', [fixedCouponId]);
    const prevCount = cpn2Before.usage_count;

    // Upload receipt & Admin rejects payment
    await reqMulti(`/payments/${payment2Id}/receipt`, receiptBody, customer1Token);
    const res29 = await req('PATCH', `/admin/payments/${payment2Id}/reject`, {
      rejection_reason: 'Amount does not match receipt',
    }, adminToken);
    assert(res29.status === 200, 'Status 200 OK for payment rejection');

    // Verify usage status cancelled and counter decremented
    const [[usage2After]] = await pool.query(
      'SELECT usage_status FROM coupon_usages WHERE order_id = ?',
      [order2Id]
    );
    assert(usage2After.usage_status === 'cancelled', 'coupon_usages.usage_status changed to "cancelled"');

    const [[cpn2After]] = await pool.query('SELECT usage_count FROM coupons WHERE id = ?', [fixedCouponId]);
    assert(cpn2After.usage_count === prevCount - 1, 'coupons.usage_count safely decremented');

    // Test 30: Cancel an eligible order and verify coupon counters
    console.log('\n[Test 30] Cancel an eligible order and verify coupon counters');
    // Create order 3
    await addVariantToCart(customer1Id, testVariantId, 1);
    const resOrder3 = await req('POST', '/checkout/orders', {
      shipping_address_id: testAddress1Id,
      payment_method: 'cash_on_delivery',
      coupon_code: `SAVE300_${ts}`,
    }, customer1Token);

    order3Id = resOrder3.data.data.order.id;
    const [[cpn3PreCancel]] = await pool.query('SELECT usage_count FROM coupons WHERE id = ?', [fixedCouponId]);

    // Admin cancels order 3
    const res30 = await req('PATCH', `/orders/admin/${order3Id}/status`, { status: 'cancelled' }, adminToken);
    assert(res30.status === 200, 'Order status updated to cancelled');

    const [[usage3After]] = await pool.query(
      'SELECT usage_status FROM coupon_usages WHERE order_id = ?',
      [order3Id]
    );
    assert(usage3After.usage_status === 'cancelled', 'Usage status updated to cancelled');

    const [[cpn3PostCancel]] = await pool.query('SELECT usage_count FROM coupons WHERE id = ?', [fixedCouponId]);
    assert(cpn3PostCancel.usage_count === cpn3PreCancel.usage_count - 1, 'Coupon usage_count decremented upon cancellation');

    // Test 31: Simultaneous orders competing for the last coupon usage
    console.log('\n[Test 31] Concurrency: simultaneous orders competing for the last coupon usage');
    // Create a coupon with exactly 1 usage remaining
    const [cLast] = await pool.query(
      `INSERT INTO coupons (code, discount_type, discount_value, usage_limit, usage_count, is_active)
       VALUES ('LASTONE_${ts}', 'fixed', 100, 1, 0, 1)`
    );
    const lastCouponId = cLast.insertId;

    // Both customer 1 and customer 2 have carts ready
    await addVariantToCart(customer1Id, testVariantId, 1);
    await addVariantToCart(customer2Id, testVariantId, 1);

    // Send simultaneous orders
    const [orderP1, orderP2] = await Promise.all([
      req('POST', '/checkout/orders', {
        shipping_address_id: testAddress1Id,
        payment_method: 'telebirr',
        coupon_code: `LASTONE_${ts}`,
      }, customer1Token),
      req('POST', '/checkout/orders', {
        shipping_address_id: testAddress2Id,
        payment_method: 'telebirr',
        coupon_code: `LASTONE_${ts}`,
      }, customer2Token),
    ]);

    const successes = [orderP1, orderP2].filter(r => r.status === 201);
    const failures = [orderP1, orderP2].filter(r => r.status >= 400);

    assert(successes.length === 1, 'Exactly one order succeeded for the single-use coupon');
    assert(failures.length === 1, 'The competing order was rejected due to reached usage limit');

    const [[finalCoupon]] = await pool.query('SELECT usage_count FROM coupons WHERE id = ?', [lastCouponId]);
    assert(finalCoupon.usage_count === 1, 'coupons.usage_count is exactly 1 (not exceeded)');

    // Test 32: Verify transaction rollback after a failure
    console.log('\n[Test 32] Verify transaction rollback after a failure');
    // If order creation fails (e.g. invalid shipping address or error midway), coupon usage must not remain
    await addVariantToCart(customer1Id, testVariantId, 1);
    const [[preRollbackCpn]] = await pool.query('SELECT usage_count FROM coupons WHERE id = ?', [percentageCouponId]);

    const res32 = await req('POST', '/checkout/orders', {
      shipping_address_id: 99999999, // Invalid address fails before commit
      payment_method: 'telebirr',
      coupon_code: `WELCOME10_${ts}`,
    }, customer1Token);

    assert(res32.status >= 400, 'Order failed due to invalid address');

    const [[postRollbackCpn]] = await pool.query('SELECT usage_count FROM coupons WHERE id = ?', [percentageCouponId]);
    assert(postRollbackCpn.usage_count === preRollbackCpn.usage_count, 'usage_count rolled back and unchanged');

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
        await pool.query('DELETE FROM cart_items WHERE cart_id IN (SELECT id FROM carts WHERE user_id IN (?, ?))', [customer1Id, customer2Id]);
        await pool.query('DELETE FROM carts WHERE user_id IN (?, ?)', [customer1Id, customer2Id]);
        await pool.query('DELETE FROM coupon_usages WHERE coupon_id IN (SELECT id FROM coupons WHERE code LIKE ?)', [`%_${ts}%`]);
        await pool.query('DELETE FROM payments WHERE order_id IN (SELECT id FROM orders WHERE user_id IN (?, ?))', [customer1Id, customer2Id]);
        await pool.query('DELETE FROM order_items WHERE order_id IN (SELECT id FROM orders WHERE user_id IN (?, ?))', [customer1Id, customer2Id]);
        await pool.query('DELETE FROM inventory_movements WHERE user_id IN (?, ?)', [customer1Id, customer2Id]);
        await pool.query('DELETE FROM orders WHERE user_id IN (?, ?)', [customer1Id, customer2Id]);
        await pool.query('DELETE FROM customer_addresses WHERE user_id IN (?, ?)', [customer1Id, customer2Id]);
        await pool.query('DELETE FROM coupons WHERE code LIKE ?', [`%_${ts}%`]);
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
