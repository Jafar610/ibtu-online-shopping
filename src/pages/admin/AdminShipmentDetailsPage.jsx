import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  ArrowLeft,
  Truck,
  Package,
  MapPin,
  Calendar,
  Clock,
  Phone,
  CheckCircle2,
  AlertTriangle,
  Edit3,
  ExternalLink,
  ShoppingBag,
  FileText,
  Copy,
  Check,
} from 'lucide-react'
import AdminLayout from '../../components/admin/AdminLayout'
import AdminBreadcrumb from '../../components/admin/AdminBreadcrumb'
import AdminStatusBadge from '../../components/admin/AdminStatusBadge'
import ShipmentTimeline from '../../components/admin/ShipmentTimeline'
import ShipmentFormModal from '../../components/admin/ShipmentFormModal'
import {
  getStoredAdminShipments,
  updateAdminShipment,
  VALID_SHIPMENT_STATUS_TRANSITIONS,
} from '../../data/admin/adminSalesData'

export default function AdminShipmentDetailsPage() {
  const { shipmentId } = useParams()
  const [shipment, setShipment] = useState(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [feedback, setFeedback] = useState(null)

  const showFeedback = (msg, type = 'success') => {
    setFeedback({ msg, type })
    setTimeout(() => setFeedback(null), 4000)
  }

  const loadShipment = () => {
    const list = getStoredAdminShipments()
    const found = list.find((s) => s.id === shipmentId || s.shipmentNumber === shipmentId)
    setShipment(found || null)
  }

  useEffect(() => {
    loadShipment()
  }, [shipmentId])

  if (!shipment) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <AdminBreadcrumb
            items={[
              { label: 'Sales Management' },
              { label: 'Shipments', path: '/admin/shipments' },
              { label: 'Not Found' },
            ]}
          />
          <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h2 className="font-serif font-bold text-xl text-[#103321]">
              Shipment Record Not Found
            </h2>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              No shipment matching identifier "{shipmentId}" was found in local storage.
            </p>
            <Link
              to="/admin/shipments"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#103321] text-white text-xs font-bold hover:bg-[#103321]/90"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Shipments</span>
            </Link>
          </div>
        </div>
      </AdminLayout>
    )
  }

  const handleCopyTracking = () => {
    if (!shipment.trackingNumber) return
    navigator.clipboard?.writeText(shipment.trackingNumber)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleAdvanceStatus = (targetStatus) => {
    const res = updateAdminShipment(shipment.id, { shipmentStatus: targetStatus })
    if (res.success) {
      loadShipment()
      showFeedback(`Shipment status advanced to "${targetStatus}".`)
    } else {
      alert(res.message || 'Status transition failed.')
    }
  }

  const handleEditSubmit = (payload) => {
    const res = updateAdminShipment(shipment.id, payload)
    if (res.success) {
      loadShipment()
      setIsEditModalOpen(false)
      showFeedback('Shipment details updated successfully.')
      return { success: true }
    }
    return res
  }

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

  const allowedTransitions = VALID_SHIPMENT_STATUS_TRANSITIONS[shipment.shipmentStatus] || []

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Breadcrumb Navigation */}
        <AdminBreadcrumb
          items={[
            { label: 'Sales Management' },
            { label: 'Shipments', path: '/admin/shipments' },
            { label: shipment.shipmentNumber },
          ]}
        />

        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              to="/admin/shipments"
              className="p-2 rounded-xl border border-gray-200 hover:bg-white text-gray-600 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="font-serif font-extrabold text-2xl text-[#103321]">
                  Shipment {shipment.shipmentNumber}
                </h1>
                <AdminStatusBadge status={shipment.shipmentStatus} type="shipment" />
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Tracking: <span className="font-mono font-bold text-[#103321]">{shipment.trackingNumber}</span> • Order{' '}
                <Link to={`/admin/orders/${shipment.orderId}`} className="font-bold text-[#103321] hover:underline">
                  {shipment.orderNumber}
                </Link>
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            {allowedTransitions.map((next) => (
              <button
                key={next}
                type="button"
                onClick={() => handleAdvanceStatus(next)}
                className="px-3.5 py-2 rounded-xl bg-[#103321] hover:bg-[#103321]/90 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-[#95C623]" />
                <span>Mark as {next}</span>
              </button>
            ))}

            <button
              type="button"
              onClick={() => setIsEditModalOpen(true)}
              className="px-3.5 py-2 rounded-xl border border-gray-200 hover:bg-white text-xs font-bold text-gray-700 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5 text-gray-500" />
              <span>Edit Details</span>
            </button>
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

        {/* 2-Column Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column (2 cols): Logistics Timeline & Overview */}
          <div className="lg:col-span-2 space-y-6">
            {/* Courier & Tracking Specs */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-xs p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-[#103321]" />
                  <h3 className="font-serif font-bold text-base text-[#103321]">
                    Carrier & Dispatch Information
                  </h3>
                </div>

                <div className="inline-flex items-center gap-1.5 bg-gray-100 px-3 py-1 rounded-xl font-mono text-xs text-gray-800">
                  <span>{shipment.trackingNumber}</span>
                  <button
                    type="button"
                    onClick={handleCopyTracking}
                    className="text-gray-400 hover:text-[#103321] transition-colors cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                    Courier Provider
                  </span>
                  <span className="font-bold text-gray-900 text-sm block">
                    {shipment.courierName}
                  </span>
                  <span className="text-gray-500 font-mono text-[11px] block mt-0.5">
                    {shipment.courierPhone}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                    Current Status
                  </span>
                  <div className="mt-1">
                    <AdminStatusBadge status={shipment.shipmentStatus} type="shipment" />
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                    Estimated Delivery
                  </span>
                  <span className="font-bold text-gray-800 block text-sm">
                    {formatDate(shipment.estimatedDelivery)}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                    Shipping Cost
                  </span>
                  <span className="font-bold text-gray-800 block text-sm">
                    {shipment.shippingCost === 0 ? 'FREE' : `${shipment.shippingCost} ETB`}
                  </span>
                </div>
              </div>

              {shipment.deliveryNotes && (
                <div className="pt-2 border-t border-gray-100">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                    Delivery Instructions / Notes
                  </span>
                  <p className="text-xs text-gray-700 bg-gray-50 p-3 rounded-xl italic">
                    "{shipment.deliveryNotes}"
                  </p>
                </div>
              )}
            </div>

            {/* Visual Shipment Timeline */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-xs p-5 sm:p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#103321]" />
                  <h3 className="font-serif font-bold text-base text-[#103321]">
                    Milestone Tracking History
                  </h3>
                </div>

                <span className="text-[11px] text-gray-400 italic">
                  Simulated postal milestones
                </span>
              </div>

              <ShipmentTimeline
                stages={shipment.stages}
                shipmentStatus={shipment.shipmentStatus}
              />
            </div>
          </div>

          {/* Right Column (1 col): Recipient & Linked Order */}
          <div className="space-y-6">
            {/* Delivery Recipient Snapshot */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-xs p-5 sm:p-6 space-y-3">
              <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                <MapPin className="w-4 h-4 text-[#103321]" />
                <h3 className="font-serif font-bold text-sm text-[#103321]">
                  Delivery Address Snapshot
                </h3>
              </div>

              <div className="space-y-1.5 text-xs text-gray-700">
                <span className="font-bold text-gray-900 block">
                  {shipment.shippingAddress?.recipientName || shipment.customer?.name}
                </span>
                <span className="text-gray-600 block">
                  {shipment.shippingAddress?.addressLine1}
                </span>
                {shipment.shippingAddress?.addressLine2 && (
                  <span className="text-gray-600 block">
                    {shipment.shippingAddress.addressLine2}
                  </span>
                )}
                <span className="text-gray-600 block">
                  {shipment.shippingAddress?.city}, {shipment.shippingAddress?.region}
                </span>
                <span className="text-gray-500 font-medium block">
                  {shipment.shippingAddress?.country || 'Ethiopia'} • Phone: {shipment.shippingAddress?.phone || shipment.customer?.phone}
                </span>
              </div>
            </div>

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
                  to={`/admin/orders/${shipment.orderId}`}
                  className="text-xs font-bold text-[#103321] hover:text-[#95C623] inline-flex items-center gap-1"
                >
                  <span>View Order</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-[10px] text-gray-400 font-bold block uppercase">
                    Order Number
                  </span>
                  <span className="font-bold text-[#103321] text-sm">
                    {shipment.orderNumber}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-gray-400 font-bold block uppercase">
                    Order Identifier
                  </span>
                  <span className="font-mono text-gray-600">
                    {shipment.orderId}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Shipment Modal */}
        <ShipmentFormModal
          isOpen={isEditModalOpen}
          mode="edit"
          shipment={shipment}
          onClose={() => setIsEditModalOpen(false)}
          onSubmit={handleEditSubmit}
        />
      </div>
    </AdminLayout>
  )
}
