import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/features/auth/store/useAuthStore'
import type { UserRole } from '@/lib/constants'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'

interface RoleGuardProps {
  allowedRoles: UserRole[]
  children: ReactNode
}

/**
 * Wraps a route `element` that requires the current user's role to be one
 * of `allowedRoles`. Assumes it renders underneath a `ProtectedRoute` (so
 * `user` is expected to be present once loading finishes) — redirects to
 * `/403` rather than `/login` when the role check fails.
 */
export function RoleGuard({ allowedRoles, children }: RoleGuardProps) {
  const isLoading = useAuthStore((s) => s.isLoading)
  const role = useAuthStore((s) => s.user?.role)

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner size="lg" label="Loading…" />
      </div>
    )
  }

  if (!role || !allowedRoles.includes(role)) {
    return <Navigate to="/403" replace />
  }

  return children
}
