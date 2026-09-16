import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { getReviews } from '@/features/reviews/api/reviewsApi'
import { reviewsKeys } from '@/features/reviews/api/reviewsKeys'

/** `GET /api/v1/mosques/{idOrSlug}/reviews`, paginated. `keepPreviousData`
 * avoids a loading flash when paging (same pattern as `useSearchMosques`). */
export function useReviews(idOrSlug: string | undefined, page: number, size = 10) {
  return useQuery({
    queryKey: reviewsKeys.page(idOrSlug ?? '', page, size),
    queryFn: () => getReviews({ idOrSlug: idOrSlug as string, page, size }),
    enabled: Boolean(idOrSlug),
    placeholderData: keepPreviousData,
  })
}
