import { useState, useMemo, useEffect, useCallback } from 'react'
import { Plus, Edit2, Trash2, Power, CheckCircle2, X, Layers, AlertCircle, Loader2, RefreshCw } from 'lucide-react'
import AdminLayout from '../../components/admin/AdminLayout'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import CategoryFilters from '../../components/admin/CategoryFilters'
import CategoryFormModal from '../../components/admin/CategoryFormModal'
import ConfirmDeleteModal from '../../components/admin/ConfirmDeleteModal'

import { categoryApi } from '../../services/api/categoryApi'

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

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
    setTimeout(() => setFeedback(null), 5000)
  }

  // Load Categories from Backend API
  const loadCategories = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const params = { limit: 100 }
      if (searchQuery.trim()) {
        params.search = searchQuery.trim()
      }
      if (statusFilter !== 'all') {
        params.is_active = statusFilter === 'Active' ? 1 : 0
      }

      const res = await categoryApi.getCategories(params)
      setCategories(res.categories || [])
    } catch (err) {
      setError(err?.message || 'Failed to load categories from server.')
      setCategories([])
    } finally {
      setIsLoading(false)
    }
  }, [searchQuery, statusFilter])

  useEffect(() => {
    loadCategories()
  }, [loadCategories])

  // Filter Logic
  const filteredCategories = useMemo(() => {
    return categories.filter((c) => {
      return true
    })
  }, [categories])

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

  const handleSaveCategory = async (payload) => {
    try {
      if (editingCategory) {
        await categoryApi.updateCategory(editingCategory.id, payload)
        showFeedback('success', `Category "${payload.name}" updated successfully.`)
      } else {
        await categoryApi.createCategory(payload)
        showFeedback('success', `Category "${payload.name}" created successfully.`)
      }

      setFormModalOpen(false)
      setEditingCategory(null)
      await loadCategories()
    } catch (err) {
      showFeedback('error', err?.message || 'Failed to save category. Please check your permissions.')
    }
  }

  const handleToggleStatus = async (cat) => {
    try {
      const nextActive = !cat.is_active
      await categoryApi.updateCategory(cat.id, { is_active: nextActive ? 1 : 0 })
      showFeedback('success', `Category "${cat.name}" marked as ${nextActive ? 'Active' : 'Inactive'}.`)
      await loadCategories()
    } catch (err) {
      showFeedback('error', err?.message || 'Failed to update category status.')
    }
  }

  const handleConfirmDelete = async () => {
    if (!deleteCandidate) return
    try {
      await categoryApi.deleteCategory(deleteCandidate.id)
      showFeedback('success', `Category "${deleteCandidate.name}" removed from catalog.`)
      setDeleteCandidate(null)
      await loadCategories()
    } catch (err) {
      showFeedback(
        'error',
        err?.message ||
          'Failed to delete category. Categories containing products or subcategories cannot be deleted directly.'
      )
      setDeleteCandidate(null)
    }
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
              {feedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
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

        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-between text-xs text-rose-800">
            <span>{error}</span>
            <button
              onClick={loadCategories}
              className="inline-flex items-center gap-1 font-bold text-rose-700 underline cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" /> Retry
            </button>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="p-12 text-center bg-white rounded-3xl border border-gray-100 shadow-xs">
            <Loader2 className="w-8 h-8 text-[#103321] animate-spin mx-auto mb-2" />
            <p className="text-xs text-gray-500 font-semibold">Loading category catalog...</p>
          </div>
        )}

        {/* Categories Table */}
        {!isLoading && filteredCategories.length === 0 ? (
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
                className="px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 text-xs font-bold text-gray-700 transition-colors cursor-pointer"
              >
                Reset Search Filters
              </button>
            )}
          </div>
        ) : !isLoading && (
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
                  {filteredCategories.map((cat) => (
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
                        {cat.parent_name || cat.parentCategory ? (
                          <span className="font-semibold text-gray-800 capitalize">
                            {(cat.parent_name || cat.parentCategory).replace('-', ' ')}
                          </span>
                        ) : (
                          <span className="text-gray-400 italic">None (Top-Level)</span>
                        )}
                      </td>

                      {/* Product Count */}
                      <td className="px-5 py-3.5">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-[#103321]/10 text-[#103321]">
                          {cat.productCount} products
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
                            onClick={() => setDeleteCandidate(cat)}
                            className="p-1.5 rounded-lg border border-gray-200 text-gray-400 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Delete category"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
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
          deleteCandidate?.productCount > 0
            ? `This category currently contains ${deleteCandidate.productCount} active products. The backend will reject deletion if products are still assigned.`
            : 'This will permanently remove the category from the database.'
        }
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteCandidate(null)}
      />
    </AdminLayout>
  )
}
