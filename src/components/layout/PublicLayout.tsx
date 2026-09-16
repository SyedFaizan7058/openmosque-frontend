import { Outlet, ScrollRestoration } from 'react-router-dom'
import { PublicHeader } from '@/components/layout/PublicHeader'
import { Footer } from '@/components/layout/Footer'
import { LocationModal } from '@/components/location/LocationModal'

/** Layout shell for public discovery routes (Home, Search, Nearby, a
 * mosque's detail page). Mirrors how `AppLayout` wraps the authenticated
 * routes with a persistent shell — every child route renders through
 * `Outlet` with `PublicHeader` and `Footer` always present. */
export function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <ScrollRestoration />
      <PublicHeader />
      <main className="flex-1 flex flex-col min-h-0">
        <Outlet />
      </main>
      <Footer />
      <LocationModal />
    </div>
  )
}
