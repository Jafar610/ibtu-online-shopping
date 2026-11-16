import { useState } from 'react'
import { Link } from 'react-router-dom'
import { X, ChevronRight, ChevronDown, Heart, ShoppingBag, Phone, MapPin, User, LogIn, LogOut } from 'lucide-react'
import { categories } from '../../data/categories'
import { useWishlist } from '../../context/WishlistContext'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'

export default function MobileMenu({
  isOpen,
  onClose,
  onSelectCategory,
}) {
  const [categoriesExpanded, setCategoriesExpanded] = useState(true)
  const { wishlistCount } = useWishlist()
  const { totalItems, openCart } = useCart()
  const { user, isAuthenticated, logout } = useAuth()

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 left-0 w-[85%] max-w-sm bg-[#103321] text-white z-50 flex flex-col shadow-2xl animate-slideRight">
        {/* Header */}
        <div className="p-4 flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#95C623] bg-white flex items-center justify-center p-0.5">
              <img
                src="/src/assets/logo.jpg"
                alt="ibtu logo"
                className="w-full h-full object-cover rounded-full"
                onError={(e) => {
                  e.target.style.display = 'none'
                }}
              />
            </div>
            <div>
              <span className="font-sans text-xl font-extrabold tracking-tight text-white block">
                ibtu
              </span>
              <span className="text-[10px] text-[#95C623] tracking-widest font-medium uppercase">
                ሀበሻን ጥበብ
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-white/80 hover:text-white"
            aria-label="Close menu"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Action Pills */}
        <div className="grid grid-cols-2 gap-2 p-4 border-b border-white/10 bg-black/10">
          <button
            onClick={() => {
              onClose()
              openCart()
            }}
            className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-white/10 hover:bg-[#95C623] hover:text-[#103321] text-xs font-semibold transition-all cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4 text-[#95C623]" />
            <span>Bag ({totalItems})</span>
          </button>
          <Link
            to="/wishlist"
            onClick={onClose}
            className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-white/10 hover:bg-[#95C623] hover:text-[#103321] text-xs font-semibold transition-all cursor-pointer"
          >
            <Heart className="w-4 h-4 text-[#95C623]" />
            <span>Saved ({wishlistCount})</span>
          </Link>
        </div>

        {/* Account Info/Auth Section */}
        <div className="px-4 py-2.5 bg-black/15 border-b border-white/10">
          {isAuthenticated ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-[#95C623] text-[#103321] flex items-center justify-center font-bold text-xs">
                  {user?.avatar || <User className="w-3.5 h-3.5" />}
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold text-white leading-tight">{user?.name || user?.firstName}</p>
                  <p className="text-[10px] text-white/60 leading-tight">{user?.email}</p>
                </div>
              </div>
              <button
                onClick={logout}
                className="p-1.5 rounded-lg text-white/60 hover:text-red-400 hover:bg-white/10 transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                onClick={onClose}
                className="flex-1 py-1.5 px-3 rounded-lg bg-[#95C623] text-[#103321] text-xs font-bold text-center flex items-center justify-center gap-1.5 hover:bg-[#82ad1e] transition-colors"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </Link>
              <Link
                to="/register"
                onClick={onClose}
                className="flex-1 py-1.5 px-3 rounded-lg border border-white/30 text-white text-xs font-semibold text-center hover:bg-white/10 transition-colors"
              >
                <span>Register</span>
              </Link>
            </div>
          )}
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
          <Link
            to="/"
            onClick={onClose}
            className="flex items-center justify-between py-3 px-3 rounded-xl hover:bg-white/10 text-sm font-semibold text-white hover:text-[#95C623] transition-colors"
          >
            <span>Home</span>
            <ChevronRight className="w-4 h-4 text-white/40" />
          </Link>

          <Link
            to="/shop"
            onClick={onClose}
            className="flex items-center justify-between py-3 px-3 rounded-xl hover:bg-white/10 text-sm font-semibold text-white hover:text-[#95C623] transition-colors"
          >
            <span className="flex items-center gap-2">
              <span>Shop Collections</span>
              <span className="text-[10px] bg-[#95C623] text-[#103321] font-bold px-1.5 py-0.5 rounded">
                NEW
              </span>
            </span>
            <ChevronRight className="w-4 h-4 text-white/40" />
          </Link>

          {/* Categories Accordion */}
          <div>
            <button
              onClick={() => setCategoriesExpanded(!categoriesExpanded)}
              className="w-full flex items-center justify-between py-3 px-3 rounded-xl hover:bg-white/10 text-sm font-semibold text-white hover:text-[#95C623] transition-colors cursor-pointer"
            >
              <span>Categories</span>
              <ChevronDown
                className={`w-4 h-4 text-white/40 transition-transform ${
                  categoriesExpanded ? 'rotate-180' : ''
                }`}
              />
            </button>

            {categoriesExpanded && (
              <div className="pl-4 pr-1 py-1 space-y-1 border-l-2 border-[#95C623]/30 ml-3">
                {categories.map((cat) => (
                  <a
                    key={cat.id}
                    href={`#category-${cat.slug}`}
                    onClick={() => {
                      if (onSelectCategory) onSelectCategory(cat.slug)
                      onClose()
                    }}
                    className="flex items-center justify-between py-2 px-3 rounded-lg text-xs font-medium text-white/80 hover:text-[#95C623] hover:bg-white/5 transition-colors"
                  >
                    <div>
                      <span>{cat.name}</span>
                      <span className="text-[10px] text-white/40 ml-1.5 font-light">
                        {cat.amharicName}
                      </span>
                    </div>
                    <span className="text-[10px] text-white/40">{cat.itemCount}</span>
                  </a>
                ))}
              </div>
            )}
          </div>

          <Link
            to="/about"
            onClick={onClose}
            className="flex items-center justify-between py-3 px-3 rounded-xl hover:bg-white/10 text-sm font-semibold text-white hover:text-[#95C623] transition-colors"
          >
            <span>About Us</span>
            <ChevronRight className="w-4 h-4 text-white/40" />
          </Link>

          <Link
            to="/contact"
            onClick={onClose}
            className="flex items-center justify-between py-3 px-3 rounded-xl hover:bg-white/10 text-sm font-semibold text-white hover:text-[#95C623] transition-colors"
          >
            <span>Contact Us</span>
            <ChevronRight className="w-4 h-4 text-white/40" />
          </Link>

          <a
            href="#promotional-banner"
            onClick={onClose}
            className="flex items-center justify-between py-3 px-3 rounded-xl hover:bg-white/10 text-sm font-semibold text-white hover:text-[#95C623] transition-colors"
          >
            <span>Heritage & Deals</span>
            <ChevronRight className="w-4 h-4 text-white/40" />
          </a>

          <a
            href="#why-choose-us"
            onClick={onClose}
            className="flex items-center justify-between py-3 px-3 rounded-xl hover:bg-white/10 text-sm font-semibold text-white hover:text-[#95C623] transition-colors"
          >
            <span>Why Choose ibtu</span>
            <ChevronRight className="w-4 h-4 text-white/40" />
          </a>

          <a
            href="#newsletter"
            onClick={onClose}
            className="flex items-center justify-between py-3 px-3 rounded-xl hover:bg-white/10 text-sm font-semibold text-white hover:text-[#95C623] transition-colors"
          >
            <span>Join Newsletter</span>
            <ChevronRight className="w-4 h-4 text-white/40" />
          </a>
        </div>

        {/* Footer info in drawer */}
        <div className="p-4 border-t border-white/10 bg-black/20 text-xs text-white/70 space-y-2">
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-[#95C623]" />
            <span>Addis Ababa, Bole & Nationwide Shipping</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="w-3.5 h-3.5 text-[#95C623]" />
            <span>+251 911 234 567</span>
          </div>
        </div>
      </div>
    </div>
  )
}
