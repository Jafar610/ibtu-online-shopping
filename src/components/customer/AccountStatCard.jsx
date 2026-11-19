import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

export default function AccountStatCard({
  title,
  value,
  icon: Icon,
  to,
  description,
  accentColor = 'forest', // 'forest' | 'lime' | 'amber' | 'blue'
}) {
  const colorMap = {
    forest: 'bg-[#103321] text-[#95C623]',
    lime: 'bg-[#95C623]/20 text-[#103321]',
    amber: 'bg-amber-100 text-amber-800',
    blue: 'bg-blue-100 text-blue-700',
  }

  const content = (
    <div className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-100 shadow-xs hover:border-[#95C623]/40 hover:shadow-md transition-all group">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
            {title}
          </span>
          <span className="font-serif text-3xl font-extrabold text-[#103321] block">
            {value}
          </span>
          {description && (
            <p className="text-xs text-gray-400 font-medium pt-0.5">
              {description}
            </p>
          )}
        </div>

        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${colorMap[accentColor] || colorMap.forest}`}>
          {Icon && <Icon className="w-6 h-6" />}
        </div>
      </div>

      {to && (
        <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between text-xs font-semibold text-[#103321] group-hover:text-[#95C623] transition-colors">
          <span>View Details</span>
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
        </div>
      )}
    </div>
  )

  if (to) {
    return (
      <Link to={to} className="block cursor-pointer">
        {content}
      </Link>
    )
  }

  return content
}
