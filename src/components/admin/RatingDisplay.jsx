import { Star } from 'lucide-react'

export default function RatingDisplay({ rating = 5, size = 'sm', showNumber = true }) {
  const stars = [1, 2, 3, 4, 5]

  const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  }

  const iconClass = sizeClasses[size] || sizeClasses.sm

  return (
    <div className="inline-flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        {stars.map((star) => {
          const isFilled = star <= Math.round(rating)
          return (
            <Star
              key={star}
              className={`${iconClass} ${
                isFilled
                  ? 'fill-amber-400 text-amber-400'
                  : 'fill-gray-200 text-gray-200'
              }`}
            />
          )
        })}
      </div>
      {showNumber && (
        <span className="text-xs font-bold text-gray-700">
          {Number(rating).toFixed(1)}
        </span>
      )}
    </div>
  )
}
