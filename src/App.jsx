import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { CartProvider, useCart } from './context/CartContext'
import { WishlistProvider } from './context/WishlistContext'
import HomePage from './pages/HomePage'
import { CheckCircle2 } from 'lucide-react'

function GlobalNotification() {
  const { notification } = useCart()

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
      <CartProvider>
        <WishlistProvider>
          <GlobalNotification />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="*" element={<HomePage />} />
          </Routes>
        </WishlistProvider>
      </CartProvider>
    </Router>
  )
}
