import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  CreditCard,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  DollarSign,
  ShieldCheck,
  ShieldAlert,
} from 'lucide-react'
import AdminLayout from '../../components/admin/AdminLayout'
import AdminBreadcrumb from '../../components/admin/AdminBreadcrumb'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import PaymentFilters from '../../components/admin/PaymentFilters'
import PaymentTable from '../../components/admin/PaymentTable'
import ReceiptReviewModal from '../../components/admin/ReceiptReviewModal'
import {
  getStoredAdminPayments,
  reviewPaymentReceipt,
  getSalesKPIs,
} from '../../data/admin/adminSalesData'

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState(() => getStoredAdminPayments())
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedMethod, setSelectedMethod] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [receiptStatus, setReceiptStatus] = useState('all')
  const [sortBy, setSortBy] = useState('date-desc')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 8

  // Active Receipt Modal
  const [selectedPaymentForReview, setSelectedPaymentForReview] = useState(null)

  // Feedback Notification
  const [feedback, setFeedback] = useState(null)

  const showFeedback = (msg, type = 'success') => {
    setFeedback({ msg, type })
    setTimeout(() => setFeedback(null), 4000)
  }

  // Filter & Sort Logic
  const filteredPayments = useMemo(() => {
    let result = [...payments]

    // Text Search
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim()
      result = result.filter(
        (p) =>
          p.paymentReference?.toLowerCase().includes(q) ||
          p.orderNumber?.toLowerCase().includes(q) ||
          p.customer?.name?.toLowerCase().includes(q) ||
          p.customer?.phone?.includes(q) ||
          p.customer?.email?.toLowerCase().includes(q)
      )
    }

    // Payment Method
    if (selectedMethod !== 'all') {
      result = result.filter((p) => p.paymentMethod === selectedMethod)
    }

    // Payment Status
    if (selectedStatus !== 'all') {
      result = result.filter((p) => p.paymentStatus === selectedStatus)
    }

    // Receipt Review Status
    if (receiptStatus !== 'all') {
      if (receiptStatus === 'needs_review') {
        result = result.filter((p) => p.receipt?.reviewStatus === 'pending')
      } else if (receiptStatus === 'approved') {
        result = result.filter((p) => p.receipt?.reviewStatus === 'approved')
      } else if (receiptStatus === 'rejected') {
        result = result.filter((p) => p.receipt?.reviewStatus === 'rejected')
      } else if (receiptStatus === 'not_required') {
        result = result.filter((p) => !p.receipt?.hasReceipt || p.receipt?.reviewStatus === 'not_required')
      }
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'date-desc') return new Date(b.paymentDate) - new Date(a.paymentDate)
      if (sortBy === 'date-asc') return new Date(a.paymentDate) - new Date(b.paymentDate)
      if (sortBy === 'amount-desc') return (b.amount || 0) - (a.amount || 0)
      if (sortBy === 'amount-asc') return (a.amount || 0) - (b.amount || 0)
      return 0
    })

    return result
  }, [payments, searchTerm, selectedMethod, selectedStatus, receiptStatus, sortBy])

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredPayments.length / pageSize))
  const paginatedPayments = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredPayments.slice(start, start + pageSize)
  }, [filteredPayments, currentPage, pageSize])

  const handleResetFilters = () => {
    setSearchTerm('')
    setSelectedMethod('all')
    setSelectedStatus('all')
    setReceiptStatus('all')
    setSortBy('date-desc')
    setCurrentPage(1)
  }

  // Handle Receipt Review Actions
  const handleApproveReceipt = (paymentId) => {
    const res = reviewPaymentReceipt(paymentId, { action: 'approve', adminName: 'Admin' })
    if (res.success) {
      setPayments(getStoredAdminPayments())
      setSelectedPaymentForReview(null)
      showFeedback(res.message || 'Payment receipt approved.')
    } else {
      alert(res.message || 'Approval failed.')
    }
  }

  const handleRejectReceipt = (paymentId, reason) => {
    const res = reviewPaymentReceipt(paymentId, { action: 'reject', reason, adminName: 'Admin' })
    if (res.success) {
      setPayments(getStoredAdminPayments())
      setSelectedPaymentForReview(null)
      showFeedback(res.message || 'Payment receipt rejected.', 'warning')
    } else {
      alert(res.message || 'Rejection failed.')
    }
  }

  const kpis = getSalesKPIs()
  const formatCurrency = (val) =>
    new Intl.NumberFormat('en-ET', { style: 'currency', currency: 'ETB', maximumFractionDigits: 0 }).format(val || 0)

  const pendingReviewSlips = payments.filter((p) => p.receipt?.reviewStatus === 'pending').length

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Breadcrumb Navigation */}
        <AdminBreadcrumb items={[{ label: 'Sales Management' }, { label: 'Payments' }]} />

        {/* Page Header */}
        <AdminPageHeader
          title="Payment Verification & Reconciliations"
          subtitle="Inspect customer Telebirr, CBE Birr, and Bank Transfer receipts, verify transaction slips, and reconcile orders."
        >
          <div className="flex items-center gap-2">
            <Link
              to="/admin/orders"
              className="px-3.5 py-2 rounded-xl border border-gray-200 hover:bg-white text-xs font-bold text-gray-700 transition-colors shadow-xs"
            >
              Order Pipeline
            </Link>
          </div>
        </AdminPageHeader>

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

        {/* KPI Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs space-y-1">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
              Total Transactions
            </span>
            <div className="text-xl font-extrabold text-[#103321]">
              {payments.length}
            </div>
            <span className="text-[10px] text-gray-500 block">All recorded payments</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs space-y-1">
            <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider block">
              Slips Awaiting Review
            </span>
            <div className="text-xl font-extrabold text-amber-700">
              {pendingReviewSlips}
            </div>
            <span className="text-[10px] text-gray-500 block">Screenshots to verify</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs space-y-1">
            <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider block">
              Verified Revenue
            </span>
            <div className="text-xl font-extrabold text-[#103321]">
              {formatCurrency(kpis.totalRevenue)}
            </div>
            <span className="text-[10px] text-gray-500 block">Successfully collected</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs space-y-1">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
              COD Uncollected
            </span>
            <div className="text-xl font-extrabold text-gray-700">
              {payments.filter((p) => p.paymentStatus === 'Unpaid').length}
            </div>
            <span className="text-[10px] text-gray-500 block">Pay upon delivery</span>
          </div>
        </div>

        {/* Payment Filters */}
        <PaymentFilters
          searchTerm={searchTerm}
          setSearchTerm={(term) => {
            setSearchTerm(term)
            setCurrentPage(1)
          }}
          selectedMethod={selectedMethod}
          setSelectedMethod={(m) => {
            setSelectedMethod(m)
            setCurrentPage(1)
          }}
          selectedStatus={selectedStatus}
          setSelectedStatus={(st) => {
            setSelectedStatus(st)
            setCurrentPage(1)
          }}
          receiptStatus={receiptStatus}
          setReceiptStatus={(rs) => {
            setReceiptStatus(rs)
            setCurrentPage(1)
          }}
          sortBy={sortBy}
          setSortBy={setSortBy}
          onReset={handleResetFilters}
          totalResults={filteredPayments.length}
        />

        {/* Payment Table */}
        <PaymentTable
          payments={paginatedPayments}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          onReviewReceipt={(pmt) => setSelectedPaymentForReview(pmt)}
        />

        {/* Receipt Review Modal */}
        <ReceiptReviewModal
          isOpen={Boolean(selectedPaymentForReview)}
          payment={selectedPaymentForReview}
          onClose={() => setSelectedPaymentForReview(null)}
          onApprove={handleApproveReceipt}
          onReject={handleRejectReceipt}
        />
      </div>
    </AdminLayout>
  )
}
