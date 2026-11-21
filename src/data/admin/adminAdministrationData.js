// IBTU Admin Administration Data Architecture: Users, Roles, Coupons, Settings, and Audit Logs
// Adheres strictly to Phase 5 - Step 8.5 (frontendInt12.md) specifications.

export const IS_ADMINISTRATION_MOCK_DATA = true
export const MOCK_ADMINISTRATION_NOTICE =
  'Frontend Mock State: System configuration, staff user management, role permissions, coupon rules, and audit logs are managed in persistent browser storage without backend database or SMTP server dependencies.'

// 1. Initial Staff Users Dataset
export const initialAdminUsers = [
  {
    id: 'usr-101',
    name: 'Alazar Tesfaye',
    firstName: 'Alazar',
    lastName: 'Tesfaye',
    email: 'alazar.t@ibtu.com',
    phone: '+251 91 100 0001',
    role: 'admin',
    status: 'Active',
    avatar: 'AT',
    registrationDate: '2026-01-01T08:00:00Z',
    lastLogin: '2026-03-01T15:30:00Z',
    isPrimaryAdmin: true, // Protected from deactivation
    notes: 'Platform co-founder and lead administrator.',
  },
  {
    id: 'usr-102',
    name: 'Sara Wolde',
    firstName: 'Sara',
    lastName: 'Wolde',
    email: 'sara.w@ibtu.com',
    phone: '+251 91 100 0002',
    role: 'admin',
    status: 'Active',
    avatar: 'SW',
    registrationDate: '2026-01-05T09:15:00Z',
    lastLogin: '2026-02-28T17:45:00Z',
    isPrimaryAdmin: false,
    notes: 'Operations and fulfillment director.',
  },
  {
    id: 'usr-103',
    name: 'Mekdes Kebede',
    firstName: 'Mekdes',
    lastName: 'Kebede',
    email: 'mekdes.k@ibtu.com',
    phone: '+251 92 200 0003',
    role: 'data_encoder',
    status: 'Active',
    avatar: 'MK',
    registrationDate: '2026-01-15T11:00:00Z',
    lastLogin: '2026-03-01T12:20:00Z',
    isPrimaryAdmin: false,
    notes: 'Artisan garment catalog entry & stock counting coordinator.',
  },
  {
    id: 'usr-104',
    name: 'Yohannes Haile',
    firstName: 'Yohannes',
    lastName: 'Haile',
    email: 'yohannes.h@ibtu.com',
    phone: '+251 93 300 0004',
    role: 'data_encoder',
    status: 'Inactive',
    avatar: 'YH',
    registrationDate: '2026-02-01T10:30:00Z',
    lastLogin: '2026-02-15T16:00:00Z',
    isPrimaryAdmin: false,
    notes: 'Seasonal inventory auditing assistant.',
  },
]

// 2. Initial Roles & Permissions Dataset
export const SYSTEM_PERMISSION_GROUPS = [
  {
    id: 'dashboard',
    label: 'Dashboard Overview',
    permissions: [
      { id: 'dashboard.view', name: 'View Dashboard Metrics', description: 'Access KPI statistics, sales charts, and overview cards.' },
    ],
  },
  {
    id: 'catalog',
    label: 'Catalog & Categories',
    permissions: [
      { id: 'products.view', name: 'View Products', description: 'Browse artisan garment listings and details.' },
      { id: 'products.manage', name: 'Manage Products', description: 'Create, edit, and delete catalog garments and variants.' },
      { id: 'categories.view', name: 'View Categories', description: 'Access category taxonomies and descriptions.' },
      { id: 'categories.manage', name: 'Manage Categories', description: 'Create, update, and remove categories.' },
    ],
  },
  {
    id: 'inventory',
    label: 'Inventory Control',
    permissions: [
      { id: 'inventory.view', name: 'View Stock Balances', description: 'Inspect physical, reserved, and available stock levels.' },
      { id: 'inventory.adjust', name: 'Stock Adjustments', description: 'Record batch purchases, returns, and write-offs.' },
    ],
  },
  {
    id: 'sales',
    label: 'Sales, Payments & Logistics',
    permissions: [
      { id: 'orders.view', name: 'View Customer Orders', description: 'Review order details, line snapshots, and statuses.' },
      { id: 'orders.manage', name: 'Manage Orders & Status', description: 'Update status pipeline, add notes, or cancel orders.' },
      { id: 'payments.view', name: 'View Payment Ledgers', description: 'Inspect Telebirr, CBE, and cash transactions.' },
      { id: 'payments.manage', name: 'Verify Payment Receipts', description: 'Approve or reject customer transfer slips.' },
      { id: 'shipments.manage', name: 'Manage Logistics Dispatch', description: 'Create and update courier tracking assignments.' },
      { id: 'coupons.manage', name: 'Manage Discount Coupons', description: 'Configure percentage and fixed promotional vouchers.' },
    ],
  },
  {
    id: 'customers',
    label: 'Customers & Engagement',
    permissions: [
      { id: 'customers.view', name: 'View Customer Accounts', description: 'Inspect customer profiles, order counts, and address books.' },
      { id: 'customers.manage', name: 'Manage Customer Status', description: 'Activate or suspend customer account access.' },
      { id: 'reviews.manage', name: 'Moderate Product Reviews', description: 'Approve or reject public customer garment reviews.' },
      { id: 'messages.manage', name: 'Manage Contact Inquiries', description: 'Reply to customer inquiries and track support cases.' },
    ],
  },
  {
    id: 'administration',
    label: 'Administration & System',
    permissions: [
      { id: 'users.manage', name: 'Manage Staff Accounts', description: 'Create, edit, and assign roles to administrative staff.' },
      { id: 'roles.manage', name: 'Manage RBAC Policies', description: 'Inspect and configure role permission assignments.' },
      { id: 'reports.view', name: 'View Business Reports', description: 'Analyze revenue, customer retention, and export CSVs.' },
      { id: 'settings.manage', name: 'Configure Store Settings', description: 'Update Ethiopian VAT, store contact info, and policies.' },
      { id: 'audit_logs.view', name: 'View Security Audit Trail', description: 'Read-only chronological audit log of staff actions.' },
    ],
  },
]

export const initialAdminRoles = [
  {
    id: 'role-admin',
    name: 'Admin',
    roleKey: 'admin',
    description: 'Full administrative access across all store operations, financials, catalog, staff, and system security.',
    isSystem: true,
    userCount: 2,
    permissions: [
      'dashboard.view',
      'products.view',
      'products.manage',
      'categories.view',
      'categories.manage',
      'inventory.view',
      'inventory.adjust',
      'orders.view',
      'orders.manage',
      'payments.view',
      'payments.manage',
      'shipments.manage',
      'coupons.manage',
      'customers.view',
      'customers.manage',
      'reviews.manage',
      'messages.manage',
      'users.manage',
      'roles.manage',
      'reports.view',
      'settings.manage',
      'audit_logs.view',
    ],
  },
  {
    id: 'role-data-encoder',
    name: 'Data Encoder',
    roleKey: 'data_encoder',
    description: 'Catalog and inventory operations only. Manages garment details, descriptions, images, variants, and stock counts.',
    isSystem: true,
    userCount: 2,
    permissions: [
      'dashboard.view',
      'products.view',
      'products.manage',
      'categories.view',
      'categories.manage',
      'inventory.view',
      'inventory.adjust',
    ],
  },
  {
    id: 'role-customer',
    name: 'Customer',
    roleKey: 'customer',
    description: 'Public storefront customer with browsing, shopping cart, checkout, order tracking, and personal profile permissions.',
    isSystem: true,
    userCount: 1180,
    permissions: [],
  },
]

// 3. Initial Coupons Dataset (Consistent with CheckoutContext)
export const initialAdminCoupons = [
  {
    id: 'cpn-1',
    code: 'HABESHA10',
    description: '10% Ethiopian Heritage Discount for traditional festive wear.',
    type: 'percent', // 'percent' | 'fixed'
    value: 10,
    minOrderAmount: 1000,
    maxDiscountAmount: 1500,
    usageLimit: 500,
    usageCount: 142,
    perCustomerLimit: 2,
    startDate: '2026-01-01',
    expirationDate: '2026-12-31',
    isActive: true,
  },
  {
    id: 'cpn-2',
    code: 'IBTU2026',
    description: '200 ETB New Season Voucher applicable across all garments.',
    type: 'fixed',
    value: 200,
    minOrderAmount: 2500,
    maxDiscountAmount: 200,
    usageLimit: 300,
    usageCount: 88,
    perCustomerLimit: 1,
    startDate: '2026-01-15',
    expirationDate: '2026-06-30',
    isActive: true,
  },
  {
    id: 'cpn-3',
    code: 'FESTIVE25',
    description: '25% Festive Season Celebration voucher for Habesha Kemis.',
    type: 'percent',
    value: 25,
    minOrderAmount: 5000,
    maxDiscountAmount: 2500,
    usageLimit: 100,
    usageCount: 94,
    perCustomerLimit: 1,
    startDate: '2026-01-01',
    expirationDate: '2026-02-28',
    isActive: false, // Expired / Inactive for testing
  },
  {
    id: 'cpn-4',
    code: 'WELCOME500',
    description: '500 ETB Welcome Voucher for first-time premium suit buyers.',
    type: 'fixed',
    value: 500,
    minOrderAmount: 4000,
    maxDiscountAmount: 500,
    usageLimit: 200,
    usageCount: 19,
    perCustomerLimit: 1,
    startDate: '2026-02-01',
    expirationDate: '2026-08-31',
    isActive: true,
  },
]

// 4. Initial Global System Settings Dataset
export const initialAdminSettings = {
  general: {
    storeName: 'ibtu (ሀበሻን ጥበብ)',
    storeDescription: 'Premier Ethiopian Cultural & Modern Fashion E-Commerce Platform.',
    contactEmail: 'contact@ibtu.com',
    contactPhone: '+251 11 551 0422',
    supportPhone: '+251 91 123 4567',
    headquartersAddress: 'Bole Sub-City, Atlas Area, Addis Ababa, Ethiopia',
    defaultCurrency: 'ETB',
    timeZone: 'Africa/Addis_Ababa (UTC+3)',
  },
  store: {
    storeStatus: 'Active', // 'Active' | 'Maintenance'
    productsPerPage: 12,
    defaultLowStockThreshold: 3,
    freeShippingThreshold: 2000,
    vatRatePercent: 15, // Ethiopian standard VAT rate
    allowGuestCheckout: false,
    requirePhoneOnCheckout: true,
  },
  payments: {
    telebirrEnabled: true,
    cbeBirrEnabled: true,
    bankTransferEnabled: true,
    codEnabled: true,
    cardEnabled: false, // Disabled pending gateway provider
  },
  notifications: {
    newOrderAlerts: true,
    lowStockAlerts: true,
    newCustomerAlerts: true,
    contactMessageAlerts: true,
    dailySummaryDigest: true,
  },
}

// 5. Initial Audit Logs Dataset
export const initialAdminAuditLogs = [
  {
    id: 'LOG-2026-001',
    timestamp: '2026-03-01T15:10:00Z',
    userName: 'Alazar Tesfaye',
    userRole: 'admin',
    action: 'Status Change',
    entityType: 'Order',
    entityId: 'ORD-2026-9901',
    description: 'Advanced Order IBTU-9901 status from Confirmed to Processing.',
    oldValue: { orderStatus: 'Confirmed' },
    newValue: { orderStatus: 'Processing', shipmentId: 'SHP-2026-001' },
    ipAddress: '192.168.1.10',
  },
  {
    id: 'LOG-2026-002',
    timestamp: '2026-03-01T14:25:00Z',
    userName: 'Alazar Tesfaye',
    userRole: 'admin',
    action: 'Approved',
    entityType: 'Payment',
    entityId: 'PAY-2026-001',
    description: 'Verified Telebirr customer transfer receipt TEL-99238471.',
    oldValue: { paymentStatus: 'Pending', reviewStatus: 'pending' },
    newValue: { paymentStatus: 'Paid', reviewStatus: 'approved' },
    ipAddress: '192.168.1.10',
  },
  {
    id: 'LOG-2026-003',
    timestamp: '2026-03-01T11:45:00Z',
    userName: 'Sara Wolde',
    userRole: 'admin',
    action: 'Created',
    entityType: 'Shipment',
    entityId: 'SHP-2026-001',
    description: 'Dispatched shipment IBTU-EXP-9901 via IBTU Direct Logistics.',
    oldValue: null,
    newValue: { courierName: 'IBTU Direct Logistics', trackingNumber: 'IBTU-EXP-9901' },
    ipAddress: '192.168.1.12',
  },
  {
    id: 'LOG-2026-004',
    timestamp: '2026-03-01T09:30:00Z',
    userName: 'Mekdes Kebede',
    userRole: 'data_encoder',
    action: 'Stock Adjustment',
    entityType: 'Inventory',
    entityId: 'IBTU-KEM-01-M',
    description: 'Recorded arrival of 10 units for Royal Gondar Habesha Kemis (Size M).',
    oldValue: { physicalStock: 12, availableStock: 10 },
    newValue: { physicalStock: 22, availableStock: 20 },
    ipAddress: '192.168.1.25',
  },
  {
    id: 'LOG-2026-005',
    timestamp: '2026-02-28T16:20:00Z',
    userName: 'Sara Wolde',
    userRole: 'admin',
    action: 'Approved',
    entityType: 'Review',
    entityId: 'REV-2026-001',
    description: 'Approved customer review by Marta Alemu for Women Traditional Dress.',
    oldValue: { status: 'Pending' },
    newValue: { status: 'Approved' },
    ipAddress: '192.168.1.12',
  },
  {
    id: 'LOG-2026-006',
    timestamp: '2026-02-27T18:00:00Z',
    userName: 'Alazar Tesfaye',
    userRole: 'admin',
    action: 'Updated',
    entityType: 'Setting',
    entityId: 'general.headquartersAddress',
    description: 'Updated store headquarters contact address.',
    oldValue: { address: 'Bole Road, Addis Ababa' },
    newValue: { address: 'Bole Sub-City, Atlas Area, Addis Ababa, Ethiopia' },
    ipAddress: '192.168.1.10',
  },
]

// Storage Keys
const STORAGE_KEY_USERS = 'ibtu_admin_users'
const STORAGE_KEY_ROLES = 'ibtu_admin_roles'
const STORAGE_KEY_COUPONS = 'ibtu_admin_coupons'
const STORAGE_KEY_SETTINGS = 'ibtu_admin_settings'
const STORAGE_KEY_AUDIT_LOGS = 'ibtu_admin_audit_logs'

// 6. Data Access & Storage Functions
export function getStoredAdminUsers() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_USERS)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch (err) {
    console.error('Error reading admin users', err)
  }
  return initialAdminUsers
}

export function saveStoredAdminUsers(users) {
  try {
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users))
  } catch (err) {
    console.error('Error saving admin users', err)
  }
}

export function getStoredAdminRoles() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ROLES)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch (err) {
    console.error('Error reading admin roles', err)
  }
  return initialAdminRoles
}

export function saveStoredAdminRoles(roles) {
  try {
    localStorage.setItem(STORAGE_KEY_ROLES, JSON.stringify(roles))
  } catch (err) {
    console.error('Error saving admin roles', err)
  }
}

export function getStoredAdminCoupons() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_COUPONS)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch (err) {
    console.error('Error reading admin coupons', err)
  }
  return initialAdminCoupons
}

export function saveStoredAdminCoupons(coupons) {
  try {
    localStorage.setItem(STORAGE_KEY_COUPONS, JSON.stringify(coupons))
  } catch (err) {
    console.error('Error saving admin coupons', err)
  }
}

export function getStoredAdminSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SETTINGS)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (parsed && typeof parsed === 'object') return parsed
    }
  } catch (err) {
    console.error('Error reading admin settings', err)
  }
  return initialAdminSettings
}

export function saveStoredAdminSettings(settings) {
  try {
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings))
  } catch (err) {
    console.error('Error saving admin settings', err)
  }
}

export function getStoredAdminAuditLogs() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_AUDIT_LOGS)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch (err) {
    console.error('Error reading audit logs', err)
  }
  return initialAdminAuditLogs
}

export function recordAuditLog({
  userName = 'Admin',
  userRole = 'admin',
  action,
  entityType,
  entityId,
  description,
  oldValue = null,
  newValue = null,
}) {
  const logs = getStoredAdminAuditLogs()
  const nextIdx = logs.length + 1
  const newLog = {
    id: `LOG-2026-${String(nextIdx).padStart(3, '0')}`,
    timestamp: new Date().toISOString(),
    userName,
    userRole,
    action,
    entityType,
    entityId,
    description,
    oldValue,
    newValue,
    ipAddress: '192.168.1.10',
  }
  const updated = [newLog, ...logs]
  try {
    localStorage.setItem(STORAGE_KEY_AUDIT_LOGS, JSON.stringify(updated))
  } catch (err) {
    console.error('Error recording audit log', err)
  }
  return newLog
}

// 7. Action Handlers: Users
export function createAdminUser(userData) {
  const users = getStoredAdminUsers()
  const cleanEmail = userData.email?.trim().toLowerCase()

  if (!cleanEmail) return { success: false, message: 'Email address is required.' }
  if (users.some((u) => u.email.toLowerCase() === cleanEmail)) {
    return { success: false, message: `Staff user with email "${cleanEmail}" already exists.` }
  }

  const nextId = `usr-${users.length + 101}`
  const initials = `${userData.firstName?.[0] || 'U'}${userData.lastName?.[0] || 'S'}`.toUpperCase()

  const newUser = {
    id: nextId,
    name: `${userData.firstName} ${userData.lastName}`.trim(),
    firstName: userData.firstName.trim(),
    lastName: userData.lastName.trim(),
    email: cleanEmail,
    phone: userData.phone?.trim() || '+251 91 000 0000',
    role: userData.role || 'data_encoder',
    status: userData.status || 'Active',
    avatar: initials,
    registrationDate: new Date().toISOString(),
    lastLogin: null,
    isPrimaryAdmin: false,
    notes: userData.notes?.trim() || 'Newly invited staff member.',
  }

  const updated = [newUser, ...users]
  saveStoredAdminUsers(updated)

  recordAuditLog({
    action: 'Created',
    entityType: 'User',
    entityId: newUser.id,
    description: `Created new staff user ${newUser.name} with role ${newUser.role}.`,
    newValue: { name: newUser.name, email: newUser.email, role: newUser.role },
  })

  return { success: true, user: newUser }
}

export function updateAdminUser(userId, updates) {
  const users = getStoredAdminUsers()
  const user = users.find((u) => u.id === userId)
  if (!user) return { success: false, message: 'User not found.' }

  // Final administrator check: Cannot deactivate primary admin or change last admin to data encoder
  if (user.isPrimaryAdmin && updates.status && updates.status !== 'Active') {
    return {
      success: false,
      message: 'Security Protection: The primary administrator account cannot be deactivated.',
    }
  }

  const adminCount = users.filter((u) => u.role === 'admin' && u.status === 'Active').length
  if (user.role === 'admin' && updates.role === 'data_encoder' && adminCount <= 1) {
    return {
      success: false,
      message: 'Security Protection: Cannot demote the final active administrator. System requires at least one active admin.',
    }
  }

  const updatedUser = {
    ...user,
    ...updates,
    name: updates.firstName && updates.lastName ? `${updates.firstName} ${updates.lastName}`.trim() : user.name,
  }

  const updated = users.map((u) => (u.id === userId ? updatedUser : u))
  saveStoredAdminUsers(updated)

  recordAuditLog({
    action: 'Updated',
    entityType: 'User',
    entityId: userId,
    description: `Updated staff user profile for ${user.name}.`,
    oldValue: { role: user.role, status: user.status },
    newValue: { role: updatedUser.role, status: updatedUser.status },
  })

  return { success: true, user: updatedUser }
}

export function toggleUserStatus(userId) {
  const users = getStoredAdminUsers()
  const user = users.find((u) => u.id === userId)
  if (!user) return { success: false, message: 'User not found.' }

  if (user.isPrimaryAdmin) {
    return { success: false, message: 'Security Protection: Primary administrator cannot be deactivated.' }
  }

  const nextStatus = user.status === 'Active' ? 'Inactive' : 'Active'

  // Final administrator check
  if (nextStatus === 'Inactive' && user.role === 'admin') {
    const activeAdmins = users.filter((u) => u.role === 'admin' && u.status === 'Active')
    if (activeAdmins.length <= 1) {
      return { success: false, message: 'Cannot deactivate the only remaining active administrator.' }
    }
  }

  return updateAdminUser(userId, { status: nextStatus })
}

// 8. Action Handlers: Roles
export function updateRolePermissions(roleId, newPermissions) {
  const roles = getStoredAdminRoles()
  const role = roles.find((r) => r.id === roleId)
  if (!role) return { success: false, message: 'Role not found.' }

  // Security Protection: Admin role must always retain users.manage, roles.manage, settings.manage
  if (role.roleKey === 'admin') {
    const required = ['users.manage', 'roles.manage', 'settings.manage', 'dashboard.view']
    const hasAll = required.every((p) => newPermissions.includes(p))
    if (!hasAll) {
      return {
        success: false,
        message: 'Security Protection: Critical system administration permissions cannot be stripped from the Admin role.',
      }
    }
  }

  const updatedRole = {
    ...role,
    permissions: newPermissions,
  }

  const updated = roles.map((r) => (r.id === roleId ? updatedRole : r))
  saveStoredAdminRoles(updated)

  recordAuditLog({
    action: 'Updated',
    entityType: 'Role',
    entityId: roleId,
    description: `Modified permission assignments for role ${role.name}. Total permissions: ${newPermissions.length}.`,
    oldValue: { permissionCount: role.permissions.length },
    newValue: { permissionCount: newPermissions.length },
  })

  return { success: true, role: updatedRole }
}

// 9. Action Handlers: Coupons
export function createAdminCoupon(couponData) {
  const coupons = getStoredAdminCoupons()
  const cleanCode = couponData.code?.trim().toUpperCase()

  if (!cleanCode) return { success: false, message: 'Coupon code is required.' }
  if (coupons.some((c) => c.code.toUpperCase() === cleanCode)) {
    return { success: false, message: `Coupon code "${cleanCode}" already exists.` }
  }

  const numVal = Number(couponData.value)
  if (isNaN(numVal) || numVal <= 0) {
    return { success: false, message: 'Discount value must be a positive number.' }
  }
  if (couponData.type === 'percent' && numVal > 100) {
    return { success: false, message: 'Percentage discount cannot exceed 100%.' }
  }

  const nextId = `cpn-${Date.now().toString().slice(-4)}`
  const newCoupon = {
    id: nextId,
    code: cleanCode,
    description: couponData.description?.trim() || 'Promotional Discount Voucher',
    type: couponData.type || 'percent',
    value: numVal,
    minOrderAmount: Number(couponData.minOrderAmount) || 0,
    maxDiscountAmount: Number(couponData.maxDiscountAmount) || numVal,
    usageLimit: Number(couponData.usageLimit) || 100,
    usageCount: 0,
    perCustomerLimit: Number(couponData.perCustomerLimit) || 1,
    startDate: couponData.startDate || new Date().toISOString().slice(0, 10),
    expirationDate: couponData.expirationDate || '2026-12-31',
    isActive: Boolean(couponData.isActive ?? true),
  }

  const updated = [newCoupon, ...coupons]
  saveStoredAdminCoupons(updated)

  recordAuditLog({
    action: 'Created',
    entityType: 'Coupon',
    entityId: newCoupon.id,
    description: `Created discount coupon "${newCoupon.code}" (${newCoupon.value}${newCoupon.type === 'percent' ? '%' : ' ETB'} off).`,
    newValue: newCoupon,
  })

  return { success: true, coupon: newCoupon }
}

export function updateAdminCoupon(couponId, updates) {
  const coupons = getStoredAdminCoupons()
  const coupon = coupons.find((c) => c.id === couponId)
  if (!coupon) return { success: false, message: 'Coupon not found.' }

  if (updates.code) {
    const cleanCode = updates.code.trim().toUpperCase()
    if (coupons.some((c) => c.id !== couponId && c.code.toUpperCase() === cleanCode)) {
      return { success: false, message: `Coupon code "${cleanCode}" already in use.` }
    }
  }

  const updatedCoupon = {
    ...coupon,
    ...updates,
    code: updates.code ? updates.code.trim().toUpperCase() : coupon.code,
    value: updates.value !== undefined ? Number(updates.value) : coupon.value,
  }

  const updated = coupons.map((c) => (c.id === couponId ? updatedCoupon : c))
  saveStoredAdminCoupons(updated)

  recordAuditLog({
    action: 'Updated',
    entityType: 'Coupon',
    entityId: couponId,
    description: `Updated discount coupon "${updatedCoupon.code}".`,
    oldValue: { code: coupon.code, value: coupon.value, isActive: coupon.isActive },
    newValue: { code: updatedCoupon.code, value: updatedCoupon.value, isActive: updatedCoupon.isActive },
  })

  return { success: true, coupon: updatedCoupon }
}

export function deleteAdminCoupon(couponId) {
  const coupons = getStoredAdminCoupons()
  const coupon = coupons.find((c) => c.id === couponId)
  if (!coupon) return { success: false, message: 'Coupon not found.' }

  const updated = coupons.filter((c) => c.id !== couponId)
  saveStoredAdminCoupons(updated)

  recordAuditLog({
    action: 'Deleted',
    entityType: 'Coupon',
    entityId: couponId,
    description: `Deleted discount coupon "${coupon.code}".`,
    oldValue: coupon,
  })

  return { success: true }
}

// 10. Action Handlers: Settings
export function updateStoreSettings(category, keyValues) {
  const current = getStoredAdminSettings()
  const updated = {
    ...current,
    [category]: {
      ...current[category],
      ...keyValues,
    },
  }
  saveStoredAdminSettings(updated)

  recordAuditLog({
    action: 'Updated',
    entityType: 'Setting',
    entityId: category,
    description: `Modified store settings section "${category}".`,
    newValue: keyValues,
  })

  return { success: true, settings: updated }
}
