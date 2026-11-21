import {
  Tag,
  Percent,
  Coins,
  Calendar,
  Edit2,
  Trash2,
  Power,
  CheckCircle2,
  Clock,
  AlertCircle,
} from 'lucide-react'
import AdminEmptyState from './AdminEmptyState'

export default function CouponTable({
  coupons,
  onEditCoupon,
  onToggleStatus,
  onDeleteCoupon,
}) {
  if (!coupons || coupons.length === 0) {
    return (
      <AdminEmptyState
        title="No Promotional Coupons Found"
        description="Create promotional discount vouchers for Habesha Kemis, holiday sales, or welcome offers."
      />
    )
  }

  const isExpired = (expiryDate) => {
    if (!expiryDate) return false
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    return new Date(expiryDate) < now
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return '—'
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <th className="py-3.5 px-4">Coupon Code</th>
              <th className="py-3.5 px-4">Discount</th>
              <th className="py-3.5 px-4">Thresholds</th>
              <th className="py-3.5 px-4">Usage & Limit</th>
              <th className="py-3.5 px-4">Validity Window</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {coupons.map((coupon) => {
              const expired = isExpired(coupon.expirationDate)
              const usagePercent =
                coupon.usageLimit > 0
                  ? Math.min(100, Math.round((coupon.usageCount / coupon.usageLimit) * 100))
                  : 0

              return (
                <tr
                  key={coupon.id}
                  className="hover:bg-gray-50/70 transition-colors group"
                >
                  {/* Coupon Code & Description */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-start gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-[#103321]/10 text-[#103321] flex items-center justify-center shrink-0 mt-0.5">
                        <Tag className="w-4 h-4 text-[#103321]" />
                      </div>
                      <div className="min-w-0">
                        <span className="font-mono font-bold text-sm text-gray-900 block tracking-wider">
                          {coupon.code}
                        </span>
                        <p className="text-xs text-gray-500 line-clamp-1 max-w-xs mt-0.5">
                          {coupon.description}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Discount Value & Type */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5">
                      {coupon.type === 'percent' ? (
                        <span className="inline-flex items-center gap-1 font-bold text-xs text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          <Percent className="w-3 h-3 text-emerald-600" />
                          {coupon.value}% OFF
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 font-bold text-xs text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                          <Coins className="w-3 h-3 text-blue-600" />
                          {coupon.value.toLocaleString()} ETB OFF
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Min Order & Max Discount */}
                  <td className="py-3.5 px-4 text-xs text-gray-600 space-y-0.5">
                    <div>
                      Min: <strong className="text-gray-900">{coupon.minOrderAmount?.toLocaleString() || 0} ETB</strong>
                    </div>
                    {coupon.type === 'percent' && coupon.maxDiscountAmount && (
                      <div className="text-[11px] text-gray-400">
                        Cap: {coupon.maxDiscountAmount.toLocaleString()} ETB
                      </div>
                    )}
                  </td>

                  {/* Usage Progress */}
                  <td className="py-3.5 px-4 text-xs">
                    <div className="space-y-1 w-32">
                      <div className="flex justify-between text-[11px]">
                        <span className="font-medium text-gray-700">
                          {coupon.usageCount} used
                        </span>
                        <span className="text-gray-400">
                          limit {coupon.usageLimit || '∞'}
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            usagePercent >= 90
                              ? 'bg-rose-500'
                              : usagePercent >= 70
                              ? 'bg-amber-500'
                              : 'bg-[#95C623]'
                          }`}
                          style={{ width: `${usagePercent}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  {/* Validity Window */}
                  <td className="py-3.5 px-4 text-xs text-gray-600 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      <span>{formatDate(coupon.startDate)} → {formatDate(coupon.expirationDate)}</span>
                    </div>
                    {expired && (
                      <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-rose-600 mt-0.5">
                        <Clock className="w-2.5 h-2.5" /> Expired
                      </span>
                    )}
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4">
                    {coupon.isActive && !expired ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Active
                      </span>
                    ) : expired ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 border border-gray-200">
                        Expired
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                        Inactive
                      </span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* Edit */}
                      <button
                        onClick={() => onEditCoupon?.(coupon)}
                        className="p-1.5 text-gray-500 hover:text-[#103321] hover:bg-gray-100 rounded-lg transition-colors"
                        title="Edit Coupon"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      {/* Toggle Active */}
                      <button
                        onClick={() => onToggleStatus?.(coupon)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          coupon.isActive
                            ? 'text-amber-600 hover:bg-amber-50'
                            : 'text-emerald-600 hover:bg-emerald-50'
                        }`}
                        title={coupon.isActive ? 'Deactivate Coupon' : 'Activate Coupon'}
                      >
                        <Power className="w-4 h-4" />
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => onDeleteCoupon?.(coupon)}
                        className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete Coupon"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
