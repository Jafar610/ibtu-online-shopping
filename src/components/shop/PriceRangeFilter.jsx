export default function PriceRangeFilter({ min, max, value, onChange }) {
  const currentMin = value?.[0] ?? min
  const currentMax = value?.[1] ?? max

  return (
    <div className="space-y-3">
      {/* Range display */}
      <div className="flex items-center justify-between text-xs font-semibold text-gray-700">
        <span className="bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1">
          {currentMin.toLocaleString()} ETB
        </span>
        <span className="text-gray-400">—</span>
        <span className="bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1">
          {currentMax.toLocaleString()} ETB
        </span>
      </div>

      {/* Min slider */}
      <input
        type="range"
        min={min}
        max={max}
        step={100}
        value={currentMin}
        onChange={(e) => {
          const newMin = Number(e.target.value)
          if (newMin <= currentMax) onChange([newMin, currentMax])
        }}
        className="w-full h-1.5 rounded-full appearance-none bg-gray-200 cursor-pointer accent-[#95C623]"
        aria-label="Minimum price"
      />

      {/* Max slider */}
      <input
        type="range"
        min={min}
        max={max}
        step={100}
        value={currentMax}
        onChange={(e) => {
          const newMax = Number(e.target.value)
          if (newMax >= currentMin) onChange([currentMin, newMax])
        }}
        className="w-full h-1.5 rounded-full appearance-none bg-gray-200 cursor-pointer accent-[#95C623]"
        aria-label="Maximum price"
      />

      <p className="text-[10px] text-gray-400">Drag sliders to set price range in ETB</p>
    </div>
  )
}
