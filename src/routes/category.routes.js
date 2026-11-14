/**
 * IBTU E-Commerce Backend
 * src/routes/category.routes.js
 *
 * Product Category API Routes
 * Enforces RBAC permissions for state-mutating operations:
 * - Public: Browsing categories (GET)
 * - categories.create: Creating categories (POST)
 * - categories.update: Updating categories (PUT)
 * - categories.delete: Deleting categories (DELETE)
 */

const express = require('express');
const router = express.Router();

const CategoryController = require('../controllers/category.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { requirePermission } = require('../middleware/permission.middleware');
const {
  validate,
  createCategoryValidators,
  updateCategoryValidators,
  filterCategoryValidators,
} = require('../validators/category.validator');

// ─── Public Endpoints ─────────────────────────────────────────────────────────

// GET /api/categories - List active categories with search, parent filter, and pagination
router.get('/', filterCategoryValidators, validate, CategoryController.getCategories);

// GET /api/categories/:id - Get category details by ID or Slug
router.get('/:id', CategoryController.getCategory);

// ─── Protected Management Endpoints (RBAC Gated) ─────────────────────────────

// POST /api/categories - Create a category (Admin or Data Encoder with categories.create)
router.post(
  '/',
  authenticate,
  requirePermission('categories.create'),
  createCategoryValidators,
  validate,
  CategoryController.createCategory
);

// PUT /api/categories/:id - Update category details (Admin or Data Encoder with categories.update)
router.put(
  '/:id',
  authenticate,
  requirePermission('categories.update'),
  updateCategoryValidators,
  validate,
  CategoryController.updateCategory
);

// DELETE /api/categories/:id - Safe deletion (Admin or Data Encoder with categories.delete)
router.delete(
  '/:id',
  authenticate,
  requirePermission('categories.delete'),
  CategoryController.deleteCategory
);

module.exports = router;
