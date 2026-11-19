import { useState } from 'react'
import { Plus, MapPin, X, AlertCircle, CheckCircle2 } from 'lucide-react'
import CustomerLayout from '../../components/customer/CustomerLayout'
import AddressCard from '../../components/customer/AddressCard'
import { getStoredAddresses, saveStoredAddresses } from '../../data/customerData'

const initialFormState = {
  recipientName: '',
  phone: '',
  addressType: 'Home',
  addressLine1: '',
  addressLine2: '',
  city: 'Addis Ababa',
  region: 'Addis Ababa',
  postalCode: '',
  country: 'Ethiopia',
  isDefault: false,
}

export default function AddressesPage() {
  const [addresses, setAddresses] = useState(() => getStoredAddresses())
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState(initialFormState)
  const [errors, setErrors] = useState({})
  const [feedback, setFeedback] = useState(null)

  const openAddModal = () => {
    setEditingId(null)
    setFormData({
      ...initialFormState,
      // If there are currently no addresses, make this one default by default
      isDefault: addresses.length === 0,
    })
    setErrors({})
    setIsModalOpen(true)
  }

  const openEditModal = (addr) => {
    setEditingId(addr.id)
    setFormData({
      recipientName: addr.recipientName || '',
      phone: addr.phone || '',
      addressType: addr.addressType || 'Home',
      addressLine1: addr.addressLine1 || '',
      addressLine2: addr.addressLine2 || '',
      city: addr.city || 'Addis Ababa',
      region: addr.region || 'Addis Ababa',
      postalCode: addr.postalCode || '',
      country: addr.country || 'Ethiopia',
      isDefault: Boolean(addr.isDefault),
    })
    setErrors({})
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingId(null)
    setErrors({})
  }

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

    let updatedList = []

    if (editingId) {
      // Editing existing address
      updatedList = addresses.map((item) => {
        if (item.id === editingId) {
          return {
            ...item,
            ...formData,
            recipientName: formData.recipientName.trim(),
            addressLine1: formData.addressLine1.trim(),
            addressLine2: formData.addressLine2.trim(),
            city: formData.city.trim(),
            region: formData.region.trim(),
            postalCode: formData.postalCode.trim(),
          }
        }
        // If this address is set as default, turn off default for all others
        if (formData.isDefault) {
          return { ...item, isDefault: false }
        }
        return item
      })
      setFeedback({ type: 'success', message: 'Address updated successfully.' })
    } else {
      // Adding new address
      const newAddress = {
        id: `addr-${Date.now()}`,
        ...formData,
        recipientName: formData.recipientName.trim(),
        addressLine1: formData.addressLine1.trim(),
        addressLine2: formData.addressLine2.trim(),
        city: formData.city.trim(),
        region: formData.region.trim(),
        postalCode: formData.postalCode.trim(),
      }

      if (formData.isDefault) {
        // Demote other addresses from default
        updatedList = [newAddress, ...addresses.map((a) => ({ ...a, isDefault: false }))]
      } else {
        // If it's the very first address, enforce default
        if (addresses.length === 0) {
          newAddress.isDefault = true
        }
        updatedList = [...addresses, newAddress]
      }
      setFeedback({ type: 'success', message: 'New address added successfully.' })
    }

    setAddresses(updatedList)
    saveStoredAddresses(updatedList)
    closeModal()

    setTimeout(() => setFeedback(null), 4000)
  }

  const handleDelete = (id) => {
    if (!window.confirm('Are you sure you want to delete this address?')) return

    const addrToDelete = addresses.find((a) => a.id === id)
    let remaining = addresses.filter((a) => a.id !== id)

    // If deleting default and there are remaining addresses, assign default to the first one
    if (addrToDelete?.isDefault && remaining.length > 0) {
      remaining = remaining.map((addr, idx) => (idx === 0 ? { ...addr, isDefault: true } : addr))
    }

    setAddresses(remaining)
    saveStoredAddresses(remaining)
    setFeedback({ type: 'success', message: 'Address deleted successfully.' })
    setTimeout(() => setFeedback(null), 4000)
  }

  const handleSetDefault = (id) => {
    const updated = addresses.map((addr) => ({
      ...addr,
      isDefault: addr.id === id,
    }))
    setAddresses(updated)
    saveStoredAddresses(updated)
    setFeedback({ type: 'success', message: 'Default shipping address updated.' })
    setTimeout(() => setFeedback(null), 3000)
  }

  return (
    <CustomerLayout
      activeNav="addresses"
      title="Saved Shipping Addresses"
      subtitle="Manage your delivery destinations and primary default address."
      breadcrumbs={[
        { label: 'Home', path: '/' },
        { label: 'My Account', path: '/account' },
        { label: 'My Addresses' },
      ]}
      action={
        <button
          type="button"
          onClick={openAddModal}
          className="px-4 py-2.5 rounded-xl bg-[#103321] hover:bg-[#95C623] text-white hover:text-[#103321] text-xs font-bold transition-all shadow-sm flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Address</span>
        </button>
      }
    >
      <div className="space-y-6">
        {/* Feedback Alert */}
        {feedback && (
          <div
            className={`p-4 rounded-xl border flex items-center justify-between gap-3 text-xs font-medium animate-fadeIn ${
              feedback.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-red-50 text-red-800 border-red-200'
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

        {/* Address Cards Grid */}
        {addresses.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-gray-100 shadow-xs space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-[#95C623]/20 text-[#103321] mx-auto flex items-center justify-center">
              <MapPin className="w-8 h-8" />
            </div>
            <div className="max-w-md mx-auto space-y-1">
              <h3 className="font-serif font-bold text-lg text-[#103321]">
                No Addresses Saved Yet
              </h3>
              <p className="text-xs text-gray-500">
                You haven't added any shipping destinations yet. Add an address to make your checkout fast and seamless across Ethiopia.
              </p>
            </div>
            <button
              type="button"
              onClick={openAddModal}
              className="px-5 py-2.5 rounded-xl bg-[#103321] hover:bg-[#95C623] hover:text-[#103321] text-white text-xs font-bold transition-all inline-flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Your First Address</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {addresses.map((address) => (
              <AddressCard
                key={address.id}
                address={address}
                onEdit={openEditModal}
                onDelete={handleDelete}
                onSetDefault={handleSetDefault}
              />
            ))}
          </div>
        )}
      </div>

      {/* Add / Edit Address Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100 p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div>
                <h3 className="font-serif font-bold text-lg text-[#103321]">
                  {editingId ? 'Edit Shipping Address' : 'Add New Shipping Address'}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Enter accurate recipient and delivery details for Ethiopian shipments.
                </p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Recipient Name */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Recipient Name <span className="text-red-500">*</span>
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

              {/* Phone & Address Type Row */}
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
                    <option value="Home">Home</option>
                    <option value="Work">Work</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              {/* Address Line 1 */}
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

              {/* Default Address Checkbox */}
              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isDefault}
                    onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                    className="w-4 h-4 rounded text-[#103321] focus:ring-[#95C623] cursor-pointer"
                  />
                  <span className="text-xs font-bold text-gray-700">
                    Set as default delivery address
                  </span>
                </label>
                <p className="text-[11px] text-gray-400 pl-6 mt-0.5">
                  This address will be automatically selected for your next purchases.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#103321] hover:bg-[#95C623] text-white hover:text-[#103321] text-xs font-bold transition-all shadow-sm cursor-pointer"
                >
                  {editingId ? 'Save Address' : 'Add Address'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </CustomerLayout>
  )
}
