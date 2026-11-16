/**
 * IBTU E-Commerce Backend
 * src/controllers/category.controller.js
 *
 * Category HTTP Controller
 * Bridges HTTP requests with CategoryService and formats output using ApiResponse.
 */

const CategoryService = require('../services/category.service');
const ApiResponse = require('../utils/api-response');

class CategoryController {
  /**
   * List categories with optional search, parent_id filter, active flag, and pagination
   * GET /api/categories
   */
  static async getCategories(req, res, next) {
    try {
      const { search, parent_id, is_active, page, limit } = req.query;

      const result = await CategoryService.getAllCategories({
        search,
        parent_id,
        is_active,
        page,
        limit,
      });

      return ApiResponse.success(
        res,
        'Categories retrieved successfully',
        result.categories,
        result.pagination
      );
    } catch (err) {
      next(err);
    }
  }

  /**
   * Get category details by ID or Slug
   * GET /api/categories/:id
   */
  static async getCategory(req, res, next) {
    try {
      const { id } = req.params;
      const category = await CategoryService.getCategoryById(id);

      return ApiResponse.success(
        res,
        'Category details retrieved successfully',
        category
      );
    } catch (err) {
      next(err);
    }
  }

  /**
   * Create a new category
   * POST /api/categories
   * Requires: categories.create permission
   */
  static async createCategory(req, res, next) {
    try {
      const category = await CategoryService.createCategory(req.body);

      return ApiResponse.created(
        res,
        'Category created successfully',
        category
      );
    } catch (err) {
      next(err);
    }
  }

  /**
   * Update category information
   * PUT /api/categories/:id
   * Requires: categories.update permission
   */
  static async updateCategory(req, res, next) {
    try {
      const { id } = req.params;
      const updated = await CategoryService.updateCategory(id, req.body);

      return ApiResponse.success(
        res,
        'Category updated successfully',
        updated
      );
    } catch (err) {
      next(err);
    }
  }

  /**
   * Delete category safely
   * DELETE /api/categories/:id
   * Requires: categories.delete permission
   */
  static async deleteCategory(req, res, next) {
    try {
      const { id } = req.params;
      const deleted = await CategoryService.deleteCategory(id);

      return ApiResponse.success(
        res,
        `Category "${deleted.name}" deleted successfully`,
        deleted
      );
    } catch (err) {
      next(err);
    }
  }
}

module.exports = CategoryController;
