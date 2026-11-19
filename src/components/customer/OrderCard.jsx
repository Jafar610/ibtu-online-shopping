import { Link, useNavigate } from 'react-router-dom'
import { Calendar, Package, ArrowRight, Truck, Eye } from 'lucide-react'
import OrderStatusBadge from './OrderStatusBadge'

export default function OrderCard({ order }) {
  const navigate = useNavigate()
  const hasShipment = Boolean(order.shipment && order.shipment.shipmentStatus !== 'Cancelled')

  const formattedDate = new Date(order.orderDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-xs hover:border-[#95C623]/40 hover:shadow-md transition-all p-5 space-y-4">
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#103321] text-[#95C623] flex items-center justify-center font-mono font-bold text-xs shrink-0">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono font-bold text-sm sm:text-base text-[#103321]">
                {order.orderNumber}
              </span>
              <OrderStatusBadge status={order.orderStatus} type="order" />
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3 text-gray-400" />
                <span>{formattedDate}</span>
              </span>
              <span>•</span>
              <OrderStatusBadge status={order.paymentStatus} type="payment" />
            </div>
          </div>
        </div>

        <div className="text-left sm:text-right">
          <span className="text-xs text-gray-400 block font-medium">Total Amount</span>
          <span className="font-serif text-lg sm:text-xl font-extrabold text-[#103321]">
            {order.totalAmount.toLocaleString()} ETB
          </span>
        </div>
      </div>

      {/* Items Preview */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto py-1">
          {order.items?.map((item, idx) => (
            <div
              key={idx}
              className="relative w-14 h-16 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 shrink-0 group cursor-pointer"
              onClick={() => navigate(`/account/orders/${order.id}`)}
              title={`${item.name} (${item.quantity}x)`}
            >
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              />
              {item.quantity > 1 && (
                <span className="absolute bottom-1 right-1 bg-[#103321] text-white text-[10px] font-bold px-1.5 py-0.2 rounded-md shadow-xs">
                  {item.quantity}x
                </span>
              )}
            </div>
          ))}

          <div className="pl-1">
            <span className="text-xs font-semibold text-gray-700 block">
              {order.items?.length} {order.items?.length === 1 ? 'Product' : 'Products'}
            </span>
            <span className="text-[11px] text-gray-400 truncate max-w-[200px] block">
              {order.items?.[0]?.name}
              {order.items?.length > 1 ? ` +${order.items.length - 1} more` : ''}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          {hasShipment && (
            <Link
              to={`/account/orders/${order.id}/tracking`}
              className="px-3 py-2 rounded-xl bg-[#95C623]/20 hover:bg-[#95C623] text-[#103321] text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <Truck className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Track</span>
            </Link>
          )}

          <Link
            to={`/account/orders/${order.id}`}
            className="px-3.5 py-2 rounded-xl bg-[#103321] hover:bg-[#95C623] hover:text-[#103321] text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Details</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
