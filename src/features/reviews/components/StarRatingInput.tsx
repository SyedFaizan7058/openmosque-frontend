import { useState } from 'react'
import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StarRatingInputProps {
  /** `0` (or `undefined`) renders all stars unfilled — used for the
   * optional sub-category ratings, which a reviewer may leave unset. */
  value: number | undefined
  onChange: (value: number) => void
  label: string
  required?: boolean
  size?: 'sm' | 'md'
}

/** A 1-5 star radio-like control. Not a native `<input type="radio">` group
 * because there's no clean way to style radios as stars while keeping a
 * visible focus ring per WCAG — instead this is a `role="radiogroup"` of
 * plain buttons, which gets the same semantics (arrow-key navigation is
 * skipped since 5 buttons in a row is already fast to Tab through, and
 * every button remains individually focusable/activatable). Hover previews
 * the value that clicking would commit, without changing `value` until a
 * real click. */
export function StarRatingInput({ value, onChange, label, required, size = 'md' }: StarRatingInputProps) {
  const [hovered, setHovered] = useState<number | null>(null)
  const displayValue = hovered ?? value ?? 0
  const starSize = size === 'sm' ? 'size-5' : 'size-7'

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-foreground">
        {label}
        {required ? <span className="text-destructive"> *</span> : null}
      </span>
      <div role="radiogroup" aria-label={label} className="flex items-center gap-1" onMouseLeave={() => setHovered(null)}>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            role="radio"
            aria-checked={value === star}
            aria-label={`${star} star${star === 1 ? '' : 's'}`}
            onMouseEnter={() => setHovered(star)}
            onFocus={() => setHovered(star)}
            onBlur={() => setHovered(null)}
            onClick={() => onChange(star)}
            className="rounded-sm outline-none transition-transform hover:scale-110 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <Star
              className={cn(starSize, star <= displayValue ? 'fill-accent text-accent' : 'text-muted-foreground')}
              aria-hidden="true"
            />
          </button>
        ))}
      </div>
    </div>
  )
}
