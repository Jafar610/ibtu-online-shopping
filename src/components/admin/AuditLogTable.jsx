import {
  Calendar,
  Eye,
  ChevronLeft,
  ChevronRight,
  Network,
} from 'lucide-react'
import AdminEmptyState from './AdminEmptyState'

export default function AuditLogTable({
  logs,
  onInspectLog,
  currentPage,
  totalPages,
  onPageChange,
}) {
  if (!logs || logs.length === 0) {
    return (
      <AdminEmptyState
        title="No Audit Logs Found"
        description="Try adjusting your search criteria, action filters, or select a broader date window."
      />
    )
  }

  const formatDateTime = (isoStr) => {
    if (!isoStr) return '—'
    const d = new Date(isoStr)
    return d.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getActionBadge = (action) => {
    switch (action) {
      case 'Created':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200'
      case 'Updated':
        return 'bg-blue-50 text-blue-800 border-blue-200'
      case 'Deleted':
        return 'bg-rose-50 text-rose-800 border-rose-200'
      case 'Approved':
        return 'bg-purple-50 text-purple-800 border-purple-200'
      case 'Status Change':
        return 'bg-amber-50 text-amber-800 border-amber-200'
      case 'Stock Adjustment':
        return 'bg-teal-50 text-teal-800 border-teal-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <th className="py-3.5 px-4">Date & Time</th>
              <th className="py-3.5 px-4">Staff Actor</th>
              <th className="py-3.5 px-4">Action</th>
              <th className="py-3.5 px-4">Entity Resource</th>
              <th className="py-3.5 px-4">Description</th>
              <th className="py-3.5 px-4">Host IP</th>
              <th className="py-3.5 px-4 text-right">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {logs.map((log) => {
              const isAdmin = log.userRole === 'admin'

              return (
                <tr
                  key={log.id}
                  className="hover:bg-gray-50/70 transition-colors group text-xs"
                >
                  {/* Timestamp */}
                  <td className="py-3.5 px-4 whitespace-nowrap text-gray-600 font-mono text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      {formatDateTime(log.timestamp)}
                    </div>
                  </td>

                  {/* Staff Actor */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 ${
                          isAdmin
                            ? 'bg-[#103321] text-[#95C623]'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {log.userName?.[0] || 'A'}
                      </div>
                      <div className="min-w-0">
                        <span className="font-semibold text-gray-900 block truncate">
                          {log.userName}
                        </span>
                        <span className="text-[10px] text-gray-400 font-mono">
                          {log.userRole}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Action Badge */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold border ${getActionBadge(
                        log.action
                      )}`}
                    >
                      {log.action}
                    </span>
                  </td>

                  {/* Entity Resource */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div>
                      <span className="font-semibold text-gray-800 block">
                        {log.entityType}
                      </span>
                      <span className="font-mono text-[10px] text-gray-400">
                        {log.entityId}
                      </span>
                    </div>
                  </td>

                  {/* Description */}
                  <td className="py-3.5 px-4 max-w-xs">
                    <p className="text-gray-600 line-clamp-1" title={log.description}>
                      {log.description}
                    </p>
                  </td>

                  {/* Host IP */}
                  <td className="py-3.5 px-4 whitespace-nowrap font-mono text-[11px] text-gray-500">
                    <div className="flex items-center gap-1">
                      <Network className="w-3 h-3 text-gray-400" />
                      {log.ipAddress || '192.168.1.10'}
                    </div>
                  </td>

                  {/* Details Action */}
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => onInspectLog?.(log)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-[#103321] bg-gray-100 hover:bg-[#103321]/10 rounded-lg transition-colors"
                      title="Inspect Snapshot"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Inspect
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
          <div>
            Page <strong className="text-gray-900">{currentPage}</strong> of{' '}
            <strong className="text-gray-900">{totalPages}</strong>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onPageChange?.(currentPage - 1)}
              disabled={currentPage <= 1}
              className="p-1.5 rounded border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed text-gray-700 transition-colors"
              title="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => onPageChange?.(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="p-1.5 rounded border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed text-gray-700 transition-colors"
              title="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
