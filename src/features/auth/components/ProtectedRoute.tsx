import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/features/auth/store/useAuthStore'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'

interface ProtectedRouteProps {
  children: ReactNode
}

/**
 * Wraps a route `element` that requires any authenticated user, regardless
 * of role. While the initial auth check is in flight, renders a full-page
 * spinner instead of flashing a redirect to `/login`.
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const isLoading = useAuthStore((s) => s.isLoading)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const isTwoFactorRequired = useAuthStore((s) => s.isTwoFactorRequired)
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner size="lg" label="Checking your session…" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // If 2FA challenge is required for this session, gate all routes except /2fa
  if (isTwoFactorRequired && location.pathname !== '/2fa') {
    return <Navigate to="/2fa" state={{ from: location }} replace />
  }

  return children
}
