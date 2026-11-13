import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null

  const getPageNumbers = () => {
    const pages = []
    const delta = 1

    for (let i = Math.max(1, currentPage - delta); i <= Math.min(totalPages, currentPage + delta); i++) {
      pages.push(i)
    }

    if (pages[0] > 1) {
      if (pages[0] > 2) pages.unshift('...')
      pages.unshift(1)
    }

    if (pages[pages.length - 1] < totalPages) {
      if (pages[pages.length - 1] < totalPages - 1) pages.push('...')
      pages.push(totalPages)
    }

    return pages
  }

  const pages = getPageNumbers()

  return (
    <div className="flex items-center justify-center gap-1.5 py-4">
      {/* Previous */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
          currentPage === 1
            ? 'text-gray-300 cursor-not-allowed'
            : 'text-gray-600 hover:bg-gray-100 hover:text-[#103321] cursor-pointer'
        }`}
      >
        <ChevronLeft className="w-4 h-4" />
        <span className="hidden sm:block">Prev</span>
      </button>

      {/* Page numbers */}
      {pages.map((page, index) => (
        <button
          key={index}
          onClick={() => typeof page === 'number' && onPageChange(page)}
          disabled={page === '...'}
          className={`w-9 h-9 rounded-xl text-xs font-bold transition-all duration-200 ${
            page === currentPage
              ? 'bg-[#103321] text-white shadow-sm cursor-default'
              : page === '...'
              ? 'text-gray-300 cursor-default'
              : 'text-gray-600 hover:bg-gray-100 hover:text-[#103321] cursor-pointer'
          }`}
        >
          {page}
        </button>
      ))}

      {/* Next */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
          currentPage === totalPages
            ? 'text-gray-300 cursor-not-allowed'
            : 'text-gray-600 hover:bg-gray-100 hover:text-[#103321] cursor-pointer'
        }`}
      >
        <span className="hidden sm:block">Next</span>
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  )
}

