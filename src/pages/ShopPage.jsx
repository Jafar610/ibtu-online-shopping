import { useState, useMemo, useCallback, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AlertCircle, RefreshCw } from 'lucide-react'

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

import { productApi } from '../services/api/productApi'
import { categoryApi } from '../services/api/categoryApi'

const PER_PAGE = 12

const DEFAULT_FILTERS = {
  categories: [],
  priceRange: [0, 10000],
  sizes: [],
  colors: [],
  availability: [],
  productTypes: [],
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
    const filtered = current.filter((id) => id !== product.id && id !== product.slug)
    const updated = [product.id, ...filtered].slice(0, 4)
    localStorage.setItem('ibtu_recently_viewed', JSON.stringify(updated))
  } catch {
    // ignore
  }
}

export default function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const urlCategory = searchParams.get('category')
  const urlSearch = searchParams.get('search')

  const [currentLang, setCurrentLang] = useState('EN')
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isAIChatOpen, setIsAIChatOpen] = useState(false)
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false)
  const [quickViewProduct, setQuickViewProduct] = useState(null)

  // Shop-specific state
  const [selectedCategory, setSelectedCategory] = useState(urlCategory || 'all')
  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [sortBy, setSortBy] = useState('featured')
  const [viewMode, setViewMode] = useState('grid')
  const [currentPage, setCurrentPage] = useState(1)

  // Real API state
  const [products, setProducts] = useState([])
  const [totalCount, setTotalCount] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [categories, setCategories] = useState([])

  // Recently viewed
  const [recentlyViewedIds, setRecentlyViewedIds] = useState(() => getRecentlyViewed())

  // Keep selectedCategory synced if URL changes
  useEffect(() => {
    if (urlCategory) {
      setSelectedCategory(urlCategory)
      setCurrentPage(1)
    }
  }, [urlCategory])

  // Load Categories once on mount
  useEffect(() => {
    let isMounted = true
    categoryApi
      .getCatalogCategories()
      .then((cats) => {
        if (isMounted && Array.isArray(cats)) {
          setCategories(cats)
        }
      })
      .catch((err) => {
        console.warn('Could not load categories for shop header/filters:', err)
      })

    return () => {
      isMounted = false
    }
  }, [])

  // Fetch Products from real Backend Catalog API
  const fetchProducts = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const params = {
        page: currentPage,
        limit: PER_PAGE,
      }

      // Determine active category (category tab takes precedence, else filter checkbox)
      const activeCat =
        selectedCategory !== 'all'
          ? selectedCategory
          : filters.categories.length === 1
          ? filters.categories[0]
          : undefined

      if (activeCat && activeCat !== 'all') {
        params.category = activeCat
      }

      // Search keyword from URL query param
      if (urlSearch && urlSearch.trim()) {
        params.search = urlSearch.trim()
      }

      // Price filter
      if (filters.priceRange[0] > 0) {
        params.min_price = filters.priceRange[0]
      }
      if (filters.priceRange[1] < 10000) {
        params.max_price = filters.priceRange[1]
      }

      // Size filter
      if (filters.sizes.length > 0) {
        params.size = filters.sizes[0]
      }

      // Color filter
      if (filters.colors.length > 0) {
        params.color = filters.colors[0]
      }

      // Availability (in_stock)
      if (
        filters.availability.includes('in-stock') &&
        !filters.availability.includes('out-of-stock')
      ) {
        params.in_stock = 'true'
      }

      // Featured filter
      if (filters.productTypes.includes('isFeatured')) {
        params.featured = 'true'
      }

      // Sorting
      const sortMap = {
        newest: 'newest',
        oldest: 'oldest',
        'price-asc': 'price_asc',
        'price-desc': 'price_desc',
        'name-asc': 'name_asc',
        'name-desc': 'name_desc',
        'best-selling': 'newest',
        rating: 'newest',
        featured: 'newest',
      }
      params.sort = sortMap[sortBy] || 'newest'

      const res = await productApi.getCatalogProducts(params)
      setProducts(res.products || [])
      setTotalCount(res.meta?.total ?? res.products?.length ?? 0)
      setTotalPages(res.meta?.totalPages ?? 1)
    } catch (err) {
      setError(
        err?.message ||
          'Failed to load products from server. Please verify the backend is running.'
      )
      setProducts([])
      setTotalCount(0)
      setTotalPages(1)
    } finally {
      setIsLoading(false)
    }
  }, [currentPage, selectedCategory, filters, sortBy, urlSearch])

  // Trigger fetch whenever parameters change
  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  // Filter change handler
  const handleFilterChange = useCallback((key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
    setCurrentPage(1)
  }, [])

  // Clear all filters handler
  const handleClearAll = useCallback(() => {
    setFilters(DEFAULT_FILTERS)
    setSelectedCategory('all')
    setCurrentPage(1)
    if (searchParams.get('search') || searchParams.get('category')) {
      setSearchParams({})
    }
  }, [searchParams, setSearchParams])

  // Category tab handler
  const handleCategoryChange = useCallback(
    (catId) => {
      setSelectedCategory(catId)
      setCurrentPage(1)
      if (catId !== 'all') {
        setSearchParams((prev) => {
          const next = new URLSearchParams(prev)
          next.set('category', catId)
          return next
        })
      } else {
        setSearchParams((prev) => {
          const next = new URLSearchParams(prev)
          next.delete('category')
          return next
        })
      }
    },
    [setSearchParams]
  )

  // Quick view handler + track recently viewed
  const handleQuickView = useCallback((product) => {
    setQuickViewProduct(product)
    addToRecentlyViewed(product)
    setRecentlyViewedIds(getRecentlyViewed())
  }, [])

  // Pagination handler
  const handlePageChange = (page) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Calculate product counts per category for sidebar
  const productCounts = useMemo(() => {
    const counts = {}
    categories.forEach((c) => {
      counts[c.slug] = c.product_count ?? 0
      counts[String(c.id)] = c.product_count ?? 0
    })
    return counts
  }, [categories])

  // Recently viewed products mapped from loaded products or placeholder
  const recentlyViewedProducts = useMemo(() => {
    return recentlyViewedIds
      .map((id) => products.find((p) => p.id === id || p.slug === id))
      .filter(Boolean)
  }, [recentlyViewedIds, products])

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
      <ShopHeader totalCount={totalCount} />

      {/* Category Navigation */}
      <CategoryNavigation
        selected={selectedCategory}
        onChange={handleCategoryChange}
        categories={categories}
      />

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
                categories={categories}
              />
            </div>
          </div>

          {/* Product Area */}
          <div className="flex-1 min-w-0 space-y-4">
            {/* Toolbar */}
            <ProductToolbar
              totalCount={totalCount}
              currentPage={currentPage}
              perPage={PER_PAGE}
              sortBy={sortBy}
              onSortChange={(val) => {
                setSortBy(val)
                setCurrentPage(1)
              }}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              onOpenFilters={() => setIsMobileFilterOpen(true)}
            />

            {/* Error State with Retry Button */}
            {error && (
              <div className="p-6 rounded-3xl bg-rose-50 border border-rose-200 text-rose-800 space-y-3">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                  <span className="font-bold text-sm">Unable to load catalog</span>
                </div>
                <p className="text-xs text-rose-700 leading-relaxed">{error}</p>
                <button
                  type="button"
                  onClick={fetchProducts}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 text-white font-bold text-xs hover:bg-rose-700 transition-colors cursor-pointer shadow-xs"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Try Again</span>
                </button>
              </div>
            )}

            {/* Loading Skeleton */}
            {isLoading && !error && (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 animate-pulse">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-2xl border border-gray-100 p-3.5 space-y-3"
                  >
                    <div className="aspect-[4/5] bg-gray-200 rounded-xl w-full" />
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                    <div className="h-9 bg-gray-200 rounded-xl w-full" />
                  </div>
                ))}
              </div>
            )}

            {/* Loaded Products */}
            {!isLoading && !error && products.length === 0 && (
              <EmptyProductsState onClearAll={handleClearAll} />
            )}

            {!isLoading && !error && products.length > 0 && (
              <>
                {viewMode === 'list' ? (
                  <ProductList products={products} onQuickView={handleQuickView} />
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                    {products.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        onQuickView={handleQuickView}
                      />
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Pagination */}
            {!isLoading && !error && totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            )}

            {/* Recently Viewed */}
            {recentlyViewedProducts.length > 0 && (
              <RecentlyViewed
                products={recentlyViewedProducts}
                onQuickView={handleQuickView}
              />
            )}
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
        categories={categories}
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
