import { Link } from 'react-router-dom'
import { Eye, FileText, CheckCircle2, AlertCircle, CreditCard, ChevronLeft, ChevronRight } from 'lucide-react'
import AdminStatusBadge from './AdminStatusBadge'

export default function PaymentTable({
  payments = [],
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  onReviewReceipt,
}) {
  if (payments.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center space-y-3">
        <div className="w-14 h-14 rounded-2xl bg-gray-50 text-gray-400 flex items-center justify-center mx-auto">
          <CreditCard className="w-7 h-7" />
        </div>
        <h3 className="font-serif font-bold text-base text-[#103321]">
          No payment records found
        </h3>
        <p className="text-xs text-gray-500 max-w-sm mx-auto">
          No payment transactions match the chosen filters. Try resetting filters to view all entries.
        </p>
      </div>
    )
  }

  const formatCurrency = (val) =>
    new Intl.NumberFormat('en-ET', { style: 'currency', currency: 'ETB', maximumFractionDigits: 0 }).format(val || 0)

  const formatDate = (isoStr) => {
    if (!isoStr) return 'N/A'
    try {
      return new Date(isoStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return isoStr
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#103321]/5 border-b border-gray-100 text-gray-600 font-extrabold uppercase tracking-wider text-[11px]">
            <tr>
              <th className="py-3.5 px-4">Reference</th>
              <th className="py-3.5 px-4">Order #</th>
              <th className="py-3.5 px-4">Customer</th>
              <th className="py-3.5 px-4">Method & Provider</th>
              <th className="py-3.5 px-4 text-right">Amount (ETB)</th>
              <th className="py-3.5 px-4 text-center">Status</th>
              <th className="py-3.5 px-4">Date</th>
              <th className="py-3.5 px-4 text-center">Receipt Verification</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {payments.map((pmt) => {
              const receipt = pmt.receipt || {}
              const isReceiptPending = receipt.reviewStatus === 'pending'

              return (
                <tr
                  key={pmt.id}
                  className="hover:bg-gray-50/80 transition-colors group"
                >
                  {/* Reference */}
                  <td className="py-3.5 px-4">
                    <Link
                      to={`/admin/payments/${pmt.id}`}
                      className="font-bold text-[#103321] hover:text-[#95C623] transition-colors block font-mono text-xs"
                    >
                      {pmt.paymentReference}
                    </Link>
                    <span className="text-[10px] text-gray-400 block font-mono">
                      {pmt.id}
                    </span>
                  </td>

                  {/* Order Number */}
                  <td className="py-3.5 px-4">
                    <Link
                      to={`/admin/orders/${pmt.orderId}`}
                      className="font-bold text-gray-800 hover:text-[#95C623] font-mono transition-colors"
                    >
                      {pmt.orderNumber}
                    </Link>
                  </td>

                  {/* Customer */}
                  <td className="py-3.5 px-4">
                    <div className="min-w-0">
                      <span className="font-bold text-gray-900 block truncate max-w-[130px]">
                        {pmt.customer?.name || 'Customer'}
                      </span>
                      <span className="text-[10px] text-gray-500 block truncate max-w-[130px]">
                        {pmt.customer?.phone || pmt.customer?.email}
                      </span>
                    </div>
                  </td>

                  {/* Method & Provider */}
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-gray-800 block">
                      {pmt.paymentMethod}
                    </span>
                    <span className="text-[10px] text-gray-500 block truncate max-w-[150px]">
                      {pmt.paymentProvider}
                    </span>
                  </td>

                  {/* Amount */}
                  <td className="py-3.5 px-4 text-right">
                    <span className="font-extrabold text-[#103321] block">
                      {formatCurrency(pmt.amount)}
                    </span>
                    <span className="text-[10px] text-gray-400 block">
                      {pmt.currency}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4 text-center whitespace-nowrap">
                    <AdminStatusBadge status={pmt.paymentStatus} type="payment" />
                  </td>

                  {/* Date */}
                  <td className="py-3.5 px-4 text-gray-600 whitespace-nowrap">
                    {formatDate(pmt.paymentDate)}
                  </td>

                  {/* Receipt Review Status */}
                  <td className="py-3.5 px-4 text-center whitespace-nowrap">
                    {receipt.hasReceipt ? (
                      <button
                        type="button"
                        onClick={() => onReviewReceipt(pmt)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                          isReceiptPending
                            ? 'bg-amber-100 text-amber-800 border border-amber-300 hover:bg-amber-200 animate-pulse'
                            : receipt.reviewStatus === 'approved'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                            : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                        }`}
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>
                          {isReceiptPending
                            ? 'Review Slip'
                            : receipt.reviewStatus === 'approved'
                            ? 'Verified Slip'
                            : 'Rejected Slip'}
                        </span>
                      </button>
                    ) : (
                      <span className="text-[10px] text-gray-400 font-medium">
                        Not Required
                      </span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Link
                        to={`/admin/payments/${pmt.id}`}
                        title="View Payment Details"
                        className="p-1.5 rounded-lg text-gray-500 hover:text-[#103321] hover:bg-gray-100 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>

                      {receipt.hasReceipt && (
                        <button
                          type="button"
                          onClick={() => onReviewReceipt(pmt)}
                          title="Inspect Uploaded Receipt"
                          className="p-1.5 rounded-lg text-gray-500 hover:text-[#103321] hover:bg-gray-100 transition-colors cursor-pointer"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="p-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
          <div>
            Page <span className="font-bold text-[#103321]">{currentPage}</span> of{' '}
            <span className="font-bold text-[#103321]">{totalPages}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => onPageChange(currentPage - 1)}
              className="p-1.5 rounded-lg border border-gray-200 enabled:hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => onPageChange(currentPage + 1)}
              className="p-1.5 rounded-lg border border-gray-200 enabled:hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
