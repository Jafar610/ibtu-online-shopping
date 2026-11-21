import { useState, useMemo } from 'react'
import {
  ScrollText,
  Search,
  Filter,
  RotateCcw,
  ShieldCheck,
  Lock,
  Activity,
  UserCheck,
} from 'lucide-react'
import AdminLayout from '../../components/admin/AdminLayout'
import AdminBreadcrumb from '../../components/admin/AdminBreadcrumb'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import AuditLogTable from '../../components/admin/AuditLogTable'
import AuditLogDetailsModal from '../../components/admin/AuditLogDetailsModal'
import {
  getStoredAdminAuditLogs,
  MOCK_ADMINISTRATION_NOTICE,
} from '../../data/admin/adminAdministrationData'

export default function AdminAuditLogsPage() {
  const [logs] = useState(() => getStoredAdminAuditLogs())
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedAction, setSelectedAction] = useState('all')
  const [selectedEntityType, setSelectedEntityType] = useState('all')
  const [selectedRange, setSelectedRange] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  const [inspectedLog, setInspectedLog] = useState(null)

  // Filter Logic
  const filteredLogs = useMemo(() => {
    let result = [...logs]
    const now = new Date()

    // Text search
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim()
      result = result.filter(
        (log) =>
          log.userName?.toLowerCase().includes(q) ||
          log.description?.toLowerCase().includes(q) ||
          log.entityId?.toLowerCase().includes(q) ||
          log.id?.toLowerCase().includes(q)
      )
    }

    // Action filter
    if (selectedAction !== 'all') {
      result = result.filter((log) => log.action === selectedAction)
    }

    // Entity Type filter
    if (selectedEntityType !== 'all') {
      result = result.filter((log) => log.entityType === selectedEntityType)
    }

    // Date Range
    if (selectedRange !== 'all') {
      result = result.filter((log) => {
        const d = new Date(log.timestamp)
        const diffHours = (now - d) / (1000 * 3600)
        if (selectedRange === 'today') return diffHours <= 24
        if (selectedRange === 'last7') return diffHours <= 24 * 7
        if (selectedRange === 'last30') return diffHours <= 24 * 30
        return true
      })
    }

    // Chronological Sort: newest first
    result.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))

    return result
  }, [logs, searchTerm, selectedAction, selectedEntityType, selectedRange])

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / pageSize))
  const paginatedLogs = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredLogs.slice(start, start + pageSize)
  }, [filteredLogs, currentPage, pageSize])

  const handleResetFilters = () => {
    setSearchTerm('')
    setSelectedAction('all')
    setSelectedEntityType('all')
    setSelectedRange('all')
    setCurrentPage(1)
  }

  // KPI Calculations
  const totalLogs = logs.length
  const uniqueActors = new Set(logs.map((l) => l.userName)).size
  const statusChangesCount = logs.filter((l) => l.action === 'Status Change' || l.action === 'Approved').length
  const creationsCount = logs.filter((l) => l.action === 'Created').length

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Breadcrumb */}
        <AdminBreadcrumb
          items={[
            { label: 'Admin', path: '/admin/dashboard' },
            { label: 'Audit Logs' },
          ]}
        />

        {/* Page Header */}
        <AdminPageHeader
          title="System Audit Trail & Security Ledger"
          subtitle="Immutable chronological logs of administrative operations, catalog edits, payment reviews, and user role updates."
        >
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#103321]/10 text-[#103321] border border-[#103321]/20">
              <Lock className="w-3.5 h-3.5 text-[#103321]" />
              Read-Only Security Ledger
            </span>
          </div>
        </AdminPageHeader>

        {/* Mock State Notice */}
        <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-600 flex items-center justify-between">
          <span>{MOCK_ADMINISTRATION_NOTICE}</span>
          <span className="font-mono text-[11px] text-gray-400">Tamper-Proof Audit System</span>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-gray-100 text-gray-700 flex items-center justify-center shrink-0">
              <ScrollText className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">Recorded Operations</p>
              <h3 className="text-xl font-black text-gray-900 mt-0.5">{totalLogs}</h3>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
              <UserCheck className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">Active Staff Actors</p>
              <h3 className="text-xl font-black text-emerald-700 mt-0.5">{uniqueActors}</h3>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
              <Activity className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">Approvals & Transitions</p>
              <h3 className="text-xl font-black text-amber-700 mt-0.5">{statusChangesCount}</h3>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#103321]/10 text-[#103321] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-[#103321]" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">Entity Creations</p>
              <h3 className="text-xl font-black text-[#103321] mt-0.5">{creationsCount}</h3>
            </div>
          </div>
        </div>

        {/* Filters Toolbar */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm space-y-3">
          <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setCurrentPage(1)
                }}
                placeholder="Search by actor name, event description, or resource ID..."
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#103321]/20 focus:border-[#103321]"
              />
            </div>

            {/* Action, Entity, and Date Range Selectors */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Action Filter */}
              <div className="flex items-center gap-1.5 min-w-[130px]">
                <Filter className="w-4 h-4 text-gray-400 shrink-0" />
                <select
                  value={selectedAction}
                  onChange={(e) => {
                    setSelectedAction(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="w-full text-xs font-medium py-2 px-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#103321]/20 focus:border-[#103321]"
                >
                  <option value="all">All Actions</option>
                  <option value="Created">Created</option>
                  <option value="Updated">Updated</option>
                  <option value="Deleted">Deleted</option>
                  <option value="Approved">Approved</option>
                  <option value="Status Change">Status Change</option>
                  <option value="Stock Adjustment">Stock Adjustment</option>
                </select>
              </div>

              {/* Entity Type Filter */}
              <select
                value={selectedEntityType}
                onChange={(e) => {
                  setSelectedEntityType(e.target.value)
                  setCurrentPage(1)
                }}
                className="text-xs font-medium py-2 px-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#103321]/20 focus:border-[#103321]"
              >
                <option value="all">All Resources</option>
                <option value="Order">Orders</option>
                <option value="Payment">Payments</option>
                <option value="Shipment">Shipments</option>
                <option value="Inventory">Inventory</option>
                <option value="User">Staff Users</option>
                <option value="Role">RBAC Roles</option>
                <option value="Coupon">Coupons</option>
                <option value="Setting">Settings</option>
                <option value="Review">Reviews</option>
              </select>

              {/* Timeframe */}
              <select
                value={selectedRange}
                onChange={(e) => {
                  setSelectedRange(e.target.value)
                  setCurrentPage(1)
                }}
                className="text-xs font-medium py-2 px-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#103321]/20 focus:border-[#103321]"
              >
                <option value="all">All Historical Logs</option>
                <option value="today">Past 24 Hours</option>
                <option value="last7">Past 7 Days</option>
                <option value="last30">Past 30 Days</option>
              </select>

              {/* Reset */}
              {(searchTerm || selectedAction !== 'all' || selectedEntityType !== 'all' || selectedRange !== 'all') && (
                <button
                  onClick={handleResetFilters}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset
                </button>
              )}
            </div>
          </div>

          <div className="text-xs text-gray-500 pt-2 border-t border-gray-100 flex items-center justify-between">
            <span>
              Showing <strong className="text-gray-900">{filteredLogs.length}</strong> of{' '}
              <strong className="text-gray-900">{logs.length}</strong> immutable log entries
            </span>
            <span className="text-[11px] text-gray-400">
              Audit records cannot be edited or purged
            </span>
          </div>
        </div>

        {/* Audit Log Table */}
        <AuditLogTable
          logs={paginatedLogs}
          onInspectLog={(log) => setInspectedLog(log)}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />

        {/* Details Inspector Modal */}
        <AuditLogDetailsModal
          isOpen={Boolean(inspectedLog)}
          log={inspectedLog}
          onClose={() => setInspectedLog(null)}
        />
      </div>
    </AdminLayout>
  )
}
