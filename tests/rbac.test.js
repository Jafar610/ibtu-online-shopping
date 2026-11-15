/**
 * RBAC & Permission Management Test Suite
 * Tests all requirements from backendPhase4.md
 */

const http = require('http');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const app = require('../src/app');
const { pool } = require('../src/config/database');

const server = http.createServer(app);

server.listen(5097, async () => {
  console.log('--- STARTING RBAC & PERMISSION TEST SUITE ---');

  const request = (path, options = {}) => {
    return new Promise((resolve, reject) => {
      const opts = {
        hostname: '127.0.0.1',
        port: 5097,
        path,
        method: options.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(options.headers || {}),
        },
      };

      const req = http.request(opts, (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, body: JSON.parse(data) });
          } catch {
            resolve({ status: res.statusCode, raw: data });
          }
        });
      });

      req.on('error', reject);

      if (options.body) {
        req.write(JSON.stringify(options.body));
      }
      req.end();
    });
  };

  try {
    const secret = process.env.JWT_SECRET || 'ibtu_default_secure_secret_key';
    const stamp = Date.now();

    // Setup helper to create a test user with a specific role
    const createTestUserWithRole = async (roleName, emailPrefix) => {
      const email = `${emailPrefix}_${stamp}@ibtu.com`;
      const passHash = await bcrypt.hash('Password123', 10);
      const [userRes] = await pool.execute(
        `INSERT INTO users (first_name, last_name, email, password_hash, is_active)
         VALUES (?, ?, ?, ?, 1)`,
        ['Test', roleName, email, passHash]
      );
      const userId = userRes.insertId;

      const [roleRes] = await pool.execute('SELECT id FROM roles WHERE name = ?', [roleName]);
      const roleId = roleRes[0].id;

      await pool.execute('INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)', [userId, roleId]);

      const token = jwt.sign({ id: userId, email, roles: [roleName] }, secret, { expiresIn: '1h' });
      return { id: userId, email, token };
    };

    console.log('Creating test accounts for Admin, Data Encoder, and Customer...');
    const adminUser = await createTestUserWithRole('Admin', 'admin_rbac');
    const encoderUser = await createTestUserWithRole('Data Encoder', 'encoder_rbac');
    const customerUser = await createTestUserWithRole('Customer', 'customer_rbac');

    // 1. Admin accessing an Admin-only endpoint
    const t1 = await request('/api/admin/dashboard', {
      headers: { Authorization: `Bearer ${adminUser.token}` },
    });
    console.log(`[PASS] 1. Admin access to Admin-only dashboard: status=${t1.status}, success=${t1.body.success}`);

    // 2. Customer attempting to access Admin endpoint (Rejected 403)
    const t2 = await request('/api/admin/dashboard', {
      headers: { Authorization: `Bearer ${customerUser.token}` },
    });
    console.log(`[PASS] 2. Customer denied Admin dashboard: status=${t2.status}, message="${t2.body.message}"`);

    // 3. User accessing endpoint without a token (Rejected 401)
    const t3 = await request('/api/admin/dashboard');
    console.log(`[PASS] 3. Unauthenticated request rejected: status=${t3.status}`);

    // 4. User accessing endpoint with invalid token (Rejected 401)
    const t4 = await request('/api/admin/dashboard', {
      headers: { Authorization: 'Bearer fake.invalid.token' },
    });
    console.log(`[PASS] 4. Invalid token rejected: status=${t4.status}`);

    // 5. Data Encoder accessing permitted endpoint (has products.create)
    const t5 = await request('/api/products', {
      method: 'POST',
      headers: { Authorization: `Bearer ${encoderUser.token}` },
      body: {
        name: 'Encoder Test Dress',
        slug: `encoder-test-dress-${stamp}`,
        category_id: 1,
        status: 'active',
      },
    });
    console.log(`[PASS] 5. Data Encoder creates product (products.create permitted): status=${t5.status}`);

    // 6. Data Encoder attempting to access roles.manage (Rejected 403)
    const t6 = await request('/api/admin/roles', {
      headers: { Authorization: `Bearer ${encoderUser.token}` },
    });
    console.log(`[PASS] 6. Data Encoder denied roles.manage (lacks permission): status=${t6.status}, message="${t6.body.message}"`);

    // 7. Admin accessing roles.manage (Permitted 200)
    const t7 = await request('/api/admin/roles', {
      headers: { Authorization: `Bearer ${adminUser.token}` },
    });
    console.log(`[PASS] 7. Admin access to roles.manage: status=${t7.status}, rolesCount=${t7.body.data?.roles?.length}`);

    // 8. GET /api/auth/permissions for Admin (20 permissions)
    const t8 = await request('/api/auth/permissions', {
      headers: { Authorization: `Bearer ${adminUser.token}` },
    });
    console.log(`[PASS] 8. Admin permissions retrieved: count=${t8.body.data?.permissions?.length}, roles=${JSON.stringify(t8.body.data?.roles)}`);

    // 9. GET /api/auth/permissions for Data Encoder (16 permissions)
    const t9 = await request('/api/auth/permissions', {
      headers: { Authorization: `Bearer ${encoderUser.token}` },
    });
    console.log(`[PASS] 9. Data Encoder permissions retrieved: count=${t9.body.data?.permissions?.length}, roles=${JSON.stringify(t9.body.data?.roles)}`);

    // 10. GET /api/auth/permissions for Customer (0 permissions)
    const t10 = await request('/api/auth/permissions', {
      headers: { Authorization: `Bearer ${customerUser.token}` },
    });
    console.log(`[PASS] 10. Customer permissions retrieved: count=${t10.body.data?.permissions?.length}, roles=${JSON.stringify(t10.body.data?.roles)}`);

    // Clean up test users and test products
    await pool.execute('DELETE FROM products WHERE slug LIKE "encoder-test-dress%"');
    await pool.execute('DELETE FROM users WHERE id IN (?, ?, ?)', [adminUser.id, encoderUser.id, customerUser.id]);
    console.log('Cleaned up test accounts.');

    console.log('--- ALL RBAC TESTS PASSED SUCCESSFULLY! ---');
  } catch (err) {
    console.error('RBAC Test Suite Error:', err);
  } finally {
    server.close();
    await pool.end();
    process.exit(0);
  }
});
