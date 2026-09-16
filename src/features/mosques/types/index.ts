import type { Nullable } from '@/lib/apiTypes'

/** Mirrors the backend `MosqueStatus` enum (backend_analysis.md §3). */
export type MosqueStatus = 'ACTIVE' | 'PENDING_REVIEW' | 'INACTIVE'

// See `Nullable<T>`'s doc comment in `@/lib/apiTypes` for why every optional
// field below uses it instead of a bare `T | null`, and why any check
// against one of these fields must be loose (`== null`/`!= null`/`??`).

/** `FacilityDto` — the facility catalog (backend_analysis.md §4, mosque
 * module). Fetched once via `GET /api/v1/facilities`. */
export interface FacilityDto {
  id: string
  code: string
  name: string
  description: Nullable<string>
  iconName: Nullable<string>
  active: boolean
}

/** `MosqueFacilityDto` — a facility as attached to a specific mosque
 * (backend_analysis.md §4). */
export interface MosqueFacilityDto {
  id: string
  facilityId: string
  facilityCode: string
  facilityName: string
  iconName: Nullable<string>
  customDetails: Nullable<string>
}

/** `MosqueImageDto` (backend_analysis.md §4). */
export interface MosqueImageDto {
  id: string
  imageUrl: string
  caption: Nullable<string>
  cover: boolean
  displayOrder: number
}

/** `MosqueSummaryDto` — the lightweight shape used by `/nearby` and
 * `/search` (backend_analysis.md §4). `distanceKm` is only populated for
 * `/nearby` results; absent for `/search`. */
export interface MosqueSummaryDto {
  id: string
  name: string
  slug: string
  address: string
  city: string
  state: Nullable<string>
  country: string
  latitude: number
  longitude: number
  distanceKm: Nullable<number>
  coverImageUrl: Nullable<string>
  verified: boolean
  status: MosqueStatus
  liveStreamUrl: Nullable<string>
  // Typed `string[]` (no `?`) in the doc, same as `UserResponseDto
  // .claimedMosqueIds` was — and that one arrived as `undefined` on real
  // data anyway (a live crash traced back to it). The doc's non-null
  // annotations describe intent, not a guarantee for a Java collection
  // field that can be null before Hibernate/the mapper touches it, so this
  // is widened defensively rather than trusted at face value.
  facilityCodes: Nullable<string[]>
  rating: Nullable<number>
  reviewCount: Nullable<number>
}

/** `MosqueResponseDto` — the full profile returned by
 * `GET /api/v1/mosques/{idOrSlug}` (backend_analysis.md §4). */
export interface MosqueResponseDto {
  id: string
  name: string
  slug: string
  description: Nullable<string>
  address: string
  city: string
  state: Nullable<string>
  country: string
  postalCode: Nullable<string>
  latitude: number
  longitude: number
  contactPhone: Nullable<string>
  contactEmail: Nullable<string>
  websiteUrl: Nullable<string>
  liveStreamUrl: Nullable<string>
  verified: boolean
  status: MosqueStatus
  // Same defensive widening as `facilityCodes` above, and for the same
  // demonstrated reason: `claimedMosqueIds` was documented as a required
  // array too, and still arrived as `undefined` from the live backend.
  facilities: Nullable<MosqueFacilityDto[]>
  images: Nullable<MosqueImageDto[]>
  createdAt: string
  rating: Nullable<number>
  reviewCount: Nullable<number>
}
