/**
 * variant.test.js
 * Automated test suite for the Product Variant Management API (Phase 7).
 *
 * Port: 5094 (unique, avoids conflicts with other test suites)
 *
 * Setup:
 *   - Creates a temporary Admin user and a temporary Data Encoder user.
 *   - Creates a temporary test product to attach variants to.
 *   - All test data is cleaned up in the finally block.
 *
 * Tests:
 *   1.  List variants for an existing product (public)
 *   2.  Get a single active variant (public)
 *   3.  Create a variant with opening stock (Admin)
 *   4.  Verify opening stock movement was recorded
 *   5.  Duplicate SKU is rejected (409)
 *   6.  Nonexistent product is rejected (404)
 *   7.  Invalid price is rejected (422)
 *   8.  Sale price >= regular price is rejected (422)
 *   9.  Direct stock_quantity in update is rejected (422)
 *  10.  Data Encoder can create variants (products.create permission)
 *  11.  Update variant details (price, size, color) (Admin)
 *  12.  Customer cannot create variants (403)
 *  13.  Deactivate a variant (Admin)
 *  14.  Deactivated variant hidden from public
 *  15.  Activate a variant (Admin)
 *  16.  Unauthenticated create is rejected (401)
 *  17.  Create variant with zero opening stock (no inventory movement created)
 *  18.  Deactivate already-inactive variant returns 400
 */

'use strict';

const http = require('http');
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
require('dotenv').config();

const app = require('../src/app');

// ─────────────────────────────────────────────
// Config
// ─────────────────────────────────────────────
const TEST_PORT = 5094;
const BASE_URL = `http://localhost:${TEST_PORT}/api`;

let server;
let pool;
let adminToken, encoderToken, customerToken;
let testUserId, encoderUserId, customerUserId;
let testProductId;
let createdVariantId;   // variant created in test 3
let encoderVariantId;   // variant created in test 10

// ─────────────────────────────────────────────
// HTTP helpers
// ─────────────────────────────────────────────
function req(method, path, body, token) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const opts = {
      hostname: 'localhost',
      port: TEST_PORT,
      path: `/api${path}`,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {}),
      },
    };
    const r = http.request(opts, res => {
      let data = '';
      res.on('data', c => (data += c));
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch { resolve({ status: res.statusCode, body: data }); }
      });
    });
    r.on('error', reject);
    if (payload) r.write(payload);
    r.end();
  });
}

// ─────────────────────────────────────────────
// Assertions
// ─────────────────────────────────────────────
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

// ─────────────────────────────────────────────
// Setup
// ─────────────────────────────────────────────
async function setup() {
  pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
  });

  const hash = await bcrypt.hash('TestPass123!', 10);

  // Admin user
  const [adminRes] = await pool.query(
    `INSERT INTO users (first_name, last_name, email, phone, password_hash, is_active)
     VALUES ('VAdmin', 'Test', 'vadmin.variant@test.local', '0911000900', ?, 1)`,
    [hash]
  );
  testUserId = adminRes.insertId;
  await pool.query('INSERT INTO user_roles (user_id, role_id) VALUES (?, 1)', [testUserId]); // Admin

  // Data Encoder user
  const [encRes] = await pool.query(
    `INSERT INTO users (first_name, last_name, email, phone, password_hash, is_active)
     VALUES ('VEncoder', 'Test', 'vencoder.variant@test.local', '0911000901', ?, 1)`,
    [hash]
  );
  encoderUserId = encRes.insertId;
  await pool.query('INSERT INTO user_roles (user_id, role_id) VALUES (?, 2)', [encoderUserId]); // Data Encoder

  // Customer user
  const [custRes] = await pool.query(
    `INSERT INTO users (first_name, last_name, email, phone, password_hash, is_active)
     VALUES ('VCustomer', 'Test', 'vcustomer.variant@test.local', '0911000902', ?, 1)`,
    [hash]
  );
  customerUserId = custRes.insertId;
  await pool.query('INSERT INTO user_roles (user_id, role_id) VALUES (?, 3)', [customerUserId]); // Customer

  // Get a valid category id
  const [[cat]] = await pool.query('SELECT id FROM categories LIMIT 1');
  const catId = cat ? cat.id : null;
  if (!catId) throw new Error('No category found — seed a category first');

  // Test product
  const [prodRes] = await pool.query(
    `INSERT INTO products (category_id, name, slug, status, created_by)
     VALUES (?, 'Variant Test Product', 'variant-test-product-ph7', 'active', ?)`,
    [catId, testUserId]
  );
  testProductId = prodRes.insertId;

  server = http.createServer(app);
  await new Promise(resolve => server.listen(TEST_PORT, resolve));
  console.log(`\nTest server running on port ${TEST_PORT}\n`);

  // Login all three users
  const adminLogin = await req('POST', '/auth/login', { email: 'vadmin.variant@test.local', password: 'TestPass123!' });
  adminToken = adminLogin.body.data?.token;

  const encLogin = await req('POST', '/auth/login', { email: 'vencoder.variant@test.local', password: 'TestPass123!' });
  encoderToken = encLogin.body.data?.token;

  const custLogin = await req('POST', '/auth/login', { email: 'vcustomer.variant@test.local', password: 'TestPass123!' });
  customerToken = custLogin.body.data?.token;

  if (!adminToken || !encoderToken || !customerToken) {
    throw new Error('Login failed during setup — check auth routes');
  }
}

// ─────────────────────────────────────────────
// Cleanup
// ─────────────────────────────────────────────
async function cleanup() {
  try {
    // Remove inventory movements for test variants
    if (createdVariantId) {
      await pool.query('DELETE FROM inventory_movements WHERE variant_id = ?', [createdVariantId]);
      await pool.query('DELETE FROM product_variants WHERE id = ?', [createdVariantId]);
    }
    if (encoderVariantId) {
      await pool.query('DELETE FROM inventory_movements WHERE variant_id = ?', [encoderVariantId]);
      await pool.query('DELETE FROM product_variants WHERE id = ?', [encoderVariantId]);
    }
    // Remove any stray variants from the test product
    await pool.query(
      'DELETE FROM inventory_movements WHERE variant_id IN (SELECT id FROM product_variants WHERE product_id = ?)',
      [testProductId]
    );
    await pool.query('DELETE FROM product_variants WHERE product_id = ?', [testProductId]);
    await pool.query('DELETE FROM products WHERE id = ?', [testProductId]);
    await pool.query('DELETE FROM user_roles WHERE user_id IN (?, ?, ?)', [testUserId, encoderUserId, customerUserId]);
    await pool.query('DELETE FROM users WHERE id IN (?, ?, ?)', [testUserId, encoderUserId, customerUserId]);
    await pool.end();
    await new Promise(resolve => server.close(resolve));
  } catch (e) {
    console.error('Cleanup error:', e.message);
  }
}

// ─────────────────────────────────────────────
// Tests
// ─────────────────────────────────────────────
async function runTests() {
  // ── Pre-seed a variant so list/get tests have something to find ──────────────
  const [pvRes] = await pool.query(
    `INSERT INTO product_variants (product_id, sku, size, color, price, stock_quantity, is_active)
     VALUES (?, 'VT-SEED-001', 'S', 'Blue', 2500.00, 5, 1)`,
    [testProductId]
  );
  const seededVariantId = pvRes.insertId;

  console.log('─────────────────────────────────────────');
  console.log('  Variant API Tests');
  console.log('─────────────────────────────────────────');

  // ── Test 1: List variants for an existing product (public) ──────────────────
  console.log('\n[Test 1] List variants for a product (public)');
  {
    const r = await req('GET', `/products/${testProductId}/variants`);
    assert(r.status === 200, 'Status 200');
    assert(r.body.success === true, 'success: true');
    assert(Array.isArray(r.body.data?.variants), 'Returns variants array');
    assert(r.body.data.variants.length >= 1, 'Has at least 1 variant (seeded)');
    assert(r.body.data.product?.id === testProductId, 'Product info included');
  }

  // ── Test 2: Get a single active variant (public) ─────────────────────────────
  console.log('\n[Test 2] Get single active variant (public)');
  {
    const r = await req('GET', `/variants/${seededVariantId}`);
    assert(r.status === 200, 'Status 200');
    assert(r.body.data?.sku === 'VT-SEED-001', 'Correct SKU returned');
    assert(r.body.data?.effective_price === 2500, 'effective_price computed');
    assert(!('stock_quantity' in r.body.data), 'stock_quantity hidden from public');
    assert('available_quantity' in r.body.data, 'available_quantity present');
  }

  // ── Test 3: Create a variant with opening stock (Admin) ──────────────────────
  console.log('\n[Test 3] Create variant with opening stock (Admin)');
  {
    const r = await req(
      'POST',
      `/products/${testProductId}/variants`,
      { sku: 'VT-ADMIN-001', size: 'M', color: 'Green', price: 3200, sale_price: 2800, stock_quantity: 12, low_stock_threshold: 3 },
      adminToken
    );
    assert(r.status === 201, 'Status 201 Created');
    assert(r.body.data?.sku === 'VT-ADMIN-001', 'SKU correct');
    assert(r.body.data?.stock_quantity === 12, 'stock_quantity stored');
    assert(r.body.data?.sale_price === 2800, 'sale_price stored');
    assert(r.body.data?.effective_price === 2800, 'effective_price = sale_price');
    createdVariantId = r.body.data?.id;
  }

  // ── Test 4: Verify opening stock movement recorded ───────────────────────────
  console.log('\n[Test 4] Opening stock movement recorded in inventory_movements');
  {
    const [[mv]] = await pool.query(
      `SELECT * FROM inventory_movements WHERE variant_id = ? AND movement_type = 'opening_stock'`,
      [createdVariantId]
    );
    assert(!!mv, 'inventory_movements row exists');
    assert(mv.quantity === 12, 'Movement quantity = 12');
    assert(mv.quantity_before === 0, 'quantity_before = 0');
    assert(mv.quantity_after === 12, 'quantity_after = 12');
    assert(mv.user_id === testUserId, 'user_id recorded correctly');
  }

  // ── Test 5: Duplicate SKU rejected (409) ────────────────────────────────────
  console.log('\n[Test 5] Duplicate SKU rejected');
  {
    const r = await req(
      'POST',
      `/products/${testProductId}/variants`,
      { sku: 'VT-ADMIN-001', size: 'L', color: 'Red', price: 3000 },
      adminToken
    );
    assert(r.status === 409, 'Status 409 Conflict');
    assert(r.body.success === false, 'success: false');
  }

  // ── Test 6: Nonexistent product rejected (404) ───────────────────────────────
  console.log('\n[Test 6] Nonexistent product returns 404');
  {
    const r = await req(
      'POST',
      '/products/999999/variants',
      { sku: 'VT-NOPR-001', size: 'S', color: 'Black', price: 2000 },
      adminToken
    );
    assert(r.status === 404, 'Status 404 Not Found');
  }

  // ── Test 7: Invalid price rejected (422) ─────────────────────────────────────
  console.log('\n[Test 7] Invalid price (zero) rejected');
  {
    const r = await req(
      'POST',
      `/products/${testProductId}/variants`,
      { sku: 'VT-BADPRC-001', size: 'S', color: 'Black', price: 0 },
      adminToken
    );
    assert(r.status === 422, 'Status 422 Unprocessable');
    assert(r.body.success === false, 'success: false');
  }

  // ── Test 8: Sale price >= regular price rejected (422) ───────────────────────
  console.log('\n[Test 8] Sale price >= regular price rejected');
  {
    const r = await req(
      'POST',
      `/products/${testProductId}/variants`,
      { sku: 'VT-BADSALE-001', size: 'S', color: 'Black', price: 2000, sale_price: 2500 },
      adminToken
    );
    assert(r.status === 422, 'Status 422 Unprocessable');
  }

  // ── Test 9: Direct stock_quantity in update rejected (422) ───────────────────
  console.log('\n[Test 9] Direct stock_quantity in PUT update rejected');
  {
    const r = await req(
      'PUT',
      `/variants/${createdVariantId}`,
      { stock_quantity: 999 },
      adminToken
    );
    assert(r.status === 422, 'Status 422 — stock_quantity not allowed in update');
  }

  // ── Test 10: Data Encoder can create variants ────────────────────────────────
  console.log('\n[Test 10] Data Encoder can create a variant');
  {
    const r = await req(
      'POST',
      `/products/${testProductId}/variants`,
      { sku: 'VT-ENC-001', size: 'XL', color: 'Yellow', price: 4100, stock_quantity: 0 },
      encoderToken
    );
    assert(r.status === 201, 'Status 201 Created');
    assert(r.body.data?.sku === 'VT-ENC-001', 'Encoder variant created');
    encoderVariantId = r.body.data?.id;
  }

  // ── Test 11: Update variant details (Admin) ──────────────────────────────────
  console.log('\n[Test 11] Update variant price/size/color (Admin)');
  {
    const r = await req(
      'PUT',
      `/variants/${createdVariantId}`,
      { price: 3400, size: 'L', color: 'Forest Green', low_stock_threshold: 4 },
      adminToken
    );
    assert(r.status === 200, 'Status 200 OK');
    assert(r.body.data?.price === 3400, 'Price updated');
    assert(r.body.data?.size === 'L', 'Size updated');
    assert(r.body.data?.color === 'Forest Green', 'Color updated');
    // Stock should be untouched
    assert(r.body.data?.stock_quantity === 12, 'stock_quantity unchanged');
  }

  // ── Test 12: Customer cannot create variants (403) ───────────────────────────
  console.log('\n[Test 12] Customer cannot create variants (403)');
  {
    const r = await req(
      'POST',
      `/products/${testProductId}/variants`,
      { sku: 'VT-CUST-001', size: 'S', color: 'Pink', price: 2200 },
      customerToken
    );
    assert(r.status === 403, 'Status 403 Forbidden');
  }

  // ── Test 13: Deactivate a variant (Admin) ────────────────────────────────────
  console.log('\n[Test 13] Deactivate a variant (Admin)');
  {
    const r = await req('PATCH', `/variants/${seededVariantId}/deactivate`, null, adminToken);
    assert(r.status === 200, 'Status 200 OK');
    assert(r.body.data?.is_active === false, 'is_active = false');
  }

  // ── Test 14: Deactivated variant hidden from public ──────────────────────────
  console.log('\n[Test 14] Deactivated variant hidden from public');
  {
    const r = await req('GET', `/variants/${seededVariantId}`);
    assert(r.status === 404, 'Status 404 — inactive variant not visible publicly');
  }

  // ── Test 15: Activate a variant (Admin) ─────────────────────────────────────
  console.log('\n[Test 15] Activate a variant (Admin)');
  {
    const r = await req('PATCH', `/variants/${seededVariantId}/activate`, null, adminToken);
    assert(r.status === 200, 'Status 200 OK');
    assert(r.body.data?.is_active === true, 'is_active = true');
  }

  // ── Test 16: Unauthenticated create rejected (401) ───────────────────────────
  console.log('\n[Test 16] Unauthenticated create returns 401');
  {
    const r = await req('POST', `/products/${testProductId}/variants`, { sku: 'VT-NOAUTH', price: 2000 });
    assert(r.status === 401, 'Status 401 Unauthorized');
  }

  // ── Test 17: Variant with zero opening stock → no inventory_movement ──────────
  console.log('\n[Test 17] Zero opening stock → no inventory movement created');
  {
    // encoderVariantId was created with stock_quantity: 0
    const [mvRows] = await pool.query(
      `SELECT id FROM inventory_movements WHERE variant_id = ? AND movement_type = 'opening_stock'`,
      [encoderVariantId]
    );
    assert(mvRows.length === 0, 'No opening_stock row for zero-stock variant');
  }

  // ── Test 18: Deactivate already-inactive variant → 400 ──────────────────────
  console.log('\n[Test 18] Deactivating already-inactive variant returns 400');
  {
    // First deactivate encoderVariantId
    await req('PATCH', `/variants/${encoderVariantId}/deactivate`, null, adminToken);
    // Try again
    const r = await req('PATCH', `/variants/${encoderVariantId}/deactivate`, null, adminToken);
    assert(r.status === 400, 'Status 400 Bad Request');
  }

  // Re-activate seeded variant in db so cleanup is clean
  await pool.query('UPDATE product_variants SET is_active = 1 WHERE id = ?', [seededVariantId]);

  // Cleanup seeded variant
  await pool.query('DELETE FROM product_variants WHERE id = ?', [seededVariantId]);
}

// ─────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────
(async () => {
  try {
    await setup();
    await runTests();
  } catch (err) {
    console.error('\nFATAL ERROR during tests:', err.message);
    failed++;
  } finally {
    await cleanup();
    console.log('\n─────────────────────────────────────────');
    console.log(`  Results: ${passed} passed, ${failed} failed`);
    console.log('─────────────────────────────────────────\n');
    process.exit(failed > 0 ? 1 : 0);
  }
})();
