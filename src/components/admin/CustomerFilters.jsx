import { Search, X, RotateCcw } from 'lucide-react'

export default function CustomerFilters({
  searchTerm,
  setSearchTerm,
  selectedStatus,
  setSelectedStatus,
  registrationRange,
  setRegistrationRange,
  sortBy,
  setSortBy,
  onReset,
  totalResults,
}) {
  const hasActiveFilters =
    searchTerm ||
    selectedStatus !== 'all' ||
    registrationRange !== 'all' ||
    sortBy !== 'date-desc'

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-xs space-y-4">
      {/* Top Bar: Search & Result Counter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-lg">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by customer name, email, or phone number..."
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

        <div className="flex items-center gap-3 self-end md:self-auto">
          <div className="text-xs font-semibold text-gray-500">
            Found <span className="font-bold text-[#103321]">{totalResults}</span> customer accounts
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

      {/* Select Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-gray-100 text-xs">
        {/* Account Status */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
            Account Status
          </label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white font-medium text-gray-700 outline-none focus:border-[#95C623] transition-colors"
          >
            <option value="all">All Account Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Suspended">Suspended</option>
          </select>
        </div>

        {/* Registration Date */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
            Registration Date
          </label>
          <select
            value={registrationRange}
            onChange={(e) => setRegistrationRange(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white font-medium text-gray-700 outline-none focus:border-[#95C623] transition-colors"
          >
            <option value="all">All Time</option>
            <option value="last30">Registered in Last 30 Days</option>
            <option value="last90">Registered in Last 90 Days</option>
            <option value="2026">Registered in 2026</option>
            <option value="2025">Registered in 2025</option>
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
            <option value="date-desc">Newest Registered</option>
            <option value="date-asc">Oldest Registered</option>
            <option value="name-asc">Customer Name (A–Z)</option>
            <option value="name-desc">Customer Name (Z–A)</option>
            <option value="spending-desc">Highest Total Spending</option>
          </select>
        </div>
      </div>
    </div>
  )
}
