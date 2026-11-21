import { Search, X, RotateCcw, Filter } from 'lucide-react'

export default function OrderFilters({
  searchTerm,
  setSearchTerm,
  selectedOrderStatus,
  setSelectedOrderStatus,
  selectedPaymentStatus,
  setSelectedPaymentStatus,
  dateRange,
  setDateRange,
  sortBy,
  setSortBy,
  onReset,
  totalResults,
}) {
  const hasActiveFilters =
    searchTerm ||
    selectedOrderStatus !== 'all' ||
    selectedPaymentStatus !== 'all' ||
    dateRange !== 'all' ||
    sortBy !== 'date-desc'

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-xs space-y-4">
      {/* Top Bar: Search & Quick Reset */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-lg">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by order # (e.g. IBTU-9901), customer, email or phone..."
            className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-gray-200 focus:border-[#95C623] focus:ring-2 focus:ring-[#95C623]/20 text-xs text-[#1A1A1A] outline-none transition-all"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Count & Reset */}
        <div className="flex items-center gap-3 self-end md:self-auto">
          <div className="text-xs font-semibold text-gray-500">
            Found <span className="font-bold text-[#103321]">{totalResults}</span> orders
          </div>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={onReset}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-gray-600 hover:text-[#103321] hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-gray-500" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Bottom Bar: Select Dropdowns */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-gray-100 text-xs">
        {/* Order Status */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
            Order Status
          </label>
          <select
            value={selectedOrderStatus}
            onChange={(e) => setSelectedOrderStatus(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white font-medium text-gray-700 outline-none focus:border-[#95C623] transition-colors"
          >
            <option value="all">All Order Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Processing">Processing</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
            <option value="Refunded">Refunded</option>
          </select>
        </div>

        {/* Payment Status */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
            Payment Status
          </label>
          <select
            value={selectedPaymentStatus}
            onChange={(e) => setSelectedPaymentStatus(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white font-medium text-gray-700 outline-none focus:border-[#95C623] transition-colors"
          >
            <option value="all">All Payment Statuses</option>
            <option value="Paid">Paid</option>
            <option value="Pending">Pending</option>
            <option value="Unpaid">Unpaid (COD)</option>
            <option value="Refunded">Refunded</option>
            <option value="Failed">Failed</option>
          </select>
        </div>

        {/* Date Filter */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
            Date Placed
          </label>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white font-medium text-gray-700 outline-none focus:border-[#95C623] transition-colors"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="last7">Last 7 Days</option>
            <option value="last30">Last 30 Days</option>
          </select>
        </div>

        {/* Sort By */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
            Sort By
          </label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white font-medium text-gray-700 outline-none focus:border-[#95C623] transition-colors"
          >
            <option value="date-desc">Date: Newest First</option>
            <option value="date-asc">Date: Oldest First</option>
            <option value="amount-desc">Total: High to Low</option>
            <option value="amount-asc">Total: Low to High</option>
          </select>
        </div>
      </div>
    </div>
  )
}
