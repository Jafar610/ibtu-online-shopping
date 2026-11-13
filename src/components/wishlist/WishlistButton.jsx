import { Heart } from 'lucide-react'
import { useWishlist } from '../../context/WishlistContext'

export default function WishlistButton({ product, className = '', size = 'md' }) {
  const { isInWishlist, toggleWishlist } = useWishlist()
  const active = isInWishlist(product.id)

  const sizeStyles = {
    sm: 'w-7 h-7 p-1.5',
    md: 'w-9 h-9 p-2',
    lg: 'w-11 h-11 p-2.5',
  }

  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  }

  return (
    <button
      onClick={(e) => {
        e.stopPropagation()
        toggleWishlist(product)
      }}
      className={`rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer shadow-sm ${
        active
          ? 'bg-red-50 text-red-500 hover:bg-red-100 scale-105'
          : 'bg-white/90 backdrop-blur-xs text-gray-700 hover:text-red-500 hover:bg-white hover:scale-110'
      } ${sizeStyles[size] || sizeStyles.md} ${className}`}
      aria-label={active ? 'Remove from wishlist' : 'Add to wishlist'}
      title={active ? 'Remove from wishlist' : 'Save to wishlist'}
    >
      <Heart
        className={`${iconSizes[size] || iconSizes.md} transition-colors ${
          active ? 'fill-red-500 stroke-red-500' : 'stroke-current'
        }`}
      />
    </button>
  )
}

