import { useCallback, useState } from 'react'
import type { KeyboardEvent } from 'react'
import { ChevronLeft, ChevronRight, ImageOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { MosqueImageDto } from '@/features/mosques/types'
import { cn } from '@/lib/utils'

interface ImageGalleryProps {
  images: MosqueImageDto[]
  mosqueName: string
  className?: string
}

/** A simple accessible carousel: prev/next buttons, left/right arrow-key
 * support, and a live region announcing the current position. Falls back
 * to a placeholder graphic when there are no images at all. */
export function ImageGallery({ images, mosqueName, className }: ImageGalleryProps) {
  const sorted = [...images].sort((a, b) => a.displayOrder - b.displayOrder)
  const [index, setIndex] = useState(0)

  const goTo = useCallback(
    (next: number) => {
      if (sorted.length === 0) return
      setIndex(((next % sorted.length) + sorted.length) % sorted.length)
    },
    [sorted.length],
  )

  function handleKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === 'ArrowLeft') {
      e.preventDefault()
      goTo(index - 1)
    } else if (e.key === 'ArrowRight') {
      e.preventDefault()
      goTo(index + 1)
    }
  }

  if (sorted.length === 0) {
    return (
      <div
        className={cn(
          'flex h-28 sm:h-36 w-full items-center justify-center rounded-xl border border-dashed border-border bg-muted/30',
          className,
        )}
      >
        <div className="flex flex-col items-center gap-1.5 text-muted-foreground">
          <ImageOff className="size-6" aria-hidden="true" />
          <span className="text-xs">No photos available</span>
        </div>
      </div>
    )
  }

  const current = sorted[index]

  return (
    <div
      className={cn('relative overflow-hidden rounded-xl border border-border bg-muted shadow-xs', className)}
      role="region"
      aria-roledescription="carousel"
      aria-label={`${mosqueName} photos`}
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      {/* Compact image height so it never overwhelms the mosque header */}
      <div className="h-44 sm:h-56 w-full overflow-hidden">
        {current && (
          <img
            key={current.id}
            src={current.imageUrl}
            alt={current.caption ?? `${mosqueName} photo ${index + 1} of ${sorted.length}`}
            className="size-full object-cover"
          />
        )}
      </div>

      {sorted.length > 1 && (
        <>
          <Button
            type="button"
            variant="secondary"
            size="icon"
            aria-label="Previous photo"
            className="absolute left-2 top-1/2 -translate-y-1/2 shadow-md"
            onClick={() => goTo(index - 1)}
          >
            <ChevronLeft aria-hidden="true" />
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="icon"
            aria-label="Next photo"
            className="absolute right-2 top-1/2 -translate-y-1/2 shadow-md"
            onClick={() => goTo(index + 1)}
          >
            <ChevronRight aria-hidden="true" />
          </Button>

          <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1.5">
            {sorted.map((image, i) => (
              <button
                key={image.id}
                type="button"
                aria-label={`Go to photo ${i + 1}`}
                aria-current={i === index ? 'true' : undefined}
                className={cn(
                  'size-2 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
                  i === index ? 'bg-primary' : 'bg-background/70',
                )}
                onClick={() => goTo(i)}
              />
            ))}
          </div>

          <span className="sr-only" aria-live="polite">
            Photo {index + 1} of {sorted.length}
          </span>
        </>
      )}
    </div>
  )
}
