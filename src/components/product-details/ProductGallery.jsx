import { useState, useEffect, useCallback } from 'react'
import { X, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react'
import WishlistButton from '../wishlist/WishlistButton'

export default function ProductGallery({ product }) {
  const images = product.images && product.images.length > 0 ? product.images : [product.image]
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)

  const handleKeyDown = useCallback(
    (e) => {
      if (!isLightboxOpen) return
      if (e.key === 'Escape') setIsLightboxOpen(false)
      if (e.key === 'ArrowLeft') setSelectedIndex((i) => (i > 0 ? i - 1 : images.length - 1))
      if (e.key === 'ArrowRight') setSelectedIndex((i) => (i < images.length - 1 ? i + 1 : 0))
    },
    [isLightboxOpen, images.length]
  )

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  useEffect(() => {
    if (isLightboxOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isLightboxOpen])

  const prevImage = () => setSelectedIndex((i) => (i > 0 ? i - 1 : images.length - 1))
  const nextImage = () => setSelectedIndex((i) => (i < images.length - 1 ? i + 1 : 0))

  return (
    <div className="flex flex-col-reverse sm:flex-row gap-3">
      {/* Thumbnails */}
      <div className="flex sm:flex-col gap-2 overflow-x-auto sm:overflow-y-auto sm:overflow-x-hidden no-scrollbar sm:max-h-[520px] pb-1 sm:pb-0">
        {images.map((img, idx) => (
          <button
            key={idx}
            onClick={() => setSelectedIndex(idx)}
            className={`shrink-0 w-16 h-16 sm:w-18 sm:h-18 rounded-xl overflow-hidden border-2 transition-all duration-200 cursor-pointer ${
              selectedIndex === idx
                ? 'border-[#95C623] shadow-sm scale-105'
                : 'border-transparent hover:border-gray-200 opacity-70 hover:opacity-100'
            }`}
          >
            <img
              src={img}
              alt={`${product.name} view ${idx + 1}`}
              loading={idx === 0 ? 'eager' : 'lazy'}
              className="w-full h-full object-cover object-center"
            />
          </button>
        ))}
      </div>

      {/* Main Image */}
      <div className="flex-1 relative">
        <div
          className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-[#F4F5F6] cursor-zoom-in group"
          onClick={() => setIsLightboxOpen(true)}
        >
          <img
            src={images[selectedIndex]}
            alt={product.name}
            loading="eager"
            className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
          />

          {/* Overlay icons */}
          <div className="absolute inset-0 flex items-center justify-between px-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            {images.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); prevImage() }}
                  className="p-2 rounded-full bg-white/90 shadow-md text-[#103321] hover:bg-white transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); nextImage() }}
                  className="p-2 rounded-full bg-white/90 shadow-md text-[#103321] hover:bg-white transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}
          </div>

          {/* Zoom hint */}
          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="p-1.5 rounded-lg bg-white/90 shadow-sm">
              <ZoomIn className="w-4 h-4 text-[#103321]" />
            </div>
          </div>

          {/* Badge */}
          {product.badge && (
            <div className="absolute top-3 left-3">
              <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg shadow-sm ${
                product.badge.toLowerCase().includes('off') || product.badge.toLowerCase().includes('sale')
                  ? 'bg-[#95C623] text-[#103321]'
                  : 'bg-[#103321] text-[#95C623]'
              }`}>
                {product.badge}
              </span>
            </div>
          )}

          {/* Wishlist */}
          <div className="absolute bottom-3 right-3" onClick={(e) => e.stopPropagation()}>
            <WishlistButton product={product} size="md" />
          </div>

          {/* Image counter */}
          {images.length > 1 && (
            <div className="absolute bottom-3 left-3 bg-black/50 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
              {selectedIndex + 1} / {images.length}
            </div>
          )}
        </div>

        {/* Dot navigation */}
        {images.length > 1 && (
          <div className="flex justify-center gap-1.5 mt-3">
            {images.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedIndex(idx)}
                className={`rounded-full transition-all duration-200 cursor-pointer ${
                  idx === selectedIndex ? 'w-5 h-2 bg-[#95C623]' : 'w-2 h-2 bg-gray-200 hover:bg-gray-300'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center">
          {/* Close */}
          <button
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-4 right-4 p-2.5 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors cursor-pointer z-10"
            aria-label="Close image viewer"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Image */}
          <div className="relative max-w-4xl max-h-[90vh] w-full mx-4">
            <img
              src={images[selectedIndex]}
              alt={product.name}
              className="w-full h-full object-contain rounded-xl"
              style={{ maxHeight: '85vh' }}
            />
          </div>

          {/* Nav arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-4 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors cursor-pointer"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          {/* Thumbnails strip */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedIndex(idx)}
                className={`w-12 h-12 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                  idx === selectedIndex ? 'border-[#95C623] opacity-100' : 'border-transparent opacity-50 hover:opacity-80'
                }`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

