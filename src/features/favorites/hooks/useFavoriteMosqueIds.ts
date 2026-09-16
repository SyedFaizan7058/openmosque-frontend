import { useQuery } from '@tanstack/react-query'
import { getFavorites } from '@/features/favorites/api/favoritesApi'
import { favoritesKeys } from '@/features/favorites/api/favoritesKeys'
import { useAuthStore, selectIsAuthenticated } from '@/features/auth/store/useAuthStore'

const EMPTY_SET: ReadonlySet<string> = new Set()

/**
 * The single source of truth every `FavoriteButton` instance reads
 * membership from. Backed by the same `favoritesKeys.list()` cache entry as
 * `useFavorites` (same `queryKey` + `queryFn`, so TanStack Query dedupes
 * them into one network call and one cache entry), but uses `select` to
 * derive a memoized `Set<string>` of `mosqueId`s — so a grid of 20
 * `MosqueCard`s each rendering a `FavoriteButton` costs one request total,
 * not 20, and each button's membership check is an O(1) `Set.has`.
 */
export function useFavoriteMosqueIds() {
  const isAuthenticated = useAuthStore(selectIsAuthenticated)

  const { data } = useQuery({
    queryKey: favoritesKeys.list(),
    queryFn: getFavorites,
    enabled: isAuthenticated,
    select: (favorites) => new Set(favorites.map((f) => f.mosqueId)),
  })

  return data ?? EMPTY_SET
}
