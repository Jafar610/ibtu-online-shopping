import { Link } from 'react-router-dom'
import { Shield, ShieldCheck, ShieldAlert, Users, CheckCircle2, ChevronRight, Eye } from 'lucide-react'

export default function RoleTable({ roles, usersCountByRole = {} }) {
  const getRoleIcon = (roleKey) => {
    switch (roleKey) {
      case 'admin':
        return <ShieldCheck className="w-5 h-5 text-[#103321]" />
      case 'data_encoder':
        return <ShieldAlert className="w-5 h-5 text-emerald-600" />
      default:
        return <Users className="w-5 h-5 text-gray-500" />
    }
  }

  const getRoleBadge = (roleKey) => {
    switch (roleKey) {
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#103321]/10 text-[#103321] border border-[#103321]/20">
            System Administrator
          </span>
        )
      case 'data_encoder':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            Catalog & Inventory Staff
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200">
            Storefront Shopper
          </span>
        )
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <th className="py-3.5 px-5">Role Name</th>
              <th className="py-3.5 px-4">Role Key</th>
              <th className="py-3.5 px-4">Assigned Users</th>
              <th className="py-3.5 px-4">Permissions</th>
              <th className="py-3.5 px-4">Security Tier</th>
              <th className="py-3.5 px-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {roles.map((role) => {
              const userCount = usersCountByRole[role.roleKey] ?? role.userCount
              const permCount = role.permissions?.length || 0

              return (
                <tr
                  key={role.id}
                  className="hover:bg-gray-50/70 transition-colors group"
                >
                  {/* Role Name & Description */}
                  <td className="py-4 px-5">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 mt-0.5">
                        {getRoleIcon(role.roleKey)}
                      </div>
                      <div className="min-w-0">
                        <Link
                          to={`/admin/roles/${role.id}`}
                          className="font-bold text-gray-900 hover:text-[#103321] transition-colors flex items-center gap-2"
                        >
                          {role.name}
                          {role.isSystem && (
                            <span className="text-[10px] uppercase font-bold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                              System
                            </span>
                          )}
                        </Link>
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2 max-w-md">
                          {role.description}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Role Key */}
                  <td className="py-4 px-4 font-mono text-xs text-gray-600">
                    <span className="bg-gray-100 px-2 py-1 rounded">
                      {role.roleKey}
                    </span>
                  </td>

                  {/* Assigned Users */}
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-1.5 text-xs text-gray-700">
                      <Users className="w-4 h-4 text-gray-400" />
                      <strong className="text-gray-900 font-semibold">{userCount}</strong> active {userCount === 1 ? 'user' : 'users'}
                    </div>
                  </td>

                  {/* Permissions Count */}
                  <td className="py-4 px-4">
                    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                      {permCount} {permCount === 1 ? 'Privilege' : 'Privileges'}
                    </span>
                  </td>

                  {/* Security Tier Badge */}
                  <td className="py-4 px-4">
                    {getRoleBadge(role.roleKey)}
                  </td>

                  {/* Actions */}
                  <td className="py-4 px-5 text-right">
                    <Link
                      to={`/admin/roles/${role.id}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#103321] bg-[#103321]/10 hover:bg-[#103321]/20 rounded-lg transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Inspect & Permissions
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
