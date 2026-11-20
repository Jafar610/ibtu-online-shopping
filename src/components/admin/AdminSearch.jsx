import { useState } from 'react'
import { Search, X } from 'lucide-react'

export default function AdminSearch() {
  const [query, setQuery] = useState('')

  return (
    <div className="relative w-full max-w-xs sm:max-w-md">
      <div className="relative flex items-center">
        <Search className="w-4 h-4 text-gray-400 absolute left-3.5 pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search products, orders, customers..."
          className="w-full pl-9 pr-14 py-2 rounded-xl border border-gray-200 bg-gray-50/70 text-xs focus:outline-hidden focus:border-[#103321] focus:ring-1 focus:ring-[#103321] focus:bg-white transition-all text-gray-800 placeholder-gray-400"
        />

        {query ? (
          <button
            type="button"
            onClick={() => setQuery('')}
            className="absolute right-3 p-1 text-gray-400 hover:text-gray-600 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        ) : (
          <kbd className="hidden sm:inline-flex items-center absolute right-3 px-1.5 py-0.5 text-[10px] font-mono text-gray-400 bg-gray-200/60 rounded border border-gray-300 pointer-events-none">
            /
          </kbd>
        )}
      </div>
    </div>
  )
}
