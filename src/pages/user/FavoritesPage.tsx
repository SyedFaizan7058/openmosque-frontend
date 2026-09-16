import { Link } from 'react-router-dom'
import { Heart, HeartCrack, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/shared/EmptyState'
import { MosqueCard } from '@/features/mosques/components/MosqueCard'
import { FavoriteButton } from '@/features/favorites/components/FavoriteButton'
import { useFavorites } from '@/features/favorites/hooks/useFavorites'
import { favoriteToCardMosque } from '@/features/favorites/lib/favoriteToCardMosque'

/** The signed-in user's favorited mosques, as a card grid reusing the
 * existing `MosqueCard` from Phase 2 (via `favoriteToCardMosque`, since
 * `FavoriteMosqueResponseDto` isn't the same shape as `MosqueSummaryDto`). */
export default function FavoritesPage() {
  const { data: favorites, isLoading, isError } = useFavorites()

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">My Favorites</h1>
        <p className="text-sm text-muted-foreground">Mosques you've saved for quick access.</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-72 w-full rounded-xl" />
          ))}
        </div>
      ) : isError ? (
        <EmptyState
          icon={HeartCrack}
          title="Couldn't load your favorites"
          description="Something went wrong reaching the server. Please try again shortly."
        />
      ) : !favorites || favorites.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="You haven't favorited any mosques yet"
          description="Browse mosques and tap the heart icon to save them here."
          action={
            <Button asChild variant="outline">
              <Link to="/search">
                <Search aria-hidden="true" /> Search mosques
              </Link>
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {favorites.map((fav) => (
            <MosqueCard
              key={fav.mosqueId}
              mosque={favoriteToCardMosque(fav)}
              overlaySlot={<FavoriteButton mosqueId={fav.mosqueId} />}
            />
          ))}
        </div>
      )}
    </div>
  )
}
