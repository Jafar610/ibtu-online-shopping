import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Eye, Edit3, Truck, Copy, Check, ChevronLeft, ChevronRight, MapPin } from 'lucide-react'
import AdminStatusBadge from './AdminStatusBadge'

export default function ShipmentTable({
  shipments = [],
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  onEditShipment,
  onAdvanceStatus,
}) {
  const [copiedId, setCopiedId] = useState(null)

  if (shipments.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center space-y-3">
        <div className="w-14 h-14 rounded-2xl bg-gray-50 text-gray-400 flex items-center justify-center mx-auto">
          <Truck className="w-7 h-7" />
        </div>
        <h3 className="font-serif font-bold text-base text-[#103321]">
          No dispatches or shipments found
        </h3>
        <p className="text-xs text-gray-500 max-w-sm mx-auto">
          No shipments match the current criteria. Use the "Create Shipment" action to dispatch an order.
        </p>
      </div>
    )
  }

  const handleCopyTracking = (tracking) => {
    if (!tracking) return
    navigator.clipboard?.writeText(tracking)
    setCopiedId(tracking)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const formatDate = (isoStr) => {
    if (!isoStr) return 'Pending'
    try {
      return new Date(isoStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    } catch {
      return isoStr
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#103321]/5 border-b border-gray-100 text-gray-600 font-extrabold uppercase tracking-wider text-[11px]">
            <tr>
              <th className="py-3.5 px-4">Shipment #</th>
              <th className="py-3.5 px-4">Order #</th>
              <th className="py-3.5 px-4">Recipient</th>
              <th className="py-3.5 px-4">Courier</th>
              <th className="py-3.5 px-4">Tracking Number</th>
              <th className="py-3.5 px-4 text-center">Status</th>
              <th className="py-3.5 px-4">Estimated Delivery</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {shipments.map((shp) => {
              const isCopied = copiedId === shp.trackingNumber

              return (
                <tr
                  key={shp.id}
                  className="hover:bg-gray-50/80 transition-colors group"
                >
                  {/* Shipment Number */}
                  <td className="py-3.5 px-4">
                    <Link
                      to={`/admin/shipments/${shp.id}`}
                      className="font-bold text-[#103321] hover:text-[#95C623] transition-colors block font-mono text-xs"
                    >
                      {shp.shipmentNumber}
                    </Link>
                    <span className="text-[10px] text-gray-400 block truncate max-w-[120px]">
                      {shp.shippingAddress?.city || 'Addis Ababa'}
                    </span>
                  </td>

                  {/* Order Number */}
                  <td className="py-3.5 px-4">
                    <Link
                      to={`/admin/orders/${shp.orderId}`}
                      className="font-bold text-gray-800 hover:text-[#95C623] font-mono transition-colors"
                    >
                      {shp.orderNumber}
                    </Link>
                  </td>

                  {/* Recipient */}
                  <td className="py-3.5 px-4">
                    <div className="min-w-0">
                      <span className="font-bold text-gray-900 block truncate max-w-[130px]">
                        {shp.shippingAddress?.recipientName || shp.customer?.name}
                      </span>
                      <span className="text-[10px] text-gray-500 block truncate max-w-[130px]">
                        {shp.shippingAddress?.phone || shp.customer?.phone}
                      </span>
                    </div>
                  </td>

                  {/* Courier */}
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-gray-800 block">
                      {shp.courierName}
                    </span>
                    <span className="text-[10px] text-gray-500 block font-mono">
                      {shp.courierPhone}
                    </span>
                  </td>

                  {/* Tracking Number */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-100 font-mono text-gray-700">
                      <span>{shp.trackingNumber}</span>
                      <button
                        type="button"
                        onClick={() => handleCopyTracking(shp.trackingNumber)}
                        title="Copy tracking code"
                        className="text-gray-400 hover:text-[#103321] transition-colors cursor-pointer"
                      >
                        {isCopied ? (
                          <Check className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4 text-center whitespace-nowrap">
                    <AdminStatusBadge status={shp.shipmentStatus} type="shipment" />
                  </td>

                  {/* Estimated Delivery */}
                  <td className="py-3.5 px-4 text-gray-600 whitespace-nowrap">
                    <span className="font-medium block">
                      {formatDate(shp.estimatedDelivery)}
                    </span>
                    {shp.deliveredDate && (
                      <span className="text-[10px] text-emerald-600 block">
                        Delivered on {formatDate(shp.deliveredDate)}
                      </span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      <Link
                        to={`/admin/shipments/${shp.id}`}
                        title="View Shipment Details"
                        className="p-1.5 rounded-lg text-gray-500 hover:text-[#103321] hover:bg-gray-100 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>

                      <button
                        type="button"
                        onClick={() => onEditShipment(shp)}
                        title="Update Shipment & Logistics"
                        className="p-1.5 rounded-lg text-gray-500 hover:text-[#103321] hover:bg-gray-100 transition-colors cursor-pointer"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="p-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
          <div>
            Page <span className="font-bold text-[#103321]">{currentPage}</span> of{' '}
            <span className="font-bold text-[#103321]">{totalPages}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => onPageChange(currentPage - 1)}
              className="p-1.5 rounded-lg border border-gray-200 enabled:hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => onPageChange(currentPage + 1)}
              className="p-1.5 rounded-lg border border-gray-200 enabled:hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
