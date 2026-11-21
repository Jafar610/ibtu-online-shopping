import { Link } from 'react-router-dom'
import { Eye, Edit3, XCircle, ShoppingBag, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react'
import AdminStatusBadge from './AdminStatusBadge'

export default function OrderTable({
  orders = [],
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  onChangeStatus,
  onCancelOrder,
}) {
  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center space-y-3">
        <div className="w-14 h-14 rounded-2xl bg-gray-50 text-gray-400 flex items-center justify-center mx-auto">
          <ShoppingBag className="w-7 h-7" />
        </div>
        <h3 className="font-serif font-bold text-base text-[#103321]">
          No customer orders found
        </h3>
        <p className="text-xs text-gray-500 max-w-sm mx-auto">
          No orders match the selected filters or search criteria. Try adjusting your query or resetting filters.
        </p>
      </div>
    )
  }

  const formatCurrency = (val) =>
    new Intl.NumberFormat('en-ET', { style: 'currency', currency: 'ETB', maximumFractionDigits: 0 }).format(val || 0)

  const formatDate = (isoStr) => {
    if (!isoStr) return 'N/A'
    try {
      const d = new Date(isoStr)
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
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
              <th className="py-3.5 px-4">Order #</th>
              <th className="py-3.5 px-4">Customer</th>
              <th className="py-3.5 px-4">Date Placed</th>
              <th className="py-3.5 px-4 text-center">Items</th>
              <th className="py-3.5 px-4 text-right">Total (ETB)</th>
              <th className="py-3.5 px-4 text-center">Payment</th>
              <th className="py-3.5 px-4 text-center">Order Status</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {orders.map((order) => {
              const itemCount = (order.items || []).reduce((sum, it) => sum + (it.quantity || 1), 0)
              const isCancellable = order.orderStatus !== 'Cancelled' && order.orderStatus !== 'Delivered' && order.orderStatus !== 'Refunded'

              return (
                <tr
                  key={order.id}
                  className="hover:bg-gray-50/80 transition-colors group"
                >
                  {/* Order Number */}
                  <td className="py-3.5 px-4">
                    <Link
                      to={`/admin/orders/${order.id}`}
                      className="font-bold text-[#103321] hover:text-[#95C623] transition-colors block font-mono text-xs"
                    >
                      {order.orderNumber}
                    </Link>
                    <span className="text-[10px] text-gray-400 block font-mono">
                      {order.id}
                    </span>
                  </td>

                  {/* Customer Information */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-[#103321]/10 text-[#103321] font-bold text-[11px] flex items-center justify-center shrink-0">
                        {order.customer?.avatar || order.customer?.name?.slice(0, 2).toUpperCase() || 'CU'}
                      </div>
                      <div className="min-w-0">
                        <span className="font-bold text-gray-900 block truncate max-w-[140px]">
                          {order.customer?.name || order.shippingAddress?.recipientName || 'Customer'}
                        </span>
                        <span className="text-[10px] text-gray-500 block truncate max-w-[140px]">
                          {order.customer?.phone || order.shippingAddress?.phone || order.customer?.email}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Date Placed */}
                  <td className="py-3.5 px-4 text-gray-600 whitespace-nowrap">
                    {formatDate(order.orderDate)}
                  </td>

                  {/* Item count */}
                  <td className="py-3.5 px-4 text-center">
                    <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 font-bold text-[11px]">
                      {itemCount} {itemCount === 1 ? 'item' : 'items'}
                    </span>
                  </td>

                  {/* Total Amount */}
                  <td className="py-3.5 px-4 text-right">
                    <span className="font-bold text-[#103321] block">
                      {formatCurrency(order.totalAmount)}
                    </span>
                    {order.discountAmount > 0 && (
                      <span className="text-[10px] text-emerald-600 block">
                        -{formatCurrency(order.discountAmount)} off
                      </span>
                    )}
                  </td>

                  {/* Payment Status */}
                  <td className="py-3.5 px-4 text-center whitespace-nowrap">
                    <div className="flex flex-col items-center gap-1">
                      <AdminStatusBadge status={order.paymentStatus} type="payment" />
                      <span className="text-[10px] text-gray-400">
                        {order.paymentMethod}
                      </span>
                    </div>
                  </td>

                  {/* Order Status */}
                  <td className="py-3.5 px-4 text-center whitespace-nowrap">
                    <AdminStatusBadge status={order.orderStatus} type="order" />
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* View Details */}
                      <Link
                        to={`/admin/orders/${order.id}`}
                        title="View Full Order Details"
                        className="p-1.5 rounded-lg text-gray-500 hover:text-[#103321] hover:bg-gray-100 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>

                      {/* Quick Status Update */}
                      <button
                        type="button"
                        onClick={() => onChangeStatus(order)}
                        title="Update Order Status"
                        className="p-1.5 rounded-lg text-gray-500 hover:text-[#103321] hover:bg-gray-100 transition-colors cursor-pointer"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      {/* Cancel Order */}
                      {isCancellable && (
                        <button
                          type="button"
                          onClick={() => onCancelOrder(order)}
                          title="Cancel Order"
                          className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      )}
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
