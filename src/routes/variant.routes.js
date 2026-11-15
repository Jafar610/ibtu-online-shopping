/**
 * variant.routes.js
 * Routes for the Product Variant Management API.
 *
 * Authorization matrix:
 * ┌────────────────────────────────────────────────┬────────────────────────────────┐
 * │ Endpoint                                       │ Access                         │
 * ├────────────────────────────────────────────────┼────────────────────────────────┤
 * │ GET  /api/products/:productId/variants         │ Public (active only)           │
 * │ GET  /api/variants/:id                         │ Public (active only)           │
 * │ POST /api/products/:productId/variants         │ products.create permission     │
 * │ PUT  /api/variants/:id                         │ products.update permission     │
 * │ PATCH /api/variants/:id/activate               │ products.update permission     │
 * │ PATCH /api/variants/:id/deactivate             │ products.update permission     │
 * └────────────────────────────────────────────────┴────────────────────────────────┘
 */

const express = require('express');

const { authenticate } = require('../middleware/auth.middleware');
const { requirePermission } = require('../middleware/permission.middleware');

const VariantController = require('../controllers/variant.controller');
const {
  validateCreateVariant,
  validateUpdateVariant,
  validateVariantIdParam,
  validateProductIdParam,
} = require('../validators/variant.validator');

const router = express.Router();

// ─────────────────────────────────────────────
// Public routes (no auth required)
// Note: auth middleware is applied optionally via app.js global optionalAuth if present;
// the controller checks req.user to decide staff vs public visibility.
// ─────────────────────────────────────────────

/**
 * GET /api/products/:productId/variants
 * List all variants for a product.
 * Public: active variants of active products.
 */
router.get(
  '/products/:productId/variants',
  validateProductIdParam,
  VariantController.listVariants
);

/**
 * GET /api/variants/:id
 * Get a single variant by its own ID.
 */
router.get(
  '/variants/:id',
  validateVariantIdParam,
  VariantController.getVariant
);

// ─────────────────────────────────────────────
// Protected routes (JWT + RBAC)
// ─────────────────────────────────────────────

/**
 * POST /api/products/:productId/variants
 * Create a new variant (with optional opening stock).
 */
router.post(
  '/products/:productId/variants',
  authenticate,
  requirePermission('products.create'),
  validateCreateVariant,
  VariantController.createVariant
);

/**
 * PUT /api/variants/:id
 * Update variant details (size, color, price, sale_price, low_stock_threshold, is_active, sku).
 * Does NOT update stock quantities.
 */
router.put(
  '/variants/:id',
  authenticate,
  requirePermission('products.update'),
  validateUpdateVariant,
  VariantController.updateVariant
);

/**
 * PATCH /api/variants/:id/activate
 * Activate an inactive variant.
 */
router.patch(
  '/variants/:id/activate',
  authenticate,
  requirePermission('products.update'),
  validateVariantIdParam,
  VariantController.activateVariant
);

/**
 * PATCH /api/variants/:id/deactivate
 * Deactivate a variant (soft-delete; preserves order history).
 */
router.patch(
  '/variants/:id/deactivate',
  authenticate,
  requirePermission('products.update'),
  validateVariantIdParam,
  VariantController.deactivateVariant
);

module.exports = router;
