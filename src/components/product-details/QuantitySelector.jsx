import { Minus, Plus } from 'lucide-react'

export default function QuantitySelector({ quantity, onChange, maxStock = 99 }) {
  const decrement = () => {
    if (quantity > 1) onChange(quantity - 1)
  }
  const increment = () => {
    if (quantity < maxStock) onChange(quantity + 1)
  }

  return (
    <div>
      <span className="text-xs font-bold uppercase tracking-wider text-gray-700 block mb-2.5">
        Quantity
      </span>
      <div className="flex items-center gap-0">
        <button
          onClick={decrement}
          disabled={quantity <= 1}
          className={`w-10 h-10 rounded-l-xl border-2 border-r-0 flex items-center justify-center transition-all duration-200 ${
            quantity <= 1
              ? 'border-gray-100 text-gray-300 cursor-not-allowed'
              : 'border-gray-200 text-gray-600 hover:border-[#103321] hover:text-[#103321] hover:bg-[#103321]/5 cursor-pointer'
          }`}
          aria-label="Decrease quantity"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>

        <div className="w-14 h-10 border-y-2 border-gray-200 flex items-center justify-center">
          <span className="text-sm font-bold text-[#103321]">{quantity}</span>
        </div>

        <button
          onClick={increment}
          disabled={quantity >= maxStock}
          className={`w-10 h-10 rounded-r-xl border-2 border-l-0 flex items-center justify-center transition-all duration-200 ${
            quantity >= maxStock
              ? 'border-gray-100 text-gray-300 cursor-not-allowed'
              : 'border-gray-200 text-gray-600 hover:border-[#103321] hover:text-[#103321] hover:bg-[#103321]/5 cursor-pointer'
          }`}
          aria-label="Increase quantity"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>

        {maxStock <= 10 && maxStock > 0 && (
          <span className="ml-3 text-[11px] font-semibold text-orange-500">
            Only {maxStock} left!
          </span>
        )}
      </div>
    </div>
  )
}

