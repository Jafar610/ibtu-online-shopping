import { useState } from 'react'
import { X, Check, AlertCircle, Layers } from 'lucide-react'

const DEFAULT_CATEGORY_IMAGES = [
  'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80',
]

export default function CategoryFormModal({
  isOpen,
  onClose,
  category = null,
  existingCategories = [],
  onSave,
}) {
  const isEditing = Boolean(category)

  const [name, setName] = useState(category?.name || '')
  const [amharicName, setAmharicName] = useState(category?.amharicName || '')
  const [slug, setSlug] = useState(category?.slug || '')
  const [description, setDescription] = useState(category?.description || '')
  const [parentCategory, setParentCategory] = useState(category?.parentCategory || '')
  const [status, setStatus] = useState(category?.status || 'Active')
  const [image, setImage] = useState(category?.image || DEFAULT_CATEGORY_IMAGES[0])
  const [errors, setErrors] = useState({})

  if (!isOpen) return null

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

  const validate = () => {
    const errs = {}
    if (!name.trim()) errs.name = 'Category name is required.'

    const cleanSlug = slug.trim().toLowerCase()
    if (!cleanSlug) {
      errs.slug = 'Category slug is required.'
    } else {
      // Check duplicate slug among other categories
      const isDuplicate = existingCategories.some(
        (c) => c.slug.toLowerCase() === cleanSlug && (!isEditing || c.id !== category?.id)
      )
      if (isDuplicate) {
        errs.slug = 'This slug is already used by another category. Please choose a unique slug.'
      }
    }

    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) return

    const payload = {
      id: category?.id || `cat-${Date.now()}`,
      name: name.trim(),
      amharicName: amharicName.trim() || null,
      slug: slug.trim().toLowerCase(),
      description: description.trim(),
      parentCategory: parentCategory || null,
      status,
      image: image.trim(),
      productCount: category?.productCount || 0,
      featured: category?.featured ?? true,
    }

    onSave(payload)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100 p-6 sm:p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div>
            <h3 className="font-serif font-extrabold text-lg text-[#103321]">
              {isEditing ? `Edit Category: ${category.name}` : 'Add New Category'}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Organize Ethiopian garments and accessories into intuitive shopping collections.
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

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Category Name */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Category Name (English) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g. Habesha Kemis"
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-hidden focus:border-[#103321]"
            />
            {errors.name && <p className="text-[11px] text-red-500 mt-1">{errors.name}</p>}
          </div>

          {/* Amharic Name */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              የአማርኛ ስም (Amharic Translation)
            </label>
            <input
              type="text"
              value={amharicName}
              onChange={(e) => setAmharicName(e.target.value)}
              placeholder="e.g. የሀበሻ ቀሚስ"
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-hidden focus:border-[#103321]"
            />
          </div>

          {/* Slug */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              URL Slug <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="e.g. habesha-kemis"
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-mono focus:outline-hidden focus:border-[#103321]"
            />
            {errors.slug && <p className="text-[11px] text-red-500 mt-1">{errors.slug}</p>}
          </div>

          {/* Parent Category & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Parent Category (Optional)
              </label>
              <select
                value={parentCategory}
                onChange={(e) => setParentCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs bg-white focus:outline-hidden focus:border-[#103321] cursor-pointer"
              >
                <option value="">None (Top-Level Category)</option>
                {existingCategories
                  .filter((c) => !isEditing || c.id !== category?.id)
                  .map((c) => (
                    <option key={c.id || c.slug} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs bg-white focus:outline-hidden focus:border-[#103321] cursor-pointer"
              >
                <option value="Active">Active (Visible)</option>
                <option value="Inactive">Inactive (Hidden)</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Description
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of this Ethiopian cultural collection..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-hidden focus:border-[#103321]"
            />
          </div>

          {/* Image Banner URL */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Category Header Image URL
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="https://..."
                className="flex-1 px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:outline-hidden focus:border-[#103321]"
              />
            </div>

            {image && (
              <div className="mt-2 h-20 rounded-xl overflow-hidden border border-gray-200">
                <img
                  src={image}
                  alt="Banner Preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = DEFAULT_CATEGORY_IMAGES[0]
                  }}
                />
              </div>
            )}
          </div>

          {/* Buttons */}
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
              <Check className="w-4 h-4" />
              <span>{isEditing ? 'Save Changes' : 'Create Category'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
