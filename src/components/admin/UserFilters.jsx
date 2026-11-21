import { Search, RotateCcw, Filter, ShieldCheck } from 'lucide-react'

export default function UserFilters({
  searchTerm,
  onSearchChange,
  selectedRole,
  onRoleChange,
  selectedStatus,
  onStatusChange,
  sortBy,
  onSortChange,
  onReset,
  totalResults,
}) {
  const hasActiveFilters =
    searchTerm.trim() !== '' ||
    selectedRole !== 'all' ||
    selectedStatus !== 'all' ||
    sortBy !== 'date-desc'

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm mb-6 space-y-3">
      <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search staff by name, email, or phone..."
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#103321]/20 focus:border-[#103321] transition-all"
          />
        </div>

        {/* Filters and Sorting */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Role Filter */}
          <div className="flex items-center gap-1.5 min-w-[140px]">
            <ShieldCheck className="w-4 h-4 text-gray-400 shrink-0" />
            <select
              value={selectedRole}
              onChange={(e) => onRoleChange(e.target.value)}
              className="w-full text-xs font-medium py-2 px-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#103321]/20 focus:border-[#103321]"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="data_encoder">Data Encoder</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 min-w-[130px]">
            <Filter className="w-4 h-4 text-gray-400 shrink-0" />
            <select
              value={selectedStatus}
              onChange={(e) => onStatusChange(e.target.value)}
              className="w-full text-xs font-medium py-2 px-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#103321]/20 focus:border-[#103321]"
            >
              <option value="all">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="text-xs font-medium py-2 px-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#103321]/20 focus:border-[#103321]"
          >
            <option value="date-desc">Newest Registered</option>
            <option value="date-asc">Oldest Registered</option>
            <option value="name-asc">Name (A-Z)</option>
            <option value="name-desc">Name (Z-A)</option>
            <option value="login-desc">Recent Login</option>
          </select>

          {/* Reset Filters */}
          {hasActiveFilters && (
            <button
              onClick={onReset}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              title="Reset all filters"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
        <span>
          Showing <strong className="text-gray-900">{totalResults}</strong> staff members
        </span>
        {hasActiveFilters && (
          <span className="text-[#103321] font-medium">Filters Applied</span>
        )}
      </div>
    </div>
  )
}
