/**
 * product-image.test.js
 * Automated test suite for Product Image Management API (Phase 8).
 *
 * Port: 5093
 *
 * Scenarios tested:
 *  1. Upload one valid image (Admin)
 *  2. Upload multiple valid images (Data Encoder)
 *  3. Upload an unsupported file type rejected (400)
 *  4. Upload an oversized image (>5MB) rejected (400)
 *  5. Upload images for a nonexistent product (404)
 *  6. Associate image with variant belonging to another product rejected (400)
 *  7. Retrieve product images (Public)
 *  8. Update image metadata (alt_text, variant_id, sort_order)
 *  9. Set primary image (Admin)
 * 10. Change primary image (ensures previous primary is unset)
 * 11. Reorder images for a product
 * 12. Delete an image (DB record deleted & file removed from disk)
 * 13. Unauthorized upload rejected (Customer -> 403, No token -> 401)
 * 14. Draft product images hidden from public (404) but visible to staff
 */

'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
require('dotenv').config();

const app = require('../src/app');

const TEST_PORT = 5093;
let server;
let pool;
let adminToken, encoderToken, customerToken;
let adminUserId, encoderUserId, customerUserId;
let testProductId, otherProductId, foreignVariantId, testVariantId;
let uploadedImageId1, uploadedImageId2, uploadedImageId3;
let uploadedImagePath1 = null;

// 1x1 transparent PNG buffer
const VALID_PNG_BUFFER = Buffer.from(
  '89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c4890000000a49444154789c63000100000500010d0a2d450000000049454e44ae426082',
  'hex'
);

// ─────────────────────────────────────────────
// Multipart & HTTP Helpers
// ─────────────────────────────────────────────
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
  const bodyBuffer = Buffer.concat(parts.map(p => (Buffer.isBuffer(p) ? p : Buffer.from(p, 'utf8'))));

  return {
    contentType: `multipart/form-data; boundary=${boundary}`,
    buffer: bodyBuffer,
  };
}

function req(method, pathName, body, token, isMultipart = false, contentType = 'application/json') {
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
      headers['Content-Type'] = contentType;
      headers['Content-Length'] = Buffer.byteLength(payload);
    }

    const opts = {
      hostname: 'localhost',
      port: TEST_PORT,
      path: `/api${pathName}`,
      method,
      headers,
    };

    const r = http.request(opts, res => {
      let data = '';
      res.on('data', c => (data += c));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, body: data });
        }
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

  // Admin
  const [adminRes] = await pool.query(
    `INSERT INTO users (first_name, last_name, email, phone, password_hash, is_active)
     VALUES ('ImgAdmin', 'Test', 'imgadmin@test.local', '0912000800', ?, 1)`,
    [hash]
  );
  adminUserId = adminRes.insertId;
  await pool.query('INSERT INTO user_roles (user_id, role_id) VALUES (?, 1)', [adminUserId]);

  // Data Encoder
  const [encRes] = await pool.query(
    `INSERT INTO users (first_name, last_name, email, phone, password_hash, is_active)
     VALUES ('ImgEncoder', 'Test', 'imgencoder@test.local', '0912000801', ?, 1)`,
    [hash]
  );
  encoderUserId = encRes.insertId;
  await pool.query('INSERT INTO user_roles (user_id, role_id) VALUES (?, 2)', [encoderUserId]);

  // Customer
  const [custRes] = await pool.query(
    `INSERT INTO users (first_name, last_name, email, phone, password_hash, is_active)
     VALUES ('ImgCustomer', 'Test', 'imgcustomer@test.local', '0912000802', ?, 1)`,
    [hash]
  );
  customerUserId = custRes.insertId;
  await pool.query('INSERT INTO user_roles (user_id, role_id) VALUES (?, 3)', [customerUserId]);

  const [[cat]] = await pool.query('SELECT id FROM categories LIMIT 1');
  const catId = cat.id;

  // Main test product
  const [prodRes] = await pool.query(
    `INSERT INTO products (category_id, name, slug, status, created_by)
     VALUES (?, 'Image Test Kemis', 'image-test-kemis-ph8', 'active', ?)`,
    [catId, adminUserId]
  );
  testProductId = prodRes.insertId;

  // Secondary product (to test foreign variant mismatch)
  const [otherProdRes] = await pool.query(
    `INSERT INTO products (category_id, name, slug, status, created_by)
     VALUES (?, 'Other Test Product', 'other-test-product-ph8', 'active', ?)`,
    [catId, adminUserId]
  );
  otherProductId = otherProdRes.insertId;

  // Variant belonging to testProductId
  const [vRes] = await pool.query(
    `INSERT INTO product_variants (product_id, sku, size, color, price, is_active)
     VALUES (?, 'IMG-VAR-001', 'M', 'White', 3200, 1)`,
    [testProductId]
  );
  testVariantId = vRes.insertId;

  // Foreign variant belonging to otherProductId
  const [fvRes] = await pool.query(
    `INSERT INTO product_variants (product_id, sku, size, color, price, is_active)
     VALUES (?, 'IMG-FOREIGN-001', 'L', 'Blue', 3500, 1)`,
    [otherProductId]
  );
  foreignVariantId = fvRes.insertId;

  server = http.createServer(app);
  await new Promise(resolve => server.listen(TEST_PORT, resolve));
  console.log(`\nTest server running on port ${TEST_PORT}\n`);

  // Log in
  const adminLogin = await req('POST', '/auth/login', { email: 'imgadmin@test.local', password: 'TestPass123!' });
  adminToken = adminLogin.body.data?.token;

  const encLogin = await req('POST', '/auth/login', { email: 'imgencoder@test.local', password: 'TestPass123!' });
  encoderToken = encLogin.body.data?.token;

  const custLogin = await req('POST', '/auth/login', { email: 'imgcustomer@test.local', password: 'TestPass123!' });
  customerToken = custLogin.body.data?.token;

  if (!adminToken || !encoderToken || !customerToken) {
    throw new Error('Authentication setup failed.');
  }
}

// ─────────────────────────────────────────────
// Cleanup
// ─────────────────────────────────────────────
async function cleanup() {
  try {
    // Delete test product images from DB
    const [images] = await pool.query(
      'SELECT image_url FROM product_images WHERE product_id IN (?, ?)',
      [testProductId, otherProductId]
    );
    for (const img of images) {
      if (img.image_url && img.image_url.startsWith('/uploads/products/')) {
        const p = path.join(__dirname, '../uploads/products', path.basename(img.image_url));
        if (fs.existsSync(p)) fs.unlinkSync(p);
      }
    }

    await pool.query('DELETE FROM product_images WHERE product_id IN (?, ?)', [testProductId, otherProductId]);
    await pool.query('DELETE FROM product_variants WHERE product_id IN (?, ?)', [testProductId, otherProductId]);
    await pool.query('DELETE FROM products WHERE id IN (?, ?)', [testProductId, otherProductId]);
    await pool.query('DELETE FROM user_roles WHERE user_id IN (?, ?, ?)', [adminUserId, encoderUserId, customerUserId]);
    await pool.query('DELETE FROM users WHERE id IN (?, ?, ?)', [adminUserId, encoderUserId, customerUserId]);

    await pool.end();
    await new Promise(resolve => server.close(resolve));
  } catch (err) {
    console.error('Cleanup error:', err.message);
  }
}

// ─────────────────────────────────────────────
// Tests
// ─────────────────────────────────────────────
async function runTests() {
  console.log('─────────────────────────────────────────');
  console.log('  Product Image API Tests');
  console.log('─────────────────────────────────────────');

  // ── Test 1: Upload one valid image (Admin) ───────────────────────────────────
  console.log('\n[Test 1] Upload one valid image (Admin)');
  {
    const mp = buildMultipart({
      fields: { alt_text: 'Front dress view', is_primary: 'true' },
      files: [{ fieldName: 'image', filename: 'front-test.png', contentType: 'image/png', buffer: VALID_PNG_BUFFER }],
    });
    const r = await req('POST', `/products/${testProductId}/images`, mp, adminToken, true);
    assert(r.status === 201, 'Status 201 Created');
    assert(Array.isArray(r.body.data) && r.body.data.length === 1, 'Returns array of 1 uploaded image');
    assert(r.body.data[0].is_primary === true, 'First image is primary');
    assert(r.body.data[0].alt_text === 'Front dress view', 'Alt text stored correctly');
    uploadedImageId1 = r.body.data[0].id;
    uploadedImagePath1 = path.join(__dirname, '../uploads/products', path.basename(r.body.data[0].image_url));
    assert(fs.existsSync(uploadedImagePath1), 'File successfully saved to disk');
  }

  // ── Test 2: Upload multiple valid images (Data Encoder) ──────────────────────
  console.log('\n[Test 2] Upload multiple valid images (Data Encoder)');
  {
    const mp = buildMultipart({
      fields: { alt_text: 'Angle views', variant_id: String(testVariantId) },
      files: [
        { fieldName: 'images', filename: 'side-view.png', contentType: 'image/png', buffer: VALID_PNG_BUFFER },
        { fieldName: 'images', filename: 'back-view.png', contentType: 'image/png', buffer: VALID_PNG_BUFFER },
      ],
    });
    const r = await req('POST', `/products/${testProductId}/images`, mp, encoderToken, true);
    assert(r.status === 201, 'Status 201 Created');
    assert(Array.isArray(r.body.data) && r.body.data.length === 2, 'Returns 2 uploaded images');
    assert(r.body.data[0].variant_id === testVariantId, 'Variant association set');
    assert(r.body.data[0].is_primary === false, 'Subsequent images are not primary');
    uploadedImageId2 = r.body.data[0].id;
    uploadedImageId3 = r.body.data[1].id;
  }

  // ── Test 3: Upload unsupported file type rejected (400) ──────────────────────
  console.log('\n[Test 3] Upload unsupported file type rejected');
  {
    const mp = buildMultipart({
      files: [{ fieldName: 'image', filename: 'doc.txt', contentType: 'text/plain', buffer: Buffer.from('not an image') }],
    });
    const r = await req('POST', `/products/${testProductId}/images`, mp, adminToken, true);
    assert(r.status === 400, 'Status 400 Bad Request');
    assert(r.body.success === false, 'success: false');
  }

  // ── Test 4: Upload oversized image (>5MB) rejected (400) ─────────────────────
  console.log('\n[Test 4] Upload oversized image (>5MB) rejected');
  {
    const hugeBuffer = Buffer.alloc(5 * 1024 * 1024 + 1024); // 5MB + 1KB
    const mp = buildMultipart({
      files: [{ fieldName: 'image', filename: 'huge.png', contentType: 'image/png', buffer: hugeBuffer }],
    });
    const r = await req('POST', `/products/${testProductId}/images`, mp, adminToken, true);
    assert(r.status === 400, 'Status 400 Bad Request for file size limit');
  }

  // ── Test 5: Upload images for nonexistent product (404) ──────────────────────
  console.log('\n[Test 5] Upload for nonexistent product returns 404');
  {
    const mp = buildMultipart({
      files: [{ fieldName: 'image', filename: 'test.png', contentType: 'image/png', buffer: VALID_PNG_BUFFER }],
    });
    const r = await req('POST', '/products/999999/images', mp, adminToken, true);
    assert(r.status === 404, 'Status 404 Product Not Found');
  }

  // ── Test 6: Mismatched variant association rejected (400) ────────────────────
  console.log('\n[Test 6] Mismatched variant association rejected');
  {
    const mp = buildMultipart({
      fields: { variant_id: String(foreignVariantId) }, // belongs to otherProductId
      files: [{ fieldName: 'image', filename: 'mismatch.png', contentType: 'image/png', buffer: VALID_PNG_BUFFER }],
    });
    const r = await req('POST', `/products/${testProductId}/images`, mp, adminToken, true);
    assert(r.status === 400, 'Status 400 Bad Request — variant does not belong to product');
  }

  // ── Test 7: Retrieve product images (Public) ─────────────────────────────────
  console.log('\n[Test 7] Retrieve product images (Public)');
  {
    const r = await req('GET', `/products/${testProductId}/images`);
    assert(r.status === 200, 'Status 200 OK');
    assert(Array.isArray(r.body.data?.images), 'Returns images array');
    assert(r.body.data.images.length >= 3, 'All uploaded images listed');
    assert(r.body.data.product?.id === testProductId, 'Product header returned');
  }

  // ── Test 8: Update image metadata ───────────────────────────────────────────
  console.log('\n[Test 8] Update image metadata (alt_text & sort_order)');
  {
    const r = await req(
      'PUT',
      `/product-images/${uploadedImageId2}`,
      { alt_text: 'Updated Side Silhouette', sort_order: 10 },
      adminToken
    );
    assert(r.status === 200, 'Status 200 OK');
    assert(r.body.data?.alt_text === 'Updated Side Silhouette', 'alt_text updated');
    assert(r.body.data?.sort_order === 10, 'sort_order updated');
  }

  // ── Test 9: Set primary image (Admin) ────────────────────────────────────────
  console.log('\n[Test 9] Set primary image (Admin)');
  {
    const r = await req('PATCH', `/product-images/${uploadedImageId2}/primary`, null, adminToken);
    assert(r.status === 200, 'Status 200 OK');
    assert(r.body.data?.is_primary === true, 'Image 2 is now primary');
  }

  // ── Test 10: Change primary image & verify previous unset ───────────────────
  console.log('\n[Test 10] Change primary image and verify atomicity');
  {
    // Set Image 3 as primary
    const r = await req('PATCH', `/product-images/${uploadedImageId3}/primary`, null, adminToken);
    assert(r.status === 200, 'Status 200 OK');
    assert(r.body.data?.is_primary === true, 'Image 3 is now primary');

    // Verify Image 2 is no longer primary
    const [[img2]] = await pool.query('SELECT is_primary FROM product_images WHERE id = ?', [uploadedImageId2]);
    assert(img2.is_primary === 0, 'Previous primary (Image 2) was atomically unset');
  }

  // ── Test 11: Reorder images ──────────────────────────────────────────────────
  console.log('\n[Test 11] Reorder images for a product');
  {
    const orderPayload = {
      image_orders: [
        { id: uploadedImageId1, sort_order: 5 },
        { id: uploadedImageId2, sort_order: 15 },
        { id: uploadedImageId3, sort_order: 25 },
      ],
    };
    const r = await req('PATCH', `/products/${testProductId}/images/reorder`, orderPayload, adminToken);
    assert(r.status === 200, 'Status 200 OK');
    const [[i1]] = await pool.query('SELECT sort_order FROM product_images WHERE id = ?', [uploadedImageId1]);
    const [[i2]] = await pool.query('SELECT sort_order FROM product_images WHERE id = ?', [uploadedImageId2]);
    assert(i1.sort_order === 5 && i2.sort_order === 15, 'Sort orders reordered correctly');
  }

  // ── Test 12: Delete image (DB record + disk file removal) ────────────────────
  console.log('\n[Test 12] Delete image (DB record & disk file cleanup)');
  {
    assert(fs.existsSync(uploadedImagePath1), 'File exists on disk before delete');
    const r = await req('DELETE', `/product-images/${uploadedImageId1}`, null, adminToken);
    assert(r.status === 200, 'Status 200 OK');
    assert(r.body.data?.deleted === true, 'Deleted confirmation received');

    // DB record gone
    const [[checkDb]] = await pool.query('SELECT id FROM product_images WHERE id = ?', [uploadedImageId1]);
    assert(!checkDb, 'Database row removed');

    // File unlinked from disk
    assert(!fs.existsSync(uploadedImagePath1), 'File safely unlinked from disk');
  }

  // ── Test 13: Unauthorized upload rejected ───────────────────────────────────
  console.log('\n[Test 13] Unauthorized upload attempts rejected');
  {
    const mp = buildMultipart({
      files: [{ fieldName: 'image', filename: 'unauth.png', contentType: 'image/png', buffer: VALID_PNG_BUFFER }],
    });
    // Customer lacks products.create -> 403
    const r1 = await req('POST', `/products/${testProductId}/images`, mp, customerToken, true);
    assert(r1.status === 403, 'Customer upload returns 403 Forbidden');

    // No token -> 401
    const r2 = await req('POST', `/products/${testProductId}/images`, mp, null, true);
    assert(r2.status === 401, 'Unauthenticated upload returns 401 Unauthorized');
  }

  // ── Test 14: Draft product images hidden from public ────────────────────────
  console.log('\n[Test 14] Draft product images hidden from public (404)');
  {
    // Temporarily mark test product as draft
    await pool.query('UPDATE products SET status = "draft" WHERE id = ?', [testProductId]);

    // Public request -> 404
    const pubRes = await req('GET', `/products/${testProductId}/images`);
    assert(pubRes.status === 404, 'Public gets 404 for draft product images');

    // Staff request -> 200
    const staffRes = await req('GET', `/products/${testProductId}/images`, null, adminToken);
    assert(staffRes.status === 200, 'Staff can view draft product images');

    // Restore to active
    await pool.query('UPDATE products SET status = "active" WHERE id = ?', [testProductId]);
  }
}

// ─────────────────────────────────────────────
// Runner
// ─────────────────────────────────────────────
(async () => {
  try {
    await setup();
    await runTests();
  } catch (err) {
    console.error('\nFATAL ERROR during product-image tests:', err);
    failed++;
  } finally {
    await cleanup();
    console.log('\n─────────────────────────────────────────');
    console.log(`  Results: ${passed} passed, ${failed} failed`);
    console.log('─────────────────────────────────────────\n');
    process.exit(failed > 0 ? 1 : 0);
  }
})();
