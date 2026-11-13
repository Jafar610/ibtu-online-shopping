import { Star, ShoppingBag, Check, Eye } from 'lucide-react'
import { useState } from 'react'
import WishlistButton from '../wishlist/WishlistButton'
import { useCart } from '../../context/CartContext'

export default function ProductList({ products, onQuickView }) {
  return (
    <div className="space-y-3">
      {products.map((product) => (
        <ListCard key={product.id} product={product} onQuickView={onQuickView} />
      ))}
    </div>
  )
}

function ListCard({ product, onQuickView }) {
  const { addToCart } = useCart()
  const [isAdded, setIsAdded] = useState(false)

  const handleAddToCart = (e) => {
    e.stopPropagation()
    addToCart(product, 1)
    setIsAdded(true)
    setTimeout(() => setIsAdded(false), 1600)
  }

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0

  return (
    <div
      className="group bg-white rounded-2xl border border-gray-100 shadow-xs hover:shadow-md transition-all duration-300 flex gap-4 p-3 sm:p-4 cursor-pointer"
      onClick={() => onQuickView && onQuickView(product)}
    >
      {/* Image */}
      <div className="relative shrink-0 w-24 sm:w-32 aspect-[4/5] rounded-xl overflow-hidden bg-[#F4F5F6]">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105"
        />
        {product.badge && (
          <span
            className={`absolute top-1.5 left-1.5 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md ${
              product.badge.toLowerCase().includes('off') || product.badge.toLowerCase().includes('sale')
                ? 'bg-[#95C623] text-[#103321]'
                : 'bg-[#103321] text-[#95C623]'
            }`}
          >
            {product.badge}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-bold text-sm sm:text-base text-gray-900 group-hover:text-[#103321] transition-colors line-clamp-1">
                {product.name}
              </h3>
              <p className="text-[11px] text-[#95C623] font-medium mt-0.5">{product.amharicName}</p>
            </div>
            <WishlistButton product={product} size="sm" />
          </div>

          <p className="text-xs text-gray-500 mt-1.5 line-clamp-2 leading-relaxed hidden sm:block">
            {product.description}
          </p>

          {/* Rating */}
          <div className="flex items-center gap-1.5 mt-2">
            <div className="flex items-center gap-0.5">
              {[1,2,3,4,5].map((s) => (
                <Star
                  key={s}
                  className={`w-3 h-3 ${
                    s <= Math.round(product.rating)
                      ? 'fill-amber-400 stroke-amber-400'
                      : 'fill-gray-200 stroke-gray-200'
                  }`}
                />
              ))}
            </div>
            <span className="text-[11px] font-semibold text-gray-700">{product.rating}</span>
            <span className="text-[10px] text-gray-400">({product.reviewsCount})</span>
          </div>

          {/* Sizes */}
          <div className="flex flex-wrap gap-1 mt-2">
            {product.sizes.slice(0, 4).map((size) => (
              <span
                key={size}
                className="text-[9px] font-semibold px-1.5 py-0.5 rounded-md border border-gray-200 text-gray-500"
              >
                {size}
              </span>
            ))}
            {product.sizes.length > 4 && (
              <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-md border border-gray-200 text-gray-400">
                +{product.sizes.length - 4}
              </span>
            )}
          </div>
        </div>

        {/* Price + Actions */}
        <div className="flex items-center justify-between gap-3 mt-3">
          <div className="flex items-baseline gap-1.5">
            <span className="text-sm sm:text-base font-extrabold text-[#103321]">
              {product.price.toLocaleString()} ETB
            </span>
            {product.originalPrice && (
              <>
                <span className="text-xs text-gray-400 line-through">
                  {product.originalPrice.toLocaleString()} ETB
                </span>
                {discount > 0 && (
                  <span className="text-[10px] font-bold text-[#95C623]">-{discount}%</span>
                )}
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={(e) => { e.stopPropagation(); onQuickView && onQuickView(product) }}
              className="p-2 rounded-xl border border-gray-200 text-gray-400 hover:border-[#103321] hover:text-[#103321] transition-all duration-200 cursor-pointer hidden sm:flex"
              title="Quick View"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={handleAddToCart}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold text-xs transition-all duration-200 cursor-pointer shadow-xs active:scale-[0.98] ${
                isAdded
                  ? 'bg-[#103321] text-white'
                  : 'bg-[#95C623] hover:bg-[#82ad1e] text-[#103321]'
              }`}
            >
              {isAdded ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#95C623]" />
                  <span className="hidden sm:block">Added</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span className="hidden sm:block">Add to Cart</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

