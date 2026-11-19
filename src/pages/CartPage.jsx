import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  Heart,
  ArrowRight,
  ArrowLeft,
  Truck,
  Check,
  ShieldCheck,
  Sparkles,
  Info,
  RefreshCw,
} from 'lucide-react'
import AnnouncementBar from '../components/layout/AnnouncementBar'
import Navbar from '../components/layout/Navbar'
import MobileMenu from '../components/layout/MobileMenu'
import SearchOverlay from '../components/layout/SearchOverlay'
import Footer from '../components/layout/Footer'
import CartDrawer from '../components/cart/CartDrawer'
import QuickViewModal from '../components/product/QuickViewModal'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'

export default function CartPage() {
  const navigate = useNavigate()
  const {
    cartItems,
    totalItems,
    subtotal,
    freeShippingThreshold,
    progressToFreeShipping,
    remainingForFreeShipping,
    updateQuantity,
    removeFromCart,
    clearCart,
    showNotification,
  } = useCart()

  const { toggleWishlist, isInWishlist } = useWishlist()

  const [currentLang, setCurrentLang] = useState('EN')
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [quickViewProduct, setQuickViewProduct] = useState(null)
  const [checkoutNotice, setCheckoutNotice] = useState(false)

  const handleMoveToWishlist = (item) => {
    toggleWishlist({
      id: item.id,
      slug: item.slug || item.id,
      name: item.name,
      amharicName: item.amharicName,
      price: item.price,
      originalPrice: item.originalPrice,
      image: item.image,
      category: item.category,
      sizes: item.size ? [item.size] : [],
      colors: item.color ? [item.color] : [],
      inStock: true,
      stockCount: item.stockCount || 50,
    })
    removeFromCart(item.key)
  }

  const handleProceedToCheckout = () => {
    if (cartItems.length === 0) {
      showNotification('Your shopping bag is empty.')
      return
    }
    navigate('/checkout')
  }

  const isFreeShipping = subtotal >= freeShippingThreshold && subtotal > 0

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
        {/* Page Header with Breadcrumbs */}
        <section className="bg-white border-b border-gray-100 py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Breadcrumbs */}
            <nav className="flex items-center gap-2 text-xs text-gray-500 mb-2">
              <Link to="/" className="hover:text-[#103321] transition-colors">
                Home
              </Link>
              <span>/</span>
              <span className="text-[#103321] font-semibold">Shopping Cart</span>
            </nav>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#103321]">
                  Shopping Cart
                </h1>
                <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                  የግዢ ቅርጫት • Review your selected Ethiopian fashion items before proceeding to checkout.
                </p>
              </div>

              {cartItems.length > 0 && (
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#95C623]/15 text-xs font-bold text-[#103321] self-start sm:self-auto">
                  <ShoppingBag className="w-4 h-4 text-[#95C623]" />
                  <span>
                    {totalItems} {totalItems === 1 ? 'item' : 'items'} in your bag
                  </span>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Cart Content Section */}
        <section className="py-8 sm:py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {cartItems.length === 0 ? (
              /* EMPTY CART STATE */
              <div className="max-w-lg mx-auto text-center py-14 px-6 bg-white rounded-3xl border border-gray-100 shadow-sm space-y-6 animate-fadeIn">
                <div className="w-20 h-20 rounded-full bg-[#95C623]/20 text-[#103321] mx-auto flex items-center justify-center">
                  <ShoppingBag className="w-10 h-10 text-[#103321]" />
                </div>

                <div className="space-y-2">
                  <h2 className="font-serif text-2xl font-bold text-[#103321]">
                    Your Shopping Cart is Empty
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-500 max-w-sm mx-auto leading-relaxed">
                    You haven&apos;t added any traditional or modern Ethiopian fashion items to your bag yet. Explore our handcrafted collections to get started.
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
                    to="/wishlist"
                    className="w-full sm:w-auto px-6 py-3 rounded-xl border border-gray-200 text-gray-700 font-semibold text-xs sm:text-sm hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                  >
                    <Heart className="w-4 h-4 text-red-500" />
                    <span>View Saved Wishlist</span>
                  </Link>
                </div>
              </div>
            ) : (
              /* POPULATED CART LAYOUT (Grid: Items 8 cols / Order Summary 4 cols) */
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* LEFT: Cart Items (8 cols) */}
                <div className="lg:col-span-8 space-y-4">
                  {/* Free shipping banner */}
                  <div className="bg-[#95C623]/15 p-4 rounded-2xl border border-[#95C623]/30">
                    <div className="flex items-center justify-between text-xs font-semibold text-[#103321] mb-2">
                      <span className="flex items-center gap-2">
                        <Truck className="w-4 h-4 text-[#103321]" />
                        {isFreeShipping ? (
                          <span className="text-emerald-800 font-bold flex items-center gap-1">
                            <Check className="w-4 h-4 text-emerald-600" />
                            Congratulations! Free nationwide shipping unlocked!
                          </span>
                        ) : (
                          <span>
                            Add{' '}
                            <strong className="text-[#103321] font-bold">
                              {remainingForFreeShipping.toLocaleString()} ETB
                            </strong>{' '}
                            more to unlock free nationwide delivery!
                          </span>
                        )}
                      </span>
                      <span>{progressToFreeShipping}%</span>
                    </div>

                    <div className="w-full bg-white/70 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-[#95C623] h-full transition-all duration-300 rounded-full"
                        style={{ width: `${progressToFreeShipping}%` }}
                      />
                    </div>
                  </div>

                  {/* Header row for items */}
                  <div className="bg-white px-5 py-3.5 rounded-2xl border border-gray-100 shadow-xs flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Product Details
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm('Are you sure you want to clear your shopping cart?')) {
                          clearCart()
                        }
                      }}
                      className="text-xs text-gray-400 hover:text-red-600 transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Clear All Items</span>
                    </button>
                  </div>

                  {/* Cart Items List */}
                  <div className="space-y-3">
                    {cartItems.map((item) => {
                      const maxStock = item.stockCount || 50
                      const isAtMaxStock = item.quantity >= maxStock
                      const isItemWishlisted = isInWishlist(item.id || item.slug)

                      return (
                        <div
                          key={item.key}
                          className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-xs hover:border-gray-200 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                        >
                          {/* Image & Main Info */}
                          <div className="flex items-start gap-4 flex-1 min-w-0">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-20 h-24 sm:w-24 sm:h-28 object-cover rounded-xl bg-gray-100 shrink-0 cursor-pointer"
                              onClick={() => navigate(`/product/${item.slug || item.id}`)}
                            />

                            <div className="space-y-1 min-w-0 flex-1">
                              <span className="text-[10px] uppercase font-bold text-[#95C623] tracking-wider block">
                                {item.category?.replace('-', ' ')}
                              </span>

                              <h3
                                onClick={() => navigate(`/product/${item.slug || item.id}`)}
                                className="font-serif font-bold text-sm sm:text-base text-[#103321] hover:text-[#95C623] transition-colors truncate cursor-pointer"
                              >
                                {item.name}
                              </h3>

                              {item.amharicName && (
                                <p className="text-xs text-gray-400 font-medium truncate">
                                  {item.amharicName}
                                </p>
                              )}

                              {/* Variants (Size & Color) */}
                              <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-gray-600">
                                {item.size && (
                                  <span className="px-2 py-0.5 rounded-md bg-gray-100 font-medium">
                                    Size: <strong className="text-gray-900">{item.size}</strong>
                                  </span>
                                )}
                                {item.color && (
                                  <span className="px-2 py-0.5 rounded-md bg-gray-100 font-medium">
                                    Color: <strong className="text-gray-900">{item.color}</strong>
                                  </span>
                                )}
                                <span className="text-[10px] text-gray-400">
                                  SKU: {String(item.id).toUpperCase()}
                                </span>
                              </div>

                              {/* Unit Price */}
                              <p className="text-xs text-gray-500 pt-0.5">
                                Unit Price:{' '}
                                <strong className="text-[#103321]">
                                  {item.price.toLocaleString()} ETB
                                </strong>
                              </p>
                            </div>
                          </div>

                          {/* Quantity Controls & Line Subtotal */}
                          <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                            {/* Quantity pill */}
                            <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden bg-gray-50">
                              <button
                                type="button"
                                onClick={() => updateQuantity(item.key, item.quantity - 1)}
                                disabled={item.quantity <= 1}
                                className="p-1.5 px-3 text-gray-600 hover:bg-white hover:text-black transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                                aria-label="Decrease quantity"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>

                              <span className="px-3 text-xs sm:text-sm font-bold text-[#103321] min-w-[2rem] text-center">
                                {item.quantity}
                              </span>

                              <button
                                type="button"
                                onClick={() => updateQuantity(item.key, item.quantity + 1)}
                                disabled={isAtMaxStock}
                                className="p-1.5 px-3 text-gray-600 hover:bg-white hover:text-black transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                                aria-label="Increase quantity"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            {/* Subtotal */}
                            <div className="text-right">
                              <span className="text-base font-extrabold text-[#103321] block">
                                {(item.price * item.quantity).toLocaleString()} ETB
                              </span>
                              {isAtMaxStock && (
                                <span className="text-[10px] text-amber-600 font-semibold block">
                                  Max stock reached
                                </span>
                              )}
                            </div>

                            {/* Actions (Move to wishlist / Remove) */}
                            <div className="flex items-center gap-3 pt-1">
                              <button
                                type="button"
                                onClick={() => handleMoveToWishlist(item)}
                                className="text-xs text-gray-500 hover:text-red-500 transition-colors flex items-center gap-1 cursor-pointer"
                                title="Move item to wishlist"
                              >
                                <Heart
                                  className={`w-3.5 h-3.5 ${
                                    isItemWishlisted ? 'fill-red-500 text-red-500' : ''
                                  }`}
                                />
                                <span className="hidden sm:inline">Move to Wishlist</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => removeFromCart(item.key)}
                                className="text-xs text-gray-400 hover:text-red-600 transition-colors flex items-center gap-1 cursor-pointer"
                                title="Remove from cart"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Remove</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Continue Shopping Button */}
                  <div className="pt-2">
                    <Link
                      to="/shop"
                      className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-[#103321] hover:text-[#95C623] transition-colors"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Continue Shopping Ethiopian Fashion</span>
                    </Link>
                  </div>
                </div>

                {/* RIGHT: Order Summary (4 cols) */}
                <div className="lg:col-span-4 space-y-4">
                  <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-5">
                    <h2 className="font-serif text-lg font-bold text-[#103321] pb-3 border-b border-gray-100">
                      Order Summary
                    </h2>

                    {/* Breakdown */}
                    <div className="space-y-3 text-xs sm:text-sm text-gray-600">
                      <div className="flex justify-between items-center">
                        <span>Items Subtotal ({totalItems})</span>
                        <span className="font-bold text-gray-900">
                          {subtotal.toLocaleString()} ETB
                        </span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="flex items-center gap-1">
                          <span>Shipping Fee</span>
                          <span className="text-[10px] text-gray-400">(Nationwide)</span>
                        </span>
                        <span className="font-semibold text-gray-900">
                          {isFreeShipping ? (
                            <span className="text-emerald-600 uppercase font-bold text-xs">
                              Free
                            </span>
                          ) : (
                            <span className="text-xs text-gray-500">Calculated at Checkout</span>
                          )}
                        </span>
                      </div>

                      <div className="flex justify-between items-center text-xs text-gray-500 pt-1">
                        <span>Estimated Tax</span>
                        <span>Included</span>
                      </div>

                      {/* Total */}
                      <div className="pt-3 border-t border-gray-100 flex justify-between items-baseline">
                        <div>
                          <span className="text-sm font-bold text-[#103321] block">
                            Estimated Total
                          </span>
                          <span className="text-[10px] text-gray-400">
                            Final payment calculated at checkout
                          </span>
                        </div>
                        <span className="font-serif text-2xl font-extrabold text-[#103321]">
                          {subtotal.toLocaleString()} ETB
                        </span>
                      </div>
                    </div>

                    {/* Checkout Notice Banner */}
                    {checkoutNotice && (
                      <div className="p-3 bg-[#103321]/10 rounded-xl border border-[#103321]/30 text-xs text-[#103321] flex items-start gap-2 animate-fadeIn">
                        <Info className="w-4 h-4 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold">Milestone Preview Note</p>
                          <p className="text-[11px] text-gray-700 mt-0.5">
                            Order checkout & payment processing (Telebirr, CBE Birr, Chapa) will be implemented in the next checkout milestone.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Checkout CTA */}
                    <button
                      type="button"
                      onClick={handleProceedToCheckout}
                      className="w-full py-4 rounded-2xl bg-[#103321] text-white hover:bg-[#95C623] hover:text-[#103321] font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer group"
                    >
                      <span>Proceed to Checkout</span>
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </button>

                    {/* Payment badges */}
                    <div className="pt-2 text-center">
                      <p className="text-[10px] uppercase font-bold tracking-wider text-gray-400 mb-2">
                        Supported Ethiopian Payments
                      </p>
                      <div className="flex flex-wrap items-center justify-center gap-1.5 text-[10px]">
                        <span className="px-2 py-1 rounded bg-gray-100 font-semibold text-gray-700">
                          Telebirr
                        </span>
                        <span className="px-2 py-1 rounded bg-gray-100 font-semibold text-gray-700">
                          CBE Birr
                        </span>
                        <span className="px-2 py-1 rounded bg-gray-100 font-semibold text-gray-700">
                          Chapa
                        </span>
                        <span className="px-2 py-1 rounded bg-gray-100 font-semibold text-gray-700">
                          Visa
                        </span>
                        <span className="px-2 py-1 rounded bg-gray-100 font-semibold text-gray-700">
                          Mastercard
                        </span>
                      </div>
                    </div>

                    {/* Trust Badges */}
                    <div className="pt-3 border-t border-gray-100 space-y-2 text-xs text-gray-500">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-[#95C623] shrink-0" />
                        <span>100% Authentic Ethiopian Handspun Cotton</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <RefreshCw className="w-4 h-4 text-[#95C623] shrink-0" />
                        <span>7-Day Easy Size & Style Exchanges</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-[#95C623] shrink-0" />
                        <span>Direct Artisan Fair Compensation</span>
                      </div>
                    </div>
                  </div>
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
