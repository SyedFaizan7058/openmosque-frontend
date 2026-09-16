import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface DateNavProps {
  /** `YYYY-MM-DD`, or `undefined` to mean "today". */
  date: string | undefined
  onChange: (date: string | undefined) => void
  className?: string
}

function toYmd(d: Date): string {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function todayYmd(): string {
  return toYmd(new Date())
}

function shiftDate(ymd: string, deltaDays: number): string {
  const [year, month, day] = ymd.split('-').map(Number)
  const d = new Date(year ?? 1970, (month ?? 1) - 1, (day ?? 1))
  d.setDate(d.getDate() + deltaDays)
  return toYmd(d)
}

/** Prev-day / today / next-day controls that drive a `date` prop
 * (`YYYY-MM-DD`, or `undefined` for "today"). Fully keyboard-operable plain
 * buttons — no custom date-picker widget needed for this. */
export function DateNav({ date, onChange, className }: DateNavProps) {
  const effectiveDate = date ?? todayYmd()
  const isToday = effectiveDate === todayYmd()

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Button
        type="button"
        variant="outline"
        size="icon"
        aria-label="Previous day"
        onClick={() => onChange(shiftDate(effectiveDate, -1))}
      >
        <ChevronLeft aria-hidden="true" />
      </Button>

      <Button
        type="button"
        variant={isToday ? 'default' : 'outline'}
        size="sm"
        aria-pressed={isToday}
        onClick={() => onChange(undefined)}
      >
        Today
      </Button>

      <span className="min-w-[8.5rem] text-center text-sm font-medium text-foreground" aria-live="polite">
        {effectiveDate}
      </span>

      <Button
        type="button"
        variant="outline"
        size="icon"
        aria-label="Next day"
        onClick={() => onChange(shiftDate(effectiveDate, 1))}
      >
        <ChevronRight aria-hidden="true" />
      </Button>
    </div>
  )
}
