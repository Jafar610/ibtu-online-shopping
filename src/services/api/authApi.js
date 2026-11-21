/**
 * IBTU E-Commerce Frontend
 * src/services/api/authApi.js
 *
 * Dedicated Authentication API Service communicating with Express backend.
 * Endpoints:
 * - POST /api/auth/login
 * - POST /api/auth/register
 * - GET  /api/auth/me
 * - GET  /api/auth/permissions
 * - POST /api/auth/logout
 */

import apiClient from './apiClient'
import { API_ENDPOINTS, AUTH_STORAGE_KEYS } from '../../config/apiConfig'

/**
 * Normalizes backend user record into consistent frontend format.
 * Maps first_name + last_name to name, roles to primary role, and generates avatar initials.
 */
export function normalizeUser(rawUser) {
  if (!rawUser) return null

  const roles = Array.isArray(rawUser.roles) ? rawUser.roles : []
  // Normalize primary role to lowercase for router compatibility ('admin', 'data_encoder', 'customer')
  const rawRole = roles[0] || rawUser.role || 'customer'
  const normalizedRole = String(rawRole).toLowerCase().replace(/\s+/g, '_')

  const firstName = rawUser.first_name || rawUser.firstName || ''
  const lastName = rawUser.last_name || rawUser.lastName || ''
  const initials = `${firstName[0] || 'U'}${lastName[0] || 'S'}`.toUpperCase()

  return {
    id: rawUser.id,
    firstName,
    lastName,
    name: `${firstName} ${lastName}`.trim() || rawUser.email,
    email: rawUser.email,
    phone: rawUser.phone || null,
    isActive: Boolean(rawUser.is_active ?? true),
    role: normalizedRole,
    roles: roles.map((r) => String(r).toLowerCase().replace(/\s+/g, '_')),
    avatar: initials,
    createdAt: rawUser.created_at,
    lastLoginAt: rawUser.last_login_at,
  }
}

export const authApi = {
  /**
   * Log in user with email & password
   * @param {object} credentials - { email, password }
   * @returns {Promise<{ token: string, user: object }>}
   */
  async login({ email, password }) {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.LOGIN, {
      email: email.trim(),
      password,
    })

    const { token, user } = response.data || {}
    const safeUser = normalizeUser(user)

    if (token) {
      localStorage.setItem(AUTH_STORAGE_KEYS.TOKEN, token)
      localStorage.setItem(AUTH_STORAGE_KEYS.USER, JSON.stringify(safeUser))
    }

    return {
      success: true,
      message: response.message || 'Login successful.',
      token,
      user: safeUser,
    }
  },

  /**
   * Register a new Customer account
   * @param {object} customerData - { first_name, last_name, email, phone, password, confirm_password }
   * @returns {Promise<{ token: string, user: object }>}
   */
  async register({
    first_name,
    last_name,
    email,
    phone,
    password,
    confirm_password,
  }) {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.REGISTER, {
      first_name: first_name?.trim(),
      last_name: last_name?.trim(),
      email: email?.trim(),
      phone: phone?.trim() || null,
      password,
      confirm_password: confirm_password || password,
    })

    const { token, user } = response.data || {}
    const safeUser = normalizeUser(user)

    if (token) {
      localStorage.setItem(AUTH_STORAGE_KEYS.TOKEN, token)
      localStorage.setItem(AUTH_STORAGE_KEYS.USER, JSON.stringify(safeUser))
    }

    return {
      success: true,
      message: response.message || 'Registration successful. Welcome to IBTU!',
      token,
      user: safeUser,
    }
  },

  /**
   * Get authenticated user profile via JWT
   * @returns {Promise<{ user: object }>}
   */
  async getCurrentUser() {
    const response = await apiClient.get(API_ENDPOINTS.AUTH.ME)
    const user = response.data?.user || response.data
    const safeUser = normalizeUser(user)

    if (safeUser) {
      localStorage.setItem(AUTH_STORAGE_KEYS.USER, JSON.stringify(safeUser))
    }

    return {
      success: true,
      user: safeUser,
    }
  },

  /**
   * Get authenticated user permissions and roles
   * @returns {Promise<object>}
   */
  async getUserPermissions() {
    const response = await apiClient.get(API_ENDPOINTS.AUTH.PERMISSIONS)
    return response.data || {}
  },

  /**
   * Terminate session
   */
  async logout() {
    try {
      await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT)
    } catch {
      // Ignore network errors on logout
    } finally {
      localStorage.removeItem(AUTH_STORAGE_KEYS.TOKEN)
      localStorage.removeItem(AUTH_STORAGE_KEYS.USER)
    }
    return { success: true }
  },

  /**
   * Check if token is present in storage
   */
  hasStoredSession() {
    try {
      return Boolean(localStorage.getItem(AUTH_STORAGE_KEYS.TOKEN))
    } catch {
      return false
    }
  },

  /**
   * Retrieve cached user object from storage
   */
  getCachedUser() {
    try {
      const raw = localStorage.getItem(AUTH_STORAGE_KEYS.USER)
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  },
}
