import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useAuthStore, selectIsAuthenticated } from '@/features/auth/store/useAuthStore'
import { LocationChip } from '@/components/location/LocationChip'

/** Shared header for every public (signed-out-reachable) discovery page —
 * Home, Search, Nearby, and a mosque's detail page. Extracted so all of
 * them get consistent branding + navigation instead of each page having to
 * remember to render its own (see PublicLayout, which wraps this + Outlet). */
export function PublicHeader() {
  // Selector, not a full destructure — this header only cares whether
  // someone's signed in, not the rest of the auth state.
  const isAuthenticated = useAuthStore(selectIsAuthenticated)

  return (
    <header className="sticky top-0 z-50 flex h-13 sm:h-16 shrink-0 items-center justify-between border-b border-border bg-background/85 backdrop-blur-md px-3.5 sm:px-6 lg:px-8 shadow-xs transition-colors">
      <div className="flex items-center gap-2 sm:gap-4 min-w-0">
        <Link to="/" className="flex items-center gap-2 font-semibold text-foreground shrink-0">
          <span className="flex size-7 sm:size-8 items-center justify-center rounded-md bg-primary text-xs sm:text-sm font-bold text-primary-foreground">
            OM
          </span>
          <span className="text-base sm:text-lg font-bold tracking-tight">OpenMosque</span>
        </Link>
        <LocationChip />
      </div>
      <div className="flex items-center gap-1.5 sm:gap-2">
        {isAuthenticated ? (
          <Button asChild size="sm" className="h-8 sm:h-9 px-3 sm:px-4 text-xs sm:text-sm">
            <Link to="/profile">My Account</Link>
          </Button>
        ) : (
          <>
            <Button asChild variant="ghost" size="sm" className="h-8 sm:h-9 px-2.5 sm:px-3 text-xs sm:text-sm">
              <Link to="/login">Sign in</Link>
            </Button>
            <Button asChild size="sm" className="h-8 sm:h-9 px-3 sm:px-4 text-xs sm:text-sm">
              <Link to="/register">Get started</Link>
            </Button>
          </>
        )}
      </div>
    </header>
  )
}
