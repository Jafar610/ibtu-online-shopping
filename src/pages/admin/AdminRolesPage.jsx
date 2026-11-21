import { useState, useMemo } from 'react'
import { ShieldCheck, ShieldAlert, Users, Info } from 'lucide-react'
import AdminLayout from '../../components/admin/AdminLayout'
import AdminBreadcrumb from '../../components/admin/AdminBreadcrumb'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import RoleTable from '../../components/admin/RoleTable'
import {
  getStoredAdminRoles,
  getStoredAdminUsers,
  MOCK_ADMINISTRATION_NOTICE,
} from '../../data/admin/adminAdministrationData'

export default function AdminRolesPage() {
  const [roles] = useState(() => getStoredAdminRoles())
  const [users] = useState(() => getStoredAdminUsers())

  // Dynamic user counts per role from active staff dataset
  const usersCountByRole = useMemo(() => {
    const counts = {
      admin: users.filter((u) => u.role === 'admin').length,
      data_encoder: users.filter((u) => u.role === 'data_encoder').length,
      customer: 1180, // Representative customer baseline
    }
    return counts
  }, [users])

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Breadcrumb */}
        <AdminBreadcrumb
          items={[
            { label: 'Admin', path: '/admin/dashboard' },
            { label: 'Roles & Permissions' },
          ]}
        />

        {/* Page Header */}
        <AdminPageHeader
          title="Role-Based Access Control (RBAC)"
          subtitle="Inspect system authorization policies, security boundaries, and granular permission matrices."
        />

        {/* Mock State Notice */}
        <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-600 flex items-center justify-between">
          <span>{MOCK_ADMINISTRATION_NOTICE}</span>
          <span className="font-mono text-[11px] text-gray-400">Security Architecture</span>
        </div>

        {/* RBAC Security Principles Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs space-y-2">
            <div className="w-9 h-9 rounded-lg bg-[#103321]/10 text-[#103321] flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5 text-[#103321]" />
            </div>
            <h4 className="font-bold text-sm text-gray-900">Administrator</h4>
            <p className="text-xs text-gray-500 leading-relaxed">
              Full administrative authority across all store operations, orders, financials, customer relationships, staff accounts, and system configuration.
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs space-y-2">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <ShieldAlert className="w-5 h-5 text-emerald-600" />
            </div>
            <h4 className="font-bold text-sm text-gray-900">Data Encoder</h4>
            <p className="text-xs text-gray-500 leading-relaxed">
              Scoped catalog & inventory access. Manages garment listings, categories, descriptions, and stock counts. Strictly forbidden from financial, user, and system settings.
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs space-y-2">
            <div className="w-9 h-9 rounded-lg bg-gray-100 text-gray-700 flex items-center justify-center font-bold">
              <Users className="w-5 h-5 text-gray-600" />
            </div>
            <h4 className="font-bold text-sm text-gray-900">Customer</h4>
            <p className="text-xs text-gray-500 leading-relaxed">
              Zero administrative privilege. Restricted strictly to public storefront browsing, personal shopping cart, checkout, and self-service account management.
            </p>
          </div>
        </div>

        {/* Roles Table */}
        <RoleTable roles={roles} usersCountByRole={usersCountByRole} />

        {/* RBAC Guidelines Footer */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <strong className="font-bold block">IBTU Security Governance Compliance</strong>
            <p className="text-blue-800">
              In accordance with security requirements, system roles are strictly bound to existing definitions (Admin, Data Encoder, Customer).
              System administrator accounts are protected to ensure at least one active administrator remains present in the system at all times.
            </p>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
