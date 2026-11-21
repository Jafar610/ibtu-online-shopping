import { useState, useMemo } from 'react'
import {
  TrendingUp,
  ShoppingBag,
  Coins,
  Shirt,
  Users,
  CreditCard,
  AlertTriangle,
  CheckCircle2,
  Tag,
} from 'lucide-react'
import AdminLayout from '../../components/admin/AdminLayout'
import AdminBreadcrumb from '../../components/admin/AdminBreadcrumb'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import ReportMetricCard from '../../components/admin/ReportMetricCard'
import ReportFilters from '../../components/admin/ReportFilters'
import { getStoredAdminOrders, getStoredAdminPayments } from '../../data/admin/adminSalesData'
import { getStoredInventoryItems } from '../../data/admin/adminInventoryData'
import { getStoredAdminCustomers } from '../../data/admin/adminEngagementData'
import { getStoredAdminCoupons, MOCK_ADMINISTRATION_NOTICE } from '../../data/admin/adminAdministrationData'

export default function AdminReportsPage() {
  const [activeTab, setActiveTab] = useState('overview')
  const [dateRange, setDateRange] = useState('all')
  const [feedback, setFeedback] = useState(null)
  const [isExporting, setIsExporting] = useState(false)

  const showFeedback = (text, type = 'success') => {
    setFeedback({ text, type })
    setTimeout(() => setFeedback(null), 4000)
  }

  // Load underlying datasets
  const allOrders = useMemo(() => getStoredAdminOrders(), [])
  const allPayments = useMemo(() => getStoredAdminPayments(), [])
  const allInventory = useMemo(() => getStoredInventoryItems(), [])
  const allCustomers = useMemo(() => getStoredAdminCustomers(), [])
  const allCoupons = useMemo(() => getStoredAdminCoupons(), [])

  // Filter orders by date range
  const filteredOrders = useMemo(() => {
    if (dateRange === 'all') return allOrders
    const now = new Date()

    return allOrders.filter((order) => {
      const orderDate = new Date(order.createdAt || order.orderDate)
      const diffDays = (now - orderDate) / (1000 * 3600 * 24)

      if (dateRange === 'last30') return diffDays <= 30
      if (dateRange === 'last90') return diffDays <= 90
      if (dateRange === '2026') return orderDate.getFullYear() === 2026
      if (dateRange === '2025') return orderDate.getFullYear() === 2025
      return true
    })
  }, [allOrders, dateRange])

  // Aggregate Executive Summary Metrics
  const summaryMetrics = useMemo(() => {
    const totalRev = filteredOrders
      .filter((o) => o.status !== 'Cancelled')
      .reduce((sum, o) => sum + (Number(o.total) || 0), 0)

    const orderCount = filteredOrders.length
    const aov = orderCount > 0 ? Math.round(totalRev / orderCount) : 0

    const pendingOrders = filteredOrders.filter(
      (o) => o.status === 'Pending' || o.status === 'Confirmed'
    ).length

    const lowStockCount = allInventory.filter(
      (item) => item.status === 'Low Stock' || item.availableStock <= item.lowStockThreshold
    ).length

    const successfulPayments = allPayments.filter(
      (p) => p.status === 'Paid' || p.reviewStatus === 'approved'
    ).length

    return {
      totalRevenue: totalRev,
      totalOrders: orderCount,
      aov,
      pendingOrders,
      lowStockCount,
      successfulPayments,
      totalCustomers: allCustomers.length,
      totalCatalogGarments: allInventory.length,
    }
  }, [filteredOrders, allInventory, allPayments, allCustomers])

  // Sales by Status
  const salesByStatus = useMemo(() => {
    const map = {}
    filteredOrders.forEach((o) => {
      const st = o.status || 'Pending'
      if (!map[st]) map[st] = { count: 0, revenue: 0 }
      map[st].count += 1
      if (st !== 'Cancelled') {
        map[st].revenue += Number(o.total) || 0
      }
    })
    return Object.entries(map).map(([status, data]) => ({
      status,
      count: data.count,
      revenue: data.revenue,
    }))
  }, [filteredOrders])

  // Sales by Payment Method
  const salesByPaymentMethod = useMemo(() => {
    const map = {}
    filteredOrders.forEach((o) => {
      const pm = o.paymentMethod || 'Telebirr'
      if (!map[pm]) map[pm] = { count: 0, revenue: 0 }
      map[pm].count += 1
      map[pm].revenue += Number(o.total) || 0
    })
    return Object.entries(map).map(([method, data]) => ({
      method,
      count: data.count,
      revenue: data.revenue,
    }))
  }, [filteredOrders])

  // Top Products by Sold Quantity & Revenue
  const topProducts = useMemo(() => {
    const map = {}
    filteredOrders.forEach((o) => {
      if (Array.isArray(o.items)) {
        o.items.forEach((item) => {
          const name = item.name || item.title || 'Artisan Kemis'
          const qty = Number(item.quantity) || 1
          const price = Number(item.price) || 0
          if (!map[name]) {
            map[name] = { name, quantitySold: 0, revenue: 0 }
          }
          map[name].quantitySold += qty
          map[name].revenue += qty * price
        })
      }
    })
    return Object.values(map)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 8)
  }, [filteredOrders])

  // Customer Metrics: Repeat vs New
  const customerReportData = useMemo(() => {
    // Count orders per customer email
    const orderCountPerCustomer = {}
    filteredOrders.forEach((o) => {
      const email = o.customerEmail || o.email || 'customer@example.com'
      orderCountPerCustomer[email] = (orderCountPerCustomer[email] || 0) + 1
    })

    const repeatCustomers = Object.values(orderCountPerCustomer).filter((c) => c > 1).length
    const singleOrderCustomers = Object.values(orderCountPerCustomer).filter((c) => c === 1).length

    // Sort customers by spending
    const spendingMap = {}
    filteredOrders.forEach((o) => {
      const email = o.customerEmail || o.email || 'unknown'
      const name = o.customerName || 'Customer'
      if (!spendingMap[email]) {
        spendingMap[email] = { email, name, totalSpent: 0, orderCount: 0 }
      }
      spendingMap[email].totalSpent += Number(o.total) || 0
      spendingMap[email].orderCount += 1
    })

    const topSpenders = Object.values(spendingMap)
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 6)

    return {
      repeatCount: repeatCustomers,
      newCount: singleOrderCustomers,
      topSpenders,
    }
  }, [filteredOrders])

  // CSV Export Handler
  const handleExportCSV = () => {
    setIsExporting(true)
    try {
      let csvRows = []

      if (activeTab === 'sales' || activeTab === 'overview') {
        csvRows.push(['Order ID', 'Date', 'Customer Name', 'Email', 'Payment Method', 'Order Status', 'Total (ETB)'])
        filteredOrders.forEach((o) => {
          csvRows.push([
            o.id || '',
            o.createdAt || o.orderDate || '',
            `"${(o.customerName || '').replace(/"/g, '""')}"`,
            o.customerEmail || '',
            o.paymentMethod || '',
            o.status || '',
            o.total || 0,
          ])
        })
      } else if (activeTab === 'products') {
        csvRows.push(['SKU', 'Product Name', 'Category', 'Physical Stock', 'Reserved Stock', 'Available Stock', 'Stock Status'])
        allInventory.forEach((item) => {
          csvRows.push([
            item.sku || '',
            `"${(item.name || '').replace(/"/g, '""')}"`,
            item.category || '',
            item.physicalStock || 0,
            item.reservedStock || 0,
            item.availableStock || 0,
            item.status || '',
          ])
        })
      } else if (activeTab === 'customers') {
        csvRows.push(['Customer ID', 'Full Name', 'Email', 'Phone', 'Account Status', 'Registration Date'])
        allCustomers.forEach((c) => {
          csvRows.push([
            c.id || '',
            `"${(c.name || '').replace(/"/g, '""')}"`,
            c.email || '',
            c.phone || '',
            c.status || '',
            c.registrationDate || '',
          ])
        })
      } else if (activeTab === 'coupons') {
        csvRows.push(['Coupon Code', 'Description', 'Type', 'Value', 'Min Order (ETB)', 'Redemptions', 'Limit', 'Start Date', 'Expiry Date', 'Status'])
        allCoupons.forEach((cpn) => {
          csvRows.push([
            cpn.code || '',
            `"${(cpn.description || '').replace(/"/g, '""')}"`,
            cpn.type || '',
            cpn.value || 0,
            cpn.minOrderAmount || 0,
            cpn.usageCount || 0,
            cpn.usageLimit || 0,
            cpn.startDate || '',
            cpn.expirationDate || '',
            cpn.isActive ? 'Active' : 'Inactive',
          ])
        })
      }

      const csvContent = csvRows.map((e) => e.join(',')).join('\n')
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.setAttribute('href', url)
      link.setAttribute('download', `ibtu_report_${activeTab}_${dateRange}_${Date.now()}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      showFeedback(`Successfully exported ${activeTab.toUpperCase()} CSV dataset.`)
    } catch (err) {
      console.error('CSV Export Error', err)
      showFeedback('Failed to generate CSV export.', 'error')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Breadcrumb */}
        <AdminBreadcrumb
          items={[
            { label: 'Admin', path: '/admin/dashboard' },
            { label: 'Reports & Analytics' },
          ]}
        />

        {/* Page Header */}
        <AdminPageHeader
          title="Reports & Financial Analytics"
          subtitle="Real-time revenue metrics, inventory health, customer retention, and exportable CSV ledgers."
        />

        {/* Feedback Alert */}
        {feedback && (
          <div
            className={`p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 animate-in fade-in duration-200 ${
              feedback.type === 'error'
                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            }`}
          >
            {feedback.type === 'error' ? (
              <AlertTriangle className="w-4 h-4 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            )}
            {feedback.text}
          </div>
        )}

        {/* Mock Data Notice */}
        <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-600 flex items-center justify-between">
          <span>{MOCK_ADMINISTRATION_NOTICE}</span>
          <span className="font-mono text-[11px] text-gray-400">Aggregated from Mock Store State</span>
        </div>

        {/* Filters and Navigation */}
        <ReportFilters
          activeTab={activeTab}
          onTabChange={setActiveTab}
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          onReset={() => setDateRange('all')}
          onExportCSV={handleExportCSV}
          isExporting={isExporting}
        />

        {/* KPI Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <ReportMetricCard
            title="Total Revenue"
            value={`${summaryMetrics.totalRevenue.toLocaleString()} ETB`}
            subtitle={`${summaryMetrics.totalOrders} total completed orders`}
            trend="+18.4% vs last period"
            icon={Coins}
            colorScheme="green"
          />
          <ReportMetricCard
            title="Average Order Value"
            value={`${summaryMetrics.aov.toLocaleString()} ETB`}
            subtitle="Cart average per order"
            icon={TrendingUp}
            colorScheme="lime"
          />
          <ReportMetricCard
            title="Pending Dispatches"
            value={summaryMetrics.pendingOrders}
            subtitle="Awaiting fulfillment / courier"
            icon={ShoppingBag}
            colorScheme={summaryMetrics.pendingOrders > 5 ? 'amber' : 'default'}
          />
          <ReportMetricCard
            title="Low Stock Garments"
            value={summaryMetrics.lowStockCount}
            subtitle="SKUs below threshold"
            icon={Shirt}
            colorScheme={summaryMetrics.lowStockCount > 0 ? 'rose' : 'default'}
          />
        </div>

        {/* TAB 1: EXECUTIVE SUMMARY */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sales by Order Status */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-6 space-y-4">
              <h3 className="font-bold text-sm text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-[#103321]" />
                Orders Distribution by Pipeline Status
              </h3>
              <div className="space-y-3">
                {salesByStatus.map((item) => {
                  const percent =
                    summaryMetrics.totalOrders > 0
                      ? Math.round((item.count / summaryMetrics.totalOrders) * 100)
                      : 0
                  return (
                    <div key={item.status} className="space-y-1 text-xs">
                      <div className="flex justify-between font-semibold">
                        <span className="text-gray-700">{item.status}</span>
                        <span className="text-gray-900">
                          {item.count} orders ({percent}%) · {item.revenue.toLocaleString()} ETB
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                        <div
                          className="h-full bg-[#103321] rounded-full transition-all"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Sales by Payment Method */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-6 space-y-4">
              <h3 className="font-bold text-sm text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[#103321]" />
                Settlement Volume by Ethiopian Payment Channel
              </h3>
              <div className="space-y-3">
                {salesByPaymentMethod.map((item) => {
                  const percent =
                    summaryMetrics.totalRevenue > 0
                      ? Math.round((item.revenue / summaryMetrics.totalRevenue) * 100)
                      : 0
                  return (
                    <div key={item.method} className="space-y-1 text-xs">
                      <div className="flex justify-between font-semibold">
                        <span className="text-gray-700">{item.method}</span>
                        <span className="text-gray-900">
                          {item.revenue.toLocaleString()} ETB ({percent}%) · {item.count} orders
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                        <div
                          className="h-full bg-[#95C623] rounded-full transition-all"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SALES & REVENUE */}
        {activeTab === 'sales' && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="font-bold text-base text-gray-900">Order Revenue Ledger</h3>
                <p className="text-xs text-gray-500">Filtered orders for current reporting timeframe ({filteredOrders.length} transactions)</p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase">
                    <th className="py-3 px-4">Order ID</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Payment Method</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Order Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs">
                  {filteredOrders.slice(0, 10).map((o) => (
                    <tr key={o.id} className="hover:bg-gray-50">
                      <td className="py-3 px-4 font-mono font-bold text-gray-900">{o.id}</td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-gray-800 block">{o.customerName}</span>
                        <span className="text-gray-400 text-[11px]">{o.customerEmail}</span>
                      </td>
                      <td className="py-3 px-4 text-gray-600">{o.paymentMethod || 'Telebirr'}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-gray-100 text-gray-700">
                          {o.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-black text-gray-900">
                        {Number(o.total || 0).toLocaleString()} ETB
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: PRODUCTS & INVENTORY */}
        {activeTab === 'products' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Best Sellers */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-6 space-y-4">
              <h3 className="font-bold text-base text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
                <Shirt className="w-4 h-4 text-[#103321]" />
                Top Performing Cultural Garments by Revenue
              </h3>
              <div className="divide-y divide-gray-100">
                {topProducts.map((p, idx) => (
                  <div key={p.name} className="py-3 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-gray-100 text-gray-700 font-bold flex items-center justify-center text-[11px]">
                        #{idx + 1}
                      </span>
                      <div>
                        <span className="font-bold text-gray-900 block">{p.name}</span>
                        <span className="text-gray-500 text-[11px]">{p.quantitySold} units sold</span>
                      </div>
                    </div>
                    <span className="font-black text-[#103321]">
                      {p.revenue.toLocaleString()} ETB
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Low & Out of Stock */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-6 space-y-4">
              <h3 className="font-bold text-base text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                Inventory Stock Replenishment Alerts
              </h3>
              <div className="divide-y divide-gray-100">
                {allInventory
                  .filter((item) => item.status === 'Low Stock' || item.status === 'Out of Stock')
                  .slice(0, 6)
                  .map((item) => (
                    <div key={item.id} className="py-3 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-gray-900 block">{item.name}</span>
                        <span className="font-mono text-[11px] text-gray-400">SKU: {item.sku}</span>
                      </div>
                      <div className="text-right">
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          {item.availableStock} Left (Threshold: {item.lowStockThreshold})
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: CUSTOMERS */}
        {activeTab === 'customers' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-6 space-y-4 text-center">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center mx-auto">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-gray-900">Customer Retention Cohorts</h3>
              <div className="pt-2 space-y-3 text-xs">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                  <span className="text-gray-600">Repeat Buyers (&gt;1 Order)</span>
                  <span className="font-black text-emerald-700 text-sm">{customerReportData.repeatCount}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                  <span className="text-gray-600">New First-Time Buyers</span>
                  <span className="font-black text-gray-900 text-sm">{customerReportData.newCount}</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-xs p-6 space-y-4">
              <h3 className="font-bold text-base text-gray-900 border-b border-gray-100 pb-3">
                Top Spending Customers (Lifetime Value)
              </h3>
              <div className="divide-y divide-gray-100">
                {customerReportData.topSpenders.map((c) => (
                  <div key={c.email} className="py-3 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-gray-900 block">{c.name}</span>
                      <span className="text-gray-400 text-[11px]">{c.email} · {c.orderCount} orders</span>
                    </div>
                    <span className="font-black text-[#103321] text-sm">
                      {c.totalSpent.toLocaleString()} ETB
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: COUPONS */}
        {activeTab === 'coupons' && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-6 space-y-4">
            <h3 className="font-bold text-base text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
              <Tag className="w-4 h-4 text-[#103321]" />
              Promotional Coupon Utilization & Redemption Performance
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase">
                    <th className="py-3 px-4">Coupon Code</th>
                    <th className="py-3 px-4">Type & Value</th>
                    <th className="py-3 px-4">Min Order</th>
                    <th className="py-3 px-4">Redemptions</th>
                    <th className="py-3 px-4">Redemption Rate</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs">
                  {allCoupons.map((c) => {
                    const rate = c.usageLimit > 0 ? Math.round((c.usageCount / c.usageLimit) * 100) : 0
                    return (
                      <tr key={c.id} className="hover:bg-gray-50">
                        <td className="py-3 px-4 font-mono font-bold text-gray-900">{c.code}</td>
                        <td className="py-3 px-4">
                          {c.type === 'percent' ? `${c.value}% OFF` : `${c.value} ETB OFF`}
                        </td>
                        <td className="py-3 px-4 text-gray-600">{c.minOrderAmount?.toLocaleString() || 0} ETB</td>
                        <td className="py-3 px-4 font-semibold text-gray-900">{c.usageCount} of {c.usageLimit}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-gray-100 h-1.5 rounded-full overflow-hidden">
                              <div className="bg-[#103321] h-full rounded-full" style={{ width: `${rate}%` }} />
                            </div>
                            <span className="text-[11px] text-gray-500">{rate}%</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            c.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-600'
                          }`}>
                            {c.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
