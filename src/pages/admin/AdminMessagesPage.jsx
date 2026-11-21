import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  MessageSquare,
  CheckCircle2,
  Clock,
  Inbox,
  Send,
  AlertCircle,
  Users,
} from 'lucide-react'
import AdminLayout from '../../components/admin/AdminLayout'
import AdminBreadcrumb from '../../components/admin/AdminBreadcrumb'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import MessageFilters from '../../components/admin/MessageFilters'
import MessageTable from '../../components/admin/MessageTable'
import {
  getStoredAdminMessages,
  updateMessageStatus,
  getEngagementKPIs,
} from '../../data/admin/adminEngagementData'

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState(() => getStoredAdminMessages())
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [sortBy, setSortBy] = useState('date-desc')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 8

  const [feedback, setFeedback] = useState(null)

  const showFeedback = (msg, type = 'success') => {
    setFeedback({ msg, type })
    setTimeout(() => setFeedback(null), 4000)
  }

  // Filter & Sort
  const filteredMessages = useMemo(() => {
    let result = [...messages]

    // Text search
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim()
      result = result.filter(
        (m) =>
          m.senderName?.toLowerCase().includes(q) ||
          m.email?.toLowerCase().includes(q) ||
          m.subject?.toLowerCase().includes(q) ||
          m.message?.toLowerCase().includes(q)
      )
    }

    // Status filter
    if (selectedStatus !== 'all') {
      result = result.filter((m) => m.status === selectedStatus)
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'date-desc') return new Date(b.submissionDate) - new Date(a.submissionDate)
      if (sortBy === 'date-asc') return new Date(a.submissionDate) - new Date(b.submissionDate)
      return 0
    })

    return result
  }, [messages, searchTerm, selectedStatus, sortBy])

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredMessages.length / pageSize))
  const paginatedMessages = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredMessages.slice(start, start + pageSize)
  }, [filteredMessages, currentPage, pageSize])

  const handleResetFilters = () => {
    setSearchTerm('')
    setSelectedStatus('all')
    setSortBy('date-desc')
    setCurrentPage(1)
  }

  // Status Change
  const handleUpdateStatus = (msgItem, nextStatus) => {
    const res = updateMessageStatus(msgItem.id, nextStatus)
    if (res.success) {
      setMessages(getStoredAdminMessages())
      showFeedback(`Inquiry status updated to "${nextStatus}".`)
    }
  }

  const kpis = getEngagementKPIs()

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Breadcrumb Navigation */}
        <AdminBreadcrumb
          items={[{ label: 'Customers & Engagement' }, { label: 'Contact Messages' }]}
        />

        {/* Page Header */}
        <AdminPageHeader
          title="Customer Inquiries & Contact Messages"
          subtitle="Review customer inquiries received via the contact page, track support resolutions, and draft personalized replies."
        >
          <div className="flex items-center gap-2">
            <Link
              to="/admin/customers"
              className="px-3.5 py-2 rounded-xl border border-gray-200 hover:bg-white text-xs font-bold text-gray-700 transition-colors shadow-xs"
            >
              Customer Accounts
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
              className="text-gray-400 hover:text-gray-600 font-bold"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* KPI Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs space-y-1">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
              Total Inquiries
            </span>
            <div className="text-xl font-extrabold text-[#103321]">
              {kpis.totalMessages}
            </div>
            <span className="text-[10px] text-gray-500 block">All recorded submissions</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs space-y-1">
            <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider block">
              New Messages
            </span>
            <div className="text-xl font-extrabold text-amber-700">
              {kpis.newMessages}
            </div>
            <span className="text-[10px] text-gray-500 block">Needs attention</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs space-y-1">
            <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider block">
              In Progress
            </span>
            <div className="text-xl font-extrabold text-indigo-700">
              {kpis.inProgressMessages}
            </div>
            <span className="text-[10px] text-gray-500 block">Assigned / Drafted</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs space-y-1">
            <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider block">
              Resolved Cases
            </span>
            <div className="text-xl font-extrabold text-emerald-700">
              {kpis.resolvedMessages}
            </div>
            <span className="text-[10px] text-gray-500 block">Completed support</span>
          </div>
        </div>

        {/* Filter Controls */}
        <MessageFilters
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
          sortBy={sortBy}
          setSortBy={setSortBy}
          onReset={handleResetFilters}
          totalResults={filteredMessages.length}
        />

        {/* Message Table */}
        <MessageTable
          messages={paginatedMessages}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          onUpdateStatus={handleUpdateStatus}
        />
      </div>
    </AdminLayout>
  )
}
