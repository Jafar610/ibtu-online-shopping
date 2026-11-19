import { MapPin, CreditCard, ShoppingBag, ArrowLeft, Check, ShieldCheck, AlertCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import { useCheckout } from '../../context/CheckoutContext'

export default function OrderReview({ onConfirmOrder, isSubmitting }) {
  const { cartItems, subtotal } = useCart()
  const { shippingAddress, paymentMethod, calculateTotals } = useCheckout()
  const { totalAmount, discountAmount, shippingFee } = calculateTotals(subtotal)

  const paymentLabels = {
    telebirr: 'Telebirr Mobile Money',
    cbe_birr: 'CBE Birr',
    bank_transfer: 'Direct Bank Transfer',
    cod: 'Cash on Delivery (COD)',
  }

  const isAddressComplete = Boolean(
    shippingAddress &&
    shippingAddress.recipientName &&
    shippingAddress.phone &&
    shippingAddress.addressLine1 &&
    shippingAddress.city
  )

  const canConfirm = cartItems.length > 0 && isAddressComplete && Boolean(paymentMethod)

  return (
    <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-xs space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-gray-100">
        <h3 className="font-serif font-bold text-base text-[#103321] flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#95C623]" />
          <span>Final Order Review</span>
        </h3>
        <span className="text-xs text-gray-400">Step 3 of 4</span>
      </div>

      {/* Shipping Address Review Box */}
      <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200/80 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[#103321] flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-[#95C623]" />
            <span>Shipping To:</span>
          </span>
          <Link
            to="/checkout"
            className="text-xs font-bold text-[#103321] hover:text-[#95C623] transition-colors"
          >
            Change
          </Link>
        </div>

        {shippingAddress ? (
          <div className="text-xs text-gray-600 pl-5 space-y-0.5">
            <p className="font-bold text-gray-800">
              {shippingAddress.recipientName} ({shippingAddress.phone})
            </p>
            <p>{shippingAddress.addressLine1}</p>
            {shippingAddress.addressLine2 && <p>{shippingAddress.addressLine2}</p>}
            <p>
              {shippingAddress.city}, {shippingAddress.region} • {shippingAddress.country || 'Ethiopia'}
            </p>
          </div>
        ) : (
          <p className="text-xs text-red-500 pl-5 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            <span>Missing shipping address. Please select or add an address.</span>
          </p>
        )}
      </div>

      {/* Payment Method Review Box */}
      <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200/80 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[#103321] flex items-center gap-1.5">
            <CreditCard className="w-3.5 h-3.5 text-[#95C623]" />
            <span>Selected Payment:</span>
          </span>
          <span className="text-xs font-bold text-[#103321]">
            {paymentLabels[paymentMethod] || 'Telebirr'}
          </span>
        </div>
        <p className="text-[11px] text-gray-500 pl-5">
          Order currency: <strong className="text-gray-700">Ethiopian Birr (ETB)</strong>
        </p>
      </div>

      {/* Financial Snapshot */}
      <div className="p-4 rounded-2xl bg-[#103321]/5 border border-[#103321]/15 space-y-2 text-xs">
        <div className="flex justify-between text-gray-600">
          <span>Items in Bag</span>
          <span className="font-bold text-gray-800">
            {cartItems.reduce((s, i) => s + i.quantity, 0)} items
          </span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span>Final Payable</span>
          <span className="font-serif font-extrabold text-base text-[#103321]">
            {totalAmount.toLocaleString()} ETB
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-3 pt-2">
        <button
          type="button"
          onClick={onConfirmOrder}
          disabled={!canConfirm || isSubmitting}
          className="w-full py-3.5 rounded-2xl bg-[#103321] hover:bg-[#95C623] hover:text-[#103321] text-white font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group"
        >
          {isSubmitting ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Confirm & Place Order</span>
            </>
          )}
        </button>

        <div className="flex items-center justify-between text-xs font-semibold text-gray-500 pt-1">
          <Link
            to="/checkout"
            className="hover:text-[#103321] flex items-center gap-1 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Shipping</span>
          </Link>
          <Link
            to="/cart"
            className="hover:text-[#103321] flex items-center gap-1 transition-colors"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Back to Bag</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
