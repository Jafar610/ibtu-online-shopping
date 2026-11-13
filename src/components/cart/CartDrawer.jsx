import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, Truck, Check } from 'lucide-react'
import { useCart } from '../../context/CartContext'
import Button from '../common/Button'

export default function CartDrawer() {
  const {
    isCartOpen,
    closeCart,
    cartItems,
    removeFromCart,
    updateQuantity,
    subtotal,
    totalItems,
    freeShippingThreshold,
    progressToFreeShipping,
    remainingForFreeShipping,
    clearCart,
  } = useCart()

  if (!isCartOpen) return null

  const shippingCost = subtotal >= freeShippingThreshold || subtotal === 0 ? 0 : 250
  const finalTotal = subtotal + shippingCost

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={closeCart}
      />

      {/* Slide-over panel */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white text-[#1A1A1A] shadow-2xl flex flex-col">
          {/* Drawer Header */}
          <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-[#103321] text-white">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#95C623] text-[#103321] flex items-center justify-center font-bold">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-lg leading-tight">
                  Your Shopping Bag
                </h3>
                <span className="text-xs text-[#95C623]">
                  {totalItems} {totalItems === 1 ? 'item' : 'items'} selected
                </span>
              </div>
            </div>

            <button
              onClick={closeCart}
              className="p-1.5 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress Bar */}
          <div className="bg-[#95C623]/15 px-5 py-3 border-b border-[#95C623]/20">
            <div className="flex items-center justify-between text-xs font-semibold text-[#103321] mb-1.5">
              <span className="flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-[#103321]" />
                {remainingForFreeShipping === 0 ? (
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Free Nationwide Shipping Unlocked!
                  </span>
                ) : (
                  <span>
                    Add <strong className="text-[#103321] font-bold">{remainingForFreeShipping.toLocaleString()} ETB</strong> more for Free Shipping!
                  </span>
                )}
              </span>
              <span>{progressToFreeShipping}%</span>
            </div>
            <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
              <div
                className="bg-[#95C623] h-full transition-all duration-300 rounded-full"
                style={{ width: `${progressToFreeShipping}%` }}
              />
            </div>
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {cartItems.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-16 h-16 rounded-full bg-gray-100 text-gray-400 mx-auto flex items-center justify-center mb-4">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h4 className="font-serif text-lg font-bold text-[#103321]">
                  Your bag is empty
                </h4>
                <p className="text-sm text-gray-500 mt-1 max-w-xs mx-auto">
                  Discover our authentic handwoven Habesha Kemis and modern Ethiopian fashion.
                </p>
                <Button
                  onClick={closeCart}
                  variant="forest"
                  size="sm"
                  className="mt-6"
                >
                  Start Shopping
                </Button>
              </div>
            ) : (
              cartItems.map((item) => (
                <div
                  key={item.key}
                  className="flex gap-4 pb-4 border-b border-gray-100 last:border-0 group"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-24 object-cover rounded-xl shrink-0 bg-gray-100"
                  />
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-sm font-bold text-[#103321] leading-snug truncate">
                          {item.name}
                        </h4>
                        <button
                          onClick={() => removeFromCart(item.key)}
                          className="text-gray-400 hover:text-red-500 transition-colors p-1"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Size: {item.size} {item.color ? `• ${item.color}` : ''}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                        <button
                          onClick={() => updateQuantity(item.key, item.quantity - 1)}
                          className="p-1 px-2 text-gray-600 hover:bg-gray-100 hover:text-black transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 text-xs font-bold text-[#103321]">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.key, item.quantity + 1)}
                          className="p-1 px-2 text-gray-600 hover:bg-gray-100 hover:text-black transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="text-right">
                        <span className="text-sm font-bold text-[#103321]">
                          {(item.price * item.quantity).toLocaleString()} ETB
                        </span>
                        {item.quantity > 1 && (
                          <p className="text-[10px] text-gray-400">
                            {item.price.toLocaleString()} ETB each
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Drawer Footer with Totals & Checkout */}
          {cartItems.length > 0 && (
            <div className="p-5 border-t border-gray-100 bg-[#F8F9FA] space-y-3">
              <div className="space-y-1.5 text-xs text-gray-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-gray-900">
                    {subtotal.toLocaleString()} ETB
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Shipping</span>
                  <span className="font-semibold text-gray-900">
                    {shippingCost === 0 ? (
                      <span className="text-emerald-600 uppercase font-bold">Free</span>
                    ) : (
                      `${shippingCost} ETB`
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-base font-bold text-[#103321] pt-2 border-t border-gray-200">
                  <span>Total Amount</span>
                  <span className="text-lg text-[#103321]">
                    {finalTotal.toLocaleString()} ETB
                  </span>
                </div>
              </div>

              <Button
                variant="primary"
                size="lg"
                className="w-full font-bold shadow-md"
                icon={ArrowRight}
                iconPosition="right"
                onClick={() => {
                  alert(
                    `Proceeding to checkout with ${totalItems} item(s) totaling ${finalTotal.toLocaleString()} ETB! (Prototype demonstration - Telebirr & CBE Birr ready)`
                  )
                }}
              >
                Proceed to Checkout
              </Button>

              <div className="flex items-center justify-between pt-1">
                <button
                  onClick={clearCart}
                  className="text-xs text-gray-400 hover:text-red-600 transition-colors cursor-pointer"
                >
                  Clear Bag
                </button>
                <button
                  onClick={closeCart}
                  className="text-xs text-gray-600 hover:text-[#103321] font-medium transition-colors cursor-pointer"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

