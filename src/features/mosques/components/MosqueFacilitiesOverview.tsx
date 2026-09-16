import type { LucideIcon } from 'lucide-react'
import {
  Accessibility,
  AirVent,
  BookOpen,
  Car,
  Check,
  CircleCheck,
  Droplets,
  GraduationCap,
  HeartHandshake,
  Users,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface FacilityDetail {
  icon: LucideIcon
  title: string
  description: string
}

const FACILITY_MAP: Record<string, FacilityDetail> = {
  WUDU_AREA: {
    icon: Droplets,
    title: 'Wudu Area',
    description: 'Dedicated ablution facilities',
  },
  WOMENS_SECTION: {
    icon: Users,
    title: "Women's Section",
    description: 'Dedicated hall with separate entrance',
  },
  WHEELCHAIR_ACCESSIBILITY: {
    icon: Accessibility,
    title: 'Wheelchair Accessible',
    description: 'Ramps, elevators, and accessible prayer area',
  },
  PARKING: {
    icon: Car,
    title: 'Parking',
    description: 'On-site or adjacent parking lot',
  },
  LIBRARY: {
    icon: BookOpen,
    title: 'Library',
    description: 'Collection of Islamic books & study space',
  },
  AIR_CONDITIONING: {
    icon: AirVent,
    title: 'Air Conditioning',
    description: 'Climate-controlled prayer hall',
  },
  JANAZAH_SERVICES: {
    icon: HeartHandshake,
    title: 'Janazah Services',
    description: 'Funeral prayer and wash facilities',
  },
  DAILY_HALAQAH: {
    icon: GraduationCap,
    title: 'Daily Halaqah',
    description: 'Regular Islamic study circles and classes',
  },
}

function humanizeCode(code: string): string {
  return code
    .toLowerCase()
    .split('_')
    .map((word) => (word ? word[0]?.toUpperCase() + word.slice(1) : word))
    .join(' ')
}

interface MosqueFacilitiesOverviewProps {
  facilityCodes: string[]
  className?: string
}

/**
 * Modern facilities grid matching Image 3 design:
 * 2-column grid with rounded-2xl cards, icon badges on left, title & description,
 * and solid primary-color checkmark circles on the right.
 */
export function MosqueFacilitiesOverview({ facilityCodes, className }: MosqueFacilitiesOverviewProps) {
  if (facilityCodes.length === 0) return null

  return (
    <div className={cn('grid grid-cols-1 md:grid-cols-2 gap-2.5', className)}>
      {facilityCodes.map((code) => {
        const item = FACILITY_MAP[code] ?? {
          icon: CircleCheck,
          title: humanizeCode(code),
          description: 'Available at this mosque',
        }
        const Icon = item.icon

        return (
          <div
            key={code}
            className="flex items-center justify-between p-2.5 sm:p-3 rounded-xl border border-teal-200/90 dark:border-teal-900/60 bg-teal-50/25 dark:bg-teal-950/20 shadow-2xs hover:border-[#007378]/50 transition-all"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex size-8 sm:size-9 items-center justify-center rounded-lg bg-teal-500/10 text-[#007378] dark:bg-teal-500/20 dark:text-teal-400 shrink-0">
                <Icon className="size-4 sm:size-4.5 stroke-[1.75]" aria-hidden="true" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-bold text-xs sm:text-sm text-foreground leading-tight truncate">
                  {item.title}
                </span>
                <span className="text-[11px] text-muted-foreground leading-snug line-clamp-1">
                  {item.description}
                </span>
              </div>
            </div>

            <div
              className="size-5 rounded-full bg-[#007378] text-white flex items-center justify-center shrink-0 shadow-2xs ml-2"
              aria-hidden="true"
            >
              <Check className="size-3 stroke-[2.5]" />
            </div>
          </div>
        )
      })}
    </div>
  )
}
