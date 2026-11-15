/**
 * IBTU E-Commerce Backend
 * src/controllers/catalog.controller.js
 *
 * Public Catalog HTTP Controller
 */

const { validationResult } = require('express-validator');
const ApiResponse = require('../utils/api-response');
const AppError = require('../utils/app-error');
const CatalogService = require('../services/catalog.service');

function assertValid(req) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages = errors.array().map((e) => ({ field: e.path, message: e.msg }));
    throw AppError.unprocessable('Validation failed', messages);
  }
}

class CatalogController {
  /**
   * GET /api/catalog/products
   * List public products with search, filter, sort, pagination
   */
  static async listProducts(req, res, next) {
    try {
      assertValid(req);
      const result = await CatalogService.getProducts(req.query);
      return ApiResponse.success(
        res,
        'Products retrieved successfully',
        result.products,
        result.meta
      );
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/catalog/products/featured
   * List featured products
   */
  static async getFeatured(req, res, next) {
    try {
      assertValid(req);
      const limit = req.query.limit ? parseInt(req.query.limit, 10) : 8;
      const products = await CatalogService.getFeaturedProducts(limit);
      return ApiResponse.success(res, 'Featured products retrieved successfully', products);
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/catalog/products/:slug
   * Single product details by slug or ID
   */
  static async getProductDetails(req, res, next) {
    try {
      assertValid(req);
      const identifier = req.params.slug;
      const product = await CatalogService.getProductDetails(identifier);
      return ApiResponse.success(res, 'Product details retrieved successfully', product);
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/catalog/categories
   * List active categories with product counts and hierarchical structure
   */
  static async listCategories(req, res, next) {
    try {
      assertValid(req);
      const categories = await CatalogService.getCategories();
      return ApiResponse.success(res, 'Categories retrieved successfully', categories);
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/catalog/categories/:slug/products
   * List products in a category
   */
  static async getCategoryProducts(req, res, next) {
    try {
      assertValid(req);
      const categorySlug = req.params.slug;
      const result = await CatalogService.getCategoryProducts(categorySlug, req.query);
      return ApiResponse.success(
        res,
        'Category products retrieved successfully',
        {
          category: result.category,
          products: result.products,
        },
        result.meta
      );
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/catalog/products/:id/related
   * Get related products for a given product
   */
  static async getRelatedProducts(req, res, next) {
    try {
      assertValid(req);
      const identifier = req.params.id;
      const limit = req.query.limit ? parseInt(req.query.limit, 10) : 4;
      const products = await CatalogService.getRelatedProducts(identifier, limit);
      return ApiResponse.success(res, 'Related products retrieved successfully', products);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = CatalogController;
