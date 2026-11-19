import { useState } from 'react'
import { Link } from 'react-router-dom'
import { User, LogIn, UserPlus, Package, Heart, LogOut, X, Sparkles, ExternalLink } from 'lucide-react'
import Button from '../common/Button'
import { useAuth } from '../../context/AuthContext'

export default function AccountDropdown({ isOpen, onClose }) {
  const { user, isAuthenticated, login, register, logout } = useAuth()
  const [activeTab, setActiveTab] = useState('login') // 'login' | 'register'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [formError, setFormError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  if (!isOpen) return null

  const handleLoginSubmit = async (e) => {
    e.preventDefault()
    setFormError(null)
    setSubmitting(true)

    if (activeTab === 'login') {
      const res = await login({ email, password })
      setSubmitting(false)
      if (res.success) {
        onClose()
      } else {
        setFormError(res.message || res.error || 'Invalid credentials.')
      }
    } else {
      const parts = name.trim().split(' ')
      const firstName = parts[0] || 'Customer'
      const lastName = parts.slice(1).join(' ') || 'ibtu'
      const res = await register({
        firstName,
        lastName,
        email,
        phone: '+251 91 000 0000',
        password,
      })
      setSubmitting(false)
      if (res.success) {
        onClose()
      } else {
        setFormError(res.message || res.error || 'Registration failed.')
      }
    }
  }

  const handleLogout = () => {
    logout()
    setEmail('')
    setPassword('')
    setName('')
  }

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 p-5 z-50 text-[#1A1A1A] animate-fadeIn">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#103321] text-[#95C623] flex items-center justify-center font-bold text-xs">
              {isAuthenticated && user?.avatar ? (
                user.avatar
              ) : (
                <User className="w-4 h-4" />
              )}
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#103321]">
                {isAuthenticated ? (user.name || user.firstName) : 'Welcome to ibtu'}
              </h3>
              <p className="text-[11px] text-gray-500">
                {isAuthenticated ? user.email : 'ሀበሻን ጥበብ የፋሽን መድረክ'}
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

        {isAuthenticated ? (
          <div className="pt-4 space-y-2">
            <div className="bg-[#95C623]/10 p-3 rounded-xl flex items-center gap-2 text-xs text-[#103321] font-medium">
              <Sparkles className="w-4 h-4 text-[#95C623] shrink-0" />
              <span>ibtu Customer Member: Enjoy exclusive Ethiopian fashion perks!</span>
            </div>

            <nav className="pt-2 space-y-1 text-sm font-medium">
              <Link
                to="/account"
                onClick={onClose}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-gray-50 text-gray-700 hover:text-[#103321]"
              >
                <User className="w-4 h-4 text-[#95C623]" />
                <span className="font-bold text-[#103321]">Account Dashboard</span>
              </Link>
              <Link
                to="/account/orders"
                onClick={onClose}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-gray-50 text-gray-700 hover:text-[#103321]"
              >
                <Package className="w-4 h-4 text-gray-400" />
                <span>My Orders</span>
              </Link>
              <Link
                to="/wishlist"
                onClick={onClose}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-gray-50 text-gray-700 hover:text-[#103321]"
              >
                <Heart className="w-4 h-4 text-gray-400" />
                <span>Saved Wishlist</span>
              </Link>
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
                onClick={() => { setActiveTab('login'); setFormError(null) }}
                className={`flex-1 py-1.5 rounded-md transition-all cursor-pointer ${
                  activeTab === 'login'
                    ? 'bg-white text-[#103321] shadow-xs'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => { setActiveTab('register'); setFormError(null) }}
                className={`flex-1 py-1.5 rounded-md transition-all cursor-pointer ${
                  activeTab === 'register'
                    ? 'bg-white text-[#103321] shadow-xs'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                Create Account
              </button>
            </div>

            {formError && (
              <div className="p-2.5 mb-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-[11px]">
                {formError}
              </div>
            )}

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
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-medium text-gray-700">
                    Password
                  </label>
                  {activeTab === 'login' && (
                    <Link
                      to="/forgot-password"
                      onClick={onClose}
                      className="text-[10px] text-[#103321] hover:text-[#95C623] underline"
                    >
                      Forgot?
                    </Link>
                  )}
                </div>
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
                disabled={submitting}
              >
                {submitting
                  ? 'Processing...'
                  : activeTab === 'login'
                  ? 'Sign In to ibtu'
                  : 'Create Free Account'}
              </Button>
            </form>

            <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-center">
              <Link
                to={activeTab === 'login' ? '/login' : '/register'}
                onClick={onClose}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#103321] hover:text-[#95C623] transition-colors"
              >
                <span>{activeTab === 'login' ? 'Open Full Login Page' : 'Open Full Registration Page'}</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
