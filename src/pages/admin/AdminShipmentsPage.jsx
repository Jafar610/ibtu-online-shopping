import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Truck,
  PlusCircle,
  CheckCircle2,
  Clock,
  Package,
  AlertCircle,
  MapPin,
} from 'lucide-react'
import AdminLayout from '../../components/admin/AdminLayout'
import AdminBreadcrumb from '../../components/admin/AdminBreadcrumb'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import ShipmentFilters from '../../components/admin/ShipmentFilters'
import ShipmentTable from '../../components/admin/ShipmentTable'
import ShipmentFormModal from '../../components/admin/ShipmentFormModal'
import {
  getStoredAdminShipments,
  getStoredAdminOrders,
  createAdminShipment,
  updateAdminShipment,
  getSalesKPIs,
} from '../../data/admin/adminSalesData'

export default function AdminShipmentsPage() {
  const [shipments, setShipments] = useState(() => getStoredAdminShipments())
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCourier, setSelectedCourier] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [sortBy, setSortBy] = useState('date-desc')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 8

  // Modal State
  const [formModalOpen, setFormModalOpen] = useState(false)
  const [formMode, setFormMode] = useState('create') // 'create' | 'edit'
  const [selectedShipment, setSelectedShipment] = useState(null)

  // Feedback Notification
  const [feedback, setFeedback] = useState(null)

  const showFeedback = (msg, type = 'success') => {
    setFeedback({ msg, type })
    setTimeout(() => setFeedback(null), 4000)
  }

  // Eligible Orders for new dispatch:
  // Orders that are Confirmed or Processing and don't already have an active non-cancelled shipment
  const eligibleOrders = useMemo(() => {
    const orders = getStoredAdminOrders()
    return orders.filter((o) => {
      if (o.orderStatus === 'Cancelled') return false
      // If it already has an active shipment
      if (o.shipmentId) {
        const linked = shipments.find((s) => s.id === o.shipmentId)
        if (linked && linked.shipmentStatus !== 'Cancelled') return false
      }
      return o.orderStatus === 'Confirmed' || o.orderStatus === 'Processing' || o.orderStatus === 'Pending'
    })
  }, [shipments])

  // Filter & Sort
  const filteredShipments = useMemo(() => {
    let result = [...shipments]

    // Text search
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim()
      result = result.filter(
        (s) =>
          s.trackingNumber?.toLowerCase().includes(q) ||
          s.orderNumber?.toLowerCase().includes(q) ||
          s.shipmentNumber?.toLowerCase().includes(q) ||
          s.customer?.name?.toLowerCase().includes(q) ||
          s.shippingAddress?.recipientName?.toLowerCase().includes(q)
      )
    }

    // Courier Filter
    if (selectedCourier !== 'all') {
      result = result.filter((s) => s.courierName === selectedCourier)
    }

    // Status Filter
    if (selectedStatus !== 'all') {
      result = result.filter((s) => s.shipmentStatus === selectedStatus)
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'date-desc') return new Date(b.estimatedDelivery || 0) - new Date(a.estimatedDelivery || 0)
      if (sortBy === 'date-asc') return new Date(a.estimatedDelivery || 0) - new Date(b.estimatedDelivery || 0)
      if (sortBy === 'delivery-asc') return new Date(a.estimatedDelivery || 0) - new Date(b.estimatedDelivery || 0)
      return 0
    })

    return result
  }, [shipments, searchTerm, selectedCourier, selectedStatus, sortBy])

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredShipments.length / pageSize))
  const paginatedShipments = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredShipments.slice(start, start + pageSize)
  }, [filteredShipments, currentPage, pageSize])

  const handleResetFilters = () => {
    setSearchTerm('')
    setSelectedCourier('all')
    setSelectedStatus('all')
    setSortBy('date-desc')
    setCurrentPage(1)
  }

  // Handle Form Submission
  const handleFormSubmit = (payload) => {
    if (formMode === 'create') {
      const res = createAdminShipment(payload)
      if (res.success) {
        setShipments(getStoredAdminShipments())
        setFormModalOpen(false)
        showFeedback(`Shipment ${res.shipment.shipmentNumber} created for Order ${res.shipment.orderNumber}!`)
        return { success: true }
      }
      return res
    } else {
      const res = updateAdminShipment(selectedShipment.id, payload)
      if (res.success) {
        setShipments(getStoredAdminShipments())
        setFormModalOpen(false)
        showFeedback(`Shipment ${selectedShipment.shipmentNumber} updated successfully!`)
        return { success: true }
      }
      return res
    }
  }

  const handleOpenCreateModal = () => {
    setFormMode('create')
    setSelectedShipment(null)
    setFormModalOpen(true)
  }

  const handleOpenEditModal = (shp) => {
    setFormMode('edit')
    setSelectedShipment(shp)
    setFormModalOpen(true)
  }

  const kpis = getSalesKPIs()

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Breadcrumb Navigation */}
        <AdminBreadcrumb items={[{ label: 'Sales Management' }, { label: 'Shipments' }]} />

        {/* Page Header */}
        <AdminPageHeader
          title="Shipment Dispatch & Logistics Management"
          subtitle="Manage Ethiopian postal dispatches, assign courier tracking numbers, and monitor milestone delivery progress."
        >
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleOpenCreateModal}
              className="px-4 py-2 rounded-xl bg-[#103321] hover:bg-[#103321]/90 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5 text-[#95C623]" />
              <span>Create Shipment</span>
            </button>
          </div>
        </AdminPageHeader>

        {/* Feedback Alert */}
        {feedback && (
          <div
            className={`p-4 rounded-2xl border text-xs font-semibold flex items-center justify-between shadow-xs animate-fadeIn ${
              feedback.type === 'warning'
                ? 'bg-amber-50 border-amber-200 text-amber-900'
                : 'bg-emerald-50 border-emerald-200 text-emerald-900'
            }`}
          >
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

        {/* KPI Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs space-y-1">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
              Total Dispatches
            </span>
            <div className="text-xl font-extrabold text-[#103321]">
              {shipments.length}
            </div>
            <span className="text-[10px] text-gray-500 block">Registered shipments</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs space-y-1">
            <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider block">
              Packaging & QA
            </span>
            <div className="text-xl font-extrabold text-indigo-700">
              {shipments.filter((s) => s.shipmentStatus === 'Processing').length}
            </div>
            <span className="text-[10px] text-gray-500 block">At fulfillment station</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs space-y-1">
            <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider block">
              Active In Transit
            </span>
            <div className="text-xl font-extrabold text-blue-700">
              {shipments.filter((s) => s.shipmentStatus === 'Shipped' || s.shipmentStatus === 'In Transit' || s.shipmentStatus === 'Out for Delivery').length}
            </div>
            <span className="text-[10px] text-gray-500 block">On courier routes</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs space-y-1">
            <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider block">
              Delivered Successfully
            </span>
            <div className="text-xl font-extrabold text-emerald-700">
              {shipments.filter((s) => s.shipmentStatus === 'Delivered').length}
            </div>
            <span className="text-[10px] text-gray-500 block">Completed handoffs</span>
          </div>
        </div>

        {/* Filters */}
        <ShipmentFilters
          searchTerm={searchTerm}
          setSearchTerm={(term) => {
            setSearchTerm(term)
            setCurrentPage(1)
          }}
          selectedCourier={selectedCourier}
          setSelectedCourier={(c) => {
            setSelectedCourier(c)
            setCurrentPage(1)
          }}
          selectedStatus={selectedStatus}
          setSelectedStatus={(st) => {
            setSelectedStatus(st)
            setCurrentPage(1)
          }}
          sortBy={sortBy}
          setSortBy={setSortBy}
          onReset={handleResetFilters}
          totalResults={filteredShipments.length}
        />

        {/* Shipment Table */}
        <ShipmentTable
          shipments={paginatedShipments}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          onEditShipment={handleOpenEditModal}
        />

        {/* Shipment Create & Edit Form Modal */}
        <ShipmentFormModal
          isOpen={formModalOpen}
          mode={formMode}
          shipment={selectedShipment}
          eligibleOrders={eligibleOrders}
          onClose={() => setFormModalOpen(false)}
          onSubmit={handleFormSubmit}
        />
      </div>
    </AdminLayout>
  )
}
