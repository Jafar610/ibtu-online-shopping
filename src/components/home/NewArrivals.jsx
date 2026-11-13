import { useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { products } from '../../data/products'
import ProductGrid from '../product/ProductGrid'

export default function NewArrivals({ onQuickView, activeCategoryFilter = 'all' }) {
  const [selectedFilter, setSelectedFilter] = useState(null)
  const currentFilter = selectedFilter ?? activeCategoryFilter

  const filterTabs = [
    { id: 'all', label: 'All Items' },
    { id: 'mens-collection', label: "Men's Collection" },
    { id: 'habesha-kemis', label: 'Habesha Kemis' },
    { id: 'womens-collection', label: "Women's Modern" },
    { id: 'traditional-wear', label: 'Traditional Wear' },
  ]

  // Filter products that are marked as new arrivals or match filter
  const arrivalProducts = products.filter((p) => p.isNewArrival || p.badge === 'New Arrival')

  const filtered = currentFilter === 'all'
    ? arrivalProducts
    : arrivalProducts.filter((p) => p.category === currentFilter)

  // Fallback if filter has 0: show at least some products
  const displayProducts = filtered.length > 0 ? filtered : products.slice(0, 4)

  return (
    <section id="new-arrivals" className="py-12 sm:py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header matching mockup */}
        <div className="flex items-center justify-between mb-6 pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <h2 className="font-sans text-xl sm:text-2xl font-bold text-[#103321] tracking-tight">
              New Arrivals
            </h2>
            <span className="w-6 h-1 bg-[#95C623] rounded-full hidden sm:inline-block" />
          </div>

          <button
            onClick={() => setSelectedFilter('all')}
            className="text-xs sm:text-sm font-bold text-[#95C623] hover:text-[#103321] transition-colors flex items-center gap-1 cursor-pointer"
          >
            <span>View All</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 sm:mb-8 no-scrollbar">
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedFilter(tab.id)}
              className={`text-xs font-semibold px-3.5 py-1.5 rounded-full transition-all cursor-pointer whitespace-nowrap ${
                currentFilter === tab.id
                  ? 'bg-[#103321] text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-[#95C623]/20 hover:text-[#103321]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 4 Cards per row on desktop */}
        <ProductGrid products={displayProducts.slice(0, 4)} onQuickView={onQuickView} />
      </div>
    </section>
  )
}
