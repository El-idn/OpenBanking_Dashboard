import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/app/AuthProvider'
import { canAccessRoute } from '@/lib/rbac'

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, mfaPending, activeRole } = useAuth()
  const location = useLocation()

  if (mfaPending) {
    return <Navigate to="/mfa" replace />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (activeRole && !canAccessRoute(activeRole, location.pathname)) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}

export function GuestRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, mfaPending } = useAuth()

  if (mfaPending) {
    return <Navigate to="/mfa" replace />
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}

export function MfaRoute({ children }: { children: React.ReactNode }) {
  const { mfaPending, isAuthenticated } = useAuth()

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  if (!mfaPending) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
