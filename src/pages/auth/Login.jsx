import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Mail, LogIn, Sparkles } from 'lucide-react'
import AuthLayout from '../../components/auth/AuthLayout'
import AuthInput from '../../components/auth/AuthInput'
import PasswordInput from '../../components/auth/PasswordInput'
import AuthButton from '../../components/auth/AuthButton'
import AuthNotification from '../../components/auth/AuthNotification'
import { useAuth } from '../../context/AuthContext'
import logoImg from '../../assets/logo.jpg'

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, isAuthenticated } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [notification, setNotification] = useState(null)

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || '/'
      navigate(from, { replace: true })
    }
  }, [isAuthenticated, navigate, location])

  const validate = () => {
    const errs = {}
    if (!email.trim()) {
      errs.email = 'Email address is required.'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errs.email = 'Please enter a valid email address.'
    }

    if (!password) {
      errs.password = 'Password is required.'
    } else if (password.length < 6) {
      errs.password = 'Password must be at least 6 characters.'
    }

    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (loading) return
    setNotification(null)

    if (!validate()) return

    setLoading(true)
    const result = await login({ email, password, rememberMe })
    setLoading(false)

    if (result.isDemo) {
      setNotification({
        type: 'info',
        message: result.message,
      })
    } else if (result.success) {
      setNotification({
        type: 'success',
        message: `Welcome back, ${result.user?.name || result.user?.firstName || 'Customer'}! Redirecting...`,
      })
      setTimeout(() => {
        const from = location.state?.from?.pathname || '/'
        navigate(from, { replace: true })
      }, 700)
    } else {
      setNotification({
        type: 'error',
        message: result.error || 'Invalid email or password. Please try again.',
      })
    }
  }

  // Helper for quick testing with sample customer
  const handleFillDemo = () => {
    setEmail('customer@ibtu.com')
    setPassword('password123')
    setErrors({})
    setNotification({
      type: 'success',
      message: 'Demo credentials loaded! Click "Sign In" below.',
    })
  }

  return (
    <AuthLayout subtitle="Welcome back! Access your orders, saved items, and personalized Ethiopian fashion recommendations.">
      <div className="space-y-6">
        {/* Header with IBTU Logo */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#95C623] bg-white p-0.5 mx-auto shadow-xs">
            <img src={logoImg} alt="ibtu logo" className="w-full h-full object-cover rounded-full" />
          </div>
          <div>
            <h1 className="font-serif text-2xl font-bold text-[#103321]">
              Welcome Back
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              Sign in to continue your shopping experience.
            </p>
          </div>
        </div>

        {/* Notification Alert */}
        {notification && (
          <AuthNotification
            type={notification.type}
            message={notification.message}
            onClose={() => setNotification(null)}
          />
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <AuthInput
            label="Email Address"
            id="login-email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              if (errors.email) setErrors((prev) => ({ ...prev, email: null }))
            }}
            placeholder="almaz@example.com"
            icon={Mail}
            error={errors.email}
            required
            autoComplete="email"
          />

          <div className="space-y-1">
            <PasswordInput
              label="Password"
              id="login-password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                if (errors.password) setErrors((prev) => ({ ...prev, password: null }))
              }}
              placeholder="••••••••"
              error={errors.password}
              required
              autoComplete="current-password"
            />

            <div className="flex items-center justify-between pt-1 text-xs">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-[#95C623] focus:ring-[#95C623] cursor-pointer"
                />
                <span className="text-gray-600 group-hover:text-gray-900 transition-colors">
                  Remember me
                </span>
              </label>

              <Link
                to="/forgot-password"
                className="font-semibold text-[#103321] hover:text-[#95C623] transition-colors"
              >
                Forgot Password?
              </Link>
            </div>
          </div>

          <AuthButton
            type="submit"
            variant="forest"
            loading={loading}
            icon={LogIn}
          >
            Sign In to ibtu
          </AuthButton>
        </form>

        {/* Demo Account Helper */}
        <div className="p-3 bg-[#95C623]/10 rounded-2xl border border-[#95C623]/25 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs text-[#103321]">
            <Sparkles className="w-4 h-4 text-[#95C623] shrink-0" />
            <span className="font-semibold">Quick testing?</span>
          </div>
          <button
            type="button"
            onClick={handleFillDemo}
            className="text-xs font-bold text-[#103321] hover:text-[#95C623] underline cursor-pointer transition-colors"
          >
            Auto-fill demo customer
          </button>
        </div>

        {/* Divider */}
        <div className="relative border-t border-gray-100 pt-4 text-center">
          <p className="text-xs text-gray-500">
            Don't have an account yet?{' '}
            <Link
              to="/register"
              className="font-bold text-[#103321] hover:text-[#95C623] transition-colors underline underline-offset-2"
            >
              Create an Account
            </Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  )
}
