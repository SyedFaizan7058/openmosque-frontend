import { useEffect } from 'react'
import { Outlet, ScrollRestoration, useLocation } from 'react-router-dom'
import { Sidebar } from '@/components/layout/Sidebar'
import { TopBar } from '@/components/layout/TopBar'
import { Footer } from '@/components/layout/Footer'
import { LocationModal } from '@/components/location/LocationModal'
import { useFcmDeviceRegistration } from '@/features/notifications/hooks/useFcmDeviceRegistration'

/** The authenticated app shell: sidebar + top bar + routed page content +
 * footer. Rendered as a layout route so every nested page automatically
 * gets the shell without repeating this wiring per-page. */
export function AppLayout() {
  useFcmDeviceRegistration()
  const location = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
    const prevBodyOverflow = document.body.style.overflow
    const prevHtmlOverflow = document.documentElement.style.overflow
    document.body.style.overflow = 'hidden'
    document.documentElement.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prevBodyOverflow
      document.documentElement.style.overflow = prevHtmlOverflow
    }
  }, [location.pathname])

  return (
    <div className="flex h-screen max-h-screen w-full overflow-hidden bg-background">
      <ScrollRestoration />
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col h-full max-h-screen min-h-0 overflow-hidden">
        <TopBar />
        <main className="flex-1 min-h-0 overflow-y-auto flex flex-col justify-between">
          <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8 flex-1">
            <Outlet />
          </div>
          <Footer variant="compact" />
        </main>
      </div>
      <LocationModal />
    </div>
  )
}
