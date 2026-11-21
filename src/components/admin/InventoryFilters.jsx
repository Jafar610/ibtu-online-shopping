import { Search, X, AlertTriangle, Boxes, ArrowUpDown } from 'lucide-react'

export default function InventoryFilters({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  categories = [],
  selectedStockStatus,
  onStockStatusChange,
  selectedSize,
  onSizeChange,
  availableSizes = [],
  viewMode, // 'all' | 'low_stock'
  onViewModeChange,
  sortOption,
  onSortChange,
  onClearFilters,
  hasActiveFilters,
  lowStockCount = 0,
}) {
  return (
    <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-xs space-y-4">
      {/* Top Tabs: All Inventory vs Low Stock Focus */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
        <div className="flex bg-gray-100 p-1 rounded-2xl text-xs font-bold self-start">
          <button
            type="button"
            onClick={() => onViewModeChange('all')}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              viewMode === 'all'
                ? 'bg-[#103321] text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Boxes className="w-3.5 h-3.5" />
            <span>All Catalog Inventory</span>
          </button>

          <button
            type="button"
            onClick={() => onViewModeChange('low_stock')}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              viewMode === 'low_stock'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-amber-700 hover:text-amber-900'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Low & Out of Stock Alerts ({lowStockCount})</span>
          </button>
        </div>

        {/* Clear filters shortcut */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onClearFilters}
            className="text-xs font-bold text-red-600 hover:text-red-700 hover:underline flex items-center gap-1 cursor-pointer self-end sm:self-auto"
          >
            <X className="w-3.5 h-3.5" />
            <span>Reset Filters</span>
          </button>
        )}
      </div>

      {/* Filter Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
        {/* Search Input (4 cols) */}
        <div className="lg:col-span-4 relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by product name or variant SKU..."
            className="w-full pl-9 pr-8 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-hidden focus:border-[#103321] focus:ring-1 focus:ring-[#103321] bg-gray-50/50"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Category Filter (3 cols) */}
        <div className="lg:col-span-3">
          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-xs font-medium text-gray-700 bg-white focus:outline-hidden focus:border-[#103321] cursor-pointer"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.id || c.slug} value={c.slug || c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Stock Status Filter (2 cols) */}
        <div className="lg:col-span-2">
          <select
            value={selectedStockStatus}
            onChange={(e) => onStockStatusChange(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-xs font-medium text-gray-700 bg-white focus:outline-hidden focus:border-[#103321] cursor-pointer"
          >
            <option value="all">All Stock Statuses</option>
            <option value="In Stock">In Stock</option>
            <option value="Low Stock">Low Stock</option>
            <option value="Out of Stock">Out of Stock</option>
          </select>
        </div>

        {/* Size Filter (1 col) */}
        <div className="lg:col-span-1">
          <select
            value={selectedSize}
            onChange={(e) => onSizeChange(e.target.value)}
            className="w-full px-2 py-2.5 rounded-xl border border-gray-200 text-xs font-medium text-gray-700 bg-white focus:outline-hidden focus:border-[#103321] cursor-pointer"
          >
            <option value="all">Sizes</option>
            {availableSizes.map((sz) => (
              <option key={sz} value={sz}>
                {sz}
              </option>
            ))}
          </select>
        </div>

        {/* Sort (2 cols) */}
        <div className="lg:col-span-2">
          <select
            value={sortOption}
            onChange={(e) => onSortChange(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-xs font-medium text-gray-700 bg-white focus:outline-hidden focus:border-[#103321] cursor-pointer"
          >
            <option value="available-asc">Available: Low → High</option>
            <option value="available-desc">Available: High → Low</option>
            <option value="physical-desc">Physical: High → Low</option>
            <option value="name-asc">Product Name (A-Z)</option>
          </select>
        </div>
      </div>
    </div>
  )
}
