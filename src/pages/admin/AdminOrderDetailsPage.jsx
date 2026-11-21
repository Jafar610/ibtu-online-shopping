import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  User,
  ShoppingBag,
  CreditCard,
  Truck,
  MapPin,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Edit2,
  Save,
  ExternalLink,
  PlusCircle,
  FileText,
} from 'lucide-react'
import AdminLayout from '../../components/admin/AdminLayout'
import AdminBreadcrumb from '../../components/admin/AdminBreadcrumb'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import AdminStatusBadge from '../../components/admin/AdminStatusBadge'
import ConfirmActionModal from '../../components/admin/ConfirmActionModal'
import ShipmentTimeline from '../../components/admin/ShipmentTimeline'
import {
  getStoredAdminOrders,
  getStoredAdminPayments,
  getStoredAdminShipments,
  updateOrderStatus,
  updateOrderAdminNotes,
  VALID_ORDER_STATUS_TRANSITIONS,
} from '../../data/admin/adminSalesData'

export default function AdminOrderDetailsPage() {
  const { orderId } = useParams()
  const navigate = useNavigate()

  const [order, setOrder] = useState(null)
  const [payment, setPayment] = useState(null)
  const [shipment, setShipment] = useState(null)

  // Editing admin notes
  const [isEditingNotes, setIsEditingNotes] = useState(false)
  const [adminNotesText, setAdminNotesText] = useState('')

  // Confirmation Modal
  const [cancelModalOpen, setCancelModalOpen] = useState(false)
  const [feedback, setFeedback] = useState(null)

  const showFeedback = (msg, type = 'success') => {
    setFeedback({ msg, type })
    setTimeout(() => setFeedback(null), 4000)
  }

  const loadData = () => {
    const orders = getStoredAdminOrders()
    const foundOrder = orders.find((o) => o.id === orderId || o.orderNumber === orderId)
    if (foundOrder) {
      setOrder(foundOrder)
      setAdminNotesText(foundOrder.notes?.adminNotes || '')

      // Find linked payment
      const payments = getStoredAdminPayments()
      const foundPayment = payments.find(
        (p) => p.orderId === foundOrder.id || p.orderNumber === foundOrder.orderNumber
      )
      setPayment(foundPayment || null)

      // Find linked shipment
      const shipments = getStoredAdminShipments()
      const foundShipment = shipments.find(
        (s) => s.id === foundOrder.shipmentId || s.orderId === foundOrder.id
      )
      setShipment(foundShipment || null)
    }
  }

  useEffect(() => {
    loadData()
  }, [orderId])

  if (!order) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <AdminBreadcrumb
            items={[
              { label: 'Sales Management' },
              { label: 'Orders', path: '/admin/orders' },
              { label: 'Not Found' },
            ]}
          />
          <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h2 className="font-serif font-bold text-xl text-[#103321]">
              Order Not Found
            </h2>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              No order record matching identifier "{orderId}" was found in the admin state repository.
            </p>
            <Link
              to="/admin/orders"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#103321] text-white text-xs font-bold hover:bg-[#103321]/90"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Orders List</span>
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

  // Handle status advance
  const handleTransitionStatus = (targetStatus) => {
    const res = updateOrderStatus(
      order.id,
      targetStatus,
      `Status updated to ${targetStatus} via Admin Order Inspector`
    )
    if (res.success) {
      loadData()
      showFeedback(`Order status moved to "${targetStatus}".`)
    } else {
      alert(res.message || 'Status transition failed.')
    }
  }

  // Handle Save Notes
  const handleSaveNotes = () => {
    const res = updateOrderAdminNotes(order.id, adminNotesText.trim())
    if (res.success) {
      setIsEditingNotes(false)
      loadData()
      showFeedback('Admin internal notes saved successfully.')
    }
  }

  // Handle cancellation
  const handleCancelOrder = (reason) => {
    const res = updateOrderStatus(
      order.id,
      'Cancelled',
      `Order cancelled by admin. Reason: ${reason || 'Customer request'}`
    )
    if (res.success) {
      setCancelModalOpen(false)
      loadData()
      showFeedback(`Order ${order.orderNumber} cancelled.`, 'warning')
    } else {
      alert(res.message || 'Cancellation failed.')
    }
  }

  const allowedTransitions = VALID_ORDER_STATUS_TRANSITIONS[order.orderStatus] || []
  const canCancel =
    order.orderStatus !== 'Cancelled' &&
    order.orderStatus !== 'Delivered' &&
    order.orderStatus !== 'Refunded'

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Breadcrumb Navigation */}
        <AdminBreadcrumb
          items={[
            { label: 'Sales Management' },
            { label: 'Orders', path: '/admin/orders' },
            { label: order.orderNumber },
          ]}
        />

        {/* Header with Title and Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              to="/admin/orders"
              className="p-2 rounded-xl border border-gray-200 hover:bg-white text-gray-600 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="font-serif font-extrabold text-2xl text-[#103321]">
                  Order {order.orderNumber}
                </h1>
                <AdminStatusBadge status={order.orderStatus} type="order" />
                <AdminStatusBadge status={order.paymentStatus} type="payment" />
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Placed on {formatDate(order.orderDate)} • System ID: <span className="font-mono">{order.id}</span>
              </p>
            </div>
          </div>

          {/* Quick Action Progression Bar */}
          <div className="flex items-center gap-2 flex-wrap">
            {allowedTransitions.map((target) => (
              <button
                key={target}
                type="button"
                onClick={() => handleTransitionStatus(target)}
                className="px-3.5 py-2 rounded-xl bg-[#103321] hover:bg-[#103321]/90 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-[#95C623]" />
                <span>Mark as {target}</span>
              </button>
            ))}

            {canCancel && (
              <button
                type="button"
                onClick={() => setCancelModalOpen(true)}
                className="px-3.5 py-2 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Cancel Order</span>
              </button>
            )}
          </div>
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

        {/* Main Content Layout: 2 Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column (2 cols): Items Snapshot & Summary */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items Table */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-xs overflow-hidden">
              <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-[#103321]" />
                  <h3 className="font-serif font-bold text-base text-[#103321]">
                    Purchased Items Snapshot ({order.items?.length || 0})
                  </h3>
                </div>
                <span className="text-[11px] text-gray-400 italic">
                  Immutable line snapshots
                </span>
              </div>

              <div className="divide-y divide-gray-100">
                {(order.items || []).map((item, idx) => (
                  <div key={idx} className="p-4 sm:p-5 flex items-center gap-4">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 rounded-2xl object-cover border border-gray-100 bg-gray-50 shrink-0"
                    />

                    <div className="flex-1 min-w-0 space-y-1">
                      <h4 className="font-bold text-xs text-gray-900 truncate">
                        {item.name}
                      </h4>
                      {item.amharicName && (
                        <p className="text-[11px] text-[#103321]/80 font-serif">
                          {item.amharicName}
                        </p>
                      )}
                      <div className="flex items-center gap-2 text-[10px] text-gray-500 font-mono flex-wrap">
                        <span>SKU: {item.sku}</span>
                        <span>•</span>
                        <span>Size: {item.size}</span>
                        <span>•</span>
                        <span>Color: {item.color}</span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-xs font-bold text-gray-900">
                        {formatCurrency(item.price)} × {item.quantity}
                      </div>
                      <div className="text-sm font-extrabold text-[#103321] mt-0.5">
                        {formatCurrency(item.itemTotal || item.price * item.quantity)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Financial Summary Breakdown */}
              <div className="p-5 bg-gray-50/60 border-t border-gray-100 space-y-2 text-xs">
                <div className="flex items-center justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(order.subtotal)}
                  </span>
                </div>

                {order.discountAmount > 0 && (
                  <div className="flex items-center justify-between text-emerald-600">
                    <span>Voucher / Heritage Discount</span>
                    <span className="font-semibold">
                      -{formatCurrency(order.discountAmount)}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between text-gray-600">
                  <span>Standard Shipping Fee</span>
                  <span className="font-semibold text-gray-900">
                    {order.shippingCost === 0 ? 'FREE' : formatCurrency(order.shippingCost)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-gray-600">
                  <span>Ethiopian VAT (15% Included)</span>
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(order.taxAmount)}
                  </span>
                </div>

                <div className="pt-2 border-t border-gray-200 flex items-center justify-between text-sm">
                  <span className="font-bold text-[#103321]">Total Amount</span>
                  <span className="font-extrabold text-base text-[#103321]">
                    {formatCurrency(order.totalAmount)}
                  </span>
                </div>
              </div>
            </div>

            {/* Shipment & Tracking Inspector */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-xs p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-[#103321]" />
                  <h3 className="font-serif font-bold text-base text-[#103321]">
                    Shipment & Logistics Dispatch
                  </h3>
                </div>

                {shipment ? (
                  <Link
                    to={`/admin/shipments/${shipment.id}`}
                    className="text-xs font-bold text-[#103321] hover:text-[#95C623] inline-flex items-center gap-1"
                  >
                    <span>Inspect Full Dispatch</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                ) : (
                  <Link
                    to="/admin/shipments"
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#95C623] hover:underline"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Create Shipment</span>
                  </Link>
                )}
              </div>

              {shipment ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-gray-50/70 p-3.5 rounded-2xl text-xs">
                    <div>
                      <span className="text-[10px] text-gray-400 font-bold block uppercase">
                        Courier
                      </span>
                      <span className="font-bold text-gray-800">
                        {shipment.courierName}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-gray-400 font-bold block uppercase">
                        Tracking Number
                      </span>
                      <span className="font-mono font-bold text-[#103321]">
                        {shipment.trackingNumber}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-gray-400 font-bold block uppercase">
                        Status
                      </span>
                      <div className="mt-0.5">
                        <AdminStatusBadge status={shipment.shipmentStatus} type="shipment" />
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] text-gray-400 font-bold block uppercase">
                        Estimated Delivery
                      </span>
                      <span className="font-medium text-gray-700">
                        {formatDate(shipment.estimatedDelivery)}
                      </span>
                    </div>
                  </div>

                  {/* Shipment Tracking Timeline */}
                  <div className="pt-2">
                    <ShipmentTimeline
                      stages={shipment.stages}
                      shipmentStatus={shipment.shipmentStatus}
                    />
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-gray-50 rounded-2xl text-center text-xs text-gray-500">
                  No shipment has been generated for this order yet.
                </div>
              )}
            </div>

            {/* Admin Internal Notes Editor */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-xs p-5 sm:p-6 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#103321]" />
                  <h3 className="font-serif font-bold text-base text-[#103321]">
                    Internal Administrative Notes
                  </h3>
                </div>

                {!isEditingNotes ? (
                  <button
                    type="button"
                    onClick={() => setIsEditingNotes(true)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-gray-600 hover:text-[#103321] cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit Notes</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSaveNotes}
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#95C623] hover:text-[#103321] cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save</span>
                  </button>
                )}
              </div>

              {isEditingNotes ? (
                <div className="space-y-2">
                  <textarea
                    rows={3}
                    value={adminNotesText}
                    onChange={(e) => setAdminNotesText(e.target.value)}
                    placeholder="Add operational notes about fulfillment, artisan tailoring, customer requests..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs outline-none focus:border-[#95C623] resize-none"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsEditingNotes(false)}
                      className="px-3 py-1.5 text-xs text-gray-500 font-bold hover:bg-gray-100 rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveNotes}
                      className="px-4 py-1.5 bg-[#103321] text-white text-xs font-bold rounded-lg"
                    >
                      Commit Note
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-gray-700 bg-gray-50 p-3.5 rounded-2xl leading-relaxed italic">
                  {order.notes?.adminNotes || 'No internal admin notes recorded for this order.'}
                </p>
              )}

              {order.notes?.customerNotes && (
                <div className="pt-2">
                  <span className="text-[11px] font-bold text-gray-400 block uppercase tracking-wider mb-1">
                    Customer Delivery Instructions
                  </span>
                  <p className="text-xs text-gray-600 bg-amber-50/60 p-3 rounded-xl border border-amber-200/60">
                    "{order.notes.customerNotes}"
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column (1 col): Customer, Shipping Address, Payment */}
          <div className="space-y-6">
            {/* Customer Information Card */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-xs p-5 sm:p-6 space-y-4">
              <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                <User className="w-4 h-4 text-[#103321]" />
                <h3 className="font-serif font-bold text-sm text-[#103321]">
                  Customer Profile
                </h3>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#103321]/10 text-[#103321] font-bold text-xs flex items-center justify-center shrink-0">
                  {order.customer?.avatar || order.customer?.name?.slice(0, 2).toUpperCase() || 'CU'}
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-xs text-gray-900 truncate">
                    {order.customer?.name}
                  </h4>
                  <span className="text-[10px] text-gray-400 block">
                    {order.customer?.accountType || 'Registered Customer'}
                  </span>
                </div>
              </div>

              <div className="space-y-2 text-xs pt-1 border-t border-gray-100">
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                    Email Address
                  </span>
                  <span className="text-gray-800 break-all font-medium">
                    {order.customer?.email || 'N/A'}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                    Phone Number
                  </span>
                  <span className="text-gray-800 font-medium">
                    {order.customer?.phone || order.shippingAddress?.phone}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                    Member Since
                  </span>
                  <span className="text-gray-600">
                    {order.customer?.memberSince || 'January 2026'}
                  </span>
                </div>
              </div>
            </div>

            {/* Shipping Address Snapshot */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-xs p-5 sm:p-6 space-y-3">
              <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                <MapPin className="w-4 h-4 text-[#103321]" />
                <h3 className="font-serif font-bold text-sm text-[#103321]">
                  Delivery Address Snapshot
                </h3>
              </div>

              <div className="space-y-1.5 text-xs text-gray-700">
                <span className="font-bold text-gray-900 block">
                  {order.shippingAddress?.recipientName}
                </span>
                <span className="text-gray-600 block">
                  {order.shippingAddress?.addressLine1}
                </span>
                {order.shippingAddress?.addressLine2 && (
                  <span className="text-gray-600 block">
                    {order.shippingAddress.addressLine2}
                  </span>
                )}
                <span className="text-gray-600 block">
                  {order.shippingAddress?.city}, {order.shippingAddress?.region}
                </span>
                <span className="text-gray-500 block font-medium">
                  {order.shippingAddress?.country || 'Ethiopia'} • Phone: {order.shippingAddress?.phone}
                </span>
              </div>
            </div>

            {/* Payment Information Card */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-xs p-5 sm:p-6 space-y-3">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-[#103321]" />
                  <h3 className="font-serif font-bold text-sm text-[#103321]">
                    Payment Details
                  </h3>
                </div>

                {payment && (
                  <Link
                    to={`/admin/payments/${payment.id}`}
                    className="text-xs font-bold text-[#103321] hover:text-[#95C623] inline-flex items-center gap-1"
                  >
                    <span>View Slip</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                )}
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Method</span>
                  <span className="font-bold text-gray-900">{order.paymentMethod}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Reference</span>
                  <span className="font-mono font-bold text-xs text-gray-800">
                    {order.paymentReference}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Payment Status</span>
                  <AdminStatusBadge status={order.paymentStatus} type="payment" />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Amount Paid</span>
                  <span className="font-extrabold text-[#103321]">
                    {formatCurrency(order.totalAmount)}
                  </span>
                </div>

                {payment?.receipt?.hasReceipt && (
                  <div className="pt-2 border-t border-gray-100">
                    <span className="text-[10px] text-gray-400 uppercase font-bold block mb-1">
                      Verification Status
                    </span>
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                          payment.receipt.reviewStatus === 'approved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : payment.receipt.reviewStatus === 'rejected'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800 animate-pulse'
                        }`}
                      >
                        {payment.receipt.reviewStatus ? payment.receipt.reviewStatus.toUpperCase() : 'PENDING'}
                      </span>

                      <Link
                        to={`/admin/payments/${payment.id}`}
                        className="text-xs font-bold text-[#103321] hover:underline"
                      >
                        Inspect Receipt
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Cancellation Confirmation Dialog */}
        <ConfirmActionModal
          isOpen={cancelModalOpen}
          title={`Cancel Order ${order.orderNumber}?`}
          description="Are you sure you want to cancel this order? This will halt any active packaging and courier dispatch."
          warning="Order cancellation in this frontend milestone simulates status changes. In production, this will trigger automatic inventory releases and refund workflows."
          actionType="danger"
          confirmText="Confirm Cancellation"
          requireInput={true}
          inputLabel="Reason for Cancellation"
          inputPlaceholder="Please provide a clear reason for cancellation..."
          inputRequired={true}
          onConfirm={handleCancelOrder}
          onCancel={() => setCancelModalOpen(false)}
        />
      </div>
    </AdminLayout>
  )
}
