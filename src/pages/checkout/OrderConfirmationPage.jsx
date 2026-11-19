import { useParams, Link } from 'react-router-dom'
import {
  CheckCircle2,
  Package,
  Calendar,
  CreditCard,
  MapPin,
  Truck,
  ShoppingBag,
  ArrowRight,
  ExternalLink,
  AlertCircle,
  Clock,
  Sparkles,
} from 'lucide-react'
import AnnouncementBar from '../../components/layout/AnnouncementBar'
import Navbar from '../../components/layout/Navbar'
import Footer from '../../components/layout/Footer'
import CartDrawer from '../../components/cart/CartDrawer'
import SearchOverlay from '../../components/layout/SearchOverlay'
import MobileMenu from '../../components/layout/MobileMenu'
import QuickViewModal from '../../components/product/QuickViewModal'

import CheckoutProgress from '../../components/checkout/CheckoutProgress'
import OrderStatusBadge from '../../components/customer/OrderStatusBadge'
import { getStoredOrders } from '../../data/customerData'
import { useState } from 'react'

export default function OrderConfirmationPage() {
  const { orderId } = useParams()
  const orders = getStoredOrders()

  // Find order by ID or orderNumber
  const order = orders.find(
    (o) => o.id === orderId || o.orderNumber === orderId
  )

  // Layout states
  const [currentLang, setCurrentLang] = useState('EN')
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [quickViewProduct, setQuickViewProduct] = useState(null)

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA] text-[#1A1A1A]">
      {/* 1. Header Navigation */}
      <AnnouncementBar
        currentLang={currentLang}
        onLanguageChange={setCurrentLang}
      />
      <Navbar
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        currentLang={currentLang}
        onLanguageChange={setCurrentLang}
      />

      {/* 2. Checkout Progress Bar */}
      <CheckoutProgress currentStep="confirmation" />

      {/* 3. Main Content */}
      <main className="flex-1 py-10 sm:py-14">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {!order ? (
            /* Order Not Found State */
            <div className="text-center py-16 px-6 bg-white rounded-3xl border border-gray-100 shadow-xs space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 mx-auto flex items-center justify-center">
                <AlertCircle className="w-8 h-8" />
              </div>
              <h2 className="font-serif font-bold text-xl text-[#103321]">
                Order Details Unavailable
              </h2>
              <p className="text-xs text-gray-500 max-w-md mx-auto">
                We could not locate order "{orderId}". If you placed this order recently, please check your customer order history.
              </p>
              <div className="pt-2 flex items-center justify-center gap-3">
                <Link
                  to="/account/orders"
                  className="px-5 py-2.5 rounded-xl bg-[#103321] text-white hover:bg-[#95C623] hover:text-[#103321] text-xs font-bold transition-all shadow-xs"
                >
                  Go to My Orders
                </Link>
                <Link
                  to="/shop"
                  className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 text-xs font-bold transition-all"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          ) : (
            /* Confirmed Order Display */
            <div className="space-y-8 animate-fadeIn">
              {/* Celebratory Banner */}
              <div className="bg-white rounded-3xl border border-gray-100 p-8 sm:p-10 shadow-xs text-center space-y-4 relative overflow-hidden">
                <div className="w-20 h-20 rounded-full bg-[#95C623]/20 text-[#103321] mx-auto flex items-center justify-center ring-8 ring-[#95C623]/10">
                  <CheckCircle2 className="w-10 h-10 text-[#103321]" />
                </div>

                <div className="space-y-1">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#103321] text-[#95C623]">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Order Successfully Received</span>
                  </span>
                  <h1 className="font-serif font-extrabold text-2xl sm:text-3xl text-[#103321] pt-2">
                    Thank You for Your Order!
                  </h1>
                  <p className="text-xs sm:text-sm text-gray-500 max-w-lg mx-auto">
                    እንኳን ደስ አለዎት! Your handcrafted Ethiopian order has been recorded. Our team and artisans are preparing your cultural pieces with care.
                  </p>
                </div>

                {/* Key identifiers banner */}
                <div className="pt-4 flex flex-wrap items-center justify-center gap-4 text-xs">
                  <div className="px-4 py-2 rounded-xl bg-gray-50 border border-gray-200 text-left">
                    <span className="text-[10px] text-gray-400 block font-bold uppercase tracking-wider">
                      Order Number
                    </span>
                    <span className="font-mono font-bold text-base text-[#103321]">
                      {order.orderNumber}
                    </span>
                  </div>

                  <div className="px-4 py-2 rounded-xl bg-gray-50 border border-gray-200 text-left">
                    <span className="text-[10px] text-gray-400 block font-bold uppercase tracking-wider">
                      Order Date
                    </span>
                    <span className="font-bold text-gray-800">
                      {new Date(order.orderDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>

                  <div className="px-4 py-2 rounded-xl bg-gray-50 border border-gray-200 text-left">
                    <span className="text-[10px] text-gray-400 block font-bold uppercase tracking-wider">
                      Total Payable
                    </span>
                    <span className="font-serif font-extrabold text-base text-[#103321]">
                      {order.totalAmount?.toLocaleString()} ETB
                    </span>
                  </div>
                </div>
              </div>

              {/* Next Steps Guidance Card */}
              <div className="p-6 bg-radial from-white to-gray-50 rounded-3xl border border-gray-200 shadow-xs space-y-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-[#95C623]" />
                  <h3 className="font-serif font-bold text-base text-[#103321]">
                    What Happens Next?
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-gray-600">
                  <div className="p-4 rounded-2xl bg-white border border-gray-100 space-y-1">
                    <span className="font-bold text-gray-900 block">
                      1. Payment Verification
                    </span>
                    <p className="text-[11px] text-gray-500 leading-relaxed">
                      {order.paymentMethod?.toLowerCase().includes('cash')
                        ? 'Please prepare cash in Ethiopian Birr for courier collection upon delivery.'
                        : 'Our accounts team verifies your mobile money / bank transfer reference with the telecommunication provider.'}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-white border border-gray-100 space-y-1">
                    <span className="font-bold text-gray-900 block">
                      2. Artisan Inspection
                    </span>
                    <p className="text-[11px] text-gray-500 leading-relaxed">
                      Each traditional kemis and outfit is inspected for weaving precision before secure packaging.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-white border border-gray-100 space-y-1">
                    <span className="font-bold text-gray-900 block">
                      3. Courier Dispatch
                    </span>
                    <p className="text-[11px] text-gray-500 leading-relaxed">
                      Handed to Ethio Post Express or local courier. You will receive SMS alerts as your package moves.
                    </p>
                  </div>
                </div>
              </div>

              {/* 2-Column Details: Left is Items, Right is Destination & Payment */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                {/* Purchased Items */}
                <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-xs space-y-4">
                  <h3 className="font-serif font-bold text-base text-[#103321] flex items-center gap-2 pb-3 border-b border-gray-100">
                    <Package className="w-4 h-4 text-[#95C623]" />
                    <span>Purchased Items ({order.items?.length || 0})</span>
                  </h3>

                  <div className="divide-y divide-gray-100">
                    {order.items?.map((item, idx) => (
                      <div key={idx} className="py-3 first:pt-0 last:pb-0 flex items-center gap-3">
                        <div className="w-14 h-16 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 shrink-0">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <h4 className="font-serif font-bold text-xs text-[#103321] truncate">
                            {item.name}
                          </h4>
                          <p className="text-[11px] text-gray-500">
                            Qty: {item.quantity} • Size: {item.size} • Color: {item.color}
                          </p>
                        </div>

                        <span className="font-serif font-bold text-xs text-[#103321] shrink-0">
                          {item.itemTotal?.toLocaleString()} ETB
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Summary Totals */}
                  <div className="pt-3 border-t border-gray-100 space-y-1.5 text-xs text-gray-600">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span className="font-semibold text-gray-800">
                        {order.subtotal?.toLocaleString()} ETB
                      </span>
                    </div>
                    {order.discountAmount > 0 && (
                      <div className="flex justify-between text-emerald-700">
                        <span>Discount Applied</span>
                        <span className="font-semibold">
                          -{order.discountAmount?.toLocaleString()} ETB
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Shipping Cost</span>
                      <span className="font-semibold text-gray-800">
                        {order.shippingCost === 0 ? 'Free' : `${order.shippingCost?.toLocaleString()} ETB`}
                      </span>
                    </div>
                    <div className="pt-2 border-t border-gray-100 flex justify-between font-bold text-sm text-[#103321]">
                      <span>Total Paid / Payable</span>
                      <span className="font-serif font-extrabold text-base">
                        {order.totalAmount?.toLocaleString()} ETB
                      </span>
                    </div>
                  </div>
                </div>

                {/* Delivery & Payment Snapshots */}
                <div className="space-y-6">
                  {/* Delivery Address */}
                  <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-xs space-y-3">
                    <h3 className="font-serif font-bold text-base text-[#103321] flex items-center gap-2 pb-2 border-b border-gray-100">
                      <MapPin className="w-4 h-4 text-[#95C623]" />
                      <span>Delivery Address</span>
                    </h3>

                    {order.shippingAddress && (
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
                    )}
                  </div>

                  {/* Payment Details */}
                  <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-xs space-y-3">
                    <h3 className="font-serif font-bold text-base text-[#103321] flex items-center gap-2 pb-2 border-b border-gray-100">
                      <CreditCard className="w-4 h-4 text-[#95C623]" />
                      <span>Payment Summary</span>
                    </h3>

                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Method</span>
                        <span className="font-bold text-gray-800">
                          {order.paymentMethod}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500">Payment Status</span>
                        <OrderStatusBadge status={order.paymentStatus} type="payment" />
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500">Order Status</span>
                        <OrderStatusBadge status={order.orderStatus} type="order" />
                      </div>
                      {order.paymentReference && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Reference #</span>
                          <span className="font-mono text-gray-700 font-semibold">
                            {order.paymentReference}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  to={`/account/orders/${order.id}`}
                  className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-[#103321] hover:bg-[#95C623] hover:text-[#103321] text-white text-xs sm:text-sm font-bold transition-all shadow-md flex items-center justify-center gap-2"
                >
                  <Package className="w-4 h-4" />
                  <span>View in My Orders</span>
                </Link>

                <Link
                  to={`/account/orders/${order.id}/tracking`}
                  className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-[#95C623] text-[#103321] hover:bg-[#103321] hover:text-white text-xs sm:text-sm font-bold transition-all shadow-sm flex items-center justify-center gap-2"
                >
                  <Truck className="w-4 h-4" />
                  <span>Track Shipment</span>
                </Link>

                <Link
                  to="/shop"
                  className="w-full sm:w-auto px-6 py-3 rounded-2xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-xs sm:text-sm font-bold transition-colors flex items-center justify-center gap-2"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Continue Shopping</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* 4. Footer */}
      <Footer />

      {/* 5. Drawers and Overlays */}
      <CartDrawer />
      <SearchOverlay
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />
      <QuickViewModal
        product={quickViewProduct}
        isOpen={Boolean(quickViewProduct)}
        onClose={() => setQuickViewProduct(null)}
      />
    </div>
  )
}
