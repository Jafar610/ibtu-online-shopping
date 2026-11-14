import { useState } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { KeyRound, ArrowLeft, CheckCircle2 } from 'lucide-react'
import AuthLayout from '../../components/auth/AuthLayout'
import PasswordInput from '../../components/auth/PasswordInput'
import PasswordStrengthIndicator from '../../components/auth/PasswordStrengthIndicator'
import AuthButton from '../../components/auth/AuthButton'
import AuthNotification from '../../components/auth/AuthNotification'
import { authService } from '../../services/authService'
import logoImg from '../../assets/logo.jpg'

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const emailFromUrl = searchParams.get('email') || ''

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [notification, setNotification] = useState(null)
  const [resetSuccess, setResetSuccess] = useState(false)

  const validate = () => {
    const errs = {}

    if (!password) {
      errs.password = 'New password is required.'
    } else if (password.length < 6) {
      errs.password = 'Password must be at least 6 characters.'
    }

    if (!confirmPassword) {
      errs.confirmPassword = 'Confirm your new password.'
    } else if (password !== confirmPassword) {
      errs.confirmPassword = 'Passwords do not match.'
    }

    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setNotification(null)

    if (!validate()) return

    setLoading(true)
    try {
      await authService.resetPassword({
        email: emailFromUrl,
        newPassword: password,
      })
      setResetSuccess(true)
    } catch (err) {
      setNotification({
        type: 'error',
        message: err.message || 'Failed to reset password. Please try again.',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout subtitle="Set a secure new password for your ibtu account to continue shopping premium Ethiopian traditional & modern fashion.">
      <div className="space-y-6">
        {/* Header with IBTU Logo */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#95C623] bg-white p-0.5 mx-auto shadow-xs">
            <img src={logoImg} alt="ibtu logo" className="w-full h-full object-cover rounded-full" />
          </div>
          <div>
            <h1 className="font-serif text-2xl font-bold text-[#103321]">
              Set New Password
            </h1>
            <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto">
              Please create a strong new password for your customer account.
            </p>
          </div>
        </div>

        {notification && (
          <AuthNotification
            type={notification.type}
            message={notification.message}
            onClose={() => setNotification(null)}
          />
        )}

        {resetSuccess ? (
          <div className="p-6 bg-[#95C623]/10 rounded-2xl border border-[#95C623]/30 text-center space-y-4 animate-scaleIn">
            <div className="w-12 h-12 rounded-full bg-[#95C623]/25 flex items-center justify-center mx-auto text-[#103321]">
              <CheckCircle2 className="w-6 h-6 text-[#103321]" />
            </div>

            <div>
              <h3 className="font-serif text-lg font-bold text-[#103321]">
                Password Reset Successfully!
              </h3>
              <p className="text-xs text-gray-600 mt-1.5 leading-relaxed">
                Your account password has been updated. You can now sign in with your new credentials.
              </p>
            </div>

            <button
              onClick={() => navigate('/login')}
              className="w-full py-3 rounded-xl bg-[#103321] text-white font-bold text-xs sm:text-sm hover:bg-[#184a30] transition-colors cursor-pointer"
            >
              Sign In to Your Account
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <PasswordInput
                label="New Password"
                id="reset-password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  if (errors.password) setErrors((prev) => ({ ...prev, password: null }))
                }}
                placeholder="At least 6 characters"
                error={errors.password}
                required
                autoComplete="new-password"
              />
              <PasswordStrengthIndicator password={password} />
            </div>

            <PasswordInput
              label="Confirm New Password"
              id="reset-confirm-password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value)
                if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: null }))
              }}
              placeholder="Re-enter your new password"
              error={errors.confirmPassword}
              required
              autoComplete="new-password"
            />

            <AuthButton
              type="submit"
              variant="forest"
              loading={loading}
              icon={KeyRound}
            >
              Update Password
            </AuthButton>
          </form>
        )}

        {/* Back to login */}
        <div className="border-t border-gray-100 pt-4 text-center">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:text-[#103321] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Sign In</span>
          </Link>
        </div>
      </div>
    </AuthLayout>
  )
}
