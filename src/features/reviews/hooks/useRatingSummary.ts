import { useQuery } from '@tanstack/react-query'
import { getRatingSummary } from '@/features/reviews/api/reviewsApi'
import { reviewsKeys } from '@/features/reviews/api/reviewsKeys'

/** `GET /api/v1/mosques/{idOrSlug}/ratings-summary` — public. */
export function useRatingSummary(idOrSlug: string | undefined) {
  return useQuery({
    queryKey: reviewsKeys.summary(idOrSlug ?? ''),
    queryFn: () => getRatingSummary(idOrSlug as string),
    enabled: Boolean(idOrSlug),
  })
}
