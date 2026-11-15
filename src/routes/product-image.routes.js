/**
 * IBTU E-Commerce Backend
 * src/routes/product-image.routes.js
 *
 * Routes for Product Image Management
 *
 * Authorization Matrix:
 * ┌──────────────────────────────────────────────┬────────────────────────────┐
 * │ Endpoint                                     │ Permission                 │
 * ├──────────────────────────────────────────────┼────────────────────────────┤
 * │ POST   /api/products/:productId/images       │ products.create            │
 * │ GET    /api/products/:productId/images       │ Public (active products)   │
 * │ GET    /api/product-images/:id               │ Public (active products)   │
 * │ PUT    /api/product-images/:id               │ products.update            │
 * │ PATCH  /api/product-images/:id/primary       │ products.update            │
 * │ PATCH  /api/products/:productId/images/reorder │ products.update          │
 * │ DELETE /api/product-images/:id               │ products.delete            │
 * └──────────────────────────────────────────────┴────────────────────────────┘
 */

const express = require('express');
const { authenticate } = require('../middleware/auth.middleware');
const { optionalAuth } = require('../middleware/auth');
const { requirePermission } = require('../middleware/permission.middleware');
const { handleUpload } = require('../middleware/upload.middleware');
const ProductImageController = require('../controllers/product-image.controller');
const {
  validateProductIdParam,
  validateImageIdParam,
  validateUploadImage,
  validateUpdateImage,
  validateReorderImages,
} = require('../validators/product-image.validator');

const router = express.Router();

// ─────────────────────────────────────────────
// Product-specific image routes
// ─────────────────────────────────────────────

// List images for a product (public)
router.get(
  '/products/:productId/images',
  optionalAuth,
  validateProductIdParam,
  ProductImageController.listImages
);

// Upload images for a product (protected)
router.post(
  '/products/:productId/images',
  authenticate,
  requirePermission('products.create'),
  handleUpload,
  validateUploadImage,
  ProductImageController.uploadImages
);

// Reorder images for a product (protected)
router.patch(
  '/products/:productId/images/reorder',
  authenticate,
  requirePermission('products.update'),
  validateReorderImages,
  ProductImageController.reorderImages
);

// ─────────────────────────────────────────────
// Direct image resource routes
// ─────────────────────────────────────────────

// Get single image details (public)
router.get(
  '/product-images/:id',
  optionalAuth,
  validateImageIdParam,
  ProductImageController.getImage
);

// Update image details (protected)
router.put(
  '/product-images/:id',
  authenticate,
  requirePermission('products.update'),
  validateUpdateImage,
  ProductImageController.updateImage
);

// Set primary image (protected)
router.patch(
  '/product-images/:id/primary',
  authenticate,
  requirePermission('products.update'),
  validateImageIdParam,
  ProductImageController.setPrimary
);

// Delete image (protected)
router.delete(
  '/product-images/:id',
  authenticate,
  requirePermission('products.delete'),
  validateImageIdParam,
  ProductImageController.deleteImage
);

module.exports = router;
