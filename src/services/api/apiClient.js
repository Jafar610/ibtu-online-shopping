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
import { API_BASE_URL, API_TIMEOUT, AUTH_STORAGE_KEYS } from '../../config/apiConfig'
import { handleApiError } from './apiErrorHandler'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

// Request Interceptor: Attach JWT Bearer token if present
apiClient.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem(AUTH_STORAGE_KEYS.TOKEN)
      if (token && !config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${token}`
      }
    } catch (e) {
      console.warn('Could not read auth token from localStorage', e)
    }
    return config
  },
  (error) => {
    return Promise.reject(handleApiError(error))
  }
)

// Response Interceptor: Standardize response & handle 401 token expiry
apiClient.interceptors.response.use(
  (response) => {
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
