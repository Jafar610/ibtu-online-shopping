import { useState } from 'react'
import { Tag, CheckCircle2, AlertCircle, X } from 'lucide-react'
import { useCheckout } from '../../context/CheckoutContext'

export default function CouponInput() {
  const { appliedCoupon, applyCoupon, removeCoupon } = useCheckout()
  const [couponCode, setCouponCode] = useState('')
  const [feedback, setFeedback] = useState(null)

  const handleApply = (e) => {
    e.preventDefault()
    if (!couponCode.trim()) return

    const res = applyCoupon(couponCode)
    setFeedback({
      type: res.success ? 'success' : 'error',
      message: res.message,
    })

    if (res.success) {
      setCouponCode('')
    }
  }

  const handleRemove = () => {
    removeCoupon()
    setFeedback(null)
  }

  return (
    <div className="space-y-3 pt-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
          <Tag className="w-3.5 h-3.5 text-[#95C623]" />
          <span>Have a Promo Code or Voucher?</span>
        </label>
        <span className="text-[11px] text-gray-400">e.g. HABESHA10</span>
      </div>

      {appliedCoupon ? (
        <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between gap-2 animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <div>
              <span className="font-mono font-bold text-xs text-emerald-900 block">
                {appliedCoupon.code}
              </span>
              <span className="text-[11px] text-emerald-700">
                {appliedCoupon.description}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="p-1 rounded-lg hover:bg-emerald-100 text-emerald-700 transition-colors cursor-pointer"
            title="Remove coupon"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <form onSubmit={handleApply} className="flex gap-2">
          <input
            type="text"
            value={couponCode}
            onChange={(e) => {
              setCouponCode(e.target.value.toUpperCase())
              setFeedback(null)
            }}
            placeholder="Enter coupon code..."
            className="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-xs font-mono uppercase focus:outline-hidden focus:border-[#103321] focus:ring-1 focus:ring-[#103321] bg-gray-50/50"
          />
          <button
            type="submit"
            disabled={!couponCode.trim()}
            className="px-4 py-2 rounded-xl bg-[#103321] text-white hover:bg-[#95C623] hover:text-[#103321] text-xs font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shrink-0"
          >
            Apply
          </button>
        </form>
      )}

      {/* Feedback Alert */}
      {feedback && (
        <p
          className={`text-[11px] flex items-center gap-1.5 animate-fadeIn ${
            feedback.type === 'success' ? 'text-emerald-700' : 'text-red-600'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-3 h-3 shrink-0" />
          ) : (
            <AlertCircle className="w-3 h-3 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </p>
      )}
    </div>
  )
}
