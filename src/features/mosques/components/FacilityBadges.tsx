import type { LucideIcon } from 'lucide-react'
import {
  Accessibility,
  BookOpen,
  CircleCheck,
  Droplets,
  GraduationCap,
  HeartHandshake,
  ParkingSquare,
  Snowflake,
  Users,
} from 'lucide-react'
import { cn } from '@/lib/utils'

/** Icon + human label per known facility code (backend_analysis.md §3).
 * An unrecognized code (a facility added after this file was written)
 * still renders — with a generic icon and a humanized version of the raw
 * code — rather than being silently dropped. */
const FACILITY_META: Record<string, { icon: LucideIcon; label: string }> = {
  WUDU_AREA: { icon: Droplets, label: 'Wudu Area' },
  WOMENS_SECTION: { icon: Users, label: "Women's Section" },
  WHEELCHAIR_ACCESSIBILITY: { icon: Accessibility, label: 'Wheelchair Accessible' },
  PARKING: { icon: ParkingSquare, label: 'Parking' },
  JANAZAH_SERVICES: { icon: HeartHandshake, label: 'Janazah Services' },
  LIBRARY: { icon: BookOpen, label: 'Library' },
  AIR_CONDITIONING: { icon: Snowflake, label: 'Air Conditioning' },
  DAILY_HALAQAH: { icon: GraduationCap, label: 'Daily Halaqah' },
}

function humanizeCode(code: string): string {
  return code
    .toLowerCase()
    .split('_')
    .map((word) => (word ? word[0]?.toUpperCase() + word.slice(1) : word))
    .join(' ')
}

function metaForCode(code: string, labelOverrides?: Record<string, string>) {
  const known = FACILITY_META[code]
  const label = labelOverrides?.[code] ?? known?.label ?? humanizeCode(code)
  return { icon: known?.icon ?? CircleCheck, label }
}

interface FacilityBadgesProps {
  facilityCodes: string[]
  /** Optional code -> display-name overrides, e.g. from the live
   * `useFacilities()` catalog, in case an admin renames a facility. */
  labelOverrides?: Record<string, string>
  size?: 'sm' | 'md'
  className?: string
  /** Caps how many facility chips render before the rest collapse into a
   * single "+N" chip — keeps a longer facility list from wrapping into
   * several rows in tight spots (a mosque card, a detail page's summary
   * line). Omit to render every facility (e.g. a full facilities list). */
  maxVisible?: number
}

/** Renders a mosque's facilities as small icon + label chips. Purely
 * presentational — data comes in as plain facility codes. */
export function FacilityBadges({ facilityCodes, labelOverrides, size = 'md', className, maxVisible }: FacilityBadgesProps) {
  if (facilityCodes.length === 0) return null

  const visibleCodes = maxVisible != null ? facilityCodes.slice(0, maxVisible) : facilityCodes
  const hiddenCount = facilityCodes.length - visibleCodes.length

  return (
    // `role="list"` works around a long-standing Safari/VoiceOver bug that
    // drops list semantics from a `<ul>` once Tailwind's preflight resets
    // `list-style: none` on it.
    <ul role="list" className={cn('flex flex-wrap gap-1.5', className)}>
      {visibleCodes.map((code) => {
        const { icon: Icon, label } = metaForCode(code, labelOverrides)
        return (
          <li
            key={code}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary/60 text-secondary-foreground',
              size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm',
            )}
          >
            <Icon className={cn(size === 'sm' ? 'size-3.5' : 'size-4', 'text-accent')} aria-hidden="true" />
            <span>{label}</span>
          </li>
        )
      })}
      {hiddenCount > 0 && (
        <li
          className={cn(
            'inline-flex items-center rounded-full border border-border bg-secondary/60 font-medium text-secondary-foreground',
            size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm',
          )}
          aria-label={`${hiddenCount} more ${hiddenCount === 1 ? 'facility' : 'facilities'}`}
        >
          +{hiddenCount}
        </li>
      )}
    </ul>
  )
}
