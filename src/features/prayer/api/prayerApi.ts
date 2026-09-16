import { axiosInstance } from '@/lib/axiosInstance'
import type { CalculationMethodDto, PrayerTimesDayResponseDto } from '@/features/prayer/types'

/**
 * Prayer times API (backend_analysis.md §5, "Prayer times"). Plain async
 * wrappers around the shared `axiosInstance` — same convention as
 * `features/mosques/api/mosqueApi.ts`. Only the public endpoints are wired
 * here; the `/mosque-admin/*` prayer-config endpoints are Phase 6.
 */

/** `GET /api/v1/mosques/{idOrSlug}/prayer-times?date=YYYY-MM-DD` — public.
 * `date` is optional; omitting it asks the backend for "today" in the
 * mosque's own time zone. */
export async function getPrayerTimes(idOrSlug: string, date?: string): Promise<PrayerTimesDayResponseDto> {
  const result = await axiosInstance.get(`/mosques/${encodeURIComponent(idOrSlug)}/prayer-times`, {
    params: date ? { date } : undefined,
  })
  return result as unknown as PrayerTimesDayResponseDto
}

/** `GET /api/v1/prayer-times/methods` — public, rarely changes. */
export async function getCalculationMethods(): Promise<CalculationMethodDto[]> {
  const result = await axiosInstance.get('/prayer-times/methods')
  return result as unknown as CalculationMethodDto[]
}
