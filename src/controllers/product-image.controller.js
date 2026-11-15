/**
 * IBTU E-Commerce Backend
 * src/controllers/product-image.controller.js
 *
 * Controller for Product Image Management
 */

const { validationResult } = require('express-validator');
const ApiResponse = require('../utils/api-response');
const AppError = require('../utils/app-error');
const ProductImageService = require('../services/product-image.service');

function assertValid(req) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages = errors.array().map(e => ({ field: e.path, message: e.msg }));
    throw AppError.unprocessable('Validation failed', messages);
  }
}

function isStaff(req) {
  if (!req.user) return false;
  const roles = (req.user.roles || (req.user.role ? [req.user.role] : [])).map(r => String(r).toLowerCase());
  return roles.includes('admin') || roles.includes('data encoder');
}

class ProductImageController {
  /**
   * POST /api/products/:productId/images
   */
  static async uploadImages(req, res, next) {
    try {
      assertValid(req);
      const productId = req.params.productId;
      const files = req.uploadedFiles;
      const images = await ProductImageService.uploadProductImages(productId, files, req.body);
      return ApiResponse.created(res, 'Product images uploaded successfully', images);
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/products/:productId/images
   */
  static async listImages(req, res, next) {
    try {
      assertValid(req);
      const productId = req.params.productId;
      const result = await ProductImageService.getProductImages(productId, {
        isAdmin: isStaff(req),
      });
      return ApiResponse.success(res, 'Product images retrieved successfully', result);
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/product-images/:id
   */
  static async getImage(req, res, next) {
    try {
      assertValid(req);
      const imageId = req.params.id;
      const image = await ProductImageService.getProductImageById(imageId, {
        isAdmin: isStaff(req),
      });
      return ApiResponse.success(res, 'Product image retrieved successfully', image);
    } catch (err) {
      next(err);
    }
  }

  /**
   * PUT /api/product-images/:id
   */
  static async updateImage(req, res, next) {
    try {
      assertValid(req);
      const imageId = req.params.id;
      const updated = await ProductImageService.updateProductImage(imageId, req.body);
      return ApiResponse.success(res, 'Product image updated successfully', updated);
    } catch (err) {
      next(err);
    }
  }

  /**
   * PATCH /api/product-images/:id/primary
   */
  static async setPrimary(req, res, next) {
    try {
      assertValid(req);
      const imageId = req.params.id;
      const image = await ProductImageService.setPrimaryImage(imageId);
      return ApiResponse.success(res, 'Primary image set successfully', image);
    } catch (err) {
      next(err);
    }
  }

  /**
   * PATCH /api/products/:productId/images/reorder
   */
  static async reorderImages(req, res, next) {
    try {
      assertValid(req);
      const productId = req.params.productId;
      const { image_orders } = req.body;
      const result = await ProductImageService.reorderProductImages(productId, image_orders);
      return ApiResponse.success(res, 'Product images reordered successfully', result);
    } catch (err) {
      next(err);
    }
  }

  /**
   * DELETE /api/product-images/:id
   */
  static async deleteImage(req, res, next) {
    try {
      assertValid(req);
      const imageId = req.params.id;
      const result = await ProductImageService.deleteProductImage(imageId);
      return ApiResponse.success(res, 'Product image deleted successfully', result);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = ProductImageController;
