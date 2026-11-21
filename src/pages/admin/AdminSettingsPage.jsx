import { useState } from 'react'
import {
  Store,
  CreditCard,
  Bell,
  Save,
  CheckCircle2,
  AlertTriangle,
  Smartphone,
  Building,
  DollarSign,
  Layers,
} from 'lucide-react'
import AdminLayout from '../../components/admin/AdminLayout'
import AdminBreadcrumb from '../../components/admin/AdminBreadcrumb'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import ConfirmActionModal from '../../components/admin/ConfirmActionModal'
import {
  getStoredAdminSettings,
  updateStoreSettings,
  MOCK_ADMINISTRATION_NOTICE,
} from '../../data/admin/adminAdministrationData'

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState(() => getStoredAdminSettings())
  const [activeTab, setActiveTab] = useState('general')
  const [feedback, setFeedback] = useState(null)
  const [pendingConfirm, setPendingConfirm] = useState(null)

  const showFeedback = (text, type = 'success') => {
    setFeedback({ text, type })
    setTimeout(() => setFeedback(null), 4000)
  }

  const handleGeneralChange = (field, value) => {
    setSettings((prev) => ({
      ...prev,
      general: { ...prev.general, [field]: value },
    }))
  }

  const handleStoreChange = (field, value) => {
    setSettings((prev) => ({
      ...prev,
      store: { ...prev.store, [field]: value },
    }))
  }

  const handlePaymentToggle = (field) => {
    setSettings((prev) => ({
      ...prev,
      payments: { ...prev.payments, [field]: !prev.payments[field] },
    }))
  }

  const handleNotificationToggle = (field) => {
    setSettings((prev) => ({
      ...prev,
      notifications: { ...prev.notifications, [field]: !prev.notifications[field] },
    }))
  }

  const handleSaveCategory = (category) => {
    // If setting maintenance mode, ask confirmation
    if (category === 'store' && settings.store.storeStatus === 'Maintenance') {
      setPendingConfirm({
        category,
        title: 'Enable Store Maintenance Mode?',
        description: 'Putting the storefront in Maintenance mode will display a maintenance banner to public shoppers.',
        actionType: 'warning',
      })
      return
    }

    commitSave(category)
  }

  const commitSave = (category) => {
    const res = updateStoreSettings(category, settings[category])
    if (res.success) {
      showFeedback(`Successfully updated ${category.toUpperCase()} settings and recorded audit trail.`)
      setSettings(getStoredAdminSettings())
    } else {
      showFeedback('Failed to update settings.', 'error')
    }
    setPendingConfirm(null)
  }

  const tabs = [
    { id: 'general', label: 'General Info', icon: Store },
    { id: 'store', label: 'Store & Catalog Rules', icon: Layers },
    { id: 'payments', label: 'Ethiopian Payment Gateways', icon: CreditCard },
    { id: 'notifications', label: 'Notification Preferences', icon: Bell },
  ]

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Breadcrumb */}
        <AdminBreadcrumb
          items={[
            { label: 'Admin', path: '/admin/dashboard' },
            { label: 'Store Settings' },
          ]}
        />

        {/* Page Header */}
        <AdminPageHeader
          title="System Settings & Store Configuration"
          subtitle="Configure business details, Ethiopian VAT rules, regional payment channels, and operational alerts."
        />

        {/* Feedback Alert */}
        {feedback && (
          <div
            className={`p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 animate-in fade-in duration-200 ${
              feedback.type === 'error'
                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            }`}
          >
            {feedback.type === 'error' ? (
              <AlertTriangle className="w-4 h-4 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            )}
            {feedback.text}
          </div>
        )}

        {/* Mock State Notice */}
        <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-600 flex items-center justify-between">
          <span>{MOCK_ADMINISTRATION_NOTICE}</span>
          <span className="font-mono text-[11px] text-gray-400">Environment: Mock Browser Storage</span>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-gray-200">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-[#103321] text-white shadow-xs'
                    : 'bg-white text-gray-600 hover:text-gray-900 border border-gray-200'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#95C623]' : 'text-gray-400'}`} />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* TAB 1: GENERAL SETTINGS */}
        {activeTab === 'general' && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="font-bold text-base text-gray-900">General Brand & Contact Settings</h3>
                <p className="text-xs text-gray-500">Public profile details displayed on the storefront footer and receipt headers.</p>
              </div>
              <button
                onClick={() => handleSaveCategory('general')}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-[#103321] bg-[#95C623] hover:bg-[#95C623]/90 rounded-lg shadow-xs transition-colors"
              >
                <Save className="w-4 h-4" /> Save General Settings
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Store Name</label>
                <input
                  type="text"
                  value={settings.general.storeName}
                  onChange={(e) => handleGeneralChange('storeName', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#103321]/20 focus:border-[#103321]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Corporate Support Email</label>
                <input
                  type="email"
                  value={settings.general.contactEmail}
                  onChange={(e) => handleGeneralChange('contactEmail', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#103321]/20 focus:border-[#103321]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Primary Contact Phone</label>
                <input
                  type="text"
                  value={settings.general.contactPhone}
                  onChange={(e) => handleGeneralChange('contactPhone', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#103321]/20 focus:border-[#103321]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Customer Support Hotline</label>
                <input
                  type="text"
                  value={settings.general.supportPhone}
                  onChange={(e) => handleGeneralChange('supportPhone', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#103321]/20 focus:border-[#103321]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Base Currency</label>
                <input
                  type="text"
                  value={settings.general.defaultCurrency}
                  disabled
                  className="w-full px-3 py-2 text-sm bg-gray-100 text-gray-500 border border-gray-200 rounded-lg cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Platform Time Zone</label>
                <input
                  type="text"
                  value={settings.general.timeZone}
                  disabled
                  className="w-full px-3 py-2 text-sm bg-gray-100 text-gray-500 border border-gray-200 rounded-lg cursor-not-allowed"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 mb-1">Headquarters Physical Address</label>
                <input
                  type="text"
                  value={settings.general.headquartersAddress}
                  onChange={(e) => handleGeneralChange('headquartersAddress', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#103321]/20 focus:border-[#103321]"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 mb-1">Store Slogan & Description</label>
                <textarea
                  rows={2}
                  value={settings.general.storeDescription}
                  onChange={(e) => handleGeneralChange('storeDescription', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#103321]/20 focus:border-[#103321]"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: STORE RULES */}
        {activeTab === 'store' && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="font-bold text-base text-gray-900">Catalog & Order Thresholds</h3>
                <p className="text-xs text-gray-500">Configure low-stock alert triggers, VAT calculation percentages, and delivery limits.</p>
              </div>
              <button
                onClick={() => handleSaveCategory('store')}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-[#103321] bg-[#95C623] hover:bg-[#95C623]/90 rounded-lg shadow-xs transition-colors"
              >
                <Save className="w-4 h-4" /> Save Store Rules
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Storefront Operating Status</label>
                <select
                  value={settings.store.storeStatus}
                  onChange={(e) => handleStoreChange('storeStatus', e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#103321]/20 focus:border-[#103321]"
                >
                  <option value="Active">Active (Open to Public Shoppers)</option>
                  <option value="Maintenance">Maintenance Mode (Store Closed for Updates)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Products Displayed Per Page</label>
                <input
                  type="number"
                  value={settings.store.productsPerPage}
                  onChange={(e) => handleStoreChange('productsPerPage', Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#103321]/20 focus:border-[#103321]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Default Low Stock Alert Threshold (Units)</label>
                <input
                  type="number"
                  value={settings.store.defaultLowStockThreshold}
                  onChange={(e) => handleStoreChange('defaultLowStockThreshold', Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#103321]/20 focus:border-[#103321]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Free Shipping Cart Threshold (ETB)</label>
                <input
                  type="number"
                  value={settings.store.freeShippingThreshold}
                  onChange={(e) => handleStoreChange('freeShippingThreshold', Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#103321]/20 focus:border-[#103321]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Ethiopian Standard VAT Rate (%)</label>
                <input
                  type="number"
                  value={settings.store.vatRatePercent}
                  onChange={(e) => handleStoreChange('vatRatePercent', Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#103321]/20 focus:border-[#103321]"
                />
              </div>

              <div className="flex flex-col justify-center space-y-2 pt-2">
                <label className="flex items-center gap-2 text-xs font-medium text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.store.requirePhoneOnCheckout}
                    onChange={(e) => handleStoreChange('requirePhoneOnCheckout', e.target.checked)}
                    className="w-4 h-4 text-[#103321] rounded border-gray-300"
                  />
                  Enforce Ethiopian phone number validation on checkout
                </label>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: PAYMENT GATEWAYS */}
        {activeTab === 'payments' && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="font-bold text-base text-gray-900">Supported Ethiopian Payment Methods</h3>
                <p className="text-xs text-gray-500">Toggle customer checkout payment options. No live provider credentials required.</p>
              </div>
              <button
                onClick={() => handleSaveCategory('payments')}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-[#103321] bg-[#95C623] hover:bg-[#95C623]/90 rounded-lg shadow-xs transition-colors"
              >
                <Save className="w-4 h-4" /> Save Payment Gateways
              </button>
            </div>

            <div className="space-y-3">
              {[
                {
                  key: 'telebirrEnabled',
                  name: 'Telebirr (Ethio Telecom)',
                  desc: 'Mobile wallet transfer with automated reference verification. Recommended for instant checkout.',
                  icon: Smartphone,
                  color: 'text-emerald-700 bg-emerald-50',
                },
                {
                  key: 'cbeBirrEnabled',
                  name: 'CBE Birr (Commercial Bank of Ethiopia)',
                  desc: 'USSD and mobile banking settlement supported across all national regions.',
                  icon: Building,
                  color: 'text-amber-700 bg-amber-50',
                },
                {
                  key: 'bankTransferEnabled',
                  name: 'Manual Bank Wire (Awash, Dashen, CBE)',
                  desc: 'Direct deposit with customer transfer receipt upload reviewed by administrators.',
                  icon: DollarSign,
                  color: 'text-blue-700 bg-blue-50',
                },
                {
                  key: 'codEnabled',
                  name: 'Cash on Delivery (COD - Addis Ababa Only)',
                  desc: 'Courier collects Birr payment in person upon successful garment delivery inspection.',
                  icon: CreditCard,
                  color: 'text-gray-700 bg-gray-100',
                },
                {
                  key: 'cardEnabled',
                  name: 'Debit & International Credit Cards (Visa / Mastercard)',
                  desc: 'Third-party gateway integration. Currently disabled pending national banking compliance.',
                  icon: CreditCard,
                  color: 'text-purple-700 bg-purple-50',
                },
              ].map((method) => {
                const Icon = method.icon
                const isEnabled = settings.payments[method.key]

                return (
                  <div
                    key={method.key}
                    className="p-4 rounded-xl border border-gray-200 flex items-center justify-between gap-4 hover:border-gray-300 transition-colors"
                  >
                    <div className="flex items-start gap-3.5">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${method.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-gray-900">{method.name}</h4>
                        <p className="text-xs text-gray-500 mt-0.5">{method.desc}</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handlePaymentToggle(method.key)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 ${
                        isEnabled
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                          : 'bg-gray-100 text-gray-500 border border-gray-200'
                      }`}
                    >
                      {isEnabled ? 'Active in Checkout' : 'Disabled'}
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* TAB 4: NOTIFICATIONS */}
        {activeTab === 'notifications' && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="font-bold text-base text-gray-900">Administrative Notification Rules</h3>
                <p className="text-xs text-gray-500">Configure dashboard badge and simulated digest alerts for store events.</p>
              </div>
              <button
                onClick={() => handleSaveCategory('notifications')}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-[#103321] bg-[#95C623] hover:bg-[#95C623]/90 rounded-lg shadow-xs transition-colors"
              >
                <Save className="w-4 h-4" /> Save Notification Rules
              </button>
            </div>

            <div className="space-y-3">
              {[
                {
                  key: 'newOrderAlerts',
                  title: 'New Customer Order Notifications',
                  desc: 'Triggers top navigation notification badge when a new order is placed.',
                },
                {
                  key: 'lowStockAlerts',
                  title: 'Low Inventory Stock Warnings',
                  desc: 'Alerts administrators when a garment drops below the minimum replenishment threshold.',
                },
                {
                  key: 'newCustomerAlerts',
                  title: 'New Customer Account Provisioning',
                  desc: 'Logs a notification when a new customer registers on the storefront.',
                },
                {
                  key: 'contactMessageAlerts',
                  title: 'Contact Form & Support Inquiries',
                  desc: 'Immediately highlights incoming customer messages in the messages center.',
                },
                {
                  key: 'dailySummaryDigest',
                  title: 'Daily Financial & Fulfillment Summary Digest',
                  desc: 'Generates daily morning summary metrics of completed orders and pending dispatches.',
                },
              ].map((n) => {
                const isEnabled = settings.notifications[n.key]
                return (
                  <div
                    key={n.key}
                    onClick={() => handleNotificationToggle(n.key)}
                    className="p-4 rounded-xl border border-gray-200 flex items-center justify-between gap-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <div>
                      <h4 className="font-bold text-xs text-gray-900">{n.title}</h4>
                      <p className="text-xs text-gray-500 mt-0.5">{n.desc}</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={isEnabled}
                      onChange={() => {}} // handled by parent onClick
                      className="w-4 h-4 text-[#103321] rounded border-gray-300 pointer-events-none"
                    />
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Confirmation Modal */}
        {pendingConfirm && (
          <ConfirmActionModal
            isOpen={Boolean(pendingConfirm)}
            title={pendingConfirm.title}
            description={pendingConfirm.description}
            actionType={pendingConfirm.actionType}
            confirmText="Apply Setting"
            onConfirm={() => commitSave(pendingConfirm.category)}
            onCancel={() => setPendingConfirm(null)}
          />
        )}
      </div>
    </AdminLayout>
  )
}
