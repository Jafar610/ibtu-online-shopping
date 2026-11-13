import { useState } from 'react'

const COLORS = [
  { id: 'black', label: 'Black', hex: '#1A1A1A' },
  { id: 'white', label: 'White', hex: '#F5F5F5', border: true },
  { id: 'green', label: 'Green', hex: '#103321' },
  { id: 'lime', label: 'Lime', hex: '#95C623' },
  { id: 'red', label: 'Red', hex: '#DC2626' },
  { id: 'blue', label: 'Blue', hex: '#1D4ED8' },
  { id: 'gold', label: 'Gold', hex: '#D97706' },
  { id: 'brown', label: 'Brown', hex: '#78350F' },
]

export default function ColorFilter({ selected, onChange }) {
  const [hoveredColor, setHoveredColor] = useState(null)

  const toggle = (colorId) => {
    if (selected.includes(colorId)) {
      onChange(selected.filter((c) => c !== colorId))
    } else {
      onChange([...selected, colorId])
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {COLORS.map((color) => {
        const isActive = selected.includes(color.id)
        const isHovered = hoveredColor === color.id
        return (
          <div key={color.id} className="relative">
            <button
              onClick={() => toggle(color.id)}
              onMouseEnter={() => setHoveredColor(color.id)}
              onMouseLeave={() => setHoveredColor(null)}
              title={color.label}
              className={`w-7 h-7 rounded-full transition-all duration-200 cursor-pointer flex items-center justify-center ${
                color.border ? 'border-2 border-gray-300' : ''
              } ${isActive ? 'ring-2 ring-offset-2 ring-[#103321] scale-110' : 'hover:scale-110'}`}
              style={{ backgroundColor: color.hex }}
              aria-label={color.label}
            >
              {isActive && (
                <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none">
                  <path
                    d="M2 6l3 3 5-5"
                    stroke={color.id === 'white' ? '#103321' : 'white'}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </button>
            {/* Tooltip */}
            {isHovered && (
              <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-[#103321] text-white text-[10px] font-semibold px-2 py-0.5 rounded whitespace-nowrap z-10 pointer-events-none">
                {color.label}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

export { COLORS }

