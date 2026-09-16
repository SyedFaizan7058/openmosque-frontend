import type { MouseEvent } from 'react'
import { Heart } from 'lucide-react'
import { useAuthStore, selectIsAuthenticated } from '@/features/auth/store/useAuthStore'
import { useFavoriteMosqueIds } from '@/features/favorites/hooks/useFavoriteMosqueIds'
import { useToggleFavorite } from '@/features/favorites/hooks/useToggleFavorite'
import { cn } from '@/lib/utils'

interface FavoriteButtonProps {
  mosqueId: string
  className?: string
  /** `icon` (default): a circular icon-only toggle, used as an overlay on
   * `MosqueCard` across every discovery page. `pill`: a labeled
   * outline button ("Favorite"/"Favorited") for a page header action row
   * (the mosque detail page), matching the style of its sibling
   * Share/Directions buttons there. */
  variant?: 'icon' | 'pill'
}

/**
 * Self-contained heart-icon toggle. Deliberately narrow props (`mosqueId` +
 * `className`) — every bit of auth/query wiring stays inside this
 * component so callers (`MosqueCard`, `MosqueDetailPage`) never need to
 * conditionally render it or thread favorite state through their own
 * props. Renders nothing for a signed-out visitor, so callers can always
 * just drop it in.
 */
export function FavoriteButton({ mosqueId, className, variant = 'icon' }: FavoriteButtonProps) {
  const isAuthenticated = useAuthStore(selectIsAuthenticated)
  const favoriteMosqueIds = useFavoriteMosqueIds()
  const toggleFavorite = useToggleFavorite()

  if (!isAuthenticated) return null

  const isFavorited = favoriteMosqueIds.has(mosqueId)

  function handleClick(e: MouseEvent<HTMLButtonElement>) {
    // Stops a click from also activating a parent `<Link>` when this
    // button is composed as a sibling overlay on a card (see
    // `MosqueCard`'s `overlaySlot`).
    e.preventDefault()
    e.stopPropagation()
    toggleFavorite.mutate({ mosqueId, isFavorited })
  }

  if (variant === 'pill') {
    return (
      <button
        type="button"
        aria-pressed={isFavorited}
        disabled={toggleFavorite.isPending}
        onClick={handleClick}
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-4 py-2 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-60',
          className,
        )}
      >
        <Heart className={cn('size-4', isFavorited ? 'fill-primary text-primary' : 'text-foreground')} aria-hidden="true" />
        {isFavorited ? 'Favorited' : 'Favorite'}
      </button>
    )
  }

  return (
    <button
      type="button"
      aria-pressed={isFavorited}
      aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
      disabled={toggleFavorite.isPending}
      onClick={handleClick}
      className={cn(
        'inline-flex size-9 items-center justify-center rounded-full bg-background/90 text-foreground shadow-sm backdrop-blur transition-colors hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-60',
        className,
      )}
    >
      <Heart
        className={cn('size-4 transition-colors', isFavorited ? 'fill-rose-500 text-rose-500' : 'text-current')}
        aria-hidden="true"
      />
    </button>
  )
}
