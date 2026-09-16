import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { searchMosques } from '@/features/mosques/api/mosqueApi'
import type { SearchMosquesParams } from '@/features/mosques/api/mosqueApi'
import { mosqueKeys } from '@/features/mosques/api/mosqueKeys'

/** `GET /api/v1/mosques/search`, paginated. `placeholderData:
 * keepPreviousData` keeps the current page's results on screen (instead of
 * flashing a loading state) while a page/filter change is in flight. */
export function useSearchMosques(params: SearchMosquesParams) {
  return useQuery({
    queryKey: mosqueKeys.search(params),
    queryFn: () => searchMosques(params),
    placeholderData: keepPreviousData,
  })
}
