import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Users,
  UserCheck,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  Star,
  MessageSquare,
} from 'lucide-react'
import AdminLayout from '../../components/admin/AdminLayout'
import AdminBreadcrumb from '../../components/admin/AdminBreadcrumb'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import CustomerFilters from '../../components/admin/CustomerFilters'
import CustomerTable from '../../components/admin/CustomerTable'
import ConfirmActionModal from '../../components/admin/ConfirmActionModal'
import {
  getStoredAdminCustomers,
  updateCustomerStatus,
  getEngagementKPIs,
  getCustomerMetrics,
} from '../../data/admin/adminEngagementData'

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState(() => getStoredAdminCustomers())
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [registrationRange, setRegistrationRange] = useState('all')
  const [sortBy, setSortBy] = useState('date-desc')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 8

  // Status Action Modal
  const [statusTargetCustomer, setStatusTargetCustomer] = useState(null)
  const [feedback, setFeedback] = useState(null)

  const showFeedback = (msg, type = 'success') => {
    setFeedback({ msg, type })
    setTimeout(() => setFeedback(null), 4000)
  }

  // Filter & Sort Logic
  const filteredCustomers = useMemo(() => {
    let result = [...customers]

    // Text Search
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim()
      result = result.filter(
        (c) =>
          c.name?.toLowerCase().includes(q) ||
          c.email?.toLowerCase().includes(q) ||
          c.phone?.includes(q) ||
          c.id?.toLowerCase().includes(q)
      )
    }

    // Status Filter
    if (selectedStatus !== 'all') {
      result = result.filter((c) => c.status === selectedStatus)
    }

    // Registration Date
    if (registrationRange !== 'all') {
      const now = new Date()
      result = result.filter((c) => {
        const regDate = new Date(c.registrationDate)
        const diffDays = (now - regDate) / (1000 * 3600 * 24)
        if (registrationRange === 'last30') return diffDays <= 30
        if (registrationRange === 'last90') return diffDays <= 90
        if (registrationRange === '2026') return regDate.getFullYear() === 2026
        if (registrationRange === '2025') return regDate.getFullYear() === 2025
        return true
      })
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'date-desc') return new Date(b.registrationDate) - new Date(a.registrationDate)
      if (sortBy === 'date-asc') return new Date(a.registrationDate) - new Date(b.registrationDate)
      if (sortBy === 'name-asc') return a.name.localeCompare(b.name)
      if (sortBy === 'name-desc') return b.name.localeCompare(a.name)
      if (sortBy === 'spending-desc') {
        const spendA = getCustomerMetrics(a.id, a.email).totalSpending
        const spendB = getCustomerMetrics(b.id, b.email).totalSpending
        return spendB - spendA
      }
      return 0
    })

    return result
  }, [customers, searchTerm, selectedStatus, registrationRange, sortBy])

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredCustomers.length / pageSize))
  const paginatedCustomers = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredCustomers.slice(start, start + pageSize)
  }, [filteredCustomers, currentPage, pageSize])

  const handleResetFilters = () => {
    setSearchTerm('')
    setSelectedStatus('all')
    setRegistrationRange('all')
    setSortBy('date-desc')
    setCurrentPage(1)
  }

  // Toggle status confirmation
  const handleOpenToggleStatus = (cust) => {
    setStatusTargetCustomer(cust)
  }

  const handleConfirmStatusChange = (reason) => {
    if (!statusTargetCustomer) return
    const nextStatus = statusTargetCustomer.status === 'Suspended' ? 'Active' : 'Suspended'
    const res = updateCustomerStatus(statusTargetCustomer.id, nextStatus)
    if (res.success) {
      setCustomers(getStoredAdminCustomers())
      setStatusTargetCustomer(null)
      showFeedback(
        `Customer "${statusTargetCustomer.name}" is now ${nextStatus}.`,
        nextStatus === 'Active' ? 'success' : 'warning'
      )
    } else {
      alert(res.message || 'Operation failed.')
    }
  }

  const kpis = getEngagementKPIs()

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Breadcrumb Navigation */}
        <AdminBreadcrumb
          items={[{ label: 'Customers & Engagement' }, { label: 'Customers' }]}
        />

        {/* Page Header */}
        <AdminPageHeader
          title="Customer Accounts Directory"
          subtitle="Review registered customer accounts, inspect lifetime order metrics, address books, and manage account statuses."
        >
          <div className="flex items-center gap-2">
            <Link
              to="/admin/reviews"
              className="px-3.5 py-2 rounded-xl border border-gray-200 hover:bg-white text-xs font-bold text-gray-700 transition-colors shadow-xs"
            >
              Reviews Queue
            </Link>
            <Link
              to="/admin/messages"
              className="px-4 py-2 rounded-xl bg-[#103321] hover:bg-[#103321]/90 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
            >
              <MessageSquare className="w-3.5 h-3.5 text-[#95C623]" />
              <span>Contact Inquiries</span>
            </Link>
          </div>
        </AdminPageHeader>

        {/* Feedback Alert */}
        {feedback && (
          <div
            className={`p-4 rounded-2xl border text-xs font-semibold flex items-center justify-between shadow-xs animate-fadeIn ${
              feedback.type === 'warning'
                ? 'bg-amber-50 border-amber-200 text-amber-900'
                : 'bg-emerald-50 border-emerald-200 text-emerald-900'
            }`}
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#95C623]" />
              <span>{feedback.msg}</span>
            </div>
            <button
              type="button"
              onClick={() => setFeedback(null)}
              className="text-gray-400 hover:text-gray-600 font-bold cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs space-y-1">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
              Total Accounts
            </span>
            <div className="text-xl font-extrabold text-[#103321]">
              {kpis.totalCustomers}
            </div>
            <span className="text-[10px] text-gray-500 block">Registered shoppers</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs space-y-1">
            <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider block">
              Active Accounts
            </span>
            <div className="text-xl font-extrabold text-emerald-700">
              {kpis.activeCustomers}
            </div>
            <span className="text-[10px] text-gray-500 block">Verified active status</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs space-y-1">
            <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider block">
              VIP Tier Members
            </span>
            <div className="text-xl font-extrabold text-amber-700">
              {customers.filter((c) => c.accountType?.includes('VIP')).length}
            </div>
            <span className="text-[10px] text-gray-500 block">High lifetime engagement</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs space-y-1">
            <span className="text-[11px] font-bold text-rose-600 uppercase tracking-wider block">
              Suspended Accounts
            </span>
            <div className="text-xl font-extrabold text-rose-700">
              {kpis.suspendedCustomers}
            </div>
            <span className="text-[10px] text-gray-500 block">Restricted logins</span>
          </div>
        </div>

        {/* Filter Bar */}
        <CustomerFilters
          searchTerm={searchTerm}
          setSearchTerm={(term) => {
            setSearchTerm(term)
            setCurrentPage(1)
          }}
          selectedStatus={selectedStatus}
          setSelectedStatus={(st) => {
            setSelectedStatus(st)
            setCurrentPage(1)
          }}
          registrationRange={registrationRange}
          setRegistrationRange={(rg) => {
            setRegistrationRange(rg)
            setCurrentPage(1)
          }}
          sortBy={sortBy}
          setSortBy={setSortBy}
          onReset={handleResetFilters}
          totalResults={filteredCustomers.length}
        />

        {/* Customer Table */}
        <CustomerTable
          customers={paginatedCustomers}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          onToggleStatus={handleOpenToggleStatus}
        />

        {/* Toggle Status Confirmation Dialog */}
        <ConfirmActionModal
          isOpen={Boolean(statusTargetCustomer)}
          title={
            statusTargetCustomer?.status === 'Suspended'
              ? `Reactivate account for ${statusTargetCustomer?.name}?`
              : `Suspend account for ${statusTargetCustomer?.name}?`
          }
          description={
            statusTargetCustomer?.status === 'Suspended'
              ? 'This will restore full shopping and order placement permissions for this customer account.'
              : 'This will temporarily restrict this customer from placing orders or logging into the storefront.'
          }
          warning="Account status updates in this frontend milestone operate on local browser storage only."
          actionType={statusTargetCustomer?.status === 'Suspended' ? 'success' : 'danger'}
          confirmText={
            statusTargetCustomer?.status === 'Suspended'
              ? 'Reactivate Account'
              : 'Confirm Suspension'
          }
          onConfirm={handleConfirmStatusChange}
          onCancel={() => setStatusTargetCustomer(null)}
        />
      </div>
    </AdminLayout>
  )
}
