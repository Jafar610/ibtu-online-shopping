import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Star,
  CheckCircle2,
  XCircle,
  Clock,
  MessageSquare,
  Users,
} from 'lucide-react'
import AdminLayout from '../../components/admin/AdminLayout'
import AdminBreadcrumb from '../../components/admin/AdminBreadcrumb'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import ReviewFilters from '../../components/admin/ReviewFilters'
import ReviewTable from '../../components/admin/ReviewTable'
import ReviewModerationModal from '../../components/admin/ReviewModerationModal'
import {
  getStoredAdminReviews,
  moderateReview,
  getEngagementKPIs,
} from '../../data/admin/adminEngagementData'

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState(() => getStoredAdminReviews())
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRating, setSelectedRating] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [verifiedFilter, setVerifiedFilter] = useState('all')
  const [sortBy, setSortBy] = useState('date-desc')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 8

  // Modal State
  const [moderatingReview, setModeratingReview] = useState(null)
  const [feedback, setFeedback] = useState(null)

  const showFeedback = (msg, type = 'success') => {
    setFeedback({ msg, type })
    setTimeout(() => setFeedback(null), 4000)
  }

  // Filter & Sort
  const filteredReviews = useMemo(() => {
    let result = [...reviews]

    // Text Search
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim()
      result = result.filter(
        (r) =>
          r.productName?.toLowerCase().includes(q) ||
          r.author?.toLowerCase().includes(q) ||
          r.title?.toLowerCase().includes(q) ||
          r.body?.toLowerCase().includes(q)
      )
    }

    // Rating Filter
    if (selectedRating !== 'all') {
      const targetRating = Number(selectedRating)
      result = result.filter((r) => Math.round(r.rating) === targetRating)
    }

    // Moderation Status
    if (selectedStatus !== 'all') {
      result = result.filter((r) => r.status === selectedStatus)
    }

    // Verified Filter
    if (verifiedFilter !== 'all') {
      if (verifiedFilter === 'verified') result = result.filter((r) => r.verified)
      if (verifiedFilter === 'unverified') result = result.filter((r) => !r.verified)
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'date-desc') return new Date(b.date) - new Date(a.date)
      if (sortBy === 'date-asc') return new Date(a.date) - new Date(b.date)
      if (sortBy === 'rating-desc') return (b.rating || 0) - (a.rating || 0)
      if (sortBy === 'rating-asc') return (a.rating || 0) - (b.rating || 0)
      return 0
    })

    return result
  }, [reviews, searchTerm, selectedRating, selectedStatus, verifiedFilter, sortBy])

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredReviews.length / pageSize))
  const paginatedReviews = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredReviews.slice(start, start + pageSize)
  }, [filteredReviews, currentPage, pageSize])

  const handleResetFilters = () => {
    setSearchTerm('')
    setSelectedRating('all')
    setSelectedStatus('all')
    setVerifiedFilter('all')
    setSortBy('date-desc')
    setCurrentPage(1)
  }

  // Moderation Handler
  const handleApprove = (reviewId, note) => {
    const res = moderateReview(reviewId, { action: 'approve', note })
    if (res.success) {
      setReviews(getStoredAdminReviews())
      setModeratingReview(null)
      showFeedback('Product review approved and marked as published.')
    }
  }

  const handleReject = (reviewId, note) => {
    const res = moderateReview(reviewId, { action: 'reject', note })
    if (res.success) {
      setReviews(getStoredAdminReviews())
      setModeratingReview(null)
      showFeedback('Product review rejected and archived.', 'warning')
    }
  }

  const kpis = getEngagementKPIs()

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Breadcrumb Navigation */}
        <AdminBreadcrumb
          items={[{ label: 'Customers & Engagement' }, { label: 'Product Reviews' }]}
        />

        {/* Page Header */}
        <AdminPageHeader
          title="Product Reviews & Ratings Moderation"
          subtitle="Moderate customer feedback on artisan garments, inspect star ratings, verify purchase authenticity, and maintain brand standards."
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

        {/* KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs space-y-1">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
              Total Reviews
            </span>
            <div className="text-xl font-extrabold text-[#103321]">
              {kpis.totalReviews}
            </div>
            <span className="text-[10px] text-gray-500 block">Across all products</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs space-y-1">
            <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider block">
              Pending Queue
            </span>
            <div className="text-xl font-extrabold text-amber-700">
              {kpis.pendingReviews}
            </div>
            <span className="text-[10px] text-gray-500 block">Awaiting review</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs space-y-1">
            <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider block">
              Approved & Live
            </span>
            <div className="text-xl font-extrabold text-emerald-700">
              {kpis.approvedReviews}
            </div>
            <span className="text-[10px] text-gray-500 block">Publicly displayed</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs space-y-1">
            <span className="text-[11px] font-bold text-rose-600 uppercase tracking-wider block">
              Rejected / Hidden
            </span>
            <div className="text-xl font-extrabold text-rose-700">
              {kpis.rejectedReviews}
            </div>
            <span className="text-[10px] text-gray-500 block">Archived by moderator</span>
          </div>
        </div>

        {/* Filters */}
        <ReviewFilters
          searchTerm={searchTerm}
          setSearchTerm={(term) => {
            setSearchTerm(term)
            setCurrentPage(1)
          }}
          selectedRating={selectedRating}
          setSelectedRating={(r) => {
            setSelectedRating(r)
            setCurrentPage(1)
          }}
          selectedStatus={selectedStatus}
          setSelectedStatus={(st) => {
            setSelectedStatus(st)
            setCurrentPage(1)
          }}
          verifiedFilter={verifiedFilter}
          setVerifiedFilter={(vf) => {
            setVerifiedFilter(vf)
            setCurrentPage(1)
          }}
          sortBy={sortBy}
          setSortBy={setSortBy}
          onReset={handleResetFilters}
          totalResults={filteredReviews.length}
        />

        {/* Review Table */}
        <ReviewTable
          reviews={paginatedReviews}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          onModerateReview={(rev) => setModeratingReview(rev)}
        />

        {/* Moderation Modal */}
        <ReviewModerationModal
          isOpen={Boolean(moderatingReview)}
          review={moderatingReview}
          onClose={() => setModeratingReview(null)}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      </div>
    </AdminLayout>
  )
}
