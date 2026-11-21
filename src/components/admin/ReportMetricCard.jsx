export default function ReportMetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  colorScheme = 'default', // 'default' | 'green' | 'blue' | 'amber' | 'rose'
}) {
  const schemeStyles = {
    default: {
      wrap: 'bg-gray-100 text-gray-700',
      value: 'text-gray-900',
    },
    green: {
      wrap: 'bg-[#103321]/10 text-[#103321]',
      value: 'text-[#103321]',
    },
    lime: {
      wrap: 'bg-[#95C623]/20 text-[#103321]',
      value: 'text-gray-900',
    },
    blue: {
      wrap: 'bg-blue-50 text-blue-700',
      value: 'text-blue-900',
    },
    amber: {
      wrap: 'bg-amber-50 text-amber-700',
      value: 'text-amber-900',
    },
    rose: {
      wrap: 'bg-rose-50 text-rose-700',
      value: 'text-rose-900',
    },
  }

  const currentScheme = schemeStyles[colorScheme] || schemeStyles.default

  return (
    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs flex flex-col justify-between space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            {title}
          </p>
          <h3 className={`text-2xl font-black mt-1 ${currentScheme.value}`}>
            {value}
          </h3>
        </div>
        {Icon && (
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${currentScheme.wrap}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {(subtitle || trend) && (
        <div className="flex items-center justify-between text-xs pt-1 border-t border-gray-100 text-gray-500">
          <span>{subtitle}</span>
          {trend && (
            <span className="font-semibold text-emerald-600">
              {trend}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
