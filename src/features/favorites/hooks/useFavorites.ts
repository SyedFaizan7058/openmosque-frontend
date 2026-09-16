import { useQuery } from '@tanstack/react-query'
import { getFavorites } from '@/features/favorites/api/favoritesApi'
import { favoritesKeys } from '@/features/favorites/api/favoritesKeys'
import { useAuthStore, selectIsAuthenticated } from '@/features/auth/store/useAuthStore'

/** `GET /api/v1/users/me/favorites`. Only enabled for a signed-in visitor —
 * firing this for a signed-out one would 401 and bounce them to `/login`
 * via the shared axios response interceptor. */
export function useFavorites() {
  const isAuthenticated = useAuthStore(selectIsAuthenticated)

  return useQuery({
    queryKey: favoritesKeys.list(),
    queryFn: getFavorites,
    enabled: isAuthenticated,
  })
}
