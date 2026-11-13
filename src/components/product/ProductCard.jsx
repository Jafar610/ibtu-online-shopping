import { useState } from 'react'
import { ShoppingBag, Star, Check } from 'lucide-react'
import WishlistButton from '../wishlist/WishlistButton'
import { useCart } from '../../context/CartContext'

export default function ProductCard({ product, onQuickView }) {
  const { addToCart } = useCart()
  const [isAdded, setIsAdded] = useState(false)

  const handleAddToCart = (e) => {
    e.stopPropagation()
    addToCart(product, 1)
    setIsAdded(true)
    setTimeout(() => setIsAdded(false), 1600)
  }

  const handleCardClick = () => {
    if (onQuickView) onQuickView(product)
  }

  return (
    <div
      onClick={handleCardClick}
      className="group bg-white rounded-2xl border border-gray-100 p-3 sm:p-3.5 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between cursor-pointer"
    >
      <div>
        {/* Product Image Area */}
        <div className="relative aspect-[4/5] w-full rounded-xl overflow-hidden bg-[#F4F5F6]">
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105"
          />

          {/* Top Badges & Wishlist */}
          <div className="absolute top-2.5 left-2.5 right-2.5 flex items-start justify-between gap-2 z-10">
            {product.badge ? (
              <span
                className={`text-[10px] sm:text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md shadow-xs ${
                  product.badge.toLowerCase().includes('off') || product.badge.toLowerCase().includes('sale')
                    ? 'bg-[#95C623] text-[#103321]'
                    : 'bg-[#103321] text-[#95C623]'
                }`}
              >
                {product.badge}
              </span>
            ) : <span />}

            <WishlistButton product={product} size="sm" />
          </div>
        </div>

        {/* Product Information */}
        <div className="pt-3">
          {/* Title */}
          <h3 className="font-sans font-bold text-sm sm:text-[15px] text-gray-900 group-hover:text-[#103321] transition-colors truncate">
            {product.name}
          </h3>

          {/* Price & Rating Row */}
          <div className="flex items-center justify-between gap-2 mt-1.5">
            <div className="flex items-baseline gap-1.5">
              <span className="text-sm sm:text-base font-extrabold text-[#103321]">
                {product.price.toLocaleString()} ETB
              </span>
              {product.originalPrice && (
                <span className="text-[11px] text-gray-400 line-through">
                  {product.originalPrice.toLocaleString()} ETB
                </span>
              )}
            </div>

            {/* Rating */}
            <div className="flex items-center gap-1 text-[11px] font-semibold text-gray-700 shrink-0">
              <Star className="w-3.5 h-3.5 fill-amber-400 stroke-amber-400" />
              <span>{product.rating || 4.8}</span>
              <span className="text-gray-400 text-[10px]">({product.reviewsCount || 42})</span>
            </div>
          </div>
        </div>
      </div>

      {/* Full-width Lime Green Add to Cart Button */}
      <div className="pt-3">
        <button
          onClick={handleAddToCart}
          className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer shadow-xs active:scale-[0.98] ${
            isAdded
              ? 'bg-[#103321] text-white'
              : 'bg-[#95C623] hover:bg-[#82ad1e] text-[#103321]'
          }`}
        >
          {isAdded ? (
            <>
              <Check className="w-4 h-4 text-[#95C623]" />
              <span>Added to Cart</span>
            </>
          ) : (
            <>
              <ShoppingBag className="w-4 h-4 text-[#103321]" />
              <span>Add to Cart</span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}
