import { Search, X, RotateCcw } from 'lucide-react'

export default function ReviewFilters({
  searchTerm,
  setSearchTerm,
  selectedRating,
  setSelectedRating,
  selectedStatus,
  setSelectedStatus,
  verifiedFilter,
  setVerifiedFilter,
  sortBy,
  setSortBy,
  onReset,
  totalResults,
}) {
  const hasActiveFilters =
    searchTerm ||
    selectedRating !== 'all' ||
    selectedStatus !== 'all' ||
    verifiedFilter !== 'all' ||
    sortBy !== 'date-desc'

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-xs space-y-4">
      {/* Top Search & Results */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-lg">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by product name, reviewer author, or review title..."
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
            Found <span className="font-bold text-[#103321]">{totalResults}</span> reviews
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
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-gray-100 text-xs">
        {/* Moderation Status */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
            Moderation Status
          </label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white font-medium text-gray-700 outline-none focus:border-[#95C623] transition-colors"
          >
            <option value="all">All Moderation Statuses</option>
            <option value="Pending">Pending (Queue)</option>
            <option value="Approved">Approved (Public)</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        {/* Rating Filter */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
            Star Rating
          </label>
          <select
            value={selectedRating}
            onChange={(e) => setSelectedRating(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white font-medium text-gray-700 outline-none focus:border-[#95C623] transition-colors"
          >
            <option value="all">All Ratings (1–5 Stars)</option>
            <option value="5">5 Stars Only</option>
            <option value="4">4 Stars Only</option>
            <option value="3">3 Stars Only</option>
            <option value="2">2 Stars Only</option>
            <option value="1">1 Star Only</option>
          </select>
        </div>

        {/* Verified Purchase Filter */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
            Purchase Verification
          </label>
          <select
            value={verifiedFilter}
            onChange={(e) => setVerifiedFilter(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white font-medium text-gray-700 outline-none focus:border-[#95C623] transition-colors"
          >
            <option value="all">All Purchases</option>
            <option value="verified">Verified Buyer Only</option>
            <option value="unverified">Unverified Only</option>
          </select>
        </div>

        {/* Sorting */}
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
            <option value="rating-desc">Rating: Highest First</option>
            <option value="rating-asc">Rating: Lowest First</option>
          </select>
        </div>
      </div>
    </div>
  )
}
