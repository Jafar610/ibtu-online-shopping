/**
 * IBTU E-Commerce Frontend
 * src/services/api/categoryApi.js
 *
 * Category API Service connecting to Node.js / Express backend
 */

import apiClient from './apiClient'
import { API_ENDPOINTS, formatImageUrl } from '../../config/apiConfig'
import { handleApiError } from './apiErrorHandler'

export const categoryApi = {
  /**
   * Public: Retrieve active categories hierarchy with product counts
   * GET /api/catalog/categories
   */
  async getCatalogCategories() {
    try {
      const response = await apiClient.get(API_ENDPOINTS.CATALOG.CATEGORIES)
      const data = response?.data || response || []
      return data.map((cat) => ({
        ...cat,
        image: formatImageUrl(cat.image_url),
        image_url: formatImageUrl(cat.image_url),
        subcategories: (cat.subcategories || []).map((sub) => ({
          ...sub,
          image: formatImageUrl(sub.image_url),
          image_url: formatImageUrl(sub.image_url),
        })),
      }))
    } catch (err) {
      throw handleApiError(err)
    }
  },

  /**
   * Management / Public: List categories with optional filters (search, parent_id, is_active, page, limit)
   * GET /api/categories
   */
  async getCategories(params = {}) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.CATEGORIES.LIST, { params })
      const rawCategories = response?.data || response || []
      const pagination = response?.meta || null

      const categories = rawCategories.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        amharicName: c.amharic_name || null,
        description: c.description || '',
        parentCategory: c.parent_slug || (c.parent_id ? String(c.parent_id) : null),
        parent_id: c.parent_id || null,
        parent_name: c.parent_name || null,
        status: c.is_active ? 'Active' : 'Inactive',
        is_active: Boolean(c.is_active),
        image: formatImageUrl(c.image_url),
        image_url: formatImageUrl(c.image_url),
        productCount: Number(c.product_count) || 0,
        sort_order: c.sort_order ?? 0,
      }))

      return { categories, pagination }
    } catch (err) {
      throw handleApiError(err)
    }
  },

  /**
   * Get single category by ID or Slug
   * GET /api/categories/:id
   */
  async getCategoryById(id) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.CATEGORIES.DETAILS(id))
      const c = response?.data || response
      return {
        id: c.id,
        name: c.name,
        slug: c.slug,
        amharicName: c.amharic_name || null,
        description: c.description || '',
        parent_id: c.parent_id || null,
        parent_name: c.parent_name || null,
        parentCategory: c.parent_slug || (c.parent_id ? String(c.parent_id) : null),
        status: c.is_active ? 'Active' : 'Inactive',
        is_active: Boolean(c.is_active),
        image: formatImageUrl(c.image_url),
        image_url: formatImageUrl(c.image_url),
        sort_order: c.sort_order ?? 0,
      }
    } catch (err) {
      throw handleApiError(err)
    }
  },

  /**
   * Create category (Requires: categories.create)
   * POST /api/categories
   */
  async createCategory(payload) {
    try {
      const body = {
        name: payload.name?.trim(),
        slug: payload.slug?.trim(),
        amharic_name: payload.amharicName || payload.amharic_name || null,
        description: payload.description || null,
        parent_id: payload.parent_id ? Number(payload.parent_id) : null,
        image_url: payload.image || payload.image_url || null,
        sort_order: payload.sort_order !== undefined ? Number(payload.sort_order) : 0,
        is_active: payload.status !== undefined ? (payload.status === 'Active' ? 1 : 0) : (payload.is_active ? 1 : 0),
      }

      const response = await apiClient.post(API_ENDPOINTS.CATEGORIES.CREATE, body)
      return response?.data || response
    } catch (err) {
      throw handleApiError(err)
    }
  },

  /**
   * Update category (Requires: categories.update)
   * PUT /api/categories/:id
   */
  async updateCategory(id, payload) {
    try {
      const body = {}
      if (payload.name !== undefined) body.name = payload.name.trim()
      if (payload.slug !== undefined) body.slug = payload.slug.trim()
      if (payload.amharicName !== undefined || payload.amharic_name !== undefined) {
        body.amharic_name = payload.amharicName || payload.amharic_name || null
      }
      if (payload.description !== undefined) body.description = payload.description
      if (payload.parent_id !== undefined) {
        body.parent_id = payload.parent_id ? Number(payload.parent_id) : null
      }
      if (payload.image !== undefined || payload.image_url !== undefined) {
        body.image_url = payload.image || payload.image_url || null
      }
      if (payload.sort_order !== undefined) body.sort_order = Number(payload.sort_order)
      if (payload.status !== undefined) {
        body.is_active = payload.status === 'Active' ? 1 : 0
      } else if (payload.is_active !== undefined) {
        body.is_active = payload.is_active ? 1 : 0
      }

      const response = await apiClient.put(API_ENDPOINTS.CATEGORIES.UPDATE(id), body)
      return response?.data || response
    } catch (err) {
      throw handleApiError(err)
    }
  },

  /**
   * Safe delete category (Requires: categories.delete)
   * DELETE /api/categories/:id
   */
  async deleteCategory(id) {
    try {
      const response = await apiClient.delete(API_ENDPOINTS.CATEGORIES.DELETE(id))
      return response?.data || response
    } catch (err) {
      throw handleApiError(err)
    }
  },
}

export default categoryApi
