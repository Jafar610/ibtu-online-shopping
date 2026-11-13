import { Star, ThumbsUp } from 'lucide-react'

export default function ReviewCard({ review }) {
  const stars = Array.from({ length: 5 }, (_, i) => i + 1)

  const timeAgo = (dateStr) => {
    const date = new Date(dateStr)
    const now = new Date()
    const days = Math.floor((now - date) / (1000 * 60 * 60 * 24))
    if (days < 7) return `${days}d ago`
    if (days < 30) return `${Math.floor(days / 7)}w ago`
    if (days < 365) return `${Math.floor(days / 30)}mo ago`
    return `${Math.floor(days / 365)}y ago`
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 shadow-xs hover:shadow-sm transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="w-9 h-9 rounded-full bg-[#103321] flex items-center justify-center shrink-0">
            <span className="text-xs font-bold text-[#95C623]">{review.avatar}</span>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-bold text-gray-900">{review.author}</span>
              {review.verified && (
                <span className="text-[9px] font-bold text-[#103321] bg-[#95C623]/20 px-1.5 py-0.5 rounded-full">
                  ✓ Verified
                </span>
              )}
            </div>
            <span className="text-[11px] text-gray-400">{timeAgo(review.date)}</span>
          </div>
        </div>

        {/* Stars */}
        <div className="flex items-center gap-0.5 shrink-0">
          {stars.map((s) => (
            <Star
              key={s}
              className={`w-3.5 h-3.5 ${
                s <= review.rating
                  ? 'fill-amber-400 stroke-amber-400'
                  : 'fill-gray-100 stroke-gray-200'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Title */}
      {review.title && (
        <p className="text-sm font-bold text-gray-900 mb-1.5">{review.title}</p>
      )}

      {/* Body */}
      <p className="text-sm text-gray-600 leading-relaxed">{review.body}</p>

      {/* Footer */}
      {review.helpful > 0 && (
        <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-gray-50">
          <ThumbsUp className="w-3 h-3 text-gray-400" />
          <span className="text-[11px] text-gray-400">
            {review.helpful} people found this helpful
          </span>
        </div>
      )}
    </div>
  )
}

