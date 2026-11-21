import { useState, useEffect } from 'react'
import { X, Tag, Percent, Coins, Calendar, FileText, CheckCircle2 } from 'lucide-react'

export default function CouponFormModal({
  isOpen,
  onClose,
  onSubmit,
  coupon = null, // null for create, object for edit
}) {
  const isEdit = Boolean(coupon)

  const [formData, setFormData] = useState({
    code: '',
    description: '',
    type: 'percent',
    value: '',
    minOrderAmount: '',
    maxDiscountAmount: '',
    usageLimit: '',
    perCustomerLimit: '1',
    startDate: '',
    expirationDate: '',
    isActive: true,
  })

  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (coupon) {
      setFormData({
        code: coupon.code || '',
        description: coupon.description || '',
        type: coupon.type || 'percent',
        value: coupon.value !== undefined ? String(coupon.value) : '',
        minOrderAmount: coupon.minOrderAmount !== undefined ? String(coupon.minOrderAmount) : '0',
        maxDiscountAmount: coupon.maxDiscountAmount !== undefined ? String(coupon.maxDiscountAmount) : '',
        usageLimit: coupon.usageLimit !== undefined ? String(coupon.usageLimit) : '100',
        perCustomerLimit: coupon.perCustomerLimit !== undefined ? String(coupon.perCustomerLimit) : '1',
        startDate: coupon.startDate || new Date().toISOString().slice(0, 10),
        expirationDate: coupon.expirationDate || '',
        isActive: Boolean(coupon.isActive ?? true),
      })
    } else {
      const today = new Date().toISOString().slice(0, 10)
      const nextMonth = new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().slice(0, 10)
      setFormData({
        code: '',
        description: '',
        type: 'percent',
        value: '10',
        minOrderAmount: '1000',
        maxDiscountAmount: '1500',
        usageLimit: '200',
        perCustomerLimit: '1',
        startDate: today,
        expirationDate: nextMonth,
        isActive: true,
      })
    }
    setErrors({})
  }, [coupon, isOpen])

  if (!isOpen) return null

  const validate = () => {
    const errs = {}
    const cleanCode = formData.code.trim().toUpperCase()

    if (!cleanCode) {
      errs.code = 'Coupon code is required.'
    } else if (!/^[A-Z0-9_-]{3,20}$/.test(cleanCode)) {
      errs.code = 'Code must be 3-20 uppercase letters, numbers, or dashes.'
    }

    const val = Number(formData.value)
    if (!formData.value || isNaN(val) || val <= 0) {
      errs.value = 'Discount value must be a positive number.'
    } else if (formData.type === 'percent' && val > 100) {
      errs.value = 'Percentage discount cannot exceed 100%.'
    }

    const minOrder = Number(formData.minOrderAmount)
    if (formData.minOrderAmount !== '' && (isNaN(minOrder) || minOrder < 0)) {
      errs.minOrderAmount = 'Minimum order amount cannot be negative.'
    }

    const maxDiscount = Number(formData.maxDiscountAmount)
    if (formData.maxDiscountAmount !== '' && (isNaN(maxDiscount) || maxDiscount < 0)) {
      errs.maxDiscountAmount = 'Maximum discount cannot be negative.'
    }

    const limit = Number(formData.usageLimit)
    if (formData.usageLimit !== '' && (isNaN(limit) || limit <= 0 || !Number.isInteger(limit))) {
      errs.usageLimit = 'Usage limit must be a positive integer.'
    }

    if (!formData.startDate) {
      errs.startDate = 'Start date is required.'
    }

    if (!formData.expirationDate) {
      errs.expirationDate = 'Expiration date is required.'
    } else if (formData.startDate && new Date(formData.expirationDate) < new Date(formData.startDate)) {
      errs.expirationDate = 'Expiration date must be later than the start date.'
    }

    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) return
    onSubmit({
      ...formData,
      code: formData.code.trim().toUpperCase(),
      value: Number(formData.value),
      minOrderAmount: Number(formData.minOrderAmount) || 0,
      maxDiscountAmount: Number(formData.maxDiscountAmount) || Number(formData.value),
      usageLimit: Number(formData.usageLimit) || 100,
      perCustomerLimit: Number(formData.perCustomerLimit) || 1,
    })
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-[#103321] text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#95C623] text-[#103321] flex items-center justify-center font-bold text-sm">
              <Tag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-base leading-tight">
                {isEdit ? 'Edit Promotional Coupon' : 'Create New Discount Coupon'}
              </h3>
              <p className="text-xs text-emerald-200/90">
                {isEdit ? `Modifying rules for ${coupon.code}` : 'Set voucher discount value and usage limits'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Coupon Code & Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Coupon Code *
              </label>
              <div className="relative">
                <Tag className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({ ...formData, code: e.target.value.toUpperCase() })
                  }
                  placeholder="e.g. HABESHA20"
                  className={`w-full pl-9 pr-3 py-2 text-sm font-mono uppercase border rounded-lg focus:outline-none focus:ring-2 ${
                    errors.code
                      ? 'border-rose-400 focus:ring-rose-200'
                      : 'border-gray-200 focus:ring-[#103321]/20 focus:border-[#103321]'
                  }`}
                />
              </div>
              {errors.code && (
                <p className="text-[11px] text-rose-500 mt-1">{errors.code}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Discount Type *
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#103321]/20 focus:border-[#103321]"
              >
                <option value="percent">Percentage (% Off)</option>
                <option value="fixed">Fixed Amount (ETB Off)</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Description / Promotion Campaign
            </label>
            <div className="relative">
              <FileText className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="e.g. 15% Holiday Discount on Habesha Kemis"
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#103321]/20 focus:border-[#103321]"
              />
            </div>
          </div>

          {/* Discount Value, Min Order, Max Discount */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Discount Value * {formData.type === 'percent' ? '(%)' : '(ETB)'}
              </label>
              <input
                type="number"
                step="any"
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                placeholder={formData.type === 'percent' ? '15' : '250'}
                className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 ${
                  errors.value
                    ? 'border-rose-400 focus:ring-rose-200'
                    : 'border-gray-200 focus:ring-[#103321]/20 focus:border-[#103321]'
                }`}
              />
              {errors.value && (
                <p className="text-[11px] text-rose-500 mt-1">{errors.value}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Min Order (ETB)
              </label>
              <input
                type="number"
                value={formData.minOrderAmount}
                onChange={(e) => setFormData({ ...formData, minOrderAmount: e.target.value })}
                placeholder="1000"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#103321]/20 focus:border-[#103321]"
              />
              {errors.minOrderAmount && (
                <p className="text-[11px] text-rose-500 mt-1">{errors.minOrderAmount}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Max Discount (ETB)
              </label>
              <input
                type="number"
                value={formData.maxDiscountAmount}
                onChange={(e) => setFormData({ ...formData, maxDiscountAmount: e.target.value })}
                placeholder="1500"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#103321]/20 focus:border-[#103321]"
              />
              {errors.maxDiscountAmount && (
                <p className="text-[11px] text-rose-500 mt-1">{errors.maxDiscountAmount}</p>
              )}
            </div>
          </div>

          {/* Usage Limits */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Total Redemptions Cap
              </label>
              <input
                type="number"
                value={formData.usageLimit}
                onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                placeholder="200"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#103321]/20 focus:border-[#103321]"
              />
              {errors.usageLimit && (
                <p className="text-[11px] text-rose-500 mt-1">{errors.usageLimit}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Per-Customer Limit
              </label>
              <input
                type="number"
                value={formData.perCustomerLimit}
                onChange={(e) => setFormData({ ...formData, perCustomerLimit: e.target.value })}
                placeholder="1"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#103321]/20 focus:border-[#103321]"
              />
            </div>
          </div>

          {/* Validity Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Start Date *
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#103321]/20 focus:border-[#103321]"
              />
              {errors.startDate && (
                <p className="text-[11px] text-rose-500 mt-1">{errors.startDate}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Expiration Date *
              </label>
              <input
                type="date"
                value={formData.expirationDate}
                onChange={(e) => setFormData({ ...formData, expirationDate: e.target.value })}
                className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 ${
                  errors.expirationDate
                    ? 'border-rose-400 focus:ring-rose-200'
                    : 'border-gray-200 focus:ring-[#103321]/20 focus:border-[#103321]'
                }`}
              />
              {errors.expirationDate && (
                <p className="text-[11px] text-rose-500 mt-1">{errors.expirationDate}</p>
              )}
            </div>
          </div>

          {/* Active Switch */}
          <div className="flex items-center gap-2.5 pt-1">
            <input
              type="checkbox"
              id="couponActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="w-4 h-4 text-[#103321] rounded border-gray-300 focus:ring-[#103321]/20 cursor-pointer"
            />
            <label htmlFor="couponActive" className="text-xs font-medium text-gray-700 cursor-pointer">
              Promotional voucher is actively redeemable by storefront customers
            </label>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-[#103321] hover:bg-[#103321]/90 rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
            >
              <Tag className="w-4 h-4 text-[#95C623]" />
              {isEdit ? 'Update Coupon' : 'Create Coupon'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
