import { useState } from 'react'
import { Mail, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react'
import Button from '../common/Button'

export default function Newsletter() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('idle') // 'idle' | 'success' | 'error'
  const [errorMessage, setErrorMessage] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email || !emailRegex.test(email.trim())) {
      setStatus('error')
      setErrorMessage('Please enter a valid email address (e.g. name@example.com)')
      return
    }

    setStatus('success')
    setErrorMessage('')
  }

  return (
    <section id="newsletter" className="py-16 sm:py-24 bg-[#F8F9FA] relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#95C623]/20 text-[#103321] text-xs font-bold uppercase tracking-wider mb-4">
          <Sparkles className="w-3.5 h-3.5 text-[#95C623]" />
          <span>Cultural Fashion Digest</span>
        </div>

        <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#103321] tracking-tight">
          Stay Inspired with ibtu
        </h2>
        <p className="text-sm text-[#95C623] font-semibold tracking-wide mt-1">
          ከኢብቱ ጋር አዳዲስ የፋሽን ጥበባትን ይከታተሉ
        </p>

        <p className="mt-3 text-sm sm:text-base text-gray-600 max-w-xl mx-auto leading-relaxed">
          Subscribe to receive new collection updates, exclusive offers, and Ethiopian fashion inspiration directly in your inbox.
        </p>

        {/* Subscription Form */}
        <div className="mt-8 max-w-md mx-auto">
          {status === 'success' ? (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-6 rounded-2xl flex flex-col items-center gap-2 animate-scaleIn">
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
              <h3 className="font-serif font-bold text-base">You're Subscribed!</h3>
              <p className="text-xs text-emerald-700">
                Ameseginalehu! Check your email for a special 10% welcome voucher on your first Habesha dress.
              </p>
              <button
                onClick={() => {
                  setStatus('idle')
                  setEmail('')
                }}
                className="mt-2 text-xs font-semibold underline text-emerald-800 hover:text-emerald-950 cursor-pointer"
              >
                Subscribe another email
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Mail className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    if (status === 'error') setStatus('idle')
                  }}
                  placeholder="Enter your email address..."
                  className={`w-full pl-12 pr-4 py-3.5 bg-white text-sm text-[#1A1A1A] placeholder-gray-400 rounded-full border shadow-xs focus:outline-none transition-all ${
                    status === 'error'
                      ? 'border-red-400 focus:border-red-500 ring-2 ring-red-100'
                      : 'border-gray-200 focus:border-[#103321] ring-2 ring-transparent focus:ring-[#103321]/10'
                  }`}
                />
              </div>

              <Button
                type="submit"
                variant="forest"
                size="md"
                className="px-7 py-3.5 font-bold shadow-md shadow-[#103321]/15"
              >
                Subscribe
              </Button>
            </form>
          )}

          {status === 'error' && (
            <div className="flex items-center justify-center gap-1.5 text-xs text-red-600 font-medium mt-2 animate-fadeIn">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <p className="text-[11px] text-gray-400 mt-4">
            We value your privacy. Unsubscribe anytime with a single click.
          </p>
        </div>
      </div>
    </section>
  )
}

