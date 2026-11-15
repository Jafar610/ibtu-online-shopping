/**
 * IBTU E-Commerce Backend
 * src/routes/catalog.routes.js
 *
 * Public Customer-Facing Catalog Routes
 * All endpoints are publicly accessible without authentication.
 */

const express = require('express');
const CatalogController = require('../controllers/catalog.controller');
const {
  validateCatalogFilter,
  validateProductIdentifier,
  validateCategorySlug,
  validateRelatedParam,
  validateFeaturedQuery,
} = require('../validators/catalog.validator');

const router = express.Router();

// ─────────────────────────────────────────────
// Category Browsing Endpoints
// ─────────────────────────────────────────────

// GET /api/catalog/categories - List active categories with counts
router.get('/categories', CatalogController.listCategories);

// GET /api/catalog/categories/:slug/products - Browse products by category
router.get(
  '/categories/:slug/products',
  validateCategorySlug,
  validateCatalogFilter,
  CatalogController.getCategoryProducts
);

// ─────────────────────────────────────────────
// Product Catalog Endpoints
// ─────────────────────────────────────────────

// GET /api/catalog/products/featured - Featured products (must precede :slug)
router.get(
  '/products/featured',
  validateFeaturedQuery,
  CatalogController.getFeatured
);

// GET /api/catalog/products/:id/related - Related products (must precede :slug)
router.get(
  '/products/:id/related',
  validateRelatedParam,
  CatalogController.getRelatedProducts
);

// GET /api/catalog/products - List products with search, filter, sort, pagination
router.get(
  '/products',
  validateCatalogFilter,
  CatalogController.listProducts
);

// GET /api/catalog/products/:slug - Product details by slug or ID
router.get(
  '/products/:slug',
  validateProductIdentifier,
  CatalogController.getProductDetails
);

module.exports = router;
