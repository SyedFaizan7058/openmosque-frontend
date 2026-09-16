import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { BadgeCheck, Star } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { FacilityBadges } from '@/features/mosques/components/FacilityBadges'
import { MosqueIcon } from '@/components/icons/MosqueIcon'
import type { MosqueSummaryDto } from '@/features/mosques/types'
import { cn } from '@/lib/utils'

interface MosqueCardProps {
  mosque: MosqueSummaryDto
  className?: string
  /** An optional element rendered absolutely positioned in the card's
   * top-left corner, as a sibling of the card's `<Link>` — never nested
   * inside it, since a `<button>` inside an `<a>` is invalid HTML and
   * breaks click/focus semantics. Kept as a generic slot (rather than a
   * `isFavorited`/`onToggleFavorite` prop pair) so `MosqueCard` stays free
   * of any import from the favorites feature — composition over coupling
   * this component to one specific consumer. */
  overlaySlot?: ReactNode
}

/** A single mosque result — used by every discovery grid (Home's "Near
 * you" strip, Search, Nearby, Favorites). Purely presentational: data comes
 * in as props, the only "logic" is picking what to render (verified badge,
 * a rating vs. "No reviews yet", a distance badge only when the field is
 * present). The whole card is one link to the mosque's detail page. */
export function MosqueCard({ mosque, className, overlaySlot }: MosqueCardProps) {
  const detailPath = `/mosques/${mosque.slug || mosque.id}`
  const locationLine = [mosque.city, mosque.country].filter(Boolean).join(', ')

  return (
    <Card className={cn('group relative overflow-hidden rounded-xl border-border/80 transition-all duration-200 hover:border-primary/40 hover:shadow-md', className)}>
      {overlaySlot && (
        <div className="absolute left-2 top-2 z-10 [&>button]:bg-black/45 [&>button]:text-white [&>button]:border [&>button]:border-white/20 [&>button]:backdrop-blur-md [&>button:hover]:bg-black/65">
          {overlaySlot}
        </div>
      )}
      <Link to={detailPath} className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-xl">
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#003438]">
          {mosque.coverImageUrl ? (
            <img
              src={mosque.coverImageUrl}
              alt=""
              className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="relative flex size-full flex-col items-center justify-center bg-gradient-to-br from-[#003438] via-[#004a4e] to-[#00272a] text-white overflow-hidden transition-all group-hover:brightness-105">
              {/* Subtle ambient glow aura */}
              <div className="pointer-events-none absolute size-32 rounded-full bg-teal-400/15 blur-2xl" />

              {/* Theme Emblem Badge */}
              <div className="relative flex size-12 items-center justify-center rounded-2xl bg-white/10 border border-white/20 text-white shadow-md backdrop-blur-xs transition-transform duration-300 group-hover:scale-110">
                <MosqueIcon className="size-7 text-teal-300 transition-colors group-hover:text-white" aria-hidden="true" />
              </div>
            </div>
          )}

          {/* Distance badge */}
          {mosque.distanceKm != null && (
            <span className="absolute right-2 top-2 rounded-full bg-black/45 text-white border border-white/20 px-2 py-0.5 text-[11px] font-semibold shadow-xs backdrop-blur-md">
              {mosque.distanceKm < 1
                ? `${Math.round(mosque.distanceKm * 1000)} m away`
                : `${mosque.distanceKm.toFixed(1)} km away`}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-1.5 p-3 sm:p-3.5">
          <div className="flex items-start justify-between gap-1.5">
            <h3 className="font-semibold text-sm sm:text-base leading-snug text-foreground line-clamp-1 group-hover:text-primary transition-colors">
              {mosque.name}
            </h3>
            {mosque.verified && (
              <span className="flex shrink-0 items-center gap-1 rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                <BadgeCheck className="size-3" aria-hidden="true" />
                Verified
              </span>
            )}
          </div>

          {locationLine && (
            <p className="text-xs text-muted-foreground line-clamp-1">{locationLine}</p>
          )}

          <div className="flex items-center gap-1 text-xs">
            {mosque.rating != null ? (
              <>
                <Star className="size-3.5 fill-amber-400 text-amber-400" aria-hidden="true" />
                <span className="font-medium text-foreground">{mosque.rating.toFixed(1)}</span>
                <span className="text-muted-foreground">
                  ({mosque.reviewCount ?? 0})
                </span>
              </>
            ) : (
              <span className="text-muted-foreground text-xs">No reviews yet</span>
            )}
          </div>

          {mosque.facilityCodes != null && mosque.facilityCodes.length > 0 && (
            <div className="pt-0.5">
              <FacilityBadges facilityCodes={mosque.facilityCodes} size="sm" maxVisible={2} />
            </div>
          )}
        </div>
      </Link>
    </Card>
  )
}
