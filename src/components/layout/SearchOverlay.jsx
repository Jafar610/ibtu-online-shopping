import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, X, ArrowRight, Tag, Loader2 } from 'lucide-react'
import { productApi } from '../../services/api/productApi'
import { products as defaultProducts } from '../../data/products'

export default function SearchOverlay({ isOpen, onClose, onSelectProduct }) {
  const [query, setQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const inputRef = useRef(null)
  const navigate = useNavigate()

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

  // Live search debounced
  useEffect(() => {
    if (!query.trim()) {
      setSearchResults([])
      setIsSearching(false)
      return
    }

    setIsSearching(true)
    const timer = setTimeout(() => {
      productApi
        .getCatalogProducts({ search: query.trim(), limit: 6 })
        .then((res) => {
          setSearchResults(res.products || [])
        })
        .catch(() => {
          // fallback to local filter
          const q = query.toLowerCase()
          const localMatches = defaultProducts.filter(
            (p) =>
              p.name.toLowerCase().includes(q) ||
              p.amharicName?.toLowerCase().includes(q) ||
              p.category.toLowerCase().includes(q) ||
              p.description.toLowerCase().includes(q)
          )
          setSearchResults(localMatches.slice(0, 6))
        })
        .finally(() => {
          setIsSearching(false)
        })
    }, 250)

    return () => clearTimeout(timer)
  }, [query])

  if (!isOpen) return null

  const handleClose = () => {
    setQuery('')
    setSearchResults([])
    onClose()
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && query.trim()) {
      handleClose()
      navigate(`/shop?search=${encodeURIComponent(query.trim())}`)
    }
  }

  const popularTags = [
    'Habesha Kemis',
    'Tibeb Shirt',
    'Gabi',
    'Netela',
    'Lalibela Cross',
    'Emerald Gown',
  ]

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#103321]/95 backdrop-blur-md text-white animate-fadeIn">
      {/* Search Header */}
      <div className="max-w-4xl w-full mx-auto px-4 pt-8 pb-4">
        <div className="flex items-center justify-between pb-6 border-b border-white/15">
          <div className="flex items-center gap-2">
            <span className="text-[#95C623] font-bold text-lg font-serif">ibtu</span>
            <span className="text-white/40">/</span>
            <span className="text-xs text-white/70 uppercase tracking-widest">
              Search Collection
            </span>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-full hover:bg-white/10 transition-colors cursor-pointer text-white/70 hover:text-white"
            aria-label="Close search overlay"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Search Input Bar */}
        <div className="relative mt-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-[#95C623]" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search Habesha Kemis, silk scarves, shirts, or accessories..."
            className="w-full bg-white/10 border-2 border-white/20 focus:border-[#95C623] rounded-2xl pl-14 pr-12 py-4 text-base sm:text-lg text-white placeholder-white/40 outline-hidden transition-all duration-300"
          />
          {isSearching ? (
            <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#95C623] animate-spin" />
          ) : query ? (
            <button
              onClick={() => setQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full text-white/50 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          ) : null}
        </div>

        {/* Popular Tags */}
        {!query && (
          <div className="mt-6">
            <p className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-3">
              Popular Searches
            </p>
            <div className="flex flex-wrap gap-2">
              {popularTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setQuery(tag)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-[#95C623] hover:text-[#103321] transition-all text-xs font-medium cursor-pointer"
                >
                  <Tag className="w-3 h-3 opacity-60" />
                  <span>{tag}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Results Area */}
      <div className="flex-1 overflow-y-auto max-w-4xl w-full mx-auto px-4 pb-12">
        {query.trim() && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/10">
              <span className="text-xs uppercase tracking-wider text-white/60">
                {isSearching ? 'Searching...' : `Found ${searchResults.length} Products`}
              </span>
              <button
                onClick={() => {
                  handleClose()
                  navigate(`/shop?search=${encodeURIComponent(query.trim())}`)
                }}
                className="text-xs text-[#95C623] hover:underline flex items-center gap-1"
              >
                <span>View all in Shop</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {searchResults.length === 0 && !isSearching ? (
              <div className="text-center py-12">
                <p className="text-base text-white/70">No garments matched &ldquo;{query}&rdquo;</p>
                <p className="text-xs text-white/40 mt-1">
                  Try searching for Habesha Kemis, silk scarves, jackets, or traditional wear.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {searchResults.map((product) => (
                  <div
                    key={product.id}
                    onClick={() => {
                      handleClose()
                      navigate(`/product/${product.slug || product.id}`)
                    }}
                    className="flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition-all cursor-pointer group"
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-14 h-16 rounded-xl object-cover shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-white group-hover:text-[#95C623] truncate transition-colors">
                        {product.name}
                      </p>
                      <p className="text-[10px] text-white/50 capitalize truncate">
                        {product.categoryName || product.category}
                      </p>
                      <p className="text-xs font-extrabold text-[#95C623] mt-1">
                        {product.price?.toLocaleString()} ETB
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
