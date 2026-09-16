import { Link } from 'react-router-dom'
import { Building2, ClipboardList, FileCheck2, Flag, LayoutDashboard, ShieldCheck, Users } from 'lucide-react'
import { StatTile } from '@/features/moderation/components/StatTile'
import { usePlatformStats } from '@/features/moderation/hooks/usePlatformStats'

/** Moderator landing page: platform-wide stat tiles (from the same
 * `GET /admin/stats` the dedicated Platform Statistics page uses) plus
 * quick links into the three moderation queues. */
export default function ModeratorDashboard() {
  const { data: stats, isLoading } = usePlatformStats()

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-foreground">
          <LayoutDashboard className="size-6 text-primary" aria-hidden="true" />
          Moderator Dashboard
        </h1>
        <p className="text-sm text-muted-foreground">An overview of what needs your attention across the platform.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <StatTile label="Pending Submissions" value={stats?.pendingSubmissions} icon={ClipboardList} isLoading={isLoading} emphasize />
        <StatTile label="Pending Claims" value={stats?.pendingClaims} icon={FileCheck2} isLoading={isLoading} emphasize />
        <StatTile label="Active Flags" value={stats?.activeFlags} icon={Flag} isLoading={isLoading} emphasize />
        <StatTile label="Total Mosques" value={stats?.totalMosques} icon={Building2} isLoading={isLoading} />
        <StatTile label="Verified Mosques" value={stats?.verifiedMosques} icon={ShieldCheck} isLoading={isLoading} />
        <StatTile label="Total Users" value={stats?.totalUsers} icon={Users} isLoading={isLoading} />
      </div>

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
          <FileCheck2 className="size-5 text-primary" aria-hidden="true" /> Review claims
        </Link>
        <Link
          to="/moderator/flags"
          className="flex items-center gap-3 rounded-lg border border-border bg-card p-4 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-secondary/40"
        >
          <Flag className="size-5 text-primary" aria-hidden="true" /> Review flags
        </Link>
      </div>
    </div>
  )
}
