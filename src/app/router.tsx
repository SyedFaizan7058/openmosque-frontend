import { lazy, Suspense } from 'react'
import { createBrowserRouter, Outlet } from 'react-router-dom'
import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute'
import { RoleGuard } from '@/features/auth/components/RoleGuard'
import { AppLayout } from '@/components/layout/AppLayout'
import { PublicLayout } from '@/components/layout/PublicLayout'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { ROLES } from '@/lib/constants'

import HomePage from '@/pages/public/HomePage'
import SearchMosquesPage from '@/pages/public/SearchMosquesPage'
import NearbyMosquesPage from '@/pages/public/NearbyMosquesPage'

// Lazy-loaded: pulls in the Leaflet + leaflet.markercluster chunk (real
// bundle weight — Phase 1 already flagged the >500kB warning) only when a
// visitor actually opens a mosque's detail page.
const MosqueDetailPage = lazy(() => import('@/pages/public/MosqueDetailPage'))

import LoginPage from '@/pages/auth/LoginPage'
import RegisterPage from '@/pages/auth/RegisterPage'
import TwoFactorPage from '@/pages/auth/TwoFactorPage'

import ProfilePage from '@/pages/user/ProfilePage'
import FavoritesPage from '@/pages/user/FavoritesPage'
import NotificationsPage from '@/pages/user/NotificationsPage'
import SubmitMosquePage from '@/pages/user/SubmitMosquePage'
import SecuritySettingsPage from '@/pages/user/SecuritySettingsPage'

import MosqueAdminDashboard from '@/pages/mosqueAdmin/MosqueAdminDashboard'
import PrayerConfigPage from '@/pages/mosqueAdmin/PrayerConfigPage'
import EventManagementPage from '@/pages/mosqueAdmin/EventManagementPage'
import KhutbahManagementPage from '@/pages/mosqueAdmin/KhutbahManagementPage'
import MosqueProfileEditPage from '@/pages/mosqueAdmin/MosqueProfileEditPage'

import ModeratorDashboard from '@/pages/moderator/ModeratorDashboard'
import SubmissionQueuePage from '@/pages/moderator/SubmissionQueuePage'
import ClaimQueuePage from '@/pages/moderator/ClaimQueuePage'
import FlagQueuePage from '@/pages/moderator/FlagQueuePage'
import OsmIngestionPage from '@/pages/moderator/OsmIngestionPage'
import PlatformStatsPage from '@/pages/moderator/PlatformStatsPage'

import SuperAdminDashboard from '@/pages/superAdmin/SuperAdminDashboard'
import UserManagementPage from '@/pages/superAdmin/UserManagementPage'
import SystemSettingsPage from '@/pages/superAdmin/SystemSettingsPage'

import NotFoundPage from '@/pages/errors/NotFoundPage'
import ForbiddenPage from '@/pages/errors/ForbiddenPage'
import RouteErrorPage from '@/pages/errors/RouteErrorPage'

/**
 * ── Route path scheme (record for Phase 2+ to build directly on) ──────────
 *
 * Public discovery shell (PublicLayout -> Outlet: a persistent header, no
 * Sidebar/TopBar — that's the authenticated shell below):
 *   /                      HomePage
 *   /search                SearchMosquesPage        (Phase 2)
 *   /nearby                NearbyMosquesPage         (Phase 2)
 *   /mosques/:idOrSlug     MosqueDetailPage          (Phase 2, lazy-loaded —
 *                                                     pulls the Leaflet chunk)
 *
 * Public, no shell at all (auth pages use their own centered-card layout):
 *   /login, /register      auth pages
 *   /403, *                ForbiddenPage / NotFoundPage
 *
 * Authenticated shell (ProtectedRoute -> AppLayout -> Outlet), any role:
 *   /2fa                          TwoFactorPage            (Phase 5)
 *   /favorites                    FavoritesPage            (Phase 2)
 *   /submit-mosque                SubmitMosquePage         (Phase 2)
 *   /notifications                NotificationsPage        (Phase 2)
 *   /profile                      ProfilePage              (Phase 2)
 *   /security-settings            SecuritySettingsPage     (Phase 5)
 *
 * Mosque Admin (RoleGuard: MOSQUE_ADMIN | SUPER_ADMIN), REST-ish under
 * /mosque-admin/*:
 *   /mosque-admin/dashboard       MosqueAdminDashboard     (Phase 3)
 *   /mosque-admin/prayer-config   PrayerConfigPage         (Phase 3)
 *   /mosque-admin/events          EventManagementPage      (Phase 3)
 *   /mosque-admin/khutbahs        KhutbahManagementPage    (Phase 3)
 *   /mosque-admin/profile         MosqueProfileEditPage    (Phase 3)
 *
 * Moderator (RoleGuard: MODERATOR | SUPER_ADMIN), under /moderator/*:
 *   /moderator/dashboard          ModeratorDashboard       (Phase 4)
 *   /moderator/submissions        SubmissionQueuePage      (Phase 4)
 *   /moderator/claims             ClaimQueuePage           (Phase 4)
 *   /moderator/flags              FlagQueuePage            (Phase 4)
 *   /moderator/osm-ingestion      OsmIngestionPage         (Phase 4)
 *   /moderator/stats              PlatformStatsPage        (Phase 4)
 *
 * Super Admin (RoleGuard: SUPER_ADMIN only), under /admin/*:
 *   /admin/users                  UserManagementPage       (Phase 6)
 *   /admin/settings               SystemSettingsPage       (Phase 6)
 *
 * Note: "Home" appears in the sidebar's Discovery group but intentionally
 * routes back out to the public "/" page (outside the dashboard shell) —
 * Discovery pages (Home/Search/Nearby) are public-facing and shared with
 * signed-out visitors, so they're never nested inside the authenticated
 * AppLayout. Everything else the sidebar links to lives inside the shell.
 * ───────────────────────────────────────────────────────────────────────── */

export const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    // A crash in any child (e.g. a page reading an "optional" field that
    // arrived `undefined` instead of `null`) previously took the whole app
    // down to React Router's raw default error screen. This at least gives
    // the visitor a styled page with a way back home.
    errorElement: <RouteErrorPage />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/search', element: <SearchMosquesPage /> },
      { path: '/nearby', element: <NearbyMosquesPage /> },
      {
        path: '/mosques/:idOrSlug',
        element: (
          <Suspense fallback={<LoadingSpinner label="Loading mosque…" className="min-h-[60vh]" />}>
            <MosqueDetailPage />
          </Suspense>
        ),
      },
    ],
  },
  { path: '/login', element: <LoginPage />, errorElement: <RouteErrorPage /> },
  { path: '/register', element: <RegisterPage />, errorElement: <RouteErrorPage /> },
  { path: '/403', element: <ForbiddenPage /> },

  {
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    errorElement: <RouteErrorPage />,
    children: [
      { path: '/2fa', element: <TwoFactorPage /> },
      { path: '/favorites', element: <FavoritesPage /> },
      { path: '/submit-mosque', element: <SubmitMosquePage /> },
      { path: '/notifications', element: <NotificationsPage /> },
      { path: '/profile', element: <ProfilePage /> },
      { path: '/security-settings', element: <SecuritySettingsPage /> },

      {
        path: '/mosque-admin',
        element: (
          <RoleGuard allowedRoles={[ROLES.MOSQUE_ADMIN, ROLES.SUPER_ADMIN]}>
            <Outlet />
          </RoleGuard>
        ),
        children: [
          { path: 'dashboard', element: <MosqueAdminDashboard /> },
          { path: 'prayer-config', element: <PrayerConfigPage /> },
          { path: 'events', element: <EventManagementPage /> },
          { path: 'khutbahs', element: <KhutbahManagementPage /> },
          { path: 'profile', element: <MosqueProfileEditPage /> },
        ],
      },
      {
        path: '/moderator',
        element: (
          <RoleGuard allowedRoles={[ROLES.MODERATOR, ROLES.SUPER_ADMIN]}>
            <Outlet />
          </RoleGuard>
        ),
        children: [
          { path: 'dashboard', element: <ModeratorDashboard /> },
          { path: 'submissions', element: <SubmissionQueuePage /> },
          { path: 'claims', element: <ClaimQueuePage /> },
          { path: 'flags', element: <FlagQueuePage /> },
          { path: 'osm-ingestion', element: <OsmIngestionPage /> },
          { path: 'stats', element: <PlatformStatsPage /> },
        ],
      },
      {
        path: '/admin',
        element: (
          <RoleGuard allowedRoles={[ROLES.SUPER_ADMIN]}>
            <Outlet />
          </RoleGuard>
        ),
        children: [
          { index: true, element: <SuperAdminDashboard /> },
          { path: 'users', element: <UserManagementPage /> },
          { path: 'settings', element: <SystemSettingsPage /> },
        ],
      },
    ],
  },

  { path: '*', element: <NotFoundPage /> },
])
