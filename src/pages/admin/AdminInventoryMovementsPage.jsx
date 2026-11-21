import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  ScrollText,
  ArrowLeft,
  Search,
  X,
  Eye,
  PlusCircle,
  Truck,
  RotateCcw,
  AlertTriangle,
  MinusCircle,
  SlidersHorizontal,
} from 'lucide-react'
import AdminLayout from '../../components/admin/AdminLayout'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import MovementDetailsModal from '../../components/admin/MovementDetailsModal'
import { getStoredInventoryMovements } from '../../data/admin/adminInventoryData'

const MOVEMENT_TYPES = [
  'All Types',
  'Purchase',
  'Customer Return',
  'Damaged',
  'Lost',
  'Opening Stock',
  'Adjustment',
]

export default function AdminInventoryMovementsPage() {
  const [movements] = useState(() => getStoredInventoryMovements())
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState('All Types')
  const [activeModalMovement, setActiveModalMovement] = useState(null)

  // Filter Movements
  const filteredMovements = useMemo(() => {
    return movements.filter((m) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim()
        const matchesProduct = m.productName?.toLowerCase().includes(q)
        const matchesSku = m.sku?.toLowerCase().includes(q)
        const matchesRef = m.referenceId?.toLowerCase().includes(q)
        if (!matchesProduct && !matchesSku && !matchesRef) return false
      }

      if (selectedType !== 'All Types') {
        if (m.movementType !== selectedType) return false
      }

      return true
    })
  }, [movements, searchQuery, selectedType])

  const hasActiveFilters = searchQuery.trim() !== '' || selectedType !== 'All Types'

  const handleClearFilters = () => {
    setSearchQuery('')
    setSelectedType('All Types')
  }

  const getTypeBadge = (type) => {
    switch (type) {
      case 'Purchase':
      case 'Opening Stock':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200'
      case 'Customer Return':
        return 'bg-blue-50 text-blue-700 border-blue-200'
      case 'Damaged':
      case 'Lost':
        return 'bg-rose-50 text-rose-700 border-rose-200'
      case 'Adjustment':
        return 'bg-amber-50 text-amber-700 border-amber-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <AdminPageHeader
          title="Inventory Movement Audit Logs"
          description="Chronological log of stock receipts, customer returns, manual reconciliations, and defect write-offs."
          breadcrumbs={[
            { label: 'Inventory', path: '/admin/inventory' },
            { label: 'Movement History' },
          ]}
          badge={`${movements.length} Logged Entries`}
          action={
            <Link
              to="/admin/inventory"
              className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Inventory Control</span>
            </Link>
          }
        />

        {/* Filters */}
        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by product name, SKU, or ref #..."
              className="w-full pl-9 pr-8 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-hidden focus:border-[#103321] focus:ring-1 focus:ring-[#103321] bg-gray-50/50"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-gray-200 text-xs font-medium text-gray-700 bg-white focus:outline-hidden focus:border-[#103321] cursor-pointer"
            >
              {MOVEMENT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="text-xs font-bold text-red-600 hover:text-red-700 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            )}
          </div>
        </div>

        {/* Movements Table */}
        {filteredMovements.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-gray-100 shadow-xs space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 text-gray-400 mx-auto flex items-center justify-center">
              <ScrollText className="w-8 h-8" />
            </div>
            <div className="max-w-md mx-auto space-y-1">
              <h3 className="font-serif font-bold text-lg text-[#103321]">
                No Movement Records Found
              </h3>
              <p className="text-xs text-gray-500">
                No inventory adjustment logs match your active filter criteria.
              </p>
            </div>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 text-xs font-bold text-gray-700 transition-colors"
              >
                Reset Search Filters
              </button>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[850px]">
                <thead className="bg-[#103321]/5 text-[#103321] border-b border-gray-100 uppercase font-bold text-[10px] tracking-wider">
                  <tr>
                    <th className="px-5 py-3.5">Timestamp</th>
                    <th className="px-5 py-3.5">Product & SKU</th>
                    <th className="px-5 py-3.5">Movement Type</th>
                    <th className="px-5 py-3.5 text-center">Net Delta</th>
                    <th className="px-5 py-3.5 text-center">Physical Before</th>
                    <th className="px-5 py-3.5 text-center">Physical After</th>
                    <th className="px-5 py-3.5">Actor / User</th>
                    <th className="px-5 py-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-700">
                  {filteredMovements.map((mov) => {
                    const isAddition = Number(mov.quantity) > 0
                    const formattedDate = new Date(mov.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })

                    return (
                      <tr key={mov.id} className="hover:bg-gray-50/70 transition-colors group">
                        {/* Timestamp */}
                        <td className="px-5 py-3.5 text-gray-500 whitespace-nowrap text-[11px]">
                          {formattedDate}
                        </td>

                        {/* Product & SKU */}
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-12 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 shrink-0">
                              <img
                                src={mov.productImage}
                                alt={mov.productName}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div>
                              <span className="font-serif font-bold text-xs text-[#103321] block leading-tight">
                                {mov.productName}
                              </span>
                              <span className="font-mono text-[10px] text-gray-500 font-bold block mt-0.5">
                                {mov.sku}
                              </span>
                              <span className="text-[10px] text-gray-400 block truncate max-w-[180px]">
                                {mov.variantLabel}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Movement Type */}
                        <td className="px-5 py-3.5">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${getTypeBadge(
                              mov.movementType
                            )}`}
                          >
                            {mov.movementType}
                          </span>
                        </td>

                        {/* Delta */}
                        <td className="px-5 py-3.5 text-center">
                          <span
                            className={`font-serif font-extrabold text-sm ${
                              isAddition ? 'text-emerald-700' : 'text-rose-700'
                            }`}
                          >
                            {isAddition ? `+${mov.quantity}` : mov.quantity}
                          </span>
                        </td>

                        {/* Before */}
                        <td className="px-5 py-3.5 text-center text-gray-500 font-medium">
                          {mov.quantityBefore}
                        </td>

                        {/* After */}
                        <td className="px-5 py-3.5 text-center font-bold text-[#103321]">
                          {mov.quantityAfter}
                        </td>

                        {/* Actor */}
                        <td className="px-5 py-3.5 text-gray-600 text-[11px]">
                          <span className="font-bold text-gray-800 block truncate max-w-[150px]">
                            {mov.user}
                          </span>
                          {mov.referenceId && (
                            <span className="font-mono text-[10px] text-gray-400 block">
                              Ref: {mov.referenceId}
                            </span>
                          )}
                        </td>

                        {/* Action */}
                        <td className="px-5 py-3.5 text-right">
                          <button
                            type="button"
                            onClick={() => setActiveModalMovement(mov)}
                            className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:text-[#103321] hover:border-[#103321] hover:bg-gray-50 transition-colors inline-flex items-center gap-1 text-[11px] font-bold cursor-pointer"
                            title="Inspect full audit record"
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
          </div>
        )}
      </div>

      {/* Movement Details Modal */}
      <MovementDetailsModal
        isOpen={Boolean(activeModalMovement)}
        onClose={() => setActiveModalMovement(null)}
        movement={activeModalMovement}
      />
    </AdminLayout>
  )
}
