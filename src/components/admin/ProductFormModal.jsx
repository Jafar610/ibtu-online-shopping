import { useState } from 'react'
import { X, Plus, Trash2, Image as ImageIcon, AlertCircle, Check, Layers } from 'lucide-react'

const DEFAULT_DEMO_IMAGES = [
  'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80',
]

export default function ProductFormModal({
  isOpen,
  onClose,
  product = null,
  categories = [],
  onSave,
}) {
  const isEditing = Boolean(product)

  // Form State
  const [activeTab, setActiveTab] = useState('basic') // 'basic' | 'variants' | 'images'
  const [name, setName] = useState(product?.name || '')
  const [amharicName, setAmharicName] = useState(product?.amharicName || '')
  const [slug, setSlug] = useState(product?.slug || '')
  const [category, setCategory] = useState(product?.category || (categories[0]?.slug || 'habesha-kemis'))
  const [description, setDescription] = useState(product?.description || '')
  const [fabric, setFabric] = useState(product?.fabric || '100% Handwoven Ethiopian Cotton')
  const [productStatus, setProductStatus] = useState(product?.productStatus || 'Active')
  const [badge, setBadge] = useState(product?.badge || '')

  // Pricing & Base Inventory
  const [price, setPrice] = useState(product?.price || 3500)
  const [originalPrice, setOriginalPrice] = useState(product?.originalPrice || '')
  const [stockCount, setStockCount] = useState(product?.stockCount ?? 20)
  const [lowStockThreshold, setLowStockThreshold] = useState(product?.lowStockThreshold ?? 5)

  // Images
  const [image, setImage] = useState(product?.image || DEFAULT_DEMO_IMAGES[0])
  const [additionalImages, setAdditionalImages] = useState(
    product?.images?.filter((img) => img !== product?.image) || []
  )
  const [newImageUrl, setNewImageUrl] = useState('')

  // Variants
  const [variants, setVariants] = useState(() => {
    if (product?.variants && product.variants.length > 0) {
      return product.variants
    }
    return [
      {
        id: `var-init-1`,
        sku: product?.sku ? `${product.sku}-M-1` : 'IBTU-KEMIS-M-1',
        size: 'M',
        color: 'Traditional White',
        price: product?.price || 3500,
        stockQuantity: 10,
        lowStockThreshold: 2,
        active: true,
      },
      {
        id: `var-init-2`,
        sku: product?.sku ? `${product.sku}-L-1` : 'IBTU-KEMIS-L-1',
        size: 'L',
        color: 'Traditional White',
        price: product?.price || 3500,
        stockQuantity: 10,
        lowStockThreshold: 2,
        active: true,
      },
    ]
  })

  const [errors, setErrors] = useState({})

  if (!isOpen) return null

  // Auto-generate slug when typing name if not editing
  const handleNameChange = (val) => {
    setName(val)
    if (!isEditing && !slug) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, '')
      )
    }
  }

  // Variant operations
  const handleAddVariant = () => {
    const newVar = {
      id: `var-${Date.now()}`,
      sku: `IBTU-VAR-${Date.now().toString().slice(-4)}`,
      size: 'Standard',
      color: 'Default',
      price: Number(price) || 0,
      stockQuantity: 5,
      lowStockThreshold: 2,
      active: true,
    }
    setVariants([...variants, newVar])
  }

  const handleUpdateVariant = (index, field, value) => {
    const updated = [...variants]
    updated[index] = { ...updated[index], [field]: value }
    setVariants(updated)
  }

  const handleRemoveVariant = (index) => {
    if (variants.length <= 1) {
      alert('Product must have at least one variant.')
      return
    }
    setVariants(variants.filter((_, idx) => idx !== index))
  }

  // Image operations
  const handleAddImage = (e) => {
    e.preventDefault()
    if (!newImageUrl.trim()) return
    setAdditionalImages([...additionalImages, newImageUrl.trim()])
    setNewImageUrl('')
  }

  const handleRemoveAdditionalImage = (index) => {
    setAdditionalImages(additionalImages.filter((_, idx) => idx !== index))
  }

  const validate = () => {
    const errs = {}
    if (!name.trim()) errs.name = 'Product name is required.'
    if (!category) errs.category = 'Category is required.'
    if (!price || Number(price) <= 0) errs.price = 'Valid price in ETB is required.'
    if (stockCount === '' || Number(stockCount) < 0) errs.stockCount = 'Valid stock count is required.'
    if (!image.trim()) errs.image = 'Main product image URL is required.'

    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) return

    const totalVariantStock = variants.reduce((sum, v) => sum + (Number(v.stockQuantity) || 0), 0)
    const finalStockCount = variants.length > 0 ? totalVariantStock : Number(stockCount)

    const productPayload = {
      id: product?.id || `prod-${Date.now()}`,
      slug:
        slug.trim() ||
        name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, ''),
      name: name.trim(),
      amharicName: amharicName.trim() || null,
      sku: product?.sku || `IBTU-${category.slice(0, 3).toUpperCase()}-${Date.now().toString().slice(-4)}`,
      category,
      price: Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : null,
      stockCount: finalStockCount,
      lowStockThreshold: Number(lowStockThreshold),
      stockStatus: finalStockCount <= 0 ? 'Out of Stock' : finalStockCount <= Number(lowStockThreshold) ? 'Low Stock' : 'In Stock',
      productStatus,
      badge: badge.trim() || null,
      description: description.trim(),
      fabric: fabric.trim(),
      image: image.trim(),
      images: [image.trim(), ...additionalImages],
      variants,
      sizes: [...new Set(variants.map((v) => v.size))],
      colors: [...new Set(variants.map((v) => v.color))],
      inStock: finalStockCount > 0,
      createdAt: product?.createdAt || new Date().toISOString(),
    }

    onSave(productPayload)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-gray-100 p-6 sm:p-8 space-y-6">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div>
            <h3 className="font-serif font-extrabold text-xl text-[#103321]">
              {isEditing ? `Edit Product: ${product.name}` : 'Add New Artisan Garment'}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Configure product catalog information, Ethiopian artisan attributes, variants, and imagery.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex bg-gray-100 p-1 rounded-2xl text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('basic')}
            className={`flex-1 py-2 rounded-xl transition-all cursor-pointer ${
              activeTab === 'basic' ? 'bg-[#103321] text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            1. Basic Info & Pricing
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('variants')}
            className={`flex-1 py-2 rounded-xl transition-all cursor-pointer ${
              activeTab === 'variants' ? 'bg-[#103321] text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            2. Variants ({variants.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('images')}
            className={`flex-1 py-2 rounded-xl transition-all cursor-pointer ${
              activeTab === 'images' ? 'bg-[#103321] text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            3. Product Images ({1 + additionalImages.length})
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* TAB 1: BASIC INFO & PRICING */}
          {activeTab === 'basic' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Product Title (English) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="e.g. Royal Habesha Kemis with Gold Tilf"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-hidden focus:border-[#103321]"
                  />
                  {errors.name && <p className="text-[11px] text-red-500 mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    የአማርኛ ስም (Amharic Name)
                  </label>
                  <input
                    type="text"
                    value={amharicName}
                    onChange={(e) => setAmharicName(e.target.value)}
                    placeholder="e.g. የንግስት ባህላዊ ቀሚስ ከወርቅ ጥልፍ ጋር"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-hidden focus:border-[#103321]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs bg-white focus:outline-hidden focus:border-[#103321] cursor-pointer"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id || cat.slug} value={cat.slug || cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Product Status
                  </label>
                  <select
                    value={productStatus}
                    onChange={(e) => setProductStatus(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs bg-white focus:outline-hidden focus:border-[#103321] cursor-pointer"
                  >
                    <option value="Active">Active (Published)</option>
                    <option value="Draft">Draft (Unpublished)</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Badge / Tag
                  </label>
                  <input
                    type="text"
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                    placeholder="e.g. New Arrival / 20% OFF"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-hidden focus:border-[#103321]"
                  />
                </div>
              </div>

              {/* Pricing & Stock Row */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Price (ETB) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-hidden focus:border-[#103321]"
                  />
                  {errors.price && <p className="text-[11px] text-red-500 mt-1">{errors.price}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Sale / Original Price (ETB)
                  </label>
                  <input
                    type="number"
                    value={originalPrice}
                    onChange={(e) => setOriginalPrice(e.target.value)}
                    placeholder="Optional strikethrough"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-hidden focus:border-[#103321]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Base Stock Count
                  </label>
                  <input
                    type="number"
                    value={stockCount}
                    onChange={(e) => setStockCount(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-hidden focus:border-[#103321]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Low Stock Alert
                  </label>
                  <input
                    type="number"
                    value={lowStockThreshold}
                    onChange={(e) => setLowStockThreshold(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-hidden focus:border-[#103321]"
                  />
                </div>
              </div>

              {/* Description & Fabric */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Product Description
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detailed description of the garment, weaving tradition, and occasion styling..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-hidden focus:border-[#103321]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Fabric & Artisan Weave Details
                </label>
                <input
                  type="text"
                  value={fabric}
                  onChange={(e) => setFabric(e.target.value)}
                  placeholder="e.g. 100% Handwoven Shemma Cotton with Golden Silk Tibeb"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-hidden focus:border-[#103321]"
                />
              </div>
            </div>
          )}

          {/* TAB 2: PRODUCT VARIANTS */}
          {activeTab === 'variants' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-serif font-bold text-sm text-[#103321]">
                    SKU & Variant Matrix
                  </h4>
                  <p className="text-xs text-gray-400">
                    Define sizes, colors, individual SKU identifiers, and inventory quantities.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddVariant}
                  className="px-3 py-1.5 rounded-xl bg-[#103321] hover:bg-[#95C623] hover:text-[#103321] text-white text-xs font-bold transition-all inline-flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Variant</span>
                </button>
              </div>

              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {variants.map((v, idx) => (
                  <div
                    key={v.id || idx}
                    className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200/80 grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center text-xs"
                  >
                    <div className="sm:col-span-3">
                      <span className="text-[10px] text-gray-400 block font-bold">SKU</span>
                      <input
                        type="text"
                        value={v.sku}
                        onChange={(e) => handleUpdateVariant(idx, 'sku', e.target.value)}
                        className="w-full px-2 py-1.5 rounded-lg border border-gray-200 bg-white font-mono text-[11px]"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <span className="text-[10px] text-gray-400 block font-bold">Size</span>
                      <input
                        type="text"
                        value={v.size}
                        onChange={(e) => handleUpdateVariant(idx, 'size', e.target.value)}
                        className="w-full px-2 py-1.5 rounded-lg border border-gray-200 bg-white text-xs"
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <span className="text-[10px] text-gray-400 block font-bold">Color / Tibeb</span>
                      <input
                        type="text"
                        value={v.color}
                        onChange={(e) => handleUpdateVariant(idx, 'color', e.target.value)}
                        className="w-full px-2 py-1.5 rounded-lg border border-gray-200 bg-white text-xs"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <span className="text-[10px] text-gray-400 block font-bold">Stock</span>
                      <input
                        type="number"
                        value={v.stockQuantity}
                        onChange={(e) => handleUpdateVariant(idx, 'stockQuantity', Number(e.target.value))}
                        className="w-full px-2 py-1.5 rounded-lg border border-gray-200 bg-white text-xs"
                      />
                    </div>

                    <div className="sm:col-span-2 flex items-center justify-end gap-2 pt-3 sm:pt-0">
                      <label className="flex items-center gap-1 text-[11px] text-gray-600 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={v.active}
                          onChange={(e) => handleUpdateVariant(idx, 'active', e.target.checked)}
                          className="w-3.5 h-3.5 rounded text-[#103321]"
                        />
                        <span>Active</span>
                      </label>

                      <button
                        type="button"
                        onClick={() => handleRemoveVariant(idx)}
                        className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
                        title="Remove variant"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: PRODUCT IMAGES */}
          {activeTab === 'images' && (
            <div className="space-y-4 animate-fadeIn">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Primary Product Image URL <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="flex-1 px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:outline-hidden focus:border-[#103321]"
                  />
                </div>
                {errors.image && <p className="text-[11px] text-red-500 mt-1">{errors.image}</p>}
              </div>

              {/* Main Image Preview */}
              <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-2xl border border-gray-200">
                <div className="w-20 h-24 rounded-xl overflow-hidden bg-gray-200 border border-gray-300 shrink-0">
                  <img
                    src={image}
                    alt="Main Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = DEFAULT_DEMO_IMAGES[0]
                    }}
                  />
                </div>
                <div>
                  <span className="text-xs font-bold text-[#103321] block">Primary Featured Image</span>
                  <p className="text-[11px] text-gray-500">
                    This image will be highlighted in the shop catalog, promotional hero banners, and customer order receipts.
                  </p>
                </div>
              </div>

              {/* Additional Gallery Images */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Add Additional Gallery Image URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    placeholder="Paste image link..."
                    className="flex-1 px-3.5 py-2 rounded-xl border border-gray-200 text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleAddImage}
                    disabled={!newImageUrl.trim()}
                    className="px-4 py-2 rounded-xl bg-[#103321] hover:bg-[#95C623] hover:text-[#103321] text-white text-xs font-bold transition-all disabled:opacity-40 cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              </div>

              {additionalImages.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  {additionalImages.map((imgUrl, idx) => (
                    <div key={idx} className="relative rounded-xl overflow-hidden border border-gray-200 group h-24">
                      <img src={imgUrl} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveAdditionalImage(idx)}
                        className="absolute top-1 right-1 p-1 rounded-full bg-red-600 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        title="Delete image"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-bold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#103321] hover:bg-[#95C623] hover:text-[#103321] text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>{isEditing ? 'Save Product Changes' : 'Create Product'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
