import { useState } from 'react'
import {
  FileText,
  CheckCircle,
  XCircle,
  AlertTriangle,
  X,
  ExternalLink,
  ShieldAlert,
  User,
  CreditCard,
  Calendar,
} from 'lucide-react'
import AdminStatusBadge from './AdminStatusBadge'

export default function ReceiptReviewModal({
  isOpen,
  payment,
  onClose,
  onApprove,
  onReject,
}) {
  const [rejectMode, setRejectMode] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')
  const [error, setError] = useState('')

  if (!isOpen || !payment) return null

  const receipt = payment.receipt || {}
  const hasReceipt = Boolean(receipt.hasReceipt)
  const isPendingReview = receipt.reviewStatus === 'pending'

  const handleApprove = () => {
    onApprove?.(payment.id)
  }

  const handleRejectCommit = () => {
    if (!rejectionReason.trim()) {
      setError('Please provide a specific reason for receipt rejection.')
      return
    }
    onReject?.(payment.id, rejectionReason.trim())
  }

  const formatCurrency = (val) =>
    new Intl.NumberFormat('en-ET', {
      style: 'currency',
      currency: 'ETB',
      maximumFractionDigits: 0,
    }).format(val || 0)

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-gray-100 flex items-center justify-between bg-[#103321]/5 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#103321] text-[#95C623] flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-[#103321]">
                Payment Receipt Review
              </h3>
              <p className="text-xs text-gray-500 font-mono">
                {payment.paymentReference} • Order {payment.orderNumber}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* Important Sandbox Notice */}
          <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200/80 text-xs text-amber-900 flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong className="font-bold">Frontend Simulated Verification: </strong>
              Receipt inspection and approvals in this milestone update local state only. No live Telebirr or CBE banking APIs are contacted.
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-gray-50/80 rounded-2xl p-4 border border-gray-100 text-xs">
            <div>
              <span className="text-[11px] font-bold text-gray-400 block uppercase tracking-wider">
                Customer
              </span>
              <span className="font-bold text-gray-900 block truncate">
                {payment.customer?.name}
              </span>
              <span className="text-[10px] text-gray-500 block truncate">
                {payment.customer?.phone || payment.customer?.email}
              </span>
            </div>

            <div>
              <span className="text-[11px] font-bold text-gray-400 block uppercase tracking-wider">
                Payment Method
              </span>
              <span className="font-bold text-gray-900 block">
                {payment.paymentMethod}
              </span>
              <span className="text-[10px] text-gray-500 block truncate">
                {payment.paymentProvider}
              </span>
            </div>

            <div>
              <span className="text-[11px] font-bold text-gray-400 block uppercase tracking-wider">
                Amount
              </span>
              <span className="font-extrabold text-[#103321] text-sm block">
                {formatCurrency(payment.amount)}
              </span>
              <span className="text-[10px] text-gray-500 block">
                {payment.currency}
              </span>
            </div>

            <div>
              <span className="text-[11px] font-bold text-gray-400 block uppercase tracking-wider">
                Submitted At
              </span>
              <span className="font-medium text-gray-700 block">
                {formatDate(receipt.submittedAt || payment.paymentDate)}
              </span>
            </div>

            <div>
              <span className="text-[11px] font-bold text-gray-400 block uppercase tracking-wider">
                Current Status
              </span>
              <div className="mt-0.5">
                <AdminStatusBadge status={payment.paymentStatus} type="payment" />
              </div>
            </div>

            <div>
              <span className="text-[11px] font-bold text-gray-400 block uppercase tracking-wider">
                Review Status
              </span>
              <span
                className={`inline-block mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  receipt.reviewStatus === 'approved'
                    ? 'bg-emerald-100 text-emerald-800'
                    : receipt.reviewStatus === 'rejected'
                    ? 'bg-rose-100 text-rose-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {receipt.reviewStatus ? receipt.reviewStatus.toUpperCase() : 'PENDING'}
              </span>
            </div>
          </div>

          {/* Rejection History if previously rejected */}
          {receipt.rejectionReason && (
            <div className="p-3.5 bg-rose-50 rounded-2xl border border-rose-200 text-xs text-rose-900">
              <strong className="font-bold">Prior Rejection Reason: </strong>
              <span>{receipt.rejectionReason}</span>
              {receipt.reviewedBy && (
                <div className="text-[10px] text-rose-600 mt-1">
                  Reviewed by {receipt.reviewedBy} at {formatDate(receipt.reviewedAt)}
                </div>
              )}
            </div>
          )}

          {/* Receipt Image Preview Container */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-700 flex items-center justify-between">
              <span>Customer Uploaded Slip Screenshot</span>
              {receipt.receiptImage && (
                <a
                  href={receipt.receiptImage}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-[#103321] hover:text-[#95C623] font-bold inline-flex items-center gap-1"
                >
                  <ExternalLink className="w-3 h-3" />
                  Open Full Image
                </a>
              )}
            </label>

            {hasReceipt && receipt.receiptImage ? (
              <div className="relative rounded-2xl overflow-hidden border border-gray-200 bg-gray-100 aspect-video max-h-72 flex items-center justify-center">
                <img
                  src={receipt.receiptImage}
                  alt="Customer payment transfer slip preview"
                  className="w-full h-full object-contain"
                />
              </div>
            ) : (
              <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 p-8 text-center space-y-2">
                <FileText className="w-8 h-8 text-gray-400 mx-auto" />
                <p className="text-xs font-medium text-gray-600">
                  No visual receipt image file attached for this transaction.
                </p>
                <p className="text-[11px] text-gray-400">
                  Transaction verified via reference string or cash collection.
                </p>
              </div>
            )}
          </div>

          {/* Rejection Input Mode */}
          {rejectMode && (
            <div className="p-4 bg-rose-50/70 rounded-2xl border border-rose-200 space-y-2.5 animate-fadeIn">
              <label className="block text-xs font-bold text-rose-900">
                Reason for Rejection <span className="text-rose-600">*</span>
              </label>
              <textarea
                rows={2}
                value={rejectionReason}
                onChange={(e) => {
                  setRejectionReason(e.target.value)
                  if (error) setError('')
                }}
                placeholder="e.g. Unreadable screenshot, transaction amount mismatch, or incorrect bank account..."
                className="w-full px-3 py-2 rounded-xl border border-rose-300 bg-white text-xs outline-none focus:ring-2 focus:ring-rose-400/20"
              />
              {error && (
                <p className="text-[11px] text-rose-600 font-medium">{error}</p>
              )}
              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setRejectMode(false)}
                  className="px-3 py-1.5 text-xs text-gray-600 font-bold hover:bg-white rounded-lg transition-colors cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleRejectCommit}
                  className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer shadow-xs"
                >
                  Confirm Rejection
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Actions Footer */}
        <div className="p-4 sm:p-5 border-t border-gray-100 flex items-center justify-between bg-gray-50/50 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-gray-200 hover:bg-white text-gray-700 text-xs font-bold transition-colors cursor-pointer"
          >
            Close
          </button>

          {!rejectMode && isPendingReview && (
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setRejectMode(true)}
                className="px-4 py-2.5 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <XCircle className="w-3.5 h-3.5" />
                Reject Receipt
              </button>

              <button
                type="button"
                onClick={handleApprove}
                className="px-5 py-2.5 rounded-xl bg-[#103321] hover:bg-[#103321]/90 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <CheckCircle className="w-3.5 h-3.5 text-[#95C623]" />
                Approve Payment (Simulated)
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
