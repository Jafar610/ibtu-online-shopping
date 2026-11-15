/**
 * IBTU E-Commerce Backend
 * src/routes/product.routes.js
 *
 * Product API Routes
 * Enforces RBAC permissions for state-mutating operations:
 * - Public: Browsing products (GET)
 * - products.create: Creating products (POST)
 * - products.update: Updating products (PUT, PATCH)
 * - products.delete: Deleting products (DELETE)
 */

const express = require('express');
const router = express.Router();

const ProductController = require('../controllers/product.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { requirePermission } = require('../middleware/permission.middleware');
const { optionalAuth } = require('../middleware/auth');
const {
  validate,
  createProductValidators,
  updateProductValidators,
  updateStatusValidators,
  filterProductValidators,
} = require('../validators/product.validator');

// ─── Public Catalog Endpoints ─────────────────────────────────────────────────

// GET /api/products - List products (active only for public; all statuses for staff)
router.get('/', optionalAuth, filterProductValidators, validate, ProductController.getProducts);

// GET /api/products/:id - Single product details by ID or Slug
router.get('/:id', optionalAuth, ProductController.getProduct);

// ─── Protected Management Endpoints (RBAC Gated) ─────────────────────────────

// POST /api/products - Create a product (Admin or Data Encoder with products.create)
router.post(
  '/',
  authenticate,
  requirePermission('products.create'),
  createProductValidators,
  validate,
  ProductController.createProduct
);

// PUT /api/products/:id - Update product details (Admin or Data Encoder with products.update)
router.put(
  '/:id',
  authenticate,
  requirePermission('products.update'),
  updateProductValidators,
  validate,
  ProductController.updateProduct
);

// PATCH /api/products/:id/status - Change product status (draft, active, archived)
router.patch(
  '/:id/status',
  authenticate,
  requirePermission('products.update'),
  updateStatusValidators,
  validate,
  ProductController.updateStatus
);

// DELETE /api/products/:id - Safe deletion (Admin or Data Encoder with products.delete)
router.delete(
  '/:id',
  authenticate,
  requirePermission('products.delete'),
  ProductController.deleteProduct
);

module.exports = router;
