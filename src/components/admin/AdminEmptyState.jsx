import { Inbox } from 'lucide-react'

export default function AdminEmptyState({
  icon: Icon = Inbox,
  title = 'No records found',
  description = 'There is currently no data available for this section.',
  action,
}) {
  return (
    <div className="p-10 sm:p-12 text-center bg-white rounded-2xl border border-gray-100 shadow-xs space-y-4">
      <div className="w-14 h-14 rounded-2xl bg-gray-100 text-gray-400 mx-auto flex items-center justify-center">
        <Icon className="w-7 h-7" />
      </div>

      <div className="max-w-md mx-auto space-y-1">
        <h3 className="font-serif font-bold text-base text-[#103321]">
          {title}
        </h3>
        <p className="text-xs text-gray-500 leading-relaxed">
          {description}
        </p>
      </div>

      {action && <div className="pt-2">{action}</div>}
    </div>
  )
}
