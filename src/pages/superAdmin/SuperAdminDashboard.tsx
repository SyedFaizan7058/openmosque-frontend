import { Link } from 'react-router-dom'
import { Building2, ClipboardList, DownloadCloud, Flag, LayoutDashboard, Settings, ShieldCheck, Users } from 'lucide-react'
import { StatTile } from '@/features/moderation/components/StatTile'
import { usePlatformStats } from '@/features/moderation/hooks/usePlatformStats'

/** Super-admin landing page: the same platform-wide stat tiles the
 * moderator dashboard shows (super admins can see everything a moderator
 * can, plus the two super-admin-only tools below), and quick links into
 * both the super-admin tools and the shared moderation queues. */
export default function SuperAdminDashboard() {
  const { data: stats, isLoading } = usePlatformStats()

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-foreground">
          <LayoutDashboard className="size-6 text-primary" aria-hidden="true" />
          Super Admin Dashboard
        </h1>
        <p className="text-sm text-muted-foreground">Platform-wide oversight, user roles, and moderation tools.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <StatTile label="Pending Submissions" value={stats?.pendingSubmissions} icon={ClipboardList} isLoading={isLoading} emphasize />
        <StatTile label="Pending Claims" value={stats?.pendingClaims} icon={ShieldCheck} isLoading={isLoading} emphasize />
        <StatTile label="Active Flags" value={stats?.activeFlags} icon={Flag} isLoading={isLoading} emphasize />
        <StatTile label="Total Mosques" value={stats?.totalMosques} icon={Building2} isLoading={isLoading} />
        <StatTile label="Verified Mosques" value={stats?.verifiedMosques} icon={ShieldCheck} isLoading={isLoading} />
        <StatTile label="Total Users" value={stats?.totalUsers} icon={Users} isLoading={isLoading} />
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold text-foreground">Super Admin tools</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Link
            to="/admin/users"
            className="flex items-center gap-3 rounded-lg border border-border bg-card p-4 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-secondary/40"
          >
            <Users className="size-5 text-primary" aria-hidden="true" /> Manage users &amp; roles
          </Link>
          <Link
            to="/admin/settings"
            className="flex items-center gap-3 rounded-lg border border-border bg-card p-4 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-secondary/40"
          >
            <Settings className="size-5 text-primary" aria-hidden="true" /> System settings
          </Link>
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold text-foreground">Moderation queues</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Link
            to="/moderator/submissions"
            className="flex items-center gap-3 rounded-lg border border-border bg-card p-4 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-secondary/40"
          >
            <ClipboardList className="size-5 text-primary" aria-hidden="true" /> Review submissions
          </Link>
          <Link
            to="/moderator/claims"
            className="flex items-center gap-3 rounded-lg border border-border bg-card p-4 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-secondary/40"
          >
            <ShieldCheck className="size-5 text-primary" aria-hidden="true" /> Review claims
          </Link>
          <Link
            to="/moderator/flags"
            className="flex items-center gap-3 rounded-lg border border-border bg-card p-4 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-secondary/40"
          >
            <Flag className="size-5 text-primary" aria-hidden="true" /> Review flags
          </Link>
          <Link
            to="/moderator/osm-ingestion"
            className="flex items-center gap-3 rounded-lg border border-border bg-card p-4 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-secondary/40 sm:col-span-3"
          >
            <DownloadCloud className="size-5 text-primary" aria-hidden="true" /> Bulk-import mosques from OpenStreetMap
          </Link>
        </div>
      </div>
    </div>
  )
}
