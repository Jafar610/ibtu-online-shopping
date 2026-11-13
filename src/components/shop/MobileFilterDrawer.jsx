import { X, Check, SlidersHorizontal } from 'lucide-react'
import SizeFilter from './SizeFilter'
import ColorFilter from './ColorFilter'
import AvailabilityFilter from './AvailabilityFilter'
import PriceRangeFilter from './PriceRangeFilter'

const CATEGORY_OPTIONS = [
  { id: 'mens-collection', label: "Men's Fashion" },
  { id: 'womens-collection', label: "Women's Fashion" },
  { id: 'habesha-kemis', label: 'Habesha Kemis' },
  { id: 'traditional-wear', label: 'Traditional Wear' },
  { id: 'accessories', label: 'Accessories' },
]

const PRODUCT_TYPES = [
  { id: 'isNewArrival', label: 'New Arrivals' },
  { id: 'isBestSeller', label: 'Best Sellers' },
  { id: 'isFeatured', label: 'Featured' },
  { id: 'isTraditional', label: 'Traditional' },
]

export default function MobileFilterDrawer({ isOpen, onClose, filters, onFilterChange, onClearAll }) {
  const toggleCategory = (catId) => {
    const current = filters.categories
    const updated = current.includes(catId)
      ? current.filter((c) => c !== catId)
      : [...current, catId]
    onFilterChange('categories', updated)
  }

  const toggleType = (typeId) => {
    const current = filters.productTypes
    const updated = current.includes(typeId)
      ? current.filter((t) => t !== typeId)
      : [...current, typeId]
    onFilterChange('productTypes', updated)
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 left-0 z-50 w-80 max-w-[90vw] bg-white flex flex-col shadow-2xl animate-slideRight">
        {/* Drawer header */}
        <div className="flex items-center justify-between px-5 py-4 bg-[#103321] shrink-0">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-[#95C623]" />
            <span className="font-bold text-white">Filter Products</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {/* Categories */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#103321] mb-3">
              Categories
            </h3>
            <div className="space-y-2">
              {CATEGORY_OPTIONS.map((cat) => {
                const isChecked = filters.categories.includes(cat.id)
                return (
                  <label
                    key={cat.id}
                    className="flex items-center gap-3 cursor-pointer group"
                    onClick={() => toggleCategory(cat.id)}
                  >
                    <div
                      className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-all duration-200 ${
                        isChecked
                          ? 'bg-[#95C623] border-[#95C623]'
                          : 'border-gray-300 group-hover:border-[#103321]'
                      }`}
                    >
                      {isChecked && (
                        <Check className="w-2.5 h-2.5 text-[#103321]" strokeWidth={3} />
                      )}
                    </div>
                    <span className="text-sm font-medium text-gray-700">{cat.label}</span>
                  </label>
                )
              })}
            </div>
          </div>

          {/* Price */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#103321] mb-3">
              Price Range
            </h3>
            <PriceRangeFilter
              min={0}
              max={10000}
              value={filters.priceRange}
              onChange={(range) => onFilterChange('priceRange', range)}
            />
          </div>

          {/* Size */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#103321] mb-3">
              Size
            </h3>
            <SizeFilter
              selected={filters.sizes}
              onChange={(sizes) => onFilterChange('sizes', sizes)}
            />
          </div>

          {/* Color */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#103321] mb-3">
              Color
            </h3>
            <ColorFilter
              selected={filters.colors}
              onChange={(colors) => onFilterChange('colors', colors)}
            />
          </div>

          {/* Availability */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#103321] mb-3">
              Availability
            </h3>
            <AvailabilityFilter
              value={filters.availability}
              onChange={(avail) => onFilterChange('availability', avail)}
            />
          </div>

          {/* Product Type */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#103321] mb-3">
              Product Type
            </h3>
            <div className="space-y-2">
              {PRODUCT_TYPES.map((type) => {
                const isChecked = filters.productTypes.includes(type.id)
                return (
                  <label
                    key={type.id}
                    className="flex items-center gap-3 cursor-pointer group"
                    onClick={() => toggleType(type.id)}
                  >
                    <div
                      className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-all duration-200 ${
                        isChecked
                          ? 'bg-[#95C623] border-[#95C623]'
                          : 'border-gray-300 group-hover:border-[#103321]'
                      }`}
                    >
                      {isChecked && (
                        <Check className="w-2.5 h-2.5 text-[#103321]" strokeWidth={3} />
                      )}
                    </div>
                    <span className="text-sm font-medium text-gray-700">{type.label}</span>
                  </label>
                )
              })}
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="shrink-0 px-5 py-4 border-t border-gray-100 flex gap-3">
          <button
            onClick={() => { onClearAll(); onClose() }}
            className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-xs font-bold text-gray-500 hover:border-red-300 hover:text-red-500 transition-all cursor-pointer"
          >
            Clear All
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl bg-[#95C623] text-[#103321] text-xs font-bold hover:bg-[#82ad1e] transition-all cursor-pointer shadow-sm"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </>
  )
}
