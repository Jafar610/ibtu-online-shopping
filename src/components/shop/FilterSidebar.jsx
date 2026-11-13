import { Check } from 'lucide-react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'
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

function FilterSection({ label, children }) {
  const [open, setOpen] = useState(true)
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-3.5 text-left cursor-pointer"
      >
        <span className="text-xs font-bold uppercase tracking-wider text-[#103321]">{label}</span>
        {open ? (
          <ChevronUp className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-400" />
        )}
      </button>
      {open && <div className="pb-4">{children}</div>}
    </div>
  )
}

export default function FilterSidebar({
  filters,
  onFilterChange,
  onClearAll,
  productCounts,
}) {
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

  const hasActiveFilters =
    filters.categories.length > 0 ||
    filters.sizes.length > 0 ||
    filters.colors.length > 0 ||
    filters.availability.length > 0 ||
    filters.productTypes.length > 0 ||
    filters.priceRange[0] > 0 ||
    filters.priceRange[1] < 10000

  return (
    <aside className="w-full bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Sidebar header */}
      <div className="flex items-center justify-between px-4 py-3.5 bg-[#103321] rounded-t-2xl">
        <span className="text-sm font-bold text-white">Filter Products</span>
        {hasActiveFilters && (
          <button
            onClick={onClearAll}
            className="text-[#95C623] text-xs font-semibold hover:text-white transition-colors cursor-pointer"
          >
            Clear All
          </button>
        )}
      </div>

      <div className="px-4 divide-y divide-gray-50">
        {/* Categories */}
        <FilterSection id="category" label="Categories">
          <div className="space-y-2">
            {CATEGORY_OPTIONS.map((cat) => {
              const isChecked = filters.categories.includes(cat.id)
              const count = productCounts?.[cat.id] ?? 0
              return (
                <label
                  key={cat.id}
                  className="flex items-center justify-between gap-3 cursor-pointer group"
                  onClick={() => toggleCategory(cat.id)}
                >
                  <div className="flex items-center gap-2.5">
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
                    <span className="text-xs font-medium text-gray-700 group-hover:text-[#103321] transition-colors">
                      {cat.label}
                    </span>
                  </div>
                  <span className="text-[10px] text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded-md">
                    {count}
                  </span>
                </label>
              )
            })}
          </div>
        </FilterSection>

        {/* Price Range */}
        <FilterSection id="price" label="Price Range">
          <PriceRangeFilter
            min={0}
            max={10000}
            value={filters.priceRange}
            onChange={(range) => onFilterChange('priceRange', range)}
          />
        </FilterSection>

        {/* Size */}
        <FilterSection id="size" label="Size">
          <SizeFilter
            selected={filters.sizes}
            onChange={(sizes) => onFilterChange('sizes', sizes)}
          />
        </FilterSection>

        {/* Color */}
        <FilterSection id="color" label="Color">
          <ColorFilter
            selected={filters.colors}
            onChange={(colors) => onFilterChange('colors', colors)}
          />
        </FilterSection>

        {/* Availability */}
        <FilterSection id="availability" label="Availability">
          <AvailabilityFilter
            value={filters.availability}
            onChange={(avail) => onFilterChange('availability', avail)}
          />
        </FilterSection>

        {/* Product Type */}
        <FilterSection id="type" label="Product Type">
          <div className="space-y-2">
            {PRODUCT_TYPES.map((type) => {
              const isChecked = filters.productTypes.includes(type.id)
              return (
                <label
                  key={type.id}
                  className="flex items-center gap-2.5 cursor-pointer group"
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
                  <span className="text-xs font-medium text-gray-700 group-hover:text-[#103321] transition-colors">
                    {type.label}
                  </span>
                </label>
              )
            })}
          </div>
        </FilterSection>
      </div>

      {/* Clear all bottom */}
      {hasActiveFilters && (
        <div className="p-4 border-t border-gray-100">
          <button
            onClick={onClearAll}
            className="w-full py-2 rounded-xl border-2 border-gray-200 text-xs font-bold text-gray-500 hover:border-red-300 hover:text-red-500 transition-all duration-200 cursor-pointer"
          >
            Clear All Filters
          </button>
        </div>
      )}
    </aside>
  )
}
