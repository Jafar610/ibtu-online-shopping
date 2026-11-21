import { X, ScrollText, Calendar, FileCode, ShieldCheck } from 'lucide-react'

export default function AuditLogDetailsModal({ isOpen, onClose, log }) {
  if (!isOpen || !log) return null

  const formatDateTime = (isoStr) => {
    if (!isoStr) return '—'
    const d = new Date(isoStr)
    return d.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
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
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-[#103321] text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#95C623] text-[#103321] flex items-center justify-center font-bold text-sm">
              <ScrollText className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-base leading-tight">
                  Audit Log Inspector: {log.id}
                </h3>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 text-white px-2 py-0.5 rounded">
                  Immutable Record
                </span>
              </div>
              <p className="text-xs text-emerald-200/90">
                Chronological security trail entry
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Top Metadata Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
              <span className="text-gray-400 block mb-1">Action Type</span>
              <span
                className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold border ${getActionBadge(
                  log.action
                )}`}
              >
                {log.action}
              </span>
            </div>

            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
              <span className="text-gray-400 block mb-1">Entity Resource</span>
              <span className="font-bold text-gray-900 block truncate">
                {log.entityType} ({log.entityId})
              </span>
            </div>

            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
              <span className="text-gray-400 block mb-1">Actor User</span>
              <span className="font-bold text-gray-900 block truncate">
                {log.userName}
              </span>
              <span className="text-[10px] font-mono text-gray-400">
                ({log.userRole})
              </span>
            </div>

            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
              <span className="text-gray-400 block mb-1">Network Host</span>
              <span className="font-mono text-gray-700 block truncate">
                {log.ipAddress || '127.0.0.1'}
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="p-3.5 bg-emerald-50/60 border border-emerald-200/80 rounded-xl">
            <h4 className="text-xs font-bold text-emerald-950 mb-1">
              Event Narrative
            </h4>
            <p className="text-xs text-emerald-900 leading-relaxed">
              {log.description}
            </p>
          </div>

          {/* Timestamp */}
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span>Timestamp: <strong className="text-gray-900">{formatDateTime(log.timestamp)}</strong></span>
          </div>

          {/* Diff Viewer: Old Value vs New Value */}
          <div className="space-y-3 pt-2 border-t border-gray-100">
            <h4 className="font-bold text-xs uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
              <FileCode className="w-3.5 h-3.5" /> Payload State Snapshot
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              {/* Old Value */}
              <div className="space-y-1">
                <span className="font-semibold text-gray-600 block text-[11px]">
                  Prior Value (State Before Action)
                </span>
                <pre className="p-3 bg-gray-50 border border-gray-200 rounded-xl font-mono text-[11px] text-gray-700 overflow-x-auto min-h-[90px] whitespace-pre-wrap">
                  {log.oldValue
                    ? JSON.stringify(log.oldValue, null, 2)
                    : '// No prior record (Initial Creation)'}
                </pre>
              </div>

              {/* New Value */}
              <div className="space-y-1">
                <span className="font-semibold text-emerald-800 block text-[11px]">
                  New Value (State After Action)
                </span>
                <pre className="p-3 bg-emerald-50/40 border border-emerald-200 rounded-xl font-mono text-[11px] text-emerald-900 overflow-x-auto min-h-[90px] whitespace-pre-wrap">
                  {log.newValue
                    ? JSON.stringify(log.newValue, null, 2)
                    : '// Record purged'}
                </pre>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs">
          <span className="text-gray-400 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            Audited & digitally signed in administrative session
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 font-semibold text-gray-700 bg-white border border-gray-200 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  )
}
