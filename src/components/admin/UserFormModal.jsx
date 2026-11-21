import { useState, useEffect } from 'react'
import { X, ShieldCheck, User, Mail, Phone, FileText, CheckCircle2 } from 'lucide-react'

export default function UserFormModal({
  isOpen,
  onClose,
  onSubmit,
  user = null, // null for create, object for edit
}) {
  const isEdit = Boolean(user)

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: 'data_encoder',
    status: 'Active',
    notes: '',
  })

  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        role: user.role || 'data_encoder',
        status: user.status || 'Active',
        notes: user.notes || '',
      })
    } else {
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        role: 'data_encoder',
        status: 'Active',
        notes: '',
      })
    }
    setErrors({})
  }, [user, isOpen])

  if (!isOpen) return null

  const validate = () => {
    const errs = {}
    if (!formData.firstName.trim()) errs.firstName = 'First name is required.'
    if (!formData.lastName.trim()) errs.lastName = 'Last name is required.'

    if (!formData.email.trim()) {
      errs.email = 'Email address is required.'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errs.email = 'Please provide a valid email format.'
    }

    if (!formData.phone.trim()) {
      errs.phone = 'Phone number is required.'
    }

    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) return
    onSubmit(formData)
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-[#103321] text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#95C623] text-[#103321] flex items-center justify-center font-bold text-sm">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-base leading-tight">
                {isEdit ? 'Edit Staff User Profile' : 'Add New Administrative Staff'}
              </h3>
              <p className="text-xs text-emerald-200/90">
                {isEdit
                  ? `Editing administrative privileges for ${user.name}`
                  : 'Grant system access and role-based permissions'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Security Notice */}
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong className="font-semibold block mb-0.5">Role-Based Access Control Notice:</strong>
              Passwords and credentials are authenticated via secure corporate single sign-on.
              Assigning a role determines administrative module access permissions.
            </div>
          </div>

          {/* First & Last Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                First Name *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  placeholder="e.g. Alazar"
                  className={`w-full pl-9 pr-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 ${
                    errors.firstName
                      ? 'border-rose-400 focus:ring-rose-200'
                      : 'border-gray-200 focus:ring-[#103321]/20 focus:border-[#103321]'
                  }`}
                />
              </div>
              {errors.firstName && (
                <p className="text-[11px] text-rose-500 mt-1">{errors.firstName}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Last Name *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  placeholder="e.g. Tesfaye"
                  className={`w-full pl-9 pr-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 ${
                    errors.lastName
                      ? 'border-rose-400 focus:ring-rose-200'
                      : 'border-gray-200 focus:ring-[#103321]/20 focus:border-[#103321]'
                  }`}
                />
              </div>
              {errors.lastName && (
                <p className="text-[11px] text-rose-500 mt-1">{errors.lastName}</p>
              )}
            </div>
          </div>

          {/* Email Address */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Email Address *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="staff.name@ibtu.com"
                disabled={isEdit}
                className={`w-full pl-9 pr-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 ${
                  isEdit ? 'bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200' : ''
                } ${
                  errors.email
                    ? 'border-rose-400 focus:ring-rose-200'
                    : 'border-gray-200 focus:ring-[#103321]/20 focus:border-[#103321]'
                }`}
              />
            </div>
            {errors.email && (
              <p className="text-[11px] text-rose-500 mt-1">{errors.email}</p>
            )}
            {isEdit && (
              <p className="text-[11px] text-gray-400 mt-1">
                Corporate emails cannot be altered after provisioning.
              </p>
            )}
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Phone Number *
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+251 91 000 0000"
                className={`w-full pl-9 pr-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 ${
                  errors.phone
                    ? 'border-rose-400 focus:ring-rose-200'
                    : 'border-gray-200 focus:ring-[#103321]/20 focus:border-[#103321]'
                }`}
              />
            </div>
            {errors.phone && (
              <p className="text-[11px] text-rose-500 mt-1">{errors.phone}</p>
            )}
          </div>

          {/* Role and Status Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Assigned Role *
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#103321]/20 focus:border-[#103321]"
              >
                <option value="admin">Admin (Full System Access)</option>
                <option value="data_encoder">Data Encoder (Catalog & Inventory Only)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Account Status *
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                disabled={isEdit && user?.isPrimaryAdmin}
                className={`w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#103321]/20 focus:border-[#103321] ${
                  isEdit && user?.isPrimaryAdmin ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Administrative Notes */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Administrative Notes & Responsibilities
            </label>
            <div className="relative">
              <FileText className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <textarea
                rows={2}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Department, special authorizations, or shift notes..."
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#103321]/20 focus:border-[#103321]"
              />
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-[#103321] hover:bg-[#103321]/90 rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4 text-[#95C623]" />
              {isEdit ? 'Save Changes' : 'Create Staff User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
