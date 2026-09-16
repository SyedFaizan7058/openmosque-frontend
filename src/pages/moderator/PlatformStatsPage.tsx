import { BarChart3, Building2, ClipboardList, FileCheck2, Flag, ShieldCheck, Users } from 'lucide-react'
import { StatTile } from '@/features/moderation/components/StatTile'
import { usePlatformStats } from '@/features/moderation/hooks/usePlatformStats'

/** `GET /api/v1/admin/stats`, presented full-page — the same data as the
 * dashboard's tiles, for a moderator who wants just the numbers. A deeper
 * analytics view (trends over time, charts) isn't backed by any endpoint
 * yet — `PlatformStatsDto` is six point-in-time counts, not a time series
 * — so this stays a stat-tile grid rather than manufacturing charts the
 * backend can't support. */
export default function PlatformStatsPage() {
  const { data: stats, isLoading } = usePlatformStats()

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-foreground">
          <BarChart3 className="size-6 text-primary" aria-hidden="true" />
          Platform Statistics
        </h1>
        <p className="text-sm text-muted-foreground">Point-in-time counts across the whole platform.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <StatTile label="Total Mosques" value={stats?.totalMosques} icon={Building2} isLoading={isLoading} />
        <StatTile label="Verified Mosques" value={stats?.verifiedMosques} icon={ShieldCheck} isLoading={isLoading} />
        <StatTile label="Total Users" value={stats?.totalUsers} icon={Users} isLoading={isLoading} />
        <StatTile label="Pending Submissions" value={stats?.pendingSubmissions} icon={ClipboardList} isLoading={isLoading} emphasize />
        <StatTile label="Pending Claims" value={stats?.pendingClaims} icon={FileCheck2} isLoading={isLoading} emphasize />
        <StatTile label="Active Flags" value={stats?.activeFlags} icon={Flag} isLoading={isLoading} emphasize />
      </div>
    </div>
  )
}
