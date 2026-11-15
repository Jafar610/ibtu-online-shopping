/**
 * cart.test.js
 * Automated test suite for Shopping Cart API (Phase 10 / Phase 3 Step 1).
 *
 * Port: 5091
 *
 * Test Scenarios:
 *  1. Create a guest cart (generates guest token via header/cookie)
 *  2. Add one product variant to cart
 *  3. Add the same variant again (increments quantity, no duplicates)
 *  4. Add another variant to cart
 *  5. Retrieve cart (verifies items, prices, subtotals, and stock status)
 *  6. Update item quantity
 *  7. Attempt to add an inactive product (rejected 400)
 *  8. Attempt to add an inactive variant (rejected 400)
 *  9. Attempt to exceed available stock (rejected 400)
 * 10. Attempt to update another customer's cart item (ownership security: 404)
 * 11. Remove an item from cart
 * 12. Clear the cart
 * 13. Customer logs in and merges guest cart into account cart
 * 14. Duplicate variants merge correctly and cap at available stock
 * 15. Verify cart totals are calculated accurately on the backend
 * 16. Verify cart operations do not modify inventory quantities (physical & reserved stock untouched)
 */

'use strict';

const http = require('http');
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
require('dotenv').config();

const app = require('../src/app');

const TEST_PORT = 5091;
let server;
let pool;

let customerUserId, otherCustomerUserId;
let customerToken, otherCustomerToken;
let testCatId, testProdId, inactiveProdId;
let variantAId, variantBId, inactiveVariantId;
let initialStockA = 10, initialStockB = 5;

function req(method, pathName, body = null, token = null, guestToken = null) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(guestToken ? { 'X-Guest-Token': guestToken } : {}),
      ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {}),
    };

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
          body: parsed,
        });
      });
    });

    r.on('error', reject);
    if (payload) r.write(payload);
    r.end();
  });
}

let passed = 0;
let failed = 0;

function assert(condition, label) {
  if (condition) {
    console.log(`  [PASS] ${label}`);
    passed++;
  } else {
    console.error(`  [FAIL] ${label}`);
    failed++;
  }
}

async function setup() {
  pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
  });

  const hash = await bcrypt.hash('CartPass123!', 10);

  // 1. Create primary customer
  const [c1] = await pool.query(
    `INSERT INTO users (first_name, last_name, email, phone, password_hash, is_active)
     VALUES ('CartUser1', 'Tester', 'cart.user1@test.local', '0913000701', ?, 1)`,
    [hash]
  );
  customerUserId = c1.insertId;
  await pool.query('INSERT INTO user_roles (user_id, role_id) VALUES (?, 3)', [customerUserId]);

  // 2. Create second customer (for ownership check)
  const [c2] = await pool.query(
    `INSERT INTO users (first_name, last_name, email, phone, password_hash, is_active)
     VALUES ('CartUser2', 'Tester', 'cart.user2@test.local', '0913000702', ?, 1)`,
    [hash]
  );
  otherCustomerUserId = c2.insertId;
  await pool.query('INSERT INTO user_roles (user_id, role_id) VALUES (?, 3)', [otherCustomerUserId]);

  // 3. Category & Products
  const [[cat]] = await pool.query('SELECT id FROM categories LIMIT 1');
  testCatId = cat.id;

  const [p1] = await pool.query(
    `INSERT INTO products (category_id, name, slug, status)
     VALUES (?, 'Active Cart Dress', 'active-cart-dress-test', 'active')`,
    [testCatId]
  );
  testProdId = p1.insertId;

  const [p2] = await pool.query(
    `INSERT INTO products (category_id, name, slug, status)
     VALUES (?, 'Draft Cart Dress', 'draft-cart-dress-test', 'draft')`,
    [testCatId]
  );
  inactiveProdId = p2.insertId;

  // 4. Variants
  // Variant A: price 3000, sale 2500, stock 10
  const [vA] = await pool.query(
    `INSERT INTO product_variants (product_id, sku, size, color, price, sale_price, stock_quantity, reserved_quantity, is_active)
     VALUES (?, 'CART-VAR-A', 'M', 'White', 3000, 2500, ?, 0, 1)`,
    [testProdId, initialStockA]
  );
  variantAId = vA.insertId;

  // Variant B: price 1500, no sale, stock 5
  const [vB] = await pool.query(
    `INSERT INTO product_variants (product_id, sku, size, color, price, sale_price, stock_quantity, reserved_quantity, is_active)
     VALUES (?, 'CART-VAR-B', 'L', 'Gold', 1500, NULL, ?, 0, 1)`,
    [testProdId, initialStockB]
  );
  variantBId = vB.insertId;

  // Inactive Variant
  const [vInact] = await pool.query(
    `INSERT INTO product_variants (product_id, sku, size, color, price, stock_quantity, reserved_quantity, is_active)
     VALUES (?, 'CART-VAR-INACT', 'S', 'Red', 2000, 10, 0, 0)`,
    [testProdId]
  );
  inactiveVariantId = vInact.insertId;

  // Inactive Product Variant
  await pool.query(
    `INSERT INTO product_variants (product_id, sku, size, color, price, stock_quantity, reserved_quantity, is_active)
     VALUES (?, 'CART-VAR-INACTPROD', 'M', 'Blue', 2000, 10, 0, 1)`,
    [inactiveProdId]
  );

  server = http.createServer(app);
  await new Promise((resolve) => server.listen(TEST_PORT, resolve));
  console.log(`\nCart test server running on port ${TEST_PORT}\n`);

  // Log in customers
  const login1 = await req('POST', '/auth/login', {
    email: 'cart.user1@test.local',
    password: 'CartPass123!',
  });
  customerToken = login1.body.data?.token;

  const login2 = await req('POST', '/auth/login', {
    email: 'cart.user2@test.local',
    password: 'CartPass123!',
  });
  otherCustomerToken = login2.body.data?.token;

  if (!customerToken || !otherCustomerToken) {
    throw new Error('Test customer login failed.');
  }
}

async function cleanup() {
  try {
    // Delete cart items & carts
    await pool.query('DELETE FROM cart_items WHERE variant_id IN (?, ?, ?)', [
      variantAId,
      variantBId,
      inactiveVariantId,
    ]);
    await pool.query('DELETE FROM carts WHERE user_id IN (?, ?)', [
      customerUserId,
      otherCustomerUserId,
    ]);
    await pool.query(
      'DELETE FROM product_variants WHERE product_id IN (?, ?)',
      [testProdId, inactiveProdId]
    );
    await pool.query('DELETE FROM products WHERE id IN (?, ?)', [testProdId, inactiveProdId]);
    await pool.query('DELETE FROM user_roles WHERE user_id IN (?, ?)', [
      customerUserId,
      otherCustomerUserId,
    ]);
    await pool.query('DELETE FROM users WHERE id IN (?, ?)', [
      customerUserId,
      otherCustomerUserId,
    ]);

    await pool.end();
    await new Promise((resolve) => server.close(resolve));
  } catch (err) {
    console.error('Cleanup error:', err.message);
  }
}

async function runTests() {
  console.log('─────────────────────────────────────────');
  console.log('  Shopping Cart API Tests');
  console.log('─────────────────────────────────────────');

  let guestToken = null;
  let itemAId = null;
  let itemBId = null;

  // ── Test 1: Create a guest cart ─────────────────────────────────────────────
  console.log('\n[Test 1] Create guest cart & receive guest token');
  {
    const r = await req('GET', '/cart');
    assert(r.status === 200, 'Status 200 OK');
    assert(r.body.success === true, 'success: true');
    guestToken = r.headers['x-guest-token'] || r.body.meta?.guest_token;
    assert(!!guestToken, 'Guest token received via header or meta');
    assert(Array.isArray(r.body.data?.items) && r.body.data.items.length === 0, 'Initial cart is empty');
  }

  // ── Test 2: Add one product variant to guest cart ───────────────────────────
  console.log('\n[Test 2] Add variant A (quantity: 2) to guest cart');
  {
    const r = await req(
      'POST',
      '/cart/items',
      { variant_id: variantAId, quantity: 2 },
      null,
      guestToken
    );
    assert(r.status === 200, 'Status 200 OK');
    assert(r.body.data?.items.length === 1, '1 item in cart');
    const it = r.body.data.items[0];
    assert(it.variant_id === variantAId, 'variant_id matches');
    assert(it.quantity === 2, 'quantity is 2');
    assert(it.unit_price === 2500, 'unit_price uses sale_price (2500)');
    assert(it.subtotal === 5000, 'subtotal is 5000 (2 * 2500)');
    itemAId = it.id;
  }

  // ── Test 3: Add the same variant again (verify quantity increments) ─────────
  console.log('\n[Test 3] Add variant A again (quantity: 1) -> increments existing item');
  {
    const r = await req(
      'POST',
      '/cart/items',
      { variant_id: variantAId, quantity: 1 },
      null,
      guestToken
    );
    assert(r.status === 200, 'Status 200 OK');
    assert(r.body.data?.items.length === 1, 'Still 1 item in cart (no duplicate row)');
    assert(r.body.data?.items[0].quantity === 3, 'Quantity incremented to 3');
    assert(r.body.data?.items[0].subtotal === 7500, 'Subtotal updated to 7500');
  }

  // ── Test 4: Add another variant ─────────────────────────────────────────────
  console.log('\n[Test 4] Add variant B (quantity: 2)');
  {
    const r = await req(
      'POST',
      '/cart/items',
      { variant_id: variantBId, quantity: 2 },
      null,
      guestToken
    );
    assert(r.status === 200, 'Status 200 OK');
    assert(r.body.data?.items.length === 2, 'Now 2 items in cart');
    const itB = r.body.data.items.find((i) => i.variant_id === variantBId);
    assert(!!itB, 'Variant B found in cart items');
    assert(itB.unit_price === 1500, 'Variant B uses regular price 1500');
    assert(itB.subtotal === 3000, 'Variant B subtotal is 3000 (2 * 1500)');
    itemBId = itB.id;
  }

  // ── Test 5: Retrieve cart & verify totals ───────────────────────────────────
  console.log('\n[Test 5] Retrieve cart and verify calculations & stock status');
  {
    const r = await req('GET', '/cart', null, null, guestToken);
    assert(r.status === 200, 'Status 200 OK');
    assert(r.body.data?.total_items === 5, 'total_items is 5 (3 + 2)');
    assert(r.body.data?.item_count === 2, 'item_count is 2');
    assert(r.body.data?.subtotal === 10500, 'Cart subtotal is 10500 (7500 + 3000)');
    assert(r.body.data.items.every((i) => i.is_in_stock === true), 'All items marked in stock');
  }

  // ── Test 6: Update item quantity ────────────────────────────────────────────
  console.log('\n[Test 6] Update quantity of item A to 4');
  {
    const r = await req(
      'PATCH',
      `/cart/items/${itemAId}`,
      { quantity: 4 },
      null,
      guestToken
    );
    assert(r.status === 200, 'Status 200 OK');
    const itA = r.body.data?.items.find((i) => i.id === itemAId);
    assert(itA.quantity === 4, 'Quantity updated to 4');
    assert(itA.subtotal === 10000, 'Subtotal updated to 10000 (4 * 2500)');
    assert(r.body.data?.subtotal === 13000, 'Cart subtotal updated to 13000');
  }

  // ── Test 7: Attempt to add an inactive product ──────────────────────────────
  console.log('\n[Test 7] Attempt to add variant of draft product rejected (400)');
  {
    const [[inactProdVar]] = await pool.query(
      'SELECT id FROM product_variants WHERE product_id = ?',
      [inactiveProdId]
    );
    const r = await req(
      'POST',
      '/cart/items',
      { variant_id: inactProdVar.id, quantity: 1 },
      null,
      guestToken
    );
    assert(r.status === 400, 'Status 400 Bad Request');
    assert(r.body.success === false, 'success: false');
  }

  // ── Test 8: Attempt to add an inactive variant ──────────────────────────────
  console.log('\n[Test 8] Attempt to add inactive variant rejected (400)');
  {
    const r = await req(
      'POST',
      '/cart/items',
      { variant_id: inactiveVariantId, quantity: 1 },
      null,
      guestToken
    );
    assert(r.status === 400, 'Status 400 Bad Request');
    assert(r.body.success === false, 'success: false');
  }

  // ── Test 9: Attempt to exceed available stock ───────────────────────────────
  console.log('\n[Test 9] Attempt to exceed available stock rejected (400)');
  {
    // Variant B has stock = 5, currently 2 in cart. Adding 4 more = 6 > 5
    const r = await req(
      'POST',
      '/cart/items',
      { variant_id: variantBId, quantity: 4 },
      null,
      guestToken
    );
    assert(r.status === 400, 'Status 400 Bad Request for exceeding stock');
  }

  // ── Test 10: Ownership security check ───────────────────────────────────────
  console.log('\n[Test 10] Attempt to update another customer cart item rejected (404)');
  {
    // Customer 2 tries to update Customer 1 / Guest's item
    const r = await req(
      'PATCH',
      `/cart/items/${itemAId}`,
      { quantity: 1 },
      otherCustomerToken
    );
    assert(r.status === 404, 'Status 404 Cart item not found in your cart');
  }

  // ── Test 11: Remove an item ─────────────────────────────────────────────────
  console.log('\n[Test 11] Remove item B from cart');
  {
    const r = await req('DELETE', `/cart/items/${itemBId}`, null, null, guestToken);
    assert(r.status === 200, 'Status 200 OK');
    assert(r.body.data?.items.length === 1, 'Only 1 item left in cart');
    assert(!r.body.data?.items.some((i) => i.id === itemBId), 'Item B removed');
  }

  // ── Test 12: Clear the cart ─────────────────────────────────────────────────
  console.log('\n[Test 12] Clear the cart');
  {
    const r = await req('DELETE', '/cart', null, null, guestToken);
    assert(r.status === 200, 'Status 200 OK');
    assert(r.body.data?.items.length === 0, 'Cart is empty');
    assert(r.body.data?.subtotal === 0, 'Subtotal is 0');
  }

  // ── Test 13: Customer logs in and merges guest cart ─────────────────────────
  console.log('\n[Test 13] Merge guest cart into customer account');
  {
    // Add item A (qty: 3) to guest cart first
    await req('POST', '/cart/items', { variant_id: variantAId, quantity: 3 }, null, guestToken);

    // Call /cart/merge as Customer 1
    const r = await req(
      'POST',
      '/cart/merge',
      { guest_token: guestToken },
      customerToken
    );
    assert(r.status === 200, 'Status 200 OK');
    assert(r.body.data?.items.length >= 1, 'Merged items present in customer cart');
    const itMerged = r.body.data.items.find((i) => i.variant_id === variantAId);
    assert(itMerged.quantity === 3, 'Guest quantity merged into customer cart');

    // Verify guest cart was deleted in database
    const tokenHash = require('crypto').createHash('sha256').update(guestToken).digest('hex');
    const [[deletedGuestCart]] = await pool.query(
      'SELECT id FROM carts WHERE guest_token_hash = ?',
      [tokenHash]
    );
    assert(!deletedGuestCart, 'Guest cart deleted after successful merge');
  }

  // ── Test 14: Duplicate variants merge & cap at stock ────────────────────────
  console.log('\n[Test 14] Duplicate variants merge and cap at available stock');
  {
    // Customer 1 already has 3 of Variant A.
    // Create a new guest session with 9 of Variant A (Total would be 12, but stock is 10)
    const newGuestRes = await req('GET', '/cart');
    const guestToken2 = newGuestRes.headers['x-guest-token'] || newGuestRes.body.meta?.guest_token;
    await req('POST', '/cart/items', { variant_id: variantAId, quantity: 9 }, null, guestToken2);

    // Merge into Customer 1
    const rMerge = await req(
      'POST',
      '/cart/merge',
      { guest_token: guestToken2 },
      customerToken
    );
    assert(rMerge.status === 200, 'Status 200 OK');
    const itA = rMerge.body.data.items.find((i) => i.variant_id === variantAId);
    assert(itA.quantity === 10, 'Merged quantity capped at max available stock (10)');
  }

  // ── Test 15: Verify backend cart total calculation ──────────────────────────
  console.log('\n[Test 15] Verify backend cart total calculations');
  {
    const r = await req('GET', '/cart', null, customerToken);
    assert(r.status === 200, 'Status 200 OK');
    const expectedSubtotal = r.body.data.items.reduce((sum, item) => sum + item.subtotal, 0);
    assert(r.body.data.subtotal === expectedSubtotal, 'Cart subtotal precisely matches sum of item subtotals');
  }

  // ── Test 16: Verify cart operations do not alter inventory ──────────────────
  console.log('\n[Test 16] Verify cart operations never modify inventory tables');
  {
    const [[vACheck]] = await pool.query(
      'SELECT stock_quantity, reserved_quantity FROM product_variants WHERE id = ?',
      [variantAId]
    );
    const [[vBCheck]] = await pool.query(
      'SELECT stock_quantity, reserved_quantity FROM product_variants WHERE id = ?',
      [variantBId]
    );
    assert(vACheck.stock_quantity === initialStockA, 'Variant A physical stock unchanged (10)');
    assert(vACheck.reserved_quantity === 0, 'Variant A reserved stock unchanged (0)');
    assert(vBCheck.stock_quantity === initialStockB, 'Variant B physical stock unchanged (5)');
    assert(vBCheck.reserved_quantity === 0, 'Variant B reserved stock unchanged (0)');
  }
}

(async () => {
  try {
    await setup();
    await runTests();
  } catch (err) {
    console.error('\nFATAL ERROR during cart tests:', err);
    failed++;
  } finally {
    await cleanup();
    console.log('\n─────────────────────────────────────────');
    console.log(`  Results: ${passed} passed, ${failed} failed`);
    console.log('─────────────────────────────────────────\n');
    process.exit(failed > 0 ? 1 : 0);
  }
})();
