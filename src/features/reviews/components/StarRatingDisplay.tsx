import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StarRatingDisplayProps {
  value: number
  size?: 'sm' | 'md'
  className?: string
}

/** Read-only 5-star display, rounded to the nearest whole star (the
 * backend only ever stores/returns integer 1-5 ratings per review, and
 * `averageOverall` is only ever shown as a number alongside these stars,
 * not blended into partial-star fills). */
export function StarRatingDisplay({ value, size = 'sm', className }: StarRatingDisplayProps) {
  const rounded = Math.round(value)
  const starSize = size === 'sm' ? 'size-3.5' : 'size-4'

  return (
    <div className={cn('flex items-center gap-0.5', className)} role="img" aria-label={`${value.toFixed(1)} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(starSize, star <= rounded ? 'fill-accent text-accent' : 'text-muted-foreground/40')}
          aria-hidden="true"
        />
      ))}
    </div>
  )
}
