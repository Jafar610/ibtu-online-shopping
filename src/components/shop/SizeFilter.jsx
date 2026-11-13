const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL']

export default function SizeFilter({ selected, onChange }) {
  const toggle = (size) => {
    if (selected.includes(size)) {
      onChange(selected.filter((s) => s !== size))
    } else {
      onChange([...selected, size])
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {SIZES.map((size) => {
        const isActive = selected.includes(size)
        return (
          <button
            key={size}
            onClick={() => toggle(size)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all duration-200 cursor-pointer ${
              isActive
                ? 'bg-[#103321] border-[#103321] text-white shadow-sm'
                : 'bg-white border-gray-200 text-gray-600 hover:border-[#103321] hover:text-[#103321]'
            }`}
          >
            {size}
          </button>
        )
      })}
    </div>
  )
}

export { SIZES }

