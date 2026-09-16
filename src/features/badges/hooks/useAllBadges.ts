import { useQuery } from '@tanstack/react-query'
import { getAllBadges } from '@/features/badges/api/badgesApi'
import { badgesKeys } from '@/features/badges/api/badgesKeys'

/** `GET /api/v1/badges` — public catalog, rarely changes. */
export function useAllBadges() {
  return useQuery({
    queryKey: badgesKeys.catalog(),
    queryFn: getAllBadges,
    staleTime: 5 * 60 * 1000,
  })
}
