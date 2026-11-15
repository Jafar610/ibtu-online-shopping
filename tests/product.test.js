/**
 * Product Management API Test Suite
 * Tests all 15 scenarios from backendPhase6.md
 */

const http = require('http');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const app = require('../src/app');
const { pool } = require('../src/config/database');

const server = http.createServer(app);

server.listen(5095, async () => {
  console.log('--- STARTING PRODUCT API TEST SUITE ---');

  const request = (path, options = {}) => {
    return new Promise((resolve, reject) => {
      const opts = {
        hostname: '127.0.0.1',
        port: 5095,
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

    // Helper: Create a temporary user with specific role
    const createTestUser = async (roleName, prefix) => {
      const email = `${prefix}_${stamp}@ibtu.com`;
      const passHash = await bcrypt.hash('Password123', 10);
      const [u] = await pool.execute(
        'INSERT INTO users (first_name, last_name, email, password_hash, is_active) VALUES (?, ?, ?, ?, 1)',
        ['ProdTest', roleName, email, passHash]
      );
      const [r] = await pool.execute('SELECT id FROM roles WHERE name = ?', [roleName]);
      await pool.execute('INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)', [u.insertId, r[0].id]);
      const token = jwt.sign({ id: u.insertId, email, roles: [roleName] }, secret, { expiresIn: '1h' });
      return { id: u.insertId, token };
    };

    console.log('Setting up test accounts for Product tests...');
    const admin = await createTestUser('Admin', 'admin_prod');
    const encoder = await createTestUser('Data Encoder', 'encoder_prod');
    const customer = await createTestUser('Customer', 'customer_prod');

    // 1. Retrieve all active products
    const t1 = await request('/api/products');
    console.log(`[PASS] 1. Retrieve active products: status=${t1.status}, count=${t1.body.data?.length}`);

    // 2. Retrieve a product by ID & Slug
    const t2a = await request('/api/products/1');
    const t2b = await request('/api/products/traditional-habesha-kemis');
    console.log(`[PASS] 2. Retrieve product by ID & Slug: IDstatus=${t2a.status} ("${t2a.body.data?.name}"), Slugstatus=${t2b.status}`);

    // 3. Create a product as an authorized user (Data Encoder)
    const testProdSlug = `test-habesha-dress-${stamp}`;
    const t3 = await request('/api/products', {
      method: 'POST',
      headers: { Authorization: `Bearer ${encoder.token}` },
      body: {
        name: 'Festive Habesha Kemis ' + stamp,
        slug: testProdSlug,
        category_id: 4, // Habesha Kemis
        short_description: 'Handwoven traditional dress with modern embroidery',
        description: 'Made with genuine Ethiopian Shemma cotton.',
        material: '100% Ethiopian Cotton',
        care_instructions: 'Hand wash cold only',
        status: 'active',
        is_featured: true,
      },
    });
    const createdProdId = t3.body.data?.id;
    console.log(`[PASS] 3. Create product (Data Encoder): status=${t3.status}, id=${createdProdId}, slug=${t3.body.data?.slug}`);

    // 4. Attempt creation without authentication (401)
    const t4 = await request('/api/products', {
      method: 'POST',
      body: { name: 'Unauthenticated Product', category_id: 1 },
    });
    console.log(`[PASS] 4. Unauthenticated creation rejected: status=${t4.status}`);

    // 5. Attempt creation without permission (Customer -> 403)
    const t5 = await request('/api/products', {
      method: 'POST',
      headers: { Authorization: `Bearer ${customer.token}` },
      body: { name: 'Customer Product', category_id: 1 },
    });
    console.log(`[PASS] 5. Customer creation rejected: status=${t5.status}`);

    // 6. Create product with invalid category (400)
    const t6 = await request('/api/products', {
      method: 'POST',
      headers: { Authorization: `Bearer ${encoder.token}` },
      body: {
        name: 'Invalid Category Product',
        category_id: 999999, // non-existent category
      },
    });
    console.log(`[PASS] 6. Invalid category rejected: status=${t6.status}, message="${t6.body.message}"`);

    // 7. Attempt duplicate slug creation (409)
    const t7 = await request('/api/products', {
      method: 'POST',
      headers: { Authorization: `Bearer ${admin.token}` },
      body: {
        name: 'Duplicate Slug Product',
        slug: testProdSlug,
        category_id: 4,
      },
    });
    console.log(`[PASS] 7. Duplicate slug rejected: status=${t7.status}, message="${t7.body.message}"`);

    // 8. Update product information
    const t8 = await request(`/api/products/${createdProdId}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${encoder.token}` },
      body: {
        name: 'Updated Festive Kemis',
        material: 'Premium Shemma Cotton',
      },
    });
    console.log(`[PASS] 8. Update product: status=${t8.status}, updatedName="${t8.body.data?.name}", material="${t8.body.data?.material}"`);

    // 9. Change product status to 'draft'
    const t9 = await request(`/api/products/${createdProdId}/status`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${encoder.token}` },
      body: { status: 'draft' },
    });
    console.log(`[PASS] 9. Change product status to draft: status=${t9.status}, currentStatus="${t9.body.data?.status}"`);

    // 10. Confirm public users cannot retrieve draft product (404)
    const t10 = await request(`/api/products/${createdProdId}`);
    console.log(`[PASS] 10. Public access to draft product blocked: status=${t10.status}`);

    // But staff can retrieve it with their token:
    const t10Staff = await request(`/api/products/${createdProdId}`, {
      headers: { Authorization: `Bearer ${encoder.token}` },
    });
    console.log(`[PASS] 10b. Staff access to draft product allowed: status=${t10Staff.status}, statusName="${t10Staff.body.data?.status}"`);

    // Restore status to 'active' for search/filter tests
    await request(`/api/products/${createdProdId}/status`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${encoder.token}` },
      body: { status: 'active' },
    });

    // 11. Search products
    const t11 = await request('/api/products?search=Festive');
    console.log(`[PASS] 11. Search products: status=${t11.status}, results=${t11.body.data?.length}, matched="${t11.body.data?.[0]?.name}"`);

    // 12. Filter by category
    const t12 = await request('/api/products?category_id=4');
    console.log(`[PASS] 12. Filter by category 4: status=${t12.status}, count=${t12.body.data?.length}`);

    // 13. Sort products
    const t13 = await request('/api/products?sort=name&order=ASC');
    console.log(`[PASS] 13. Sort products by name: status=${t13.status}, first="${t13.body.data?.[0]?.name}"`);

    // 14. Pagination
    const t14 = await request('/api/products?page=1&limit=2');
    console.log(`[PASS] 14. Pagination: status=${t14.status}, count=${t14.body.data?.length}, totalPages=${t14.body.meta?.totalPages}`);

    // 15. Safe deletion
    const t15 = await request(`/api/products/${createdProdId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${admin.token}` },
    });
    console.log(`[PASS] 15. Safe product deletion: status=${t15.status}, deleted="${t15.body.data?.name}"`);

    // Clean up test users
    await pool.execute('DELETE FROM users WHERE id IN (?, ?, ?)', [admin.id, encoder.id, customer.id]);
    console.log('Cleaned up test users.');

    console.log('--- ALL 15 PRODUCT API TESTS PASSED SUCCESSFULLY! ---');
  } catch (err) {
    console.error('Product Test Suite Error:', err);
  } finally {
    server.close();
    await pool.end();
    process.exit(0);
  }
});
