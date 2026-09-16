import { MapPin, ChevronDown } from 'lucide-react'
import { useLocationStore } from '@/stores/useLocationStore'
import { cn } from '@/lib/utils'

interface LocationChipProps {
  className?: string
}

export function LocationChip({ className }: LocationChipProps) {
  const city = useLocationStore((s) => s.city)
  const openModal = useLocationStore((s) => s.openModal)

  return (
    <button
      type="button"
      onClick={openModal}
      title="Change location"
      className={cn(
        'group inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-secondary/50 px-2.5 sm:px-3 py-1 text-xs font-medium text-foreground hover:bg-secondary hover:border-primary/40 transition-all cursor-pointer shadow-2xs',
        className
      )}
    >
      <MapPin className="size-3.5 text-primary shrink-0 transition-transform group-hover:scale-110" />
      <span className="max-w-[100px] sm:max-w-[140px] truncate">
        {city || 'Set Location'}
      </span>
      <ChevronDown className="size-3 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
    </button>
  )
}
