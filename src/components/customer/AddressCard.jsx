import { MapPin, Phone, Edit2, Trash2, CheckCircle2, Home, Briefcase, Tag } from 'lucide-react'

export default function AddressCard({
  address,
  onEdit,
  onDelete,
  onSetDefault,
}) {
  const isDefault = Boolean(address.isDefault)

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

  return (
    <div
      className={`p-5 rounded-2xl bg-white border transition-all flex flex-col justify-between ${
        isDefault
          ? 'border-[#95C623] shadow-md ring-1 ring-[#95C623]/30'
          : 'border-gray-100 shadow-xs hover:border-gray-200'
      }`}
    >
      <div className="space-y-3">
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
            {getTypeIcon(address.addressType)}
            <span>{address.addressType || 'Home'}</span>
          </span>

          {isDefault && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-[#103321] text-[#95C623]">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Default Address</span>
            </span>
          )}
        </div>

        {/* Recipient & Phone */}
        <div>
          <h3 className="font-serif font-bold text-base text-[#103321]">
            {address.recipientName}
          </h3>
          <p className="text-xs text-gray-500 flex items-center gap-1.5 mt-0.5">
            <Phone className="w-3 h-3 text-[#95C623]" />
            <span>{address.phone}</span>
          </p>
        </div>

        {/* Address Lines */}
        <div className="text-xs text-gray-600 space-y-0.5 pt-1 border-t border-gray-50">
          <p className="font-medium text-gray-800">{address.addressLine1}</p>
          {address.addressLine2 && <p>{address.addressLine2}</p>}
          <p>
            {address.city}, {address.region} {address.postalCode ? `• ${address.postalCode}` : ''}
          </p>
          <p className="font-medium text-[#103321]">{address.country || 'Ethiopia'}</p>
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-between gap-2">
        {!isDefault && onSetDefault ? (
          <button
            type="button"
            onClick={() => onSetDefault(address.id)}
            className="text-xs text-[#103321] hover:text-[#95C623] font-bold transition-colors cursor-pointer"
          >
            Set as Default
          </button>
        ) : (
          <span />
        )}

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onEdit(address)}
            className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:text-[#103321] hover:border-[#103321] hover:bg-gray-50 text-xs font-medium transition-colors flex items-center gap-1 cursor-pointer"
            title="Edit address"
          >
            <Edit2 className="w-3 h-3" />
            <span>Edit</span>
          </button>

          <button
            type="button"
            onClick={() => onDelete(address.id)}
            className="p-1.5 rounded-lg border border-gray-200 text-gray-400 hover:text-red-600 hover:border-red-200 hover:bg-red-50 text-xs font-medium transition-colors flex items-center gap-1 cursor-pointer"
            title="Delete address"
          >
            <Trash2 className="w-3 h-3" />
            <span>Delete</span>
          </button>
        </div>
      </div>
    </div>
  )
}
