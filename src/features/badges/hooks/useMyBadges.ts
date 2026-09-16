import { useQuery } from '@tanstack/react-query'
import { getMyBadges } from '@/features/badges/api/badgesApi'
import { badgesKeys } from '@/features/badges/api/badgesKeys'
import { useAuthStore, selectIsAuthenticated } from '@/features/auth/store/useAuthStore'

/** `GET /api/v1/users/me/badges` — only enabled for a signed-in visitor,
 * same guard as `useFavorites`. */
export function useMyBadges() {
  const isAuthenticated = useAuthStore(selectIsAuthenticated)

  return useQuery({
    queryKey: badgesKeys.mine(),
    queryFn: getMyBadges,
    enabled: isAuthenticated,
  })
}
