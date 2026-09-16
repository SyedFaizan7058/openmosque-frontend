import { useQuery } from '@tanstack/react-query'
import { getPrayerTimes } from '@/features/prayer/api/prayerApi'
import { prayerKeys } from '@/features/prayer/api/prayerKeys'
import type { ApiErrorDetail } from '@/features/auth/types'
import type { PrayerTimesDayResponseDto } from '@/features/prayer/types'

/** `GET /api/v1/mosques/{idOrSlug}/prayer-times`. `date` (`YYYY-MM-DD`) is
 * optional — omit it for "today". A `RESOURCE_NOT_FOUND` idOrSlug is not
 * retried, matching `useMosqueDetail`'s convention. */
export function usePrayerTimes(idOrSlug: string | undefined, date?: string) {
  return useQuery<PrayerTimesDayResponseDto, ApiErrorDetail>({
    queryKey: prayerKeys.times(idOrSlug ?? '', date),
    queryFn: () => getPrayerTimes(idOrSlug as string, date),
    enabled: Boolean(idOrSlug),
    retry: (failureCount, error) => {
      if (error?.code === 'RESOURCE_NOT_FOUND') return false
      return failureCount < 1
    },
  })
}
