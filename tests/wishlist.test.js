/**
 * wishlist.test.js
 * Automated test suite for Wishlist API (Phase 11 / Phase 3 Step 2).
 *
 * Port: 5090
 *
 * Scenarios Tested:
 *  1. Access wishlist without authentication (401)
 *  2. Create/retrieve wishlist for registered customer (200)
 *  3. Add an active product to wishlist (201)
 *  4. Add the same product again (200, handles duplicate gracefully)
 *  5. Add an inactive product (400)
 *  6. Add a nonexistent product (404)
 *  7. Retrieve wishlist products (verifies product, image, category, price, stock status)
 *  8. Check whether a product is saved (/check/:productId)
 *  9. Remove a wishlist product (200)
 * 10. Remove a nonexistent wishlist product (404)
 * 11. Clear the wishlist (200)
 * 12. Cross-customer isolation (Customer 2 sees only their own items)
 * 13. Verify wishlist operations do not modify inventory quantities
 * 14. Admin and Data Encoder accounts cannot access customer wishlists (403)
 * 15. Move wishlist product to cart (/add-to-cart)
 */

'use strict';

const http = require('http');
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
require('dotenv').config();

const app = require('../src/app');

const TEST_PORT = 5090;
let server;
let pool;

let customer1Id, customer2Id, adminUserId, encoderUserId;
let customer1Token, customer2Token, adminToken, encoderToken;
let testCatId, activeProd1Id, activeProd2Id, inactiveProdId;
let variantAId;
let initialStock = 8;

function req(method, pathName, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
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

  const hash = await bcrypt.hash('WishPass123!', 10);

  // 1. Customer 1
  const [c1] = await pool.query(
    `INSERT INTO users (first_name, last_name, email, phone, password_hash, is_active)
     VALUES ('WishUser1', 'Tester', 'wish.user1@test.local', '0914000601', ?, 1)`,
    [hash]
  );
  customer1Id = c1.insertId;
  await pool.query('INSERT INTO user_roles (user_id, role_id) VALUES (?, 3)', [customer1Id]);

  // 2. Customer 2
  const [c2] = await pool.query(
    `INSERT INTO users (first_name, last_name, email, phone, password_hash, is_active)
     VALUES ('WishUser2', 'Tester', 'wish.user2@test.local', '0914000602', ?, 1)`,
    [hash]
  );
  customer2Id = c2.insertId;
  await pool.query('INSERT INTO user_roles (user_id, role_id) VALUES (?, 3)', [customer2Id]);

  // 3. Admin user (Role 1 only)
  const [adm] = await pool.query(
    `INSERT INTO users (first_name, last_name, email, phone, password_hash, is_active)
     VALUES ('WishAdmin', 'Tester', 'wish.admin@test.local', '0914000603', ?, 1)`,
    [hash]
  );
  adminUserId = adm.insertId;
  await pool.query('INSERT INTO user_roles (user_id, role_id) VALUES (?, 1)', [adminUserId]);

  // 4. Data Encoder user (Role 2 only)
  const [enc] = await pool.query(
    `INSERT INTO users (first_name, last_name, email, phone, password_hash, is_active)
     VALUES ('WishEncoder', 'Tester', 'wish.encoder@test.local', '0914000604', ?, 1)`,
    [hash]
  );
  encoderUserId = enc.insertId;
  await pool.query('INSERT INTO user_roles (user_id, role_id) VALUES (?, 2)', [encoderUserId]);

  // 5. Test Category & Products
  const [[cat]] = await pool.query('SELECT id FROM categories LIMIT 1');
  testCatId = cat.id;

  const [p1] = await pool.query(
    `INSERT INTO products (category_id, name, slug, status)
     VALUES (?, 'Wish Active Dress 1', 'wish-active-dress-1', 'active')`,
    [testCatId]
  );
  activeProd1Id = p1.insertId;

  const [p2] = await pool.query(
    `INSERT INTO products (category_id, name, slug, status)
     VALUES (?, 'Wish Active Dress 2', 'wish-active-dress-2', 'active')`,
    [testCatId]
  );
  activeProd2Id = p2.insertId;

  const [pInact] = await pool.query(
    `INSERT INTO products (category_id, name, slug, status)
     VALUES (?, 'Wish Inactive Dress', 'wish-inactive-dress', 'draft')`,
    [testCatId]
  );
  inactiveProdId = pInact.insertId;

  // Variants
  const [vA] = await pool.query(
    `INSERT INTO product_variants (product_id, sku, size, color, price, sale_price, stock_quantity, reserved_quantity, is_active)
     VALUES (?, 'WISH-VAR-A', 'M', 'White', 4000, 3600, ?, 0, 1)`,
    [activeProd1Id, initialStock]
  );
  variantAId = vA.insertId;

  // Image for Product 1
  await pool.query(
    `INSERT INTO product_images (product_id, image_url, alt_text, is_primary, sort_order)
     VALUES (?, '/uploads/products/wish-dress-1.png', 'Wish Dress 1 Front', 1, 1)`,
    [activeProd1Id]
  );

  server = http.createServer(app);
  await new Promise((resolve) => server.listen(TEST_PORT, resolve));
  console.log(`\nWishlist test server running on port ${TEST_PORT}\n`);

  // Logins
  const l1 = await req('POST', '/auth/login', { email: 'wish.user1@test.local', password: 'WishPass123!' });
  customer1Token = l1.body.data?.token;

  const l2 = await req('POST', '/auth/login', { email: 'wish.user2@test.local', password: 'WishPass123!' });
  customer2Token = l2.body.data?.token;

  const lAdm = await req('POST', '/auth/login', { email: 'wish.admin@test.local', password: 'WishPass123!' });
  adminToken = lAdm.body.data?.token;

  const lEnc = await req('POST', '/auth/login', { email: 'wish.encoder@test.local', password: 'WishPass123!' });
  encoderToken = lEnc.body.data?.token;

  if (!customer1Token || !customer2Token || !adminToken || !encoderToken) {
    throw new Error('Authentication setup failed.');
  }
}

async function cleanup() {
  try {
    const allProdIds = [activeProd1Id, activeProd2Id, inactiveProdId].filter(Boolean);
    const allUserIds = [customer1Id, customer2Id, adminUserId, encoderUserId].filter(Boolean);

    await pool.query('DELETE FROM wishlist_items WHERE product_id IN (?)', [allProdIds]);
    await pool.query('DELETE FROM wishlists WHERE user_id IN (?)', [allUserIds]);
    await pool.query('DELETE FROM cart_items WHERE variant_id = ?', [variantAId]);
    await pool.query('DELETE FROM carts WHERE user_id IN (?)', [allUserIds]);
    await pool.query('DELETE FROM product_images WHERE product_id IN (?)', [allProdIds]);
    await pool.query('DELETE FROM product_variants WHERE product_id IN (?)', [allProdIds]);
    await pool.query('DELETE FROM products WHERE id IN (?)', [allProdIds]);
    await pool.query('DELETE FROM user_roles WHERE user_id IN (?)', [allUserIds]);
    await pool.query('DELETE FROM users WHERE id IN (?)', [allUserIds]);

    await pool.end();
    await new Promise((resolve) => server.close(resolve));
  } catch (err) {
    console.error('Cleanup error:', err.message);
  }
}

async function runTests() {
  console.log('─────────────────────────────────────────');
  console.log('  Wishlist API Tests');
  console.log('─────────────────────────────────────────');

  // ── Test 1: Access without authentication ───────────────────────────────────
  console.log('\n[Test 1] Access wishlist without authentication (401)');
  {
    const r = await req('GET', '/wishlist');
    assert(r.status === 401, 'Status 401 Unauthorized');
    assert(r.body.success === false, 'success: false');
  }

  // ── Test 2: Create/retrieve wishlist for customer ───────────────────────────
  console.log('\n[Test 2] Retrieve empty wishlist for registered customer');
  {
    const r = await req('GET', '/wishlist', null, customer1Token);
    assert(r.status === 200, 'Status 200 OK');
    assert(r.body.success === true, 'success: true');
    assert(Array.isArray(r.body.data?.items) && r.body.data.items.length === 0, 'Initial items is empty array');
    assert(r.body.data?.total_items === 0, 'total_items is 0');
  }

  // ── Test 3: Add active product ──────────────────────────────────────────────
  console.log('\n[Test 3] Add active product to wishlist (201)');
  {
    const r = await req('POST', '/wishlist/items', { product_id: activeProd1Id }, customer1Token);
    assert(r.status === 201, 'Status 201 Created');
    assert(r.body.data?.product_id === activeProd1Id, 'product_id matches');
    assert(r.body.data?.is_in_wishlist === true, 'is_in_wishlist is true');
  }

  // ── Test 4: Add duplicate product ───────────────────────────────────────────
  console.log('\n[Test 4] Add the same product again (200, already saved)');
  {
    const r = await req('POST', '/wishlist/items', { product_id: activeProd1Id }, customer1Token);
    assert(r.status === 200, 'Status 200 OK');
    assert(r.body.data?.already_saved === true, 'already_saved is true');
  }

  // ── Test 5: Add inactive product ────────────────────────────────────────────
  console.log('\n[Test 5] Add inactive product rejected (400)');
  {
    const r = await req('POST', '/wishlist/items', { product_id: inactiveProdId }, customer1Token);
    assert(r.status === 400, 'Status 400 Bad Request');
    assert(r.body.success === false, 'success: false');
  }

  // ── Test 6: Add nonexistent product ─────────────────────────────────────────
  console.log('\n[Test 6] Add nonexistent product rejected (404)');
  {
    const r = await req('POST', '/wishlist/items', { product_id: 999999 }, customer1Token);
    assert(r.status === 404, 'Status 404 Not Found');
  }

  // ── Test 7: Retrieve wishlist with items & pricing ──────────────────────────
  console.log('\n[Test 7] Retrieve wishlist with items, images & prices');
  {
    // Add second product
    await req('POST', '/wishlist/items', { product_id: activeProd2Id }, customer1Token);

    const r = await req('GET', '/wishlist', null, customer1Token);
    assert(r.status === 200, 'Status 200 OK');
    assert(r.body.data?.total_items === 2, 'total_items is 2');
    const item1 = r.body.data.items.find((i) => i.product_id === activeProd1Id);
    assert(!!item1, 'Product 1 found in wishlist');
    assert(item1.primary_image?.image_url === '/uploads/products/wish-dress-1.png', 'Primary image populated');
    assert(item1.price?.min === 3600, 'Sale price 3600 used in price.min');
    assert(item1.stock_status === 'in_stock', 'stock_status is in_stock');
  }

  // ── Test 8: Check whether a product is saved (/check/:productId) ────────────
  console.log('\n[Test 8] Check wishlist status for saved vs unsaved products');
  {
    const rSaved = await req('GET', `/wishlist/check/${activeProd1Id}`, null, customer1Token);
    assert(rSaved.status === 200, 'Status 200 OK');
    assert(rSaved.body.data?.is_in_wishlist === true, 'Saved product returns is_in_wishlist: true');

    const rUnsaved = await req('GET', '/wishlist/check/999999', null, customer1Token);
    assert(rUnsaved.status === 200, 'Status 200 OK');
    assert(rUnsaved.body.data?.is_in_wishlist === false, 'Unsaved product returns is_in_wishlist: false');
  }

  // ── Test 9: Remove a wishlist product ───────────────────────────────────────
  console.log('\n[Test 9] Remove product 2 from wishlist');
  {
    const r = await req('DELETE', `/wishlist/items/${activeProd2Id}`, null, customer1Token);
    assert(r.status === 200, 'Status 200 OK');
    assert(r.body.data?.removed === true, 'removed is true');

    // Verify it is no longer in wishlist
    const rCheck = await req('GET', `/wishlist/check/${activeProd2Id}`, null, customer1Token);
    assert(rCheck.body.data?.is_in_wishlist === false, 'Product 2 no longer in wishlist');
  }

  // ── Test 10: Remove nonexistent wishlist product ────────────────────────────
  console.log('\n[Test 10] Remove nonexistent product returns 404');
  {
    const r = await req('DELETE', '/wishlist/items/999999', null, customer1Token);
    assert(r.status === 404, 'Status 404 Not Found');
  }

  // ── Test 11: Clear the wishlist ─────────────────────────────────────────────
  console.log('\n[Test 11] Clear customer wishlist');
  {
    const r = await req('DELETE', '/wishlist', null, customer1Token);
    assert(r.status === 200, 'Status 200 OK');
    assert(r.body.data?.total_items === 0, 'Wishlist cleared to 0 items');

    const rGet = await req('GET', '/wishlist', null, customer1Token);
    assert(rGet.body.data?.items.length === 0, 'Wishlist items array is empty');
  }

  // ── Test 12: Customer isolation ─────────────────────────────────────────────
  console.log('\n[Test 12] Customer isolation (Customer 2 sees only their own wishlist)');
  {
    // Customer 1 adds Product 1
    await req('POST', '/wishlist/items', { product_id: activeProd1Id }, customer1Token);

    // Customer 2 gets their own wishlist
    const r2 = await req('GET', '/wishlist', null, customer2Token);
    assert(r2.status === 200, 'Status 200 OK');
    assert(r2.body.data?.items.length === 0, 'Customer 2 cannot see Customer 1 items');

    const r2Check = await req('GET', `/wishlist/check/${activeProd1Id}`, null, customer2Token);
    assert(r2Check.body.data?.is_in_wishlist === false, 'Product 1 is not in Customer 2 wishlist');
  }

  // ── Test 13: Verify wishlist operations do not modify inventory ─────────────
  console.log('\n[Test 13] Verify inventory is never modified by wishlist actions');
  {
    const [[vCheck]] = await pool.query(
      'SELECT stock_quantity, reserved_quantity FROM product_variants WHERE id = ?',
      [variantAId]
    );
    assert(vCheck.stock_quantity === initialStock, `Physical stock remains unchanged (${initialStock})`);
    assert(vCheck.reserved_quantity === 0, 'Reserved stock remains 0');
  }

  // ── Test 14: Admin and Data Encoder blocked from customer wishlists (403) ───
  console.log('\n[Test 14] Admin & Data Encoder blocked from wishlist endpoints (403)');
  {
    const rAdmin = await req('GET', '/wishlist', null, adminToken);
    assert(rAdmin.status === 403, 'Admin gets 403 Forbidden on customer wishlist');

    const rEncoder = await req('GET', '/wishlist', null, encoderToken);
    assert(rEncoder.status === 403, 'Data Encoder gets 403 Forbidden on customer wishlist');
  }

  // ── Test 15: Move wishlist product to cart ──────────────────────────────────
  console.log('\n[Test 15] Move wishlist product to cart (/add-to-cart)');
  {
    // Customer 1 has Product 1 in wishlist
    const rMove = await req(
      'POST',
      `/wishlist/items/${activeProd1Id}/add-to-cart`,
      { variant_id: variantAId, quantity: 2 },
      customer1Token
    );
    assert(rMove.status === 200, 'Status 200 OK');
    assert(Array.isArray(rMove.body.data?.items), 'Returns updated cart');
    const inCart = rMove.body.data.items.find((i) => i.variant_id === variantAId);
    assert(inCart?.quantity === 2, 'Variant added to cart with quantity 2');

    // Verify removed from wishlist
    const rWishCheck = await req('GET', `/wishlist/check/${activeProd1Id}`, null, customer1Token);
    assert(rWishCheck.body.data?.is_in_wishlist === false, 'Product automatically removed from wishlist after move to cart');
  }
}

(async () => {
  try {
    await setup();
    await runTests();
  } catch (err) {
    console.error('\nFATAL ERROR during wishlist tests:', err);
    failed++;
  } finally {
    await cleanup();
    console.log('\n─────────────────────────────────────────');
    console.log(`  Results: ${passed} passed, ${failed} failed`);
    console.log('─────────────────────────────────────────\n');
    process.exit(failed > 0 ? 1 : 0);
  }
})();
