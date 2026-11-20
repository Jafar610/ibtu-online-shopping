import { useState } from 'react'
import { BarChart3, TrendingUp, Info } from 'lucide-react'
import { monthlySalesData } from '../../data/admin/adminDashboardMockData'

export default function SalesOverviewChart() {
  const [metric, setMetric] = useState('revenue') // 'revenue' | 'orders'

  const maxRevenue = Math.max(...monthlySalesData.map((d) => d.revenue))
  const maxOrders = Math.max(...monthlySalesData.map((d) => d.orders))

  return (
    <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-xs space-y-6">
      {/* Header with Title & Metric Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-serif font-bold text-base text-[#103321]">
              Sales & Order Performance
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
              Sample Data
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            6-Month financial trends across Ethiopian traditional apparel sales.
          </p>
        </div>

        {/* Toggle Pills */}
        <div className="flex bg-gray-100 p-1 rounded-xl text-xs font-bold self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setMetric('revenue')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              metric === 'revenue'
                ? 'bg-[#103321] text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Revenue (ETB)
          </button>
          <button
            type="button"
            onClick={() => setMetric('orders')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              metric === 'orders'
                ? 'bg-[#103321] text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Order Volume
          </button>
        </div>
      </div>

      {/* Chart Visual Area */}
      <div className="space-y-2">
        <div className="h-56 sm:h-64 flex items-end justify-between gap-2 sm:gap-4 pt-6 pb-2 px-2 border-b border-gray-200">
          {monthlySalesData.map((item, idx) => {
            const currentValue = metric === 'revenue' ? item.revenue : item.orders
            const maxValue = metric === 'revenue' ? maxRevenue : maxOrders
            const heightPercent = Math.round((currentValue / maxValue) * 100)

            return (
              <div
                key={idx}
                className="flex-1 flex flex-col items-center h-full justify-end group relative cursor-pointer"
              >
                {/* Tooltip on hover */}
                <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-[#103321] text-white text-[11px] font-bold px-2 py-1 rounded-md shadow-md whitespace-nowrap pointer-events-none z-10">
                  {metric === 'revenue'
                    ? `${item.revenue.toLocaleString()} ETB (${item.orders} orders)`
                    : `${item.orders} orders (${item.revenue.toLocaleString()} ETB)`}
                </div>

                {/* Animated bar */}
                <div
                  className="w-full max-w-[42px] rounded-t-xl transition-all duration-500 relative overflow-hidden group-hover:brightness-110"
                  style={{
                    height: `${heightPercent}%`,
                    backgroundColor:
                      idx === 3 || idx === 2
                        ? '#103321' // peak seasons
                        : '#95C623',
                  }}
                >
                  <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            )
          })}
        </div>

        {/* Labels below bars */}
        <div className="flex justify-between gap-2 sm:gap-4 px-2 text-center text-xs">
          {monthlySalesData.map((item, idx) => (
            <div key={idx} className="flex-1">
              <span className="font-bold text-gray-700 block text-[11px] sm:text-xs">
                {item.label}
              </span>
              <span className="text-[10px] text-gray-400 block font-mono">
                {metric === 'revenue'
                  ? `${Math.round(item.revenue / 1000)}k`
                  : item.orders}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Chart Footer with Key Highlights */}
      <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-gray-500 gap-3">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-[#103321]" />
            <span className="text-[11px] font-medium text-gray-700">Cultural Peak Seasons (Timkat & Holidays)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-[#95C623]" />
            <span className="text-[11px] font-medium text-gray-700">Regular Seasonal Trajectory</span>
          </div>
        </div>

        <div className="flex items-center gap-1 text-[11px] text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg">
          <Info className="w-3.5 h-3.5 shrink-0" />
          <span>Real chart metrics will connect to backend reports in Step 8.</span>
        </div>
      </div>
    </div>
  )
}
