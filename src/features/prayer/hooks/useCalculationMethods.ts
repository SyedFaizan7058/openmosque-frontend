import { useQuery } from '@tanstack/react-query'
import { getCalculationMethods } from '@/features/prayer/api/prayerApi'
import { prayerKeys } from '@/features/prayer/api/prayerKeys'

/** `GET /api/v1/prayer-times/methods` — public catalog, rarely changes.
 * Not currently consumed by `PrayerTimesWidget` (which reads
 * `calculationMethodName` straight off the day response instead of making a
 * second call), but exposed for any future calculation-method picker
 * (e.g. mosque-admin prayer config, Phase 6). */
export function useCalculationMethods() {
  return useQuery({
    queryKey: prayerKeys.methods(),
    queryFn: getCalculationMethods,
    staleTime: Infinity,
  })
}
