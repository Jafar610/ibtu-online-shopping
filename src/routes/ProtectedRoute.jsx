import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children, allowedRoles = ['customer'] }) {
  const { isAuthenticated, loading, user } = useAuth()
  const location = useLocation()

  if (loading) {
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

  // Ensure Admin and Data Encoder users are not treated as customers
  // If allowedRoles is defined and user has a role, verify role is permitted
  if (allowedRoles && allowedRoles.length > 0 && user?.role) {
    if (!allowedRoles.includes(user.role)) {
      return <Navigate to="/" replace />
    }
  }

  return children
}
