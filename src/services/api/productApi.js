/**
 * IBTU E-Commerce Frontend
 * src/services/api/productApi.js
 *
 * Product, Variant & Image API Service connecting to Node.js / Express backend
 */

import apiClient from './apiClient'
import { API_ENDPOINTS, formatImageUrl } from '../../config/apiConfig'
import { handleApiError } from './apiErrorHandler'

const DEFAULT_PRODUCT_IMAGE =
  'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80'

/**
 * Normalizes a backend catalog product row into the format expected by frontend cards and lists
 */
export function normalizeCatalogProduct(raw) {
  if (!raw) return null

  const primaryImgUrl = raw.primary_image?.image_url || raw.image_url || raw.image
  const formattedPrimaryImage = formatImageUrl(primaryImgUrl, DEFAULT_PRODUCT_IMAGE)

  const minPrice = raw.price?.min !== undefined ? raw.price.min : (typeof raw.price === 'number' ? raw.price : 0)
  const maxPrice = raw.price?.max !== undefined ? raw.price.max : minPrice

  const hasDiscount = raw.originalPrice && raw.originalPrice > minPrice

  return {
    id: raw.id,
    slug: raw.slug || String(raw.id),
    name: raw.name,
    amharicName: raw.amharic_name || raw.amharicName || null,
    shortDescription: raw.short_description || null,
    category: raw.category?.slug || raw.category_slug || (typeof raw.category === 'string' ? raw.category : 'habesha-kemis'),
    categoryName: raw.category?.name || raw.category_name || 'Habesha Kemis',
    categoryObj: raw.category || null,
    price: minPrice,
    originalPrice: hasDiscount ? raw.originalPrice : (maxPrice > minPrice ? maxPrice : null),
    priceRange: raw.price || { min: minPrice, max: maxPrice, currency: 'ETB' },
    rating: raw.reviews_summary?.average_rating || raw.rating || 4.8,
    reviewsCount: raw.reviews_summary?.total_reviews || raw.reviewsCount || 42,
    image: formattedPrimaryImage,
    images: raw.images && raw.images.length > 0
      ? raw.images.map((img) => formatImageUrl(typeof img === 'string' ? img : img.image_url, DEFAULT_PRODUCT_IMAGE))
      : [formattedPrimaryImage],
    badge: raw.badge || (raw.is_featured ? 'Featured' : null),
    isFeatured: Boolean(raw.is_featured),
    isNewArrival: Boolean(raw.is_new_arrival ?? true),
    isBestSeller: Boolean(raw.is_best_seller ?? false),
    isTraditional: Boolean(raw.is_traditional ?? true),
    inStock: raw.stock_status === 'in_stock' || Boolean(raw.inStock ?? true),
    stockCount: raw.stockCount || (raw.stock_status === 'in_stock' ? 20 : 0),
    sizes: raw.sizes || ['S', 'M', 'L', 'XL'],
    colors: raw.colors || ['Natural White', 'Gold Tibeb'],
    variants: raw.variants || [],
    created_at: raw.created_at,
  }
}

/**
 * Normalizes full product details from GET /api/catalog/products/:slug
 */
export function normalizeProductDetails(raw) {
  if (!raw) return null

  const images = (raw.images || []).map((img) => ({
    id: img.id,
    image_url: formatImageUrl(img.image_url, DEFAULT_PRODUCT_IMAGE),
    alt_text: img.alt_text || raw.name,
    is_primary: Boolean(img.is_primary),
    sort_order: img.sort_order ?? 0,
    variant_id: img.variant_id || null,
  }))

  const primaryImageObj = images.find((i) => i.is_primary) || images[0]
  const mainImage = primaryImageObj ? primaryImageObj.image_url : DEFAULT_PRODUCT_IMAGE

  const minPrice = raw.price?.min !== undefined ? raw.price.min : 0
  const maxPrice = raw.price?.max !== undefined ? raw.price.max : minPrice

  // Determine variants and stock
  const variants = (raw.variants || []).map((v) => ({
    id: v.id,
    sku: v.sku,
    size: v.size || null,
    color: v.color || null,
    price: Number(v.price) || 0,
    sale_price: v.sale_price !== null && v.sale_price !== undefined ? Number(v.sale_price) : null,
    effective_price: Number(v.effective_price ?? v.sale_price ?? v.price) || 0,
    available_quantity: v.available_quantity ?? v.stock_quantity ?? 0,
    stockQuantity: v.stock_quantity ?? v.available_quantity ?? 0,
    is_in_stock: Boolean(v.is_in_stock ?? ((v.available_quantity ?? 0) > 0)),
  }))

  const totalStock = variants.reduce((sum, v) => sum + (v.available_quantity || 0), 0)
  const inStock = raw.stock_status === 'in_stock' || totalStock > 0

  return {
    id: raw.id,
    slug: raw.slug,
    name: raw.name,
    amharicName: raw.amharic_name || null,
    shortDescription: raw.short_description || null,
    description: raw.description || raw.short_description || '',
    material: raw.material || null,
    careInstructions: raw.care_instructions || null,
    fabric: raw.material || '100% Handspun Ethiopian Cotton (Shemma)',
    category: raw.category?.slug || 'habesha-kemis',
    categoryName: raw.category?.name || 'Habesha Kemis',
    categoryObj: raw.category,
    price: minPrice,
    originalPrice: maxPrice > minPrice ? maxPrice : null,
    priceRange: raw.price || { min: minPrice, max: maxPrice, currency: 'ETB' },
    rating: raw.reviews_summary?.average_rating || 4.8,
    reviewsCount: raw.reviews_summary?.total_reviews || 0,
    image: mainImage,
    images: images.length > 0 ? images.map((i) => i.image_url) : [mainImage],
    detailedImages: images,
    variants,
    sizes: raw.sizes && raw.sizes.length > 0 ? raw.sizes : [...new Set(variants.map((v) => v.size).filter(Boolean))],
    colors: raw.colors && raw.colors.length > 0 ? raw.colors : [...new Set(variants.map((v) => v.color).filter(Boolean))],
    inStock,
    stockCount: totalStock,
    isFeatured: Boolean(raw.is_featured),
    created_at: raw.created_at,
  }
}

export const productApi = {
  // ─── Public Catalog Endpoints ───────────────────────────────────────────────

  /**
   * Public: List products with search, filters, sorting, and pagination
   * GET /api/catalog/products
   */
  async getCatalogProducts(params = {}) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.CATALOG.PRODUCTS, { params })
      const rawProducts = response?.data || []
      const meta = response?.meta || { page: 1, limit: 12, total: rawProducts.length, totalPages: 1 }

      const products = rawProducts.map((p) => normalizeCatalogProduct(p))
      return { products, meta }
    } catch (err) {
      throw handleApiError(err)
    }
  },

  /**
   * Public: Get featured products
   * GET /api/catalog/products/featured
   */
  async getFeaturedProducts(limit = 8) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.CATALOG.FEATURED, { params: { limit } })
      const rawProducts = response?.data || response || []
      return rawProducts.map((p) => normalizeCatalogProduct(p))
    } catch (err) {
      throw handleApiError(err)
    }
  },

  /**
   * Public: Get related products by product ID or slug
   * GET /api/catalog/products/:id/related
   */
  async getRelatedProducts(productIdOrSlug, limit = 4) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.CATALOG.RELATED(productIdOrSlug), { params: { limit } })
      const rawProducts = response?.data || response || []
      return rawProducts.map((p) => normalizeCatalogProduct(p))
    } catch (err) {
      throw handleApiError(err)
    }
  },

  /**
   * Public: Get single product details by slug or ID
   * GET /api/catalog/products/:slug
   */
  async getProductDetails(slugOrId) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.CATALOG.PRODUCT_DETAILS(slugOrId))
      const raw = response?.data || response
      return normalizeProductDetails(raw)
    } catch (err) {
      throw handleApiError(err)
    }
  },

  // ─── Admin Product Management Endpoints ─────────────────────────────────────

  /**
   * Admin/Staff: List all products (with draft/archived support)
   * GET /api/products
   */
  async getAdminProducts(params = {}) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.PRODUCTS.LIST, { params })
      const rawProducts = response?.data || []
      const pagination = response?.meta || null

      const products = rawProducts.map((p) => {
        const primaryImg = p.primary_image?.image_url || p.image_url || p.image
        const formattedImg = formatImageUrl(primaryImg, DEFAULT_PRODUCT_IMAGE)
        const priceNum = typeof p.price === 'number' ? p.price : (p.price?.min || 0)
        const totalStock = p.stock_quantity ?? p.stockCount ?? 0

        return {
          id: p.id,
          name: p.name,
          slug: p.slug,
          amharicName: p.amharic_name || null,
          sku: p.sku || `IBTU-PROD-${p.id}`,
          category: p.category_slug || (p.category?.slug) || (p.category_name?.toLowerCase().replace(/\s+/g, '-')) || 'habesha-kemis',
          category_id: p.category_id,
          categoryName: p.category_name || p.category?.name || 'Habesha Kemis',
          price: priceNum,
          originalPrice: p.originalPrice || null,
          stockCount: totalStock,
          lowStockThreshold: p.low_stock_threshold ?? 5,
          stockStatus: totalStock <= 0 ? 'Out of Stock' : totalStock <= 5 ? 'Low Stock' : 'In Stock',
          productStatus: p.status ? p.status.charAt(0).toUpperCase() + p.status.slice(1) : 'Active',
          status: p.status || 'active',
          description: p.description || p.short_description || '',
          shortDescription: p.short_description || '',
          material: p.material || '',
          careInstructions: p.care_instructions || '',
          fabric: p.material || '100% Handwoven Shemma Cotton',
          is_featured: Boolean(p.is_featured),
          image: formattedImg,
          images: [formattedImg],
          variants: p.variants || [],
          createdAt: p.created_at,
        }
      })

      return { products, pagination }
    } catch (err) {
      throw handleApiError(err)
    }
  },

  /**
   * Admin/Staff: Get single product by ID
   * GET /api/products/:id
   */
  async getAdminProductById(id) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.PRODUCTS.DETAILS(id))
      return response?.data || response
    } catch (err) {
      throw handleApiError(err)
    }
  },

  /**
   * Admin/Staff: Create product (Requires: products.create)
   * POST /api/products
   */
  async createProduct(payload) {
    try {
      const body = {
        name: payload.name?.trim(),
        slug: payload.slug?.trim() || undefined,
        category_id: Number(payload.category_id || payload.categoryId),
        short_description: payload.shortDescription || payload.short_description || null,
        description: payload.description || null,
        material: payload.material || payload.fabric || null,
        care_instructions: payload.careInstructions || payload.care_instructions || null,
        status: payload.status?.toLowerCase() || (payload.productStatus?.toLowerCase() === 'draft' ? 'draft' : 'active'),
        is_featured: Boolean(payload.is_featured ?? payload.isFeatured),
      }

      const response = await apiClient.post(API_ENDPOINTS.PRODUCTS.CREATE, body)
      return response?.data || response
    } catch (err) {
      throw handleApiError(err)
    }
  },

  /**
   * Admin/Staff: Update product details (Requires: products.update)
   * PUT /api/products/:id
   */
  async updateProduct(id, payload) {
    try {
      const body = {}
      if (payload.name !== undefined) body.name = payload.name.trim()
      if (payload.slug !== undefined) body.slug = payload.slug.trim()
      if (payload.category_id !== undefined || payload.categoryId !== undefined) {
        body.category_id = Number(payload.category_id || payload.categoryId)
      }
      if (payload.short_description !== undefined || payload.shortDescription !== undefined) {
        body.short_description = payload.short_description ?? payload.shortDescription
      }
      if (payload.description !== undefined) body.description = payload.description
      if (payload.material !== undefined || payload.fabric !== undefined) {
        body.material = payload.material ?? payload.fabric
      }
      if (payload.care_instructions !== undefined || payload.careInstructions !== undefined) {
        body.care_instructions = payload.care_instructions ?? payload.careInstructions
      }
      if (payload.status !== undefined || payload.productStatus !== undefined) {
        const s = payload.status || payload.productStatus
        body.status = s.toLowerCase()
      }
      if (payload.is_featured !== undefined || payload.isFeatured !== undefined) {
        body.is_featured = Boolean(payload.is_featured ?? payload.isFeatured)
      }

      const response = await apiClient.put(API_ENDPOINTS.PRODUCTS.UPDATE(id), body)
      return response?.data || response
    } catch (err) {
      throw handleApiError(err)
    }
  },

  /**
   * Admin/Staff: Update status (draft, active, archived)
   * PATCH /api/products/:id/status
   */
  async updateProductStatus(id, status) {
    try {
      const cleanStatus = status.toLowerCase()
      const response = await apiClient.patch(API_ENDPOINTS.PRODUCTS.UPDATE_STATUS(id), { status: cleanStatus })
      return response?.data || response
    } catch (err) {
      throw handleApiError(err)
    }
  },

  /**
   * Admin/Staff: Delete product safely
   * DELETE /api/products/:id
   */
  async deleteProduct(id) {
    try {
      const response = await apiClient.delete(API_ENDPOINTS.PRODUCTS.DELETE(id))
      return response?.data || response
    } catch (err) {
      throw handleApiError(err)
    }
  },

  // ─── Variant Endpoints ──────────────────────────────────────────────────────

  /**
   * List variants for product
   * GET /api/products/:productId/variants
   */
  async getProductVariants(productId) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.PRODUCTS.VARIANTS(productId))
      return response?.data || response || []
    } catch (err) {
      throw handleApiError(err)
    }
  },

  /**
   * Create variant for product
   * POST /api/products/:productId/variants
   */
  async createVariant(productId, payload) {
    try {
      const body = {
        sku: payload.sku?.trim(),
        size: payload.size?.trim() || null,
        color: payload.color?.trim() || null,
        price: Number(payload.price),
        sale_price: payload.sale_price !== undefined && payload.sale_price !== null && payload.sale_price !== ''
          ? Number(payload.sale_price)
          : undefined,
        stock_quantity: payload.stock_quantity !== undefined ? Number(payload.stock_quantity) : 0,
        low_stock_threshold: payload.low_stock_threshold !== undefined ? Number(payload.low_stock_threshold) : 2,
        is_active: payload.is_active !== undefined ? Boolean(payload.is_active) : true,
      }

      const response = await apiClient.post(API_ENDPOINTS.PRODUCTS.VARIANTS(productId), body)
      return response?.data || response
    } catch (err) {
      throw handleApiError(err)
    }
  },

  /**
   * Update variant details
   * PUT /api/variants/:id
   */
  async updateVariant(id, payload) {
    try {
      const body = {}
      if (payload.sku !== undefined) body.sku = payload.sku.trim()
      if (payload.size !== undefined) body.size = payload.size?.trim() || null
      if (payload.color !== undefined) body.color = payload.color?.trim() || null
      if (payload.price !== undefined) body.price = Number(payload.price)
      if (payload.sale_price !== undefined) {
        body.sale_price = payload.sale_price ? Number(payload.sale_price) : null
      }
      if (payload.low_stock_threshold !== undefined) {
        body.low_stock_threshold = Number(payload.low_stock_threshold)
      }
      if (payload.is_active !== undefined) body.is_active = Boolean(payload.is_active)

      const response = await apiClient.put(API_ENDPOINTS.VARIANTS.UPDATE(id), body)
      return response?.data || response
    } catch (err) {
      throw handleApiError(err)
    }
  },

  /**
   * Activate variant
   * PATCH /api/variants/:id/activate
   */
  async activateVariant(id) {
    try {
      const response = await apiClient.patch(API_ENDPOINTS.VARIANTS.ACTIVATE(id))
      return response?.data || response
    } catch (err) {
      throw handleApiError(err)
    }
  },

  /**
   * Deactivate variant
   * PATCH /api/variants/:id/deactivate
   */
  async deactivateVariant(id) {
    try {
      const response = await apiClient.patch(API_ENDPOINTS.VARIANTS.DEACTIVATE(id))
      return response?.data || response
    } catch (err) {
      throw handleApiError(err)
    }
  },

  // ─── Image Endpoints ────────────────────────────────────────────────────────

  /**
   * List images for a product
   * GET /api/products/:productId/images
   */
  async getProductImages(productId) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.PRODUCTS.IMAGES(productId))
      const data = response?.data || response
      const rawImages = data?.images || []
      return rawImages.map((img) => ({
        ...img,
        image_url: formatImageUrl(img.image_url),
      }))
    } catch (err) {
      throw handleApiError(err)
    }
  },

  /**
   * Upload image file(s) for product using multipart/form-data
   * POST /api/products/:productId/images
   */
  async uploadProductImage(productId, fileOrFiles, options = {}) {
    try {
      const formData = new FormData()

      if (Array.isArray(fileOrFiles)) {
        fileOrFiles.forEach((file) => formData.append('images', file))
      } else {
        formData.append('image', fileOrFiles)
      }

      if (options.variant_id) formData.append('variant_id', options.variant_id)
      if (options.alt_text) formData.append('alt_text', options.alt_text)
      if (options.is_primary !== undefined) formData.append('is_primary', options.is_primary)
      if (options.sort_order !== undefined) formData.append('sort_order', options.sort_order)

      const response = await apiClient.post(API_ENDPOINTS.PRODUCTS.IMAGES(productId), formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      return response?.data || response
    } catch (err) {
      throw handleApiError(err)
    }
  },

  /**
   * Set primary image
   * PATCH /api/product-images/:id/primary
   */
  async setPrimaryImage(imageId) {
    try {
      const response = await apiClient.patch(API_ENDPOINTS.PRODUCT_IMAGES.SET_PRIMARY(imageId))
      return response?.data || response
    } catch (err) {
      throw handleApiError(err)
    }
  },

  /**
   * Delete product image
   * DELETE /api/product-images/:id
   */
  async deleteProductImage(imageId) {
    try {
      const response = await apiClient.delete(API_ENDPOINTS.PRODUCT_IMAGES.DELETE(imageId))
      return response?.data || response
    } catch (err) {
      throw handleApiError(err)
    }
  },
}

export default productApi
