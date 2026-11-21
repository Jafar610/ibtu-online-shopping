// IBTU Admin Dashboard Navigation Configuration
// Grouped according to Phase 5 - Step 7 specifications with role-based filtering

export const ADMIN_NAV_GROUPS = [
  {
    id: 'overview',
    label: 'Overview',
    items: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        path: '/admin/dashboard',
        icon: 'LayoutDashboard',
        roles: ['admin', 'data_encoder'],
      },
    ],
  },
  {
    id: 'catalog',
    label: 'Catalog Management',
    items: [
      {
        id: 'products',
        label: 'Products',
        path: '/admin/products',
        icon: 'Shirt',
        roles: ['admin', 'data_encoder'],
        badge: '86',
      },
      {
        id: 'categories',
        label: 'Categories',
        path: '/admin/categories',
        icon: 'Layers',
        roles: ['admin', 'data_encoder'],
      },
    ],
  },
  {
    id: 'sales',
    label: 'Sales Management',
    items: [
      {
        id: 'orders',
        label: 'Orders',
        path: '/admin/orders',
        icon: 'ShoppingBag',
        roles: ['admin'],
        badge: '18',
        badgeColor: 'amber',
      },
      {
        id: 'payments',
        label: 'Payments',
        path: '/admin/payments',
        icon: 'CreditCard',
        roles: ['admin'],
      },
      {
        id: 'shipments',
        label: 'Shipments',
        path: '/admin/shipments',
        icon: 'Truck',
        roles: ['admin'],
      },
      {
        id: 'coupons',
        label: 'Coupons & Discounts',
        path: '/admin/coupons',
        icon: 'Tag',
        roles: ['admin'],
      },
    ],
  },
  {
    id: 'inventory',
    label: 'Inventory',
    items: [
      {
        id: 'inventory',
        label: 'Inventory Control',
        path: '/admin/inventory',
        icon: 'Boxes',
        roles: ['admin', 'data_encoder'],
        badge: '5 Low',
        badgeColor: 'rose',
      },
      {
        id: 'inventory-movements',
        label: 'Stock Movements',
        path: '/admin/inventory/movements',
        icon: 'ScrollText',
        roles: ['admin', 'data_encoder'],
      },
    ],
  },
  {
    id: 'customers',
    label: 'Customers & Engagement',
    items: [
      {
        id: 'customers',
        label: 'Customers',
        path: '/admin/customers',
        icon: 'Users',
        roles: ['admin'],
      },
      {
        id: 'reviews',
        label: 'Product Reviews',
        path: '/admin/reviews',
        icon: 'Star',
        roles: ['admin'],
      },
      {
        id: 'messages',
        label: 'Contact Messages',
        path: '/admin/messages',
        icon: 'MessageSquare',
        roles: ['admin'],
        badge: '3',
      },
    ],
  },
  {
    id: 'administration',
    label: 'Administration & System',
    items: [
      {
        id: 'users',
        label: 'Staff Users',
        path: '/admin/users',
        icon: 'UserCheck',
        roles: ['admin'],
      },
      {
        id: 'roles',
        label: 'Roles & Permissions',
        path: '/admin/roles',
        icon: 'Shield',
        roles: ['admin'],
      },
      {
        id: 'reports',
        label: 'Reports & Analytics',
        path: '/admin/reports',
        icon: 'BarChart3',
        roles: ['admin'],
      },
      {
        id: 'settings',
        label: 'Store Settings',
        path: '/admin/settings',
        icon: 'Settings',
        roles: ['admin'],
      },
      {
        id: 'audit-logs',
        label: 'Audit Logs',
        path: '/admin/audit-logs',
        icon: 'ScrollText',
        roles: ['admin'],
      },
    ],
  },
]

/**
 * Filter navigation groups and items based on the user's role.
 * Admin: receives full navigation.
 * Data Encoder: receives Catalog & Inventory management.
 */
export function getFilteredAdminNavigation(userRole = 'admin') {
  const normalizedRole = userRole?.toLowerCase() || 'admin'

  return ADMIN_NAV_GROUPS.map((group) => {
    const filteredItems = group.items.filter((item) => {
      if (!item.roles || item.roles.length === 0) return true
      return item.roles.includes(normalizedRole)
    })

    return {
      ...group,
      items: filteredItems,
    }
  }).filter((group) => group.items.length > 0)
}
