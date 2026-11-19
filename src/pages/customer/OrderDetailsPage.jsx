import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Truck,
  ShoppingBag,
  Package,
  Calendar,
  CreditCard,
  MapPin,
  FileText,
  AlertCircle,
  ExternalLink,
} from 'lucide-react'
import CustomerLayout from '../../components/customer/CustomerLayout'
import OrderStatusBadge from '../../components/customer/OrderStatusBadge'
import { getStoredOrders } from '../../data/customerData'

export default function OrderDetailsPage() {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const orders = getStoredOrders()

  const order = orders.find(
    (o) => o.id === orderId || o.orderNumber === orderId
  )

  if (!order) {
    return (
      <CustomerLayout
        activeNav="orders"
        title="Order Details"
        subtitle="View the full receipt and shipment details for this order."
        breadcrumbs={[
          { label: 'Home', path: '/' },
          { label: 'My Account', path: '/account' },
          { label: 'My Orders', path: '/account/orders' },
          { label: 'Order Not Found' },
        ]}
      >
        <div className="p-12 text-center bg-white rounded-3xl border border-gray-100 shadow-xs space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 mx-auto flex items-center justify-center">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="font-serif font-bold text-lg text-[#103321]">
              Order Not Found
            </h3>
            <p className="text-xs text-gray-500">
              We couldn't locate order "{orderId}". It may have been removed, or the order identifier is invalid.
            </p>
          </div>
          <Link
            to="/account/orders"
            className="px-5 py-2.5 rounded-xl bg-[#103321] hover:bg-[#95C623] hover:text-[#103321] text-white text-xs font-bold transition-all inline-flex items-center gap-2 shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Order History</span>
          </Link>
        </div>
      </CustomerLayout>
    )
  }

  const formattedDate = new Date(order.orderDate).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  const hasShipment = Boolean(order.shipment && order.shipment.shipmentStatus !== 'Cancelled')

  return (
    <CustomerLayout
      activeNav="orders"
      title={`Order ${order.orderNumber}`}
      subtitle={`Placed on ${formattedDate}`}
      breadcrumbs={[
        { label: 'Home', path: '/' },
        { label: 'My Account', path: '/account' },
        { label: 'My Orders', path: '/account/orders' },
        { label: order.orderNumber },
      ]}
      action={
        <div className="flex items-center gap-2">
          {hasShipment && (
            <Link
              to={`/account/orders/${order.id}/tracking`}
              className="px-4 py-2.5 rounded-xl bg-[#95C623] text-[#103321] hover:bg-[#103321] hover:text-white text-xs font-bold transition-all shadow-sm flex items-center gap-2"
            >
              <Truck className="w-4 h-4" />
              <span>Track Shipment</span>
            </Link>
          )}

          <Link
            to="/account/orders"
            className="px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-xs font-bold transition-colors flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Back to Orders</span>
          </Link>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Status Bar Card */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#103321] text-[#95C623] flex items-center justify-center font-bold text-sm shrink-0">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono font-bold text-base text-[#103321]">
                  {order.orderNumber}
                </span>
                <OrderStatusBadge status={order.orderStatus} type="order" />
                <OrderStatusBadge status={order.paymentStatus} type="payment" />
              </div>
              <p className="text-xs text-gray-500 mt-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                <span>{formattedDate}</span>
                {order.paymentMethod && (
                  <>
                    <span>•</span>
                    <span className="font-medium text-gray-700">{order.paymentMethod}</span>
                  </>
                )}
              </p>
            </div>
          </div>

          <div className="sm:text-right border-t sm:border-t-0 pt-3 sm:pt-0 border-gray-100">
            <span className="text-xs text-gray-400 block font-medium">Order Total</span>
            <span className="font-serif text-2xl font-extrabold text-[#103321]">
              {order.totalAmount.toLocaleString()} {order.currency || 'ETB'}
            </span>
          </div>
        </div>

        {/* 2-Column Grid: Left is Order Items, Right is Summary & Snapshots */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column (2 cols): Items List */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <h3 className="font-serif font-bold text-base text-[#103321] flex items-center gap-2">
                  <Package className="w-4 h-4 text-[#95C623]" />
                  <span>Purchased Items ({order.items?.length || 0})</span>
                </h3>
                <span className="text-xs text-gray-400">Historical Snapshot</span>
              </div>

              <div className="divide-y divide-gray-100">
                {order.items?.map((item, idx) => (
                  <div key={idx} className="py-4 first:pt-0 last:pb-0 flex items-start gap-4">
                    <div className="w-20 h-24 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 shrink-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <h4 className="font-serif font-bold text-sm text-[#103321] leading-tight">
                        {item.name}
                      </h4>
                      {item.amharicName && (
                        <p className="text-xs font-serif text-gray-500">{item.amharicName}</p>
                      )}

                      <div className="flex items-center gap-3 text-xs text-gray-500 pt-1 flex-wrap">
                        {item.sku && (
                          <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-[11px] text-gray-600">
                            SKU: {item.sku}
                          </span>
                        )}
                        {item.size && (
                          <span>
                            Size: <strong className="text-gray-800">{item.size}</strong>
                          </span>
                        )}
                        {item.color && (
                          <span>
                            Color: <strong className="text-gray-800">{item.color}</strong>
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <span className="text-xs text-gray-500">
                          Qty: <strong className="text-gray-800">{item.quantity}</strong> ×{' '}
                          {item.price?.toLocaleString()} ETB
                        </span>
                        <span className="font-serif font-bold text-sm text-[#103321]">
                          {item.itemTotal?.toLocaleString()} ETB
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipment preview card if exists */}
            {order.shipment && (
              <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <h3 className="font-serif font-bold text-base text-[#103321] flex items-center gap-2">
                    <Truck className="w-4 h-4 text-[#95C623]" />
                    <span>Shipment Status</span>
                  </h3>
                  <OrderStatusBadge status={order.shipment.shipmentStatus} type="order" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                    <span className="text-gray-400 block text-[11px]">Courier</span>
                    <span className="font-bold text-gray-800">{order.shipment.courierName || 'Local Courier'}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                    <span className="text-gray-400 block text-[11px]">Tracking Number</span>
                    <span className="font-mono font-bold text-[#103321]">{order.shipment.trackingNumber || 'Pending'}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                    <span className="text-gray-400 block text-[11px]">Est. Delivery</span>
                    <span className="font-bold text-gray-800">
                      {order.shipment.estimatedDelivery
                        ? new Date(order.shipment.estimatedDelivery).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })
                        : 'Within 2-3 business days'}
                    </span>
                  </div>
                </div>

                {hasShipment && (
                  <div className="pt-2 text-right">
                    <Link
                      to={`/account/orders/${order.id}/tracking`}
                      className="text-xs font-bold text-[#103321] hover:text-[#95C623] inline-flex items-center gap-1 transition-colors"
                    >
                      <span>View Live Delivery Timeline</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column (1 col): Summary, Shipping Address, Payment */}
          <div className="space-y-6">
            {/* Order Summary Card */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs space-y-3">
              <h3 className="font-serif font-bold text-base text-[#103321] pb-2 border-b border-gray-100">
                Order Financial Summary
              </h3>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-medium text-gray-900">
                    {order.subtotal?.toLocaleString()} {order.currency}
                  </span>
                </div>

                <div className="flex items-center justify-between text-gray-600">
                  <span>Discount</span>
                  <span className="font-medium text-emerald-600">
                    {order.discountAmount > 0 ? `-${order.discountAmount.toLocaleString()} ${order.currency}` : '0 ETB'}
                  </span>
                </div>

                <div className="flex items-center justify-between text-gray-600">
                  <span>Shipping Fee</span>
                  <span className="font-medium text-gray-900">
                    {order.shippingCost === 0 ? 'Free Shipping' : `${order.shippingCost?.toLocaleString()} ${order.currency}`}
                  </span>
                </div>

                {order.taxAmount > 0 && (
                  <div className="flex items-center justify-between text-gray-600">
                    <span>Tax (VAT)</span>
                    <span className="font-medium text-gray-900">
                      {order.taxAmount?.toLocaleString()} {order.currency}
                    </span>
                  </div>
                )}

                <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                  <span className="font-bold text-sm text-[#103321]">Total Paid</span>
                  <span className="font-serif font-extrabold text-lg text-[#103321]">
                    {order.totalAmount?.toLocaleString()} {order.currency}
                  </span>
                </div>
              </div>
            </div>

            {/* Shipping Address Snapshot Card */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs space-y-3">
              <h3 className="font-serif font-bold text-base text-[#103321] flex items-center gap-2 pb-2 border-b border-gray-100">
                <MapPin className="w-4 h-4 text-[#95C623]" />
                <span>Shipping Destination</span>
              </h3>

              {order.shippingAddress ? (
                <div className="text-xs text-gray-600 space-y-1">
                  <p className="font-bold text-gray-900 text-sm">
                    {order.shippingAddress.recipientName}
                  </p>
                  <p className="text-gray-500">{order.shippingAddress.phone}</p>
                  <div className="pt-1 text-gray-700 leading-relaxed">
                    <p>{order.shippingAddress.addressLine1}</p>
                    {order.shippingAddress.addressLine2 && (
                      <p>{order.shippingAddress.addressLine2}</p>
                    )}
                    <p>
                      {order.shippingAddress.city}, {order.shippingAddress.region}
                    </p>
                    <p className="font-semibold text-[#103321]">
                      {order.shippingAddress.country || 'Ethiopia'}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-gray-400 italic">No delivery address recorded.</p>
              )}
            </div>

            {/* Payment Snapshot Card */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs space-y-3">
              <h3 className="font-serif font-bold text-base text-[#103321] flex items-center gap-2 pb-2 border-b border-gray-100">
                <CreditCard className="w-4 h-4 text-[#95C623]" />
                <span>Payment Details</span>
              </h3>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Method</span>
                  <span className="font-bold text-gray-800">{order.paymentMethod || 'Local Payment'}</span>
                </div>

                {order.paymentReference && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Reference #</span>
                    <span className="font-mono text-xs font-semibold text-gray-700">
                      {order.paymentReference}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Status</span>
                  <OrderStatusBadge status={order.paymentStatus} type="payment" />
                </div>

                {order.paymentDate && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Confirmed</span>
                    <span className="text-gray-700">
                      {new Date(order.paymentDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Continue Shopping Action */}
            <div className="p-4 rounded-2xl bg-radial from-[#103321] to-[#0a2015] text-white text-center space-y-3 shadow-sm">
              <p className="text-xs text-gray-200">
                Explore more artisan creations and cultural outfits from across Ethiopia.
              </p>
              <Link
                to="/shop"
                className="w-full py-2.5 rounded-xl bg-[#95C623] text-[#103321] hover:bg-white text-xs font-bold transition-colors inline-flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Continue Shopping</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </CustomerLayout>
  )
}
