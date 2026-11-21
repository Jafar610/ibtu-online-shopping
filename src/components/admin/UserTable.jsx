import { Link } from 'react-router-dom'
import {
  ShieldAlert,
  ShieldCheck,
  Eye,
  Edit2,
  Power,
  ChevronLeft,
  ChevronRight,
  Clock,
  Calendar,
  Lock,
} from 'lucide-react'
import AdminEmptyState from './AdminEmptyState'

export default function UserTable({
  users,
  onEditUser,
  onToggleStatus,
  currentPage,
  totalPages,
  onPageChange,
}) {
  if (!users || users.length === 0) {
    return (
      <AdminEmptyState
        title="No Staff Members Found"
        description="Try adjusting your search criteria, role filters, or add a new administrative user."
      />
    )
  }

  const formatDateTime = (isoStr) => {
    if (!isoStr) return 'Never'
    const date = new Date(isoStr)
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatDateOnly = (isoStr) => {
    if (!isoStr) return '—'
    const date = new Date(isoStr)
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <th className="py-3.5 px-4">Staff Member</th>
              <th className="py-3.5 px-4">Phone</th>
              <th className="py-3.5 px-4">Assigned Role</th>
              <th className="py-3.5 px-4">Account Status</th>
              <th className="py-3.5 px-4">Registration</th>
              <th className="py-3.5 px-4">Last Login</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map((user) => {
              const isAdmin = user.role === 'admin'
              const isActive = user.status === 'Active'

              return (
                <tr
                  key={user.id}
                  className="hover:bg-gray-50/70 transition-colors group"
                >
                  {/* Staff Member (Avatar + Name + Email) */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shrink-0 shadow-xs ${
                          isAdmin
                            ? 'bg-[#103321] text-[#95C623]'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {user.avatar || user.firstName?.[0] || 'U'}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <Link
                            to={`/admin/users/${user.id}`}
                            className="font-semibold text-gray-900 hover:text-[#103321] transition-colors truncate"
                          >
                            {user.name}
                          </Link>
                          {user.isPrimaryAdmin && (
                            <span
                              title="Primary System Administrator"
                              className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200"
                            >
                              <Lock className="w-2.5 h-2.5" /> Primary
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-gray-500 block truncate">
                          {user.email}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Phone */}
                  <td className="py-3.5 px-4 text-gray-600 text-xs">
                    {user.phone || '—'}
                  </td>

                  {/* Assigned Role */}
                  <td className="py-3.5 px-4">
                    {isAdmin ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#103321]/10 text-[#103321] border border-[#103321]/20">
                        <ShieldCheck className="w-3.5 h-3.5 text-[#103321]" />
                        Admin
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <ShieldAlert className="w-3.5 h-3.5 text-emerald-600" />
                        Data Encoder
                      </span>
                    )}
                  </td>

                  {/* Account Status */}
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        isActive
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isActive ? 'bg-emerald-500' : 'bg-rose-500'
                        }`}
                      />
                      {user.status}
                    </span>
                  </td>

                  {/* Registration Date */}
                  <td className="py-3.5 px-4 text-gray-500 text-xs whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      {formatDateOnly(user.registrationDate)}
                    </div>
                  </td>

                  {/* Last Login */}
                  <td className="py-3.5 px-4 text-gray-500 text-xs whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-gray-400" />
                      {formatDateTime(user.lastLogin)}
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* View Details */}
                      <Link
                        to={`/admin/users/${user.id}`}
                        className="p-1.5 text-gray-500 hover:text-[#103321] hover:bg-gray-100 rounded-lg transition-colors"
                        title="View User Details"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>

                      {/* Edit User */}
                      <button
                        onClick={() => onEditUser?.(user)}
                        className="p-1.5 text-gray-500 hover:text-[#103321] hover:bg-gray-100 rounded-lg transition-colors"
                        title="Edit User Info"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      {/* Toggle Status */}
                      <button
                        onClick={() => onToggleStatus?.(user)}
                        disabled={user.isPrimaryAdmin}
                        className={`p-1.5 rounded-lg transition-colors ${
                          user.isPrimaryAdmin
                            ? 'text-gray-300 cursor-not-allowed'
                            : isActive
                            ? 'text-amber-600 hover:bg-amber-50'
                            : 'text-emerald-600 hover:bg-emerald-50'
                        }`}
                        title={
                          user.isPrimaryAdmin
                            ? 'Primary Administrator is protected from deactivation'
                            : isActive
                            ? 'Deactivate Staff User'
                            : 'Activate Staff User'
                        }
                      >
                        <Power className="w-4 h-4" />
                      </button>
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
