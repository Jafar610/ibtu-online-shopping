/**
 * address.test.js
 * Automated test suite for Customer Address Management API (Phase 12 / Phase 3 Step 3).
 *
 * Port: 5089
 *
 * Scenarios Tested:
 *  1. Retrieve addresses without authentication (401)
 *  2. Create the first address (201)
 *  3. Verify the first address automatically becomes default (is_default = true)
 *  4. Create a second address (is_default = false)
 *  5. Create a third address with is_default = true
 *  6. Verify previous default is changed (atomicity)
 *  7. Retrieve all addresses (default first)
 *  8. Retrieve one address by ID
 *  9. Attempt to access another customer's address (404)
 * 10. Update an address details
 * 11. Set another address as default (/default)
 * 12. Verify only one default address exists across customer's addresses
 * 13. Delete a non-default address
 * 14. Delete the default address
 * 15. Verify default reassignment (remaining address promoted to default)
 * 16. Attempt to delete an address referenced by an order (400 Bad Request)
 * 17. Submit invalid address data (422 Unprocessable)
 * 18. Verify Admin and Data Encoder accounts cannot manage customer addresses (403)
 */

'use strict';

const http = require('http');
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
require('dotenv').config();

const app = require('../src/app');

const TEST_PORT = 5089;
let server;
let pool;

let customer1Id, customer2Id, adminUserId, encoderUserId;
let customer1Token, customer2Token, adminToken, encoderToken;
let testOrderId = null;

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

  const hash = await bcrypt.hash('AddressPass123!', 10);

  // 1. Customer 1
  const [c1] = await pool.query(
    `INSERT INTO users (first_name, last_name, email, phone, password_hash, is_active)
     VALUES ('AddrUser1', 'Tester', 'addr.user1@test.local', '0915000501', ?, 1)`,
    [hash]
  );
  customer1Id = c1.insertId;
  await pool.query('INSERT INTO user_roles (user_id, role_id) VALUES (?, 3)', [customer1Id]);

  // 2. Customer 2
  const [c2] = await pool.query(
    `INSERT INTO users (first_name, last_name, email, phone, password_hash, is_active)
     VALUES ('AddrUser2', 'Tester', 'addr.user2@test.local', '0915000502', ?, 1)`,
    [hash]
  );
  customer2Id = c2.insertId;
  await pool.query('INSERT INTO user_roles (user_id, role_id) VALUES (?, 3)', [customer2Id]);

  // 3. Admin user (Role 1 only)
  const [adm] = await pool.query(
    `INSERT INTO users (first_name, last_name, email, phone, password_hash, is_active)
     VALUES ('AddrAdmin', 'Tester', 'addr.admin@test.local', '0915000503', ?, 1)`,
    [hash]
  );
  adminUserId = adm.insertId;
  await pool.query('INSERT INTO user_roles (user_id, role_id) VALUES (?, 1)', [adminUserId]);

  // 4. Data Encoder user (Role 2 only)
  const [enc] = await pool.query(
    `INSERT INTO users (first_name, last_name, email, phone, password_hash, is_active)
     VALUES ('AddrEncoder', 'Tester', 'addr.encoder@test.local', '0915000504', ?, 1)`,
    [hash]
  );
  encoderUserId = enc.insertId;
  await pool.query('INSERT INTO user_roles (user_id, role_id) VALUES (?, 2)', [encoderUserId]);

  server = http.createServer(app);
  await new Promise((resolve) => server.listen(TEST_PORT, resolve));
  console.log(`\nAddress test server running on port ${TEST_PORT}\n`);

  // Logins
  const l1 = await req('POST', '/auth/login', { email: 'addr.user1@test.local', password: 'AddressPass123!' });
  customer1Token = l1.body.data?.token;

  const l2 = await req('POST', '/auth/login', { email: 'addr.user2@test.local', password: 'AddressPass123!' });
  customer2Token = l2.body.data?.token;

  const lAdm = await req('POST', '/auth/login', { email: 'addr.admin@test.local', password: 'AddressPass123!' });
  adminToken = lAdm.body.data?.token;

  const lEnc = await req('POST', '/auth/login', { email: 'addr.encoder@test.local', password: 'AddressPass123!' });
  encoderToken = lEnc.body.data?.token;

  if (!customer1Token || !customer2Token || !adminToken || !encoderToken) {
    throw new Error('Authentication setup failed.');
  }
}

async function cleanup() {
  try {
    const allUserIds = [customer1Id, customer2Id, adminUserId, encoderUserId].filter(Boolean);

    if (testOrderId) {
      await pool.query('DELETE FROM orders WHERE id = ?', [testOrderId]);
    }

    await pool.query('DELETE FROM customer_addresses WHERE user_id IN (?)', [allUserIds]);
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
  console.log('  Customer Address Management API Tests');
  console.log('─────────────────────────────────────────');

  let addr1Id, addr2Id, addr3Id;

  // ── Test 1: Access without authentication ───────────────────────────────────
  console.log('\n[Test 1] Retrieve addresses without authentication (401)');
  {
    const r = await req('GET', '/addresses');
    assert(r.status === 401, 'Status 401 Unauthorized');
    assert(r.body.success === false, 'success: false');
  }

  // ── Test 2: Create the first address ────────────────────────────────────────
  console.log('\n[Test 2] Create the first address for Customer 1');
  {
    const payload = {
      address_type: 'home',
      recipient_name: 'Abebe Kebede',
      phone: '+251911223344',
      address_line1: 'Bole Subcity, Woreda 03',
      address_line2: 'House No 123',
      city: 'Addis Ababa',
      region: 'Addis Ababa',
      postal_code: '1000',
      country: 'Ethiopia',
      is_default: false, // Should automatically become true since it is the first address!
    };

    const r = await req('POST', '/addresses', payload, customer1Token);
    assert(r.status === 201, 'Status 201 Created');
    assert(r.body.data?.recipient_name === 'Abebe Kebede', 'recipient_name matches');
    addr1Id = r.body.data?.id;
  }

  // ── Test 3: First address automatically default ─────────────────────────────
  console.log('\n[Test 3] Verify first address automatically became default');
  {
    const r = await req('GET', `/addresses/${addr1Id}`, null, customer1Token);
    assert(r.status === 200, 'Status 200 OK');
    assert(r.body.data?.is_default === true, 'First address has is_default = true');
  }

  // ── Test 4: Create a second address (default: false) ────────────────────────
  console.log('\n[Test 4] Create a second address with default: false');
  {
    const payload = {
      address_type: 'work',
      recipient_name: 'Abebe Kebede',
      phone: '+251911223344',
      address_line1: 'Kazanchis, Commercial Bank Tower',
      city: 'Addis Ababa',
      is_default: false,
    };

    const r = await req('POST', '/addresses', payload, customer1Token);
    assert(r.status === 201, 'Status 201 Created');
    assert(r.body.data?.is_default === false, 'Second address is_default is false');
    addr2Id = r.body.data?.id;

    // Verify Address 1 remains default
    const [[a1]] = await pool.query('SELECT is_default FROM customer_addresses WHERE id = ?', [addr1Id]);
    assert(a1.is_default === 1, 'Address 1 is still default');
  }

  // ── Test 5: Create a third address with is_default: true ────────────────────
  console.log('\n[Test 5] Create a third address with is_default: true');
  {
    const payload = {
      address_type: 'other',
      recipient_name: 'Chaltu Tadesse',
      phone: '+251922334455',
      address_line1: 'Gerji Imperial',
      city: 'Addis Ababa',
      is_default: true,
    };

    const r = await req('POST', '/addresses', payload, customer1Token);
    assert(r.status === 201, 'Status 201 Created');
    assert(r.body.data?.is_default === true, 'Address 3 is default');
    addr3Id = r.body.data?.id;
  }

  // ── Test 6: Verify previous default was changed (atomicity) ─────────────────
  console.log('\n[Test 6] Verify previous default address was changed');
  {
    const [[a1]] = await pool.query('SELECT is_default FROM customer_addresses WHERE id = ?', [addr1Id]);
    assert(a1.is_default === 0, 'Address 1 default flag was cleared');

    // Count defaults for Customer 1
    const [[{ defaultCount }]] = await pool.query(
      'SELECT COUNT(*) as defaultCount FROM customer_addresses WHERE user_id = ? AND is_default = 1',
      [customer1Id]
    );
    assert(defaultCount === 1, 'Exactly 1 default address exists for customer');
  }

  // ── Test 7: Retrieve all addresses (default first) ──────────────────────────
  console.log('\n[Test 7] Retrieve all addresses for Customer 1');
  {
    const r = await req('GET', '/addresses', null, customer1Token);
    assert(r.status === 200, 'Status 200 OK');
    assert(Array.isArray(r.body.data) && r.body.data.length === 3, 'Returns 3 addresses');
    assert(r.body.data[0].id === addr3Id, 'Default address (Address 3) is ordered first');
    assert(r.body.data[0].is_default === true, 'First returned item is default');
  }

  // ── Test 8: Retrieve one address by ID ──────────────────────────────────────
  console.log('\n[Test 8] Retrieve single address by ID');
  {
    const r = await req('GET', `/addresses/${addr2Id}`, null, customer1Token);
    assert(r.status === 200, 'Status 200 OK');
    assert(r.body.data?.id === addr2Id, 'ID matches');
    assert(r.body.data?.address_type === 'work', 'address_type matches');
  }

  // ── Test 9: Access another customer address (404) ───────────────────────────
  console.log('\n[Test 9] Customer 2 attempts to access Customer 1 address (404)');
  {
    const r = await req('GET', `/addresses/${addr1Id}`, null, customer2Token);
    assert(r.status === 404, 'Status 404 Address Not Found');
  }

  // ── Test 10: Update an address ──────────────────────────────────────────────
  console.log('\n[Test 10] Update Address 2 details');
  {
    const updatePayload = {
      recipient_name: 'Abebe Kebede Jr.',
      phone: '+251988776655',
      address_line1: 'Kazanchis, Sunshine Building 4th Floor',
    };

    const r = await req('PUT', `/addresses/${addr2Id}`, updatePayload, customer1Token);
    assert(r.status === 200, 'Status 200 OK');
    assert(r.body.data?.recipient_name === 'Abebe Kebede Jr.', 'recipient_name updated');
    assert(r.body.data?.phone === '+251988776655', 'phone updated');
    assert(r.body.data?.address_line1 === 'Kazanchis, Sunshine Building 4th Floor', 'address_line1 updated');
  }

  // ── Test 11: Set another address as default ─────────────────────────────────
  console.log('\n[Test 11] Set Address 1 as default (/default)');
  {
    const r = await req('PATCH', `/addresses/${addr1Id}/default`, null, customer1Token);
    assert(r.status === 200, 'Status 200 OK');
    assert(r.body.data?.is_default === true, 'Address 1 is now default');
  }

  // ── Test 12: Verify only one default exists ─────────────────────────────────
  console.log('\n[Test 12] Verify single default address consistency');
  {
    const [[a1]] = await pool.query('SELECT is_default FROM customer_addresses WHERE id = ?', [addr1Id]);
    const [[a3]] = await pool.query('SELECT is_default FROM customer_addresses WHERE id = ?', [addr3Id]);
    assert(a1.is_default === 1, 'Address 1 is default');
    assert(a3.is_default === 0, 'Address 3 is no longer default');
  }

  // ── Test 13: Delete a non-default address ───────────────────────────────────
  console.log('\n[Test 13] Delete non-default Address 2');
  {
    const r = await req('DELETE', `/addresses/${addr2Id}`, null, customer1Token);
    assert(r.status === 200, 'Status 200 OK');
    assert(r.body.data?.deleted === true, 'deleted: true');

    const [[checkDb]] = await pool.query('SELECT id FROM customer_addresses WHERE id = ?', [addr2Id]);
    assert(!checkDb, 'Address 2 removed from database');
  }

  // ── Test 14 & 15: Delete default address & verify reassignment ──────────────
  console.log('\n[Test 14 & 15] Delete default address (Address 1) and verify promotion of Address 3');
  {
    const r = await req('DELETE', `/addresses/${addr1Id}`, null, customer1Token);
    assert(r.status === 200, 'Status 200 OK');

    // Remaining address (Address 3) should now be promoted to default!
    const [[a3]] = await pool.query('SELECT is_default FROM customer_addresses WHERE id = ?', [addr3Id]);
    assert(a3.is_default === 1, 'Address 3 was automatically promoted to default');
  }

  // ── Test 16: Attempt to delete an address referenced by an order ────────────
  console.log('\n[Test 16] Attempt to delete address referenced by an existing order (400)');
  {
    // Insert a dummy order pointing to Address 3
    const [ord] = await pool.query(
      `INSERT INTO orders
        (order_number, user_id, shipping_address_id, customer_name, customer_email, customer_phone,
         shipping_address_line1, shipping_city, shipping_country, subtotal, total_amount, currency)
       VALUES
        ('ORD-ADDR-TEST-001', ?, ?, 'Chaltu Tadesse', 'chaltu@test.local', '+251922334455',
         'Gerji Imperial', 'Addis Ababa', 'Ethiopia', 1000, 1000, 'ETB')`,
      [customer1Id, addr3Id]
    );
    testOrderId = ord.insertId;

    // Try deleting Address 3
    const r = await req('DELETE', `/addresses/${addr3Id}`, null, customer1Token);
    assert(r.status === 400, 'Status 400 Bad Request');
    assert(r.body.message.includes('associated with existing orders'), 'Meaningful order protection error message');

    // Verify Address 3 still exists in DB
    const [[stillExists]] = await pool.query('SELECT id FROM customer_addresses WHERE id = ?', [addr3Id]);
    assert(!!stillExists, 'Address 3 was safely preserved');
  }

  // ── Test 17: Submit invalid address data ────────────────────────────────────
  console.log('\n[Test 17] Submit invalid address data (missing recipient_name / invalid phone)');
  {
    const invalidPayload = {
      recipient_name: '',
      phone: 'invalid-phone',
      address_line1: '',
      city: '',
    };
    const r = await req('POST', '/addresses', invalidPayload, customer1Token);
    assert(r.status === 422, 'Status 422 Unprocessable for invalid data');
    assert(Array.isArray(r.body.errors) && r.body.errors.length >= 3, 'Detailed validation errors returned');
  }

  // ── Test 18: Admin and Data Encoder cannot manage customer addresses ────────
  console.log('\n[Test 18] Admin and Data Encoder blocked from customer addresses (403)');
  {
    const rAdmin = await req('GET', '/addresses', null, adminToken);
    assert(rAdmin.status === 403, 'Admin gets 403 Forbidden');

    const rEncoder = await req('GET', '/addresses', null, encoderToken);
    assert(rEncoder.status === 403, 'Data Encoder gets 403 Forbidden');
  }
}

(async () => {
  try {
    await setup();
    await runTests();
  } catch (err) {
    console.error('\nFATAL ERROR during address tests:', err);
    failed++;
  } finally {
    await cleanup();
    console.log('\n─────────────────────────────────────────');
    console.log(`  Results: ${passed} passed, ${failed} failed`);
    console.log('─────────────────────────────────────────\n');
    process.exit(failed > 0 ? 1 : 0);
  }
})();
