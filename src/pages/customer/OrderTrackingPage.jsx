import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  ArrowLeft,
  Truck,
  Phone,
  Calendar,
  Package,
  Check,
  Copy,
  AlertCircle,
  HelpCircle,
  ShieldCheck,
} from 'lucide-react'
import CustomerLayout from '../../components/customer/CustomerLayout'
import TrackingTimeline from '../../components/customer/TrackingTimeline'
import OrderStatusBadge from '../../components/customer/OrderStatusBadge'
import { getStoredOrders } from '../../data/customerData'

export default function OrderTrackingPage() {
  const { orderId } = useParams()
  const [copied, setCopied] = useState(false)
  const orders = getStoredOrders()

  const order = orders.find(
    (o) => o.id === orderId || o.orderNumber === orderId
  )

  if (!order) {
    return (
      <CustomerLayout
        activeNav="orders"
        title="Track Shipment"
        subtitle="Follow the step-by-step dispatch and courier journey of your order."
        breadcrumbs={[
          { label: 'Home', path: '/' },
          { label: 'My Account', path: '/account' },
          { label: 'My Orders', path: '/account/orders' },
          { label: 'Tracking Not Found' },
        ]}
      >
        <div className="p-12 text-center bg-white rounded-3xl border border-gray-100 shadow-xs space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 mx-auto flex items-center justify-center">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="font-serif font-bold text-lg text-[#103321]">
              Shipment Tracking Unavailable
            </h3>
            <p className="text-xs text-gray-500">
              We could not find shipment details for order "{orderId}". The order ID may be incorrect.
            </p>
          </div>
          <Link
            to="/account/orders"
            className="px-5 py-2.5 rounded-xl bg-[#103321] hover:bg-[#95C623] hover:text-[#103321] text-white text-xs font-bold transition-all inline-flex items-center gap-2 shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Orders</span>
          </Link>
        </div>
      </CustomerLayout>
    )
  }

  const shipment = order.shipment
  const trackingNumber = shipment?.trackingNumber || 'ET-PENDING'

  const handleCopyTracking = () => {
    if (shipment?.trackingNumber) {
      navigator.clipboard?.writeText(shipment.trackingNumber)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <CustomerLayout
      activeNav="orders"
      title={`Live Tracking: ${order.orderNumber}`}
      subtitle="Follow the real-time fulfillment and courier dispatch across Ethiopia."
      breadcrumbs={[
        { label: 'Home', path: '/' },
        { label: 'My Account', path: '/account' },
        { label: 'My Orders', path: '/account/orders' },
        { label: order.orderNumber, path: `/account/orders/${order.id}` },
        { label: 'Tracking' },
      ]}
      action={
        <Link
          to={`/account/orders/${order.id}`}
          className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-xs font-bold transition-colors flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>View Order Details</span>
        </Link>
      }
    >
      <div className="space-y-6">
        {/* Courier Summary Banner */}
        <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-7 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-gray-100">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[#103321] text-[#95C623] flex items-center justify-center shrink-0 shadow-sm">
                <Truck className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-serif font-bold text-lg sm:text-xl text-[#103321]">
                    {shipment?.courierName || 'Ethio Post Express'}
                  </span>
                  {shipment?.shipmentStatus && (
                    <OrderStatusBadge status={shipment.shipmentStatus} type="order" />
                  )}
                </div>

                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <span>Tracking Number:</span>
                  <span className="font-mono font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded">
                    {trackingNumber}
                  </span>
                  {shipment?.trackingNumber && (
                    <button
                      type="button"
                      onClick={handleCopyTracking}
                      className="p-1 text-gray-400 hover:text-[#103321] transition-colors cursor-pointer"
                      title="Copy tracking number"
                    >
                      {copied ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Estimated Delivery Box */}
            <div className="p-4 rounded-2xl bg-radial from-gray-50 to-white border border-gray-200/70 sm:min-w-[220px]">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                Estimated Delivery
              </span>
              <span className="font-serif text-base sm:text-lg font-extrabold text-[#103321] block mt-0.5">
                {shipment?.estimatedDelivery
                  ? new Date(shipment.estimatedDelivery).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })
                  : 'Estimated 2-4 business days'}
              </span>
              {shipment?.courierPhone && shipment.courierPhone !== 'N/A' && (
                <a
                  href={`tel:${shipment.courierPhone}`}
                  className="text-xs text-[#103321] hover:text-[#95C623] font-bold flex items-center gap-1.5 mt-2 transition-colors"
                >
                  <Phone className="w-3 h-3 text-[#95C623]" />
                  <span>Call Courier: {shipment.courierPhone}</span>
                </a>
              )}
            </div>
          </div>

          {/* Timeline Section */}
          <div className="pt-8 max-w-2xl mx-auto">
            <h3 className="font-serif font-bold text-base text-[#103321] mb-6 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#95C623]" />
              <span>Shipment Milestones</span>
            </h3>

            <TrackingTimeline
              shipment={shipment}
              orderStatus={order.orderStatus}
            />
          </div>
        </div>

        {/* 2-Column Info & Support Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Package Content Snapshot */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs space-y-4">
            <h3 className="font-serif font-bold text-base text-[#103321] flex items-center gap-2 pb-2 border-b border-gray-100">
              <Package className="w-4 h-4 text-[#95C623]" />
              <span>Package Contents ({order.items?.length || 0})</span>
            </h3>

            <div className="space-y-3">
              {order.items?.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="w-12 h-14 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 shrink-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-serif font-bold text-xs text-[#103321] truncate">
                      {item.name}
                    </p>
                    <p className="text-[11px] text-gray-500">
                      Qty: {item.quantity} • Size: {item.size || 'Standard'}
                    </p>
                  </div>
                  <span className="font-serif font-bold text-xs text-[#103321]">
                    {item.itemTotal?.toLocaleString()} ETB
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
              <span>Destination:</span>
              <span className="font-bold text-gray-800">
                {order.shippingAddress?.city}, {order.shippingAddress?.country || 'Ethiopia'}
              </span>
            </div>
          </div>

          {/* Delivery Support & Assurance */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <h3 className="font-serif font-bold text-base text-[#103321] flex items-center gap-2 pb-2 border-b border-gray-100">
                <ShieldCheck className="w-4 h-4 text-[#95C623]" />
                <span>IBTU Delivery Assurance</span>
              </h3>

              <div className="space-y-2.5 text-xs text-gray-600 leading-relaxed">
                <p>
                  • <strong>Inspected Before Dispatch:</strong> Every Ethiopian handmade cultural garment is rigorously checked for weave quality and artisan authenticity.
                </p>
                <p>
                  • <strong>Local Delivery Networks:</strong> We partner with trusted courier services across Addis Ababa and major Ethiopian regional cities.
                </p>
                <p>
                  • <strong>Need Assistance?</strong> If you have questions regarding courier arrival or address updates, contact our support team.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 flex items-center justify-between gap-3">
              <div className="text-xs">
                <span className="text-gray-400 block">IBTU Support Line</span>
                <span className="font-bold text-[#103321]">+251 91 123 4567</span>
              </div>
              <Link
                to="/contact"
                className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-[#103321] text-gray-700 hover:text-white text-xs font-bold transition-all"
              >
                Contact Support
              </Link>
            </div>
          </div>
        </div>
      </div>
    </CustomerLayout>
  )
}
