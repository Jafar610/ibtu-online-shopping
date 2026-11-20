// IBTU Admin Catalog State & Persistence
// Provides local storage persistence and mock CRUD helpers for Products and Categories

import { products as initialProducts } from '../products'
import { categories as initialCategories } from '../categories'

const STORAGE_KEY_PRODUCTS = 'ibtu_admin_products'
const STORAGE_KEY_CATEGORIES = 'ibtu_admin_categories'

// Helper to determine stock status
export function calculateStockStatus(stockCount = 0, threshold = 5) {
  if (stockCount <= 0) return 'Out of Stock'
  if (stockCount <= threshold) return 'Low Stock'
  return 'In Stock'
}

// Format default products with admin attributes
function normalizeProducts(rawProducts) {
  return rawProducts.map((p, idx) => {
    const sku = p.sku || `IBTU-${(p.category || 'GEN').slice(0, 3).toUpperCase()}-${String(100 + idx)}`
    const stockCount = p.stockCount ?? (p.inStock ? 25 : 0)
    const lowStockThreshold = 5
    const stockStatus = calculateStockStatus(stockCount, lowStockThreshold)
    const productStatus = p.isDraft ? 'Draft' : p.isArchived ? 'Archived' : 'Active'
    const createdAt = p.createdAt || '2026-01-15T10:00:00Z'

    // Build default variants if not present
    const variants = p.variants || (p.sizes || ['Standard']).flatMap((size, sIdx) =>
      (p.colors || ['Default']).map((color, cIdx) => ({
        id: `var-${p.id}-${sIdx}-${cIdx}`,
        sku: `${sku}-${size.slice(0, 2).toUpperCase()}-${cIdx + 1}`,
        size,
        color,
        price: p.price,
        salePrice: p.originalPrice || null,
        stockQuantity: Math.max(1, Math.floor(stockCount / ((p.sizes?.length || 1) * (p.colors?.length || 1)))),
        lowStockThreshold: 2,
        active: true,
      }))
    )

    return {
      ...p,
      sku,
      stockCount,
      lowStockThreshold,
      stockStatus,
      productStatus,
      createdAt,
      variants,
      images: p.images || [p.image],
    }
  })
}

// Format default categories with admin attributes
function normalizeCategories(rawCategories, productsList) {
  return rawCategories.map((c) => {
    const count = productsList.filter((p) => p.category === c.slug || p.category === c.id).length

    return {
      id: c.id || c.slug,
      name: c.name,
      amharicName: c.amharicName || '',
      slug: c.slug,
      description: c.description || '',
      parentCategory: c.parentCategory || null,
      productCount: count,
      status: c.status || 'Active',
      image: c.image || '',
      featured: Boolean(c.featured),
    }
  })
}

// 1. Get Stored Products
export function getStoredAdminProducts() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_PRODUCTS)
    if (saved) return JSON.parse(saved)
  } catch {
    // fallback
  }
  const normalized = normalizeProducts(initialProducts)
  saveStoredAdminProducts(normalized)
  return normalized
}

// 2. Save Stored Products
export function saveStoredAdminProducts(productsList) {
  try {
    localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(productsList))
  } catch {
    // ignore
  }
}

// 3. Get Stored Categories
export function getStoredAdminCategories() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_CATEGORIES)
    if (saved) return JSON.parse(saved)
  } catch {
    // fallback
  }
  const productsList = getStoredAdminProducts()
  const normalized = normalizeCategories(initialCategories, productsList)
  saveStoredAdminCategories(normalized)
  return normalized
}

// 4. Save Stored Categories
export function saveStoredAdminCategories(categoriesList) {
  try {
    localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(categoriesList))
  } catch {
    // ignore
  }
}
