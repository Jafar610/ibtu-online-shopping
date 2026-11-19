import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, ShoppingBag, ShieldCheck, MapPin, AlertCircle } from 'lucide-react'
import AnnouncementBar from '../../components/layout/AnnouncementBar'
import Navbar from '../../components/layout/Navbar'
import Footer from '../../components/layout/Footer'
import CartDrawer from '../../components/cart/CartDrawer'
import SearchOverlay from '../../components/layout/SearchOverlay'
import MobileMenu from '../../components/layout/MobileMenu'
import QuickViewModal from '../../components/product/QuickViewModal'

import CheckoutProgress from '../../components/checkout/CheckoutProgress'
import ShippingAddressSelector from '../../components/checkout/ShippingAddressSelector'
import CheckoutOrderSummary from '../../components/checkout/CheckoutOrderSummary'

import { useCart } from '../../context/CartContext'
import { useCheckout } from '../../context/CheckoutContext'

export default function CheckoutPage() {
  const navigate = useNavigate()
  const { cartItems } = useCart()
  const { shippingAddress, setShippingAddress } = useCheckout()

  // Layout states
  const [currentLang, setCurrentLang] = useState('EN')
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [quickViewProduct, setQuickViewProduct] = useState(null)
  const [validationError, setValidationError] = useState(null)

  const handleContinueToPayment = () => {
    setValidationError(null)

    if (!shippingAddress || !shippingAddress.recipientName || !shippingAddress.addressLine1 || !shippingAddress.city) {
      setValidationError('Please select or fill in a valid shipping delivery address.')
      return
    }

    navigate('/checkout/payment')
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA] text-[#1A1A1A]">
      {/* 1. Header Navigation */}
      <AnnouncementBar
        currentLang={currentLang}
        onLanguageChange={setCurrentLang}
      />
      <Navbar
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        currentLang={currentLang}
        onLanguageChange={setCurrentLang}
      />

      {/* 2. Checkout Progress Bar */}
      <CheckoutProgress currentStep="shipping" />

      {/* 3. Main Checkout Content */}
      <main className="flex-1 py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-xs text-gray-500 mb-6">
            <Link to="/" className="hover:text-[#103321] transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link to="/cart" className="hover:text-[#103321] transition-colors">
              Cart
            </Link>
            <span>/</span>
            <span className="text-[#103321] font-bold">Shipping Checkout</span>
          </nav>

          {cartItems.length === 0 ? (
            /* Empty Cart Warning */
            <div className="max-w-md mx-auto text-center py-16 px-6 bg-white rounded-3xl border border-gray-100 shadow-xs space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 mx-auto flex items-center justify-center">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h3 className="font-serif font-bold text-lg text-[#103321]">
                Your Cart is Empty
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                You have no items in your shopping bag to checkout. Please explore our Ethiopian traditional and modern collections first.
              </p>
              <Link
                to="/shop"
                className="px-6 py-2.5 rounded-xl bg-[#103321] text-white hover:bg-[#95C623] hover:text-[#103321] text-xs font-bold transition-all inline-flex items-center gap-2 shadow-xs"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Return to Shop</span>
              </Link>
            </div>
          ) : (
            /* Main 2-Column Grid */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Shipping Address Selection (7 cols) */}
              <div className="lg:col-span-7 space-y-6">
                <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-xs space-y-6">
                  <div>
                    <h2 className="font-serif font-extrabold text-xl sm:text-2xl text-[#103321]">
                      Shipping & Delivery
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">
                      Choose where you would like your handcrafted Ethiopian garments delivered.
                    </p>
                  </div>

                  {/* Address Selector */}
                  <ShippingAddressSelector
                    selectedAddress={shippingAddress}
                    onSelectAddress={(addr) => {
                      setShippingAddress(addr)
                      setValidationError(null)
                    }}
                  />

                  {/* Validation Error Message */}
                  {validationError && (
                    <div className="p-3.5 bg-red-50 rounded-xl border border-red-200 text-xs text-red-700 flex items-center gap-2 animate-fadeIn">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{validationError}</span>
                    </div>
                  )}

                  {/* Navigation CTA */}
                  <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <Link
                      to="/cart"
                      className="text-xs font-bold text-gray-500 hover:text-[#103321] transition-colors"
                    >
                      ← Return to Shopping Bag
                    </Link>

                    <button
                      type="button"
                      onClick={handleContinueToPayment}
                      className="w-full sm:w-auto px-7 py-3 rounded-xl bg-[#103321] text-white hover:bg-[#95C623] hover:text-[#103321] font-bold text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer group"
                    >
                      <span>Proceed to Payment</span>
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </button>
                  </div>
                </div>

                {/* Delivery Information Note */}
                <div className="p-5 bg-white rounded-2xl border border-gray-100 text-xs text-gray-600 flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-[#95C623] shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-bold text-[#103321]">
                      Reliable Nationwide Fulfillment
                    </p>
                    <p className="text-gray-500 leading-relaxed text-[11px]">
                      Orders within Addis Ababa are dispatched within 24–48 hours via local courier. Regional orders are handled safely through Ethio Post Express with live tracking updates.
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Column: Order Summary (5 cols) */}
              <div className="lg:col-span-5 sticky top-24">
                <CheckoutOrderSummary showItemsList={true} />
              </div>
            </div>
          )}
        </div>
      </main>

      {/* 4. Footer */}
      <Footer />

      {/* 5. Drawers and Overlays */}
      <CartDrawer />
      <SearchOverlay
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />
      <QuickViewModal
        product={quickViewProduct}
        isOpen={Boolean(quickViewProduct)}
        onClose={() => setQuickViewProduct(null)}
      />
    </div>
  )
}
