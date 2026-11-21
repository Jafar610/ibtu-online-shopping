import { useState, useEffect } from 'react'
import {
  ShieldCheck,
  Lock,
  Check,
  AlertTriangle,
  Info,
  CheckCircle2,
  Save,
} from 'lucide-react'
import { SYSTEM_PERMISSION_GROUPS } from '../../data/admin/adminAdministrationData'

export default function PermissionMatrix({
  role,
  onSavePermissions,
  readOnly = false,
}) {
  const [selectedPermissions, setSelectedPermissions] = useState([])
  const [hasChanges, setHasChanges] = useState(false)
  const [feedback, setFeedback] = useState(null)

  useEffect(() => {
    if (role?.permissions) {
      setSelectedPermissions([...role.permissions])
      setHasChanges(false)
    }
  }, [role])

  if (!role) return null

  const isRoleAdmin = role.roleKey === 'admin'
  const isRoleDataEncoder = role.roleKey === 'data_encoder'
  const isRoleCustomer = role.roleKey === 'customer'

  // Critical protected permissions that Admin can never lose
  const ADMIN_PROTECTED = ['dashboard.view', 'users.manage', 'roles.manage', 'settings.manage']

  // Permissions strictly forbidden for Data Encoder
  const DATA_ENCODER_FORBIDDEN = ['users.manage', 'roles.manage', 'settings.manage', 'audit_logs.view']

  const isPermissionLocked = (permId) => {
    if (readOnly) return true
    if (isRoleCustomer) return true // Customer cannot be granted admin permissions
    if (isRoleAdmin && ADMIN_PROTECTED.includes(permId)) return true
    if (isRoleDataEncoder && DATA_ENCODER_FORBIDDEN.includes(permId)) return true
    return false
  }

  const getLockReason = (permId) => {
    if (isRoleCustomer) return 'Customer role cannot hold administrative privileges.'
    if (isRoleAdmin && ADMIN_PROTECTED.includes(permId)) {
      return 'Essential administrative privilege. Cannot be revoked from System Administrator.'
    }
    if (isRoleDataEncoder && DATA_ENCODER_FORBIDDEN.includes(permId)) {
      return 'Security Policy: Data Encoders are strictly restricted from administration and security settings.'
    }
    return null
  }

  const handleToggle = (permId) => {
    if (isPermissionLocked(permId)) return

    let next
    if (selectedPermissions.includes(permId)) {
      next = selectedPermissions.filter((p) => p !== permId)
    } else {
      next = [...selectedPermissions, permId]
    }
    setSelectedPermissions(next)
    setHasChanges(true)
  }

  const handleSelectAllGroup = (group) => {
    if (readOnly || isRoleCustomer) return
    const groupPerms = group.permissions
      .map((p) => p.id)
      .filter((id) => !isPermissionLocked(id) || selectedPermissions.includes(id))

    const allInGroupSelected = group.permissions.every((p) =>
      selectedPermissions.includes(p.id)
    )

    let next
    if (allInGroupSelected) {
      // Uncheck group except locked ones
      next = selectedPermissions.filter(
        (p) => !group.permissions.some((gp) => gp.id === p && !isPermissionLocked(p))
      )
    } else {
      // Add all group perms
      const toAdd = groupPerms.filter((p) => !selectedPermissions.includes(p))
      next = [...selectedPermissions, ...toAdd]
    }
    setSelectedPermissions(next)
    setHasChanges(true)
  }

  const handleSave = () => {
    const result = onSavePermissions?.(role.id, selectedPermissions)
    if (result && !result.success) {
      setFeedback({ type: 'error', text: result.message })
    } else {
      setFeedback({ type: 'success', text: 'Role permissions updated and logged successfully.' })
      setHasChanges(false)
    }
    setTimeout(() => setFeedback(null), 4000)
  }

  return (
    <div className="space-y-6">
      {/* RBAC Policy Notice Banner */}
      {isRoleCustomer ? (
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl flex items-start gap-3">
          <Info className="w-5 h-5 text-gray-500 shrink-0 mt-0.5" />
          <div className="text-xs text-gray-600">
            <strong className="font-semibold text-gray-900 block mb-0.5">
              Customer Zero Administrative Privilege
            </strong>
            The Customer role is restricted entirely to public storefront browsing, personal shopping cart, checkout, and self-service account profiles.
            Administrative dashboard access is strictly prohibited.
          </div>
        </div>
      ) : isRoleAdmin ? (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
          <div className="text-xs text-emerald-900">
            <strong className="font-semibold text-emerald-950 block mb-0.5">
              System Administrator Full Access
            </strong>
            The Administrator role holds system governance authority.
            Essential privileges (User Management, RBAC Policies, System Settings, and Overview) are permanently locked to preserve administrative continuity.
          </div>
        </div>
      ) : (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-900">
            <strong className="font-semibold text-amber-950 block mb-0.5">
              Data Encoder Scoped Access
            </strong>
            Data Encoders are limited to Catalog and Inventory management operations. Administration, settings, financial payment reviews, and audit logs are strictly protected.
          </div>
        </div>
      )}

      {/* Feedback Toast */}
      {feedback && (
        <div
          className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200 ${
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

      {/* Permission Groups */}
      <div className="space-y-4">
        {SYSTEM_PERMISSION_GROUPS.map((group) => {
          const groupPermIds = group.permissions.map((p) => p.id)
          const assignedCount = groupPermIds.filter((id) =>
            selectedPermissions.includes(id)
          ).length

          return (
            <div
              key={group.id}
              className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden"
            >
              {/* Group Header */}
              <div className="bg-gray-50/80 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-gray-900">
                    {group.label}
                  </h4>
                  <span className="text-[11px] text-gray-500">
                    {assignedCount} of {group.permissions.length} privileges granted
                  </span>
                </div>

                {!readOnly && !isRoleCustomer && (
                  <button
                    type="button"
                    onClick={() => handleSelectAllGroup(group)}
                    className="text-xs font-semibold text-[#103321] hover:underline"
                  >
                    {assignedCount === group.permissions.length ? 'Deselect Group' : 'Select All'}
                  </button>
                )}
              </div>

              {/* Group Permissions List */}
              <div className="divide-y divide-gray-100">
                {group.permissions.map((perm) => {
                  const isChecked = selectedPermissions.includes(perm.id)
                  const isLocked = isPermissionLocked(perm.id)
                  const lockReason = getLockReason(perm.id)

                  return (
                    <div
                      key={perm.id}
                      onClick={() => !isLocked && handleToggle(perm.id)}
                      className={`px-4 py-3 flex items-start justify-between gap-4 transition-colors ${
                        isLocked
                          ? 'bg-gray-50/50 cursor-not-allowed opacity-80'
                          : 'hover:bg-gray-50/60 cursor-pointer'
                      }`}
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="pt-0.5">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            disabled={isLocked}
                            onChange={() => !isLocked && handleToggle(perm.id)}
                            className="w-4 h-4 text-[#103321] rounded border-gray-300 focus:ring-[#103321]/20 cursor-pointer disabled:cursor-not-allowed"
                          />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-xs text-gray-900">
                              {perm.name}
                            </span>
                            <span className="font-mono text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                              {perm.id}
                            </span>
                            {isLocked && (
                              <span
                                title={lockReason}
                                className="inline-flex items-center gap-1 text-[10px] font-bold text-gray-500 bg-gray-200/80 px-1.5 py-0.5 rounded"
                              >
                                <Lock className="w-2.5 h-2.5" />
                                Locked
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {perm.description}
                          </p>
                          {lockReason && (
                            <p className="text-[11px] text-amber-700/80 mt-1 italic">
                              Policy: {lockReason}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="shrink-0 pt-0.5">
                        {isChecked ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <Check className="w-3 h-3" /> Granted
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-gray-100 text-gray-500">
                            Revoked
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* Save Action Bar */}
      {!readOnly && (
        <div className="sticky bottom-4 bg-[#103321] text-white p-4 rounded-xl shadow-lg border border-white/10 flex items-center justify-between gap-4 z-20">
          <div className="text-xs">
            <span className="font-bold text-[#95C623] block text-sm">
              Role: {role.name}
            </span>
            <span>
              Total active privileges: <strong className="text-white">{selectedPermissions.length}</strong>
              {hasChanges && ' (Unsaved modifications)'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setSelectedPermissions([...role.permissions])
                setHasChanges(false)
              }}
              disabled={!hasChanges}
              className="px-3 py-1.5 text-xs font-medium text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={!hasChanges}
              className="px-4 py-1.5 text-xs font-bold text-[#103321] bg-[#95C623] hover:bg-[#95C623]/90 rounded-lg shadow-sm transition-colors flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              Save Permissions
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
