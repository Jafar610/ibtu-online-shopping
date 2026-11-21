import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { User, Mail, Phone, UserPlus } from 'lucide-react'
import AuthLayout from '../../components/auth/AuthLayout'
import AuthInput from '../../components/auth/AuthInput'
import PasswordInput from '../../components/auth/PasswordInput'
import PasswordStrengthIndicator from '../../components/auth/PasswordStrengthIndicator'
import AuthButton from '../../components/auth/AuthButton'
import AuthNotification from '../../components/auth/AuthNotification'
import { useAuth } from '../../context/AuthContext'
import logoImg from '../../assets/logo.jpg'

export default function Register() {
  const navigate = useNavigate()
  const { register, isAuthenticated } = useAuth()

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false,
  })

  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [notification, setNotification] = useState(null)

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/account', { replace: true })
    }
  }, [isAuthenticated, navigate])

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }))
    }
  }

  const validate = () => {
    const errs = {}

    if (!formData.firstName.trim()) {
      errs.firstName = 'First name is required.'
    } else if (formData.firstName.trim().length < 2) {
      errs.firstName = 'First name must be at least 2 characters.'
    }

    if (!formData.lastName.trim()) {
      errs.lastName = 'Last name is required.'
    } else if (formData.lastName.trim().length < 2) {
      errs.lastName = 'Last name must be at least 2 characters.'
    }

    if (!formData.email.trim()) {
      errs.email = 'Email address is required.'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errs.email = 'Please enter a valid email address.'
    }

    if (formData.phone && formData.phone.trim()) {
      if (!/^[+]?[0-9\s\-()]{7,25}$/.test(formData.phone.trim())) {
        errs.phone = 'Please enter a valid phone number (e.g. +251 91 122 3344).'
      }
    }

    if (!formData.password) {
      errs.password = 'Password is required.'
    } else if (formData.password.length < 8) {
      errs.password = 'Password must be at least 8 characters long.'
    } else if (!/[A-Z]/.test(formData.password)) {
      errs.password = 'Password must contain at least one uppercase letter.'
    } else if (!/[a-z]/.test(formData.password)) {
      errs.password = 'Password must contain at least one lowercase letter.'
    } else if (!/[0-9]/.test(formData.password)) {
      errs.password = 'Password must contain at least one number.'
    }

    if (!formData.confirmPassword) {
      errs.confirmPassword = 'Confirm your password.'
    } else if (formData.password !== formData.confirmPassword) {
      errs.confirmPassword = 'Passwords do not match.'
    }

    if (!formData.agreeTerms) {
      errs.agreeTerms = 'You must agree to the Terms & Conditions.'
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
    const result = await register({
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      password: formData.password,
      confirmPassword: formData.confirmPassword,
    })
    setLoading(false)

    if (result.success) {
      setNotification({
        type: 'success',
        message: `Account created successfully! Welcome to ibtu, ${result.user?.firstName || 'Customer'}! Redirecting...`,
      })
      setTimeout(() => {
        navigate('/account', { replace: true })
      }, 900)
    } else {
      if (Array.isArray(result.errors) && result.errors.length > 0) {
        const fieldErrs = {}
        result.errors.forEach((err) => {
          // Map backend field names (first_name -> firstName, confirm_password -> confirmPassword)
          let key = err.field
          if (key === 'first_name') key = 'firstName'
          if (key === 'last_name') key = 'lastName'
          if (key === 'confirm_password') key = 'confirmPassword'
          fieldErrs[key] = err.message
        })
        setErrors((prev) => ({ ...prev, ...fieldErrs }))
      }

      setNotification({
        type: 'error',
        message: result.error || 'Registration failed. Please check your details and try again.',
      })
    }
  }

  return (
    <AuthLayout subtitle="Create your free ibtu customer account to enjoy tailored recommendations, track cultural orders, and access exclusive collection launches.">
      <div className="space-y-6">
        {/* Header with IBTU Logo */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#95C623] bg-white p-0.5 mx-auto shadow-xs">
            <img src={logoImg} alt="ibtu logo" className="w-full h-full object-cover rounded-full" />
          </div>
          <div>
            <h1 className="font-serif text-2xl font-bold text-[#103321]">
              Create Customer Account
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              Join the ibtu family and celebrate Ethiopian heritage with style.
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

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* First & Last Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <AuthInput
              label="First Name"
              id="register-first-name"
              type="text"
              value={formData.firstName}
              onChange={(e) => handleChange('firstName', e.target.value)}
              placeholder="e.g. Almaz"
              icon={User}
              error={errors.firstName}
              required
              autoComplete="given-name"
            />

            <AuthInput
              label="Last Name"
              id="register-last-name"
              type="text"
              value={formData.lastName}
              onChange={(e) => handleChange('lastName', e.target.value)}
              placeholder="e.g. Bekele"
              icon={User}
              error={errors.lastName}
              required
              autoComplete="family-name"
            />
          </div>

          {/* Email */}
          <AuthInput
            label="Email Address"
            id="register-email"
            type="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            placeholder="almaz@example.com"
            icon={Mail}
            error={errors.email}
            required
            autoComplete="email"
          />

          {/* Phone */}
          <AuthInput
            label="Phone Number"
            id="register-phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            placeholder="+251 91 122 3344"
            icon={Phone}
            error={errors.phone}
            autoComplete="tel"
          />

          {/* Password */}
          <div className="space-y-2">
            <PasswordInput
              label="Password"
              id="register-password"
              value={formData.password}
              onChange={(e) => handleChange('password', e.target.value)}
              placeholder="Min. 8 chars (uppercase, lowercase, number)"
              error={errors.password}
              required
              autoComplete="new-password"
            />
            <PasswordStrengthIndicator password={formData.password} />
          </div>

          {/* Confirm Password */}
          <PasswordInput
            label="Confirm Password"
            id="register-confirm-password"
            value={formData.confirmPassword}
            onChange={(e) => handleChange('confirmPassword', e.target.value)}
            placeholder="Re-enter your password"
            error={errors.confirmPassword}
            required
            autoComplete="new-password"
          />

          {/* Terms Agreement */}
          <div>
            <label className="flex items-start gap-2.5 cursor-pointer group">
              <input
                type="checkbox"
                checked={formData.agreeTerms}
                onChange={(e) => handleChange('agreeTerms', e.target.checked)}
                className="w-4 h-4 mt-0.5 rounded border-gray-300 text-[#95C623] focus:ring-[#95C623] cursor-pointer"
              />
              <span className="text-xs text-gray-600 leading-relaxed group-hover:text-gray-900 transition-colors">
                I agree to the{' '}
                <Link to="/about" className="font-semibold text-[#103321] hover:underline">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link to="/about" className="font-semibold text-[#103321] hover:underline">
                  Privacy Policy
                </Link>
                .
              </span>
            </label>
            {errors.agreeTerms && (
              <p className="text-[11px] text-rose-500 mt-1 font-medium">{errors.agreeTerms}</p>
            )}
          </div>

          <AuthButton
            type="submit"
            variant="forest"
            loading={loading}
            icon={UserPlus}
          >
            Create Customer Account
          </AuthButton>
        </form>

        {/* Divider */}
        <div className="relative border-t border-gray-100 pt-4 text-center">
          <p className="text-xs text-gray-500">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-bold text-[#103321] hover:text-[#95C623] transition-colors underline underline-offset-2"
            >
              Sign In Instead
            </Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  )
}
