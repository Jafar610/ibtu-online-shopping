/**
 * IBTU E-Commerce Frontend
 * src/services/api/cartApi.js
 *
 * Centralized Shopping Cart API Service:
 *  - Matches backend Phase 10 / Step 3 endpoints
 *  - Supports guest cart tokens and authenticated customer carts
 *  - Automatically normalizes cart and item records with formatted image URLs
 *  - Handles merge operation upon customer authentication
 */

import apiClient from './apiClient'
import { API_ENDPOINTS, CART_STORAGE_KEYS, formatImageUrl } from '../../config/apiConfig'

/**
 * Normalizes a cart item returned from backend
 */
export function normalizeCartItem(item) {
  if (!item) return null
  const unitPrice = Number(item.unit_price) || 0
  const regularPrice = item.regular_price !== null && item.regular_price !== undefined
    ? Number(item.regular_price)
    : unitPrice
  const salePrice = item.sale_price !== null && item.sale_price !== undefined
    ? Number(item.sale_price)
    : null
  const quantity = Number(item.quantity) || 1
  const subtotal = Number(item.subtotal) !== undefined && !isNaN(Number(item.subtotal))
    ? Number(item.subtotal)
    : unitPrice * quantity
  const availableQuantity = item.available_quantity !== undefined
    ? Number(item.available_quantity)
    : 99

  return {
    key: String(item.id || item.item_id || item.variant_id),
    id: item.id || item.item_id,
    item_id: item.id || item.item_id,
    variant_id: item.variant_id,
    product_id: item.product_id,
    name: item.product_name,
    product_name: item.product_name,
    slug: item.product_slug,
    product_slug: item.product_slug,
    sku: item.sku,
    size: item.size || 'Standard',
    color: item.color || null,
    image: formatImageUrl(item.image_url, '/placeholder-product.jpg'),
    image_url: item.image_url,
    price: unitPrice,
    unit_price: unitPrice,
    originalPrice: regularPrice > unitPrice ? regularPrice : null,
    regular_price: regularPrice,
    sale_price: salePrice,
    quantity,
    subtotal,
    stockCount: availableQuantity,
    available_quantity: availableQuantity,
    is_in_stock: item.is_in_stock !== undefined ? Boolean(item.is_in_stock) : true,
    is_available: item.is_available !== undefined ? Boolean(item.is_available) : true,
  }
}

/**
 * Normalizes a full cart response payload
 */
export function normalizeCart(cartData) {
  if (!cartData) {
    return {
      id: null,
      items: [],
      subtotal: 0,
      total_items: 0,
      item_count: 0,
    }
  }

  const items = Array.isArray(cartData.items) ? cartData.items.map(normalizeCartItem) : []
  const subtotal = Number(cartData.subtotal) !== undefined && !isNaN(Number(cartData.subtotal))
    ? Number(cartData.subtotal)
    : items.reduce((sum, it) => sum + it.subtotal, 0)
  const totalItems = cartData.total_items !== undefined
    ? Number(cartData.total_items)
    : items.reduce((sum, it) => sum + it.quantity, 0)
  const itemCount = cartData.item_count !== undefined ? Number(cartData.item_count) : items.length

  return {
    id: cartData.id,
    items,
    subtotal: Math.round(subtotal * 100) / 100,
    total_items: totalItems,
    item_count: itemCount,
    last_activity_at: cartData.last_activity_at,
  }
}

export const cartApi = {
  /**
   * GET /api/cart
   * Retrieves active cart for current customer session or guest token
   */
  async getCart() {
    const res = await apiClient.get(API_ENDPOINTS.CART.GET)
    return {
      ...res,
      data: normalizeCart(res.data),
    }
  },

  /**
   * POST /api/cart/items
   * Adds a product variant to the cart
   */
  async addItem(variantId, quantity = 1) {
    const payload = {
      variant_id: Number(variantId),
      quantity: Number(quantity) || 1,
    }
    const res = await apiClient.post(API_ENDPOINTS.CART.ADD_ITEM, payload)
    return {
      ...res,
      data: normalizeCart(res.data),
    }
  },

  /**
   * PATCH /api/cart/items/:itemId
   * Updates quantity of a cart item
   */
  async updateQuantity(itemId, quantity) {
    const payload = {
      quantity: Number(quantity),
    }
    const res = await apiClient.patch(API_ENDPOINTS.CART.UPDATE_ITEM(itemId), payload)
    return {
      ...res,
      data: normalizeCart(res.data),
    }
  },

  /**
   * DELETE /api/cart/items/:itemId
   * Removes an item from the cart
   */
  async removeItem(itemId) {
    const res = await apiClient.delete(API_ENDPOINTS.CART.REMOVE_ITEM(itemId))
    return {
      ...res,
      data: normalizeCart(res.data),
    }
  },

  /**
   * DELETE /api/cart
   * Clears all items in the cart
   */
  async clearCart() {
    const res = await apiClient.delete(API_ENDPOINTS.CART.CLEAR)
    return {
      ...res,
      data: normalizeCart(res.data),
    }
  },

  /**
   * POST /api/cart/merge
   * Merges guest cart into authenticated customer's cart
   */
  async mergeGuestCart(guestToken) {
    const payload = guestToken ? { guest_token: guestToken } : {}
    const res = await apiClient.post(API_ENDPOINTS.CART.MERGE, payload)
    try {
      localStorage.removeItem(CART_STORAGE_KEYS.GUEST_TOKEN)
    } catch {
      // ignore
    }
    return {
      ...res,
      data: normalizeCart(res.data),
    }
  },
}

export default cartApi
