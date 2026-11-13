import { ArrowRight } from 'lucide-react'
import { products } from '../../data/products'
import ProductGrid from '../product/ProductGrid'
import promoBanner from '../../assets/Promotional-Banner.jpg'

export default function BestSellers({ onQuickView, onViewAll }) {
  // Best seller products (take the remaining items from products data)
  const bestSellerProducts = products.filter((p) => p.isBestSeller).slice(4, 8).length >= 4
    ? products.filter((p) => p.isBestSeller).slice(4, 8)
    : products.slice(4, 8)

  return (
    <section id="best-sellers" className="py-12 sm:py-16 bg-[#F8F9FA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Best Sellers Full-Width Promotional Banner Card */}
        <div className="relative rounded-3xl overflow-hidden h-[280px] sm:h-[340px] lg:h-[380px] shadow-xl flex items-center">
          {/* Full-width Promotional-Banner.jpg background image */}
          <img
            src={promoBanner}
            alt="Best Sellers Promotion"
            className="absolute inset-0 w-full h-full object-cover object-center"
          />
          {/* Dark Overlay for optimal text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-black/25" />

          {/* Content: only description and button as requested */}
          <div className="relative z-10 p-6 sm:p-10 lg:p-14 max-w-xl space-y-4 sm:space-y-5 text-left">
            <p className="text-white text-base sm:text-xl lg:text-2xl font-normal leading-relaxed drop-shadow-sm">
              Discover unique fashion pieces inspired by the beauty of Ethiopian culture.
            </p>

            <div>
              <button
                onClick={onViewAll}
                className="bg-[#95C623] hover:bg-[#82ad1e] text-[#103321] font-bold text-xs sm:text-sm px-7 py-3 rounded-full inline-flex items-center gap-2.5 transition-all duration-200 shadow-md hover:shadow-[#95C623]/30 cursor-pointer active:scale-95"
              >
                <span>Shop Best Sellers</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </div>
        </div>

        {/* Best Seller Product Grid */}
        <div>
          <div className="flex items-center justify-between mb-6 pb-3 border-b border-gray-200">
            <div className="flex items-center gap-2.5">
              <h3 className="font-sans text-lg sm:text-xl font-bold text-[#103321] tracking-tight">
                Top Rated Collections
              </h3>
              <span className="w-6 h-1 bg-[#95C623] rounded-full hidden sm:inline-block" />
            </div>
            <button
              onClick={onViewAll}
              className="text-xs sm:text-sm font-bold text-[#95C623] hover:text-[#103321] transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span>Explore All</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <ProductGrid products={bestSellerProducts} onQuickView={onQuickView} />
        </div>

      </div>
    </section>
  )
}
