import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  ArrowLeft,
  User,
  MapPin,
  ShoppingBag,
  CreditCard,
  ShieldAlert,
  ShieldCheck,
  Calendar,
  Clock,
  Mail,
  Phone,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react'
import AdminLayout from '../../components/admin/AdminLayout'
import AdminBreadcrumb from '../../components/admin/AdminBreadcrumb'
import AdminStatusBadge from '../../components/admin/AdminStatusBadge'
import ConfirmActionModal from '../../components/admin/ConfirmActionModal'
import {
  getStoredAdminCustomers,
  updateCustomerStatus,
  getCustomerMetrics,
} from '../../data/admin/adminEngagementData'

export default function AdminCustomerDetailsPage() {
  const { customerId } = useParams()
  const [customer, setCustomer] = useState(null)
  const [statusModalOpen, setStatusModalOpen] = useState(false)
  const [feedback, setFeedback] = useState(null)

  const showFeedback = (msg, type = 'success') => {
    setFeedback({ msg, type })
    setTimeout(() => setFeedback(null), 4000)
  }

  const loadCustomer = () => {
    const list = getStoredAdminCustomers()
    const found = list.find((c) => c.id === customerId)
    setCustomer(found || null)
  }

  useEffect(() => {
    loadCustomer()
  }, [customerId])

  if (!customer) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <AdminBreadcrumb
            items={[
              { label: 'Customers & Engagement' },
              { label: 'Customers', path: '/admin/customers' },
              { label: 'Not Found' },
            ]}
          />
          <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h2 className="font-serif font-bold text-xl text-[#103321]">
              Customer Profile Not Found
            </h2>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              No customer record matching identifier "{customerId}" was found in local storage.
            </p>
            <Link
              to="/admin/customers"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#103321] text-white text-xs font-bold hover:bg-[#103321]/90"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Customers</span>
            </Link>
          </div>
        </div>
      </AdminLayout>
    )
  }

  const metrics = getCustomerMetrics(customer.id, customer.email)
  const isSuspended = customer.status === 'Suspended'

  const formatCurrency = (val) =>
    new Intl.NumberFormat('en-ET', { style: 'currency', currency: 'ETB', maximumFractionDigits: 0 }).format(val || 0)

  const formatDate = (isoStr) => {
    if (!isoStr) return 'N/A'
    try {
      return new Date(isoStr).toLocaleDateString('en-US', {
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

  const handleToggleStatusCommit = () => {
    const nextStatus = isSuspended ? 'Active' : 'Suspended'
    const res = updateCustomerStatus(customer.id, nextStatus)
    if (res.success) {
      loadCustomer()
      setStatusModalOpen(false)
      showFeedback(`Customer account status updated to "${nextStatus}".`)
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Breadcrumb Navigation */}
        <AdminBreadcrumb
          items={[
            { label: 'Customers & Engagement' },
            { label: 'Customers', path: '/admin/customers' },
            { label: customer.name },
          ]}
        />

        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              to="/admin/customers"
              className="p-2 rounded-xl border border-gray-200 hover:bg-white text-gray-600 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="font-serif font-extrabold text-2xl text-[#103321]">
                  {customer.name}
                </h1>
                <AdminStatusBadge status={customer.status} type="account" />
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#103321]/10 text-[#103321]">
                  {customer.accountType || 'Registered Customer'}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Customer ID: <span className="font-mono font-bold text-gray-700">{customer.id}</span> • Member since {formatDate(customer.registrationDate)}
              </p>
            </div>
          </div>

          {/* Action: Activate / Suspend */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setStatusModalOpen(true)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer ${
                isSuspended
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'border border-rose-200 text-rose-700 hover:bg-rose-50'
              }`}
            >
              {isSuspended ? (
                <>
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Reactivate Account</span>
                </>
              ) : (
                <>
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Suspend Account</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl text-xs font-semibold flex items-center justify-between shadow-xs animate-fadeIn">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#95C623]" />
              <span>{feedback.msg}</span>
            </div>
            <button
              type="button"
              onClick={() => setFeedback(null)}
              className="text-gray-400 hover:text-gray-600 font-bold"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column (2 cols): Order History & Address Book */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order History */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-xs overflow-hidden">
              <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-[#103321]" />
                  <h3 className="font-serif font-bold text-base text-[#103321]">
                    Customer Order History ({metrics.orderCount})
                  </h3>
                </div>
                <span className="text-[11px] text-gray-400">
                  Aggregated from sales ledger
                </span>
              </div>

              {metrics.orders.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {metrics.orders.map((ord) => (
                    <div
                      key={ord.id}
                      className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-gray-50/70 transition-colors"
                    >
                      <div className="space-y-1">
                        <Link
                          to={`/admin/orders/${ord.id}`}
                          className="font-bold text-xs text-[#103321] hover:text-[#95C623] inline-flex items-center gap-1 font-mono"
                        >
                          <span>{ord.orderNumber}</span>
                          <ExternalLink className="w-3 h-3 text-gray-400" />
                        </Link>
                        <span className="text-[11px] text-gray-500 block">
                          Placed on {formatDate(ord.orderDate)}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="font-extrabold text-xs text-[#103321] block">
                            {formatCurrency(ord.totalAmount)}
                          </span>
                          <span className="text-[10px] text-gray-400 block">
                            {ord.items?.length || 1} items
                          </span>
                        </div>

                        <div className="flex flex-col items-end gap-1">
                          <AdminStatusBadge status={ord.orderStatus} type="order" />
                          <AdminStatusBadge status={ord.paymentStatus} type="payment" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-xs text-gray-500">
                  No orders have been placed by this customer yet.
                </div>
              )}
            </div>

            {/* Saved Delivery Addresses */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-xs p-5 sm:p-6 space-y-4">
              <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                <MapPin className="w-4 h-4 text-[#103321]" />
                <h3 className="font-serif font-bold text-base text-[#103321]">
                  Customer Address Book ({customer.addresses?.length || 0})
                </h3>
              </div>

              {customer.addresses && customer.addresses.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {customer.addresses.map((addr) => (
                    <div
                      key={addr.id}
                      className="p-4 rounded-2xl border border-gray-200 bg-gray-50/60 space-y-2 text-xs relative"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-gray-900">
                          {addr.recipientName}
                        </span>
                        {addr.isDefault && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#103321] text-white">
                            Default
                          </span>
                        )}
                      </div>

                      <div className="text-gray-600 space-y-0.5">
                        <p>{addr.addressLine1}</p>
                        {addr.addressLine2 && <p>{addr.addressLine2}</p>}
                        <p>
                          {addr.city}, {addr.region}
                        </p>
                        <p className="text-gray-500 font-mono text-[11px] pt-1">
                          Phone: {addr.phone}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center text-xs text-gray-500 bg-gray-50 rounded-2xl">
                  No delivery addresses saved for this customer profile.
                </div>
              )}
            </div>
          </div>

          {/* Right Column (1 col): Personal Profile & Spending Summary */}
          <div className="space-y-6">
            {/* Personal Profile Specs */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-xs p-5 sm:p-6 space-y-4">
              <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                <User className="w-4 h-4 text-[#103321]" />
                <h3 className="font-serif font-bold text-base text-[#103321]">
                  Personal Profile
                </h3>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                    Full Name
                  </span>
                  <span className="font-bold text-gray-900 text-sm">
                    {customer.firstName} {customer.lastName}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                    Email Address
                  </span>
                  <span className="text-gray-800 break-all font-medium">
                    {customer.email}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                    Contact Phone
                  </span>
                  <span className="text-gray-800 font-mono font-medium">
                    {customer.phone}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                    Registration Date
                  </span>
                  <span className="text-gray-700">
                    {formatDate(customer.registrationDate)}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                    Last Login Activity
                  </span>
                  <span className="text-gray-700">
                    {formatDate(customer.lastLogin)}
                  </span>
                </div>
              </div>
            </div>

            {/* Lifetime Spending Card */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-xs p-5 sm:p-6 space-y-3">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                Lifetime Value (LTV)
              </span>

              <div className="space-y-1">
                <span className="text-2xl font-extrabold text-[#103321] block">
                  {formatCurrency(metrics.totalSpending)}
                </span>
                <span className="text-xs text-gray-500 block">
                  Across {metrics.orderCount} total orders
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Toggle Status Confirmation Modal */}
        <ConfirmActionModal
          isOpen={statusModalOpen}
          title={
            isSuspended
              ? `Reactivate account for ${customer.name}?`
              : `Suspend account for ${customer.name}?`
          }
          description={
            isSuspended
              ? 'This will restore full shopping, checkout, and login permissions for this customer.'
              : 'This will temporarily restrict this customer from logging into the storefront or placing orders.'
          }
          warning="This action modifies simulated frontend mock state."
          actionType={isSuspended ? 'success' : 'danger'}
          confirmText={isSuspended ? 'Reactivate Customer' : 'Confirm Suspension'}
          onConfirm={handleToggleStatusCommit}
          onCancel={() => setStatusModalOpen(false)}
        />
      </div>
    </AdminLayout>
  )
}
