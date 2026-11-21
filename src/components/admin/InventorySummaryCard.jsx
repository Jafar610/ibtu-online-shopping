import { Boxes, PackageCheck, Lock, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react'

const ICON_MAP = {
  variants: Boxes,
  physical: PackageCheck,
  reserved: Lock,
  available: CheckCircle2,
  low_stock: AlertTriangle,
  out_of_stock: XCircle,
}

const COLOR_MAP = {
  forest: {
    bg: 'bg-[#103321]/10',
    text: 'text-[#103321]',
    badge: 'bg-[#103321]/10 text-[#103321]',
  },
  blue: {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    badge: 'bg-blue-100 text-blue-800',
  },
  purple: {
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    badge: 'bg-purple-100 text-purple-800',
  },
  emerald: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    badge: 'bg-emerald-100 text-emerald-800',
  },
  amber: {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    badge: 'bg-amber-100 text-amber-800',
  },
  rose: {
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    badge: 'bg-rose-100 text-rose-800',
  },
}

export default function InventorySummaryCard({
  title,
  value,
  subtitle,
  iconType = 'variants',
  color = 'forest',
  highlight = false,
  onClick,
}) {
  const Icon = ICON_MAP[iconType] || Boxes
  const theme = COLOR_MAP[color] || COLOR_MAP.forest

  return (
    <div
      onClick={onClick}
      className={`p-5 rounded-2xl bg-white border transition-all ${
        highlight
          ? 'border-amber-300 ring-2 ring-amber-100 shadow-sm'
          : 'border-gray-100 shadow-xs hover:border-gray-200'
      } ${onClick ? 'cursor-pointer hover:shadow-md' : ''}`}
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

        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${theme.bg} ${theme.text}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      {subtitle && (
        <div className="mt-3 pt-2.5 border-t border-gray-50 text-[11px] text-gray-500 truncate">
          {subtitle}
        </div>
      )}
    </div>
  )
}
