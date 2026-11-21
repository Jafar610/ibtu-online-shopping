import { useState, useEffect } from 'react'
import { ArrowRight } from 'lucide-react'
import { products as defaultProducts } from '../../data/products'
import { productApi } from '../../services/api/productApi'
import ProductGrid from '../product/ProductGrid'

export default function NewArrivals({ onQuickView, activeCategoryFilter = 'all' }) {
  const [selectedFilter, setSelectedFilter] = useState(null)
  const [items, setItems] = useState(defaultProducts)
  const currentFilter = selectedFilter ?? activeCategoryFilter

  useEffect(() => {
    let isMounted = true
    productApi
      .getCatalogProducts({ limit: 12, sort: 'newest' })
      .then((res) => {
        if (isMounted && res.products && res.products.length > 0) {
          setItems(res.products)
        }
      })
      .catch(() => {})

    return () => {
      isMounted = false
    }
  }, [])

  const filterTabs = [
    { id: 'all', label: 'All Items' },
    { id: 'mens-collection', label: "Men's Collection" },
    { id: 'habesha-kemis', label: 'Habesha Kemis' },
    { id: 'womens-collection', label: "Women's Modern" },
    { id: 'traditional-wear', label: 'Traditional Wear' },
  ]

  const arrivalProducts = items.filter((p) => p.isNewArrival || p.badge === 'New Arrival' || p.badge === 'Featured')

  const filtered =
    currentFilter === 'all'
      ? (arrivalProducts.length > 0 ? arrivalProducts : items)
      : items.filter((p) => p.category === currentFilter)

  const displayProducts = filtered.length > 0 ? filtered.slice(0, 8) : items.slice(0, 4)

  return (
    <section id="new-arrivals" className="py-12 sm:py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <h2 className="font-sans text-xl sm:text-2xl font-bold text-[#103321] tracking-tight">
              New Arrivals
            </h2>
            <span className="w-6 h-1 bg-[#95C623] rounded-full hidden sm:inline-block" />
          </div>

          <a
            href="/shop?sort=newest"
            className="text-xs sm:text-sm font-bold text-[#95C623] hover:text-[#103321] transition-colors flex items-center gap-1 cursor-pointer"
          >
            <span>View All</span>
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-4 mb-6">
          {filterTabs.map((tab) => {
            const isActive = currentFilter === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedFilter(tab.id)}
                className={`shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#103321] text-white shadow-xs'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                }`}
              >
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Product Grid */}
        <ProductGrid products={displayProducts} onQuickView={onQuickView} />
      </div>
    </section>
  )
}
