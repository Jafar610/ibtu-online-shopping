import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Search, Filter, ShoppingBag, ArrowUpDown, X, Package } from 'lucide-react'
import CustomerLayout from '../../components/customer/CustomerLayout'
import OrderCard from '../../components/customer/OrderCard'
import { getStoredOrders } from '../../data/customerData'

const FILTER_TABS = [
  { key: 'all', label: 'All Orders' },
  { key: 'pending', label: 'Pending' },
  { key: 'processing', label: 'Processing' },
  { key: 'shipped', label: 'Shipped' },
  { key: 'delivered', label: 'Delivered' },
  { key: 'cancelled', label: 'Cancelled' },
]

export default function OrdersPage() {
  const [orders] = useState(() => getStoredOrders())
  const [activeTab, setActiveTab] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortOrder, setSortOrder] = useState('newest') // 'newest' | 'oldest'

  // Filter and sort orders
  const filteredOrders = useMemo(() => {
    return orders
      .filter((order) => {
        // Tab filter
        if (activeTab !== 'all') {
          if (order.orderStatus.toLowerCase() !== activeTab.toLowerCase()) {
            return false
          }
        }

        // Search query filter (by orderNumber or product names)
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim()
          const matchesNumber = order.orderNumber.toLowerCase().includes(q)
          const matchesItem = order.items?.some((item) =>
            item.name.toLowerCase().includes(q)
          )
          if (!matchesNumber && !matchesItem) return false
        }

        return true
      })
      .sort((a, b) => {
        const dateA = new Date(a.orderDate).getTime()
        const dateB = new Date(b.orderDate).getTime()
        return sortOrder === 'newest' ? dateB - dateA : dateA - dateB
      })
  }, [orders, activeTab, searchQuery, sortOrder])

  const handleClearFilters = () => {
    setActiveTab('all')
    setSearchQuery('')
    setSortOrder('newest')
  }

  const isFiltering = activeTab !== 'all' || searchQuery.trim() !== ''

  return (
    <CustomerLayout
      activeNav="orders"
      title="My Order History"
      subtitle="Track your shipments, review past Ethiopian artisan purchases, and manage orders."
      breadcrumbs={[
        { label: 'Home', path: '/' },
        { label: 'My Account', path: '/account' },
        { label: 'My Orders' },
      ]}
      action={
        <Link
          to="/shop"
          className="px-4 py-2.5 rounded-xl bg-[#103321] hover:bg-[#95C623] text-white hover:text-[#103321] text-xs font-bold transition-all shadow-sm flex items-center gap-2"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Browse Products</span>
        </Link>
      }
    >
      <div className="space-y-6">
        {/* Controls: Filter Tabs, Search & Sort */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-xs space-y-4">
          {/* Status Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-gray-100 scrollbar-none">
            {FILTER_TABS.map((tab) => {
              const count =
                tab.key === 'all'
                  ? orders.length
                  : orders.filter((o) => o.orderStatus.toLowerCase() === tab.key.toLowerCase()).length

              const isActive = activeTab === tab.key

              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                    isActive
                      ? 'bg-[#103321] text-white shadow-xs'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isActive ? 'bg-[#95C623] text-[#103321]' : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Search bar and Sort dropdown */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by order # (e.g. IBTU-8841)..."
                className="w-full pl-9 pr-8 py-2 rounded-xl border border-gray-200 text-xs focus:outline-hidden focus:border-[#103321] focus:ring-1 focus:ring-[#103321] bg-gray-50/50"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
              {isFiltering && (
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="text-xs font-bold text-red-600 hover:text-red-700 hover:underline cursor-pointer flex items-center gap-1"
                >
                  <X className="w-3 h-3" />
                  <span>Clear Filters</span>
                </button>
              )}

              <div className="flex items-center gap-2">
                <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-gray-200 bg-white text-xs font-medium text-gray-700 focus:outline-hidden focus:border-[#103321] cursor-pointer"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Orders Listing */}
        {filteredOrders.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-gray-100 shadow-xs space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 text-gray-400 mx-auto flex items-center justify-center">
              <Package className="w-8 h-8" />
            </div>
            <div className="max-w-md mx-auto space-y-1">
              <h3 className="font-serif font-bold text-lg text-[#103321]">
                {orders.length === 0
                  ? 'No Orders Placed Yet'
                  : 'No Orders Match Your Criteria'}
              </h3>
              <p className="text-xs text-gray-500">
                {orders.length === 0
                  ? 'Discover handcrafted Ethiopian cultural garments, traditional Habesha dresses, and artisan creations.'
                  : `We could not find any orders matching "${searchQuery || activeTab}". Try adjusting your filters or search keywords.`}
              </p>
            </div>

            {orders.length === 0 ? (
              <Link
                to="/shop"
                className="px-5 py-2.5 rounded-xl bg-[#103321] hover:bg-[#95C623] hover:text-[#103321] text-white text-xs font-bold transition-all inline-flex items-center gap-2 shadow-xs"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Start Shopping</span>
              </Link>
            ) : (
              <button
                type="button"
                onClick={handleClearFilters}
                className="px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-bold transition-colors cursor-pointer"
              >
                Reset Search Filters
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </div>
    </CustomerLayout>
  )
}
