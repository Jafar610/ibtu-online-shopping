import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children, allowedRoles = ['customer'] }) {
  const { isAuthenticated, loading, isInitializing, user } = useAuth()
  const location = useLocation()

  // Wait for initial session restoration before deciding to redirect
  if (isInitializing || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA]">
        <div className="w-8 h-8 border-3 border-[#103321] border-t-[#95C623] rounded-full animate-spin" />
      </div>
    )
  }

  // Unauthenticated users are redirected to login, preserving intended path
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Ensure Admin and Data Encoder users are routed appropriately
  // If allowedRoles is defined and user has a role, verify role is permitted
  if (allowedRoles && allowedRoles.length > 0 && user?.role) {
    const userRole = user.role.toLowerCase()
    const userRolesList = Array.isArray(user.roles) ? user.roles.map((r) => r.toLowerCase()) : [userRole]
    const hasAllowedRole = allowedRoles.some((r) => {
      const targetRole = r.toLowerCase()
      return userRole === targetRole || userRolesList.includes(targetRole)
    })

    if (!hasAllowedRole) {
      // If customer attempts admin access, redirect to home
      // If admin attempts customer-only checkout, redirect to dashboard or home
      if (userRole === 'admin' || userRole === 'data_encoder') {
        return <Navigate to="/admin/dashboard" replace />
      }
      return <Navigate to="/" replace />
    }
  }

  return children
}
