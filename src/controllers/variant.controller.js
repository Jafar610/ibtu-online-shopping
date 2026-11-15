/**
 * variant.controller.js
 * HTTP handler layer for Product Variant endpoints.
 *
 * Responsibilities:
 *  - Extract validated params/body from the request.
 *  - Call the VariantService.
 *  - Return a standard ApiResponse.
 *  - Delegate errors to the central error middleware via next(err).
 *
 * No SQL lives here — all DB logic is in variant.service.js.
 */

const { validationResult } = require('express-validator');
const ApiResponse = require('../utils/api-response');
const AppError = require('../utils/app-error');
const VariantService = require('../services/variant.service');

/** Throw a formatted validation error if express-validator found problems */
function assertValid(req) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages = errors.array().map(e => ({ field: e.path, message: e.msg }));
    throw AppError.unprocessable('Validation failed', messages);
  }
}

/** Is the caller an Admin or Data Encoder? (checks req.user set by auth middleware) */
function isStaff(req) {
  if (!req.user) return false;
  const roles = (req.user.roles || (req.user.role ? [req.user.role] : [])).map(r => String(r).toLowerCase());
  return roles.includes('admin') || roles.includes('data encoder');
}

// ─────────────────────────────────────────────
// Controllers
// ─────────────────────────────────────────────

/**
 * GET /api/products/:productId/variants
 * Public: active variants of active products.
 * Admin/Staff: all variants.
 */
async function listVariants(req, res, next) {
  try {
    assertValid(req);
    const productId = req.params.productId;
    const result = await VariantService.getVariantsByProductId(productId, {
      isAdmin: isStaff(req),
    });
    return ApiResponse.success(res, 'Variants retrieved successfully', result);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/variants/:id
 * Public: active variant of active product.
 * Admin/Staff: any variant.
 */
async function getVariant(req, res, next) {
  try {
    assertValid(req);
    const id = req.params.id;
    const variant = await VariantService.getVariantById(id, { isAdmin: isStaff(req) });
    return ApiResponse.success(res, 'Variant retrieved successfully', variant);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/products/:productId/variants
 * Requires: products.create permission
 * Creates a variant and optionally records opening stock movement.
 */
async function createVariant(req, res, next) {
  try {
    assertValid(req);
    const productId = req.params.productId;
    const userId = req.user.id;
    const variant = await VariantService.createVariant(productId, req.body, userId);
    return ApiResponse.created(res, 'Variant created successfully', variant);
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/variants/:id
 * Requires: products.update permission
 * Updates non-stock fields only.
 */
async function updateVariant(req, res, next) {
  try {
    assertValid(req);
    const id = req.params.id;
    const variant = await VariantService.updateVariant(id, req.body);
    return ApiResponse.success(res, 'Variant updated successfully', variant);
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/variants/:id/activate
 * Requires: products.update permission
 */
async function activateVariant(req, res, next) {
  try {
    assertValid(req);
    const id = req.params.id;
    const variant = await VariantService.activateVariant(id);
    return ApiResponse.success(res, 'Variant activated successfully', variant);
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/variants/:id/deactivate
 * Requires: products.update permission
 */
async function deactivateVariant(req, res, next) {
  try {
    assertValid(req);
    const id = req.params.id;
    const variant = await VariantService.deactivateVariant(id);
    return ApiResponse.success(res, 'Variant deactivated successfully', variant);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listVariants,
  getVariant,
  createVariant,
  updateVariant,
  activateVariant,
  deactivateVariant,
};
