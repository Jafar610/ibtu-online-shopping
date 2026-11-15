/**
 * IBTU E-Commerce Backend
 * src/controllers/wishlist.controller.js
 *
 * Wishlist HTTP Controller
 */

const { validationResult } = require('express-validator');
const ApiResponse = require('../utils/api-response');
const AppError = require('../utils/app-error');
const WishlistService = require('../services/wishlist.service');

function assertValid(req) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages = errors.array().map((e) => ({ field: e.path, message: e.msg }));
    throw AppError.unprocessable('Validation failed', messages);
  }
}

class WishlistController {
  /**
   * GET /api/wishlist
   */
  static async getWishlist(req, res, next) {
    try {
      assertValid(req);
      const userId = req.user.id;
      const wishlist = await WishlistService.getWishlist(userId);
      return ApiResponse.success(res, 'Wishlist retrieved successfully', wishlist);
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/wishlist/items
   */
  static async addItem(req, res, next) {
    try {
      assertValid(req);
      const userId = req.user.id;
      const { product_id } = req.body;
      const result = await WishlistService.addProduct(userId, product_id);

      if (result.already_saved) {
        return ApiResponse.success(res, result.message, {
          product_id: result.product_id,
          is_in_wishlist: true,
          already_saved: true,
        });
      }

      return ApiResponse.created(res, result.message, {
        product_id: result.product_id,
        is_in_wishlist: true,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * DELETE /api/wishlist/items/:productId
   */
  static async removeItem(req, res, next) {
    try {
      assertValid(req);
      const userId = req.user.id;
      const productId = req.params.productId;
      const result = await WishlistService.removeProduct(userId, productId);
      return ApiResponse.success(res, 'Product removed from wishlist successfully', result);
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/wishlist/check/:productId
   */
  static async checkStatus(req, res, next) {
    try {
      assertValid(req);
      const userId = req.user.id;
      const productId = req.params.productId;
      const result = await WishlistService.checkProduct(userId, productId);
      return ApiResponse.success(res, 'Wishlist status checked successfully', result);
    } catch (err) {
      next(err);
    }
  }

  /**
   * DELETE /api/wishlist
   */
  static async clearWishlist(req, res, next) {
    try {
      assertValid(req);
      const userId = req.user.id;
      const result = await WishlistService.clearWishlist(userId);
      return ApiResponse.success(res, 'Wishlist cleared successfully', result);
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/wishlist/items/:productId/add-to-cart
   */
  static async moveToCart(req, res, next) {
    try {
      assertValid(req);
      const userId = req.user.id;
      const productId = req.params.productId;
      const { variant_id, quantity } = req.body;
      const cart = await WishlistService.moveToCart({
        userId,
        productId,
        variantId: variant_id,
        quantity: quantity || 1,
      });
      return ApiResponse.success(res, 'Product moved to cart successfully', cart);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = WishlistController;
