import type { LucideIcon } from 'lucide-react'
import {
  Home,
  Search,
  MapPin,
  Heart,
  PlusCircle,
  Bell,
  UserCircle,
  ShieldCheck,
  LayoutDashboard,
  Clock,
  CalendarDays,
  Mic2,
  Building2,
  ClipboardList,
  FileCheck2,
  Flag,
  DownloadCloud,
  BarChart3,
  Users,
  Settings,
} from 'lucide-react'
import { ROLES } from '@/lib/constants'
import type { UserRole } from '@/lib/constants'

export interface NavItem {
  label: string
  to: string
  icon: LucideIcon
}

export interface NavGroup {
  title: string
  /** Roles that can see this group. Every authenticated role sees groups
   * with no restriction (Discovery / My Account). */
  roles?: UserRole[]
  items: NavItem[]
}

/**
 * Role-based sidebar navigation, grouped exactly per the Phase 1 spec.
 * Route paths follow the scheme documented at the top of `router.tsx`.
 */
export const NAV_GROUPS: NavGroup[] = [
  {
    title: 'Discovery',
    items: [
      { label: 'Home', to: '/', icon: Home },
      { label: 'Search Mosques', to: '/search', icon: Search },
      { label: 'Nearby Mosques', to: '/nearby', icon: MapPin },
      { label: 'My Favorites', to: '/favorites', icon: Heart },
      { label: 'Submit a Mosque', to: '/submit-mosque', icon: PlusCircle },
    ],
  },
  {
    title: 'My Account',
    items: [
      { label: 'Notifications', to: '/notifications', icon: Bell },
      { label: 'My Profile', to: '/profile', icon: UserCircle },
      { label: 'Security Settings', to: '/security-settings', icon: ShieldCheck },
    ],
  },
  {
    title: 'Mosque Admin',
    roles: [ROLES.MOSQUE_ADMIN, ROLES.SUPER_ADMIN],
    items: [
      { label: 'Mosque Dashboard', to: '/mosque-admin/dashboard', icon: LayoutDashboard },
      { label: 'Prayer Configuration', to: '/mosque-admin/prayer-config', icon: Clock },
      { label: 'Events Management', to: '/mosque-admin/events', icon: CalendarDays },
      { label: 'Khutbah Schedule', to: '/mosque-admin/khutbahs', icon: Mic2 },
      { label: 'Edit Mosque Profile', to: '/mosque-admin/profile', icon: Building2 },
    ],
  },
  {
    title: 'Moderator',
    roles: [ROLES.MODERATOR, ROLES.SUPER_ADMIN],
    items: [
      { label: 'Submission Queue', to: '/moderator/submissions', icon: ClipboardList },
      { label: 'Claim Requests', to: '/moderator/claims', icon: FileCheck2 },
      { label: 'Flagged Content', to: '/moderator/flags', icon: Flag },
      { label: 'OSM Ingestion', to: '/moderator/osm-ingestion', icon: DownloadCloud },
      { label: 'Platform Statistics', to: '/moderator/stats', icon: BarChart3 },
    ],
  },
  {
    title: 'Super Admin',
    roles: [ROLES.SUPER_ADMIN],
    items: [
      { label: 'User Management', to: '/admin/users', icon: Users },
      { label: 'System Settings', to: '/admin/settings', icon: Settings },
    ],
  },
]
