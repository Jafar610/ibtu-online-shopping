import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  ArrowLeft,
  CreditCard,
  CheckCircle2,
  XCircle,
  FileText,
  ExternalLink,
  ShieldAlert,
  User,
  ShoppingBag,
  Calendar,
  AlertTriangle,
} from 'lucide-react'
import AdminLayout from '../../components/admin/AdminLayout'
import AdminBreadcrumb from '../../components/admin/AdminBreadcrumb'
import AdminStatusBadge from '../../components/admin/AdminStatusBadge'
import ReceiptReviewModal from '../../components/admin/ReceiptReviewModal'
import {
  getStoredAdminPayments,
  reviewPaymentReceipt,
} from '../../data/admin/adminSalesData'

export default function AdminPaymentDetailsPage() {
  const { paymentId } = useParams()
  const [payment, setPayment] = useState(null)
  const [reviewModalOpen, setReviewModalOpen] = useState(false)
  const [feedback, setFeedback] = useState(null)

  const showFeedback = (msg, type = 'success') => {
    setFeedback({ msg, type })
    setTimeout(() => setFeedback(null), 4000)
  }

  const loadPayment = () => {
    const list = getStoredAdminPayments()
    const found = list.find((p) => p.id === paymentId || p.paymentReference === paymentId)
    setPayment(found || null)
  }

  useEffect(() => {
    loadPayment()
  }, [paymentId])

  if (!payment) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <AdminBreadcrumb
            items={[
              { label: 'Sales Management' },
              { label: 'Payments', path: '/admin/payments' },
              { label: 'Not Found' },
            ]}
          />
          <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h2 className="font-serif font-bold text-xl text-[#103321]">
              Payment Record Not Found
            </h2>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              No payment record matching identifier "{paymentId}" was found in mock storage.
            </p>
            <Link
              to="/admin/payments"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#103321] text-white text-xs font-bold hover:bg-[#103321]/90"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Payments</span>
            </Link>
          </div>
        </div>
      </AdminLayout>
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

  const handleApprove = (id) => {
    const res = reviewPaymentReceipt(id, { action: 'approve' })
    if (res.success) {
      loadPayment()
      setReviewModalOpen(false)
      showFeedback('Payment receipt approved. Status marked as Paid.')
    }
  }

  const handleReject = (id, reason) => {
    const res = reviewPaymentReceipt(id, { action: 'reject', reason })
    if (res.success) {
      loadPayment()
      setReviewModalOpen(false)
      showFeedback('Payment receipt rejected. Status marked as Failed.', 'warning')
    }
  }

  const receipt = payment.receipt || {}
  const isPendingReview = receipt.reviewStatus === 'pending'

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Breadcrumb Navigation */}
        <AdminBreadcrumb
          items={[
            { label: 'Sales Management' },
            { label: 'Payments', path: '/admin/payments' },
            { label: payment.paymentReference },
          ]}
        />

        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              to="/admin/payments"
              className="p-2 rounded-xl border border-gray-200 hover:bg-white text-gray-600 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="font-serif font-extrabold text-2xl text-[#103321]">
                  Payment {payment.paymentReference}
                </h1>
                <AdminStatusBadge status={payment.paymentStatus} type="payment" />
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Order <Link to={`/admin/orders/${payment.orderId}`} className="font-mono font-bold text-[#103321] hover:underline">{payment.orderNumber}</Link> • System ID: <span className="font-mono">{payment.id}</span>
              </p>
            </div>
          </div>

          {receipt.hasReceipt && isPendingReview && (
            <button
              type="button"
              onClick={() => setReviewModalOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-[#103321] hover:bg-[#103321]/90 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-[#95C623]" />
              <span>Review Slip</span>
            </button>
          )}
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div
            className={`p-4 rounded-2xl border text-xs font-semibold flex items-center justify-between shadow-xs animate-fadeIn ${
              feedback.type === 'warning'
                ? 'bg-amber-50 border-amber-200 text-amber-900'
                : 'bg-emerald-50 border-emerald-200 text-emerald-900'
            }`}
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#95C623]" />
              <span>{feedback.msg}</span>
            </div>
            <button
              type="button"
              onClick={() => setFeedback(null)}
              className="text-gray-400 hover:text-gray-600 font-bold"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Notice */}
        <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200/80 text-xs text-amber-900 flex items-start gap-2.5">
          <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong className="font-bold">Development Sandbox Mode: </strong>
            This payment record represents frontend mock state. Payment statuses, provider references, and receipt verifications are simulated without communicating with Ethiopian bank gateways.
          </div>
        </div>

        {/* 2-Column Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column (2 cols): Payment Details & Receipt Inspection */}
          <div className="lg:col-span-2 space-y-6">
            {/* Payment Specifications Card */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-xs p-5 sm:p-6 space-y-4">
              <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                <CreditCard className="w-4 h-4 text-[#103321]" />
                <h3 className="font-serif font-bold text-base text-[#103321]">
                  Transaction Specifications
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                    Payment Method
                  </span>
                  <span className="font-bold text-gray-900 text-sm block">
                    {payment.paymentMethod}
                  </span>
                  <span className="text-gray-500 text-[11px] block mt-0.5">
                    {payment.paymentProvider}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                    Total Amount
                  </span>
                  <span className="font-extrabold text-[#103321] text-lg block">
                    {formatCurrency(payment.amount)}
                  </span>
                  <span className="text-gray-400 text-[10px] block">
                    Currency: {payment.currency}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                    Provider Transaction Reference
                  </span>
                  <span className="font-mono font-bold text-gray-800 block">
                    {payment.providerTransactionId || 'Awaiting automated gateway match'}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                    Date Created
                  </span>
                  <span className="font-medium text-gray-700 block">
                    {formatDate(payment.paymentDate)}
                  </span>
                </div>

                {payment.paidDate && (
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                      Settlement / Paid Date
                    </span>
                    <span className="font-semibold text-emerald-700 block">
                      {formatDate(payment.paidDate)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Receipt Verification Box */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-xs p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#103321]" />
                  <h3 className="font-serif font-bold text-base text-[#103321]">
                    Customer Payment Transfer Slip
                  </h3>
                </div>

                <span
                  className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                    receipt.reviewStatus === 'approved'
                      ? 'bg-emerald-100 text-emerald-800'
                      : receipt.reviewStatus === 'rejected'
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-amber-100 text-amber-800 animate-pulse'
                  }`}
                >
                  {receipt.reviewStatus ? receipt.reviewStatus.toUpperCase() : 'PENDING'}
                </span>
              </div>

              {receipt.hasReceipt && receipt.receiptImage ? (
                <div className="space-y-4">
                  <div className="rounded-2xl border border-gray-200 bg-gray-100 overflow-hidden aspect-video max-h-80 flex items-center justify-center">
                    <img
                      src={receipt.receiptImage}
                      alt="Transfer Slip"
                      className="w-full h-full object-contain"
                    />
                  </div>

                  {receipt.rejectionReason && (
                    <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-900">
                      <strong className="font-bold">Rejection Reason: </strong>
                      <span>{receipt.rejectionReason}</span>
                    </div>
                  )}

                  {receipt.reviewedBy && (
                    <p className="text-[11px] text-gray-500">
                      Reviewed by <span className="font-bold">{receipt.reviewedBy}</span> on {formatDate(receipt.reviewedAt)}
                    </p>
                  )}
                </div>
              ) : (
                <div className="p-8 text-center text-xs text-gray-500 bg-gray-50 rounded-2xl">
                  No visual screenshot attached to this transaction. Cash on Delivery or auto-reconciled.
                </div>
              )}
            </div>
          </div>

          {/* Right Column (1 col): Linked Order & Customer */}
          <div className="space-y-6">
            {/* Linked Order Card */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-xs p-5 sm:p-6 space-y-3">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-[#103321]" />
                  <h3 className="font-serif font-bold text-sm text-[#103321]">
                    Associated Order
                  </h3>
                </div>

                <Link
                  to={`/admin/orders/${payment.orderId}`}
                  className="text-xs font-bold text-[#103321] hover:text-[#95C623] inline-flex items-center gap-1"
                >
                  <span>Open</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-[10px] text-gray-400 font-bold block uppercase">
                    Order Number
                  </span>
                  <span className="font-bold text-[#103321] text-sm">
                    {payment.orderNumber}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-gray-400 font-bold block uppercase">
                    Internal Identifier
                  </span>
                  <span className="font-mono text-gray-600">
                    {payment.orderId}
                  </span>
                </div>
              </div>
            </div>

            {/* Customer Details */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-xs p-5 sm:p-6 space-y-3">
              <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                <User className="w-4 h-4 text-[#103321]" />
                <h3 className="font-serif font-bold text-sm text-[#103321]">
                  Payer Information
                </h3>
              </div>

              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-[10px] text-gray-400 font-bold block uppercase">
                    Full Name
                  </span>
                  <span className="font-bold text-gray-900">
                    {payment.customer?.name}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-gray-400 font-bold block uppercase">
                    Email
                  </span>
                  <span className="text-gray-700">
                    {payment.customer?.email || 'N/A'}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-gray-400 font-bold block uppercase">
                    Phone
                  </span>
                  <span className="text-gray-700 font-medium">
                    {payment.customer?.phone || 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Receipt Review Modal */}
        <ReceiptReviewModal
          isOpen={reviewModalOpen}
          payment={payment}
          onClose={() => setReviewModalOpen(false)}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      </div>
    </AdminLayout>
  )
}
