import { useState } from 'react'
import { AlertCircle, Check } from 'lucide-react'

export default function ShippingAddressForm({ initialData, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    recipientName: initialData?.recipientName || '',
    phone: initialData?.phone || '',
    addressType: initialData?.addressType || 'Home',
    addressLine1: initialData?.addressLine1 || '',
    addressLine2: initialData?.addressLine2 || '',
    city: initialData?.city || 'Addis Ababa',
    region: initialData?.region || 'Addis Ababa',
    postalCode: initialData?.postalCode || '',
    country: initialData?.country || 'Ethiopia',
    isDefault: initialData?.isDefault ?? false,
  })

  const [errors, setErrors] = useState({})

  const validate = () => {
    const errs = {}
    if (!formData.recipientName.trim()) {
      errs.recipientName = 'Recipient name is required.'
    } else if (formData.recipientName.trim().length < 2) {
      errs.recipientName = 'Recipient name must be at least 2 characters.'
    }

    const phoneTrimmed = formData.phone.trim()
    const phoneRegex = /^(\+251\s?[0-9]{2}\s?[0-9]{3}\s?[0-9]{4}|09[0-9]{8}|07[0-9]{8}|\+2519[0-9]{8}|\+2517[0-9]{8})$/
    if (!phoneTrimmed) {
      errs.phone = 'Phone number is required.'
    } else if (!phoneRegex.test(phoneTrimmed.replace(/\s+/g, ''))) {
      errs.phone = 'Please enter a valid Ethiopian phone number (e.g. +251 91 122 3344 or 0911223344).'
    }

    if (!formData.addressLine1.trim()) {
      errs.addressLine1 = 'Street address / Kebele / House number is required.'
    }
    if (!formData.city.trim()) {
      errs.city = 'City is required.'
    }
    if (!formData.region.trim()) {
      errs.region = 'Region / Sub-city is required.'
    }

    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) return

    onSave({
      id: initialData?.id || `addr-${Date.now()}`,
      ...formData,
      recipientName: formData.recipientName.trim(),
      phone: formData.phone.trim(),
      addressLine1: formData.addressLine1.trim(),
      addressLine2: formData.addressLine2.trim(),
      city: formData.city.trim(),
      region: formData.region.trim(),
      postalCode: formData.postalCode.trim(),
    })
  }

  return (
    <form onSubmit={handleSubmit} className="p-5 sm:p-6 bg-white rounded-2xl border border-gray-200 shadow-xs space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-gray-100">
        <h4 className="font-serif font-bold text-sm text-[#103321]">
          {initialData ? 'Edit Shipping Address' : 'Enter Delivery Destination'}
        </h4>
        <span className="text-[11px] text-gray-400">All fields marked * are required</span>
      </div>

      {/* Recipient Name */}
      <div>
        <label className="block text-xs font-bold text-gray-700 mb-1">
          Full Recipient Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.recipientName}
          onChange={(e) => setFormData({ ...formData, recipientName: e.target.value })}
          placeholder="e.g. Almaz Bekele"
          className={`w-full px-3.5 py-2.5 rounded-xl border text-xs focus:outline-hidden transition-all ${
            errors.recipientName
              ? 'border-red-400 focus:border-red-500 bg-red-50/20'
              : 'border-gray-200 focus:border-[#103321] focus:ring-1 focus:ring-[#103321]'
          }`}
        />
        {errors.recipientName && (
          <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            <span>{errors.recipientName}</span>
          </p>
        )}
      </div>

      {/* Phone Number & Address Type */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1">
            Phone Number <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="+251 91 122 3344"
            className={`w-full px-3.5 py-2.5 rounded-xl border text-xs focus:outline-hidden transition-all ${
              errors.phone
                ? 'border-red-400 focus:border-red-500 bg-red-50/20'
                : 'border-gray-200 focus:border-[#103321] focus:ring-1 focus:ring-[#103321]'
            }`}
          />
          {errors.phone && (
            <p className="text-[11px] text-red-500 mt-1">{errors.phone}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1">
            Address Type
          </label>
          <select
            value={formData.addressType}
            onChange={(e) => setFormData({ ...formData, addressType: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-hidden focus:border-[#103321] bg-white cursor-pointer"
          >
            <option value="Home">Home (Residence)</option>
            <option value="Work">Work (Office)</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      {/* Street Address */}
      <div>
        <label className="block text-xs font-bold text-gray-700 mb-1">
          Street Address / Kebele / House # <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.addressLine1}
          onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
          placeholder="e.g. Bole Sub-City, Kebele 03, House #412"
          className={`w-full px-3.5 py-2.5 rounded-xl border text-xs focus:outline-hidden transition-all ${
            errors.addressLine1
              ? 'border-red-400 focus:border-red-500 bg-red-50/20'
              : 'border-gray-200 focus:border-[#103321] focus:ring-1 focus:ring-[#103321]'
          }`}
        />
        {errors.addressLine1 && (
          <p className="text-[11px] text-red-500 mt-1">{errors.addressLine1}</p>
        )}
      </div>

      {/* Address Line 2 */}
      <div>
        <label className="block text-xs font-bold text-gray-700 mb-1">
          Apartment, Suite, Landmark <span className="text-gray-400 font-normal">(optional)</span>
        </label>
        <input
          type="text"
          value={formData.addressLine2}
          onChange={(e) => setFormData({ ...formData, addressLine2: e.target.value })}
          placeholder="e.g. Near Edna Mall, Atlas Area"
          className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-hidden focus:border-[#103321]"
        />
      </div>

      {/* City & Region */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1">
            City <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            placeholder="e.g. Addis Ababa"
            className={`w-full px-3.5 py-2.5 rounded-xl border text-xs focus:outline-hidden transition-all ${
              errors.city
                ? 'border-red-400 focus:border-red-500 bg-red-50/20'
                : 'border-gray-200 focus:border-[#103321] focus:ring-1 focus:ring-[#103321]'
            }`}
          />
          {errors.city && (
            <p className="text-[11px] text-red-500 mt-1">{errors.city}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1">
            Region / Sub-City <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.region}
            onChange={(e) => setFormData({ ...formData, region: e.target.value })}
            placeholder="e.g. Addis Ababa / Oromia / Amhara"
            className={`w-full px-3.5 py-2.5 rounded-xl border text-xs focus:outline-hidden transition-all ${
              errors.region
                ? 'border-red-400 focus:border-red-500 bg-red-50/20'
                : 'border-gray-200 focus:border-[#103321] focus:ring-1 focus:ring-[#103321]'
            }`}
          />
          {errors.region && (
            <p className="text-[11px] text-red-500 mt-1">{errors.region}</p>
          )}
        </div>
      </div>

      {/* Postal Code & Country */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1">
            Postal Code <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <input
            type="text"
            value={formData.postalCode}
            onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
            placeholder="1000"
            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-hidden focus:border-[#103321]"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1">
            Country
          </label>
          <input
            type="text"
            value={formData.country}
            readOnly
            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-600 text-xs cursor-not-allowed"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-bold transition-colors cursor-pointer"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          className="px-5 py-2 rounded-xl bg-[#103321] hover:bg-[#95C623] hover:text-[#103321] text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
        >
          <Check className="w-3.5 h-3.5" />
          <span>Save Address</span>
        </button>
      </div>
    </form>
  )
}
