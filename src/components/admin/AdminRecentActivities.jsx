import { Link } from 'react-router-dom'
import {
  Activity,
  PlusCircle,
  Truck,
  AlertTriangle,
  UserPlus,
  Tag,
  ArrowRight,
} from 'lucide-react'
import { adminRecentActivities } from '../../data/admin/adminDashboardMockData'

const ICON_MAP = {
  PlusCircle,
  Truck,
  AlertTriangle,
  UserPlus,
  Tag,
}

const COLOR_MAP = {
  emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  blue: 'bg-blue-50 text-blue-700 border-blue-200',
  rose: 'bg-rose-50 text-rose-700 border-rose-200',
  purple: 'bg-purple-50 text-purple-700 border-purple-200',
  amber: 'bg-amber-50 text-amber-700 border-amber-200',
}

export default function AdminRecentActivities() {
  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-xs p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#103321]/10 text-[#103321] flex items-center justify-center">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-base text-[#103321]">
              Recent System Activities
            </h3>
            <span className="text-[11px] text-gray-400">Audit log preview</span>
          </div>
        </div>

        <Link
          to="/admin/audit-logs"
          className="text-xs font-bold text-[#103321] hover:text-[#95C623] flex items-center gap-1 transition-colors"
        >
          <span>All Logs</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Activity Timeline List */}
      <div className="space-y-4 pt-1">
        {adminRecentActivities.map((act) => {
          const Icon = ICON_MAP[act.icon] || Activity
          const colorClass = COLOR_MAP[act.color] || COLOR_MAP.emerald

          return (
            <div key={act.id} className="flex items-start gap-3 group">
              <div
                className={`w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 mt-0.5 ${colorClass}`}
              >
                <Icon className="w-4 h-4" />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-gray-900 group-hover:text-[#103321] transition-colors leading-tight">
                  {act.title}
                </p>
                <div className="flex items-center gap-2 text-[11px] text-gray-400 mt-1">
                  <span>{act.actor}</span>
                  <span>•</span>
                  <span>{act.timestamp}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
