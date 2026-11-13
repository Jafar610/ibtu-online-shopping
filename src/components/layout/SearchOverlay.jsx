import { useState, useEffect, useRef } from 'react'
import { Search, X, ArrowRight, Tag } from 'lucide-react'
import { products } from '../../data/products'

export default function SearchOverlay({ isOpen, onClose, onSelectProduct }) {
  const [query, setQuery] = useState('')
  const inputRef = useRef(null)

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleClose = () => {
    setQuery('')
    onClose()
  }

  const filteredProducts = query.trim()
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.amharicName?.toLowerCase().includes(query.toLowerCase()) ||
          p.category.toLowerCase().includes(query.toLowerCase()) ||
          p.description.toLowerCase().includes(query.toLowerCase())
      )
    : []

  const popularTags = ['Habesha Kemis', 'Tibeb Shirt', 'Gabi', 'Netela', 'Lalibela Cross', 'Emerald Gown']

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#103321]/95 backdrop-blur-md text-white animate-fadeIn">
      {/* Search Header */}
      <div className="max-w-4xl w-full mx-auto px-4 pt-8 pb-4">
        <div className="flex items-center justify-between pb-6 border-b border-white/15">
          <div className="flex items-center gap-2">
            <span className="text-[#95C623] font-bold text-lg font-serif">ibtu</span>
            <span className="text-white/40">/</span>
            <span className="text-xs text-white/70 uppercase tracking-widest">Search Collection</span>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-colors cursor-pointer"
            aria-label="Close search"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Input Bar */}
        <div className="relative mt-8">
          <Search className="w-6 h-6 text-[#95C623] absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search Ethiopian dresses, shirts, jewelry, or fabrics..."
            className="w-full bg-white/10 text-white placeholder-white/50 text-lg sm:text-xl pl-14 pr-12 py-4 rounded-2xl border border-white/20 focus:outline-none focus:border-[#95C623] focus:bg-white/15 transition-all shadow-inner"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Popular Tags */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-xs text-white/60 flex items-center gap-1 mr-1">
            <Tag className="w-3.5 h-3.5 text-[#95C623]" /> Popular:
          </span>
          {popularTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setQuery(tag)}
              className="text-xs bg-white/10 hover:bg-[#95C623] hover:text-[#103321] text-white/90 px-3 py-1 rounded-full transition-colors cursor-pointer"
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Results View */}
      <div className="flex-1 overflow-y-auto max-w-4xl w-full mx-auto px-4 py-6">
        {query.trim() === '' ? (
          <div className="text-center py-16 text-white/50">
            <p className="text-sm">Type keywords like "kemis", "shirt", or "cotton" to discover authentic fashion.</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-lg font-medium text-white">No products found for "{query}"</p>
            <p className="text-sm text-white/60 mt-1">Try another search term or browse our main collections.</p>
          </div>
        ) : (
          <div>
            <p className="text-xs uppercase tracking-widest text-[#95C623] font-semibold mb-4">
              Found {filteredProducts.length} {filteredProducts.length === 1 ? 'Product' : 'Products'}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  onClick={() => {
                    if (onSelectProduct) onSelectProduct(product)
                    handleClose()
                  }}
                  className="flex items-center gap-4 p-3 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 transition-all cursor-pointer group"
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-16 h-16 object-cover rounded-lg shrink-0 group-hover:scale-105 transition-transform"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-white group-hover:text-[#95C623] transition-colors truncate">
                      {product.name}
                    </h4>
                    <p className="text-xs text-white/60 font-medium">{product.amharicName}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm font-bold text-[#95C623]">
                        {product.price.toLocaleString()} ETB
                      </span>
                      {product.originalPrice && (
                        <span className="text-xs line-through text-white/40">
                          {product.originalPrice.toLocaleString()} ETB
                        </span>
                      )}
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-white/40 group-hover:text-[#95C623] group-hover:translate-x-1 transition-all" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
