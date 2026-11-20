import { Link } from 'react-router-dom'
import { ChevronRight, LayoutDashboard } from 'lucide-react'

export default function AdminBreadcrumb({ items = [] }) {
  return (
    <nav className="flex items-center gap-1.5 text-xs text-gray-500 overflow-x-auto whitespace-nowrap scrollbar-none py-1">
      <Link
        to="/admin/dashboard"
        className="flex items-center gap-1 text-gray-600 hover:text-[#103321] transition-colors"
        title="Admin Dashboard Overview"
      >
        <LayoutDashboard className="w-3.5 h-3.5 text-[#95C623]" />
        <span className="font-medium">Dashboard</span>
      </Link>

      {items.map((item, idx) => {
        const isLast = idx === items.length - 1

        return (
          <div key={idx} className="flex items-center gap-1.5">
            <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            {item.path && !isLast ? (
              <Link
                to={item.path}
                className="text-gray-600 hover:text-[#103321] transition-colors font-medium"
              >
                {item.label}
              </Link>
            ) : (
              <span className="font-bold text-[#103321]">{item.label}</span>
            )}
          </div>
        )
      })}
    </nav>
  )
}
