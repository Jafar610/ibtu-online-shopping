import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authApi } from '../services/api/authApi'
import { AUTH_STORAGE_KEYS } from '../config/apiConfig'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => authApi.getCachedUser())
  const [isInitializing, setIsInitializing] = useState(() => authApi.hasStoredSession())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // 1. Session Restoration on App Startup
  useEffect(() => {
    let isMounted = true

    async function restoreSession() {
      if (!authApi.hasStoredSession()) {
        if (isMounted) setIsInitializing(false)
        return
      }

      try {
        const res = await authApi.getCurrentUser()
        if (isMounted && res.success && res.user) {
          setUser(res.user)
        }
      } catch (err) {
        console.warn('Session restoration failed:', err.message)
        if (isMounted) {
          setUser(null)
          localStorage.removeItem(AUTH_STORAGE_KEYS.TOKEN)
          localStorage.removeItem(AUTH_STORAGE_KEYS.USER)
        }
      } finally {
        if (isMounted) setIsInitializing(false)
      }
    }

    restoreSession()

    // 2. Listen for session expiration events dispatched by API client interceptor
    const handleAuthExpired = () => {
      setUser(null)
      setError('Your session has expired. Please sign in again.')
    }
    window.addEventListener('ibtu:auth:expired', handleAuthExpired)

    return () => {
      isMounted = false
      window.removeEventListener('ibtu:auth:expired', handleAuthExpired)
    }
  }, [])

  // 3. User Login
  const login = useCallback(async ({ email, password }) => {
    setLoading(true)
    setError(null)
    try {
      const res = await authApi.login({ email, password })
      if (res.success && res.user) {
        setUser(res.user)
        return { success: true, user: res.user }
      }
      return { success: false, error: res.message || 'Login failed.' }
    } catch (err) {
      const errorMsg = err.message || 'Invalid email or password.'
      setError(errorMsg)
      return {
        success: false,
        error: errorMsg,
        errors: err.errors || null,
        statusCode: err.statusCode,
      }
    } finally {
      setLoading(false)
    }
  }, [])

  // 4. Customer Registration
  const register = useCallback(async (customerData) => {
    setLoading(true)
    setError(null)
    try {
      // Map both camelCase (frontend) and snake_case (backend) property names
      const payload = {
        first_name: customerData.firstName || customerData.first_name,
        last_name: customerData.lastName || customerData.last_name,
        email: customerData.email,
        phone: customerData.phone || null,
        password: customerData.password,
        confirm_password:
          customerData.confirmPassword ||
          customerData.confirm_password ||
          customerData.password,
      }

      const res = await authApi.register(payload)
      if (res.success && res.user) {
        setUser(res.user)
        return { success: true, user: res.user }
      }
      return { success: false, error: res.message || 'Registration failed.' }
    } catch (err) {
      const errorMsg = err.message || 'Registration failed. Please check your details.'
      setError(errorMsg)
      return {
        success: false,
        error: errorMsg,
        errors: err.errors || null,
        statusCode: err.statusCode,
      }
    } finally {
      setLoading(false)
    }
  }, [])

  // 5. User Logout
  const logout = useCallback(async () => {
    setLoading(true)
    try {
      await authApi.logout()
    } finally {
      setUser(null)
      setError(null)
      setLoading(false)
    }
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const value = {
    user,
    isAuthenticated: Boolean(user),
    isInitializing,
    loading,
    error,
    login,
    register,
    logout,
    clearError,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
