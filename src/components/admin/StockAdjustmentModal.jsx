import { useState } from 'react'
import { X, Check, AlertCircle, ArrowRight, Package, Lock, Info, AlertTriangle } from 'lucide-react'

const ADJUSTMENT_TYPES = [
  { id: 'Purchase', label: 'Purchase Receipt (Batch Arrival)', isAdd: true },
  { id: 'Customer Return', label: 'Customer Return (Restock)', isAdd: true },
  { id: 'Damaged', label: 'Damaged / Defective Write-off', isAdd: false },
  { id: 'Lost', label: 'Lost / Missing Item', isAdd: false },
  { id: 'Opening Stock', label: 'Opening Stock Initialization', isAdd: true },
  { id: 'Adjustment', label: 'Manual Count Reconciliation', isAdd: null }, // user selects
]

export default function StockAdjustmentModal({
  isOpen,
  onClose,
  variantItem,
  onSaveAdjustment,
}) {
  const [adjustmentType, setAdjustmentType] = useState('Purchase')
  const [mode, setMode] = useState('add') // 'add' | 'subtract' (used when adjustmentType is 'Adjustment')
  const [quantity, setQuantity] = useState(5)
  const [reason, setReason] = useState('')
  const [notes, setNotes] = useState('')
  const [isConfirming, setIsConfirming] = useState(false)
  const [error, setError] = useState(null)

  if (!isOpen || !variantItem) return null

  const currentPhysical = variantItem.physicalStock
  const currentReserved = variantItem.reservedStock
  const currentAvailable = variantItem.availableStock

  // Calculate net adjustment delta
  const selectedTypeObj = ADJUSTMENT_TYPES.find((t) => t.id === adjustmentType)
  const isAddition =
    selectedTypeObj?.isAdd === true ||
    (adjustmentType === 'Adjustment' && mode === 'add')

  const parsedQty = Number(quantity) || 0
  const netDelta = isAddition ? parsedQty : -parsedQty

  const projectedPhysical = Math.max(0, currentPhysical + netDelta)
  const projectedAvailable = projectedPhysical - currentReserved

  const handleProceed = (e) => {
    e.preventDefault()
    setError(null)

    if (parsedQty <= 0) {
      setError('Please enter a valid positive adjustment quantity.')
      return
    }

    if (!isAddition && parsedQty > currentPhysical) {
      setError(`Cannot deduct ${parsedQty} units. Current physical stock is only ${currentPhysical} units.`)
      return
    }

    if (!reason.trim()) {
      setError('Please specify a reason for this stock adjustment.')
      return
    }

    setIsConfirming(true)
  }

  const handleFinalSubmit = () => {
    onSaveAdjustment({
      variantId: variantItem.variantId || variantItem.id,
      adjustmentType,
      deltaQuantity: parsedQty,
      mode: isAddition ? 'add' : 'subtract',
      reason: reason.trim(),
      notes: notes.trim(),
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100 p-6 sm:p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div>
            <h3 className="font-serif font-extrabold text-lg text-[#103321]">
              Record Stock Adjustment
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Adjust physical warehouse quantities and record an immutable audit movement log.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Variant Summary Snapshot */}
        <div className="flex items-center gap-3.5 p-3.5 bg-gray-50 rounded-2xl border border-gray-200">
          <div className="w-14 h-16 rounded-xl overflow-hidden bg-gray-200 border border-gray-300 shrink-0">
            <img
              src={variantItem.productImage}
              alt={variantItem.productName}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0 space-y-0.5">
            <span className="font-serif font-bold text-xs text-[#103321] block truncate">
              {variantItem.productName}
            </span>
            <div className="flex items-center gap-2 text-[11px] text-gray-500">
              <span className="font-mono bg-white px-1.5 py-0.5 rounded border border-gray-200 font-bold">
                {variantItem.sku}
              </span>
              <span>•</span>
              <span>Size: <strong>{variantItem.size}</strong></span>
              <span>•</span>
              <span>Color: <strong>{variantItem.color}</strong></span>
            </div>
            <div className="pt-1 flex items-center gap-3 text-xs">
              <span className="text-gray-500">
                Physical: <strong className="text-gray-900">{currentPhysical}</strong>
              </span>
              <span className="text-gray-500 flex items-center gap-0.5">
                <Lock className="w-3 h-3 text-purple-600" />
                Reserved: <strong className="text-purple-700">{currentReserved}</strong>
              </span>
              <span className="text-gray-500">
                Available: <strong className="text-emerald-700">{currentAvailable}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Confirmation Stage */}
        {isConfirming ? (
          <div className="space-y-5 animate-fadeIn">
            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 space-y-2">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Confirm Stock Adjustment</span>
              </div>
              <p className="text-xs text-amber-800 leading-relaxed">
                You are about to record a <strong>{adjustmentType}</strong> of{' '}
                <strong className={isAddition ? 'text-emerald-700' : 'text-rose-700'}>
                  {isAddition ? `+${parsedQty}` : `-${parsedQty}`} units
                </strong>.
              </p>
            </div>

            {/* Before vs After Table */}
            <div className="grid grid-cols-2 gap-3 text-center text-xs">
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                <span className="text-[10px] text-gray-400 font-bold uppercase block">Current Physical</span>
                <span className="font-serif font-extrabold text-lg text-gray-700">{currentPhysical}</span>
              </div>

              <div className="p-3 bg-[#103321]/5 rounded-xl border border-[#103321]/20">
                <span className="text-[10px] text-[#103321] font-bold uppercase block">Projected Physical</span>
                <span className="font-serif font-extrabold text-lg text-[#103321]">{projectedPhysical}</span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setIsConfirming(false)}
                className="px-4 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-bold transition-colors cursor-pointer"
              >
                Back to Edit
              </button>
              <button
                type="button"
                onClick={handleFinalSubmit}
                className="px-6 py-2.5 rounded-xl bg-[#103321] hover:bg-[#95C623] hover:text-[#103321] text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-4 h-4 stroke-[2.5]" />
                <span>Apply & Log Movement</span>
              </button>
            </div>
          </div>
        ) : (
          /* Form Stage */
          <form onSubmit={handleProceed} className="space-y-4">
            {/* Adjustment Type */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Movement / Adjustment Reason Type <span className="text-red-500">*</span>
              </label>
              <select
                value={adjustmentType}
                onChange={(e) => setAdjustmentType(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs bg-white focus:outline-hidden focus:border-[#103321] cursor-pointer"
              >
                {ADJUSTMENT_TYPES.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Mode toggle if Adjustment */}
            {adjustmentType === 'Adjustment' && (
              <div className="flex bg-gray-100 p-1 rounded-xl text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setMode('add')}
                  className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                    mode === 'add' ? 'bg-[#103321] text-white shadow-xs' : 'text-gray-600'
                  }`}
                >
                  + Increase Stock (Stock In)
                </button>
                <button
                  type="button"
                  onClick={() => setMode('subtract')}
                  className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                    mode === 'subtract' ? 'bg-rose-700 text-white shadow-xs' : 'text-gray-600'
                  }`}
                >
                  - Decrease Stock (Stock Out)
                </button>
              </div>
            )}

            {/* Quantity */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Units to {isAddition ? 'Add' : 'Deduct'} <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-hidden focus:border-[#103321]"
              />
            </div>

            {/* Reason */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Adjustment Reason <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. New artisan batch arrival from Gulele guild"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-hidden focus:border-[#103321]"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Audit Notes / Reference Information <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Verified by warehouse manager on shipment manifest #PO-2026-092."
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-hidden focus:border-[#103321]"
              />
            </div>

            {/* Stock Impact Live Projection */}
            <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-200 text-xs space-y-1.5">
              <span className="font-bold text-gray-700 block">Stock Impact Preview</span>
              <div className="flex items-center justify-between text-gray-600">
                <span>Physical Stock:</span>
                <span>
                  {currentPhysical} → <strong className="text-[#103321]">{projectedPhysical}</strong>
                </span>
              </div>
              <div className="flex items-center justify-between text-gray-600">
                <span>Available for Orders:</span>
                <span>
                  {currentAvailable} → <strong className="text-emerald-700">{projectedAvailable}</strong>
                </span>
              </div>
            </div>

            {/* Reserved Stock Policy Disclaimer */}
            <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 text-[11px] text-purple-900 flex items-start gap-2">
              <Info className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
              <span>
                <strong>Reserved Stock Policy:</strong> Reserved stock ({currentReserved} units) represents pending customer orders and cannot be directly modified through manual physical stock adjustments.
              </span>
            </div>

            {error && (
              <p className="text-xs text-rose-600 flex items-center gap-1.5 animate-fadeIn">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </p>
            )}

            {/* Buttons */}
            <div className="pt-2 flex items-center justify-end gap-3 border-t border-gray-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-[#103321] hover:bg-[#95C623] hover:text-[#103321] text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                <span>Review Adjustment</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
