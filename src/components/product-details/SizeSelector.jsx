import { useState } from 'react'
import { Ruler } from 'lucide-react'
import SizeGuideModal from './SizeGuideModal'

export default function SizeSelector({ sizes, selected, onChange }) {
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false)

  if (!sizes || sizes.length === 0) return null

  return (
    <div>
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-700">Size</span>
          {selected && (
            <span className="text-xs font-semibold text-[#103321] bg-[#95C623]/15 px-2 py-0.5 rounded-full">
              {selected}
            </span>
          )}
        </div>
        <button
          onClick={() => setIsSizeGuideOpen(true)}
          className="flex items-center gap-1 text-[11px] font-semibold text-[#103321] hover:text-[#95C623] transition-colors cursor-pointer underline underline-offset-2"
        >
          <Ruler className="w-3 h-3" />
          Size Guide
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {sizes.map((size) => {
          const isSelected = selected === size
          const isSpecial = size.includes('Custom') || size.includes('One Size') || size.includes('"')
          return (
            <button
              key={size}
              onClick={() => onChange(size)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold border-2 transition-all duration-200 cursor-pointer ${
                isSelected
                  ? 'bg-[#103321] border-[#103321] text-white shadow-sm scale-105'
                  : 'bg-white border-gray-200 text-gray-600 hover:border-[#103321] hover:text-[#103321]'
              } ${isSpecial ? 'px-4' : ''}`}
            >
              {size}
            </button>
          )
        })}
      </div>

      {!selected && (
        <p className="text-[11px] text-orange-500 font-semibold mt-2 flex items-center gap-1">
          <span>⚠</span> Please select a size to continue
        </p>
      )}

      <SizeGuideModal
        isOpen={isSizeGuideOpen}
        onClose={() => setIsSizeGuideOpen(false)}
      />
    </div>
  )
}

