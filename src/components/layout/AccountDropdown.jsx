import { useState } from 'react'
import { User, LogIn, UserPlus, Package, Heart, LogOut, X, Sparkles } from 'lucide-react'
import Button from '../common/Button'

export default function AccountDropdown({ isOpen, onClose }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [activeTab, setActiveTab] = useState('login') // 'login' | 'register'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [userProfile, setUserProfile] = useState({
    name: 'Almaz Bekele',
    email: 'almaz.b@example.com',
  })

  if (!isOpen) return null

  const handleLoginSubmit = (e) => {
    e.preventDefault()
    setIsLoggedIn(true)
    if (name) {
      setUserProfile({ name, email })
    }
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    setEmail('')
    setPassword('')
  }

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 p-5 z-50 text-[#1A1A1A] animate-fadeIn">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#103321] text-[#95C623] flex items-center justify-center font-bold">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#103321]">
                {isLoggedIn ? userProfile.name : 'Welcome to ibtu'}
              </h3>
              <p className="text-[11px] text-gray-500">
                {isLoggedIn ? userProfile.email : 'ሀበሻን ጥበብ የፋሽን መድረክ'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {isLoggedIn ? (
          <div className="pt-4 space-y-2">
            <div className="bg-[#95C623]/10 p-3 rounded-xl flex items-center gap-2 text-xs text-[#103321] font-medium">
              <Sparkles className="w-4 h-4 text-[#95C623] shrink-0" />
              <span>ibtu VIP Member: Enjoy 10% off your next purchase!</span>
            </div>

            <nav className="pt-2 space-y-1 text-sm font-medium">
              <a
                href="#orders"
                onClick={onClose}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-gray-50 text-gray-700 hover:text-[#103321]"
              >
                <Package className="w-4 h-4 text-gray-400" />
                <span>My Orders & Tracking</span>
              </a>
              <a
                href="#wishlist"
                onClick={onClose}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-gray-50 text-gray-700 hover:text-[#103321]"
              >
                <Heart className="w-4 h-4 text-gray-400" />
                <span>Saved Wishlist</span>
              </a>
            </nav>

            <div className="pt-3 border-t border-gray-100">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 text-xs text-red-600 hover:text-red-700 py-2 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="pt-4">
            {/* Tabs */}
            <div className="flex bg-gray-100 p-1 rounded-lg text-xs font-semibold mb-4">
              <button
                onClick={() => setActiveTab('login')}
                className={`flex-1 py-1.5 rounded-md transition-all cursor-pointer ${
                  activeTab === 'login'
                    ? 'bg-white text-[#103321] shadow-xs'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => setActiveTab('register')}
                className={`flex-1 py-1.5 rounded-md transition-all cursor-pointer ${
                  activeTab === 'register'
                    ? 'bg-white text-[#103321] shadow-xs'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                Create Account
              </button>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-3">
              {activeTab === 'register' && (
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Almaz Bekele"
                    className="w-full text-xs px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-[#103321]"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full text-xs px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-[#103321]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-xs px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-[#103321]"
                />
              </div>

              <Button
                type="submit"
                variant="forest"
                size="sm"
                className="w-full mt-2"
                icon={activeTab === 'login' ? LogIn : UserPlus}
              >
                {activeTab === 'login' ? 'Sign In to ibtu' : 'Create Free Account'}
              </Button>
            </form>

            <p className="text-[11px] text-center text-gray-400 mt-3">
              Secured with Ethiopian fashion authentication
            </p>
          </div>
        )}
      </div>
    </>
  )
}

