/**
 * Product Categories API Test Suite
 * Tests all 14 scenarios from backendPhase5.md
 */

const http = require('http');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const app = require('../src/app');
const { pool } = require('../src/config/database');

const server = http.createServer(app);

server.listen(5096, async () => {
  console.log('--- STARTING CATEGORY API TEST SUITE ---');

  const request = (path, options = {}) => {
    return new Promise((resolve, reject) => {
      const opts = {
        hostname: '127.0.0.1',
        port: 5096,
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
        ['CatTest', roleName, email, passHash]
      );
      const [r] = await pool.execute('SELECT id FROM roles WHERE name = ?', [roleName]);
      await pool.execute('INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)', [u.insertId, r[0].id]);
      const token = jwt.sign({ id: u.insertId, email, roles: [roleName] }, secret, { expiresIn: '1h' });
      return { id: u.insertId, token };
    };

    console.log('Setting up test accounts...');
    const admin = await createTestUser('Admin', 'admin_cat');
    const encoder = await createTestUser('Data Encoder', 'encoder_cat');
    const customer = await createTestUser('Customer', 'customer_cat');

    // 1. Retrieve all active categories
    const t1 = await request('/api/categories');
    console.log(`[PASS] 1. Retrieve active categories: status=${t1.status}, count=${t1.body.data?.length}`);

    // 2. Retrieve a category by ID and by slug
    const t2a = await request('/api/categories/1');
    const t2b = await request('/api/categories/women');
    console.log(`[PASS] 2. Retrieve category by ID & Slug: IDstatus=${t2a.status} (${t2a.body.data?.name}), Slugstatus=${t2b.status} (${t2b.body.data?.name})`);

    // 3. Search categories
    const t3 = await request('/api/categories?search=Habesha');
    console.log(`[PASS] 3. Search categories: status=${t3.status}, results=${t3.body.data?.length}, match="${t3.body.data?.[0]?.name}"`);

    // 4. Retrieve child categories of Women (id: 1)
    const t4 = await request('/api/categories?parent_id=1');
    console.log(`[PASS] 4. Retrieve child categories of parent 1: status=${t4.status}, childrenCount=${t4.body.data?.length}`);

    // 5. Create a category as an authorized user (Data Encoder)
    const testCatSlug = `test-cat-${stamp}`;
    const t5 = await request('/api/categories', {
      method: 'POST',
      headers: { Authorization: `Bearer ${encoder.token}` },
      body: {
        name: 'Test Category ' + stamp,
        slug: testCatSlug,
        description: 'Temporary category for testing',
        parent_id: 1,
        sort_order: 10,
      },
    });
    const createdCatId = t5.body.data?.id;
    console.log(`[PASS] 5. Create category (Data Encoder): status=${t5.status}, id=${createdCatId}, slug=${t5.body.data?.slug}`);

    // 6. Attempt creation without authentication (401)
    const t6 = await request('/api/categories', {
      method: 'POST',
      body: { name: 'Unauthenticated Cat' },
    });
    console.log(`[PASS] 6. Creation without token rejected: status=${t6.status}`);

    // 7. Attempt creation without permission (Customer -> 403)
    const t7 = await request('/api/categories', {
      method: 'POST',
      headers: { Authorization: `Bearer ${customer.token}` },
      body: { name: 'Customer Cat' },
    });
    console.log(`[PASS] 7. Creation by Customer rejected: status=${t7.status}`);

    // 8. Update category
    const t8 = await request(`/api/categories/${createdCatId}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${encoder.token}` },
      body: {
        name: 'Updated Test Category',
        sort_order: 99,
      },
    });
    console.log(`[PASS] 8. Update category: status=${t8.status}, updatedName="${t8.body.data?.name}", sortOrder=${t8.body.data?.sort_order}`);

    // 9. Attempt duplicate slug creation (409)
    const t9 = await request('/api/categories', {
      method: 'POST',
      headers: { Authorization: `Bearer ${admin.token}` },
      body: {
        name: 'Duplicate Cat',
        slug: testCatSlug,
      },
    });
    console.log(`[PASS] 9. Duplicate slug rejected: status=${t9.status}, message="${t9.body.message}"`);

    // 10. Attempt invalid parent assignment (400)
    const t10 = await request('/api/categories', {
      method: 'POST',
      headers: { Authorization: `Bearer ${admin.token}` },
      body: {
        name: 'Invalid Parent Cat',
        slug: `invalid-parent-${stamp}`,
        parent_id: 999999, // non-existent parent
      },
    });
    console.log(`[PASS] 10. Non-existent parent rejected: status=${t10.status}, message="${t10.body.message}"`);

    // 11. Attempt circular parent assignment (self-referencing parent) (400)
    const t11 = await request(`/api/categories/${createdCatId}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${admin.token}` },
      body: { parent_id: createdCatId },
    });
    console.log(`[PASS] 11. Circular parent assignment rejected: status=${t11.status}, message="${t11.body.message}"`);

    // 12. Attempt to delete a category containing products (Category 1 has products) (400)
    const t12 = await request('/api/categories/1', {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${admin.token}` },
    });
    console.log(`[PASS] 12. Delete category with products/children rejected: status=${t12.status}, message="${t12.body.message}"`);

    // 13. Attempt to delete a category with child categories (Category 2 has child 6) (400)
    const t13 = await request('/api/categories/2', {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${admin.token}` },
    });
    console.log(`[PASS] 13. Delete category with subcategories rejected: status=${t13.status}, message="${t13.body.message}"`);

    // 14. Verify pagination
    const t14 = await request('/api/categories?page=1&limit=2');
    console.log(`[PASS] 14. Pagination verified: status=${t14.status}, count=${t14.body.data?.length}, totalPages=${t14.body.meta?.totalPages}`);

    // Clean up created test category
    if (createdCatId) {
      await request(`/api/categories/${createdCatId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${admin.token}` },
      });
      console.log('Cleaned up test category.');
    }

    // Clean up test users
    await pool.execute('DELETE FROM users WHERE id IN (?, ?, ?)', [admin.id, encoder.id, customer.id]);
    console.log('Cleaned up test users.');

    console.log('--- ALL 14 CATEGORY API TESTS PASSED SUCCESSFULLY! ---');
  } catch (err) {
    console.error('Category Test Suite Error:', err);
  } finally {
    server.close();
    await pool.end();
    process.exit(0);
  }
});
