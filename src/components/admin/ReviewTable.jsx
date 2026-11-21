import { Link } from 'react-router-dom'
import { Eye, CheckCircle2, XCircle, Star, BadgeCheck, ChevronLeft, ChevronRight } from 'lucide-react'
import AdminStatusBadge from './AdminStatusBadge'
import RatingDisplay from './RatingDisplay'

export default function ReviewTable({
  reviews = [],
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  onModerateReview,
}) {
  if (reviews.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center space-y-3">
        <div className="w-14 h-14 rounded-2xl bg-gray-50 text-gray-400 flex items-center justify-center mx-auto">
          <Star className="w-7 h-7" />
        </div>
        <h3 className="font-serif font-bold text-base text-[#103321]">
          No product reviews found
        </h3>
        <p className="text-xs text-gray-500 max-w-sm mx-auto">
          No customer reviews match your selected filter criteria. Try adjusting filters or resetting.
        </p>
      </div>
    )
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
    <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#103321]/5 border-b border-gray-100 text-gray-600 font-extrabold uppercase tracking-wider text-[11px]">
            <tr>
              <th className="py-3.5 px-4">Product</th>
              <th className="py-3.5 px-4">Reviewer</th>
              <th className="py-3.5 px-4">Rating</th>
              <th className="py-3.5 px-4">Review Content</th>
              <th className="py-3.5 px-4">Date</th>
              <th className="py-3.5 px-4 text-center">Moderation</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {reviews.map((rev) => {
              const isPending = rev.status === 'Pending'

              return (
                <tr
                  key={rev.id}
                  className="hover:bg-gray-50/80 transition-colors group"
                >
                  {/* Product */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={rev.productImage}
                        alt={rev.productName}
                        className="w-10 h-10 rounded-xl object-cover bg-gray-50 border border-gray-100 shrink-0"
                      />
                      <div className="min-w-0">
                        <span className="font-bold text-gray-900 block truncate max-w-[150px]">
                          {rev.productName}
                        </span>
                        <span className="text-[10px] text-gray-400 block truncate uppercase tracking-wider">
                          {rev.productCategory}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Reviewer */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-gray-800">
                        {rev.author}
                      </span>
                      {rev.verified && (
                        <span title="Verified Buyer">
                          <BadgeCheck className="w-3.5 h-3.5 text-emerald-600" />
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-gray-400 block font-mono">
                      {rev.id}
                    </span>
                  </td>

                  {/* Rating */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <RatingDisplay rating={rev.rating} size="xs" showNumber={true} />
                  </td>

                  {/* Review Content */}
                  <td className="py-3.5 px-4 max-w-xs">
                    <span className="font-bold text-gray-900 block truncate">
                      "{rev.title}"
                    </span>
                    <p className="text-[11px] text-gray-500 line-clamp-2 leading-relaxed">
                      {rev.body}
                    </p>
                  </td>

                  {/* Date */}
                  <td className="py-3.5 px-4 text-gray-600 whitespace-nowrap">
                    {formatDate(rev.date)}
                  </td>

                  {/* Moderation Status */}
                  <td className="py-3.5 px-4 text-center whitespace-nowrap">
                    <AdminStatusBadge status={rev.status} type="review" />
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      <Link
                        to={`/admin/reviews/${rev.id}`}
                        title="View Full Review"
                        className="p-1.5 rounded-lg text-gray-500 hover:text-[#103321] hover:bg-gray-100 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>

                      <button
                        type="button"
                        onClick={() => onModerateReview(rev)}
                        title="Moderate Review"
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                          isPending
                            ? 'text-amber-600 hover:bg-amber-50 animate-pulse'
                            : 'text-gray-400 hover:text-[#103321] hover:bg-gray-100'
                        }`}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="p-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
          <div>
            Page <span className="font-bold text-[#103321]">{currentPage}</span> of{' '}
            <span className="font-bold text-[#103321]">{totalPages}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => onPageChange(currentPage - 1)}
              className="p-1.5 rounded-lg border border-gray-200 enabled:hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => onPageChange(currentPage + 1)}
              className="p-1.5 rounded-lg border border-gray-200 enabled:hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
