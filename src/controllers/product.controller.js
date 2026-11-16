/**
 * IBTU E-Commerce Backend
 * src/controllers/product.controller.js
 *
 * Product HTTP Controller
 * Bridges HTTP requests with ProductService and formats output using ApiResponse.
 */

const ProductService = require('../services/product.service');
const ApiResponse = require('../utils/api-response');

class ProductController {
  /**
   * Helper to check if the requesting user is staff (Admin or Data Encoder)
   */
  static isStaffUser(req) {
    if (!req.user || !req.user.roles) return false;
    return req.user.roles.includes('Admin') || req.user.roles.includes('Data Encoder');
  }

  /**
   * List products with search, category filter, status filter, and pagination
   * GET /api/products
   */
  static async getProducts(req, res, next) {
    try {
      const {
        search,
        category_id,
        status,
        is_featured,
        sort,
        order,
        page,
        limit,
      } = req.query;

      const isStaff = ProductController.isStaffUser(req);

      const result = await ProductService.getAllProducts({
        search,
        category_id,
        status,
        is_featured,
        sort,
        order,
        page,
        limit,
        isStaff,
      });

      return ApiResponse.success(
        res,
        'Products retrieved successfully',
        result.products,
        result.pagination
      );
    } catch (err) {
      next(err);
    }
  }

  /**
   * Get single product details by ID or Slug
   * GET /api/products/:id
   */
  static async getProduct(req, res, next) {
    try {
      const { id } = req.params;
      const isStaff = ProductController.isStaffUser(req);

      const product = await ProductService.getProductById(id, isStaff);

      return ApiResponse.success(
        res,
        'Product details retrieved successfully',
        product
      );
    } catch (err) {
      next(err);
    }
  }

  /**
   * Create a new product
   * POST /api/products
   * Requires: products.create permission
   */
  static async createProduct(req, res, next) {
    try {
      const product = await ProductService.createProduct(req.body, req.user?.id);

      return ApiResponse.created(
        res,
        'Product created successfully',
        product
      );
    } catch (err) {
      next(err);
    }
  }

  /**
   * Update product details
   * PUT /api/products/:id
   * Requires: products.update permission
   */
  static async updateProduct(req, res, next) {
    try {
      const { id } = req.params;
      const updated = await ProductService.updateProduct(id, req.body);

      return ApiResponse.success(
        res,
        'Product updated successfully',
        updated
      );
    } catch (err) {
      next(err);
    }
  }

  /**
   * Update product status (draft, active, archived)
   * PATCH /api/products/:id/status
   * Requires: products.update permission
   */
  static async updateStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const updated = await ProductService.updateStatus(id, status);

      return ApiResponse.success(
        res,
        `Product status updated to "${status}" successfully`,
        updated
      );
    } catch (err) {
      next(err);
    }
  }

  /**
   * Delete product safely
   * DELETE /api/products/:id
   * Requires: products.delete permission
   */
  static async deleteProduct(req, res, next) {
    try {
      const { id } = req.params;
      const deleted = await ProductService.deleteProduct(id);

      return ApiResponse.success(
        res,
        `Product "${deleted.name}" deleted successfully`,
        deleted
      );
    } catch (err) {
      next(err);
    }
  }
}

module.exports = ProductController;
