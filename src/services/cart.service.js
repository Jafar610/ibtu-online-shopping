/**
 * IBTU E-Commerce Backend
 * src/services/cart.service.js
 *
 * Shopping Cart Service & Database Operations
 *
 * Enforces:
 *  - Strict cart ownership (either registered user_id OR guest_token_hash, never both or neither).
 *  - Real-time stock validation (stock_quantity - reserved_quantity).
 *  - Real-time price calculation from database values (never client prices).
 *  - Safe guest cart merging with stock caps and deletion of merged guest carts.
 *  - Atomic database transactions.
 */

const crypto = require('crypto');
const { pool } = require('../config/database');
const AppError = require('../utils/app-error');

class CartService {
  /**
   * Compute a secure SHA-256 hash of a raw guest token
   */
  static hashGuestToken(rawToken) {
    if (!rawToken || typeof rawToken !== 'string') return null;
    return crypto.createHash('sha256').update(rawToken.trim()).digest('hex');
  }

  /**
   * Generate a cryptographically secure random token for a new guest session
   */
  static generateGuestToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Find or create a cart for an authenticated user or guest session
   * Returns { cart, newGuestToken } (newGuestToken is only set if a new guest cart was generated)
   */
  static async getOrCreateCart({ userId, guestToken }) {
    // 1. Authenticated customer cart
    if (userId) {
      const [[existingUserCart]] = await pool.query(
        'SELECT * FROM carts WHERE user_id = ?',
        [userId]
      );
      if (existingUserCart) {
        return { cart: existingUserCart, newGuestToken: null };
      }

      // Create a user cart
      const [insertResult] = await pool.query(
        'INSERT INTO carts (user_id, last_activity_at) VALUES (?, NOW())',
        [userId]
      );
      const [[newCart]] = await pool.query('SELECT * FROM carts WHERE id = ?', [
        insertResult.insertId,
      ]);
      return { cart: newCart, newGuestToken: null };
    }

    // 2. Existing guest cart by token
    if (guestToken) {
      const tokenHash = this.hashGuestToken(guestToken);
      const [[existingGuestCart]] = await pool.query(
        'SELECT * FROM carts WHERE guest_token_hash = ? AND user_id IS NULL AND (expires_at IS NULL OR expires_at > NOW())',
        [tokenHash]
      );
      if (existingGuestCart) {
        // Update activity timestamp
        await pool.query('UPDATE carts SET last_activity_at = NOW() WHERE id = ?', [
          existingGuestCart.id,
        ]);
        return { cart: existingGuestCart, newGuestToken: null };
      }
    }

    // 3. Create a new guest cart
    const newRawToken = this.generateGuestToken();
    const newTokenHash = this.hashGuestToken(newRawToken);

    const [insertGuest] = await pool.query(
      `INSERT INTO carts (guest_token_hash, expires_at, last_activity_at)
       VALUES (?, DATE_ADD(NOW(), INTERVAL 30 DAY), NOW())`,
      [newTokenHash]
    );

    const [[createdGuestCart]] = await pool.query('SELECT * FROM carts WHERE id = ?', [
      insertGuest.insertId,
    ]);

    return { cart: createdGuestCart, newGuestToken: newRawToken };
  }

  /**
   * Fetch full cart details with live prices, subtotals, and stock status
   */
  static async getCartDetails(cartId) {
    const [[cart]] = await pool.query('SELECT * FROM carts WHERE id = ?', [cartId]);
    if (!cart) {
      throw AppError.notFound('Cart not found.');
    }

    const [items] = await pool.query(
      `SELECT
         ci.id AS item_id,
         ci.cart_id,
         ci.variant_id,
         ci.quantity,
         ci.created_at AS item_created_at,
         ci.updated_at AS item_updated_at,
         pv.sku,
         pv.size,
         pv.color,
         pv.price,
         pv.sale_price,
         pv.stock_quantity,
         pv.reserved_quantity,
         pv.is_active AS variant_is_active,
         p.id AS product_id,
         p.name AS product_name,
         p.slug AS product_slug,
         p.status AS product_status,
         (
           SELECT pi.image_url
           FROM product_images pi
           WHERE pi.product_id = p.id
             AND (pi.variant_id = pv.id OR pi.variant_id IS NULL)
           ORDER BY pi.is_primary DESC, pi.sort_order ASC, pi.id ASC
           LIMIT 1
         ) AS image_url
       FROM cart_items ci
       JOIN product_variants pv ON ci.variant_id = pv.id
       JOIN products p ON pv.product_id = p.id
       WHERE ci.cart_id = ?
       ORDER BY ci.created_at ASC`,
      [cartId]
    );

    let cartSubtotal = 0;
    let totalItems = 0;

    const formattedItems = items.map((item) => {
      const price = parseFloat(item.price);
      const salePrice = item.sale_price !== null ? parseFloat(item.sale_price) : null;
      const unitPrice = salePrice !== null ? salePrice : price;
      const itemSubtotal = Math.round(unitPrice * item.quantity * 100) / 100;

      const availableStock = Math.max(0, item.stock_quantity - item.reserved_quantity);
      const isAvailable = Boolean(item.variant_is_active && item.product_status === 'active');
      const isInStock = isAvailable && availableStock >= item.quantity;

      cartSubtotal += itemSubtotal;
      totalItems += item.quantity;

      return {
        id: item.item_id,
        variant_id: item.variant_id,
        product_id: item.product_id,
        product_name: item.product_name,
        product_slug: item.product_slug,
        sku: item.sku,
        size: item.size || null,
        color: item.color || null,
        image_url: item.image_url || null,
        unit_price: unitPrice,
        regular_price: price,
        sale_price: salePrice,
        quantity: item.quantity,
        subtotal: itemSubtotal,
        available_quantity: availableStock,
        is_in_stock: isInStock,
        is_available: isAvailable,
      };
    });

    return {
      id: cart.id,
      items: formattedItems,
      subtotal: Math.round(cartSubtotal * 100) / 100,
      total_items: totalItems,
      item_count: formattedItems.length,
      last_activity_at: cart.last_activity_at,
    };
  }

  /**
   * Add a product variant to the cart
   */
  static async addItem({ cartId, variantId, quantity = 1 }) {
    const qty = Math.max(1, parseInt(quantity, 10) || 1);
    const conn = await pool.getConnection();

    try {
      await conn.beginTransaction();

      // 1. Validate product and variant existence, active status, and stock
      const [[variant]] = await conn.query(
        `SELECT
           pv.id,
           pv.product_id,
           pv.price,
           pv.sale_price,
           pv.stock_quantity,
           pv.reserved_quantity,
           pv.is_active AS variant_is_active,
           p.status AS product_status,
           p.name AS product_name
         FROM product_variants pv
         JOIN products p ON pv.product_id = p.id
         WHERE pv.id = ?`,
        [variantId]
      );

      if (!variant) {
        throw AppError.notFound('Product variant not found.');
      }
      if (variant.product_status !== 'active') {
        throw AppError.badRequest('This product is currently unavailable.');
      }
      if (!variant.variant_is_active) {
        throw AppError.badRequest('This product variant is currently unavailable.');
      }

      const availableStock = Math.max(0, variant.stock_quantity - variant.reserved_quantity);
      if (availableStock <= 0) {
        throw AppError.badRequest('This item is currently out of stock.');
      }

      // 2. Check if variant already exists in cart
      const [[existingItem]] = await conn.query(
        'SELECT id, quantity FROM cart_items WHERE cart_id = ? AND variant_id = ?',
        [cartId, variantId]
      );

      if (existingItem) {
        const newQty = existingItem.quantity + qty;
        if (newQty > availableStock) {
          throw AppError.badRequest(
            `Cannot add ${qty} more. Total quantity (${newQty}) exceeds available stock (${availableStock}).`
          );
        }
        await conn.query(
          'UPDATE cart_items SET quantity = ?, updated_at = NOW() WHERE id = ?',
          [newQty, existingItem.id]
        );
      } else {
        if (qty > availableStock) {
          throw AppError.badRequest(
            `Requested quantity (${qty}) exceeds available stock (${availableStock}).`
          );
        }
        await conn.query(
          'INSERT INTO cart_items (cart_id, variant_id, quantity) VALUES (?, ?, ?)',
          [cartId, variantId, qty]
        );
      }

      // 3. Refresh cart activity
      await conn.query('UPDATE carts SET last_activity_at = NOW() WHERE id = ?', [cartId]);

      await conn.commit();
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }

    return this.getCartDetails(cartId);
  }

  /**
   * Update quantity of a specific cart item
   */
  static async updateItemQuantity({ cartId, itemId, quantity }) {
    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty < 1) {
      throw AppError.badRequest('Quantity must be at least 1.');
    }

    const conn = await pool.getConnection();

    try {
      await conn.beginTransaction();

      // Check item ownership and join variant to check stock
      const [[item]] = await conn.query(
        `SELECT
           ci.id,
           ci.cart_id,
           ci.variant_id,
           pv.stock_quantity,
           pv.reserved_quantity,
           pv.is_active AS variant_is_active,
           p.status AS product_status
         FROM cart_items ci
         JOIN product_variants pv ON ci.variant_id = pv.id
         JOIN products p ON pv.product_id = p.id
         WHERE ci.id = ? AND ci.cart_id = ?`,
        [itemId, cartId]
      );

      if (!item) {
        throw AppError.notFound('Cart item not found in your cart.');
      }
      if (!item.variant_is_active || item.product_status !== 'active') {
        throw AppError.badRequest('This item is no longer available.');
      }

      const availableStock = Math.max(0, item.stock_quantity - item.reserved_quantity);
      if (qty > availableStock) {
        throw AppError.badRequest(
          `Requested quantity (${qty}) exceeds available stock (${availableStock}).`
        );
      }

      await conn.query(
        'UPDATE cart_items SET quantity = ?, updated_at = NOW() WHERE id = ?',
        [qty, itemId]
      );

      await conn.query('UPDATE carts SET last_activity_at = NOW() WHERE id = ?', [cartId]);

      await conn.commit();
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }

    return this.getCartDetails(cartId);
  }

  /**
   * Remove an item from the cart
   */
  static async removeItem({ cartId, itemId }) {
    const [[item]] = await pool.query(
      'SELECT id FROM cart_items WHERE id = ? AND cart_id = ?',
      [itemId, cartId]
    );

    if (!item) {
      throw AppError.notFound('Cart item not found in your cart.');
    }

    await pool.query('DELETE FROM cart_items WHERE id = ?', [itemId]);
    await pool.query('UPDATE carts SET last_activity_at = NOW() WHERE id = ?', [cartId]);

    return this.getCartDetails(cartId);
  }

  /**
   * Clear all items in the cart
   */
  static async clearCart(cartId) {
    await pool.query('DELETE FROM cart_items WHERE cart_id = ?', [cartId]);
    await pool.query('UPDATE carts SET last_activity_at = NOW() WHERE id = ?', [cartId]);
    return this.getCartDetails(cartId);
  }

  /**
   * Merge a guest cart into an authenticated customer's cart
   */
  static async mergeGuestCart({ userId, guestToken }) {
    if (!userId) {
      throw AppError.unauthorized('Authentication required to merge cart.');
    }
    if (!guestToken) {
      // Nothing to merge; return user's current cart
      const { cart } = await this.getOrCreateCart({ userId });
      return this.getCartDetails(cart.id);
    }

    const guestTokenHash = this.hashGuestToken(guestToken);
    const [[guestCart]] = await pool.query(
      'SELECT id FROM carts WHERE guest_token_hash = ? AND user_id IS NULL',
      [guestTokenHash]
    );

    if (!guestCart) {
      // Guest cart does not exist or expired; return user's current cart
      const { cart } = await this.getOrCreateCart({ userId });
      return this.getCartDetails(cart.id);
    }

    const conn = await pool.getConnection();

    try {
      await conn.beginTransaction();

      // Ensure customer cart exists
      let [[userCart]] = await conn.query('SELECT id FROM carts WHERE user_id = ?', [userId]);
      if (!userCart) {
        const [insert] = await conn.query(
          'INSERT INTO carts (user_id, last_activity_at) VALUES (?, NOW())',
          [userId]
        );
        userCart = { id: insert.insertId };
      }

      // Fetch guest cart items
      const [guestItems] = await conn.query(
        `SELECT
           ci.variant_id,
           ci.quantity,
           pv.stock_quantity,
           pv.reserved_quantity,
           pv.is_active AS variant_is_active,
           p.status AS product_status
         FROM cart_items ci
         JOIN product_variants pv ON ci.variant_id = pv.id
         JOIN products p ON pv.product_id = p.id
         WHERE ci.cart_id = ?`,
        [guestCart.id]
      );

      for (const gItem of guestItems) {
        // Skip inactive products/variants
        if (!gItem.variant_is_active || gItem.product_status !== 'active') {
          continue;
        }

        const availableStock = Math.max(0, gItem.stock_quantity - gItem.reserved_quantity);
        if (availableStock <= 0) continue;

        // Check if customer cart already has this variant
        const [[existingUserItem]] = await conn.query(
          'SELECT id, quantity FROM cart_items WHERE cart_id = ? AND variant_id = ?',
          [userCart.id, gItem.variant_id]
        );

        if (existingUserItem) {
          const combined = existingUserItem.quantity + gItem.quantity;
          const cappedQty = Math.min(combined, availableStock);
          await conn.query('UPDATE cart_items SET quantity = ?, updated_at = NOW() WHERE id = ?', [
            cappedQty,
            existingUserItem.id,
          ]);
        } else {
          const cappedQty = Math.min(gItem.quantity, availableStock);
          await conn.query(
            'INSERT INTO cart_items (cart_id, variant_id, quantity) VALUES (?, ?, ?)',
            [userCart.id, gItem.variant_id, cappedQty]
          );
        }
      }

      // Invalidate & delete the guest cart and its items
      await conn.query('DELETE FROM cart_items WHERE cart_id = ?', [guestCart.id]);
      await conn.query('DELETE FROM carts WHERE id = ?', [guestCart.id]);

      await conn.query('UPDATE carts SET last_activity_at = NOW() WHERE id = ?', [userCart.id]);

      await conn.commit();

      return this.getCartDetails(userCart.id);
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  }
}

module.exports = CartService;
