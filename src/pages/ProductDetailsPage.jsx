import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Star, Package, CheckCircle, XCircle, Loader2 } from 'lucide-react'

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

import { productApi } from '../services/api/productApi'

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

function ProductPurchaseSection({ product }) {
  const [selectedSize, setSelectedSize] = useState(() => (product.sizes && product.sizes.length > 0 ? product.sizes[0] : null))
  const [selectedColor, setSelectedColor] = useState(() => (product.colors && product.colors.length > 0 ? product.colors[0] : null))
  const [quantity, setQuantity] = useState(1)
  const sizeRef = useRef(null)

  const handleSizeRequired = useCallback(() => {
    sizeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [])

  // Match selected variant
  const matchedVariant = useMemo(() => {
    if (!product?.variants || product.variants.length === 0) return null

    // Exact match for both size and color
    const exact = product.variants.find(
      (v) =>
        (!selectedSize || v.size === selectedSize) &&
        (!selectedColor || v.color === selectedColor)
    )
    if (exact) return exact

    // Match size only
    const sizeMatch = product.variants.find((v) => !selectedSize || v.size === selectedSize)
    if (sizeMatch) return sizeMatch

    return product.variants[0]
  }, [product.variants, selectedSize, selectedColor])

  const currentPrice = matchedVariant?.effective_price ?? matchedVariant?.price ?? product.price
  const currentOriginalPrice =
    matchedVariant?.sale_price && matchedVariant?.price && matchedVariant.sale_price < matchedVariant.price
      ? matchedVariant.price
      : product.originalPrice

  const isVariantInStock = matchedVariant ? matchedVariant.is_in_stock : product.inStock
  const currentStockCount = matchedVariant ? matchedVariant.available_quantity : product.stockCount

  const activeProduct = useMemo(
    () => ({
      ...product,
      price: currentPrice,
      originalPrice: currentOriginalPrice,
      inStock: isVariantInStock,
      stockCount: currentStockCount,
      selectedVariant: matchedVariant,
      sku: matchedVariant?.sku || product.sku || product.id,
    }),
    [product, currentPrice, currentOriginalPrice, isVariantInStock, currentStockCount, matchedVariant]
  )

  const discount = currentOriginalPrice
    ? Math.round(((currentOriginalPrice - currentPrice) / currentOriginalPrice) * 100)
    : 0

  const categoryLabel = (product.categoryName || product.category || 'Habesha Kemis')
    ?.replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-[55%_45%] gap-8 lg:gap-10">
        {/* LEFT: Image Gallery */}
        <div>
          <ProductGallery product={activeProduct} />
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
                    s <= Math.round(product.rating || 5)
                      ? 'fill-amber-400 stroke-amber-400'
                      : 'fill-gray-100 stroke-gray-200'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm font-bold text-gray-700">{product.rating || 4.8}</span>
            <span className="text-xs text-gray-400">({product.reviewsCount || 0} reviews)</span>
            <span className="text-[10px] text-gray-300">|</span>
            <span className="text-xs font-semibold text-gray-500 font-mono">
              SKU: {activeProduct.sku}
            </span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3 flex-wrap">
            <span className="font-serif text-3xl font-extrabold text-[#103321]">
              {currentPrice.toLocaleString()} ETB
            </span>
            {currentOriginalPrice && (
              <>
                <span className="text-base text-gray-400 line-through">
                  {currentOriginalPrice.toLocaleString()} ETB
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
            {isVariantInStock ? (
              <>
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm font-semibold text-green-600">In Stock</span>
                {currentStockCount !== undefined && currentStockCount <= 10 && currentStockCount > 0 && (
                  <span className="text-xs text-orange-500 font-semibold">
                    — Only {currentStockCount} left
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
            {product.description || product.shortDescription}
          </p>

          {/* Divider */}
          <div className="border-t border-gray-100" />

          {/* Color selector */}
          {product.colors && product.colors.length > 0 && (
            <ColorSelector
              colors={product.colors}
              selected={selectedColor}
              onChange={setSelectedColor}
            />
          )}

          {/* Size selector */}
          {product.sizes && product.sizes.length > 0 && (
            <div ref={sizeRef}>
              <SizeSelector
                sizes={product.sizes}
                selected={selectedSize}
                onChange={setSelectedSize}
              />
            </div>
          )}

          {/* Quantity selector */}
          <QuantitySelector
            quantity={quantity}
            onChange={setQuantity}
            maxStock={currentStockCount || 99}
          />

          {/* Divider */}
          <div className="border-t border-gray-100" />

          {/* Add to Cart / Buy Now + Trust badges */}
          <div data-product-actions>
            <ProductActions
              product={activeProduct}
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
            <p className="text-sm font-extrabold text-[#103321]">{currentPrice.toLocaleString()} ETB</p>
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

  // API State
  const [product, setProduct] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isMounted = true
    setIsLoading(true)
    setError(null)

    productApi
      .getProductDetails(slug)
      .then((data) => {
        if (isMounted) {
          setProduct(data)
          if (data?.id) {
            trackRecentlyViewed(data.id)
          }
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err?.message || 'Product not found')
          setProduct(null)
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [slug])

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F8F9FA]">
        <AnnouncementBar currentLang={currentLang} onLanguageChange={setCurrentLang} />
        <Navbar
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        />
        <main className="flex-1 flex items-center justify-center py-20 px-4">
          <div className="text-center space-y-3">
            <Loader2 className="w-10 h-10 text-[#103321] animate-spin mx-auto" />
            <p className="text-xs text-gray-500 font-semibold">Loading product details...</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (error || !product) {
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
            <p className="text-gray-500 text-sm mb-6">
              The product you're looking for doesn't exist or is currently unavailable in our catalog.
            </p>
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

  const categoryLabel = (product.categoryName || product.category || 'Habesha Kemis')
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
