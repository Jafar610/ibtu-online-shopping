import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Star, Package, CheckCircle, XCircle } from 'lucide-react'

import AnnouncementBar from '../components/layout/AnnouncementBar'
import Navbar from '../components/layout/Navbar'
import MobileMenu from '../components/layout/MobileMenu'
import SearchOverlay from '../components/layout/SearchOverlay'
import Footer from '../components/layout/Footer'
import CartDrawer from '../components/cart/CartDrawer'
import QuickViewModal from '../components/product/QuickViewModal'
import AIChatButton from '../components/ai/AIChatButton'
import AIChatDrawer from '../components/ai/AIChatDrawer'

import Breadcrumb from '../components/common/Breadcrumb'
import ProductGallery from '../components/product-details/ProductGallery'
import ColorSelector from '../components/product-details/ColorSelector'
import SizeSelector from '../components/product-details/SizeSelector'
import QuantitySelector from '../components/product-details/QuantitySelector'
import ProductActions from '../components/product-details/ProductActions'
import ProductTabs from '../components/product-details/ProductTabs'
import ProductReviews from '../components/product-details/ProductReviews'
import RelatedProducts from '../components/product-details/RelatedProducts'

import { products as allProducts } from '../data/products'

const RECENTLY_VIEWED_KEY = 'ibtu_recently_viewed'

function getRecentlyViewed() {
  try {
    return JSON.parse(localStorage.getItem(RECENTLY_VIEWED_KEY) || '[]')
  } catch {
    return []
  }
}

function trackRecentlyViewed(productId) {
  try {
    const current = getRecentlyViewed()
    const updated = [productId, ...current.filter((id) => id !== productId)].slice(0, 5)
    localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(updated))
  } catch {
    // ignore
  }
}

function RecentlyViewedSection({ currentId }) {
  const ids = getRecentlyViewed().filter((id) => id !== currentId)
  const products = ids.map((id) => allProducts.find((p) => p.id === id || p.slug === id)).filter(Boolean).slice(0, 4)

  if (products.length === 0) return null

  return (
    <section className="mt-10">
      <h2 className="font-serif text-xl font-bold text-[#103321] mb-4">Recently Viewed</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {products.map((p) => (
          <Link key={p.id} to={`/product/${p.slug || p.id}`}>
            <div className="group bg-white rounded-2xl border border-gray-100 p-3 shadow-xs hover:shadow-md transition-all duration-300 cursor-pointer">
              <div className="relative aspect-[4/5] rounded-xl overflow-hidden bg-[#F4F5F6] mb-2.5">
                <img
                  src={p.image}
                  alt={p.name}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <h4 className="text-xs font-bold text-gray-900 truncate group-hover:text-[#103321]">{p.name}</h4>
              <div className="flex items-center justify-between mt-1">
                <span className="text-[11px] font-extrabold text-[#103321]">{p.price.toLocaleString()} ETB</span>
                <div className="flex items-center gap-0.5">
                  <Star className="w-2.5 h-2.5 fill-amber-400 stroke-amber-400" />
                  <span className="text-[9px] font-semibold text-gray-600">{p.rating}</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}

function ProductPurchaseSection({ product }) {
  const [selectedSize, setSelectedSize] = useState(null)
  const [selectedColor, setSelectedColor] = useState(() => (product.colors && product.colors.length > 0 ? product.colors[0] : null))
  const [quantity, setQuantity] = useState(1)
  const sizeRef = useRef(null)

  const handleSizeRequired = useCallback(() => {
    sizeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [])

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0

  const categoryLabel = product.category
    ?.replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-[55%_45%] gap-8 lg:gap-10">
        {/* LEFT: Image Gallery */}
        <div>
          <ProductGallery product={product} />
        </div>

        {/* RIGHT: Product Info */}
        <div className="space-y-5">
          {/* Category */}
          <span className="inline-block text-[10px] font-bold uppercase tracking-widest text-[#95C623] bg-[#95C623]/15 px-3 py-1 rounded-full">
            {categoryLabel}
          </span>

          {/* Product name */}
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#103321] leading-tight">
              {product.name}
            </h1>
            {product.amharicName && (
              <p className="text-sm text-[#95C623] font-medium mt-1">{product.amharicName}</p>
            )}
          </div>

          {/* Rating */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`w-4 h-4 ${
                    s <= Math.round(product.rating)
                      ? 'fill-amber-400 stroke-amber-400'
                      : 'fill-gray-100 stroke-gray-200'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm font-bold text-gray-700">{product.rating}</span>
            <span className="text-xs text-gray-400">({product.reviewsCount} reviews)</span>
            <span className="text-[10px] text-gray-300">|</span>
            <span className="text-xs font-semibold text-gray-500">SKU: {product.id.toUpperCase()}</span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3 flex-wrap">
            <span className="font-serif text-3xl font-extrabold text-[#103321]">
              {product.price.toLocaleString()} ETB
            </span>
            {product.originalPrice && (
              <>
                <span className="text-base text-gray-400 line-through">
                  {product.originalPrice.toLocaleString()} ETB
                </span>
                {discount > 0 && (
                  <span className="text-sm font-bold text-white bg-[#95C623] px-2.5 py-0.5 rounded-lg">
                    -{discount}%
                  </span>
                )}
              </>
            )}
          </div>

          {/* Stock status */}
          <div className="flex items-center gap-2">
            {product.inStock ? (
              <>
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm font-semibold text-green-600">In Stock</span>
                {product.stockCount && product.stockCount <= 15 && (
                  <span className="text-xs text-orange-500 font-semibold">
                    — Only {product.stockCount} left
                  </span>
                )}
              </>
            ) : (
              <>
                <XCircle className="w-4 h-4 text-red-400" />
                <span className="text-sm font-semibold text-red-500">Out of Stock</span>
              </>
            )}
          </div>

          {/* Short description */}
          <p className="text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-4">
            {product.description}
          </p>

          {/* Divider */}
          <div className="border-t border-gray-100" />

          {/* Color selector */}
          <ColorSelector
            colors={product.colors}
            selected={selectedColor}
            onChange={setSelectedColor}
          />

          {/* Size selector */}
          <div ref={sizeRef}>
            <SizeSelector
              sizes={product.sizes}
              selected={selectedSize}
              onChange={setSelectedSize}
            />
          </div>

          {/* Quantity selector */}
          <QuantitySelector
            quantity={quantity}
            onChange={setQuantity}
            maxStock={product.stockCount || 99}
          />

          {/* Divider */}
          <div className="border-t border-gray-100" />

          {/* Add to Cart / Buy Now + Trust badges */}
          <div data-product-actions>
            <ProductActions
              product={product}
              selectedSize={selectedSize}
              selectedColor={selectedColor}
              quantity={quantity}
              onSizeRequired={handleSizeRequired}
            />
          </div>
        </div>
      </div>

      {/* Mobile sticky CTA */}
      <div className="fixed bottom-0 inset-x-0 lg:hidden z-30 p-3 bg-white border-t border-gray-100 shadow-2xl">
        <div className="flex gap-3 max-w-sm mx-auto">
          <div className="flex-1">
            <p className="text-xs font-bold text-[#103321] truncate">{product.name}</p>
            <p className="text-sm font-extrabold text-[#103321]">{product.price.toLocaleString()} ETB</p>
          </div>
          <button
            onClick={() => {
              const el = document.querySelector('[data-product-actions]')
              if (el) el.scrollIntoView({ behavior: 'smooth' })
            }}
            className="shrink-0 px-5 py-2.5 rounded-xl bg-[#95C623] text-[#103321] font-bold text-sm flex items-center gap-2 cursor-pointer hover:bg-[#82ad1e] transition-colors"
          >
            <Package className="w-4 h-4" />
            Add to Cart
          </button>
        </div>
      </div>
    </>
  )
}

export default function ProductDetailsPage() {
  const { slug } = useParams()

  const [currentLang, setCurrentLang] = useState('EN')
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isAIChatOpen, setIsAIChatOpen] = useState(false)
  const [quickViewProduct, setQuickViewProduct] = useState(null)

  // Find product by slug or id
  const product = allProducts.find((p) => p.slug === slug || p.id === slug)

  // Track recently viewed on mount
  useEffect(() => {
    if (product) {
      trackRecentlyViewed(product.id)
    }
  }, [product])

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F8F9FA]">
        <AnnouncementBar currentLang={currentLang} onLanguageChange={setCurrentLang} />
        <Navbar
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        />
        <main className="flex-1 flex items-center justify-center py-20 px-4">
          <div className="text-center">
            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-5">
              <XCircle className="w-10 h-10 text-gray-300" />
            </div>
            <h2 className="font-serif text-2xl font-bold text-[#103321] mb-2">Product Not Found</h2>
            <p className="text-gray-500 text-sm mb-6">The product you're looking for doesn't exist or has been removed.</p>
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#95C623] text-[#103321] font-bold text-sm hover:bg-[#82ad1e] transition-colors"
            >
              Browse Shop
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const categoryLabel = product.category
    ?.replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())

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

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

          {/* Breadcrumb */}
          <div className="bg-[#103321] rounded-2xl px-4 py-3 mb-6">
            <Breadcrumb
              items={[
                { label: 'Home', href: '/' },
                { label: 'Shop', href: '/shop' },
                { label: categoryLabel, href: `/shop?category=${product.category}` },
                { label: product.name },
              ]}
            />
          </div>

          {/* Keyed main product purchase section resets all selection state on product change */}
          <ProductPurchaseSection key={product.id} product={product} />

          {/* Product Tabs (Description, Specs, Shipping) */}
          <div className="mt-10">
            <ProductTabs product={product} />
          </div>

          {/* Reviews */}
          <div className="mt-10">
            <ProductReviews product={product} />
          </div>

          {/* Related Products */}
          <div className="mt-12">
            <RelatedProducts
              currentProduct={product}
              onQuickView={setQuickViewProduct}
            />
          </div>

          {/* Recently Viewed */}
          <div className="mb-20 lg:mb-6">
            <RecentlyViewedSection
              currentId={product.id}
            />
          </div>
        </div>
      </main>

      <Footer />

      {/* Global modals */}
      <CartDrawer />
      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
      <SearchOverlay
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectProduct={(p) => setQuickViewProduct(p)}
      />
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />
      <AIChatButton isOpen={isAIChatOpen} onClick={() => setIsAIChatOpen(true)} />
      <AIChatDrawer
        isOpen={isAIChatOpen}
        onClose={() => setIsAIChatOpen(false)}
        onQuickView={(p) => setQuickViewProduct(p)}
      />
    </div>
  )
}
