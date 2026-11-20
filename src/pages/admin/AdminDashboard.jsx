import { Calendar, ShieldAlert, Sparkles, ExternalLink } from 'lucide-react'
import AdminLayout from '../../components/admin/AdminLayout'
import AdminStatCard from '../../components/admin/AdminStatCard'
import SalesOverviewChart from '../../components/admin/SalesOverviewChart'
import AdminQuickAction from '../../components/admin/AdminQuickAction'
import AdminRecentOrders from '../../components/admin/AdminRecentOrders'
import AdminRecentActivities from '../../components/admin/AdminRecentActivities'
import {
  adminSummaryStats,
  SAMPLE_DATA_NOTICE,
} from '../../data/admin/adminDashboardMockData'
import { useAuth } from '../../context/AuthContext'

export default function AdminDashboard() {
  const { user } = useAuth()
  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  const roleName = user?.role === 'data_encoder' ? 'Data Encoder' : 'Administrator'
  const isDataEncoder = user?.role === 'data_encoder'

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* 1. Welcome Banner */}
        <div className="p-6 sm:p-8 rounded-3xl bg-radial from-[#103321] to-[#0b2417] text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-[#95C623]/20 rounded-full blur-2xl pointer-events-none" />

          <div className="space-y-2 z-10">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#95C623] text-[#103321]">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Control Console</span>
              </span>
              <span className="text-xs text-gray-300 font-medium flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[#95C623]" />
                <span>{todayFormatted}</span>
              </span>
            </div>

            <h1 className="font-serif font-extrabold text-2xl sm:text-3xl text-white tracking-tight">
              Welcome back, {user?.name || user?.firstName || 'Administrator'}!
            </h1>
            <p className="text-xs sm:text-sm text-gray-300 max-w-xl leading-relaxed">
              Overview of catalog fulfillment, customer orders, and artisan fashion collections for the IBTU Ethiopian e-commerce platform.
            </p>
          </div>

          <div className="z-10 shrink-0">
            <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/10 text-xs space-y-1">
              <span className="text-gray-300 block text-[11px]">Active Session Role</span>
              <span className="font-bold text-[#95C623] text-sm block">
                {roleName} Privileges
              </span>
              <span className="text-[10px] text-gray-400 block">
                {isDataEncoder ? 'Catalog & Inventory Scope' : 'Full Store Control'}
              </span>
            </div>
          </div>
        </div>

        {/* Development Data Notice */}
        <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-800 flex items-start gap-2.5">
          <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-bold">Development Demonstration: </span>
            <span>{SAMPLE_DATA_NOTICE}</span>
          </div>
        </div>

        {/* 2. Key Metrics Statistics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {adminSummaryStats.map((stat) => (
            <AdminStatCard
              key={stat.id}
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
              trend={stat.trend}
              trendDirection={stat.trendDirection}
              description={stat.description}
              color={stat.color}
            />
          ))}
        </div>

        {/* 3. Sales Performance Chart */}
        <SalesOverviewChart />

        {/* 4. Quick Actions */}
        <AdminQuickAction />

        {/* 5. 2-Column Split: Recent Orders & System Activities */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Recent Orders (7 cols) */}
          <div className="lg:col-span-7">
            <AdminRecentOrders />
          </div>

          {/* Right Column: System Activities (5 cols) */}
          <div className="lg:col-span-5">
            <AdminRecentActivities />
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
