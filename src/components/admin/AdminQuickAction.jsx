import { Link } from 'react-router-dom'
import { PlusCircle, ShoppingBag, Boxes, Users, ArrowUpRight } from 'lucide-react'
import { adminQuickActions } from '../../data/admin/adminDashboardMockData'

const ICON_MAP = {
  PlusCircle,
  ShoppingBag,
  Boxes,
  Users,
}

const COLOR_MAP = {
  forest: 'bg-[#103321]/10 text-[#103321]',
  amber: 'bg-amber-100 text-amber-800',
  blue: 'bg-blue-100 text-blue-800',
  purple: 'bg-purple-100 text-purple-800',
}

export default function AdminQuickAction() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-serif font-bold text-base text-[#103321]">
          Quick Administrative Actions
        </h3>
        <span className="text-xs text-gray-400">Fast shortcuts</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {adminQuickActions.map((action) => {
          const Icon = ICON_MAP[action.icon] || PlusCircle
          const colorClass = COLOR_MAP[action.color] || COLOR_MAP.forest

          return (
            <Link
              key={action.id}
              to={action.path}
              className="p-5 rounded-2xl bg-white border border-gray-100 shadow-xs hover:border-[#95C623]/60 hover:shadow-md transition-all group relative flex flex-col justify-between space-y-3"
            >
              <div className="flex items-start justify-between">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${colorClass}`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <ArrowUpRight className="w-4 h-4 text-gray-300 group-hover:text-[#103321] transition-colors" />
              </div>

              <div>
                <h4 className="font-serif font-bold text-sm text-[#103321] group-hover:text-[#103321]">
                  {action.label}
                </h4>
                <p className="text-xs text-gray-500 mt-0.5 leading-snug">
                  {action.description}
                </p>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
