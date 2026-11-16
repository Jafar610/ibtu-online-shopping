import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { CartProvider, useCart } from './context/CartContext'
import { WishlistProvider, useWishlist } from './context/WishlistContext'
import { AuthProvider } from './context/AuthContext'
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
            <GlobalNotification />
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/shop" element={<ShopPage />} />
              <Route path="/product/:slug" element={<ProductDetailsPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/wishlist" element={<WishlistPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="*" element={<HomePage />} />
            </Routes>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </Router>
  )
}
