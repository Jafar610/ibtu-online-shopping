import { Link } from 'react-router-dom'
import { Eye, MessageSquare, CheckCircle2, Clock, ChevronLeft, ChevronRight } from 'lucide-react'
import AdminStatusBadge from './AdminStatusBadge'

export default function MessageTable({
  messages = [],
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  onUpdateStatus,
}) {
  if (messages.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center space-y-3">
        <div className="w-14 h-14 rounded-2xl bg-gray-50 text-gray-400 flex items-center justify-center mx-auto">
          <MessageSquare className="w-7 h-7" />
        </div>
        <h3 className="font-serif font-bold text-base text-[#103321]">
          No contact messages found
        </h3>
        <p className="text-xs text-gray-500 max-w-sm mx-auto">
          No customer inquiries match your current filter criteria. Try resetting filters.
        </p>
      </div>
    )
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A'
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return dateStr
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#103321]/5 border-b border-gray-100 text-gray-600 font-extrabold uppercase tracking-wider text-[11px]">
            <tr>
              <th className="py-3.5 px-4">Sender</th>
              <th className="py-3.5 px-4">Subject & Preview</th>
              <th className="py-3.5 px-4">Submitted</th>
              <th className="py-3.5 px-4 text-center">Status</th>
              <th className="py-3.5 px-4">Assigned To</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {messages.map((msg) => {
              const isNew = msg.status === 'New'

              return (
                <tr
                  key={msg.id}
                  className={`hover:bg-gray-50/80 transition-colors group ${
                    isNew ? 'bg-amber-50/30' : ''
                  }`}
                >
                  {/* Sender */}
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-gray-900 block truncate max-w-[150px]">
                      {msg.senderName}
                    </span>
                    <span className="text-[10px] text-gray-500 block truncate max-w-[150px]">
                      {msg.email}
                    </span>
                    {msg.phone && (
                      <span className="text-[10px] text-gray-400 font-mono block">
                        {msg.phone}
                      </span>
                    )}
                  </td>

                  {/* Subject & Preview */}
                  <td className="py-3.5 px-4 max-w-sm">
                    <Link
                      to={`/admin/messages/${msg.id}`}
                      className="font-bold text-[#103321] hover:text-[#95C623] transition-colors block truncate"
                    >
                      {msg.subject}
                    </Link>
                    <p className="text-[11px] text-gray-500 line-clamp-1 leading-relaxed mt-0.5">
                      {msg.message}
                    </p>
                  </td>

                  {/* Submitted */}
                  <td className="py-3.5 px-4 text-gray-600 whitespace-nowrap">
                    {formatDate(msg.submissionDate)}
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4 text-center whitespace-nowrap">
                    <AdminStatusBadge status={msg.status} type="message" />
                  </td>

                  {/* Assigned To */}
                  <td className="py-3.5 px-4 text-gray-600 whitespace-nowrap">
                    <span className="font-medium">
                      {msg.assignedTo || 'Unassigned'}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      <Link
                        to={`/admin/messages/${msg.id}`}
                        title="View Full Inquiry"
                        className="p-1.5 rounded-lg text-gray-500 hover:text-[#103321] hover:bg-gray-100 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>

                      {msg.status !== 'Resolved' && msg.status !== 'Closed' && (
                        <button
                          type="button"
                          onClick={() => onUpdateStatus(msg, 'Resolved')}
                          title="Mark Resolved"
                          className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors cursor-pointer"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="p-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
          <div>
            Page <span className="font-bold text-[#103321]">{currentPage}</span> of{' '}
            <span className="font-bold text-[#103321]">{totalPages}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => onPageChange(currentPage - 1)}
              className="p-1.5 rounded-lg border border-gray-200 enabled:hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => onPageChange(currentPage + 1)}
              className="p-1.5 rounded-lg border border-gray-200 enabled:hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
