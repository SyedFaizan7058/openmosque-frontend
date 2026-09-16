import type { LucideIcon } from 'lucide-react'
import {
  Award,
  BadgeCheck,
  Compass,
  Crown,
  Flame,
  Heart,
  MapPin,
  Medal,
  ShieldCheck,
  Sparkles,
  Star,
  Trophy,
} from 'lucide-react'
import { format } from 'date-fns'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/shared/EmptyState'
import { useAllBadges } from '@/features/badges/hooks/useAllBadges'
import { useMyBadges } from '@/features/badges/hooks/useMyBadges'
import { cn } from '@/lib/utils'

// The exact `iconName` catalog values aren't pinned down in
// backend_analysis.md, so this maps a handful of plausible icon-name
// spellings (kebab-case or plain words, matched case-insensitively) to a
// Lucide icon — any name that doesn't match falls back to a generic
// `Award`, so an unrecognized/future icon name never breaks rendering.
const ICON_MAP: Record<string, LucideIcon> = {
  award: Award,
  trophy: Trophy,
  medal: Medal,
  star: Star,
  crown: Crown,
  heart: Heart,
  flame: Flame,
  compass: Compass,
  'map-pin': MapPin,
  mappin: MapPin,
  sparkles: Sparkles,
  shield: ShieldCheck,
  'shield-check': ShieldCheck,
  shieldcheck: ShieldCheck,
  'badge-check': BadgeCheck,
  badgecheck: BadgeCheck,
}

function iconForName(iconName: string): LucideIcon {
  const key = iconName.trim().toLowerCase()
  return ICON_MAP[key] ?? Award
}

/**
 * The full badge catalog (`useAllBadges`, public), each shown "earned"
 * (full color, a checkmark, the earned date) when it appears in the
 * current user's `useMyBadges` list, or "locked" (greyed out) otherwise.
 * For a signed-out visitor `useMyBadges` stays disabled/empty, so every
 * badge simply renders locked — no crash, no special-casing needed here.
 */
export function BadgeGrid() {
  const { data: allBadges, isLoading, isError } = useAllBadges()
  const { data: myBadges } = useMyBadges()

  const earnedByBadgeId = new Map((myBadges ?? []).map((b) => [b.badgeId, b]))

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-28 w-full rounded-lg" />
        ))}
      </div>
    )
  }

  if (isError) {
    return (
      <EmptyState
        icon={Award}
        title="Couldn't load badges"
        description="Something went wrong reaching the server. Please try again shortly."
      />
    )
  }

  if (!allBadges || allBadges.length === 0) {
    return <EmptyState icon={Award} title="No badges available yet" />
  }

  return (
    <ul role="list" className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
      {allBadges.map((badge) => {
        const earned = earnedByBadgeId.get(badge.id)
        const isEarned = earned != null
        const Icon = iconForName(badge.iconName)

        return (
          <li
            key={badge.id}
            className={cn(
              'relative flex flex-col items-center gap-1.5 rounded-lg border p-4 text-center',
              isEarned
                ? 'border-primary/30 bg-primary/5'
                : 'border-border bg-muted/30 opacity-60 grayscale',
            )}
          >
            {isEarned && (
              <BadgeCheck
                className="absolute right-1.5 top-1.5 size-4 text-primary"
                aria-label="Earned"
              />
            )}
            <Icon className={cn('size-8', isEarned ? 'text-accent' : 'text-muted-foreground')} aria-hidden="true" />
            <span className="text-sm font-semibold text-foreground">{badge.name}</span>
            <span className="text-xs text-muted-foreground">{badge.description}</span>
            {isEarned && (
              <span className="text-[11px] font-medium text-primary">
                Earned {format(new Date(earned.earnedAt), 'MMM d, yyyy')}
              </span>
            )}
          </li>
        )
      })}
    </ul>
  )
}
