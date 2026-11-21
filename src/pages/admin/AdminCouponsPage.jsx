import { useState, useMemo } from 'react'
import {
  Tag,
  Plus,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Search,
  Filter,
  Coins,
  Clock,
  Sparkles,
} from 'lucide-react'
import AdminLayout from '../../components/admin/AdminLayout'
import AdminBreadcrumb from '../../components/admin/AdminBreadcrumb'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import CouponTable from '../../components/admin/CouponTable'
import CouponFormModal from '../../components/admin/CouponFormModal'
import ConfirmActionModal from '../../components/admin/ConfirmActionModal'
import {
  getStoredAdminCoupons,
  createAdminCoupon,
  updateAdminCoupon,
  deleteAdminCoupon,
  MOCK_ADMINISTRATION_NOTICE,
} from '../../data/admin/adminAdministrationData'

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState(() => getStoredAdminCoupons())
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [editingCoupon, setEditingCoupon] = useState(null)
  const [deleteTargetCoupon, setDeleteTargetCoupon] = useState(null)
  const [feedback, setFeedback] = useState(null)

  const showFeedback = (text, type = 'success') => {
    setFeedback({ text, type })
    setTimeout(() => setFeedback(null), 4000)
  }

  // Filter Logic
  const filteredCoupons = useMemo(() => {
    let result = [...coupons]
    const now = new Date()
    now.setHours(0, 0, 0, 0)

    // Text search
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim()
      result = result.filter(
        (c) =>
          c.code?.toLowerCase().includes(q) ||
          c.description?.toLowerCase().includes(q)
      )
    }

    // Status filter
    if (selectedStatus === 'active') {
      result = result.filter((c) => c.isActive && new Date(c.expirationDate) >= now)
    } else if (selectedStatus === 'inactive') {
      result = result.filter((c) => !c.isActive)
    } else if (selectedStatus === 'expired') {
      result = result.filter((c) => new Date(c.expirationDate) < now)
    }

    return result
  }, [coupons, searchTerm, selectedStatus])

  // KPI Calculations
  const totalCoupons = coupons.length
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const activeCoupons = coupons.filter(
    (c) => c.isActive && new Date(c.expirationDate) >= now
  ).length
  const totalRedemptions = coupons.reduce((sum, c) => sum + (c.usageCount || 0), 0)
  const expiredCount = coupons.filter(
    (c) => new Date(c.expirationDate) < now
  ).length

  // Handlers
  const handleOpenCreate = () => {
    setEditingCoupon(null)
    setIsFormModalOpen(true)
  }

  const handleOpenEdit = (coupon) => {
    setEditingCoupon(coupon)
    setIsFormModalOpen(true)
  }

  const handleFormSubmit = (formData) => {
    if (editingCoupon) {
      const res = updateAdminCoupon(editingCoupon.id, formData)
      if (!res.success) {
        showFeedback(res.message, 'error')
        return
      }
      showFeedback(`Successfully updated coupon ${res.coupon.code}.`)
    } else {
      const res = createAdminCoupon(formData)
      if (!res.success) {
        showFeedback(res.message, 'error')
        return
      }
      showFeedback(`Successfully created promotional coupon ${res.coupon.code}.`)
    }
    setCoupons(getStoredAdminCoupons())
    setIsFormModalOpen(false)
    setEditingCoupon(null)
  }

  const handleToggleStatus = (coupon) => {
    const res = updateAdminCoupon(coupon.id, { isActive: !coupon.isActive })
    if (res.success) {
      showFeedback(
        `Coupon ${coupon.code} is now ${!coupon.isActive ? 'active' : 'inactive'}.`
      )
      setCoupons(getStoredAdminCoupons())
    }
  }

  const handleConfirmDelete = () => {
    if (!deleteTargetCoupon) return
    const res = deleteAdminCoupon(deleteTargetCoupon.id)
    if (res.success) {
      showFeedback(`Promotional coupon ${deleteTargetCoupon.code} has been deleted.`)
      setCoupons(getStoredAdminCoupons())
    } else {
      showFeedback(res.message || 'Error deleting coupon.', 'error')
    }
    setDeleteTargetCoupon(null)
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Breadcrumb */}
        <AdminBreadcrumb
          items={[
            { label: 'Admin', path: '/admin/dashboard' },
            { label: 'Coupons & Discounts' },
          ]}
        />

        {/* Page Header */}
        <AdminPageHeader
          title="Promotional Coupons & Vouchers"
          subtitle="Configure percentage and fixed ETB discounts, set checkout thresholds, and manage seasonal campaigns."
        >
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#103321] hover:bg-[#103321]/90 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4 text-[#95C623]" />
            Create Coupon
          </button>
        </AdminPageHeader>

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

        {/* Mock State Notice */}
        <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-600 flex items-center justify-between">
          <span>{MOCK_ADMINISTRATION_NOTICE}</span>
          <span className="font-mono text-[11px] text-gray-400">Checkout Integrated</span>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-gray-100 text-gray-700 flex items-center justify-center shrink-0">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">Total Vouchers</p>
              <h3 className="text-xl font-black text-gray-900 mt-0.5">{totalCoupons}</h3>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">Active Campaigns</p>
              <h3 className="text-xl font-black text-emerald-700 mt-0.5">{activeCoupons}</h3>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#103321]/10 text-[#103321] flex items-center justify-center shrink-0">
              <Coins className="w-5 h-5 text-[#103321]" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">Total Redemptions</p>
              <h3 className="text-xl font-black text-[#103321] mt-0.5">{totalRedemptions}</h3>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5 text-rose-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">Expired Campaigns</p>
              <h3 className="text-xl font-black text-rose-700 mt-0.5">{expiredCount}</h3>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm space-y-3">
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by coupon code (e.g. HABESHA10) or description..."
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#103321]/20 focus:border-[#103321]"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 min-w-[140px]">
                <Filter className="w-4 h-4 text-gray-400 shrink-0" />
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full text-xs font-medium py-2 px-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#103321]/20 focus:border-[#103321]"
                >
                  <option value="all">All Vouchers</option>
                  <option value="active">Active Only</option>
                  <option value="inactive">Inactive Only</option>
                  <option value="expired">Expired Only</option>
                </select>
              </div>

              {(searchTerm || selectedStatus !== 'all') && (
                <button
                  onClick={() => {
                    setSearchTerm('')
                    setSelectedStatus('all')
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset
                </button>
              )}
            </div>
          </div>

          <div className="text-xs text-gray-500 pt-2 border-t border-gray-100 flex items-center justify-between">
            <span>
              Showing <strong className="text-gray-900">{filteredCoupons.length}</strong> of{' '}
              <strong className="text-gray-900">{coupons.length}</strong> vouchers
            </span>
            <span className="text-[11px] text-gray-400">
              Coupons are validated at cart & checkout
            </span>
          </div>
        </div>

        {/* Coupons Table */}
        <CouponTable
          coupons={filteredCoupons}
          onEditCoupon={handleOpenEdit}
          onToggleStatus={handleToggleStatus}
          onDeleteCoupon={(c) => setDeleteTargetCoupon(c)}
        />

        {/* Form Modal */}
        <CouponFormModal
          isOpen={isFormModalOpen}
          coupon={editingCoupon}
          onClose={() => {
            setIsFormModalOpen(false)
            setEditingCoupon(null)
          }}
          onSubmit={handleFormSubmit}
        />

        {/* Delete Confirmation Modal */}
        {deleteTargetCoupon && (
          <ConfirmActionModal
            isOpen={Boolean(deleteTargetCoupon)}
            title={`Delete Coupon: ${deleteTargetCoupon.code}?`}
            description={`Are you sure you want to permanently remove discount voucher "${deleteTargetCoupon.code}"? Customers will no longer be able to apply this code during checkout.`}
            warning={
              deleteTargetCoupon.usageCount > 0
                ? `This coupon has already been redeemed ${deleteTargetCoupon.usageCount} times.`
                : null
            }
            actionType="danger"
            confirmText="Delete Coupon"
            onConfirm={handleConfirmDelete}
            onCancel={() => setDeleteTargetCoupon(null)}
          />
        )}
      </div>
    </AdminLayout>
  )
}
