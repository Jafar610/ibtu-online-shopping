import { LayoutGrid, List, SlidersHorizontal, ChevronDown } from 'lucide-react'

const SORT_OPTIONS = [
  { value: 'featured', label: 'Featured' },
  { value: 'newest', label: 'Newest First' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'best-selling', label: 'Best Selling' },
  { value: 'rating', label: 'Top Rated' },
]

export default function ProductToolbar({
  totalCount,
  currentPage,
  perPage,
  sortBy,
  onSortChange,
  viewMode,
  onViewModeChange,
  onOpenFilters,
}) {
  const start = (currentPage - 1) * perPage + 1
  const end = Math.min(currentPage * perPage, totalCount)

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-gray-100 rounded-2xl px-4 py-3 shadow-sm">
      {/* Left: Result count + mobile filter button */}
      <div className="flex items-center gap-3">
        {/* Mobile filter button */}
        <button
          onClick={onOpenFilters}
          className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#103321] text-white text-xs font-semibold cursor-pointer hover:bg-[#103321]/90 transition-colors"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Filters</span>
        </button>

        <p className="text-xs sm:text-sm text-gray-500">
          {totalCount > 0 ? (
            <>
              Showing{' '}
              <span className="font-bold text-[#103321]">
                {start}–{end}
              </span>{' '}
              of{' '}
              <span className="font-bold text-[#103321]">{totalCount}</span>{' '}
              products
            </>
          ) : (
            <span className="text-gray-400">No products found</span>
          )}
        </p>
      </div>

      {/* Right: Sort + View toggle */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Sort dropdown */}
        <div className="relative">
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="appearance-none pl-3 pr-8 py-2 text-xs sm:text-sm font-semibold text-gray-700 bg-gray-50 border border-gray-200 rounded-xl cursor-pointer hover:border-[#103321] transition-colors focus:outline-none focus:ring-2 focus:ring-[#95C623]/30"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
        </div>

        {/* View mode toggle */}
        <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl p-1 gap-1">
          <button
            onClick={() => onViewModeChange('grid')}
            className={`p-1.5 rounded-lg transition-all duration-200 cursor-pointer ${
              viewMode === 'grid'
                ? 'bg-[#103321] text-white shadow-sm'
                : 'text-gray-400 hover:text-[#103321]'
            }`}
            title="Grid view"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => onViewModeChange('list')}
            className={`p-1.5 rounded-lg transition-all duration-200 cursor-pointer ${
              viewMode === 'list'
                ? 'bg-[#103321] text-white shadow-sm'
                : 'text-gray-400 hover:text-[#103321]'
            }`}
            title="List view"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

