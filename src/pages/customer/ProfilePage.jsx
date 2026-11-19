import { useState } from 'react'
import { User, Mail, Phone, Save, RotateCcw, CheckCircle2, AlertCircle, Info, ShieldCheck } from 'lucide-react'
import CustomerLayout from '../../components/customer/CustomerLayout'
import { useAuth } from '../../context/AuthContext'

export default function ProfilePage() {
  const { user } = useAuth()

  const [formData, setFormData] = useState({
    firstName: user?.firstName || (user?.name ? user.name.split(' ')[0] : 'Almaz'),
    lastName: user?.lastName || (user?.name ? user.name.split(' ').slice(1).join(' ') : 'Bekele'),
    email: user?.email || 'almaz.bekele@ibtu.com',
    phone: user?.phone || '+251 91 122 3344',
  })

  const [initialData, setInitialData] = useState({ ...formData })
  const [errors, setErrors] = useState({})
  const [isSaving, setIsSaving] = useState(false)
  const [notification, setNotification] = useState(null)

  const validate = () => {
    const errs = {}
    if (!formData.firstName.trim()) {
      errs.firstName = 'First name is required.'
    } else if (formData.firstName.trim().length < 2) {
      errs.firstName = 'First name must be at least 2 characters.'
    }

    if (!formData.lastName.trim()) {
      errs.lastName = 'Last name is required.'
    } else if (formData.lastName.trim().length < 2) {
      errs.lastName = 'Last name must be at least 2 characters.'
    }

    if (!formData.email.trim()) {
      errs.email = 'Email address is required.'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errs.email = 'Please enter a valid email address.'
    }

    if (!formData.phone.trim()) {
      errs.phone = 'Phone number is required.'
    } else if (!/^\+?[0-9\s-]{9,16}$/.test(formData.phone.trim())) {
      errs.phone = 'Please enter a valid phone number (e.g. +251 91 122 3344).'
    }

    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }))
    }
    if (notification) setNotification(null)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) return

    setIsSaving(true)
    setTimeout(() => {
      setIsSaving(false)
      setInitialData({ ...formData })

      // Persist to session storage for demo persistence
      try {
        const stored = sessionStorage.getItem('ibtu_current_user')
        if (stored) {
          const parsed = JSON.parse(stored)
          const updated = {
            ...parsed,
            firstName: formData.firstName.trim(),
            lastName: formData.lastName.trim(),
            name: `${formData.firstName.trim()} ${formData.lastName.trim()}`,
            email: formData.email.trim(),
            phone: formData.phone.trim(),
          }
          sessionStorage.setItem('ibtu_current_user', JSON.stringify(updated))
        }
      } catch {
        // ignore
      }

      setNotification({
        type: 'success',
        message: 'Profile details updated successfully (Frontend Demonstration).',
      })
    }, 600)
  }

  const handleCancel = () => {
    setFormData({ ...initialData })
    setErrors({})
    setNotification(null)
  }

  const hasChanges =
    formData.firstName !== initialData.firstName ||
    formData.lastName !== initialData.lastName ||
    formData.email !== initialData.email ||
    formData.phone !== initialData.phone

  return (
    <CustomerLayout
      title="Personal Profile"
      subtitle="Manage your personal contact information and delivery preferences."
      breadcrumbs={[{ label: 'My Profile' }]}
    >
      <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-xs space-y-6">
        <div>
          <h3 className="font-serif text-xl font-bold text-[#103321]">
            Customer Account Details
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Keep your contact details up to date for smooth order confirmations and shipping delivery notifications.
          </p>
        </div>

        {/* Feedback Alert */}
        {notification && (
          <div
            className={`p-4 rounded-xl border flex items-start gap-3 text-xs animate-fadeIn ${
              notification.type === 'success'
                ? 'bg-[#95C623]/15 border-[#95C623]/30 text-[#103321]'
                : 'bg-red-50 border-red-200 text-red-700'
            }`}
          >
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-[#95C623] shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            )}
            <span className="font-semibold">{notification.message}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          {/* Row 1: First Name & Last Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                First Name <span className="text-red-500">*</span>
              </label>
              <div className="relative rounded-xl">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => handleChange('firstName', e.target.value)}
                  className={`w-full py-3 pl-10 pr-4 text-xs sm:text-sm bg-white rounded-xl border transition-all ${
                    errors.firstName
                      ? 'border-red-400 focus:ring-red-200 bg-red-50/20'
                      : 'border-gray-200 focus:border-[#95C623] focus:ring-2 focus:ring-[#95C623]/20'
                  }`}
                  placeholder="e.g. Almaz"
                />
              </div>
              {errors.firstName && (
                <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>{errors.firstName}</span>
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Last Name <span className="text-red-500">*</span>
              </label>
              <div className="relative rounded-xl">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => handleChange('lastName', e.target.value)}
                  className={`w-full py-3 pl-10 pr-4 text-xs sm:text-sm bg-white rounded-xl border transition-all ${
                    errors.lastName
                      ? 'border-red-400 focus:ring-red-200 bg-red-50/20'
                      : 'border-gray-200 focus:border-[#95C623] focus:ring-2 focus:ring-[#95C623]/20'
                  }`}
                  placeholder="e.g. Bekele"
                />
              </div>
              {errors.lastName && (
                <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>{errors.lastName}</span>
                </p>
              )}
            </div>
          </div>

          {/* Row 2: Email & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative rounded-xl">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className={`w-full py-3 pl-10 pr-4 text-xs sm:text-sm bg-white rounded-xl border transition-all ${
                    errors.email
                      ? 'border-red-400 focus:ring-red-200 bg-red-50/20'
                      : 'border-gray-200 focus:border-[#95C623] focus:ring-2 focus:ring-[#95C623]/20'
                  }`}
                  placeholder="almaz@example.com"
                />
              </div>
              {errors.email && (
                <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>{errors.email}</span>
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <div className="relative rounded-xl">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  className={`w-full py-3 pl-10 pr-4 text-xs sm:text-sm bg-white rounded-xl border transition-all ${
                    errors.phone
                      ? 'border-red-400 focus:ring-red-200 bg-red-50/20'
                      : 'border-gray-200 focus:border-[#95C623] focus:ring-2 focus:ring-[#95C623]/20'
                  }`}
                  placeholder="+251 91 122 3344"
                />
              </div>
              {errors.phone && (
                <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>{errors.phone}</span>
                </p>
              )}
            </div>
          </div>

          {/* Account Security Notice */}
          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 flex items-start gap-3 text-xs text-gray-600">
            <ShieldCheck className="w-5 h-5 text-[#95C623] shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-[#103321]">Account Role & Security</p>
              <p className="text-[11px] text-gray-500 mt-0.5">
                Role: <span className="font-semibold text-gray-700 capitalize">{user?.role || 'Customer'}</span>. Passwords and credentials are cryptographically protected and cannot be modified directly from basic profile editing.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={handleCancel}
              disabled={!hasChanges || isSaving}
              className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-semibold text-xs hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Cancel</span>
            </button>

            <button
              type="submit"
              disabled={!hasChanges || isSaving}
              className="px-6 py-2.5 rounded-xl bg-[#103321] text-white hover:bg-[#95C623] hover:text-[#103321] font-bold text-xs transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2"
            >
              {isSaving ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </CustomerLayout>
  )
}
