/**
 * IBTU E-Commerce Backend
 * src/routes/products.js
 *
 * Product Catalog & Management Routes
 * Protected with fine-grained RBAC permissions:
 * - Public: Browsing products (GET)
 * - products.create: Creating products (POST)
 * - products.update: Updating products (PUT)
 * - products.delete: Deleting products (DELETE)
 */

const express = require('express');
const router = express.Router();

const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');

const { authenticate } = require('../middleware/auth.middleware');
const { requirePermission } = require('../middleware/permission.middleware');
const { optionalAuth } = require('../middleware/auth');

// ─── Public Catalog Routes ───────────────────────────────────────────────────
// Anyone (guest or authenticated) can view the products catalog
router.get('/', optionalAuth, getProducts);
router.get('/:identifier', optionalAuth, getProduct);

// ─── Protected Management Routes (Permission-gated) ──────────────────────────
// Requires authenticated user with specific RBAC permission (Admin or Data Encoder)
router.post('/', authenticate, requirePermission('products.create'), createProduct);
router.put('/:id', authenticate, requirePermission('products.update'), updateProduct);
router.delete('/:id', authenticate, requirePermission('products.delete'), deleteProduct);

module.exports = router;
