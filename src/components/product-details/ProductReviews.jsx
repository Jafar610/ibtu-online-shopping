import { useState } from 'react'
import { Star, PenLine, ChevronDown, X } from 'lucide-react'
import ReviewCard from './ReviewCard'
import { getReviewsForProduct } from '../../data/reviews'

function RatingBar({ stars, count, total }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0
  return (
    <div className="flex items-center gap-2">
      <span className="text-[11px] font-semibold text-gray-500 w-4 text-right shrink-0">{stars}</span>
      <Star className="w-3 h-3 fill-amber-400 stroke-amber-400 shrink-0" />
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-amber-400 rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-[11px] text-gray-400 w-6 shrink-0">{count}</span>
    </div>
  )
}

function WriteReviewModal({ onClose }) {
  const [rating, setRating] = useState(0)
  const [hovered, setHovered] = useState(0)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (rating === 0 || !body.trim()) return
    setSubmitted(true)
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-scaleIn">
        <div className="flex items-center justify-between px-5 py-4 bg-[#103321]">
          <div className="flex items-center gap-2">
            <PenLine className="w-4 h-4 text-[#95C623]" />
            <span className="font-bold text-white">Write a Review</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="p-8 text-center">
            <div className="w-14 h-14 rounded-full bg-[#95C623]/20 flex items-center justify-center mx-auto mb-4">
              <Star className="w-7 h-7 fill-[#95C623] stroke-[#95C623]" />
            </div>
            <h3 className="font-bold text-[#103321] text-base mb-2">Thank you for your review!</h3>
            <p className="text-sm text-gray-500 mb-5">Your review has been submitted and is pending approval.</p>
            <button onClick={onClose} className="px-6 py-2.5 bg-[#95C623] text-[#103321] text-sm font-bold rounded-xl cursor-pointer hover:bg-[#82ad1e] transition-colors">
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            <div>
              <p className="text-xs font-bold text-gray-700 mb-2">Your Rating *</p>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onMouseEnter={() => setHovered(s)}
                    onMouseLeave={() => setHovered(0)}
                    onClick={() => setRating(s)}
                    className="cursor-pointer"
                  >
                    <Star
                      className={`w-7 h-7 transition-all ${
                        s <= (hovered || rating)
                          ? 'fill-amber-400 stroke-amber-400 scale-110'
                          : 'fill-gray-100 stroke-gray-300'
                      }`}
                    />
                  </button>
                ))}
                {rating > 0 && (
                  <span className="ml-2 text-xs font-semibold text-gray-600">
                    {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating]}
                  </span>
                )}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1.5">Review Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Summarize your experience"
                className="w-full px-3.5 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#95C623] transition-colors"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1.5">Your Review *</label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={4}
                placeholder="Share your experience with this product..."
                className="w-full px-3.5 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#95C623] transition-colors resize-none"
              />
            </div>

            <p className="text-[10px] text-gray-400">
              * Sign-in required to submit a review. Your review will be verified before publishing.
            </p>

            <button
              type="submit"
              disabled={rating === 0 || !body.trim()}
              className="w-full py-3 rounded-xl bg-[#95C623] text-[#103321] font-bold text-sm hover:bg-[#82ad1e] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Submit Review
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

const SORT_OPTIONS = [
  { value: 'recent', label: 'Most Recent' },
  { value: 'helpful', label: 'Most Helpful' },
  { value: 'highest', label: 'Highest Rated' },
  { value: 'lowest', label: 'Lowest Rated' },
]

export default function ProductReviews({ product }) {
  const [sortBy, setSortBy] = useState('recent')
  const [isWriteOpen, setIsWriteOpen] = useState(false)
  const [showAll, setShowAll] = useState(false)

  const allReviews = getReviewsForProduct(product.id)

  const sorted = [...allReviews].sort((a, b) => {
    if (sortBy === 'helpful') return b.helpful - a.helpful
    if (sortBy === 'highest') return b.rating - a.rating
    if (sortBy === 'lowest') return a.rating - b.rating
    return new Date(b.date) - new Date(a.date)
  })

  const displayed = showAll ? sorted : sorted.slice(0, 3)

  // Rating distribution
  const dist = [5, 4, 3, 2, 1].map((star) => ({
    stars: star,
    count: allReviews.filter((r) => r.rating === star).length,
  }))

  const avgRating =
    allReviews.length > 0
      ? (allReviews.reduce((s, r) => s + r.rating, 0) / allReviews.length).toFixed(1)
      : product.rating

  return (
    <section>
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-serif text-xl font-bold text-[#103321]">
          Customer Reviews
        </h2>
        <button
          onClick={() => setIsWriteOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#103321] text-white text-xs font-bold hover:bg-[#1a4d35] transition-colors cursor-pointer"
        >
          <PenLine className="w-3.5 h-3.5" />
          Write a Review
        </button>
      </div>

      {/* Rating summary */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm mb-5">
        <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
          {/* Average */}
          <div className="text-center shrink-0">
            <span className="font-serif text-5xl font-bold text-[#103321] block">{avgRating}</span>
            <div className="flex items-center justify-center gap-0.5 my-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`w-4 h-4 ${
                    s <= Math.round(Number(avgRating))
                      ? 'fill-amber-400 stroke-amber-400'
                      : 'fill-gray-100 stroke-gray-200'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-gray-400">{allReviews.length} reviews</span>
          </div>

          {/* Distribution bars */}
          <div className="flex-1 w-full space-y-1.5">
            {dist.map(({ stars, count }) => (
              <RatingBar key={stars} stars={stars} count={count} total={allReviews.length} />
            ))}
          </div>
        </div>
      </div>

      {/* Sort control */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-semibold text-gray-700">
          {allReviews.length} review{allReviews.length !== 1 ? 's' : ''}
        </span>
        <div className="relative">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="appearance-none pl-3 pr-7 py-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-200 rounded-xl cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#95C623]/30"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Review cards */}
      <div className="space-y-3">
        {displayed.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>

      {allReviews.length > 3 && !showAll && (
        <button
          onClick={() => setShowAll(true)}
          className="mt-4 w-full py-2.5 rounded-xl border-2 border-gray-200 text-xs font-bold text-gray-500 hover:border-[#103321] hover:text-[#103321] transition-all cursor-pointer"
        >
          Show all {allReviews.length} reviews
        </button>
      )}

      {isWriteOpen && (
        <WriteReviewModal onClose={() => setIsWriteOpen(false)} />
      )}
    </section>
  )
}

