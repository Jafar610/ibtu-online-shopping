import { useState, useEffect } from 'react'
import { Truck, X, AlertTriangle, CheckCircle, Package } from 'lucide-react'

export default function ShipmentFormModal({
  isOpen,
  mode = 'create', // 'create' | 'edit'
  shipment = null,
  eligibleOrders = [],
  onClose,
  onSubmit,
}) {
  const [orderId, setOrderId] = useState('')
  const [courierName, setCourierName] = useState('Ethio Post Express')
  const [courierPhone, setCourierPhone] = useState('+251 11 551 0422')
  const [trackingNumber, setTrackingNumber] = useState('')
  const [shippingCost, setShippingCost] = useState('0')
  const [shipmentStatus, setShipmentStatus] = useState('Processing')
  const [estimatedDelivery, setEstimatedDelivery] = useState('')
  const [deliveryNotes, setDeliveryNotes] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen) {
      setError('')
      if (mode === 'edit' && shipment) {
        setOrderId(shipment.orderId || '')
        setCourierName(shipment.courierName || 'Ethio Post Express')
        setCourierPhone(shipment.courierPhone || '+251 11 551 0422')
        setTrackingNumber(shipment.trackingNumber || '')
        setShippingCost(String(shipment.shippingCost || 0))
        setShipmentStatus(shipment.shipmentStatus || 'Processing')
        setEstimatedDelivery(
          shipment.estimatedDelivery
            ? new Date(shipment.estimatedDelivery).toISOString().slice(0, 10)
            : ''
        )
        setDeliveryNotes(shipment.deliveryNotes || '')
      } else {
        // Create Mode
        const firstEligible = eligibleOrders[0]?.id || ''
        setOrderId(firstEligible)
        setCourierName('Ethio Post Express')
        setCourierPhone('+251 11 551 0422')
        // Suggest a tracking number format
        setTrackingNumber(`ET-POST-${Math.floor(10000 + Math.random() * 90000)}`)
        setShippingCost('0')
        setShipmentStatus('Processing')
        // Default estimated delivery: 3 days from now
        const d = new Date(Date.now() + 3 * 86400000)
        setEstimatedDelivery(d.toISOString().slice(0, 10))
        setDeliveryNotes('')
      }
    }
  }, [isOpen, mode, shipment, eligibleOrders])

  if (!isOpen) return null

  const handleCourierSelect = (name) => {
    setCourierName(name)
    const phoneMap = {
      'Ethio Post Express': '+251 11 551 0422',
      'IBTU Direct Logistics': '+251 91 100 2233',
      'Tikur Abay Express': '+251 11 123 4567',
      'EMS Ethiopia': '+251 11 551 2929',
    }
    setCourierPhone(phoneMap[name] || '+251 11 551 0422')
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    if (mode === 'create' && !orderId) {
      setError('Please select an eligible order for dispatch.')
      return
    }

    if (!trackingNumber.trim()) {
      setError('Tracking number is required.')
      return
    }

    const payload = {
      orderId,
      courierName,
      courierPhone: courierPhone.trim(),
      trackingNumber: trackingNumber.trim().toUpperCase(),
      shippingCost: Number(shippingCost) || 0,
      shipmentStatus,
      estimatedDelivery: estimatedDelivery ? new Date(estimatedDelivery).toISOString() : null,
      deliveryNotes: deliveryNotes.trim(),
    }

    const res = onSubmit(payload)
    if (res && !res.success) {
      setError(res.message || 'Operation failed.')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-gray-100 flex items-center justify-between bg-[#103321]/5 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#103321] text-[#95C623] flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-[#103321]">
                {mode === 'create' ? 'Create Order Shipment' : 'Edit Shipment Details'}
              </h3>
              <p className="text-xs text-gray-500">
                {mode === 'create'
                  ? 'Assign courier dispatch and generate tracking code'
                  : `Updating shipment #${shipment?.shipmentNumber}`}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Mode === Create: Order Selector */}
          {mode === 'create' && (
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-700">
                Associated Eligible Order <span className="text-rose-500">*</span>
              </label>
              {eligibleOrders.length > 0 ? (
                <select
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-xs bg-white font-medium text-gray-800 outline-none focus:border-[#95C623]"
                >
                  {eligibleOrders.map((ord) => (
                    <option key={ord.id} value={ord.id}>
                      {ord.orderNumber} — {ord.customer?.name} ({ord.totalAmount} ETB) [{ord.orderStatus}]
                    </option>
                  ))}
                </select>
              ) : (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800">
                  No orders currently awaiting shipment dispatch.
                </div>
              )}
            </div>
          )}

          {/* Courier Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-700">
                Courier Service <span className="text-rose-500">*</span>
              </label>
              <select
                value={courierName}
                onChange={(e) => handleCourierSelect(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-xs bg-white font-medium text-gray-800 outline-none focus:border-[#95C623]"
              >
                <option value="Ethio Post Express">Ethio Post Express</option>
                <option value="IBTU Direct Logistics">IBTU Direct Logistics</option>
                <option value="Tikur Abay Express">Tikur Abay Express</option>
                <option value="EMS Ethiopia">EMS Ethiopia</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-700">
                Courier Contact Phone
              </label>
              <input
                type="text"
                value={courierPhone}
                onChange={(e) => setCourierPhone(e.target.value)}
                placeholder="+251 11 551 0422"
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-xs text-gray-800 outline-none focus:border-[#95C623]"
              />
            </div>
          </div>

          {/* Tracking Number & Shipping Cost */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-700">
                Tracking Number <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="e.g. ET-POST-99120"
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-xs font-mono uppercase text-gray-800 outline-none focus:border-[#95C623]"
              />
              <span className="text-[10px] text-gray-400">Must be unique per dispatch</span>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-700">
                Shipping Cost (ETB)
              </label>
              <input
                type="number"
                min="0"
                value={shippingCost}
                onChange={(e) => setShippingCost(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-xs text-gray-800 outline-none focus:border-[#95C623]"
              />
            </div>
          </div>

          {/* Shipment Status & Estimated Delivery Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-700">
                Shipment Status
              </label>
              <select
                value={shipmentStatus}
                onChange={(e) => setShipmentStatus(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-xs bg-white font-medium text-gray-800 outline-none focus:border-[#95C623]"
              >
                <option value="Processing">Processing (Packaging)</option>
                <option value="Shipped">Shipped (Dispatched)</option>
                <option value="In Transit">In Transit</option>
                <option value="Out for Delivery">Out for Delivery</option>
                <option value="Delivered">Delivered</option>
                <option value="Returned">Returned</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-700">
                Estimated Delivery Date
              </label>
              <input
                type="date"
                value={estimatedDelivery}
                onChange={(e) => setEstimatedDelivery(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-xs text-gray-800 outline-none focus:border-[#95C623]"
              />
            </div>
          </div>

          {/* Delivery Notes */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-700">
              Delivery & Courier Instructions
            </label>
            <textarea
              rows={2}
              value={deliveryNotes}
              onChange={(e) => setDeliveryNotes(e.target.value)}
              placeholder="e.g. Call customer before gate arrival. Fragile artisan gift packaging."
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs outline-none focus:border-[#95C623] resize-none"
            />
          </div>

          {/* Modal Actions */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-bold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={mode === 'create' && eligibleOrders.length === 0}
              className="px-5 py-2.5 rounded-xl bg-[#103321] hover:bg-[#103321]/90 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <CheckCircle className="w-3.5 h-3.5 text-[#95C623]" />
              {mode === 'create' ? 'Dispatch Shipment' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
