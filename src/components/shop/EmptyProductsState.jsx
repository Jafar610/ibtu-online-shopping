import { SearchX } from 'lucide-react'

export default function EmptyProductsState({ onClearAll }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center mb-5 shadow-inner">
        <SearchX className="w-9 h-9 text-gray-300" />
      </div>
      <h3 className="font-serif text-xl font-bold text-[#103321] mb-2">
        No Products Found
      </h3>
      <p className="text-sm text-gray-500 max-w-xs leading-relaxed mb-6">
        We couldn't find any products matching your current filters. Try adjusting or clearing your
        filters to discover more items.
      </p>
      <button
        onClick={onClearAll}
        className="px-6 py-2.5 rounded-xl bg-[#95C623] text-[#103321] text-sm font-bold hover:bg-[#82ad1e] transition-all duration-200 cursor-pointer shadow-sm active:scale-[0.98]"
      >
        Clear All Filters
      </button>
    </div>
  )
}

