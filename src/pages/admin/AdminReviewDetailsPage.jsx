import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  ArrowLeft,
  Star,
  CheckCircle2,
  XCircle,
  BadgeCheck,
  User,
  ShoppingBag,
  Calendar,
  AlertTriangle,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react'
import AdminLayout from '../../components/admin/AdminLayout'
import AdminBreadcrumb from '../../components/admin/AdminBreadcrumb'
import AdminStatusBadge from '../../components/admin/AdminStatusBadge'
import RatingDisplay from '../../components/admin/RatingDisplay'
import ReviewModerationModal from '../../components/admin/ReviewModerationModal'
import {
  getStoredAdminReviews,
  moderateReview,
} from '../../data/admin/adminEngagementData'

export default function AdminReviewDetailsPage() {
  const { reviewId } = useParams()
  const [review, setReview] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [feedback, setFeedback] = useState(null)

  const showFeedback = (msg, type = 'success') => {
    setFeedback({ msg, type })
    setTimeout(() => setFeedback(null), 4000)
  }

  const loadReview = () => {
    const list = getStoredAdminReviews()
    const found = list.find((r) => r.id === reviewId)
    setReview(found || null)
  }

  useEffect(() => {
    loadReview()
  }, [reviewId])

  if (!review) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <AdminBreadcrumb
            items={[
              { label: 'Customers & Engagement' },
              { label: 'Product Reviews', path: '/admin/reviews' },
              { label: 'Not Found' },
            ]}
          />
          <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h2 className="font-serif font-bold text-xl text-[#103321]">
              Review Not Found
            </h2>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              No product review matching identifier "{reviewId}" was found in local storage.
            </p>
            <Link
              to="/admin/reviews"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#103321] text-white text-xs font-bold hover:bg-[#103321]/90"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Reviews</span>
            </Link>
          </div>
        </div>
      </AdminLayout>
    )
  }

  const handleApprove = (id, note) => {
    const res = moderateReview(id, { action: 'approve', note })
    if (res.success) {
      loadReview()
      setIsModalOpen(false)
      showFeedback('Product review approved and published.')
    }
  }

  const handleReject = (id, note) => {
    const res = moderateReview(id, { action: 'reject', note })
    if (res.success) {
      loadReview()
      setIsModalOpen(false)
      showFeedback('Product review rejected and archived.', 'warning')
    }
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A'
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    } catch {
      return dateStr
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Breadcrumb Navigation */}
        <AdminBreadcrumb
          items={[
            { label: 'Customers & Engagement' },
            { label: 'Product Reviews', path: '/admin/reviews' },
            { label: review.id },
          ]}
        />

        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              to="/admin/reviews"
              className="p-2 rounded-xl border border-gray-200 hover:bg-white text-gray-600 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="font-serif font-extrabold text-2xl text-[#103321]">
                  Review {review.id}
                </h1>
                <AdminStatusBadge status={review.status} type="review" />
                {review.verified && (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    <BadgeCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Verified Buyer</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Submitted on {formatDate(review.date)} for product <span className="font-bold text-gray-800">{review.productName}</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-[#103321] hover:bg-[#103321]/90 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer self-start md:self-auto"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#95C623]" />
            <span>Moderate Review</span>
          </button>
        </div>

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

        {/* 2-Column Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column (2 cols): Review Content & Moderation History */}
          <div className="lg:col-span-2 space-y-6">
            {/* Review Body Card */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-xs p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <RatingDisplay rating={review.rating} size="md" showNumber={true} />
                <span className="text-xs text-gray-400">
                  {formatDate(review.date)}
                </span>
              </div>

              <div className="space-y-2">
                <h3 className="font-serif font-bold text-lg text-gray-900">
                  "{review.title}"
                </h3>
                <p className="text-xs sm:text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                  {review.body}
                </p>
              </div>
            </div>

            {/* Moderation Notes & Audit */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-xs p-6 space-y-3">
              <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                <ShieldCheck className="w-4 h-4 text-[#103321]" />
                <h3 className="font-serif font-bold text-base text-[#103321]">
                  Moderation Log & Notes
                </h3>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Current Status</span>
                  <AdminStatusBadge status={review.status} type="review" />
                </div>

                {review.moderationNote && (
                  <div className="pt-2">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                      Moderation Rationale
                    </span>
                    <p className="text-xs text-gray-800 bg-gray-50 p-3.5 rounded-2xl border border-gray-100 italic">
                      "{review.moderationNote}"
                    </p>
                  </div>
                )}

                {review.moderatedBy && (
                  <div className="text-[11px] text-gray-500 pt-1">
                    Moderated by <span className="font-bold">{review.moderatedBy}</span>
                    {review.moderatedAt && ` on ${formatDate(review.moderatedAt)}`}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column (1 col): Product Snapshot & Reviewer */}
          <div className="space-y-6">
            {/* Product Card */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-xs p-5 sm:p-6 space-y-4">
              <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                <ShoppingBag className="w-4 h-4 text-[#103321]" />
                <h3 className="font-serif font-bold text-sm text-[#103321]">
                  Reviewed Garment
                </h3>
              </div>

              <div className="space-y-3">
                <img
                  src={review.productImage}
                  alt={review.productName}
                  className="w-full aspect-square rounded-2xl object-cover bg-gray-50 border border-gray-100"
                />

                <div className="space-y-1">
                  <h4 className="font-bold text-xs text-gray-900">
                    {review.productName}
                  </h4>
                  <span className="text-[10px] text-gray-400 block uppercase font-bold tracking-wider">
                    Category: {review.productCategory}
                  </span>
                  <span className="text-[10px] text-gray-400 block font-mono">
                    Product ID: {review.productId}
                  </span>
                </div>
              </div>
            </div>

            {/* Author Profile */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-xs p-5 sm:p-6 space-y-3">
              <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                <User className="w-4 h-4 text-[#103321]" />
                <h3 className="font-serif font-bold text-sm text-[#103321]">
                  Reviewer Profile
                </h3>
              </div>

              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                    Author Name
                  </span>
                  <span className="font-bold text-gray-900">
                    {review.author}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                    Verified Purchase Status
                  </span>
                  <span
                    className={`inline-block mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      review.verified
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {review.verified ? 'VERIFIED BUYER' : 'UNVERIFIED REVIEW'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Moderation Modal */}
        <ReviewModerationModal
          isOpen={isModalOpen}
          review={review}
          onClose={() => setIsModalOpen(false)}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      </div>
    </AdminLayout>
  )
}
