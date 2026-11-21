import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  ShoppingBag,
  Clock,
  CheckCircle2,
  Truck,
  RotateCcw,
  AlertCircle,
  XCircle,
  FileSpreadsheet,
} from 'lucide-react'
import AdminLayout from '../../components/admin/AdminLayout'
import AdminBreadcrumb from '../../components/admin/AdminBreadcrumb'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import OrderFilters from '../../components/admin/OrderFilters'
import OrderTable from '../../components/admin/OrderTable'
import ConfirmActionModal from '../../components/admin/ConfirmActionModal'
import {
  getStoredAdminOrders,
  updateOrderStatus,
  VALID_ORDER_STATUS_TRANSITIONS,
  getSalesKPIs,
} from '../../data/admin/adminSalesData'

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState(() => getStoredAdminOrders())
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedOrderStatus, setSelectedOrderStatus] = useState('all')
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState('all')
  const [dateRange, setDateRange] = useState('all')
  const [sortBy, setSortBy] = useState('date-desc')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 8

  // Status Change State
  const [statusModalOrder, setStatusModalOrder] = useState(null)
  const [nextStatus, setNextStatus] = useState('')
  const [statusNote, setStatusNote] = useState('')
  const [statusError, setStatusError] = useState('')

  // Cancellation Modal State
  const [cancelModalOrder, setCancelModalOrder] = useState(null)

  // Feedback Notification
  const [feedback, setFeedback] = useState(null)

  const showFeedback = (msg, type = 'success') => {
    setFeedback({ msg, type })
    setTimeout(() => setFeedback(null), 4000)
  }

  // Filter & Sort Logic
  const filteredOrders = useMemo(() => {
    let result = [...orders]

    // Text search
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim()
      result = result.filter(
        (o) =>
          o.orderNumber?.toLowerCase().includes(q) ||
          o.id?.toLowerCase().includes(q) ||
          o.customer?.name?.toLowerCase().includes(q) ||
          o.customer?.email?.toLowerCase().includes(q) ||
          o.customer?.phone?.includes(q) ||
          o.shippingAddress?.phone?.includes(q)
      )
    }

    // Order Status
    if (selectedOrderStatus !== 'all') {
      result = result.filter((o) => o.orderStatus === selectedOrderStatus)
    }

    // Payment Status
    if (selectedPaymentStatus !== 'all') {
      result = result.filter((o) => o.paymentStatus === selectedPaymentStatus)
    }

    // Date Range
    if (dateRange !== 'all') {
      const now = new Date()
      result = result.filter((o) => {
        const orderDate = new Date(o.orderDate)
        const diffDays = (now - orderDate) / (1000 * 3600 * 24)
        if (dateRange === 'today') return diffDays <= 1
        if (dateRange === 'last7') return diffDays <= 7
        if (dateRange === 'last30') return diffDays <= 30
        return true
      })
    }

    // Sort By
    result.sort((a, b) => {
      if (sortBy === 'date-desc') return new Date(b.orderDate) - new Date(a.orderDate)
      if (sortBy === 'date-asc') return new Date(a.orderDate) - new Date(b.orderDate)
      if (sortBy === 'amount-desc') return (b.totalAmount || 0) - (a.totalAmount || 0)
      if (sortBy === 'amount-asc') return (a.totalAmount || 0) - (b.totalAmount || 0)
      return 0
    })

    return result
  }, [orders, searchTerm, selectedOrderStatus, selectedPaymentStatus, dateRange, sortBy])

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / pageSize))
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredOrders.slice(start, start + pageSize)
  }, [filteredOrders, currentPage, pageSize])

  const handleResetFilters = () => {
    setSearchTerm('')
    setSelectedOrderStatus('all')
    setSelectedPaymentStatus('all')
    setDateRange('all')
    setSortBy('date-desc')
    setCurrentPage(1)
  }

  // Open Status Transition Modal
  const handleOpenStatusModal = (order) => {
    const allowed = VALID_ORDER_STATUS_TRANSITIONS[order.orderStatus] || []
    setStatusModalOrder(order)
    setNextStatus(allowed[0] || '')
    setStatusNote('')
    setStatusError('')
  }

  const handleCommitStatusChange = () => {
    if (!statusModalOrder || !nextStatus) return
    const res = updateOrderStatus(statusModalOrder.id, nextStatus, statusNote.trim())
    if (res.success) {
      setOrders(getStoredAdminOrders())
      setStatusModalOrder(null)
      showFeedback(`Order ${statusModalOrder.orderNumber} status updated to ${nextStatus}.`)
    } else {
      setStatusError(res.message || 'Status transition failed.')
    }
  }

  // Handle Cancellation
  const handleOpenCancelModal = (order) => {
    setCancelModalOrder(order)
  }

  const handleConfirmCancellation = (reason) => {
    if (!cancelModalOrder) return
    const res = updateOrderStatus(
      cancelModalOrder.id,
      'Cancelled',
      `Order cancelled by admin. Reason: ${reason || 'Not specified'}`
    )
    if (res.success) {
      setOrders(getStoredAdminOrders())
      setCancelModalOrder(null)
      showFeedback(`Order ${cancelModalOrder.orderNumber} cancelled successfully.`, 'warning')
    } else {
      alert(res.message || 'Failed to cancel order.')
    }
  }

  const kpis = getSalesKPIs()
  const formatCurrency = (val) =>
    new Intl.NumberFormat('en-ET', { style: 'currency', currency: 'ETB', maximumFractionDigits: 0 }).format(val || 0)

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Breadcrumb Navigation */}
        <AdminBreadcrumb items={[{ label: 'Sales Management' }, { label: 'Orders' }]} />

        {/* Page Header */}
        <AdminPageHeader
          title="Customer Order Management"
          subtitle="Review incoming customer orders, manage status pipelines, and track fulfillment stages."
        >
          <div className="flex items-center gap-2">
            <Link
              to="/admin/payments"
              className="px-3.5 py-2 rounded-xl border border-gray-200 hover:bg-white text-xs font-bold text-gray-700 transition-colors shadow-xs"
            >
              Payment Verification
            </Link>
            <Link
              to="/admin/shipments"
              className="px-4 py-2 rounded-xl bg-[#103321] hover:bg-[#103321]/90 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
            >
              <Truck className="w-3.5 h-3.5 text-[#95C623]" />
              <span>Logistics Dispatch</span>
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
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs space-y-1">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
              Total Orders
            </span>
            <div className="text-xl font-extrabold text-[#103321]">
              {kpis.totalOrders}
            </div>
            <span className="text-[10px] text-gray-500 block">All mock orders</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs space-y-1">
            <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider block">
              Pending Review
            </span>
            <div className="text-xl font-extrabold text-amber-700">
              {kpis.pendingOrders}
            </div>
            <span className="text-[10px] text-gray-500 block">Awaiting confirmation</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs space-y-1">
            <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider block">
              Processing & QA
            </span>
            <div className="text-xl font-extrabold text-indigo-700">
              {kpis.processingOrders}
            </div>
            <span className="text-[10px] text-gray-500 block">Artisan packaging</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs space-y-1">
            <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider block">
              In Delivery
            </span>
            <div className="text-xl font-extrabold text-blue-700">
              {kpis.shippedOrders}
            </div>
            <span className="text-[10px] text-gray-500 block">Handed to courier</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs space-y-1 col-span-2 sm:col-span-1">
            <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider block">
              Total Revenue
            </span>
            <div className="text-xl font-extrabold text-[#103321]">
              {formatCurrency(kpis.totalRevenue)}
            </div>
            <span className="text-[10px] text-gray-500 block">From paid orders</span>
          </div>
        </div>

        {/* Filter Controls */}
        <OrderFilters
          searchTerm={searchTerm}
          setSearchTerm={(term) => {
            setSearchTerm(term)
            setCurrentPage(1)
          }}
          selectedOrderStatus={selectedOrderStatus}
          setSelectedOrderStatus={(st) => {
            setSelectedOrderStatus(st)
            setCurrentPage(1)
          }}
          selectedPaymentStatus={selectedPaymentStatus}
          setSelectedPaymentStatus={(ps) => {
            setSelectedPaymentStatus(ps)
            setCurrentPage(1)
          }}
          dateRange={dateRange}
          setDateRange={(dr) => {
            setDateRange(dr)
            setCurrentPage(1)
          }}
          sortBy={sortBy}
          setSortBy={setSortBy}
          onReset={handleResetFilters}
          totalResults={filteredOrders.length}
        />

        {/* Orders Table */}
        <OrderTable
          orders={paginatedOrders}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          onChangeStatus={handleOpenStatusModal}
          onCancelOrder={handleOpenCancelModal}
        />

        {/* Status Transition Modal */}
        {statusModalOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
            <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-gray-100 p-6 space-y-4">
              <div className="space-y-1">
                <h3 className="font-serif font-bold text-lg text-[#103321]">
                  Advance Order Status
                </h3>
                <p className="text-xs text-gray-500">
                  Order <span className="font-mono font-bold">{statusModalOrder.orderNumber}</span> • Current:{' '}
                  <span className="font-bold text-[#103321]">{statusModalOrder.orderStatus}</span>
                </p>
              </div>

              {statusError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
                  {statusError}
                </div>
              )}

              {/* Transition Selector */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-700">
                  Select Next Permitted Status
                </label>
                {VALID_ORDER_STATUS_TRANSITIONS[statusModalOrder.orderStatus]?.length > 0 ? (
                  <select
                    value={nextStatus}
                    onChange={(e) => setNextStatus(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-xs bg-white font-medium text-gray-800 outline-none focus:border-[#95C623]"
                  >
                    {VALID_ORDER_STATUS_TRANSITIONS[statusModalOrder.orderStatus].map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="p-3 bg-gray-50 rounded-xl text-xs text-gray-500">
                    This order is in terminal state ({statusModalOrder.orderStatus}) and cannot be transitioned further.
                  </div>
                )}
              </div>

              {/* Admin Note */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-700">
                  Admin Internal Note (Optional)
                </label>
                <textarea
                  rows={2}
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  placeholder="e.g. Quality inspection completed. Package transferred to driver."
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs outline-none focus:border-[#95C623] resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setStatusModalOrder(null)}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!nextStatus}
                  onClick={handleCommitStatusChange}
                  className="px-5 py-2 rounded-xl bg-[#103321] text-white text-xs font-bold hover:bg-[#103321]/90 shadow-sm disabled:opacity-40"
                >
                  Save Status
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Cancellation Confirmation Modal */}
        <ConfirmActionModal
          isOpen={Boolean(cancelModalOrder)}
          title={`Cancel Order ${cancelModalOrder?.orderNumber}?`}
          description="Are you sure you want to cancel this order? This will halt any active fulfillment and record an administrative cancellation in the order audit."
          warning="Order cancellation in this frontend milestone updates local status. In production, this operation triggers atomic inventory releases and refund requests."
          actionType="danger"
          confirmText="Yes, Cancel Order"
          requireInput={true}
          inputLabel="Reason for Order Cancellation"
          inputPlaceholder="e.g. Customer requested cancellation, out of stock variant, payment timeout..."
          inputRequired={true}
          onConfirm={handleConfirmCancellation}
          onCancel={() => setCancelModalOrder(null)}
        />
      </div>
    </AdminLayout>
  )
}
