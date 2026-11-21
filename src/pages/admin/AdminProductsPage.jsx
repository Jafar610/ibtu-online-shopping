import { useState, useMemo, useEffect, useCallback } from 'react'
import { Plus, Eye, Edit2, Trash2, Power, CheckCircle2, X, Shirt, AlertCircle, Loader2, RefreshCw } from 'lucide-react'
import AdminLayout from '../../components/admin/AdminLayout'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import AdminStatusBadge from '../../components/admin/AdminStatusBadge'
import ProductFilters from '../../components/admin/ProductFilters'
import ProductFormModal from '../../components/admin/ProductFormModal'
import ProductDetailsModal from '../../components/admin/ProductDetailsModal'
import ConfirmDeleteModal from '../../components/admin/ConfirmDeleteModal'

import { productApi } from '../../services/api/productApi'
import { categoryApi } from '../../services/api/categoryApi'

export default function AdminProductsPage() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // Filters State
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedProductStatus, setSelectedProductStatus] = useState('all')
  const [selectedStockStatus, setSelectedStockStatus] = useState('all')
  const [sortOption, setSortOption] = useState('date-newest')

  // Modals State
  const [formModalOpen, setFormModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [detailsModalProduct, setDetailsModalProduct] = useState(null)
  const [deleteCandidate, setDeleteCandidate] = useState(null)

  // Feedback Notification
  const [feedback, setFeedback] = useState(null)

  const showFeedback = (type, message) => {
    setFeedback({ type, message })
    setTimeout(() => setFeedback(null), 5000)
  }

  // Load Categories on mount
  useEffect(() => {
    let isMounted = true
    categoryApi
      .getCategories({ limit: 100 })
      .then((res) => {
        if (isMounted) {
          setCategories(res.categories || [])
        }
      })
      .catch((err) => {
        console.warn('Failed to load categories for admin filter:', err)
      })

    return () => {
      isMounted = false
    }
  }, [])

  // Load Products from real backend API
  const loadProducts = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const params = {
        limit: 100,
      }
      if (searchQuery.trim()) {
        params.search = searchQuery.trim()
      }
      if (selectedCategory !== 'all') {
        const catObj = categories.find((c) => c.slug === selectedCategory || String(c.id) === selectedCategory)
        if (catObj) params.category_id = catObj.id
      }
      if (selectedProductStatus !== 'all') {
        params.status = selectedProductStatus.toLowerCase()
      }

      const res = await productApi.getAdminProducts(params)
      setProducts(res.products || [])
    } catch (err) {
      setError(err?.message || 'Failed to load products from server.')
      setProducts([])
    } finally {
      setIsLoading(false)
    }
  }, [searchQuery, selectedCategory, selectedProductStatus, categories])

  useEffect(() => {
    loadProducts()
  }, [loadProducts])

  // In-memory Filter & Sort Logic for client-side refinements (stock status and client sort)
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Stock Status filter
      if (selectedStockStatus !== 'all') {
        if (p.stockStatus !== selectedStockStatus) return false
      }
      return true
    }).sort((a, b) => {
      if (sortOption === 'price-low') return a.price - b.price
      if (sortOption === 'price-high') return b.price - a.price
      if (sortOption === 'name-az') return a.name.localeCompare(b.name)
      // default: date-newest
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
    })
  }, [products, selectedStockStatus, sortOption])

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    selectedCategory !== 'all' ||
    selectedProductStatus !== 'all' ||
    selectedStockStatus !== 'all'

  const handleClearFilters = () => {
    setSearchQuery('')
    setSelectedCategory('all')
    setSelectedProductStatus('all')
    setSelectedStockStatus('all')
    setSortOption('date-newest')
  }

  // CRUD Handlers
  const handleOpenAddModal = () => {
    setEditingProduct(null)
    setFormModalOpen(true)
  }

  const handleOpenEditModal = (prod) => {
    setEditingProduct(prod)
    setFormModalOpen(true)
  }

  const handleSaveProduct = async (productPayload) => {
    try {
      if (editingProduct) {
        // 1. Update Product
        await productApi.updateProduct(editingProduct.id, productPayload)

        // 2. Update or Create Variants
        if (productPayload.variants && productPayload.variants.length > 0) {
          for (const v of productPayload.variants) {
            if (typeof v.id === 'number') {
              try {
                await productApi.updateVariant(v.id, {
                  sku: v.sku,
                  size: v.size,
                  color: v.color,
                  price: v.price,
                  sale_price: v.sale_price,
                  low_stock_threshold: v.low_stock_threshold,
                  is_active: v.is_active,
                })
              } catch (varErr) {
                console.warn('Could not update variant:', varErr)
              }
            } else {
              try {
                await productApi.createVariant(editingProduct.id, v)
              } catch (varErr) {
                console.warn('Could not create variant:', varErr)
              }
            }
          }
        }

        // 3. Upload image file if provided
        if (productPayload.selectedFile) {
          try {
            await productApi.uploadProductImage(editingProduct.id, productPayload.selectedFile, {
              is_primary: true,
            })
          } catch (imgErr) {
            console.warn('Could not upload image:', imgErr)
          }
        }

        showFeedback('success', `Product "${productPayload.name}" updated successfully.`)
      } else {
        // 1. Create Product
        const created = await productApi.createProduct(productPayload)
        const newProductId = created.id

        // 2. Create Variants
        if (productPayload.variants && productPayload.variants.length > 0) {
          for (const v of productPayload.variants) {
            try {
              await productApi.createVariant(newProductId, v)
            } catch (varErr) {
              console.warn('Could not create variant:', varErr)
            }
          }
        }

        // 3. Upload image file if provided
        if (productPayload.selectedFile) {
          try {
            await productApi.uploadProductImage(newProductId, productPayload.selectedFile, {
              is_primary: true,
            })
          } catch (imgErr) {
            console.warn('Could not upload image:', imgErr)
          }
        }

        showFeedback('success', `Product "${productPayload.name}" created successfully.`)
      }

      setFormModalOpen(false)
      setEditingProduct(null)
      await loadProducts()
    } catch (err) {
      showFeedback('error', err?.message || 'Failed to save product. Please verify permissions and input fields.')
    }
  }

  const handleToggleStatus = async (prod) => {
    try {
      const nextStatus = prod.productStatus === 'Active' ? 'draft' : 'active'
      await productApi.updateProductStatus(prod.id, nextStatus)
      showFeedback('success', `Product "${prod.name}" status changed to ${nextStatus.toUpperCase()}.`)
      await loadProducts()
    } catch (err) {
      showFeedback('error', err?.message || 'Failed to update product status.')
    }
  }

  const handleConfirmDelete = async () => {
    if (!deleteCandidate) return
    try {
      await productApi.deleteProduct(deleteCandidate.id)
      showFeedback('success', `Product "${deleteCandidate.name}" removed from catalog.`)
      setDeleteCandidate(null)
      await loadProducts()
    } catch (err) {
      showFeedback('error', err?.message || 'Failed to delete product. It may be linked to active customer orders.')
      setDeleteCandidate(null)
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <AdminPageHeader
          title="Product Catalog Management"
          description="Create, edit, and organize authentic Ethiopian cultural dresses, modern garments, and artisan variants."
          breadcrumbs={[{ label: 'Products' }]}
          badge={`${products.length} Products`}
          action={
            <button
              type="button"
              onClick={handleOpenAddModal}
              className="px-5 py-2.5 rounded-xl bg-[#103321] hover:bg-[#95C623] hover:text-[#103321] text-white text-xs font-bold transition-all shadow-sm flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Product</span>
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
        <ProductFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          categories={categories}
          selectedProductStatus={selectedProductStatus}
          onProductStatusChange={setSelectedProductStatus}
          selectedStockStatus={selectedStockStatus}
          onStockStatusChange={setSelectedStockStatus}
          sortOption={sortOption}
          onSortChange={setSortOption}
          onClearFilters={handleClearFilters}
          hasActiveFilters={hasActiveFilters}
        />

        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-between text-xs text-rose-800">
            <span>{error}</span>
            <button
              onClick={loadProducts}
              className="inline-flex items-center gap-1 font-bold text-rose-700 underline"
            >
              <RefreshCw className="w-3 h-3" /> Retry
            </button>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="p-12 text-center bg-white rounded-3xl border border-gray-100 shadow-xs">
            <Loader2 className="w-8 h-8 text-[#103321] animate-spin mx-auto mb-2" />
            <p className="text-xs text-gray-500 font-semibold">Loading product catalog...</p>
          </div>
        )}

        {/* Product Listing Table */}
        {!isLoading && filteredProducts.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-gray-100 shadow-xs space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 text-gray-400 mx-auto flex items-center justify-center">
              <Shirt className="w-8 h-8" />
            </div>
            <div className="max-w-md mx-auto space-y-1">
              <h3 className="font-serif font-bold text-lg text-[#103321]">
                No Products Match Your Criteria
              </h3>
              <p className="text-xs text-gray-500">
                Try adjusting your search query, clearing filters, or create a new artisan product.
              </p>
            </div>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 text-xs font-bold text-gray-700 transition-colors"
              >
                Reset All Filters
              </button>
            )}
          </div>
        ) : !isLoading && (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[750px]">
                <thead className="bg-[#103321]/5 text-[#103321] border-b border-gray-100 uppercase font-bold text-[10px] tracking-wider">
                  <tr>
                    <th className="px-5 py-3.5">Product & SKU</th>
                    <th className="px-5 py-3.5">Category</th>
                    <th className="px-5 py-3.5">Price (ETB)</th>
                    <th className="px-5 py-3.5">Stock</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-700">
                  {filteredProducts.map((prod) => (
                    <tr
                      key={prod.id}
                      className="hover:bg-gray-50/70 transition-colors group"
                    >
                      {/* Image & Title */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-14 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 shrink-0">
                            <img
                              src={prod.image}
                              alt={prod.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <span className="font-serif font-bold text-sm text-[#103321] block leading-snug">
                              {prod.name}
                            </span>
                            {prod.amharicName && (
                              <span className="text-[11px] text-gray-400 font-serif block">
                                {prod.amharicName}
                              </span>
                            )}
                            <span className="font-mono text-[10px] text-gray-500 font-bold block mt-0.5">
                              {prod.sku}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-5 py-3.5">
                        <span className="inline-block px-2.5 py-1 rounded-lg bg-gray-100 text-gray-700 font-semibold capitalize">
                          {prod.categoryName || prod.category?.replace('-', ' ')}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="px-5 py-3.5">
                        <span className="font-serif font-extrabold text-sm text-[#103321] block">
                          {prod.price.toLocaleString()} ETB
                        </span>
                        {prod.originalPrice && (
                          <span className="text-[10px] text-gray-400 line-through block">
                            {prod.originalPrice.toLocaleString()} ETB
                          </span>
                        )}
                      </td>

                      {/* Stock Status */}
                      <td className="px-5 py-3.5">
                        <div className="space-y-1">
                          <AdminStatusBadge status={prod.stockStatus} type="stock" />
                          <span className="text-[11px] text-gray-400 block font-medium">
                            {prod.stockCount} units available
                          </span>
                        </div>
                      </td>

                      {/* Product Status */}
                      <td className="px-5 py-3.5">
                        <AdminStatusBadge status={prod.productStatus} type="order" />
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* View */}
                          <button
                            type="button"
                            onClick={() => setDetailsModalProduct(prod)}
                            className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:text-[#103321] hover:border-[#103321] hover:bg-gray-50 transition-colors cursor-pointer"
                            title="View product details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Edit */}
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(prod)}
                            className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:text-[#103321] hover:border-[#103321] hover:bg-gray-50 transition-colors cursor-pointer"
                            title="Edit product"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Status Toggle */}
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(prod)}
                            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                              prod.productStatus === 'Active'
                                ? 'border-amber-200 text-amber-600 hover:bg-amber-50'
                                : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                            }`}
                            title={prod.productStatus === 'Active' ? 'Move to Draft' : 'Publish as Active'}
                          >
                            <Power className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete */}
                          <button
                            type="button"
                            onClick={() => setDeleteCandidate(prod)}
                            className="p-1.5 rounded-lg border border-gray-200 text-gray-400 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Delete product"
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

      {/* Product Form Modal (Add / Edit) */}
      <ProductFormModal
        isOpen={formModalOpen}
        onClose={() => {
          setFormModalOpen(false)
          setEditingProduct(null)
        }}
        product={editingProduct}
        categories={categories}
        onSave={handleSaveProduct}
      />

      {/* Product Details Modal */}
      <ProductDetailsModal
        isOpen={Boolean(detailsModalProduct)}
        onClose={() => setDetailsModalProduct(null)}
        product={detailsModalProduct}
        onEdit={(p) => {
          setDetailsModalProduct(null)
          handleOpenEditModal(p)
        }}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={Boolean(deleteCandidate)}
        title="Delete Product"
        message={`Are you sure you want to remove "${deleteCandidate?.name}" (${deleteCandidate?.sku}) from the catalog?`}
        warning="This removes the item permanently from the backend database."
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteCandidate(null)}
      />
    </AdminLayout>
  )
}
