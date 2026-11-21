import { Calendar, Download, RotateCcw, BarChart3, ShoppingBag, Shirt, Users, Tag } from 'lucide-react'

export default function ReportFilters({
  activeTab,
  onTabChange,
  dateRange,
  onDateRangeChange,
  onReset,
  onExportCSV,
  isExporting = false,
}) {
  const tabs = [
    { id: 'overview', label: 'Executive Summary', icon: BarChart3 },
    { id: 'sales', label: 'Sales & Revenue', icon: ShoppingBag },
    { id: 'products', label: 'Products & Stock', icon: Shirt },
    { id: 'customers', label: 'Customer Cohorts', icon: Users },
    { id: 'coupons', label: 'Coupons & Vouchers', icon: Tag },
  ]

  return (
    <div className="space-y-4">
      {/* Category Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-gray-200">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap shrink-0 ${
                isActive
                  ? 'bg-[#103321] text-white shadow-xs'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 bg-white border border-gray-200'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-[#95C623]' : 'text-gray-400'}`} />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Date Range & Export Toolbar */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 min-w-[160px]">
            <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
            <select
              value={dateRange}
              onChange={(e) => onDateRangeChange(e.target.value)}
              className="text-xs font-semibold py-2 px-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#103321]/20 focus:border-[#103321]"
            >
              <option value="all">Reporting Window: All Time</option>
              <option value="last30">Last 30 Days</option>
              <option value="last90">Last 90 Days</option>
              <option value="2026">Calendar Year 2026</option>
              <option value="2025">Calendar Year 2025</option>
            </select>
          </div>

          {dateRange !== 'all' && (
            <button
              onClick={onReset}
              className="inline-flex items-center gap-1 px-2.5 py-2 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Date
            </button>
          )}
        </div>

        {/* CSV Export Button */}
        <div>
          <button
            onClick={onExportCSV}
            disabled={isExporting}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold text-[#103321] bg-[#95C623] hover:bg-[#95C623]/90 rounded-lg shadow-xs transition-colors disabled:opacity-50"
            title="Download CSV dataset"
          >
            <Download className="w-4 h-4" />
            {isExporting ? 'Generating CSV...' : 'Export Filtered CSV'}
          </button>
        </div>
      </div>
    </div>
  )
}
