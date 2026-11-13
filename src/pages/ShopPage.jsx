import { useState, useMemo, useCallback } from 'react'

import AnnouncementBar from '../components/layout/AnnouncementBar'
import Navbar from '../components/layout/Navbar'
import MobileMenu from '../components/layout/MobileMenu'
import SearchOverlay from '../components/layout/SearchOverlay'
import Footer from '../components/layout/Footer'
import CartDrawer from '../components/cart/CartDrawer'
import QuickViewModal from '../components/product/QuickViewModal'
import ProductCard from '../components/product/ProductCard'
import AIChatButton from '../components/ai/AIChatButton'
import AIChatDrawer from '../components/ai/AIChatDrawer'

import ShopHeader from '../components/shop/ShopHeader'
import CategoryNavigation from '../components/shop/CategoryNavigation'
import FilterSidebar from '../components/shop/FilterSidebar'
import MobileFilterDrawer from '../components/shop/MobileFilterDrawer'
import ProductToolbar from '../components/shop/ProductToolbar'
import ProductList from '../components/shop/ProductList'
import Pagination from '../components/shop/Pagination'
import EmptyProductsState from '../components/shop/EmptyProductsState'
import RecentlyViewed from '../components/shop/RecentlyViewed'

import { products as allProducts } from '../data/products'

const PER_PAGE = 12

const DEFAULT_FILTERS = {
  categories: [],
  priceRange: [0, 10000],
  sizes: [],
  colors: [],
  availability: [],
  productTypes: [],
}

// Color keyword mapping for filtering
const COLOR_MAP = {
  black: ['black', 'midnight black', 'jet black'],
  white: ['white', 'natural white', 'off-white', 'cream white', 'pure white'],
  green: ['green', 'forest green', 'emerald green', 'lime green', 'deep navy'],
  lime: ['lime', 'lime green', '#95c623'],
  red: ['red'],
  blue: ['blue', 'navy', 'sky blue', 'deep navy', 'classic navy'],
  gold: ['gold', 'golden'],
  brown: ['brown', 'tan'],
}

function getRecentlyViewed() {
  try {
    const stored = localStorage.getItem('ibtu_recently_viewed')
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

function addToRecentlyViewed(product) {
  try {
    const current = getRecentlyViewed()
    const filtered = current.filter((id) => id !== product.id)
    const updated = [product.id, ...filtered].slice(0, 4)
    localStorage.setItem('ibtu_recently_viewed', JSON.stringify(updated))
  } catch {
    // ignore
  }
}

export default function ShopPage() {
  const [currentLang, setCurrentLang] = useState('EN')
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isAIChatOpen, setIsAIChatOpen] = useState(false)
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false)
  const [quickViewProduct, setQuickViewProduct] = useState(null)

  // Shop-specific state
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [sortBy, setSortBy] = useState('featured')
  const [viewMode, setViewMode] = useState('grid')
  const [currentPage, setCurrentPage] = useState(1)

  // Recently viewed (read from localStorage once per mount, then track changes)
  const [recentlyViewedIds, setRecentlyViewedIds] = useState(() => getRecentlyViewed())

  // Handle filter change
  const handleFilterChange = useCallback((key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
    setCurrentPage(1)
  }, [])

  // Clear all filters
  const handleClearAll = useCallback(() => {
    setFilters(DEFAULT_FILTERS)
    setSelectedCategory('all')
    setCurrentPage(1)
  }, [])

  // Handle category tab change
  const handleCategoryChange = useCallback((catId) => {
    setSelectedCategory(catId)
    setCurrentPage(1)
  }, [])

  // Handle quick view + track recently viewed
  const handleQuickView = useCallback((product) => {
    setQuickViewProduct(product)
    addToRecentlyViewed(product)
    setRecentlyViewedIds(getRecentlyViewed())
  }, [])

  // Apply all filters
  const filteredProducts = useMemo(() => {
    let result = [...allProducts]

    // Category tab filter
    if (selectedCategory !== 'all') {
      result = result.filter((p) => p.category === selectedCategory)
    }

    // Sidebar category filter
    if (filters.categories.length > 0) {
      result = result.filter((p) => filters.categories.includes(p.category))
    }

    // Price range filter
    result = result.filter(
      (p) => p.price >= filters.priceRange[0] && p.price <= filters.priceRange[1]
    )

    // Size filter
    if (filters.sizes.length > 0) {
      result = result.filter((p) =>
        filters.sizes.some((size) =>
          p.sizes.some((s) => s.toUpperCase().includes(size.toUpperCase()))
        )
      )
    }

    // Color filter
    if (filters.colors.length > 0) {
      result = result.filter((p) =>
        filters.colors.some((colorId) => {
          const keywords = COLOR_MAP[colorId] || [colorId]
          return p.colors.some((c) =>
            keywords.some((kw) => c.toLowerCase().includes(kw.toLowerCase()))
          )
        })
      )
    }

    // Availability filter
    if (filters.availability.length > 0) {
      result = result.filter((p) => {
        if (filters.availability.includes('in-stock') && p.inStock) return true
        if (filters.availability.includes('out-of-stock') && !p.inStock) return true
        return false
      })
    }

    // Product type filter
    if (filters.productTypes.length > 0) {
      result = result.filter((p) =>
        filters.productTypes.some((type) => p[type] === true)
      )
    }

    // Sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return a.isNewArrival === b.isNewArrival ? 0 : a.isNewArrival ? -1 : 1
        case 'price-asc':
          return a.price - b.price
        case 'price-desc':
          return b.price - a.price
        case 'best-selling':
          return (b.reviewsCount || 0) - (a.reviewsCount || 0)
        case 'rating':
          return (b.rating || 0) - (a.rating || 0)
        case 'featured':
        default:
          return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0)
      }
    })

    return result
  }, [selectedCategory, filters, sortBy])

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / PER_PAGE)
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * PER_PAGE
    return filteredProducts.slice(start, start + PER_PAGE)
  }, [filteredProducts, currentPage])

  // Product counts per category for sidebar
  const productCounts = useMemo(() => {
    const counts = {}
    allProducts.forEach((p) => {
      counts[p.category] = (counts[p.category] || 0) + 1
    })
    return counts
  }, [])

  // Recently viewed products
  const recentlyViewedProducts = useMemo(() => {
    return recentlyViewedIds
      .map((id) => allProducts.find((p) => p.id === id))
      .filter(Boolean)
  }, [recentlyViewedIds])

  const handlePageChange = (page) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA] text-[#1A1A1A]">
      {/* Announcement Bar */}
      <AnnouncementBar currentLang={currentLang} onLanguageChange={setCurrentLang} />

      {/* Sticky Navbar */}
      <Navbar
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        activePage="shop"
      />

      {/* Shop Header */}
      <ShopHeader totalCount={allProducts.length} />

      {/* Category Navigation */}
      <CategoryNavigation selected={selectedCategory} onChange={handleCategoryChange} />

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6">
          {/* Filter Sidebar — desktop only */}
          <div className="hidden lg:block w-[260px] shrink-0">
            <div className="sticky top-[120px]">
              <FilterSidebar
                filters={filters}
                onFilterChange={handleFilterChange}
                onClearAll={handleClearAll}
                productCounts={productCounts}
              />
            </div>
          </div>

          {/* Product Area */}
          <div className="flex-1 min-w-0 space-y-4">
            {/* Toolbar */}
            <ProductToolbar
              totalCount={filteredProducts.length}
              currentPage={currentPage}
              perPage={PER_PAGE}
              sortBy={sortBy}
              onSortChange={(val) => { setSortBy(val); setCurrentPage(1) }}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              onOpenFilters={() => setIsMobileFilterOpen(true)}
            />

            {/* Products */}
            {paginatedProducts.length === 0 ? (
              <EmptyProductsState onClearAll={handleClearAll} />
            ) : viewMode === 'list' ? (
              <ProductList products={paginatedProducts} onQuickView={handleQuickView} />
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                {paginatedProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onQuickView={handleQuickView}
                  />
                ))}
              </div>
            )}

            {/* Pagination */}
            {filteredProducts.length > PER_PAGE && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            )}

            {/* Recently Viewed */}
            <RecentlyViewed
              products={recentlyViewedProducts}
              onQuickView={handleQuickView}
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />

      {/* Modals & Drawers */}
      <CartDrawer />

      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />

      <SearchOverlay
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectProduct={(product) => setQuickViewProduct(product)}
      />

      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      <MobileFilterDrawer
        isOpen={isMobileFilterOpen}
        onClose={() => setIsMobileFilterOpen(false)}
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearAll={handleClearAll}
      />

      {/* AI Chat */}
      <AIChatButton isOpen={isAIChatOpen} onClick={() => setIsAIChatOpen(true)} />
      <AIChatDrawer
        isOpen={isAIChatOpen}
        onClose={() => setIsAIChatOpen(false)}
        onQuickView={handleQuickView}
      />
    </div>
  )
}
