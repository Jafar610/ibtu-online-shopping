import { Link } from 'react-router-dom'
import { Eye, ShieldCheck, ShieldAlert, Users, ChevronLeft, ChevronRight, ShoppingBag } from 'lucide-react'
import AdminStatusBadge from './AdminStatusBadge'
import { getCustomerMetrics } from '../../data/admin/adminEngagementData'

export default function CustomerTable({
  customers = [],
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  onToggleStatus,
}) {
  if (customers.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center space-y-3">
        <div className="w-14 h-14 rounded-2xl bg-gray-50 text-gray-400 flex items-center justify-center mx-auto">
          <Users className="w-7 h-7" />
        </div>
        <h3 className="font-serif font-bold text-base text-[#103321]">
          No customer accounts found
        </h3>
        <p className="text-xs text-gray-500 max-w-sm mx-auto">
          No customer profiles match your current search or status filter. Try resetting filters to view all customers.
        </p>
      </div>
    )
  }

  const formatCurrency = (val) =>
    new Intl.NumberFormat('en-ET', { style: 'currency', currency: 'ETB', maximumFractionDigits: 0 }).format(val || 0)

  const formatDate = (isoStr) => {
    if (!isoStr) return 'N/A'
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
              <th className="py-3.5 px-4">Customer</th>
              <th className="py-3.5 px-4">Contact</th>
              <th className="py-3.5 px-4">Registered</th>
              <th className="py-3.5 px-4 text-center">Status</th>
              <th className="py-3.5 px-4 text-center">Orders</th>
              <th className="py-3.5 px-4 text-right">Total Spent (ETB)</th>
              <th className="py-3.5 px-4">Last Login</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {customers.map((cust) => {
              const metrics = getCustomerMetrics(cust.id, cust.email)
              const isSuspended = cust.status === 'Suspended'

              return (
                <tr
                  key={cust.id}
                  className="hover:bg-gray-50/80 transition-colors group"
                >
                  {/* Customer Profile */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#103321]/10 text-[#103321] font-bold text-xs flex items-center justify-center shrink-0">
                        {cust.avatar || cust.name?.slice(0, 2).toUpperCase() || 'CU'}
                      </div>
                      <div className="min-w-0">
                        <Link
                          to={`/admin/customers/${cust.id}`}
                          className="font-bold text-[#103321] hover:text-[#95C623] transition-colors block truncate max-w-[140px]"
                        >
                          {cust.name}
                        </Link>
                        <span className="text-[10px] text-gray-400 block truncate">
                          {cust.accountType || 'Registered Customer'}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Contact */}
                  <td className="py-3.5 px-4">
                    <span className="font-medium text-gray-900 block truncate max-w-[160px]">
                      {cust.email}
                    </span>
                    <span className="text-[10px] text-gray-500 font-mono block">
                      {cust.phone}
                    </span>
                  </td>

                  {/* Registration Date */}
                  <td className="py-3.5 px-4 text-gray-600 whitespace-nowrap">
                    {formatDate(cust.registrationDate)}
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4 text-center whitespace-nowrap">
                    <AdminStatusBadge status={cust.status} type="account" />
                  </td>

                  {/* Orders Count */}
                  <td className="py-3.5 px-4 text-center">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gray-100 font-bold text-[11px] text-gray-700">
                      <ShoppingBag className="w-3 h-3 text-gray-500" />
                      <span>{metrics.orderCount}</span>
                    </span>
                  </td>

                  {/* Total Spent */}
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <span className="font-extrabold text-[#103321]">
                      {formatCurrency(metrics.totalSpending)}
                    </span>
                  </td>

                  {/* Last Login */}
                  <td className="py-3.5 px-4 text-gray-500 whitespace-nowrap text-[11px]">
                    {formatDate(cust.lastLogin)}
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      <Link
                        to={`/admin/customers/${cust.id}`}
                        title="View Customer Profile"
                        className="p-1.5 rounded-lg text-gray-500 hover:text-[#103321] hover:bg-gray-100 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>

                      <button
                        type="button"
                        onClick={() => onToggleStatus(cust)}
                        title={isSuspended ? 'Activate Customer Account' : 'Suspend Customer Account'}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                          isSuspended
                            ? 'text-emerald-600 hover:bg-emerald-50'
                            : 'text-gray-400 hover:text-rose-600 hover:bg-rose-50'
                        }`}
                      >
                        {isSuspended ? (
                          <ShieldCheck className="w-4 h-4" />
                        ) : (
                          <ShieldAlert className="w-4 h-4" />
                        )}
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
