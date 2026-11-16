// IBTU Authentication Service (Frontend Architecture)
// Note: Backend authentication API is not yet connected in this milestone.
// Passwords are never stored in localStorage, sessionStorage, or browser storage.

const CURRENT_USER_KEY = 'ibtu_current_user'

export const authService = {
  isBackendConnected: false,

  // Get current session (if any)
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

  // Customer Login (Frontend demonstration mode)
  async login({ email, password }) {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 600))

    if (!email || !password) {
      throw new Error('Email and password are required.')
    }

    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters.')
    }

    // Backend is not yet connected per Phase 5 Step 3 specification:
    // Do not create fake successful authentication or store passwords in persistent storage.
    return {
      success: false,
      isDemo: true,
      message:
        'Frontend Demonstration: Credentials validated successfully. The backend authentication API is not yet connected — real login will be enabled upon backend integration.',
    }
  },

  // Customer Registration (Frontend demonstration mode)
  async register({ firstName, lastName, email, phone, password }) {
    await new Promise((resolve) => setTimeout(resolve, 700))

    if (!firstName || !lastName || !email || !phone || !password) {
      throw new Error('All required registration fields must be completed.')
    }

    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters.')
    }

    // Backend is not yet connected:
    // Do not claim that a customer account has been created without real backend API confirmation.
    return {
      success: false,
      isDemo: true,
      message:
        'Frontend Demonstration: Registration details validated successfully. Customer account creation will be completed once the backend registration API is connected.',
    }
  },

  // Forgot Password (Frontend demonstration mode)
  async forgotPassword(email) {
    await new Promise((resolve) => setTimeout(resolve, 500))

    if (!email) {
      throw new Error('Email address is required.')
    }

    return {
      success: false,
      isDemo: true,
      message:
        'Frontend Demonstration: Email address validated successfully. Password reset email dispatch is pending backend mail service integration.',
    }
  },

  // Reset Password (Frontend demonstration mode)
  async resetPassword({ newPassword }) {
    await new Promise((resolve) => setTimeout(resolve, 500))

    if (!newPassword || newPassword.length < 6) {
      throw new Error('Password must be at least 6 characters long.')
    }

    return {
      success: false,
      isDemo: true,
      message:
        'Frontend Demonstration: New password requirements met. Password update cannot be finalized because the backend authentication API is not yet connected.',
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
