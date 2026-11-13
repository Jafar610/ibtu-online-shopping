import { useState } from 'react'
import { X, Star, ShoppingBag, ShieldCheck, RefreshCw, Sparkles, Check } from 'lucide-react'
import { useCart } from '../../context/CartContext'
import WishlistButton from '../wishlist/WishlistButton'
import Button from '../common/Button'

export default function QuickViewModal({ product, onClose }) {
  const { addToCart } = useCart()
  const [selectedSize, setSelectedSize] = useState(
    product?.sizes ? product.sizes[0] : 'Standard'
  )
  const [selectedColor, setSelectedColor] = useState(
    product?.colors ? product.colors[0] : 'Default'
  )
  const [quantity, setQuantity] = useState(1)
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [addedAnimation, setAddedAnimation] = useState(false)

  if (!product) return null

  const images = product.images && product.images.length > 0 ? product.images : [product.image]

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedSize, selectedColor)
    setAddedAnimation(true)
    setTimeout(() => {
      setAddedAnimation(false)
      onClose()
    }, 600)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-3xl w-full overflow-hidden z-10 my-8 animate-scaleIn">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/80 backdrop-blur-md text-gray-700 hover:text-black hover:bg-white shadow-md transition-all cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Left: Image Gallery */}
          <div className="bg-[#F8F9FA] p-6 flex flex-col justify-between">
            <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden shadow-inner bg-gray-100">
              <img
                src={images[activeImageIndex] || product.image}
                alt={product.name}
                className="w-full h-full object-cover object-center transition-all duration-300"
              />
              {product.badge && (
                <span className="absolute top-3 left-3 bg-[#95C623] text-[#103321] text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                  {product.badge}
                </span>
              )}
            </div>

            {images.length > 1 && (
              <div className="flex gap-2 mt-4 overflow-x-auto pb-1">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-14 h-14 rounded-lg overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                      activeImageIndex === idx ? 'border-[#103321] shadow-xs' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="thumbnail" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Product Details & Purchase Form */}
          <div className="p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs uppercase tracking-widest text-[#95C623] font-bold">
                  {product.category?.replace('-', ' ')}
                </span>
                <WishlistButton product={product} size="sm" />
              </div>

              <h2 className="font-sans text-2xl font-bold text-[#103321] mt-1">
                {product.name}
              </h2>
              {product.amharicName && (
                <p className="text-sm font-medium text-[#103321]/60 mt-0.5">
                  {product.amharicName}
                </p>
              )}

              {/* Rating */}
              <div className="flex items-center gap-2 mt-2">
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(product.rating || 5)
                          ? 'fill-amber-400 stroke-amber-400'
                          : 'stroke-amber-400'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs font-semibold text-gray-700">
                  {product.rating || 4.9}
                </span>
                <span className="text-xs text-gray-400">
                  ({product.reviewsCount || 42} reviews)
                </span>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3 mt-4">
                <span className="text-2xl font-bold text-[#103321]">
                  {product.price.toLocaleString()} ETB
                </span>
                {product.originalPrice && (
                  <span className="text-sm text-gray-400 line-through">
                    {product.originalPrice.toLocaleString()} ETB
                  </span>
                )}
                {product.originalPrice && (
                  <span className="text-xs font-bold text-[#95C623] bg-[#95C623]/15 px-2 py-0.5 rounded-full">
                    Save {(product.originalPrice - product.price).toLocaleString()} ETB
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="text-xs sm:text-sm text-gray-600 mt-3 leading-relaxed">
                {product.description}
              </p>

              {/* Fabric Details */}
              {product.fabric && (
                <div className="mt-4 p-3 bg-gray-50 rounded-xl flex items-center gap-2 text-xs text-gray-700">
                  <Sparkles className="w-4 h-4 text-[#95C623] shrink-0" />
                  <span>
                    <strong className="text-[#103321]">Fabric:</strong> {product.fabric}
                  </span>
                </div>
              )}

              {/* Sizes */}
              {product.sizes && (
                <div className="mt-4">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                    Select Size
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`text-xs px-3 py-1.5 rounded-lg border font-semibold transition-all cursor-pointer ${
                          selectedSize === size
                            ? 'border-[#103321] bg-[#103321] text-white shadow-xs'
                            : 'border-gray-200 text-gray-700 hover:border-gray-400'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Colors */}
              {product.colors && (
                <div className="mt-3">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                    Select Color / Edition
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {product.colors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`text-xs px-2.5 py-1 rounded-md border font-medium transition-all cursor-pointer ${
                          selectedColor === color
                            ? 'border-[#95C623] bg-[#95C623]/20 text-[#103321] font-bold'
                            : 'border-gray-200 text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Quantity and Add To Cart */}
            <div className="pt-6 mt-6 border-t border-gray-100">
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-gray-200 rounded-full p-1 bg-gray-50">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-gray-600 hover:bg-white transition-colors cursor-pointer"
                  >
                    -
                  </button>
                  <span className="w-8 text-center text-xs font-bold text-gray-800">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-gray-600 hover:bg-white transition-colors cursor-pointer"
                  >
                    +
                  </button>
                </div>

                <Button
                  onClick={handleAddToCart}
                  variant="primary"
                  size="md"
                  className="flex-1 font-bold text-sm shadow-md"
                  icon={addedAnimation ? Check : ShoppingBag}
                >
                  {addedAnimation ? 'Added to Bag!' : 'Add to Bag'}
                </Button>
              </div>

              {/* Trust badges */}
              <div className="grid grid-cols-2 gap-2 mt-4 text-[11px] text-gray-500">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#95C623]" />
                  <span>100% Authentic Handloom</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <RefreshCw className="w-3.5 h-3.5 text-[#95C623]" />
                  <span>7-Day Easy Returns</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
