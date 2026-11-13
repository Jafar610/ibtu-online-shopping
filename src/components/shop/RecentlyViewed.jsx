import { Clock, Eye } from 'lucide-react'
import { useCart } from '../../context/CartContext'
import { Star, ShoppingBag } from 'lucide-react'

export default function RecentlyViewed({ products, onQuickView }) {
  if (!products || products.length === 0) return null

  return (
    <section className="mt-10 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center gap-2 mb-5">
        <Clock className="w-4 h-4 text-[#95C623]" />
        <h3 className="font-serif text-base font-bold text-[#103321]">Recently Viewed</h3>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {products.map((product) => (
          <RecentCard key={product.id} product={product} onQuickView={onQuickView} />
        ))}
      </div>
    </section>
  )
}

function RecentCard({ product, onQuickView }) {
  const { addToCart } = useCart()

  return (
    <div
      className="group bg-white rounded-xl border border-gray-100 p-2.5 shadow-xs hover:shadow-md transition-all duration-300 cursor-pointer"
      onClick={() => onQuickView && onQuickView(product)}
    >
      <div className="relative aspect-[4/5] rounded-lg overflow-hidden bg-[#F4F5F6] mb-2.5">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <button
          onClick={(e) => { e.stopPropagation(); onQuickView && onQuickView(product) }}
          className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        >
          <span className="flex items-center gap-1 text-white text-[10px] font-semibold bg-[#103321] rounded-lg px-2 py-1">
            <Eye className="w-3 h-3" />
            Quick View
          </span>
        </button>
      </div>
      <h4 className="text-xs font-bold text-gray-900 truncate">{product.name}</h4>
      <div className="flex items-center justify-between mt-1">
        <span className="text-[11px] font-extrabold text-[#103321]">
          {product.price.toLocaleString()} ETB
        </span>
        <div className="flex items-center gap-0.5">
          <Star className="w-2.5 h-2.5 fill-amber-400 stroke-amber-400" />
          <span className="text-[9px] font-semibold text-gray-600">{product.rating}</span>
        </div>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation()
          addToCart(product, 1)
        }}
        className="mt-2 w-full py-1.5 rounded-lg bg-[#95C623] text-[#103321] text-[10px] font-bold flex items-center justify-center gap-1 hover:bg-[#82ad1e] transition-colors cursor-pointer"
      >
        <ShoppingBag className="w-3 h-3" />
        Add to Cart
      </button>
    </div>
  )
}

