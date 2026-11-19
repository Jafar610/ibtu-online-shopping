import { ShoppingBag, ShieldCheck, Truck } from 'lucide-react'
import { useCart } from '../../context/CartContext'
import { useCheckout } from '../../context/CheckoutContext'
import CouponInput from './CouponInput'

export default function CheckoutOrderSummary({ showItemsList = true }) {
  const { cartItems, subtotal } = useCart()
  const { calculateTotals, appliedCoupon } = useCheckout()
  const { shippingFee, discountAmount, totalAmount, isFreeShipping } = calculateTotals(subtotal)

  return (
    <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-xs space-y-6">
      {/* Heading */}
      <div className="flex items-center justify-between pb-3 border-b border-gray-100">
        <h3 className="font-serif font-bold text-base text-[#103321] flex items-center gap-2">
          <ShoppingBag className="w-4 h-4 text-[#95C623]" />
          <span>Order Summary</span>
        </h3>
        <span className="text-xs text-gray-400">
          {cartItems.reduce((sum, item) => sum + item.quantity, 0)} items
        </span>
      </div>

      {/* Cart Items List */}
      {showItemsList && (
        <div className="max-h-60 overflow-y-auto divide-y divide-gray-100 pr-1 scrollbar-thin">
          {cartItems.map((item) => (
            <div key={item.key} className="py-3 first:pt-0 last:pb-0 flex items-center gap-3">
              <div className="w-14 h-16 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 shrink-0 relative">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-1 right-1 bg-[#103321] text-white text-[10px] font-bold px-1.5 py-0.2 rounded-md shadow-xs">
                  {item.quantity}x
                </span>
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="font-serif font-bold text-xs text-[#103321] truncate">
                  {item.name}
                </h4>
                <p className="text-[11px] text-gray-500">
                  Size: {item.size} • Color: {item.color}
                </p>
                <p className="text-[11px] text-gray-400">
                  {item.price.toLocaleString()} ETB each
                </p>
              </div>

              <span className="font-serif font-bold text-xs text-[#103321] shrink-0">
                {(item.price * item.quantity).toLocaleString()} ETB
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Coupon input */}
      <CouponInput />

      {/* Cost Breakdown */}
      <div className="space-y-2.5 text-xs text-gray-600 pt-3 border-t border-gray-100">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span className="font-medium text-gray-900">
            {subtotal.toLocaleString()} ETB
          </span>
        </div>

        {discountAmount > 0 && (
          <div className="flex justify-between text-emerald-700 font-semibold">
            <span>Discount ({appliedCoupon?.code})</span>
            <span>-{discountAmount.toLocaleString()} ETB</span>
          </div>
        )}

        <div className="flex justify-between">
          <span className="flex items-center gap-1.5">
            <span>Delivery Fee</span>
            {isFreeShipping && (
              <span className="text-[10px] bg-[#95C623]/20 text-[#103321] font-bold px-1.5 py-0.2 rounded">
                Free Nationwide
              </span>
            )}
          </span>
          <span className="font-medium text-gray-900">
            {isFreeShipping ? 'Free' : `${shippingFee.toLocaleString()} ETB`}
          </span>
        </div>

        <div className="flex justify-between text-gray-400">
          <span>Estimated VAT (15%)</span>
          <span>Included</span>
        </div>

        {/* Total */}
        <div className="pt-3 border-t border-gray-100 flex justify-between items-baseline">
          <div>
            <span className="text-sm font-bold text-[#103321] block">Total Amount</span>
            <span className="text-[10px] text-gray-400">Ethiopian Birr (ETB)</span>
          </div>
          <span className="font-serif text-2xl font-extrabold text-[#103321]">
            {totalAmount.toLocaleString()} ETB
          </span>
        </div>
      </div>

      {/* Assurance banner */}
      <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100 text-[11px] text-gray-500 space-y-1.5">
        <div className="flex items-center gap-1.5 text-gray-700 font-bold">
          <ShieldCheck className="w-4 h-4 text-[#95C623]" />
          <span>Authentic Handwoven Guarantee</span>
        </div>
        <p className="leading-relaxed">
          Every cultural attire item is individually crafted by certified Ethiopian artisans in Addis Ababa and surrounding regions.
        </p>
      </div>
    </div>
  )
}
