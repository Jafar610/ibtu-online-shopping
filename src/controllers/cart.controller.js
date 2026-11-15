/**
 * IBTU E-Commerce Backend
 * src/controllers/cart.controller.js
 *
 * Shopping Cart Controller
 */

const { validationResult } = require('express-validator');
const ApiResponse = require('../utils/api-response');
const AppError = require('../utils/app-error');
const CartService = require('../services/cart.service');

function assertValid(req) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages = errors.array().map((e) => ({ field: e.path, message: e.msg }));
    throw AppError.unprocessable('Validation failed', messages);
  }
}

/**
 * Helper to parse cookies from raw headers
 */
function getCookie(req, cookieName) {
  const header = req.headers.cookie;
  if (!header) return null;
  const match = header.match(new RegExp('(^|;\\s*)(' + cookieName + ')=([^;]*)'));
  return match ? decodeURIComponent(match[3]) : null;
}

/**
 * Identify or create the active cart based on user session or guest token
 */
async function resolveCartContext(req, res) {
  const userId = req.user?.id || null;
  let guestToken = null;

  if (!userId) {
    guestToken = req.headers['x-guest-token'] || getCookie(req, 'ibtu_guest_token') || null;
  }

  const { cart, newGuestToken } = await CartService.getOrCreateCart({ userId, guestToken });

  if (newGuestToken) {
    // Send back the new guest token via HTTP-only cookie and header
    const cookieOptions = [
      `ibtu_guest_token=${newGuestToken}`,
      'Path=/',
      'HttpOnly',
      'SameSite=Lax',
      'Max-Age=2592000', // 30 days
    ];
    if (process.env.NODE_ENV === 'production') {
      cookieOptions.push('Secure');
    }
    res.setHeader('Set-Cookie', cookieOptions.join('; '));
    res.setHeader('X-Guest-Token', newGuestToken);
  }

  return { cartId: cart.id, newGuestToken };
}

class CartController {
  /**
   * GET /api/cart
   */
  static async getCart(req, res, next) {
    try {
      assertValid(req);
      const { cartId, newGuestToken } = await resolveCartContext(req, res);
      const cart = await CartService.getCartDetails(cartId);
      const meta = newGuestToken ? { guest_token: newGuestToken } : null;
      return ApiResponse.success(res, 'Cart retrieved successfully', cart, meta);
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/cart/items (or POST /api/cart)
   */
  static async addItem(req, res, next) {
    try {
      assertValid(req);
      const { cartId, newGuestToken } = await resolveCartContext(req, res);
      const { variant_id, quantity } = req.body;
      const cart = await CartService.addItem({
        cartId,
        variantId: variant_id,
        quantity: quantity || 1,
      });
      const meta = newGuestToken ? { guest_token: newGuestToken } : null;
      return ApiResponse.success(res, 'Item added to cart successfully', cart, meta);
    } catch (err) {
      next(err);
    }
  }

  /**
   * PATCH /api/cart/items/:itemId (or PUT /api/cart/:itemId)
   */
  static async updateQuantity(req, res, next) {
    try {
      assertValid(req);
      const { cartId } = await resolveCartContext(req, res);
      const itemId = req.params.itemId || req.params.id;
      const { quantity } = req.body;
      const cart = await CartService.updateItemQuantity({
        cartId,
        itemId,
        quantity,
      });
      return ApiResponse.success(res, 'Cart item updated successfully', cart);
    } catch (err) {
      next(err);
    }
  }

  /**
   * DELETE /api/cart/items/:itemId (or DELETE /api/cart/:itemId)
   */
  static async removeItem(req, res, next) {
    try {
      assertValid(req);
      const { cartId } = await resolveCartContext(req, res);
      const itemId = req.params.itemId || req.params.id;
      const cart = await CartService.removeItem({ cartId, itemId });
      return ApiResponse.success(res, 'Item removed from cart successfully', cart);
    } catch (err) {
      next(err);
    }
  }

  /**
   * DELETE /api/cart (or DELETE /api/cart/clear)
   */
  static async clearCart(req, res, next) {
    try {
      assertValid(req);
      const { cartId } = await resolveCartContext(req, res);
      const cart = await CartService.clearCart(cartId);
      return ApiResponse.success(res, 'Cart cleared successfully', cart);
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/cart/merge
   */
  static async mergeCart(req, res, next) {
    try {
      assertValid(req);
      if (!req.user?.id) {
        throw AppError.unauthorized('Authentication required to merge cart.');
      }

      const guestToken =
        req.body.guest_token ||
        req.headers['x-guest-token'] ||
        getCookie(req, 'ibtu_guest_token') ||
        null;

      const cart = await CartService.mergeGuestCart({
        userId: req.user.id,
        guestToken,
      });

      // Clear guest cookie after merge
      res.setHeader('Set-Cookie', 'ibtu_guest_token=; Path=/; HttpOnly; Max-Age=0');

      return ApiResponse.success(res, 'Guest cart merged successfully', cart);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = CartController;
