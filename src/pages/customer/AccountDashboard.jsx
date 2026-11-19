import { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Package,
  Clock,
  CheckCircle2,
  MapPin,
  ShoppingBag,
  User,
  ArrowRight,
  Eye,
  Calendar,
  Sparkles,
} from 'lucide-react'
import CustomerLayout from '../../components/customer/CustomerLayout'
import AccountStatCard from '../../components/customer/AccountStatCard'
import OrderStatusBadge from '../../components/customer/OrderStatusBadge'
import { useAuth } from '../../context/AuthContext'
import { getStoredOrders, getStoredAddresses } from '../../data/customerData'

export default function AccountDashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()

  // Retrieve customer data from local store
  const [orders] = useState(() => getStoredOrders())
  const [addresses] = useState(() => getStoredAddresses())

  // Dynamic Statistics
  const stats = useMemo(() => {
    const totalOrders = orders.length
    const pendingOrders = orders.filter(
      (o) =>
        o.orderStatus?.toLowerCase() === 'pending' ||
        o.orderStatus?.toLowerCase() === 'processing' ||
        o.orderStatus?.toLowerCase() === 'shipped' ||
        o.orderStatus?.toLowerCase() === 'in transit'
    ).length
    const completedOrders = orders.filter(
      (o) => o.orderStatus?.toLowerCase() === 'delivered'
    ).length
    const savedAddressesCount = addresses.length

    return {
      totalOrders,
      pendingOrders,
      completedOrders,
      savedAddressesCount,
    }
  }, [orders, addresses])

  // Recent 3 orders sorted by date
  const recentOrders = useMemo(() => {
    return [...orders]
      .sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate))
      .slice(0, 3)
  }, [orders])

  const firstName = user?.firstName || user?.name?.split(' ')[0] || 'Customer'

  return (
    <CustomerLayout
      title="Customer Account Overview"
      subtitle="Welcome to your personal IBTU cultural shopping sanctuary."
      breadcrumbs={[]}
    >
      <div className="space-y-8">
        {/* Welcome Banner */}
        <div className="bg-[#103321] text-white p-6 sm:p-8 rounded-3xl relative overflow-hidden shadow-sm">
          {/* Subtle Tibeb Background Pattern */}
          <div className="absolute inset-0 opacity-10 bg-tibeb-pattern pointer-events-none" />
          <div className="absolute -top-16 -right-16 w-60 h-60 rounded-full bg-[#95C623]/20 blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-xs font-bold text-[#95C623] border border-[#95C623]/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>እደ-ጥበብ • Cultural Artisan Fashion</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-extrabold text-white">
              Welcome back, {firstName}!
            </h2>
            <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
              From your customer dashboard, you can track shipments, view your orders, and manage your delivery addresses.
            </p>
          </div>
        </div>

        {/* 4 Summary Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <AccountStatCard
            title="Total Orders"
            value={stats.totalOrders}
            icon={Package}
            to="/account/orders"
            accentColor="forest"
            description="All orders placed"
          />
          <AccountStatCard
            title="In Progress"
            value={stats.pendingOrders}
            icon={Clock}
            to="/account/orders"
            accentColor="amber"
            description="Pending or in transit"
          />
          <AccountStatCard
            title="Completed"
            value={stats.completedOrders}
            icon={CheckCircle2}
            to="/account/orders"
            accentColor="lime"
            description="Successfully delivered"
          />
          <AccountStatCard
            title="Saved Addresses"
            value={stats.savedAddressesCount}
            icon={MapPin}
            to="/account/addresses"
            accentColor="blue"
            description="Shipping destinations"
          />
        </div>

        {/* Recent Orders Section */}
        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div>
              <h3 className="font-serif text-lg font-bold text-[#103321]">
                Recent Orders
              </h3>
              <p className="text-xs text-gray-500">
                Latest updates on your handcrafted garments
              </p>
            </div>

            {orders.length > 0 && (
              <Link
                to="/account/orders"
                className="text-xs font-bold text-[#103321] hover:text-[#95C623] flex items-center gap-1 transition-colors"
              >
                <span>View All Orders</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>

          {recentOrders.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <div className="w-14 h-14 rounded-full bg-gray-100 text-gray-400 mx-auto flex items-center justify-center">
                <Package className="w-7 h-7" />
              </div>
              <h4 className="font-serif font-bold text-base text-[#103321]">
                No Orders Placed Yet
              </h4>
              <p className="text-xs text-gray-500 max-w-xs mx-auto">
                Explore our catalog of authentic handspun Habesha Kemis, men&apos;s attire, and jewelry to make your first order.
              </p>
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#103321] text-white font-bold text-xs hover:bg-[#95C623] hover:text-[#103321] transition-colors"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Start Shopping</span>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="pb-3">Order Number</th>
                    <th className="pb-3">Date</th>
                    <th className="pb-3">Total Amount</th>
                    <th className="pb-3">Payment</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {recentOrders.map((order) => {
                    const formattedDate = new Date(order.orderDate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })

                    return (
                      <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="py-3.5 font-mono font-bold text-[#103321]">
                          <Link
                            to={`/account/orders/${order.id}`}
                            className="hover:underline hover:text-[#95C623]"
                          >
                            {order.orderNumber}
                          </Link>
                        </td>
                        <td className="py-3.5 text-gray-500">{formattedDate}</td>
                        <td className="py-3.5 font-bold text-[#103321]">
                          {order.totalAmount.toLocaleString()} ETB
                        </td>
                        <td className="py-3.5">
                          <OrderStatusBadge status={order.paymentStatus} type="payment" />
                        </td>
                        <td className="py-3.5">
                          <OrderStatusBadge status={order.orderStatus} type="order" />
                        </td>
                        <td className="py-3.5 text-right">
                          <button
                            type="button"
                            onClick={() => navigate(`/account/orders/${order.id}`)}
                            className="inline-flex items-center gap-1 text-xs font-bold text-[#103321] hover:text-[#95C623] p-1 cursor-pointer transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Details</span>
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Quick Actions Grid */}
        <div>
          <h3 className="font-serif text-lg font-bold text-[#103321] mb-3">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              to="/shop"
              className="p-4 rounded-2xl bg-white border border-gray-100 hover:border-[#95C623]/50 shadow-xs hover:shadow-md transition-all group flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#103321] text-[#95C623] flex items-center justify-center shrink-0">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-gray-900 group-hover:text-[#103321]">
                    Browse Products
                  </h4>
                  <p className="text-[11px] text-gray-400">Shop new arrivals</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[#95C623] group-hover:translate-x-1 transition-all" />
            </Link>

            <Link
              to="/account/profile"
              className="p-4 rounded-2xl bg-white border border-gray-100 hover:border-[#95C623]/50 shadow-xs hover:shadow-md transition-all group flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#103321] text-[#95C623] flex items-center justify-center shrink-0">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-gray-900 group-hover:text-[#103321]">
                    Manage Profile
                  </h4>
                  <p className="text-[11px] text-gray-400">Edit contact details</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[#95C623] group-hover:translate-x-1 transition-all" />
            </Link>

            <Link
              to="/account/addresses"
              className="p-4 rounded-2xl bg-white border border-gray-100 hover:border-[#95C623]/50 shadow-xs hover:shadow-md transition-all group flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#103321] text-[#95C623] flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-gray-900 group-hover:text-[#103321]">
                    Manage Addresses
                  </h4>
                  <p className="text-[11px] text-gray-400">Delivery locations</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[#95C623] group-hover:translate-x-1 transition-all" />
            </Link>

            <Link
              to="/account/orders"
              className="p-4 rounded-2xl bg-white border border-gray-100 hover:border-[#95C623]/50 shadow-xs hover:shadow-md transition-all group flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#103321] text-[#95C623] flex items-center justify-center shrink-0">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-gray-900 group-hover:text-[#103321]">
                    All Orders
                  </h4>
                  <p className="text-[11px] text-gray-400">History & tracking</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[#95C623] group-hover:translate-x-1 transition-all" />
            </Link>
          </div>
        </div>
      </div>
    </CustomerLayout>
  )
}
