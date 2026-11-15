/**
 * catalog.test.js
 * Automated test suite for Public Product Catalog API (Phase 9).
 *
 * Port: 5092
 *
 * Test Scenarios:
 *  1. Retrieve products list (public, active only)
 *  2. Retrieve product details by slug (includes category, images, active variants, reviews summary)
 *  3. Browse categories (tree structure with product counts)
 *  4. Browse products by category slug (parent category returns child category products)
 *  5. Search products by keyword (name, description, material, category)
 *  6. Filter by size
 *  7. Filter by color
 *  8. Filter by price range (min_price, max_price)
 *  9. Filter by in_stock availability
 * 10. Sort by price (price_asc, price_desc)
 * 11. Sort by newest (newest)
 * 12. Retrieve featured products (/featured)
 * 13. Retrieve related products (/related)
 * 14. Pagination (page, limit, total, totalPages)
 * 15. Draft and archived products are blocked from public catalog (404 / excluded)
 * 16. Inactive variants are excluded from product details and purchasable options
 */

'use strict';

const http = require('http');
const mysql = require('mysql2/promise');
require('dotenv').config();

const app = require('../src/app');

const TEST_PORT = 5092;
let server;
let pool;

let testProd1Id, testProd2Id, testProdFeaturedId, testProdDraftId, testProdArchivedId;
let testCatId, childCatId;

function req(method, pathName) {
  return new Promise((resolve, reject) => {
    const opts = {
      hostname: 'localhost',
      port: TEST_PORT,
      path: `/api${pathName}`,
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const r = http.request(opts, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });

    r.on('error', reject);
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

  // Verify category exists
  const [[parentCat]] = await pool.query('SELECT id FROM categories WHERE slug = "women"');
  testCatId = parentCat ? parentCat.id : 1;

  const [[childCat]] = await pool.query('SELECT id FROM categories WHERE slug = "habesha-kemis"');
  childCatId = childCat ? childCat.id : 4;

  // 1. Create Active Product 1
  const [p1] = await pool.query(
    `INSERT INTO products (category_id, name, slug, short_description, description, material, status, is_featured)
     VALUES (?, 'Royal Habesha Kemis', 'royal-habesha-kemis-cat-test', 'Authentic royal dress', 'Full traditional handmade dress', 'Shemma Cotton', 'active', 0)`,
    [childCatId]
  );
  testProd1Id = p1.insertId;

  // Variants for Product 1 (Active variant 1: Size M, White, Price 3500, stock 10)
  await pool.query(
    `INSERT INTO product_variants (product_id, sku, size, color, price, sale_price, stock_quantity, reserved_quantity, is_active)
     VALUES (?, 'ROYAL-M-WH', 'M', 'White', 3500, 3200, 10, 0, 1)`,
    [testProd1Id]
  );

  // Active variant 2: Size L, Gold, Price 4500, out of stock (stock 0)
  await pool.query(
    `INSERT INTO product_variants (product_id, sku, size, color, price, sale_price, stock_quantity, reserved_quantity, is_active)
     VALUES (?, 'ROYAL-L-GL', 'L', 'Gold', 4500, NULL, 0, 0, 1)`,
    [testProd1Id]
  );

  // Inactive variant 3: Size XL, Red (MUST BE HIDDEN)
  await pool.query(
    `INSERT INTO product_variants (product_id, sku, size, color, price, stock_quantity, is_active)
     VALUES (?, 'ROYAL-XL-RD', 'XL', 'Red', 5000, 5, 0)`,
    [testProd1Id]
  );

  // Primary Image for Product 1
  await pool.query(
    `INSERT INTO product_images (product_id, image_url, alt_text, is_primary, sort_order)
     VALUES (?, '/uploads/products/royal-front.png', 'Royal Kemis Front', 1, 1)`,
    [testProd1Id]
  );

  // Secondary Image for Product 1
  await pool.query(
    `INSERT INTO product_images (product_id, image_url, alt_text, is_primary, sort_order)
     VALUES (?, '/uploads/products/royal-back.png', 'Royal Kemis Back', 0, 2)`,
    [testProd1Id]
  );

  // Reviews for Product 1 (One approved review with rating 5, one pending with rating 1)
  const [[firstUser]] = await pool.query('SELECT id FROM users LIMIT 1');
  const reviewUserId = firstUser ? firstUser.id : 1;
  await pool.query(
    `INSERT INTO product_reviews (product_id, user_id, rating, title, review, review_status)
     VALUES (?, ?, 5, 'Magnificent Dress', 'Stunning quality and embroidery', 'approved')`,
    [testProd1Id, reviewUserId]
  );
  await pool.query(
    `INSERT INTO product_reviews (product_id, user_id, rating, title, review, review_status)
     VALUES (?, ?, 1, 'Fake Review', 'Should be ignored because status is pending', 'pending')`,
    [testProd1Id, reviewUserId]
  );

  // 2. Create Active Product 2 (Same category for related testing)
  const [p2] = await pool.query(
    `INSERT INTO products (category_id, name, slug, short_description, material, status, is_featured)
     VALUES (?, 'Festive Tibeb Kemis', 'festive-tibeb-kemis-cat-test', 'Colorful festive dress', 'Cotton Weave', 'active', 0)`,
    [childCatId]
  );
  testProd2Id = p2.insertId;

  await pool.query(
    `INSERT INTO product_variants (product_id, sku, size, color, price, stock_quantity, is_active)
     VALUES (?, 'TIBEB-S-BL', 'S', 'Blue', 2800, 8, 1)`,
    [testProd2Id]
  );

  // 3. Create Featured Active Product 3
  const [pf] = await pool.query(
    `INSERT INTO products (category_id, name, slug, short_description, status, is_featured)
     VALUES (?, 'Featured Kemis Deluxe', 'featured-kemis-deluxe-cat-test', 'Deluxe edition', 'active', 1)`,
    [childCatId]
  );
  testProdFeaturedId = pf.insertId;

  await pool.query(
    `INSERT INTO product_variants (product_id, sku, size, color, price, stock_quantity, is_active)
     VALUES (?, 'FEAT-M-WH', 'M', 'White', 6000, 4, 1)`,
    [testProdFeaturedId]
  );

  // 4. Create Draft Product (Should be hidden from public catalog)
  const [pd] = await pool.query(
    `INSERT INTO products (category_id, name, slug, status)
     VALUES (?, 'Draft Unpublished Dress', 'draft-dress-cat-test', 'draft')`,
    [childCatId]
  );
  testProdDraftId = pd.insertId;

  // 5. Create Archived Product (Should be hidden from public catalog)
  const [pa] = await pool.query(
    `INSERT INTO products (category_id, name, slug, status)
     VALUES (?, 'Archived Old Dress', 'archived-dress-cat-test', 'archived')`,
    [childCatId]
  );
  testProdArchivedId = pa.insertId;

  server = http.createServer(app);
  await new Promise((resolve) => server.listen(TEST_PORT, resolve));
  console.log(`\nCatalog test server running on port ${TEST_PORT}\n`);
}

async function cleanup() {
  try {
    const allProdIds = [testProd1Id, testProd2Id, testProdFeaturedId, testProdDraftId, testProdArchivedId].filter(Boolean);
    if (allProdIds.length > 0) {
      await pool.query('DELETE FROM product_reviews WHERE product_id IN (?)', [allProdIds]);
      await pool.query('DELETE FROM product_images WHERE product_id IN (?)', [allProdIds]);
      await pool.query('DELETE FROM product_variants WHERE product_id IN (?)', [allProdIds]);
      await pool.query('DELETE FROM products WHERE id IN (?)', [allProdIds]);
    }
    await pool.end();
    await new Promise((resolve) => server.close(resolve));
  } catch (err) {
    console.error('Cleanup error:', err.message);
  }
}

async function runTests() {
  console.log('─────────────────────────────────────────');
  console.log('  Public Product Catalog API Tests');
  console.log('─────────────────────────────────────────');

  // ── Test 1: Retrieve products list ──────────────────────────────────────────
  console.log('\n[Test 1] List public active products');
  {
    const r = await req('GET', '/catalog/products');
    assert(r.status === 200, 'Status 200 OK');
    assert(r.body.success === true, 'success: true');
    assert(Array.isArray(r.body.data), 'Returns products array');
    assert(r.body.meta?.total >= 3, 'Includes active products in total count');
    const p1 = r.body.data.find((p) => p.slug === 'royal-habesha-kemis-cat-test');
    assert(!!p1, 'Royal Habesha Kemis found');
    assert(p1.category?.slug === 'habesha-kemis', 'Category populated');
    assert(p1.primary_image?.image_url === '/uploads/products/royal-front.png', 'Primary image populated');
    assert(p1.price?.min === 3200 && p1.price?.max === 4500, 'Effective price range correctly computed');
    assert(p1.stock_status === 'in_stock', 'stock_status is in_stock');
  }

  // ── Test 2: Retrieve product details by slug ────────────────────────────────
  console.log('\n[Test 2] Get product details by slug');
  {
    const r = await req('GET', '/catalog/products/royal-habesha-kemis-cat-test');
    assert(r.status === 200, 'Status 200 OK');
    assert(r.body.data?.slug === 'royal-habesha-kemis-cat-test', 'Product slug matches');
    assert(r.body.data.images.length === 2, 'All images included in details');
    assert(r.body.data.reviews_summary?.average_rating === 5, 'Only approved reviews counted in rating');
    assert(r.body.data.reviews_summary?.total_reviews === 1, 'Only approved reviews counted in total');
    assert(Array.isArray(r.body.data.sizes) && r.body.data.sizes.includes('M'), 'Sizes populated');
    assert(Array.isArray(r.body.data.colors) && r.body.data.colors.includes('White'), 'Colors populated');
  }

  // ── Test 3: Browse categories tree ──────────────────────────────────────────
  console.log('\n[Test 3] Browse categories with hierarchy and counts');
  {
    const r = await req('GET', '/catalog/categories');
    assert(r.status === 200, 'Status 200 OK');
    assert(Array.isArray(r.body.data), 'Returns root categories array');
    const women = r.body.data.find((c) => c.slug === 'women');
    assert(!!women, 'Root category Women found');
    assert(women.product_count >= 3, 'Product count includes child category products');
    assert(Array.isArray(women.subcategories), 'Subcategories array present');
    const hk = women.subcategories.find((c) => c.slug === 'habesha-kemis');
    assert(!!hk, 'Subcategory Habesha Kemis found');
  }

  // ── Test 4: Browse products by category slug ────────────────────────────────
  console.log('\n[Test 4] Browse products by parent category slug');
  {
    // Browsing "women" should include products in child category "habesha-kemis"
    const r = await req('GET', '/catalog/categories/women/products');
    assert(r.status === 200, 'Status 200 OK');
    assert(r.body.data?.category?.slug === 'women', 'Category header returned');
    assert(Array.isArray(r.body.data?.products), 'Category products array present');
    const hasRoyal = r.body.data.products.some((p) => p.slug === 'royal-habesha-kemis-cat-test');
    assert(hasRoyal, 'Parent category returns subcategory products');
  }

  // ── Test 5: Search products ─────────────────────────────────────────────────
  console.log('\n[Test 5] Search products');
  {
    const r = await req('GET', '/catalog/products?search=royal');
    assert(r.status === 200, 'Status 200 OK');
    assert(r.body.data.length >= 1, 'Search finds matching products');
    assert(r.body.data.every((p) => p.name.toLowerCase().includes('royal') || p.short_description?.toLowerCase().includes('royal')), 'All results match search term');
  }

  // ── Test 6: Filter by size ──────────────────────────────────────────────────
  console.log('\n[Test 6] Filter by size');
  {
    const r = await req('GET', '/catalog/products?size=M');
    assert(r.status === 200, 'Status 200 OK');
    const found = r.body.data.find((p) => p.slug === 'royal-habesha-kemis-cat-test');
    assert(!!found, 'Product with size M returned');
  }

  // ── Test 7: Filter by color ─────────────────────────────────────────────────
  console.log('\n[Test 7] Filter by color');
  {
    const r = await req('GET', '/catalog/products?color=Gold');
    assert(r.status === 200, 'Status 200 OK');
    const found = r.body.data.find((p) => p.slug === 'royal-habesha-kemis-cat-test');
    assert(!!found, 'Product with Gold color variant returned');
  }

  // ── Test 8: Filter by price range ───────────────────────────────────────────
  console.log('\n[Test 8] Filter by price range');
  {
    const r = await req('GET', '/catalog/products?min_price=3000&max_price=3400');
    assert(r.status === 200, 'Status 200 OK');
    const found = r.body.data.find((p) => p.slug === 'royal-habesha-kemis-cat-test');
    assert(!!found, 'Product matching sale price 3200 returned in 3000-3400 filter');
  }

  // ── Test 9: Filter in_stock products ────────────────────────────────────────
  console.log('\n[Test 9] Filter in-stock products');
  {
    const r = await req('GET', '/catalog/products?in_stock=true');
    assert(r.status === 200, 'Status 200 OK');
    assert(r.body.data.every((p) => p.stock_status === 'in_stock'), 'All returned products are in stock');
  }

  // ── Test 10: Sort by price ──────────────────────────────────────────────────
  console.log('\n[Test 10] Sort by price (ascending and descending)');
  {
    const rAsc = await req('GET', '/catalog/products?sort=price_asc');
    assert(rAsc.status === 200, 'Status 200 OK for price_asc');
    const prices = rAsc.body.data.map((p) => p.price?.min).filter((p) => p !== undefined && p !== null);
    let isAsc = true;
    for (let i = 0; i < prices.length - 1; i++) {
      if (prices[i] > prices[i + 1]) isAsc = false;
    }
    assert(isAsc, 'Products sorted by price ascending');

    const rDesc = await req('GET', '/catalog/products?sort=price_desc');
    assert(rDesc.status === 200, 'Status 200 OK for price_desc');
  }

  // ── Test 11: Sort by newest ─────────────────────────────────────────────────
  console.log('\n[Test 11] Sort by newest');
  {
    const r = await req('GET', '/catalog/products?sort=newest');
    assert(r.status === 200, 'Status 200 OK');
  }

  // ── Test 12: Retrieve featured products ─────────────────────────────────────
  console.log('\n[Test 12] Retrieve featured products');
  {
    const r = await req('GET', '/catalog/products/featured');
    assert(r.status === 200, 'Status 200 OK');
    assert(Array.isArray(r.body.data), 'Returns featured products array');
    assert(r.body.data.every((p) => p.is_featured === true), 'All items have is_featured === true');
    const feat = r.body.data.find((p) => p.slug === 'featured-kemis-deluxe-cat-test');
    assert(!!feat, 'Featured Kemis Deluxe found');
  }

  // ── Test 13: Retrieve related products ──────────────────────────────────────
  console.log('\n[Test 13] Retrieve related products');
  {
    const r = await req('GET', `/catalog/products/${testProd1Id}/related`);
    assert(r.status === 200, 'Status 200 OK');
    assert(Array.isArray(r.body.data), 'Returns related products array');
    assert(r.body.data.every((p) => p.id !== testProd1Id), 'Current product excluded from related items');
  }

  // ── Test 14: Pagination ─────────────────────────────────────────────────────
  console.log('\n[Test 14] Test pagination metadata');
  {
    const r = await req('GET', '/catalog/products?page=1&limit=2');
    assert(r.status === 200, 'Status 200 OK');
    assert(r.body.data.length <= 2, 'Page size respects limit');
    assert(r.body.meta?.page === 1, 'meta.page === 1');
    assert(r.body.meta?.limit === 2, 'meta.limit === 2');
    assert(r.body.meta?.totalPages >= 2, 'totalPages calculated accurately');
  }

  // ── Test 15: Draft and archived products blocked from public catalog ─────────
  console.log('\n[Test 15] Draft & archived products blocked from public catalog');
  {
    // List check: draft and archived products not in public list
    const rList = await req('GET', '/catalog/products');
    const hasDraft = rList.body.data.some((p) => p.slug === 'draft-dress-cat-test');
    const hasArchived = rList.body.data.some((p) => p.slug === 'archived-dress-cat-test');
    assert(!hasDraft && !hasArchived, 'Draft and archived products omitted from catalog list');

    // Detail check: draft product returns 404
    const rDraft = await req('GET', '/catalog/products/draft-dress-cat-test');
    assert(rDraft.status === 404, 'Draft product returns 404 Not Found');

    // Detail check: archived product returns 404
    const rArchived = await req('GET', '/catalog/products/archived-dress-cat-test');
    assert(rArchived.status === 404, 'Archived product returns 404 Not Found');
  }

  // ── Test 16: Inactive variants excluded from details ────────────────────────
  console.log('\n[Test 16] Inactive variants excluded from details');
  {
    const r = await req('GET', '/catalog/products/royal-habesha-kemis-cat-test');
    const redVariant = r.body.data.variants.find((v) => v.sku === 'ROYAL-XL-RD');
    assert(!redVariant, 'Inactive variant ROYAL-XL-RD is excluded from purchasable variants');
    assert(!r.body.data.sizes.includes('XL'), 'Size XL from inactive variant excluded from sizes list');
  }
}

(async () => {
  try {
    await setup();
    await runTests();
  } catch (err) {
    console.error('\nFATAL ERROR during catalog tests:', err);
    failed++;
  } finally {
    await cleanup();
    console.log('\n─────────────────────────────────────────');
    console.log(`  Results: ${passed} passed, ${failed} failed`);
    console.log('─────────────────────────────────────────\n');
    process.exit(failed > 0 ? 1 : 0);
  }
})();
