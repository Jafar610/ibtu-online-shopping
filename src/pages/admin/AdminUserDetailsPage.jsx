import { useState, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  User,
  ShieldCheck,
  ShieldAlert,
  Mail,
  Phone,
  Calendar,
  Clock,
  FileText,
  Power,
  Edit2,
  ChevronLeft,
  CheckCircle2,
  AlertTriangle,
  Lock,
  ScrollText,
} from 'lucide-react'
import AdminLayout from '../../components/admin/AdminLayout'
import AdminBreadcrumb from '../../components/admin/AdminBreadcrumb'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import UserFormModal from '../../components/admin/UserFormModal'
import ConfirmActionModal from '../../components/admin/ConfirmActionModal'
import {
  getStoredAdminUsers,
  getStoredAdminRoles,
  getStoredAdminAuditLogs,
  updateAdminUser,
  toggleUserStatus,
  SYSTEM_PERMISSION_GROUPS,
} from '../../data/admin/adminAdministrationData'

export default function AdminUserDetailsPage() {
  const { userId } = useParams()

  const [users, setUsers] = useState(() => getStoredAdminUsers())
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isConfirmToggleOpen, setIsConfirmToggleOpen] = useState(false)
  const [feedback, setFeedback] = useState(null)

  const showFeedback = (text, type = 'success') => {
    setFeedback({ text, type })
    setTimeout(() => setFeedback(null), 4000)
  }

  // Find targeted user
  const user = useMemo(() => {
    return users.find((u) => u.id === userId)
  }, [users, userId])

  // Get audit logs for this specific staff user
  const userAuditLogs = useMemo(() => {
    if (!user) return []
    const allLogs = getStoredAdminAuditLogs()
    return allLogs.filter(
      (log) =>
        log.userName?.toLowerCase() === user.name?.toLowerCase() ||
        log.entityId === user.id
    )
  }, [user])

  // Get role information and permissions
  const roles = getStoredAdminRoles()
  const assignedRole = useMemo(() => {
    if (!user) return null
    return roles.find((r) => r.roleKey === user.role)
  }, [user, roles])

  if (!user) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <AdminBreadcrumb
            items={[
              { label: 'Admin', path: '/admin/dashboard' },
              { label: 'Staff Users', path: '/admin/users' },
              { label: 'User Not Found' },
            ]}
          />
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-xs">
            <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Staff User Not Found</h2>
            <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">
              The requested administrative staff profile with ID "{userId}" does not exist in browser records.
            </p>
            <Link
              to="/admin/users"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#103321] text-white text-xs font-semibold rounded-xl hover:bg-[#103321]/90 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Return to Staff Users
            </Link>
          </div>
        </div>
      </AdminLayout>
    )
  }

  const isAdmin = user.role === 'admin'
  const isActive = user.status === 'Active'

  const formatDate = (isoStr) => {
    if (!isoStr) return 'Never'
    const d = new Date(isoStr)
    return d.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const handleUpdateUser = (formData) => {
    const res = updateAdminUser(user.id, formData)
    if (!res.success) {
      showFeedback(res.message, 'error')
      return
    }
    showFeedback(`Successfully updated profile for ${res.user.name}.`)
    setUsers(getStoredAdminUsers())
    setIsEditModalOpen(false)
  }

  const handleConfirmToggle = () => {
    const res = toggleUserStatus(user.id)
    if (!res.success) {
      showFeedback(res.message, 'error')
    } else {
      const nextStatus = res.user.status === 'Active' ? 'activated' : 'deactivated'
      showFeedback(`Staff user ${res.user.name} has been ${nextStatus}.`)
      setUsers(getStoredAdminUsers())
    }
    setIsConfirmToggleOpen(false)
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Breadcrumb */}
        <AdminBreadcrumb
          items={[
            { label: 'Admin', path: '/admin/dashboard' },
            { label: 'Staff Users', path: '/admin/users' },
            { label: user.name },
          ]}
        />

        {/* Page Header */}
        <AdminPageHeader
          title={user.name}
          subtitle={`Administrative staff profile & system privileges (${user.email})`}
        >
          <div className="flex items-center gap-2">
            <Link
              to="/admin/users"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </Link>

            <button
              onClick={() => setIsEditModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#103321] hover:bg-[#103321]/90 rounded-xl transition-colors shadow-xs"
            >
              <Edit2 className="w-3.5 h-3.5 text-[#95C623]" />
              Edit Profile
            </button>

            <button
              onClick={() => setIsConfirmToggleOpen(true)}
              disabled={user.isPrimaryAdmin}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl transition-colors ${
                user.isPrimaryAdmin
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                  : isActive
                  ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
              }`}
            >
              <Power className="w-3.5 h-3.5" />
              {isActive ? 'Deactivate' : 'Activate'}
            </button>
          </div>
        </AdminPageHeader>

        {/* Feedback Alert */}
        {feedback && (
          <div
            className={`p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 animate-in fade-in duration-200 ${
              feedback.type === 'error'
                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            }`}
          >
            {feedback.type === 'error' ? (
              <AlertTriangle className="w-4 h-4 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            )}
            {feedback.text}
          </div>
        )}

        {/* Main Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Personal & Administrative Info */}
          <div className="space-y-6">
            {/* Profile Card */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-6 text-center">
              <div
                className={`w-20 h-20 rounded-full flex items-center justify-center font-bold text-2xl mx-auto shadow-sm mb-4 ${
                  isAdmin
                    ? 'bg-[#103321] text-[#95C623]'
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {user.avatar || user.firstName?.[0] || 'U'}
              </div>

              <h2 className="text-lg font-bold text-gray-900">{user.name}</h2>
              <p className="text-xs text-gray-500 mt-0.5">{user.email}</p>

              <div className="flex items-center justify-center gap-2 mt-4">
                {isAdmin ? (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-[#103321]/10 text-[#103321] border border-[#103321]/20">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#103321]" />
                    Admin
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <ShieldAlert className="w-3.5 h-3.5 text-emerald-600" />
                    Data Encoder
                  </span>
                )}

                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
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
              </div>

              {user.isPrimaryAdmin && (
                <div className="mt-4 p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center justify-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-amber-600" />
                  <strong>Primary System Administrator</strong>
                </div>
              )}
            </div>

            {/* Profile Meta Details */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-5 space-y-4">
              <h3 className="font-bold text-sm text-gray-900 border-b border-gray-100 pb-2">
                Account Credentials & Timestamps
              </h3>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5" /> Corporate Email
                  </span>
                  <span className="font-semibold text-gray-900">{user.email}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-500 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5" /> Contact Phone
                  </span>
                  <span className="font-semibold text-gray-900">{user.phone}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-500 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" /> Provisioned On
                  </span>
                  <span className="font-semibold text-gray-900">{formatDate(user.registrationDate)}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-500 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" /> Last Active
                  </span>
                  <span className="font-semibold text-gray-900">{formatDate(user.lastLogin)}</span>
                </div>
              </div>

              {/* Administrative Notes */}
              <div className="pt-3 border-t border-gray-100">
                <span className="text-xs font-semibold text-gray-700 flex items-center gap-1.5 mb-1.5">
                  <FileText className="w-3.5 h-3.5 text-gray-400" /> Administrative Notes
                </span>
                <p className="text-xs text-gray-600 bg-gray-50 p-3 rounded-xl border border-gray-100 italic">
                  {user.notes || 'No administrative notes attached to this user account.'}
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Assigned RBAC Privileges & Activity Log */}
          <div className="lg:col-span-2 space-y-6">
            {/* RBAC Privileges Breakdown */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div>
                  <h3 className="font-bold text-base text-gray-900">
                    Role Privileges Breakdown
                  </h3>
                  <p className="text-xs text-gray-500">
                    Governed by assigned role: <strong className="text-gray-900">{assignedRole?.name || user.role}</strong>
                  </p>
                </div>
                <Link
                  to={`/admin/roles/${assignedRole?.id || 'role-' + user.role}`}
                  className="text-xs font-semibold text-[#103321] hover:underline"
                >
                  Configure RBAC Matrix →
                </Link>
              </div>

              <div className="space-y-3">
                {SYSTEM_PERMISSION_GROUPS.map((group) => {
                  const rolePerms = assignedRole?.permissions || []
                  const grantedInGroup = group.permissions.filter((p) =>
                    rolePerms.includes(p.id)
                  )

                  if (grantedInGroup.length === 0) return null

                  return (
                    <div
                      key={group.id}
                      className="p-3 bg-gray-50/70 rounded-xl border border-gray-200"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-xs text-gray-900">
                          {group.label}
                        </span>
                        <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          {grantedInGroup.length} of {group.permissions.length} active
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                        {grantedInGroup.map((p) => (
                          <div
                            key={p.id}
                            className="flex items-center gap-1.5 text-xs text-gray-700"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span className="truncate">{p.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* User Activity History (Audit Trail) */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2">
                  <ScrollText className="w-5 h-5 text-gray-500" />
                  <h3 className="font-bold text-base text-gray-900">
                    Administrative Action History
                  </h3>
                </div>
                <Link
                  to="/admin/audit-logs"
                  className="text-xs font-semibold text-[#103321] hover:underline"
                >
                  View Full Audit Log →
                </Link>
              </div>

              {userAuditLogs.length === 0 ? (
                <div className="text-center py-6 text-gray-400 text-xs">
                  No administrative operations recorded for this user yet.
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {userAuditLogs.slice(0, 5).map((log) => (
                    <div key={log.id} className="py-3 flex items-start justify-between gap-3 text-xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-900">
                            {log.action}
                          </span>
                          <span className="text-[10px] uppercase font-bold text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded">
                            {log.entityType}
                          </span>
                          <span className="font-mono text-[10px] text-gray-400">
                            {log.entityId}
                          </span>
                        </div>
                        <p className="text-gray-600 mt-1">{log.description}</p>
                      </div>
                      <span className="text-[11px] text-gray-400 whitespace-nowrap">
                        {formatDate(log.timestamp)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Edit User Modal */}
        <UserFormModal
          isOpen={isEditModalOpen}
          user={user}
          onClose={() => setIsEditModalOpen(false)}
          onSubmit={handleUpdateUser}
        />

        {/* Confirmation Modal */}
        <ConfirmActionModal
          isOpen={isConfirmToggleOpen}
          title={
            isActive
              ? `Deactivate Staff User: ${user.name}?`
              : `Reactivate Staff User: ${user.name}?`
          }
          description={
            isActive
              ? 'Deactivating this user will prevent them from signing into the Admin Dashboard.'
              : 'Reactivating this user will restore their administrative role privileges.'
          }
          warning={
            user.role === 'admin'
              ? 'Security Policy: Ensuring continuous administrative governance across the IBTU platform.'
              : null
          }
          actionType={isActive ? 'danger' : 'success'}
          confirmText={isActive ? 'Deactivate Account' : 'Activate Account'}
          onConfirm={handleConfirmToggle}
          onCancel={() => setIsConfirmToggleOpen(false)}
        />
      </div>
    </AdminLayout>
  )
}
