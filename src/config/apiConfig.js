/**
 * IBTU E-Commerce Frontend
 * src/config/apiConfig.js
 *
 * Centralized API & Environment Configuration
 */

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

export const API_TIMEOUT =
  Number(import.meta.env.VITE_API_TIMEOUT) || 15000

export const AUTH_STORAGE_KEYS = {
  TOKEN: 'ibtu_auth_token',
  USER: 'ibtu_auth_user',
}

/**
 * Derives the server base URL without the trailing `/api` (for static uploads)
 */
export const BACKEND_SERVER_URL = API_BASE_URL.replace(/\/api\/?$/, '')

/**
 * Formats image URLs: prepends backend host if it's a relative path starting with /uploads
 */
export function formatImageUrl(imageUrl, fallback = '') {
  if (!imageUrl) return fallback
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://') || imageUrl.startsWith('data:')) {
    return imageUrl
  }
  if (imageUrl.startsWith('/')) {
    return `${BACKEND_SERVER_URL}${imageUrl}`
  }
  return `${BACKEND_SERVER_URL}/${imageUrl}`
}

export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    ME: '/auth/me',
    PERMISSIONS: '/auth/permissions',
    LOGOUT: '/auth/logout',
  },
  CATALOG: {
    PRODUCTS: '/catalog/products',
    FEATURED: '/catalog/products/featured',
    RELATED: (id) => `/catalog/products/${id}/related`,
    PRODUCT_DETAILS: (slugOrId) => `/catalog/products/${slugOrId}`,
    CATEGORIES: '/catalog/categories',
    CATEGORY_PRODUCTS: (slug) => `/catalog/categories/${slug}/products`,
  },
  PRODUCTS: {
    LIST: '/products',
    DETAILS: (id) => `/products/${id}`,
    CREATE: '/products',
    UPDATE: (id) => `/products/${id}`,
    UPDATE_STATUS: (id) => `/products/${id}/status`,
    DELETE: (id) => `/products/${id}`,
    VARIANTS: (productId) => `/products/${productId}/variants`,
    IMAGES: (productId) => `/products/${productId}/images`,
    REORDER_IMAGES: (productId) => `/products/${productId}/images/reorder`,
  },
  VARIANTS: {
    DETAILS: (id) => `/variants/${id}`,
    UPDATE: (id) => `/variants/${id}`,
    ACTIVATE: (id) => `/variants/${id}/activate`,
    DEACTIVATE: (id) => `/variants/${id}/deactivate`,
  },
  PRODUCT_IMAGES: {
    DETAILS: (id) => `/product-images/${id}`,
    UPDATE: (id) => `/product-images/${id}`,
    SET_PRIMARY: (id) => `/product-images/${id}/primary`,
    DELETE: (id) => `/product-images/${id}`,
  },
  CATEGORIES: {
    LIST: '/categories',
    DETAILS: (id) => `/categories/${id}`,
    CREATE: '/categories',
    UPDATE: (id) => `/categories/${id}`,
    DELETE: (id) => `/categories/${id}`,
  },
}
