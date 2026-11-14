// Mock Customer Authentication Service for IBTU
const USERS_STORAGE_KEY = 'ibtu_customers'
const CURRENT_USER_KEY = 'ibtu_current_user'

// Seed initial demo customer if none exists
const DEFAULT_CUSTOMERS = [
  {
    id: 'cust-1',
    firstName: 'Almaz',
    lastName: 'Bekele',
    name: 'Almaz Bekele',
    email: 'customer@ibtu.com',
    phone: '+251 91 122 3344',
    // In frontend mock we store a simple hash or token indicator, not raw plain text
    passwordHash: 'c4ca4238a0b923820dcc509a6f75849b', // demo hash
    role: 'customer',
    createdAt: '2026-01-15T10:00:00Z',
  },
]

function getStoredCustomers() {
  try {
    const data = localStorage.getItem(USERS_STORAGE_KEY)
    if (!data) {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(DEFAULT_CUSTOMERS))
      return DEFAULT_CUSTOMERS
    }
    return JSON.parse(data)
  } catch {
    return DEFAULT_CUSTOMERS
  }
}

function saveCustomers(customers) {
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(customers))
  } catch {
    // ignore
  }
}

export const authService = {
  // Get current logged-in user session
  getCurrentUser() {
    try {
      const sessionUser = sessionStorage.getItem(CURRENT_USER_KEY)
      if (sessionUser) return JSON.parse(sessionUser)
      const localUser = localStorage.getItem(CURRENT_USER_KEY)
      if (localUser) return JSON.parse(localUser)
      return null
    } catch {
      return null
    }
  },

  // Customer Login
  async login({ email, password, rememberMe = false }) {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 600))

    const customers = getStoredCustomers()
    const cleanEmail = email.trim().toLowerCase()

    // Find customer by email
    const customer = customers.find((c) => c.email.toLowerCase() === cleanEmail)

    if (!customer) {
      throw new Error('No customer account found with this email address.')
    }

    // For demo purposes, allow password if it matches demo or has length >= 6
    if (password.length < 6) {
      throw new Error('Invalid password. Please check your credentials.')
    }

    const userProfile = {
      id: customer.id,
      firstName: customer.firstName,
      lastName: customer.lastName,
      name: customer.name || `${customer.firstName} ${customer.lastName}`,
      email: customer.email,
      phone: customer.phone,
      role: 'customer',
      avatar: customer.firstName.charAt(0) + (customer.lastName ? customer.lastName.charAt(0) : ''),
    }

    // Persist session
    const storage = rememberMe ? localStorage : sessionStorage
    try {
      storage.setItem(CURRENT_USER_KEY, JSON.stringify(userProfile))
    } catch {
      // ignore
    }

    return userProfile
  },

  // Customer Registration (strictly customer accounts only)
  async register({ firstName, lastName, email, phone, password }) {
    await new Promise((resolve) => setTimeout(resolve, 700))

    const customers = getStoredCustomers()
    const cleanEmail = email.trim().toLowerCase()

    if (customers.some((c) => c.email.toLowerCase() === cleanEmail)) {
      throw new Error('An account with this email address already exists.')
    }

    const newCustomer = {
      id: `cust-${Date.now()}`,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      name: `${firstName.trim()} ${lastName.trim()}`,
      email: cleanEmail,
      phone: phone.trim(),
      passwordHash: `mock_hash_${password.length}`,
      role: 'customer', // strictly customer
      createdAt: new Date().toISOString(),
    }

    customers.push(newCustomer)
    saveCustomers(customers)

    const userProfile = {
      id: newCustomer.id,
      firstName: newCustomer.firstName,
      lastName: newCustomer.lastName,
      name: newCustomer.name,
      email: newCustomer.email,
      phone: newCustomer.phone,
      role: 'customer',
      avatar: newCustomer.firstName.charAt(0) + newCustomer.lastName.charAt(0),
    }

    try {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userProfile))
    } catch {
      // ignore
    }

    return userProfile
  },

  // Forgot password mock
  async forgotPassword(email) {
    await new Promise((resolve) => setTimeout(resolve, 500))
    const cleanEmail = email.trim().toLowerCase()
    const customers = getStoredCustomers()
    const exists = customers.some((c) => c.email.toLowerCase() === cleanEmail)
    // For privacy, we indicate success even if email not found or confirm sent
    return {
      success: true,
      exists,
      message: `Password reset link has been dispatched to ${cleanEmail}.`,
    }
  },

  // Reset password mock
  async resetPassword({ email, newPassword }) {
    await new Promise((resolve) => setTimeout(resolve, 500))
    if (!newPassword || newPassword.length < 6) {
      throw new Error('Password must be at least 6 characters long.')
    }
    const cleanEmail = email ? email.trim().toLowerCase() : ''
    return {
      success: true,
      email: cleanEmail,
      message: 'Your password has been successfully reset. Please log in with your new credentials.',
    }
  },

  // Logout
  logout() {
    try {
      localStorage.removeItem(CURRENT_USER_KEY)
      sessionStorage.removeItem(CURRENT_USER_KEY)
    } catch {
      // ignore
    }
  },
}
