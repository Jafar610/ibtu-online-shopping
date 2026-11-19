import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShieldCheck, AlertCircle, ShoppingBag } from 'lucide-react'
import AnnouncementBar from '../../components/layout/AnnouncementBar'
import Navbar from '../../components/layout/Navbar'
import Footer from '../../components/layout/Footer'
import CartDrawer from '../../components/cart/CartDrawer'
import SearchOverlay from '../../components/layout/SearchOverlay'
import MobileMenu from '../../components/layout/MobileMenu'
import QuickViewModal from '../../components/product/QuickViewModal'

import CheckoutProgress from '../../components/checkout/CheckoutProgress'
import PaymentMethodSelector from '../../components/checkout/PaymentMethodSelector'
import PaymentInstructions from '../../components/checkout/PaymentInstructions'
import OrderReview from '../../components/checkout/OrderReview'

import { useCart } from '../../context/CartContext'
import { useCheckout } from '../../context/CheckoutContext'
import { useAuth } from '../../context/AuthContext'

export default function PaymentPage() {
  const navigate = useNavigate()
  const { cartItems, subtotal, clearCart } = useCart()
  const { shippingAddress, createOrder, resetCheckout } = useCheckout()
  const { user } = useAuth()

  // Layout states
  const [currentLang, setCurrentLang] = useState('EN')
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [quickViewProduct, setQuickViewProduct] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)

  // Redirect if cart is empty or no shipping address is present
  useEffect(() => {
    if (cartItems.length === 0) {
      navigate('/cart', { replace: true })
    } else if (!shippingAddress) {
      navigate('/checkout', { replace: true })
    }
  }, [cartItems, shippingAddress, navigate])

  const handleConfirmOrder = async () => {
    setErrorMessage(null)
    setIsSubmitting(true)

    try {
      // Simulate quick processing delay for realistic UX
      await new Promise((resolve) => setTimeout(resolve, 800))

      const order = createOrder({
        cartItems,
        subtotal,
        customerUser: user,
      })

      clearCart()
      resetCheckout()
      navigate(`/checkout/confirmation/${order.id}`, { replace: true })
    } catch (err) {
      setErrorMessage(err.message || 'Failed to place order. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (cartItems.length === 0 || !shippingAddress) {
    return null
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
      <CheckoutProgress currentStep="payment" />

      {/* 3. Main Payment Content */}
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
            <Link to="/checkout" className="hover:text-[#103321] transition-colors">
              Shipping
            </Link>
            <span>/</span>
            <span className="text-[#103321] font-bold">Payment & Instructions</span>
          </nav>

          {/* Heading */}
          <div className="mb-8">
            <h1 className="font-serif font-extrabold text-2xl sm:text-3xl text-[#103321]">
              Payment Method & Order Finalization
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Select your preferred Ethiopian payment method and review instructions to finalize your order.
            </p>
          </div>

          {errorMessage && (
            <div className="p-4 mb-6 bg-red-50 rounded-2xl border border-red-200 text-xs text-red-700 flex items-center gap-2 animate-fadeIn">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* 2-Column Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Payment Options & Instructions (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              {/* Payment Method Selector */}
              <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-xs">
                <PaymentMethodSelector />
              </div>

              {/* Dynamic Payment Instructions */}
              <PaymentInstructions />
            </div>

            {/* Right Column: Order Review & Placement (5 cols) */}
            <div className="lg:col-span-5 sticky top-24 space-y-4">
              <OrderReview
                onConfirmOrder={handleConfirmOrder}
                isSubmitting={isSubmitting}
              />

              {/* Security info card */}
              <div className="p-4 bg-white rounded-2xl border border-gray-100 text-xs text-gray-500 space-y-2">
                <div className="flex items-center gap-2 font-bold text-[#103321]">
                  <ShieldCheck className="w-4 h-4 text-[#95C623]" />
                  <span>Transparent Ethiopian E-Commerce</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  No payment details, card credentials, or PINs are captured by this system. All payments occur directly via official Ethiopian banking channels and telecommunication wallets.
                </p>
              </div>
            </div>
          </div>
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
