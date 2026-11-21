import { useState, useMemo } from 'react'
import {
  UserCheck,
  ShieldCheck,
  ShieldAlert,
  UserX,
  Plus,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react'
import AdminLayout from '../../components/admin/AdminLayout'
import AdminBreadcrumb from '../../components/admin/AdminBreadcrumb'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import UserFilters from '../../components/admin/UserFilters'
import UserTable from '../../components/admin/UserTable'
import UserFormModal from '../../components/admin/UserFormModal'
import ConfirmActionModal from '../../components/admin/ConfirmActionModal'
import {
  getStoredAdminUsers,
  createAdminUser,
  updateAdminUser,
  toggleUserStatus,
  MOCK_ADMINISTRATION_NOTICE,
} from '../../data/admin/adminAdministrationData'

export default function AdminUsersPage() {
  const [users, setUsers] = useState(() => getStoredAdminUsers())
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRole, setSelectedRole] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [sortBy, setSortBy] = useState('date-desc')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 8

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [toggleTargetUser, setToggleTargetUser] = useState(null)
  const [feedback, setFeedback] = useState(null)

  const showFeedback = (text, type = 'success') => {
    setFeedback({ text, type })
    setTimeout(() => setFeedback(null), 4000)
  }

  // Filter & Sort Logic
  const filteredUsers = useMemo(() => {
    let result = [...users]

    // Text search
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim()
      result = result.filter(
        (u) =>
          u.name?.toLowerCase().includes(q) ||
          u.email?.toLowerCase().includes(q) ||
          u.phone?.includes(q) ||
          u.id?.toLowerCase().includes(q)
      )
    }

    // Role filter
    if (selectedRole !== 'all') {
      result = result.filter((u) => u.role === selectedRole)
    }

    // Status filter
    if (selectedStatus !== 'all') {
      result = result.filter((u) => u.status === selectedStatus)
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'date-desc') {
        return new Date(b.registrationDate) - new Date(a.registrationDate)
      }
      if (sortBy === 'date-asc') {
        return new Date(a.registrationDate) - new Date(b.registrationDate)
      }
      if (sortBy === 'name-asc') {
        return a.name.localeCompare(b.name)
      }
      if (sortBy === 'name-desc') {
        return b.name.localeCompare(a.name)
      }
      if (sortBy === 'login-desc') {
        if (!a.lastLogin) return 1
        if (!b.lastLogin) return -1
        return new Date(b.lastLogin) - new Date(a.lastLogin)
      }
      return 0
    })

    return result
  }, [users, searchTerm, selectedRole, selectedStatus, sortBy])

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize))
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredUsers.slice(start, start + pageSize)
  }, [filteredUsers, currentPage, pageSize])

  // Reset Filters
  const handleResetFilters = () => {
    setSearchTerm('')
    setSelectedRole('all')
    setSelectedStatus('all')
    setSortBy('date-desc')
    setCurrentPage(1)
  }

  // KPI Calculations
  const totalStaff = users.length
  const activeAdmins = users.filter((u) => u.role === 'admin' && u.status === 'Active').length
  const activeEncoders = users.filter((u) => u.role === 'data_encoder' && u.status === 'Active').length
  const inactiveStaff = users.filter((u) => u.status === 'Inactive').length

  // Handlers
  const handleOpenCreate = () => {
    setEditingUser(null)
    setIsFormModalOpen(true)
  }

  const handleOpenEdit = (user) => {
    setEditingUser(user)
    setIsFormModalOpen(true)
  }

  const handleFormSubmit = (formData) => {
    if (editingUser) {
      const res = updateAdminUser(editingUser.id, formData)
      if (!res.success) {
        showFeedback(res.message, 'error')
        return
      }
      showFeedback(`Successfully updated staff member ${res.user.name}.`)
    } else {
      const res = createAdminUser(formData)
      if (!res.success) {
        showFeedback(res.message, 'error')
        return
      }
      showFeedback(`Successfully provisioned new staff user ${res.user.name}.`)
    }
    setUsers(getStoredAdminUsers())
    setIsFormModalOpen(false)
    setEditingUser(null)
  }

  const handleConfirmToggleStatus = () => {
    if (!toggleTargetUser) return
    const res = toggleUserStatus(toggleTargetUser.id)
    if (!res.success) {
      showFeedback(res.message, 'error')
    } else {
      const action = res.user.status === 'Active' ? 'activated' : 'deactivated'
      showFeedback(`Staff user ${res.user.name} has been ${action}.`)
      setUsers(getStoredAdminUsers())
    }
    setToggleTargetUser(null)
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Breadcrumb */}
        <AdminBreadcrumb
          items={[
            { label: 'Admin', path: '/admin/dashboard' },
            { label: 'Staff Users' },
          ]}
        />

        {/* Page Header */}
        <AdminPageHeader
          title="Staff User Management"
          subtitle="Manage administrative profiles, assign Data Encoder privileges, and monitor staff access."
        >
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#103321] hover:bg-[#103321]/90 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4 text-[#95C623]" />
            Add Staff Member
          </button>
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

        {/* Notice */}
        <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-600 flex items-center justify-between">
          <span>{MOCK_ADMINISTRATION_NOTICE}</span>
          <span className="font-mono text-[11px] text-gray-400">Security Tier 1</span>
        </div>

        {/* KPI Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-gray-100 text-gray-700 flex items-center justify-center shrink-0">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">Total Staff Accounts</p>
              <h3 className="text-xl font-black text-gray-900 mt-0.5">{totalStaff}</h3>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#103321]/10 text-[#103321] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-[#103321]" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">Active Admins</p>
              <h3 className="text-xl font-black text-[#103321] mt-0.5">{activeAdmins}</h3>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">Active Data Encoders</p>
              <h3 className="text-xl font-black text-emerald-700 mt-0.5">{activeEncoders}</h3>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center shrink-0">
              <UserX className="w-5 h-5 text-rose-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">Inactive Accounts</p>
              <h3 className="text-xl font-black text-rose-700 mt-0.5">{inactiveStaff}</h3>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <UserFilters
          searchTerm={searchTerm}
          onSearchChange={(val) => {
            setSearchTerm(val)
            setCurrentPage(1)
          }}
          selectedRole={selectedRole}
          onRoleChange={(val) => {
            setSelectedRole(val)
            setCurrentPage(1)
          }}
          selectedStatus={selectedStatus}
          onStatusChange={(val) => {
            setSelectedStatus(val)
            setCurrentPage(1)
          }}
          sortBy={sortBy}
          onSortChange={setSortBy}
          onReset={handleResetFilters}
          totalResults={filteredUsers.length}
        />

        {/* Staff Users Table */}
        <UserTable
          users={paginatedUsers}
          onEditUser={handleOpenEdit}
          onToggleStatus={(target) => setToggleTargetUser(target)}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />

        {/* Create / Edit User Modal */}
        <UserFormModal
          isOpen={isFormModalOpen}
          user={editingUser}
          onClose={() => {
            setIsFormModalOpen(false)
            setEditingUser(null)
          }}
          onSubmit={handleFormSubmit}
        />

        {/* Toggle Status Confirmation Modal */}
        {toggleTargetUser && (
          <ConfirmActionModal
            isOpen={Boolean(toggleTargetUser)}
            title={
              toggleTargetUser.status === 'Active'
                ? `Deactivate Staff User: ${toggleTargetUser.name}?`
                : `Reactivate Staff User: ${toggleTargetUser.name}?`
            }
            description={
              toggleTargetUser.status === 'Active'
                ? 'Deactivating this account will immediately revoke all administrative and catalog access privileges until re-enabled by an administrator.'
                : 'Reactivating this account will restore standard administrative login access.'
            }
            warning={
              toggleTargetUser.role === 'admin'
                ? 'Security Warning: You are changing status on a System Administrator profile.'
                : null
            }
            actionType={toggleTargetUser.status === 'Active' ? 'danger' : 'success'}
            confirmText={toggleTargetUser.status === 'Active' ? 'Deactivate Account' : 'Activate Account'}
            onConfirm={handleConfirmToggleStatus}
            onCancel={() => setToggleTargetUser(null)}
          />
        )}
      </div>
    </AdminLayout>
  )
}
