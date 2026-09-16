import { Link } from 'react-router-dom'
import { Building2, CalendarClock, CalendarDays, Heart, LayoutDashboard, Mic2, MessageCircleQuestion, Star } from 'lucide-react'
import { StatTile } from '@/features/moderation/components/StatTile'
import { MosqueAdminHeader } from '@/features/mosqueAdmin/components/MosqueAdminHeader'
import { useMosqueAdminStats } from '@/features/mosqueAdmin/hooks/useMosqueAdminStats'

interface DashboardBodyProps {
  mosqueId: string
}

function DashboardBody({ mosqueId }: DashboardBodyProps) {
  const { data: stats, isLoading } = useMosqueAdminStats(mosqueId)
  const averageRating = stats ? Math.round(stats.averageRating * 10) / 10 : undefined

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <StatTile label="Favorites" value={stats?.totalFavorites} icon={Heart} isLoading={isLoading} />
        <StatTile label="Reviews" value={stats?.totalReviews} icon={Star} isLoading={isLoading} />
        <StatTile label="Average Rating" value={averageRating} icon={Star} isLoading={isLoading} />
        <StatTile label="Upcoming Events" value={stats?.upcomingEventsCount} icon={CalendarClock} isLoading={isLoading} />
        <StatTile
          label="Unanswered Questions"
          value={stats?.unansweredQuestionsCount}
          icon={MessageCircleQuestion}
          isLoading={isLoading}
          emphasize
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Link
          to="/mosque-admin/prayer-config"
          className="flex items-center gap-3 rounded-lg border border-border bg-card p-4 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-secondary/40"
        >
          <CalendarClock className="size-5 text-primary" aria-hidden="true" /> Prayer configuration
        </Link>
        <Link
          to="/mosque-admin/events"
          className="flex items-center gap-3 rounded-lg border border-border bg-card p-4 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-secondary/40"
        >
          <CalendarDays className="size-5 text-primary" aria-hidden="true" /> Manage events
        </Link>
        <Link
          to="/mosque-admin/khutbahs"
          className="flex items-center gap-3 rounded-lg border border-border bg-card p-4 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-secondary/40"
        >
          <Mic2 className="size-5 text-primary" aria-hidden="true" /> Manage khutbah schedule
        </Link>
        <Link
          to="/mosque-admin/profile"
          className="flex items-center gap-3 rounded-lg border border-border bg-card p-4 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-secondary/40"
        >
          <Building2 className="size-5 text-primary" aria-hidden="true" /> Edit mosque profile
        </Link>
      </div>
    </div>
  )
}

/** Mosque Admin landing page: per-mosque stat tiles (`GET /mosque-admin/
 * mosques/{id}/stats`) plus quick links into the four management pages.
 * Mirrors `ModeratorDashboard`'s shape, scoped to one mosque instead of the
 * whole platform. */
export default function MosqueAdminDashboard() {
  return (
    <MosqueAdminHeader
      title="Mosque Dashboard"
      description="An overview of your mosque's activity and quick links to manage it."
      icon={LayoutDashboard}
    >
      {(mosque) => <DashboardBody mosqueId={mosque.id} />}
    </MosqueAdminHeader>
  )
}
