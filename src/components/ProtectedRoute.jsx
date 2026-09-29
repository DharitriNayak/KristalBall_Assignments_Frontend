import { Navigate } from 'react-router-dom'
import { canAccess, useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children, path }) {
  const { user } = useAuth()
  if (!user) {
    return <Navigate to="/login" replace />
  }
  if (path && !canAccess(user.role, path)) {
    return <Navigate to="/dashboard" replace />
  }
  return children
}
