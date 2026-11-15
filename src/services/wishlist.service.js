/**
 * IBTU E-Commerce Backend
 * src/services/wishlist.service.js
 *
 * Wishlist Service & Database Operations
 *
 * Rules:
 *  - Wishlist belongs strictly to a registered authenticated customer.
 *  - Only active products can be added to the wishlist.
 *  - Prevent duplicate product entries in the same wishlist.
 *  - Never modify inventory quantities when modifying wishlists.
 *  - Safe integration with CartService for moving wishlist items to the cart.
 */

const { pool } = require('../config/database');
const AppError = require('../utils/app-error');
const CartService = require('./cart.service');

class WishlistService {
  /**
   * Get or create a wishlist for an authenticated user
   */
  static async getOrCreateWishlist(userId) {
    const [[existing]] = await pool.query(
      'SELECT id, user_id, name, created_at, updated_at FROM wishlists WHERE user_id = ?',
      [userId]
    );

    if (existing) {
      return existing;
    }

    const [insertResult] = await pool.query(
      'INSERT INTO wishlists (user_id, name) VALUES (?, ?)',
      [userId, 'My Wishlist']
    );

    const [[created]] = await pool.query(
      'SELECT id, user_id, name, created_at, updated_at FROM wishlists WHERE id = ?',
      [insertResult.insertId]
    );

    return created;
  }

  /**
   * Retrieve customer's wishlist with active products, images, categories, and prices
   */
  static async getWishlist(userId) {
    const wishlist = await this.getOrCreateWishlist(userId);

    const querySql = `
      SELECT
        wi.id AS item_id,
        wi.created_at AS added_at,
        p.id AS product_id,
        p.name AS product_name,
        p.slug AS product_slug,
        p.short_description,
        p.status AS product_status,
        c.id AS category_id,
        c.name AS category_name,
        c.slug AS category_slug,
        MIN(COALESCE(pv.sale_price, pv.price)) AS min_price,
        MAX(COALESCE(pv.sale_price, pv.price)) AS max_price,
        MAX(CASE WHEN (pv.stock_quantity - pv.reserved_quantity) > 0 THEN 1 ELSE 0 END) AS has_stock,
        (
          SELECT JSON_OBJECT('image_url', pi.image_url, 'alt_text', pi.alt_text)
          FROM product_images pi
          WHERE pi.product_id = p.id
          ORDER BY pi.is_primary DESC, pi.sort_order ASC, pi.id ASC
          LIMIT 1
        ) AS primary_image_json
      FROM wishlist_items wi
      JOIN products p ON wi.product_id = p.id
      JOIN categories c ON p.category_id = c.id
      LEFT JOIN product_variants pv ON p.id = pv.product_id AND pv.is_active = 1
      WHERE wi.wishlist_id = ? AND p.status = 'active'
      GROUP BY wi.id, p.id, c.id
      ORDER BY wi.created_at DESC
    `;

    const [rows] = await pool.query(querySql, [wishlist.id]);

    const items = rows.map((row) => {
      let primaryImage = null;
      if (row.primary_image_json) {
        primaryImage =
          typeof row.primary_image_json === 'string'
            ? JSON.parse(row.primary_image_json)
            : row.primary_image_json;
      }

      const hasVariants = row.min_price !== null && row.min_price !== undefined;

      return {
        id: row.item_id,
        product_id: row.product_id,
        product_name: row.product_name,
        product_slug: row.product_slug,
        short_description: row.short_description || null,
        category: {
          id: row.category_id,
          name: row.category_name,
          slug: row.category_slug,
        },
        primary_image: primaryImage,
        price: hasVariants
          ? {
              min: parseFloat(row.min_price),
              max: parseFloat(row.max_price),
              currency: 'ETB',
            }
          : null,
        stock_status: row.has_stock > 0 ? 'in_stock' : 'out_of_stock',
        added_at: row.added_at,
      };
    });

    return {
      id: wishlist.id,
      name: wishlist.name,
      total_items: items.length,
      items,
    };
  }

  /**
   * Add an active product to the customer's wishlist
   */
  static async addProduct(userId, productId) {
    // 1. Verify product exists and is active
    const [[product]] = await pool.query(
      'SELECT id, name, status FROM products WHERE id = ?',
      [productId]
    );

    if (!product) {
      throw AppError.notFound('Product not found.');
    }
    if (product.status !== 'active') {
      throw AppError.badRequest('Cannot add an inactive product to wishlist.');
    }

    const wishlist = await this.getOrCreateWishlist(userId);

    // 2. Check if already saved in wishlist
    const [[existingItem]] = await pool.query(
      'SELECT id FROM wishlist_items WHERE wishlist_id = ? AND product_id = ?',
      [wishlist.id, productId]
    );

    if (existingItem) {
      return {
        already_saved: true,
        product_id: productId,
        message: 'Product is already in your wishlist.',
      };
    }

    // 3. Insert new wishlist item
    await pool.query(
      'INSERT INTO wishlist_items (wishlist_id, product_id) VALUES (?, ?)',
      [wishlist.id, productId]
    );

    return {
      already_saved: false,
      product_id: productId,
      message: 'Product added to wishlist successfully.',
    };
  }

  /**
   * Remove a product from the customer's wishlist
   */
  static async removeProduct(userId, productId) {
    const [[wishlist]] = await pool.query(
      'SELECT id FROM wishlists WHERE user_id = ?',
      [userId]
    );

    if (!wishlist) {
      throw AppError.notFound('Product is not in your wishlist.');
    }

    const [[existing]] = await pool.query(
      'SELECT id FROM wishlist_items WHERE wishlist_id = ? AND product_id = ?',
      [wishlist.id, productId]
    );

    if (!existing) {
      throw AppError.notFound('Product is not in your wishlist.');
    }

    await pool.query(
      'DELETE FROM wishlist_items WHERE wishlist_id = ? AND product_id = ?',
      [wishlist.id, productId]
    );

    return { product_id: productId, removed: true };
  }

  /**
   * Check whether a product is in customer's wishlist
   */
  static async checkProduct(userId, productId) {
    const [[item]] = await pool.query(
      `SELECT wi.id
       FROM wishlist_items wi
       JOIN wishlists w ON wi.wishlist_id = w.id
       WHERE w.user_id = ? AND wi.product_id = ?`,
      [userId, productId]
    );

    return {
      product_id: productId,
      is_in_wishlist: Boolean(item),
    };
  }

  /**
   * Clear all items in customer's wishlist
   */
  static async clearWishlist(userId) {
    const [[wishlist]] = await pool.query(
      'SELECT id FROM wishlists WHERE user_id = ?',
      [userId]
    );

    if (wishlist) {
      await pool.query('DELETE FROM wishlist_items WHERE wishlist_id = ?', [wishlist.id]);
    }

    return { total_items: 0, items: [] };
  }

  /**
   * Move a product from wishlist to shopping cart
   */
  static async moveToCart({ userId, productId, variantId, quantity = 1 }) {
    // 1. Verify product is in customer's wishlist
    const [[item]] = await pool.query(
      `SELECT wi.id, w.id AS wishlist_id
       FROM wishlist_items wi
       JOIN wishlists w ON wi.wishlist_id = w.id
       WHERE w.user_id = ? AND wi.product_id = ?`,
      [userId, productId]
    );

    if (!item) {
      throw AppError.notFound('Product is not in your wishlist.');
    }

    // 2. Verify variant belongs to this product
    const [[variant]] = await pool.query(
      'SELECT id FROM product_variants WHERE id = ? AND product_id = ?',
      [variantId, productId]
    );

    if (!variant) {
      throw AppError.badRequest('The specified variant does not belong to this product.');
    }

    // 3. Add to cart using CartService
    const { cart } = await CartService.getOrCreateCart({ userId });
    const updatedCart = await CartService.addItem({
      cartId: cart.id,
      variantId,
      quantity,
    });

    // 4. Remove product from wishlist after successfully adding to cart
    await pool.query(
      'DELETE FROM wishlist_items WHERE wishlist_id = ? AND product_id = ?',
      [item.wishlist_id, productId]
    );

    return updatedCart;
  }
}

module.exports = WishlistService;
