import { useState, useMemo } from 'react'
import { Plus, Edit2, Trash2, Power, CheckCircle2, X, Layers, AlertCircle } from 'lucide-react'
import AdminLayout from '../../components/admin/AdminLayout'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import CategoryFilters from '../../components/admin/CategoryFilters'
import CategoryFormModal from '../../components/admin/CategoryFormModal'
import ConfirmDeleteModal from '../../components/admin/ConfirmDeleteModal'
import {
  getStoredAdminCategories,
  saveStoredAdminCategories,
  getStoredAdminProducts,
} from '../../data/admin/adminCatalogData'

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState(() => getStoredAdminCategories())
  const [products] = useState(() => getStoredAdminProducts())

  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  // Modals
  const [formModalOpen, setFormModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [deleteCandidate, setDeleteCandidate] = useState(null)

  // Feedback Notification
  const [feedback, setFeedback] = useState(null)

  const showFeedback = (type, message) => {
    setFeedback({ type, message })
    setTimeout(() => setFeedback(null), 4000)
  }

  // Filter Logic
  const filteredCategories = useMemo(() => {
    return categories.filter((c) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim()
        const matchesName = c.name?.toLowerCase().includes(q)
        const matchesSlug = c.slug?.toLowerCase().includes(q)
        const matchesAmharic = c.amharicName?.includes(q)
        if (!matchesName && !matchesSlug && !matchesAmharic) return false
      }

      if (statusFilter !== 'all') {
        if (c.status !== statusFilter) return false
      }

      return true
    })
  }, [categories, searchQuery, statusFilter])

  const hasActiveFilters = searchQuery.trim() !== '' || statusFilter !== 'all'

  const handleClearFilters = () => {
    setSearchQuery('')
    setStatusFilter('all')
  }

  // CRUD Handlers
  const handleOpenAddModal = () => {
    setEditingCategory(null)
    setFormModalOpen(true)
  }

  const handleOpenEditModal = (cat) => {
    setEditingCategory(cat)
    setFormModalOpen(true)
  }

  const handleSaveCategory = (payload) => {
    let updated = []
    if (editingCategory) {
      updated = categories.map((c) => (c.id === payload.id ? payload : c))
      showFeedback('success', `Category "${payload.name}" updated successfully.`)
    } else {
      updated = [payload, ...categories]
      showFeedback('success', `Category "${payload.name}" created successfully.`)
    }

    setCategories(updated)
    saveStoredAdminCategories(updated)
    setFormModalOpen(false)
    setEditingCategory(null)
  }

  const handleToggleStatus = (cat) => {
    const nextStatus = cat.status === 'Active' ? 'Inactive' : 'Active'
    const updated = categories.map((c) =>
      c.id === cat.id ? { ...c, status: nextStatus } : c
    )
    setCategories(updated)
    saveStoredAdminCategories(updated)
    showFeedback('success', `Category "${cat.name}" marked as ${nextStatus}.`)
  }

  const handleConfirmDelete = () => {
    if (!deleteCandidate) return
    const updated = categories.filter((c) => c.id !== deleteCandidate.id)
    setCategories(updated)
    saveStoredAdminCategories(updated)
    showFeedback('success', `Category "${deleteCandidate.name}" removed from catalog.`)
    setDeleteCandidate(null)
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <AdminPageHeader
          title="Artisan Category Management"
          description="Manage Ethiopian cultural attire collections, hierarchies, Amharic translations, and storefront banners."
          breadcrumbs={[{ label: 'Categories' }]}
          badge={`${categories.length} Collections`}
          action={
            <button
              type="button"
              onClick={handleOpenAddModal}
              className="px-5 py-2.5 rounded-xl bg-[#103321] hover:bg-[#95C623] hover:text-[#103321] text-white text-xs font-bold transition-all shadow-sm flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Category</span>
            </button>
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

        {/* Filter Controls */}
        <CategoryFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          onClearFilters={handleClearFilters}
          hasActiveFilters={hasActiveFilters}
        />

        {/* Categories Table */}
        {filteredCategories.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-gray-100 shadow-xs space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 text-gray-400 mx-auto flex items-center justify-center">
              <Layers className="w-8 h-8" />
            </div>
            <div className="max-w-md mx-auto space-y-1">
              <h3 className="font-serif font-bold text-lg text-[#103321]">
                No Categories Found
              </h3>
              <p className="text-xs text-gray-500">
                No collections match your search filter. Clear filters or create a new category.
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
              <table className="w-full text-left text-xs min-w-[700px]">
                <thead className="bg-[#103321]/5 text-[#103321] border-b border-gray-100 uppercase font-bold text-[10px] tracking-wider">
                  <tr>
                    <th className="px-5 py-3.5">Category & Banner</th>
                    <th className="px-5 py-3.5">Slug</th>
                    <th className="px-5 py-3.5">Parent Category</th>
                    <th className="px-5 py-3.5">Product Count</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-700">
                  {filteredCategories.map((cat) => {
                    const associatedCount = products.filter(
                      (p) => p.category === cat.slug || p.category === cat.id
                    ).length

                    return (
                      <tr
                        key={cat.id}
                        className="hover:bg-gray-50/70 transition-colors group"
                      >
                        {/* Image & Title */}
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-14 h-12 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 shrink-0">
                              <img
                                src={cat.image}
                                alt={cat.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div>
                              <span className="font-serif font-bold text-sm text-[#103321] block leading-tight">
                                {cat.name}
                              </span>
                              {cat.amharicName && (
                                <span className="text-[11px] text-gray-400 font-serif block mt-0.5">
                                  {cat.amharicName}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Slug */}
                        <td className="px-5 py-3.5">
                          <span className="font-mono text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
                            {cat.slug}
                          </span>
                        </td>

                        {/* Parent Category */}
                        <td className="px-5 py-3.5 text-gray-500">
                          {cat.parentCategory ? (
                            <span className="font-semibold text-gray-800 capitalize">
                              {cat.parentCategory.replace('-', ' ')}
                            </span>
                          ) : (
                            <span className="text-gray-400 italic">None (Top-Level)</span>
                          )}
                        </td>

                        {/* Product Count */}
                        <td className="px-5 py-3.5">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-[#103321]/10 text-[#103321]">
                            {associatedCount} products
                          </span>
                        </td>

                        {/* Status */}
                        <td className="px-5 py-3.5">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                              cat.status === 'Active'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-gray-100 text-gray-600 border border-gray-200'
                            }`}
                          >
                            {cat.status}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Edit */}
                            <button
                              type="button"
                              onClick={() => handleOpenEditModal(cat)}
                              className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:text-[#103321] hover:border-[#103321] hover:bg-gray-50 transition-colors cursor-pointer"
                              title="Edit category"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            {/* Status Toggle */}
                            <button
                              type="button"
                              onClick={() => handleToggleStatus(cat)}
                              className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                                cat.status === 'Active'
                                  ? 'border-amber-200 text-amber-600 hover:bg-amber-50'
                                  : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                              }`}
                              title={cat.status === 'Active' ? 'Deactivate Category' : 'Activate Category'}
                            >
                              <Power className="w-3.5 h-3.5" />
                            </button>

                            {/* Delete */}
                            <button
                              type="button"
                              onClick={() => setDeleteCandidate({ ...cat, associatedCount })}
                              className="p-1.5 rounded-lg border border-gray-200 text-gray-400 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Delete category"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
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

      {/* Category Form Modal (Add / Edit) */}
      <CategoryFormModal
        isOpen={formModalOpen}
        onClose={() => {
          setFormModalOpen(false)
          setEditingCategory(null)
        }}
        category={editingCategory}
        existingCategories={categories}
        onSave={handleSaveCategory}
      />

      {/* Delete Confirmation Modal with Product Warning */}
      <ConfirmDeleteModal
        isOpen={Boolean(deleteCandidate)}
        title="Delete Category"
        message={`Are you sure you want to delete "${deleteCandidate?.name}"?`}
        warning={
          deleteCandidate?.associatedCount > 0
            ? `This category currently contains ${deleteCandidate.associatedCount} active products. Deleting it will leave these products unassigned.`
            : null
        }
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteCandidate(null)}
      />
    </AdminLayout>
  )
}
