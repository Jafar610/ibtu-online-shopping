const COLOR_HEX = {
  'black': '#1A1A1A',
  'midnight black': '#1A1A1A',
  'jet black': '#1A1A1A',
  'white': '#F5F5F5',
  'off-white': '#F5F0E8',
  'natural white': '#FAF8F0',
  'pure white': '#FFFFFF',
  'cream white': '#F5F0E8',
  'forest green': '#103321',
  'emerald green': '#065F46',
  'deep navy': '#1E3A5F',
  'classic navy': '#1E3A5F',
  'lime green': '#95C623',
  'gold': '#D97706',
  'red': '#DC2626',
  'sky blue': '#0EA5E9',
  'brown': '#78350F',
  'tan': '#92400E',
  'coral': '#F97316',
  'multicolor': 'linear-gradient(135deg,#103321,#95C623,#D97706)',
}

function getColorHex(colorName) {
  const lower = colorName.toLowerCase()
  for (const [key, hex] of Object.entries(COLOR_HEX)) {
    if (lower.includes(key)) return { hex, isGradient: key === 'multicolor' }
  }
  return { hex: '#9CA3AF', isGradient: false }
}

function needsBorder(colorName) {
  const lower = colorName.toLowerCase()
  return lower.includes('white') || lower.includes('cream') || lower.includes('natural')
}

export default function ColorSelector({ colors, selected, onChange }) {
  if (!colors || colors.length === 0) return null

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs font-bold uppercase tracking-wider text-gray-700">Color</span>
        {selected && (
          <span className="text-xs font-semibold text-[#103321] bg-[#95C623]/15 px-2.5 py-0.5 rounded-full">
            {selected}
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        {colors.map((color) => {
          const isSelected = selected === color
          const { hex, isGradient } = getColorHex(color)
          const hasBorder = needsBorder(color)

          return (
            <div key={color} className="relative group">
              <button
                onClick={() => onChange(color)}
                title={color}
                aria-label={`Select color: ${color}`}
                className={`w-8 h-8 rounded-full transition-all duration-200 cursor-pointer flex items-center justify-center ${
                  hasBorder ? 'border-2 border-gray-300' : ''
                } ${isSelected ? 'ring-2 ring-offset-2 ring-[#103321] scale-110 shadow-md' : 'hover:scale-110 hover:shadow-sm'}`}
                style={isGradient ? { background: hex } : { backgroundColor: hex }}
              >
                {isSelected && (
                  <svg className="w-3.5 h-3.5" viewBox="0 0 14 14" fill="none">
                    <path
                      d="M2.5 7l3.5 3.5 5.5-6"
                      stroke={hasBorder ? '#103321' : 'white'}
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </button>
              {/* Tooltip */}
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#103321] text-white text-[9px] font-semibold px-2 py-0.5 rounded whitespace-nowrap z-10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                {color}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

