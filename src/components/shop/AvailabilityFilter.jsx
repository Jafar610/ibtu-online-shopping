import { Check } from 'lucide-react'

export default function AvailabilityFilter({ value, onChange }) {
  const toggleOption = (option) => {
    if (value.includes(option)) {
      onChange(value.filter((v) => v !== option))
    } else {
      onChange([...value, option])
    }
  }

  const options = [
    { id: 'in-stock', label: 'In Stock', desc: 'Ready to ship' },
    { id: 'out-of-stock', label: 'Out of Stock', desc: 'Coming soon' },
  ]

  return (
    <div className="space-y-2">
      {options.map((opt) => {
        const isChecked = value.includes(opt.id)
        return (
          <label
            key={opt.id}
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => toggleOption(opt.id)}
          >
            <div
              className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-all duration-200 ${
                isChecked
                  ? 'bg-[#95C623] border-[#95C623]'
                  : 'border-gray-300 group-hover:border-[#103321]'
              }`}
            >
              {isChecked && <Check className="w-2.5 h-2.5 text-[#103321]" strokeWidth={3} />}
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-800">{opt.label}</p>
              <p className="text-[10px] text-gray-400">{opt.desc}</p>
            </div>
          </label>
        )
      })}
    </div>
  )
}

