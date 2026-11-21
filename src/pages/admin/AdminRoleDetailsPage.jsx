import { useState, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Users,
  ChevronLeft,
  Lock,
  UserCheck,
} from 'lucide-react'
import AdminLayout from '../../components/admin/AdminLayout'
import AdminBreadcrumb from '../../components/admin/AdminBreadcrumb'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import PermissionMatrix from '../../components/admin/PermissionMatrix'
import {
  getStoredAdminRoles,
  getStoredAdminUsers,
  updateRolePermissions,
} from '../../data/admin/adminAdministrationData'

export default function AdminRoleDetailsPage() {
  const { roleId } = useParams()
  const [roles, setRoles] = useState(() => getStoredAdminRoles())
  const [users] = useState(() => getStoredAdminUsers())

  // Find target role (support lookup by id 'role-admin' or roleKey 'admin')
  const role = useMemo(() => {
    return roles.find(
      (r) => r.id === roleId || r.roleKey === roleId
    )
  }, [roles, roleId])

  // Get assigned staff users
  const assignedUsers = useMemo(() => {
    if (!role) return []
    return users.filter((u) => u.role === role.roleKey)
  }, [users, role])

  if (!role) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <AdminBreadcrumb
            items={[
              { label: 'Admin', path: '/admin/dashboard' },
              { label: 'Roles & Permissions', path: '/admin/roles' },
              { label: 'Role Not Found' },
            ]}
          />
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-xs">
            <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Role Definition Not Found</h2>
            <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">
              The requested role with ID "{roleId}" does not exist in the system RBAC catalog.
            </p>
            <Link
              to="/admin/roles"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#103321] text-white text-xs font-semibold rounded-xl hover:bg-[#103321]/90 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Return to Roles & Permissions
            </Link>
          </div>
        </div>
      </AdminLayout>
    )
  }

  const handleSavePermissions = (id, newPermissions) => {
    const res = updateRolePermissions(id, newPermissions)
    if (res.success) {
      setRoles(getStoredAdminRoles())
    }
    return res
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Breadcrumb */}
        <AdminBreadcrumb
          items={[
            { label: 'Admin', path: '/admin/dashboard' },
            { label: 'Roles & Permissions', path: '/admin/roles' },
            { label: role.name },
          ]}
        />

        {/* Page Header */}
        <AdminPageHeader
          title={`${role.name} Role Policies`}
          subtitle={`Inspect and configure permissions for the ${role.roleKey} system role.`}
        >
          <Link
            to="/admin/roles"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Roles
          </Link>
        </AdminPageHeader>

        {/* Role Overview Card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-6 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-[#103321]/10 text-[#103321] flex items-center justify-center font-bold text-lg shrink-0">
                {role.roleKey === 'admin' ? (
                  <ShieldCheck className="w-6 h-6 text-[#103321]" />
                ) : role.roleKey === 'data_encoder' ? (
                  <ShieldAlert className="w-6 h-6 text-emerald-600" />
                ) : (
                  <Users className="w-6 h-6 text-gray-600" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-gray-900">{role.name}</h2>
                  <span className="font-mono text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                    {role.roleKey}
                  </span>
                  {role.isSystem && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-700">
                      <Lock className="w-3 h-3 text-gray-500" /> System Role
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">{role.description}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs">
              <div className="text-center px-3 py-2 bg-gray-50 rounded-xl border border-gray-100">
                <span className="block font-black text-base text-gray-900">
                  {role.roleKey === 'customer' ? '1,180' : assignedUsers.length}
                </span>
                <span className="text-gray-500 text-[11px]">Assigned Users</span>
              </div>
              <div className="text-center px-3 py-2 bg-gray-50 rounded-xl border border-gray-100">
                <span className="block font-black text-base text-[#103321]">
                  {role.permissions?.length || 0}
                </span>
                <span className="text-gray-500 text-[11px]">Active Privileges</span>
              </div>
            </div>
          </div>

          {/* Assigned Staff Members List (for Admin and Data Encoder) */}
          {role.roleKey !== 'customer' && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2.5 flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5" /> Staff Members Assigned to this Role ({assignedUsers.length})
              </h4>
              {assignedUsers.length === 0 ? (
                <p className="text-xs text-gray-400 italic">No staff users currently assigned.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                  {assignedUsers.map((u) => (
                    <Link
                      key={u.id}
                      to={`/admin/users/${u.id}`}
                      className="p-2.5 rounded-xl border border-gray-200 bg-gray-50/60 hover:bg-white hover:border-[#103321]/30 transition-all flex items-center gap-2.5 group"
                    >
                      <div className="w-8 h-8 rounded-full bg-[#103321] text-[#95C623] flex items-center justify-center font-bold text-xs shrink-0">
                        {u.avatar || u.firstName?.[0] || 'U'}
                      </div>
                      <div className="min-w-0">
                        <span className="font-semibold text-xs text-gray-900 group-hover:text-[#103321] block truncate">
                          {u.name}
                        </span>
                        <span className="text-[10px] text-gray-500 block truncate">
                          {u.email}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Permission Matrix */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-gray-900">
              Granular Privilege Configuration
            </h3>
            <span className="text-xs text-gray-500">
              Modify permissions below and click "Save Permissions" to commit audit log.
            </span>
          </div>

          <PermissionMatrix
            role={role}
            onSavePermissions={handleSavePermissions}
            readOnly={role.roleKey === 'customer'}
          />
        </div>
      </div>
    </AdminLayout>
  )
}
