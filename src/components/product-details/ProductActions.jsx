import { useState } from 'react'
import { ShoppingBag, Zap, Check, Heart, Share2, Package } from 'lucide-react'
import { useCart } from '../../context/CartContext'
import { useWishlist } from '../../context/WishlistContext'

export default function ProductActions({
  product,
  selectedSize,
  selectedColor,
  quantity,
  onSizeRequired,
}) {
  const { addToCart, openCart } = useCart()
  const { toggleWishlist, isInWishlist } = useWishlist()
  const [isAdded, setIsAdded] = useState(false)
  const [sizeError, setSizeError] = useState(false)

  const needsSize = product.sizes && product.sizes.length > 0 && !product.sizes.includes('One Size')

  const validate = () => {
    if (needsSize && !selectedSize) {
      setSizeError(true)
      onSizeRequired?.()
      setTimeout(() => setSizeError(false), 3000)
      return false
    }
    return true
  }

  const handleAddToCart = () => {
    if (!validate()) return
    addToCart(product, quantity, selectedSize, selectedColor)
    setIsAdded(true)
    setTimeout(() => setIsAdded(false), 2000)
  }

  const handleBuyNow = () => {
    if (!validate()) return
    addToCart(product, quantity, selectedSize, selectedColor)
    openCart()
  }

  const subtotal = product.price * quantity

  return (
    <div className="space-y-3">
      {/* Subtotal */}
      {quantity > 1 && (
        <div className="flex items-center justify-between bg-[#95C623]/10 rounded-xl px-4 py-2.5 border border-[#95C623]/30">
          <span className="text-xs font-semibold text-gray-600">Subtotal ({quantity} items)</span>
          <span className="text-sm font-extrabold text-[#103321]">
            {subtotal.toLocaleString()} ETB
          </span>
        </div>
      )}

      {/* Size error */}
      {sizeError && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">
          <p className="text-xs font-semibold text-red-600">⚠ Please select a size before adding to cart.</p>
        </div>
      )}

      {/* Add to Cart */}
      <button
        onClick={handleAddToCart}
        disabled={!product.inStock}
        className={`w-full py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2.5 transition-all duration-200 cursor-pointer shadow-sm active:scale-[0.98] ${
          !product.inStock
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : isAdded
            ? 'bg-[#103321] text-white'
            : 'bg-[#95C623] hover:bg-[#82ad1e] text-[#103321]'
        }`}
      >
        {isAdded ? (
          <>
            <Check className="w-5 h-5 text-[#95C623]" />
            Added to Cart!
          </>
        ) : (
          <>
            <ShoppingBag className="w-5 h-5" />
            {product.inStock ? 'Add to Cart' : 'Out of Stock'}
          </>
        )}
      </button>

      {/* Buy Now */}
      {product.inStock && (
        <button
          onClick={handleBuyNow}
          className="w-full py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2.5 bg-[#103321] hover:bg-[#1a4d35] text-white transition-all duration-200 cursor-pointer shadow-sm active:scale-[0.98]"
        >
          <Zap className="w-5 h-5 text-[#95C623]" />
          Buy Now
        </button>
      )}

      {/* Secondary actions */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => toggleWishlist(product)}
          className={`flex-1 py-2.5 rounded-xl border-2 font-semibold text-xs flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer ${
            isInWishlist(product?.id || product?.slug)
              ? 'border-red-400 bg-red-50 text-red-500'
              : 'border-gray-200 text-gray-500 hover:border-[#103321] hover:text-[#103321]'
          }`}
        >
          <Heart className={`w-4 h-4 ${isInWishlist(product?.id || product?.slug) ? 'fill-red-400 stroke-red-400' : ''}`} />
          {isInWishlist(product?.id || product?.slug) ? 'Wishlisted' : 'Add to Wishlist'}
        </button>
        <button
          onClick={() => {
            if (navigator.share) {
              navigator.share({ title: product.name, url: window.location.href })
            } else {
              navigator.clipboard?.writeText(window.location.href)
            }
          }}
          className="p-2.5 rounded-xl border-2 border-gray-200 text-gray-500 hover:border-[#103321] hover:text-[#103321] transition-all cursor-pointer"
          title="Share product"
        >
          <Share2 className="w-4 h-4" />
        </button>
      </div>

      {/* Trust badges */}
      <div className="grid grid-cols-3 gap-2 pt-1">
        {[
          { icon: Package, label: 'Free Shipping', sub: 'Over 2,000 ETB' },
          { icon: Check, label: 'Easy Returns', sub: 'Within 7 days' },
          { icon: ShoppingBag, label: 'Secure Pay', sub: '100% Safe' },
        ].map(({ icon: Icon, label, sub }) => (
          <div key={label} className="flex flex-col items-center text-center p-2 bg-gray-50 rounded-xl border border-gray-100">
            <Icon className="w-4 h-4 text-[#95C623] mb-1" />
            <span className="text-[9px] font-bold text-[#103321] leading-tight">{label}</span>
            <span className="text-[9px] text-gray-400 leading-tight">{sub}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

