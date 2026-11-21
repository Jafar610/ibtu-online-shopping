/**
 * IBTU E-Commerce Frontend
 * src/services/api/apiClient.js
 *
 * Centralized Axios API Client instance configured with:
 * - Base URL from environment
 * - Consistent timeout
 * - Request interceptor (JWT Bearer token injection)
 * - Response interceptor (normalized error handling & token expiry handling)
 */

import axios from 'axios'
import { API_BASE_URL, API_TIMEOUT, AUTH_STORAGE_KEYS, CART_STORAGE_KEYS } from '../../config/apiConfig'
import { handleApiError } from './apiErrorHandler'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

// Request Interceptor: Attach JWT Bearer token if present, or guest cart token
apiClient.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem(AUTH_STORAGE_KEYS.TOKEN)
      if (token && !config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${token}`
      } else if (!token) {
        const guestToken = localStorage.getItem(CART_STORAGE_KEYS.GUEST_TOKEN)
        if (guestToken && !config.headers['X-Guest-Token']) {
          config.headers['X-Guest-Token'] = guestToken
        }
      }
    } catch (e) {
      console.warn('Could not read auth/cart token from localStorage', e)
    }
    return config
  },
  (error) => {
    return Promise.reject(handleApiError(error))
  }
)

// Response Interceptor: Standardize response, capture guest tokens & handle 401 token expiry
apiClient.interceptors.response.use(
  (response) => {
    // If backend returns a new guest token, persist it in storage
    const newGuestToken = response.headers?.['x-guest-token'] || response.data?.meta?.guest_token
    if (newGuestToken) {
      try {
        localStorage.setItem(CART_STORAGE_KEYS.GUEST_TOKEN, newGuestToken)
      } catch (e) {
        console.warn('Could not persist guest token to localStorage', e)
      }
    }

    // Return standard backend data payload directly
    return response.data
  },
  (error) => {
    if (error.response?.status === 401) {
      // If server explicitly reports expired or invalid token
      const isAuthRoute = error.config?.url?.includes('/auth/login') || error.config?.url?.includes('/auth/register')
      if (!isAuthRoute) {
        try {
          localStorage.removeItem(AUTH_STORAGE_KEYS.TOKEN)
          localStorage.removeItem(AUTH_STORAGE_KEYS.USER)
          window.dispatchEvent(new CustomEvent('ibtu:auth:expired'))
        } catch {
          // ignore
        }
      }
    }

    return Promise.reject(handleApiError(error))
  }
)

export default apiClient
