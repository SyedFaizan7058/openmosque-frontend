import type { LucideIcon } from 'lucide-react'
import {
  Accessibility,
  BookOpen,
  Car,
  Check,
  CircleCheck,
  Droplets,
  GraduationCap,
  HeartHandshake,
  Snowflake,
  Users,
} from 'lucide-react'
import { useFacilities } from '@/features/mosques/hooks/useFacilities'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

const FACILITY_ICONS: Record<string, LucideIcon> = {
  WUDU_AREA: Droplets,
  WOMENS_SECTION: Users,
  WHEELCHAIR_ACCESSIBILITY: Accessibility,
  PARKING: Car,
  JANAZAH_SERVICES: HeartHandshake,
  LIBRARY: BookOpen,
  AIR_CONDITIONING: Snowflake,
  DAILY_HALAQAH: GraduationCap,
}

interface FacilityFilterListProps {
  selectedCodes: string[]
  onChange: (codes: string[]) => void
  variant?: 'list' | 'chips'
  className?: string
}

/** Checkbox list or compact chips for filtering search/nearby results by facility.
 * Fully keyboard accessible, screen-reader friendly, with facility-specific icons. */
export function FacilityFilterList({
  selectedCodes,
  onChange,
  variant = 'list',
  className,
}: FacilityFilterListProps) {
  const { data: facilities, isLoading, isError } = useFacilities()

  function toggle(code: string) {
    onChange(
      selectedCodes.includes(code) ? selectedCodes.filter((c) => c !== code) : [...selectedCodes, code],
    )
  }

  if (isLoading) {
    if (variant === 'chips') {
      return (
        <div className={cn('flex items-center gap-2 overflow-x-auto py-1', className)} aria-hidden="true">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-24 shrink-0 rounded-full" />
          ))}
        </div>
      )
    }
    return (
      <div className={cn('flex flex-col gap-2', className)} aria-hidden="true">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-7 w-full rounded-lg" />
        ))}
      </div>
    )
  }

  if (isError || !facilities || facilities.length === 0) {
    return null
  }

  // --- HORIZONTAL CHIPS VARIANT (Mobile & Quick-Filter Toolbar) ---
  if (variant === 'chips') {
    return (
      <div className={cn('flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none', className)}>
        {facilities.map((facility) => {
          const isSelected = selectedCodes.includes(facility.code)
          const Icon = FACILITY_ICONS[facility.code] ?? CircleCheck

          return (
            <button
              key={facility.id}
              type="button"
              onClick={() => toggle(facility.code)}
              aria-pressed={isSelected}
              className={cn(
                'inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-150',
                isSelected
                  ? 'border-primary bg-primary text-primary-foreground shadow-xs'
                  : 'border-border/80 bg-card text-muted-foreground hover:border-primary/50 hover:bg-primary/5 hover:text-foreground',
              )}
            >
              <Icon className="size-3.5" aria-hidden="true" />
              <span>{facility.name}</span>
              {isSelected && <Check className="size-3 stroke-[2.5]" aria-hidden="true" />}
            </button>
          )
        })}
      </div>
    )
  }

  // --- LIST VARIANT (Desktop Sidebar & Mobile Filter Dialog) ---
  return (
    <fieldset className={cn('flex flex-col gap-1', className)}>
      <legend className="sr-only">Facilities</legend>
      {facilities.map((facility) => {
        const inputId = `facility-filter-${facility.id}`
        const isSelected = selectedCodes.includes(facility.code)
        const Icon = FACILITY_ICONS[facility.code] ?? CircleCheck

        return (
          <label
            key={facility.id}
            htmlFor={inputId}
            className={cn(
              'group flex cursor-pointer items-center justify-between gap-2.5 rounded-lg px-2.5 py-1.5 text-xs sm:text-sm transition-colors',
              isSelected
                ? 'bg-primary/10 font-medium text-foreground'
                : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground',
            )}
          >
            <div className="flex items-center gap-2.5">
              <Icon
                className={cn(
                  'size-4 shrink-0 transition-colors',
                  isSelected ? 'text-primary' : 'text-muted-foreground/70 group-hover:text-primary/70',
                )}
                aria-hidden="true"
              />
              <span className="select-none">{facility.name}</span>
            </div>

            <div className="relative flex items-center">
              <input
                id={inputId}
                type="checkbox"
                className="size-4 cursor-pointer rounded border-border text-primary accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                checked={isSelected}
                onChange={() => toggle(facility.code)}
              />
            </div>
          </label>
        )
      })}
    </fieldset>
  )
}
