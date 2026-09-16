import { useQuery } from '@tanstack/react-query'
import { getFacilities } from '@/features/mosques/api/mosqueApi'
import { mosqueKeys } from '@/features/mosques/api/mosqueKeys'

/** The facility catalog (backend_analysis.md §4/§5) — an hour-long
 * `staleTime` since it's effectively static reference data, seeded once by
 * a Flyway migration and only rarely edited by an admin. */
export function useFacilities() {
  return useQuery({
    queryKey: mosqueKeys.facilities(),
    queryFn: getFacilities,
    staleTime: 60 * 60 * 1000,
  })
}
