import { createContext, useContext, useState, useCallback } from 'react'
import { authService } from '../services/authService'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => authService.getCurrentUser())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const login = useCallback(async ({ email, password, rememberMe }) => {
    setLoading(true)
    setError(null)
    try {
      const loggedInUser = await authService.login({ email, password, rememberMe })
      setUser(loggedInUser)
      return { success: true, user: loggedInUser }
    } catch (err) {
      setError(err.message || 'Failed to sign in. Please try again.')
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }, [])

  const register = useCallback(async (customerData) => {
    setLoading(true)
    setError(null)
    try {
      const registeredUser = await authService.register(customerData)
      setUser(registeredUser)
      return { success: true, user: registeredUser }
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.')
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    authService.logout()
    setUser(null)
    setError(null)
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const value = {
    user,
    isAuthenticated: Boolean(user),
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
