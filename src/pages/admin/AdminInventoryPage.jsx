import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Boxes,
  ScrollText,
  SlidersHorizontal,
  CheckCircle2,
  X,
  AlertTriangle,
  Lock,
  Package,
} from 'lucide-react'
import AdminLayout from '../../components/admin/AdminLayout'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import AdminStatusBadge from '../../components/admin/AdminStatusBadge'
import InventorySummaryCard from '../../components/admin/InventorySummaryCard'
import InventoryFilters from '../../components/admin/InventoryFilters'
import StockAdjustmentModal from '../../components/admin/StockAdjustmentModal'
import {
  getStoredInventoryItems,
  recordStockAdjustment,
} from '../../data/admin/adminInventoryData'
import { getStoredAdminCategories } from '../../data/admin/adminCatalogData'
import { useAuth } from '../../context/AuthContext'

export default function AdminInventoryPage() {
  const { user } = useAuth()
  const [inventoryItems, setInventoryItems] = useState(() => getStoredInventoryItems())
  const [categories] = useState(() => getStoredAdminCategories())

  // Filters State
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedStockStatus, setSelectedStockStatus] = useState('all')
  const [selectedSize, setSelectedSize] = useState('all')
  const [viewMode, setViewMode] = useState('all') // 'all' | 'low_stock'
  const [sortOption, setSortOption] = useState('available-asc')

  // Modals & Feedback
  const [adjustingItem, setAdjustingItem] = useState(null)
  const [feedback, setFeedback] = useState(null)

  const showFeedback = (type, message) => {
    setFeedback({ type, message })
    setTimeout(() => setFeedback(null), 4000)
  }

  // Available Sizes for dropdown
  const availableSizes = useMemo(() => {
    return [...new Set(inventoryItems.map((i) => i.size))].filter(Boolean)
  }, [inventoryItems])

  // Summary Metrics Calculations (Strictly: Available = Physical - Reserved)
  const summaryMetrics = useMemo(() => {
    const totalVariants = inventoryItems.length
    const totalPhysical = inventoryItems.reduce((sum, i) => sum + i.physicalStock, 0)
    const totalReserved = inventoryItems.reduce((sum, i) => sum + i.reservedStock, 0)
    const totalAvailable = totalPhysical - totalReserved

    const lowStockCount = inventoryItems.filter(
      (i) => i.availableStock > 0 && i.availableStock <= i.lowStockThreshold
    ).length

    const outOfStockCount = inventoryItems.filter((i) => i.availableStock <= 0).length

    return {
      totalVariants,
      totalPhysical,
      totalReserved,
      totalAvailable,
      lowStockCount,
      outOfStockCount,
    }
  }, [inventoryItems])

  // Filter & Sort Items
  const filteredItems = useMemo(() => {
    return inventoryItems.filter((item) => {
      // 1. View Mode (Low Stock Focus)
      if (viewMode === 'low_stock') {
        if (item.availableStock > item.lowStockThreshold) return false
      }

      // 2. Search filter (Product name or SKU)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim()
        const matchesName = item.productName?.toLowerCase().includes(q)
        const matchesSku = item.sku?.toLowerCase().includes(q)
        if (!matchesName && !matchesSku) return false
      }

      // 3. Category filter
      if (selectedCategory !== 'all') {
        if (item.category !== selectedCategory) return false
      }

      // 4. Stock status filter
      if (selectedStockStatus !== 'all') {
        if (item.stockStatus !== selectedStockStatus) return false
      }

      // 5. Size filter
      if (selectedSize !== 'all') {
        if (item.size !== selectedSize) return false
      }

      return true
    }).sort((a, b) => {
      if (sortOption === 'available-asc') return a.availableStock - b.availableStock
      if (sortOption === 'available-desc') return b.availableStock - a.availableStock
      if (sortOption === 'physical-desc') return b.physicalStock - a.physicalStock
      if (sortOption === 'name-asc') return a.productName.localeCompare(b.productName)
      return 0
    })
  }, [inventoryItems, viewMode, searchQuery, selectedCategory, selectedStockStatus, selectedSize, sortOption])

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    selectedCategory !== 'all' ||
    selectedStockStatus !== 'all' ||
    selectedSize !== 'all' ||
    viewMode !== 'all'

  const handleClearFilters = () => {
    setSearchQuery('')
    setSelectedCategory('all')
    setSelectedStockStatus('all')
    setSelectedSize('all')
    setViewMode('all')
    setSortOption('available-asc')
  }

  // Stock Adjustment Handler
  const handleSaveAdjustment = (adjustmentPayload) => {
    try {
      const actorName = user?.name || user?.firstName || 'System Administrator'
      const res = recordStockAdjustment({
        ...adjustmentPayload,
        userDisplayName: actorName,
      })

      if (res.success) {
        // Refresh items
        const refreshed = getStoredInventoryItems()
        setInventoryItems(refreshed)
        setAdjustingItem(null)
        showFeedback(
          'success',
          `Adjustment recorded for SKU ${res.movement.sku}: Physical stock updated from ${res.quantityBefore} to ${res.quantityAfter}.`
        )
      }
    } catch (err) {
      showFeedback('error', err.message || 'Failed to record stock adjustment.')
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <AdminPageHeader
          title="Inventory Management & Control"
          description="Monitor physical stock levels, track pending customer order reservations, and record stock movements."
          breadcrumbs={[{ label: 'Inventory' }]}
          badge={`${summaryMetrics.totalVariants} Variants`}
          action={
            <div className="flex items-center gap-2">
              <Link
                to="/admin/inventory/movements"
                className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer"
              >
                <ScrollText className="w-4 h-4 text-[#95C623]" />
                <span>Movement Audit Logs</span>
              </Link>
            </div>
          }
        />

        {/* Feedback Alert */}
        {feedback && (
          <div
            className={`p-4 rounded-2xl border flex items-center justify-between gap-3 text-xs font-medium animate-fadeIn ${
              feedback.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-rose-50 text-rose-800 border-rose-200'
            }`}
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{feedback.message}</span>
            </div>
            <button
              type="button"
              onClick={() => setFeedback(null)}
              className="text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* 1. Summary KPI Metrics Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <InventorySummaryCard
            title="Total Variants"
            value={summaryMetrics.totalVariants}
            subtitle="Across all categories"
            iconType="variants"
            color="forest"
          />

          <InventorySummaryCard
            title="Physical Stock"
            value={summaryMetrics.totalPhysical}
            subtitle="Warehouse total units"
            iconType="physical"
            color="blue"
          />

          <InventorySummaryCard
            title="Reserved Stock"
            value={summaryMetrics.totalReserved}
            subtitle="Pending customer orders"
            iconType="reserved"
            color="purple"
          />

          <InventorySummaryCard
            title="Available Stock"
            value={summaryMetrics.totalAvailable}
            subtitle="Physical - Reserved"
            iconType="available"
            color="emerald"
          />

          <InventorySummaryCard
            title="Low Stock Alerts"
            value={summaryMetrics.lowStockCount}
            subtitle="At or below threshold"
            iconType="low_stock"
            color="amber"
            highlight={summaryMetrics.lowStockCount > 0}
            onClick={() => setViewMode('low_stock')}
          />

          <InventorySummaryCard
            title="Out of Stock"
            value={summaryMetrics.outOfStockCount}
            subtitle="Zero available units"
            iconType="out_of_stock"
            color="rose"
            highlight={summaryMetrics.outOfStockCount > 0}
            onClick={() => {
              setViewMode('all')
              setSelectedStockStatus('Out of Stock')
            }}
          />
        </div>

        {/* 2. Filters & View Mode */}
        <InventoryFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          categories={categories}
          selectedStockStatus={selectedStockStatus}
          onStockStatusChange={setSelectedStockStatus}
          selectedSize={selectedSize}
          onSizeChange={setSelectedSize}
          availableSizes={availableSizes}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          sortOption={sortOption}
          onSortChange={setSortOption}
          onClearFilters={handleClearFilters}
          hasActiveFilters={hasActiveFilters}
          lowStockCount={summaryMetrics.lowStockCount + summaryMetrics.outOfStockCount}
        />

        {/* 3. Inventory Table */}
        {filteredItems.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-gray-100 shadow-xs space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 text-gray-400 mx-auto flex items-center justify-center">
              <Boxes className="w-8 h-8" />
            </div>
            <div className="max-w-md mx-auto space-y-1">
              <h3 className="font-serif font-bold text-lg text-[#103321]">
                No Inventory Variants Match Filter
              </h3>
              <p className="text-xs text-gray-500">
                Adjust your filters, clear search terms, or switch back to the full inventory view.
              </p>
            </div>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 text-xs font-bold text-gray-700 transition-colors"
              >
                Reset Filters
              </button>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[850px]">
                <thead className="bg-[#103321]/5 text-[#103321] border-b border-gray-100 uppercase font-bold text-[10px] tracking-wider">
                  <tr>
                    <th className="px-5 py-3.5">Product & SKU</th>
                    <th className="px-5 py-3.5">Variant Specs</th>
                    <th className="px-5 py-3.5 text-center">Physical</th>
                    <th className="px-5 py-3.5 text-center">Reserved</th>
                    <th className="px-5 py-3.5 text-center">Available</th>
                    <th className="px-5 py-3.5 text-center">Threshold</th>
                    <th className="px-5 py-3.5">Stock Status</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-700">
                  {filteredItems.map((item) => (
                    <tr
                      key={item.id}
                      className={`hover:bg-gray-50/70 transition-colors ${
                        item.stockStatus === 'Low Stock'
                          ? 'bg-amber-50/20'
                          : item.stockStatus === 'Out of Stock'
                          ? 'bg-rose-50/20'
                          : ''
                      }`}
                    >
                      {/* Product & SKU */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-13 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 shrink-0">
                            <img
                              src={item.productImage}
                              alt={item.productName}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <span className="font-serif font-bold text-xs text-[#103321] block leading-tight">
                              {item.productName}
                            </span>
                            <span className="font-mono text-[10px] text-gray-500 font-bold block mt-0.5">
                              {item.sku}
                            </span>
                            <span className="text-[10px] text-gray-400 capitalize block">
                              {item.category?.replace('-', ' ')}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Variant Specs */}
                      <td className="px-5 py-3.5">
                        <div className="space-y-0.5">
                          <span className="font-bold text-gray-800 block">
                            Size: {item.size}
                          </span>
                          <span className="text-gray-500 text-[11px] block">
                            Color: {item.color}
                          </span>
                        </div>
                      </td>

                      {/* Physical Stock */}
                      <td className="px-5 py-3.5 text-center font-bold text-gray-800">
                        {item.physicalStock}
                      </td>

                      {/* Reserved Stock */}
                      <td className="px-5 py-3.5 text-center">
                        <span
                          className={`inline-flex items-center gap-1 font-bold ${
                            item.reservedStock > 0 ? 'text-purple-700' : 'text-gray-400'
                          }`}
                        >
                          {item.reservedStock > 0 && <Lock className="w-3 h-3 text-purple-500" />}
                          <span>{item.reservedStock}</span>
                        </span>
                      </td>

                      {/* Available Stock */}
                      <td className="px-5 py-3.5 text-center">
                        <span
                          className={`font-serif font-extrabold text-sm ${
                            item.availableStock <= 0
                              ? 'text-rose-600'
                              : item.availableStock <= item.lowStockThreshold
                              ? 'text-amber-600'
                              : 'text-emerald-700'
                          }`}
                        >
                          {item.availableStock}
                        </span>
                      </td>

                      {/* Low Stock Threshold */}
                      <td className="px-5 py-3.5 text-center text-gray-500 text-[11px] font-mono">
                        {item.lowStockThreshold}
                      </td>

                      {/* Status Badge */}
                      <td className="px-5 py-3.5">
                        <AdminStatusBadge status={item.stockStatus} type="stock" />
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3.5 text-right">
                        <button
                          type="button"
                          onClick={() => setAdjustingItem(item)}
                          className="px-3 py-1.5 rounded-xl border border-gray-200 bg-white hover:bg-[#103321] hover:text-white text-[#103321] text-xs font-bold transition-all shadow-2xs inline-flex items-center gap-1.5 cursor-pointer"
                          title="Record stock adjustment"
                        >
                          <SlidersHorizontal className="w-3.5 h-3.5" />
                          <span>Adjust</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Stock Adjustment Modal */}
      <StockAdjustmentModal
        isOpen={Boolean(adjustingItem)}
        onClose={() => setAdjustingItem(null)}
        variantItem={adjustingItem}
        onSaveAdjustment={handleSaveAdjustment}
      />
    </AdminLayout>
  )
}
