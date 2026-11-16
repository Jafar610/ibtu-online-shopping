import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, ArrowLeft, Send, CheckCircle2 } from 'lucide-react'
import AuthLayout from '../../components/auth/AuthLayout'
import AuthInput from '../../components/auth/AuthInput'
import AuthButton from '../../components/auth/AuthButton'
import AuthNotification from '../../components/auth/AuthNotification'
import { authService } from '../../services/authService'
import logoImg from '../../assets/logo.jpg'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [sentEmail, setSentEmail] = useState('')

  const validate = () => {
    if (!email.trim()) {
      setError('Email address is required.')
      return false
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Please enter a valid email address.')
      return false
    }
    setError(null)
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (loading) return
    if (!validate()) return

    setLoading(true)
    try {
      await authService.forgotPassword(email)
      setSentEmail(email.trim())
      setSubmitted(true)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setLoading(true)
    try {
      await authService.forgotPassword(sentEmail)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout subtitle="Need help accessing your ibtu account? Enter your email and we'll help you get back to shopping authentic Ethiopian fashion.">
      <div className="space-y-6">
        {/* Header with IBTU Logo */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#95C623] bg-white p-0.5 mx-auto shadow-xs">
            <img src={logoImg} alt="ibtu logo" className="w-full h-full object-cover rounded-full" />
          </div>
          <div>
            <h1 className="font-serif text-2xl font-bold text-[#103321]">
              Forgot Your Password?
            </h1>
            <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto">
              Enter your registered email address and we'll send you instructions to reset your password.
            </p>
          </div>
        </div>

        {error && (
          <AuthNotification
            type="error"
            message={error}
            onClose={() => setError(null)}
          />
        )}

        {submitted ? (
          <div className="p-6 bg-[#95C623]/10 rounded-2xl border border-[#95C623]/30 text-center space-y-4 animate-scaleIn">
            <div className="w-12 h-12 rounded-full bg-[#95C623]/25 flex items-center justify-center mx-auto text-[#103321]">
              <CheckCircle2 className="w-6 h-6 text-[#103321]" />
            </div>

            <div>
              <h3 className="font-serif text-lg font-bold text-[#103321]">
                Request Validated
              </h3>
              <p className="text-xs text-gray-600 mt-1.5 leading-relaxed">
                Email address confirmed for <strong className="text-[#103321]">{sentEmail}</strong>.
              </p>
              <div className="mt-2.5 p-3 rounded-xl bg-white/70 border border-[#95C623]/30 text-left text-[11px] text-gray-700 space-y-1">
                <p className="font-semibold text-[#103321]">ℹ Frontend Demonstration Note:</p>
                <p>
                  Backend email delivery is not yet connected in this milestone, so no real email was dispatched. When the backend mailing service is configured, secure reset tokens will be emailed to customer accounts.
                </p>
              </div>
            </div>

            {/* Link to Reset Page directly for convenience during frontend routing testing */}
            <div className="pt-2">
              <Link
                to={`/reset-password?email=${encodeURIComponent(sentEmail)}`}
                className="inline-block text-xs font-bold text-[#103321] bg-[#95C623] px-4 py-2.5 rounded-xl hover:bg-[#82ad1e] transition-colors"
              >
                Test Reset Password Page Route →
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <AuthInput
              label="Email Address"
              id="forgot-email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                if (error) setError(null)
              }}
              placeholder="almaz@example.com"
              icon={Mail}
              error={error}
              required
              autoComplete="email"
            />

            <AuthButton
              type="submit"
              variant="forest"
              loading={loading}
              icon={Send}
            >
              Send Reset Link
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
