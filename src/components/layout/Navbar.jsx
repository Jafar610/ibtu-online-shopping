import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  Search,
  Heart,
  ShoppingBag,
  User,
  Menu,
  ChevronDown,
} from 'lucide-react'
import { categories } from '../../data/categories'
import { useCart } from '../../context/CartContext'
import { useWishlist } from '../../context/WishlistContext'
import { useAuth } from '../../context/AuthContext'
import AccountDropdown from './AccountDropdown'

export default function Navbar({
  onOpenSearch,
  onOpenMobileMenu,
  onSelectCategory,
}) {
  const location = useLocation()
  const isShop = location.pathname === '/shop'
  const isHome = location.pathname === '/'
  const isAbout = location.pathname === '/about'
  const isContact = location.pathname === '/contact'
  const [isScrolled, setIsScrolled] = useState(false)
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false)
  const [isAccountOpen, setIsAccountOpen] = useState(false)

  const { totalItems, openCart } = useCart()
  const { wishlistCount } = useWishlist()
  const { user, isAuthenticated } = useAuth()

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true)
      } else {
        setIsScrolled(false)
      }
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-all duration-300 ${
        isScrolled
          ? 'bg-[#103321]/95 backdrop-blur-md shadow-lg shadow-black/10 py-3'
          : 'bg-[#103321] py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          {/* Left: Mobile hamburger + Brand Identity */}
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={onOpenMobileMenu}
              className="lg:hidden p-2 rounded-lg text-white/90 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Open mobile navigation menu"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* ibtu Brand Logo & Name */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-full overflow-hidden border-2 border-[#95C623] shadow-sm bg-white p-0.5 transition-transform duration-300 group-hover:scale-105">
                <img
                  src="/src/assets/logo.jpg"
                  alt="ibtu Logo"
                  className="w-full h-full object-cover rounded-full"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                  }}
                />
              </div>

              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-sans text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-none">
                    ibtu
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#95C623]" />
                </div>
                <span className="text-[10px] sm:text-xs text-[#95C623] font-medium tracking-widest uppercase">
                  ሀበሻን ጥበብ
                </span>
              </div>
            </Link>
          </div>

          {/* Center: Desktop Navigation links */}
          <nav className="hidden lg:flex items-center gap-8">
            <Link
              to="/"
              className={`text-sm font-medium transition-colors relative py-1 ${
                isHome
                  ? 'text-white after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-[#95C623] after:scale-x-100'
                  : 'text-white/90 hover:text-[#95C623]'
              }`}
            >
              Home
            </Link>

            <Link
              to="/shop"
              className={`text-sm font-medium transition-colors relative py-1 ${
                isShop
                  ? 'text-[#95C623] after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-[#95C623]'
                  : 'text-white/90 hover:text-[#95C623]'
              }`}
            >
              Shop
            </Link>

            {/* Categories dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setIsCategoriesOpen(true)}
              onMouseLeave={() => setIsCategoriesOpen(false)}
            >
              <button
                className="flex items-center gap-1.5 text-sm font-medium text-white/90 hover:text-[#95C623] transition-colors py-1 cursor-pointer"
                aria-expanded={isCategoriesOpen}
              >
                <span>Categories</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    isCategoriesOpen ? 'rotate-180 text-[#95C623]' : ''
                  }`}
                />
              </button>

              {/* Dropdown Menu */}
              {isCategoriesOpen && (
                <div className="absolute top-full -left-4 pt-2 w-72 animate-fadeIn z-50">
                  <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-3 text-[#1A1A1A]">
                    <div className="px-3 py-2 border-b border-gray-100 flex items-center justify-between">
                      <span className="text-xs uppercase font-bold text-[#103321] tracking-wider">
                        Fashion Collections
                      </span>
                      <span className="text-[11px] text-[#95C623] font-semibold">
                        ሀበሻ ልብሶች
                      </span>
                    </div>

                    <div className="mt-1 space-y-1">
                      {categories.map((cat) => (
                        <a
                          key={cat.id}
                          href={`#category-${cat.slug}`}
                          onClick={() => {
                            if (onSelectCategory) onSelectCategory(cat.slug)
                            setIsCategoriesOpen(false)
                          }}
                          className="flex items-center gap-3 p-2 rounded-xl hover:bg-[#95C623]/10 hover:text-[#103321] transition-all group"
                        >
                          <img
                            src={cat.image}
                            alt={cat.name}
                            className="w-10 h-10 rounded-lg object-cover group-hover:scale-105 transition-transform"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-gray-900 group-hover:text-[#103321] truncate">
                              {cat.name}
                            </p>
                            <p className="text-[10px] text-gray-500">{cat.amharicName}</p>
                          </div>
                          <span className="text-[10px] bg-gray-100 group-hover:bg-[#95C623]/30 px-2 py-0.5 rounded-full font-medium text-gray-600">
                            {cat.itemCount}
                          </span>
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Link
              to="/about"
              className={`text-sm font-medium transition-colors relative py-1 ${
                isAbout
                  ? 'text-white after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-[#95C623]'
                  : 'text-white/90 hover:text-[#95C623]'
              }`}
            >
              About
            </Link>

            <Link
              to="/contact"
              className={`text-sm font-medium transition-colors relative py-1 ${
                isContact
                  ? 'text-white after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-[#95C623]'
                  : 'text-white/90 hover:text-[#95C623]'
              }`}
            >
              Contact
            </Link>
          </nav>

          {/* Right: Actions (Search, Wishlist, Cart, Account) */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search Button */}
            <button
              onClick={onOpenSearch}
              className="p-2 sm:p-2.5 rounded-full text-white/90 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Search products"
              title="Search collection"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Wishlist Button */}
            <Link
              to="/wishlist"
              className={`p-2 sm:p-2.5 rounded-full transition-colors relative cursor-pointer ${
                location.pathname === '/wishlist'
                  ? 'text-[#95C623] bg-white/10'
                  : 'text-white/90 hover:text-white hover:bg-white/10'
              }`}
              aria-label="View wishlist"
              title="Saved items"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-[#95C623] text-[#103321] text-[10px] font-bold rounded-full flex items-center justify-center animate-scaleIn">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Shopping Cart Button */}
            <button
              onClick={openCart}
              className="p-2 sm:p-2.5 rounded-full text-white/90 hover:text-white hover:bg-white/10 transition-colors relative cursor-pointer"
              aria-label="Open shopping cart"
              title="Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-[#95C623] text-[#103321] text-[10px] font-bold rounded-full flex items-center justify-center shadow-xs animate-scaleIn">
                  {totalItems}
                </span>
              )}
            </button>

            {/* Customer Account Button */}
            <div className="relative">
              {isAuthenticated ? (
                <>
                  <button
                    onClick={() => setIsAccountOpen(!isAccountOpen)}
                    className="p-2 sm:p-2.5 rounded-full text-white/90 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                    aria-label="Customer account"
                    title={user?.name || 'Account'}
                  >
                    <User className="w-5 h-5" />
                  </button>

                  <AccountDropdown
                    isOpen={isAccountOpen}
                    onClose={() => setIsAccountOpen(false)}
                  />
                </>
              ) : (
                <Link
                  to="/login"
                  className={`p-2 sm:p-2.5 rounded-full transition-colors cursor-pointer block ${
                    location.pathname === '/login'
                      ? 'text-[#95C623] bg-white/10'
                      : 'text-white/90 hover:text-white hover:bg-white/10'
                  }`}
                  aria-label="Sign in"
                  title="Sign In"
                >
                  <User className="w-5 h-5" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
