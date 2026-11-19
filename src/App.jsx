import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { CartProvider, useCart } from './context/CartContext'
import { WishlistProvider, useWishlist } from './context/WishlistContext'
import { AuthProvider } from './context/AuthContext'
import { CheckoutProvider } from './context/CheckoutContext'
import ProtectedRoute from './routes/ProtectedRoute'

import HomePage from './pages/HomePage'
import ShopPage from './pages/ShopPage'
import ProductDetailsPage from './pages/ProductDetailsPage'
import AboutPage from './pages/AboutPage'
import ContactPage from './pages/ContactPage'
import WishlistPage from './pages/WishlistPage'
import CartPage from './pages/CartPage'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import ForgotPassword from './pages/auth/ForgotPassword'
import ResetPassword from './pages/auth/ResetPassword'

// Customer Account Dashboard Pages (Phase 5 - Step 5)
import AccountDashboard from './pages/customer/AccountDashboard'
import ProfilePage from './pages/customer/ProfilePage'
import AddressesPage from './pages/customer/AddressesPage'
import OrdersPage from './pages/customer/OrdersPage'
import OrderDetailsPage from './pages/customer/OrderDetailsPage'
import OrderTrackingPage from './pages/customer/OrderTrackingPage'

// Checkout & Payment Pages (Phase 5 - Step 6)
import CheckoutPage from './pages/checkout/CheckoutPage'
import PaymentPage from './pages/checkout/PaymentPage'
import OrderConfirmationPage from './pages/checkout/OrderConfirmationPage'

import { CheckCircle2 } from 'lucide-react'

function GlobalNotification() {
  const { notification: cartNotification } = useCart()
  const { notification: wishlistNotification } = useWishlist()
  const notification = cartNotification || wishlistNotification
  if (!notification) return null
  return (
    <div className="fixed top-20 right-6 z-50 bg-[#103321] text-white px-4 py-3 rounded-2xl shadow-2xl border border-[#95C623] flex items-center gap-3 animate-slideDown">
      <CheckCircle2 className="w-5 h-5 text-[#95C623] shrink-0" />
      <span className="text-xs sm:text-sm font-semibold">{notification}</span>
    </div>
  )
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <CheckoutProvider>
              <GlobalNotification />
              <Routes>
                {/* Public Store Pages */}
                <Route path="/" element={<HomePage />} />
                <Route path="/shop" element={<ShopPage />} />
                <Route path="/product/:slug" element={<ProductDetailsPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/wishlist" element={<WishlistPage />} />
                <Route path="/cart" element={<CartPage />} />

                {/* Authentication Pages */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />

                {/* Customer Account Routes (Protected - Role: Customer) */}
                <Route
                  path="/account"
                  element={
                    <ProtectedRoute allowedRoles={['customer']}>
                      <AccountDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/account/profile"
                  element={
                    <ProtectedRoute allowedRoles={['customer']}>
                      <ProfilePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/account/addresses"
                  element={
                    <ProtectedRoute allowedRoles={['customer']}>
                      <AddressesPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/account/orders"
                  element={
                    <ProtectedRoute allowedRoles={['customer']}>
                      <OrdersPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/account/orders/:orderId"
                  element={
                    <ProtectedRoute allowedRoles={['customer']}>
                      <OrderDetailsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/account/orders/:orderId/tracking"
                  element={
                    <ProtectedRoute allowedRoles={['customer']}>
                      <OrderTrackingPage />
                    </ProtectedRoute>
                  }
                />

                {/* Checkout & Payment Routes (Phase 5 - Step 6) */}
                <Route
                  path="/checkout"
                  element={
                    <ProtectedRoute allowedRoles={['customer']}>
                      <CheckoutPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/checkout/payment"
                  element={
                    <ProtectedRoute allowedRoles={['customer']}>
                      <PaymentPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/checkout/confirmation/:orderId"
                  element={
                    <ProtectedRoute allowedRoles={['customer']}>
                      <OrderConfirmationPage />
                    </ProtectedRoute>
                  }
                />

                {/* Catch-all fallback */}
                <Route path="*" element={<HomePage />} />
              </Routes>
            </CheckoutProvider>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </Router>
  )
}
