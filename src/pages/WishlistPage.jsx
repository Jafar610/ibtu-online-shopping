import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Heart,
  ShoppingBag,
  Trash2,
  ArrowRight,
  Sparkles,
  Eye,
  Check,
  Star,
  Package,
} from 'lucide-react'
import AnnouncementBar from '../components/layout/AnnouncementBar'
import Navbar from '../components/layout/Navbar'
import MobileMenu from '../components/layout/MobileMenu'
import SearchOverlay from '../components/layout/SearchOverlay'
import Footer from '../components/layout/Footer'
import CartDrawer from '../components/cart/CartDrawer'
import QuickViewModal from '../components/product/QuickViewModal'
import { useWishlist } from '../context/WishlistContext'
import { useCart } from '../context/CartContext'

export default function WishlistPage() {
  const navigate = useNavigate()
  const { wishlistItems, wishlistCount, removeFromWishlist, clearWishlist } = useWishlist()
  const { addToCart, openCart } = useCart()

  const [currentLang, setCurrentLang] = useState('EN')
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [quickViewProduct, setQuickViewProduct] = useState(null)
  const [addedItemKeys, setAddedItemKeys] = useState({})

  const handleAddToCart = (product, e) => {
    e.stopPropagation()
    const size = (product.sizes && product.sizes[0]) || 'Standard'
    const color = (product.colors && product.colors[0]) || 'Default'
    addToCart(product, 1, size, color)

    const key = product.id || product.slug
    setAddedItemKeys((prev) => ({ ...prev, [key]: true }))
    setTimeout(() => {
      setAddedItemKeys((prev) => ({ ...prev, [key]: false }))
    }, 1800)
  }

  const handleAddAllToCart = () => {
    wishlistItems.forEach((product) => {
      const size = (product.sizes && product.sizes[0]) || 'Standard'
      const color = (product.colors && product.colors[0]) || 'Default'
      addToCart(product, 1, size, color)
    })
    openCart()
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA] text-[#1A1A1A]">
      {/* 1. Announcement Bar */}
      <AnnouncementBar
        currentLang={currentLang}
        onLanguageChange={setCurrentLang}
      />

      {/* 2. Main Navigation Bar */}
      <Navbar
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
      />

      {/* Main Content */}
      <main className="flex-1">
        {/* Wishlist Hero Header */}
        <section className="relative bg-[#103321] text-white py-14 sm:py-16 overflow-hidden">
          {/* Subtle Tibeb Background Pattern */}
          <div className="absolute inset-0 opacity-10 bg-tibeb-pattern pointer-events-none" />

          {/* Decorative Glow */}
          <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-[#95C623]/15 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-[#95C623]/10 blur-3xl pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-[#95C623]/30 backdrop-blur-xs mb-3">
              <Sparkles className="w-3.5 h-3.5 text-[#95C623]" />
              <span className="text-xs uppercase tracking-widest text-[#95C623] font-bold">
                የተመረጡ እቃዎች · SAVED COLLECTION
              </span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-3">
              My Saved Wishlist
            </h1>

            <p className="text-sm sm:text-base text-white/80 max-w-xl mx-auto leading-relaxed">
              Your favorite handwoven Ethiopian fashion pieces, preserved so you can easily review and order them anytime.
            </p>

            <div className="mt-4 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 text-xs font-semibold text-[#95C623]">
              <Heart className="w-3.5 h-3.5 fill-[#95C623]" />
              <span>
                {wishlistCount} {wishlistCount === 1 ? 'item' : 'items'} saved
              </span>
            </div>
          </div>
        </section>

        {/* Wishlist Items Section */}
        <section className="py-12 sm:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {wishlistItems.length === 0 ? (
              /* EMPTY STATE */
              <div className="max-w-lg mx-auto text-center py-12 px-6 bg-white rounded-3xl border border-gray-100 shadow-sm space-y-6 animate-fadeIn">
                <div className="w-20 h-20 rounded-full bg-red-50 text-red-400 mx-auto flex items-center justify-center">
                  <Heart className="w-10 h-10" />
                </div>

                <div className="space-y-2">
                  <h2 className="font-serif text-2xl font-bold text-[#103321]">
                    Your Wishlist is Empty
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
                    You haven&apos;t saved any traditional or modern Ethiopian fashion items yet. Click the heart icon on any product in our catalog to save it here.
                  </p>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <Link
                    to="/shop"
                    className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#103321] text-white font-bold text-xs sm:text-sm hover:bg-[#95C623] hover:text-[#103321] transition-all flex items-center justify-center gap-2 shadow-sm"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Explore Collections</span>
                  </Link>
                  <Link
                    to="/"
                    className="w-full sm:w-auto px-6 py-3 rounded-xl border border-gray-200 text-gray-700 font-semibold text-xs sm:text-sm hover:bg-gray-50 transition-colors"
                  >
                    Back to Home
                  </Link>
                </div>
              </div>
            ) : (
              /* POPULATED STATE */
              <div className="space-y-6">
                {/* Actions Toolbar */}
                <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <span className="font-serif text-lg font-bold text-[#103321]">
                      Saved Products ({wishlistCount})
                    </span>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                    <button
                      type="button"
                      onClick={handleAddAllToCart}
                      className="px-4 py-2 rounded-xl bg-[#95C623] text-[#103321] font-bold text-xs hover:bg-[#82ad1e] transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Add All to Bag</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm('Are you sure you want to clear your wishlist?')) {
                          clearWishlist()
                        }
                      }}
                      className="px-3.5 py-2 rounded-xl border border-gray-200 text-gray-600 hover:text-red-600 hover:border-red-200 hover:bg-red-50 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Clear All</span>
                    </button>
                  </div>
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {wishlistItems.map((product) => {
                    const itemKey = product.id || product.slug
                    const isAdded = Boolean(addedItemKeys[itemKey])

                    return (
                      <div
                        key={itemKey}
                        className="group bg-white rounded-2xl border border-gray-100 p-3.5 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
                      >
                        <div>
                          {/* Image Thumbnail */}
                          <div
                            onClick={() => navigate(`/product/${product.slug || product.id}`)}
                            className="relative aspect-[4/5] w-full rounded-xl overflow-hidden bg-[#F4F5F6] cursor-pointer"
                          >
                            <img
                              src={product.image}
                              alt={product.name}
                              loading="lazy"
                              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                            />

                            {/* Badges & Remove */}
                            <div className="absolute top-2.5 left-2.5 right-2.5 flex items-start justify-between gap-2 z-10">
                              {product.badge ? (
                                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#103321] text-[#95C623] shadow-xs">
                                  {product.badge}
                                </span>
                              ) : (
                                <span />
                              )}

                              {/* Remove button */}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  removeFromWishlist(product.id || product.slug)
                                }}
                                className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-xs text-gray-500 hover:text-red-600 hover:bg-white shadow-sm flex items-center justify-center transition-all cursor-pointer"
                                title="Remove from wishlist"
                                aria-label="Remove item"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>

                            {/* Quick view button overlay */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                setQuickViewProduct(product)
                              }}
                              className="absolute bottom-2.5 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-1.5 px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-xl text-[10px] font-bold text-[#103321] shadow-sm whitespace-nowrap cursor-pointer"
                            >
                              <Eye className="w-3 h-3" />
                              <span>Quick View</span>
                            </button>
                          </div>

                          {/* Info */}
                          <div className="pt-3">
                            <span className="text-[10px] uppercase font-bold text-[#95C623] tracking-wider block">
                              {product.category?.replace('-', ' ')}
                            </span>

                            <h3
                              onClick={() => navigate(`/product/${product.slug || product.id}`)}
                              className="font-sans font-bold text-sm text-gray-900 group-hover:text-[#103321] transition-colors truncate mt-0.5 cursor-pointer"
                            >
                              {product.name}
                            </h3>

                            {product.amharicName && (
                              <p className="text-[11px] text-gray-500 font-medium truncate">
                                {product.amharicName}
                              </p>
                            )}

                            {/* Price and Rating */}
                            <div className="flex items-center justify-between gap-2 mt-2">
                              <div className="flex items-baseline gap-1.5">
                                <span className="text-sm font-extrabold text-[#103321]">
                                  {product.price ? product.price.toLocaleString() : ''} ETB
                                </span>
                                {product.originalPrice && (
                                  <span className="text-[11px] text-gray-400 line-through">
                                    {product.originalPrice.toLocaleString()} ETB
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-1 text-[11px] font-semibold text-gray-700 shrink-0">
                                <Star className="w-3 h-3 fill-amber-400 stroke-amber-400" />
                                <span>{product.rating || 4.8}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Card CTA: Add to Bag */}
                        <div className="pt-3 border-t border-gray-100 mt-3">
                          <button
                            type="button"
                            onClick={(e) => handleAddToCart(product, e)}
                            className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs ${
                              isAdded
                                ? 'bg-[#103321] text-white'
                                : 'bg-[#95C623] hover:bg-[#82ad1e] text-[#103321]'
                            }`}
                          >
                            {isAdded ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-[#95C623]" />
                                <span>Added to Bag!</span>
                              </>
                            ) : (
                              <>
                                <ShoppingBag className="w-3.5 h-3.5" />
                                <span>Add to Bag</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Bottom navigation link */}
                <div className="pt-6 text-center">
                  <Link
                    to="/shop"
                    className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-[#103321] hover:text-[#95C623] transition-colors"
                  >
                    <span>Continue Browsing All Collections</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* 3. Footer */}
      <Footer />

      {/* Floating Drawers & Overlays */}
      <CartDrawer />
      <SearchOverlay
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onQuickView={(p) => setQuickViewProduct(p)}
      />
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />
      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
    </div>
  )
}
