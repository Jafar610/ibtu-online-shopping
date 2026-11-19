import { useState } from 'react'
import { Plus, CheckCircle2, Home, Briefcase, Tag, Edit2, Phone, MapPin } from 'lucide-react'
import ShippingAddressForm from './ShippingAddressForm'
import { getStoredAddresses, saveStoredAddresses } from '../../data/customerData'

export default function ShippingAddressSelector({
  selectedAddress,
  onSelectAddress,
}) {
  const [addresses, setAddresses] = useState(() => getStoredAddresses())
  const [isAddingNew, setIsAddingNew] = useState(false)
  const [editingAddress, setEditingAddress] = useState(null)

  const handleSaveNewAddress = (newAddr) => {
    const updated = [newAddr, ...addresses.map((a) => (newAddr.isDefault ? { ...a, isDefault: false } : a))]
    setAddresses(updated)
    saveStoredAddresses(updated)
    onSelectAddress(newAddr)
    setIsAddingNew(false)
    setEditingAddress(null)
  }

  const handleSaveEditedAddress = (editedAddr) => {
    const updated = addresses.map((a) => (a.id === editedAddr.id ? editedAddr : a))
    setAddresses(updated)
    saveStoredAddresses(updated)
    if (selectedAddress?.id === editedAddr.id) {
      onSelectAddress(editedAddr)
    }
    setEditingAddress(null)
  }

  const getTypeIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'home':
        return <Home className="w-3.5 h-3.5" />
      case 'work':
        return <Briefcase className="w-3.5 h-3.5" />
      default:
        return <Tag className="w-3.5 h-3.5" />
    }
  }

  if (isAddingNew) {
    return (
      <ShippingAddressForm
        onSave={handleSaveNewAddress}
        onCancel={() => setIsAddingNew(false)}
      />
    )
  }

  if (editingAddress) {
    return (
      <ShippingAddressForm
        initialData={editingAddress}
        onSave={handleSaveEditedAddress}
        onCancel={() => setEditingAddress(null)}
      />
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-serif font-bold text-base text-[#103321] flex items-center gap-2">
          <MapPin className="w-4 h-4 text-[#95C623]" />
          <span>Delivery Address</span>
        </h3>

        <button
          type="button"
          onClick={() => setIsAddingNew(true)}
          className="text-xs text-[#103321] hover:text-[#95C623] font-bold flex items-center gap-1 transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Deliver to New Address</span>
        </button>
      </div>

      {addresses.length === 0 ? (
        <div className="p-6 text-center bg-gray-50 rounded-2xl border border-gray-200 space-y-3">
          <p className="text-xs text-gray-500">
            No saved shipping addresses found. Please enter your delivery address below.
          </p>
          <button
            type="button"
            onClick={() => setIsAddingNew(true)}
            className="px-4 py-2 rounded-xl bg-[#103321] text-white text-xs font-bold hover:bg-[#95C623] hover:text-[#103321] transition-all cursor-pointer inline-flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Delivery Address</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {addresses.map((addr) => {
            const isSelected = selectedAddress?.id === addr.id
            const isDefault = Boolean(addr.isDefault)

            return (
              <div
                key={addr.id}
                onClick={() => onSelectAddress(addr)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between ${
                  isSelected
                    ? 'border-[#95C623] bg-white ring-2 ring-[#95C623]/30 shadow-sm'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                          isSelected
                            ? 'border-[#103321] bg-[#103321] text-[#95C623]'
                            : 'border-gray-300 bg-white'
                        }`}
                      >
                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-[#95C623]" />}
                      </div>

                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-gray-100 text-gray-700">
                        {getTypeIcon(addr.addressType)}
                        <span>{addr.addressType || 'Home'}</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {isDefault && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#103321] text-[#95C623]">
                          Default
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          setEditingAddress(addr)
                        }}
                        className="p-1 text-gray-400 hover:text-[#103321] transition-colors"
                        title="Edit address"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-serif font-bold text-sm text-[#103321]">
                      {addr.recipientName}
                    </h4>
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                      <Phone className="w-3 h-3 text-[#95C623]" />
                      <span>{addr.phone}</span>
                    </p>
                  </div>

                  <div className="text-xs text-gray-600 leading-tight pt-1 border-t border-gray-50">
                    <p className="font-medium text-gray-800">{addr.addressLine1}</p>
                    {addr.addressLine2 && <p className="text-gray-500">{addr.addressLine2}</p>}
                    <p>
                      {addr.city}, {addr.region}
                    </p>
                    <p className="font-semibold text-[#103321]">{addr.country || 'Ethiopia'}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
