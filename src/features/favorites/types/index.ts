import type { Nullable } from '@/lib/apiTypes'

// See `Nullable<T>`'s doc comment in `@/lib/apiTypes` for why every optional
// field below uses it instead of a bare `T | null`, and why any check
// against one of these fields must be loose (`== null`/`!= null`/`??`).

/** `FavoriteMosqueResponseDto` (backend_analysis.md §4, mosque module).
 * Note this is a distinct shape from `MosqueSummaryDto` — `mosqueId` not
 * `id`, no `rating`/`reviewCount`/`status`, and `latitude`/`longitude`/
 * `distanceKm` are nullable here (per the doc's `?` marks) even though
 * `MosqueSummaryDto.latitude/longitude` are not. */
export interface FavoriteMosqueResponseDto {
  mosqueId: string
  name: string
  slug: string
  description: Nullable<string>
  address: string
  city: string
  state: Nullable<string>
  country: string
  postalCode: Nullable<string>
  latitude: Nullable<number>
  longitude: Nullable<number>
  distanceKm: Nullable<number>
  coverImageUrl: Nullable<string>
  verified: boolean
  // Widened defensively — see the matching comment on
  // `MosqueSummaryDto.facilityCodes` in `@/features/mosques/types`.
  facilityCodes: Nullable<string[]>
  /** ISO datetime */
  favoritedAt: string
}

/** `FavoriteStatusDto` (backend_analysis.md §4). Neither field is marked
 * `?` in the doc. */
export interface FavoriteStatusDto {
  mosqueId: string
  favorite: boolean
}
