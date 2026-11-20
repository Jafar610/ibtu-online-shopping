import { Link } from 'react-router-dom'
import { ShoppingBag, ArrowRight, Eye } from 'lucide-react'
import AdminStatusBadge from './AdminStatusBadge'
import { adminRecentOrders } from '../../data/admin/adminDashboardMockData'

export default function AdminRecentOrders() {
  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-xs p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#103321]/10 text-[#103321] flex items-center justify-center">
            <ShoppingBag className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-base text-[#103321]">
              Recent Customer Orders
            </h3>
            <span className="text-[11px] text-gray-400">Latest 5 purchases</span>
          </div>
        </div>

        <Link
          to="/admin/orders"
          className="text-xs font-bold text-[#103321] hover:text-[#95C623] flex items-center gap-1 transition-colors"
        >
          <span>View All Orders</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Responsive Table */}
      <div className="overflow-x-auto -mx-6 px-6">
        <table className="w-full text-left text-xs min-w-[600px]">
          <thead>
            <tr className="border-b border-gray-100 text-[11px] font-bold uppercase tracking-wider text-gray-400">
              <th className="pb-3 font-semibold">Order</th>
              <th className="pb-3 font-semibold">Customer</th>
              <th className="pb-3 font-semibold">Date</th>
              <th className="pb-3 font-semibold">Amount</th>
              <th className="pb-3 font-semibold">Payment</th>
              <th className="pb-3 font-semibold">Status</th>
              <th className="pb-3 font-semibold text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 text-gray-700">
            {adminRecentOrders.map((order) => {
              const formattedDate = new Date(order.date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })

              return (
                <tr key={order.id} className="hover:bg-gray-50/70 transition-colors">
                  <td className="py-3.5 font-mono font-bold text-[#103321]">
                    {order.orderNumber}
                  </td>
                  <td className="py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-[#103321] text-[#95C623] text-[10px] font-bold flex items-center justify-center shrink-0">
                        {order.customer.avatar}
                      </div>
                      <div>
                        <span className="font-bold text-gray-900 block leading-tight">
                          {order.customer.name}
                        </span>
                        <span className="text-[10px] text-gray-400 block">
                          {order.customer.email}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 text-gray-500 text-[11px]">
                    {formattedDate}
                  </td>
                  <td className="py-3.5 font-serif font-bold text-[#103321]">
                    {order.amount.toLocaleString()} {order.currency}
                  </td>
                  <td className="py-3.5">
                    <div className="space-y-0.5">
                      <AdminStatusBadge status={order.paymentStatus} type="payment" />
                      <span className="block text-[10px] text-gray-400">
                        {order.paymentMethod}
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5">
                    <AdminStatusBadge status={order.orderStatus} type="order" />
                  </td>
                  <td className="py-3.5 text-right">
                    <Link
                      to="/admin/orders"
                      className="p-1.5 rounded-lg border border-gray-200 hover:border-[#103321] hover:bg-gray-100 text-gray-600 hover:text-[#103321] transition-all inline-flex items-center gap-1 text-[11px] font-medium"
                      title="View order details"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Review</span>
                    </Link>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
