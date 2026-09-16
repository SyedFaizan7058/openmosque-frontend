import { axiosInstance } from '@/lib/axiosInstance'
import type { PageResponse } from '@/lib/apiTypes'
import type { FacilityDto, MosqueResponseDto, MosqueSummaryDto } from '@/features/mosques/types'

/**
 * Mosque discovery API (backend_analysis.md §5). Plain async wrappers
 * around the shared `axiosInstance` — the response interceptor already
 * unwraps `ApiResponse<T>` down to `T`, so each call here casts the
 * resolved value back to its real DTO type (same convention as
 * `features/auth/api/authApi.ts`). Fetching/caching lives in the
 * `hooks/*` files, never here.
 */

export interface NearbyMosquesParams {
  lat: number
  lng: number
  radiusKm: number
  /** Facility codes to filter by (backend_analysis.md §5:
   * `GET /mosques/nearby?...&facilities=`). Sent as a single
   * comma-separated value, matching Spring's default `List<String>`
   * binding for a repeated/`@RequestParam` collection. */
  facilities?: string[]
}

export interface SearchMosquesParams {
  q?: string
  city?: string
  country?: string
  /** Zero-indexed page number. */
  page: number
  size: number
}

/** `GET /api/v1/facilities` — public catalog, rarely changes. */
export async function getFacilities(): Promise<FacilityDto[]> {
  const result = await axiosInstance.get('/facilities')
  return result as unknown as FacilityDto[]
}

/** `GET /api/v1/mosques/nearby` — public, returns a plain (unpaginated)
 * array of `MosqueSummaryDto`. */
export async function getNearbyMosques(params: NearbyMosquesParams): Promise<MosqueSummaryDto[]> {
  const result = await axiosInstance.get('/mosques/nearby', {
    params: {
      latitude: params.lat,
      longitude: params.lng,
      radiusKm: params.radiusKm,
      facilities: params.facilities?.length ? params.facilities.join(',') : undefined,
    },
  })
  return result as unknown as MosqueSummaryDto[]
}

/** `GET /api/v1/mosques/search` — public, paginated. Note: the backend
 * does not accept a `facilities` filter on this endpoint (only `/nearby`
 * does) — `SearchMosquesPage` applies any facility filter client-side on
 * the fetched page. */
export async function searchMosques(params: SearchMosquesParams): Promise<PageResponse<MosqueSummaryDto>> {
  const result = await axiosInstance.get('/mosques/search', {
    params: {
      q: params.q || undefined,
      city: params.city || undefined,
      country: params.country || undefined,
      page: params.page,
      size: params.size,
    },
  })
  return result as unknown as PageResponse<MosqueSummaryDto>
}

/** `GET /api/v1/mosques/{idOrSlug}` — public. Throws the normalized
 * `ApiErrorDetail` (code `RESOURCE_NOT_FOUND` on a 404) via the shared
 * axios error interceptor. */
export async function getMosqueByIdOrSlug(idOrSlug: string): Promise<MosqueResponseDto> {
  const result = await axiosInstance.get(`/mosques/${encodeURIComponent(idOrSlug)}`)
  return result as unknown as MosqueResponseDto
}
