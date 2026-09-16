import type { LucideIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

interface StatTileProps {
  label: string
  value: number | undefined
  icon: LucideIcon
  isLoading: boolean
  /** Highlights the tile (e.g. a nonzero pending count worth drawing the
   * moderator's eye to) with the accent color instead of the default
   * neutral icon treatment. */
  emphasize?: boolean
}

/** A single stat card for the moderator dashboard / platform stats page —
 * one glanceable number with a label and icon. */
export function StatTile({ label, value, icon: Icon, isLoading, emphasize }: StatTileProps) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 pt-6">
        <div
          className={cn(
            'flex size-10 shrink-0 items-center justify-center rounded-full',
            emphasize && value ? 'bg-accent/15 text-accent' : 'bg-secondary text-secondary-foreground',
          )}
        >
          <Icon className="size-5" aria-hidden="true" />
        </div>
        <div className="flex flex-col">
          {isLoading ? <Skeleton className="h-7 w-12" /> : <span className="text-2xl font-bold text-foreground">{value ?? 0}</span>}
          <span className="text-sm text-muted-foreground">{label}</span>
        </div>
      </CardContent>
    </Card>
  )
}
