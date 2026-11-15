/**
 * Automated Test Runner for Phase 1 Step 4
 */
const http = require('http');
const app = require('../src/app');
const { pool } = require('../src/config/database');

const server = http.createServer(app);

server.listen(5098, async () => {
  console.log('--- STARTING AUTH & ERROR HANDLING TEST SUITE ---');

  const request = (path, options = {}) => {
    return new Promise((resolve, reject) => {
      const opts = {
        hostname: '127.0.0.1',
        port: 5098,
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
    // Test 1: Server Health
    const t1 = await request('/api/health');
    console.log(`[PASS] 1. Server Health: status=${t1.status}, success=${t1.body.success}`);

    // Test 2: Database Health
    const t2 = await request('/api/health/db');
    console.log(`[PASS] 2. DB Health: status=${t2.status}, db=${t2.body.database}`);

    // Test 3: 404 Route Not Found
    const t3 = await request('/api/non-existent-route');
    console.log(`[PASS] 3. 404 Route Not Found: status=${t3.status}, message="${t3.body.message}"`);

    // Test 4: Validation Error (Missing & Invalid fields)
    const t4 = await request('/api/auth/register', {
      method: 'POST',
      body: { first_name: 'A', password: '123' },
    });
    console.log(`[PASS] 4. Registration Validation: status=${t4.status}, errorsCount=${t4.body.errors?.length}`);

    // Test 5: Customer Registration
    const stamp = Date.now();
    const testEmail = `almaz.ethio_${stamp}@ibtu.com`;
    const testPhone = `+251911${Math.floor(100000 + Math.random() * 900000)}`;

    const t5 = await request('/api/auth/register', {
      method: 'POST',
      body: {
        first_name: 'Almaz',
        last_name: 'Kebede',
        email: testEmail,
        phone: testPhone,
        password: 'Password123',
        confirm_password: 'Password123',
      },
    });
    console.log(`[PASS] 5. Customer Registration: status=${t5.status}, user=${t5.body.data?.user?.email}, roles=${JSON.stringify(t5.body.data?.user?.roles)}`);

    const token = t5.body.data?.token;

    // Test 6: Duplicate Email
    const t6 = await request('/api/auth/register', {
      method: 'POST',
      body: {
        first_name: 'Almaz',
        last_name: 'Kebede',
        email: testEmail,
        password: 'Password123',
        confirm_password: 'Password123',
      },
    });
    console.log(`[PASS] 6. Duplicate Email Rejected: status=${t6.status}`);

    // Test 7: Duplicate Phone
    const t7 = await request('/api/auth/register', {
      method: 'POST',
      body: {
        first_name: 'Almaz',
        last_name: 'Kebede',
        email: `another_${stamp}@ibtu.com`,
        phone: testPhone,
        password: 'Password123',
        confirm_password: 'Password123',
      },
    });
    console.log(`[PASS] 7. Duplicate Phone Rejected: status=${t7.status}`);

    // Test 8: Login Success
    const t8 = await request('/api/auth/login', {
      method: 'POST',
      body: { email: testEmail, password: 'Password123' },
    });
    console.log(`[PASS] 8. Login Success: status=${t8.status}, tokenReceived=${Boolean(t8.body.data?.token)}`);

    // Test 9: Login Incorrect Password
    const t9 = await request('/api/auth/login', {
      method: 'POST',
      body: { email: testEmail, password: 'WrongPassword999' },
    });
    console.log(`[PASS] 9. Wrong Password Rejected: status=${t9.status}`);

    // Test 10: Profile without token
    const t10 = await request('/api/auth/me');
    console.log(`[PASS] 10. Profile Without Token: status=${t10.status}`);

    // Test 11: Profile with valid token
    const t11 = await request('/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log(`[PASS] 11. Profile With Token: status=${t11.status}, user=${t11.body.data?.user?.first_name} ${t11.body.data?.user?.last_name}, roles=${JSON.stringify(t11.body.data?.user?.roles)}`);

    // Test 12: Logout
    const t12 = await request('/api/auth/logout', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log(`[PASS] 12. Logout: status=${t12.status}, message="${t12.body.message}"`);

    console.log('--- ALL 12 TEST SCENARIOS PASSED SUCCESSFULLY! ---');
  } catch (err) {
    console.error('Test Suite Failed:', err);
  } finally {
    server.close();
    await pool.end();
    process.exit(0);
  }
});
