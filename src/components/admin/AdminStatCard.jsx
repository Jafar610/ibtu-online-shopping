import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingBag,
  Users,
  Shirt,
  Clock,
  AlertTriangle,
  Minus,
} from 'lucide-react'

const ICON_MAP = {
  DollarSign,
  ShoppingBag,
  Users,
  Shirt,
  Clock,
  AlertTriangle,
}

const COLOR_MAP = {
  forest: {
    bg: 'bg-[#103321]/10',
    text: 'text-[#103321]',
    ring: 'group-hover:border-[#103321]/40',
  },
  emerald: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    ring: 'group-hover:border-emerald-300',
  },
  blue: {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    ring: 'group-hover:border-blue-300',
  },
  purple: {
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    ring: 'group-hover:border-purple-300',
  },
  amber: {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    ring: 'group-hover:border-amber-300',
  },
  rose: {
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    ring: 'group-hover:border-rose-300',
  },
}

export default function AdminStatCard({
  title,
  value,
  icon,
  trend,
  trendDirection = 'neutral',
  description,
  color = 'forest',
}) {
  const IconComponent = typeof icon === 'string' ? ICON_MAP[icon] || ShoppingBag : icon
  const colorTheme = COLOR_MAP[color] || COLOR_MAP.forest

  return (
    <div
      className={`p-5 rounded-2xl bg-white border border-gray-100 shadow-xs hover:shadow-md transition-all group ${colorTheme.ring}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
            {title}
          </span>
          <span className="font-serif text-2xl font-extrabold text-[#103321] block tracking-tight">
            {value}
          </span>
        </div>

        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${colorTheme.bg} ${colorTheme.text}`}
        >
          {IconComponent && <IconComponent className="w-5 h-5" />}
        </div>
      </div>

      {/* Footer Trend & Subtitle */}
      {(trend || description) && (
        <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between text-xs gap-2">
          {trend && (
            <span
              className={`inline-flex items-center gap-1 font-bold ${
                trendDirection === 'up'
                  ? 'text-emerald-600'
                  : trendDirection === 'down'
                  ? 'text-rose-600'
                  : 'text-amber-600'
              }`}
            >
              {trendDirection === 'up' ? (
                <TrendingUp className="w-3.5 h-3.5" />
              ) : trendDirection === 'down' ? (
                <TrendingDown className="w-3.5 h-3.5" />
              ) : (
                <Minus className="w-3.5 h-3.5" />
              )}
              <span>{trend}</span>
            </span>
          )}

          {description && (
            <span className="text-[11px] text-gray-400 truncate">
              {description}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
