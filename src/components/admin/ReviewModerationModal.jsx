import { useState, useEffect } from 'react'
import { Star, CheckCircle, XCircle, X, AlertTriangle, BadgeCheck, FileText, ExternalLink } from 'lucide-react'
import RatingDisplay from './RatingDisplay'
import AdminStatusBadge from './AdminStatusBadge'

export default function ReviewModerationModal({
  isOpen,
  review,
  onClose,
  onApprove,
  onReject,
}) {
  const [rejectMode, setRejectMode] = useState(false)
  const [moderationNote, setModerationNote] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen) {
      setRejectMode(false)
      setModerationNote(review?.moderationNote || '')
      setError('')
    }
  }, [isOpen, review])

  if (!isOpen || !review) return null

  const handleApprove = () => {
    onApprove?.(review.id, moderationNote.trim() || 'Approved by moderator.')
  }

  const handleReject = () => {
    if (!moderationNote.trim()) {
      setError('Please provide a specific rejection reason or moderation note.')
      return
    }
    onReject?.(review.id, moderationNote.trim())
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-gray-100 flex items-center justify-between bg-[#103321]/5 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#103321] text-[#95C623] flex items-center justify-center shrink-0">
              <Star className="w-5 h-5 fill-[#95C623]" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-[#103321]">
                Product Review Moderation
              </h3>
              <p className="text-xs text-gray-500 font-mono">
                {review.id} • {review.productName}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Product & Reviewer Header Card */}
          <div className="flex items-center gap-3.5 bg-gray-50 p-4 rounded-2xl border border-gray-100">
            <img
              src={review.productImage}
              alt={review.productName}
              className="w-14 h-14 rounded-xl object-cover border border-gray-200 bg-white shrink-0"
            />
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-xs text-gray-900 truncate">
                {review.productName}
              </h4>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs font-semibold text-gray-700">
                  {review.author}
                </span>
                {review.verified && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                    <BadgeCheck className="w-3 h-3 text-emerald-600" />
                    <span>Verified Buyer</span>
                  </span>
                )}
              </div>
              <span className="text-[10px] text-gray-400 block mt-0.5">
                Submitted on {formatDate(review.date)}
              </span>
            </div>

            <div className="text-right shrink-0">
              <AdminStatusBadge status={review.status} type="review" />
            </div>
          </div>

          {/* Rating & Review Content */}
          <div className="space-y-2 p-4 bg-white rounded-2xl border border-gray-100 shadow-xs">
            <div className="flex items-center justify-between">
              <RatingDisplay rating={review.rating} size="sm" showNumber={true} />
            </div>
            <h5 className="font-bold text-sm text-gray-900">
              "{review.title}"
            </h5>
            <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-line">
              {review.body}
            </p>
          </div>

          {/* Prior Moderation Note if present */}
          {review.moderationNote && (
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs text-gray-700">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-0.5">
                Current Moderation Note
              </span>
              <p className="italic text-gray-800">"{review.moderationNote}"</p>
              {review.moderatedBy && (
                <span className="text-[10px] text-gray-500 block mt-1">
                  Recorded by {review.moderatedBy}
                </span>
              )}
            </div>
          )}

          {/* Rejection / Moderation Note Form */}
          {rejectMode ? (
            <div className="p-4 bg-rose-50/70 rounded-2xl border border-rose-200 space-y-2 animate-fadeIn">
              <label className="block text-xs font-bold text-rose-900">
                Reason for Rejection / Moderation Note <span className="text-rose-600">*</span>
              </label>
              <textarea
                rows={2}
                value={moderationNote}
                onChange={(e) => {
                  setModerationNote(e.target.value)
                  if (error) setError('')
                }}
                placeholder="e.g. Inappropriate language, promotional spam, irrelevant content..."
                className="w-full px-3 py-2 rounded-xl border border-rose-300 bg-white text-xs outline-none focus:ring-2 focus:ring-rose-400/20 resize-none"
              />
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setRejectMode(false)}
                  className="px-3 py-1.5 text-xs text-gray-600 font-bold hover:bg-white rounded-lg"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleReject}
                  className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg cursor-pointer"
                >
                  Confirm Rejection
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-700">
                Internal Moderator Note (Optional)
              </label>
              <input
                type="text"
                value={moderationNote}
                onChange={(e) => setModerationNote(e.target.value)}
                placeholder="Add internal verification note..."
                className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs outline-none focus:border-[#95C623]"
              />
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-gray-100 flex items-center justify-between bg-gray-50/50 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-xs font-bold hover:bg-white transition-colors"
          >
            Close
          </button>

          {!rejectMode && (
            <div className="flex items-center gap-2.5">
              {review.status !== 'Rejected' && (
                <button
                  type="button"
                  onClick={() => setRejectMode(true)}
                  className="px-4 py-2.5 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Reject</span>
                </button>
              )}

              {review.status !== 'Approved' && (
                <button
                  type="button"
                  onClick={handleApprove}
                  className="px-5 py-2.5 rounded-xl bg-[#103321] hover:bg-[#103321]/90 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle className="w-3.5 h-3.5 text-[#95C623]" />
                  <span>Approve & Publish</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
