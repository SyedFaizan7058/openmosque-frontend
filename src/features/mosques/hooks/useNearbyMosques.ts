import { useQuery } from '@tanstack/react-query'
import { getNearbyMosques } from '@/features/mosques/api/mosqueApi'
import type { NearbyMosquesParams } from '@/features/mosques/api/mosqueApi'
import { mosqueKeys } from '@/features/mosques/api/mosqueKeys'

/** `GET /api/v1/mosques/nearby`. Pass `null` (no coordinates yet — e.g.
 * geolocation still resolving or denied) to keep the query disabled. */
export function useNearbyMosques(params: NearbyMosquesParams | null) {
  return useQuery({
    queryKey: params ? mosqueKeys.nearby(params) : [...mosqueKeys.all, 'nearby', 'idle'],
    queryFn: () => getNearbyMosques(params as NearbyMosquesParams),
    enabled: params !== null,
  })
}
