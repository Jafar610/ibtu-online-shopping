import { X, ScrollText, ArrowRight, Package, User, Clock, CheckCircle2 } from 'lucide-react'

export default function MovementDetailsModal({ isOpen, onClose, movement }) {
  if (!isOpen || !movement) return null

  const isAddition = Number(movement.quantity) > 0

  const formattedDate = new Date(movement.createdAt).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100 p-6 sm:p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-[#103321]/10 text-[#103321] flex items-center justify-center">
              <ScrollText className="w-4 h-4" />
            </span>
            <div>
              <h3 className="font-serif font-extrabold text-lg text-[#103321]">
                Movement Audit Log
              </h3>
              <span className="font-mono text-xs text-gray-400 font-bold">
                Log ID: {movement.id}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Product Snapshot */}
        <div className="flex items-center gap-3.5 p-3.5 bg-gray-50 rounded-2xl border border-gray-200">
          <div className="w-14 h-16 rounded-xl overflow-hidden bg-gray-200 border border-gray-300 shrink-0">
            <img
              src={movement.productImage}
              alt={movement.productName}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0 space-y-0.5">
            <span className="font-serif font-bold text-xs text-[#103321] block truncate">
              {movement.productName}
            </span>
            <span className="font-mono text-[11px] text-gray-500 font-bold block">
              {movement.sku}
            </span>
            <span className="text-[11px] text-gray-400 block">
              {movement.variantLabel}
            </span>
          </div>
        </div>

        {/* Movement Summary Card */}
        <div className="p-4 bg-white rounded-2xl border border-gray-200 space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-gray-500 font-bold uppercase text-[10px]">Movement Type</span>
            <span className="px-2.5 py-0.5 rounded-full font-bold bg-[#103321]/10 text-[#103321]">
              {movement.movementType}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-gray-500 font-bold uppercase text-[10px]">Net Delta</span>
            <span
              className={`font-serif font-extrabold text-base ${
                isAddition ? 'text-emerald-700' : 'text-rose-700'
              }`}
            >
              {isAddition ? `+${movement.quantity}` : movement.quantity} units
            </span>
          </div>

          {/* Before & After Row */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100 text-center">
            <div className="p-2 bg-gray-50 rounded-lg">
              <span className="text-[10px] text-gray-400 block font-bold">Physical Before</span>
              <span className="font-bold text-gray-700">{movement.quantityBefore}</span>
            </div>
            <div className="p-2 bg-emerald-50 rounded-lg">
              <span className="text-[10px] text-emerald-800 block font-bold">Physical After</span>
              <span className="font-bold text-emerald-900">{movement.quantityAfter}</span>
            </div>
          </div>
        </div>

        {/* Reference and Actor Details */}
        <div className="space-y-2 text-xs text-gray-700">
          <div className="flex justify-between py-1.5 border-b border-gray-100">
            <span className="text-gray-400">Timestamp:</span>
            <span className="font-medium">{formattedDate}</span>
          </div>

          <div className="flex justify-between py-1.5 border-b border-gray-100">
            <span className="text-gray-400">Recorded By (Actor):</span>
            <span className="font-bold text-[#103321]">{movement.user}</span>
          </div>

          {movement.referenceType && (
            <div className="flex justify-between py-1.5 border-b border-gray-100">
              <span className="text-gray-400">Reference:</span>
              <span className="font-mono text-gray-800">
                {movement.referenceType} ({movement.referenceId})
              </span>
            </div>
          )}

          <div className="py-2 space-y-1">
            <span className="text-gray-400 block">Stated Reason:</span>
            <p className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-gray-800 leading-relaxed">
              {movement.reason || 'Manual stock adjustment'}
            </p>
          </div>

          {movement.notes && (
            <div className="py-1 space-y-1">
              <span className="text-gray-400 block">Additional Notes:</span>
              <p className="text-gray-600 italic">
                {movement.notes}
              </p>
            </div>
          )}
        </div>

        {/* Close Button */}
        <div className="pt-2 border-t border-gray-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-[#103321] hover:bg-[#95C623] hover:text-[#103321] text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
          >
            Close Audit Log
          </button>
        </div>
      </div>
    </div>
  )
}
