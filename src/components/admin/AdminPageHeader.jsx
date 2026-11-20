import AdminBreadcrumb from './AdminBreadcrumb'

export default function AdminPageHeader({
  title,
  description,
  breadcrumbs = [],
  action,
  badge,
}) {
  return (
    <div className="space-y-3 pb-6 border-b border-gray-100">
      {breadcrumbs && breadcrumbs.length > 0 && (
        <AdminBreadcrumb items={breadcrumbs} />
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="font-serif font-extrabold text-2xl sm:text-3xl text-[#103321] tracking-tight">
              {title}
            </h1>
            {badge && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#95C623]/20 text-[#103321]">
                {badge}
              </span>
            )}
          </div>
          {description && (
            <p className="text-xs sm:text-sm text-gray-500 max-w-3xl">
              {description}
            </p>
          )}
        </div>

        {action && <div className="shrink-0">{action}</div>}
      </div>
    </div>
  )
}
