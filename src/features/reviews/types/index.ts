import type { Nullable } from '@/lib/apiTypes'

// See `Nullable<T>`'s doc comment in `@/lib/apiTypes` for why every optional
// *response* field below uses it, and why any check against one must be
// loose (`== null`/`!= null`/`??`). Request DTOs we construct ourselves use
// plain `?` instead — see `user/types/index.ts` for the same convention.

/** Mirrors the backend `ContentStatus` enum (backend_analysis.md §3) —
 * shared by reviews, questions, and answers. */
export type ContentStatus = 'PUBLISHED' | 'FLAGGED' | 'HIDDEN'

/** `ReviewCreateDto` (request, backend_analysis.md §4, community module).
 * Used for both create (`POST .../reviews`) and update (`PUT .../reviews/{id}`)
 * — the backend has no separate update shape. */
export interface ReviewCreateDto {
  ratingOverall: number
  ratingCleanliness?: number
  ratingFacilities?: number
  ratingWomensArea?: number
  ratingParking?: number
  reviewText?: string
}

/** `ReviewResponseDto` (backend_analysis.md §4). */
export interface ReviewResponseDto {
  id: string
  mosqueId: string
  userId: string
  userDisplayName: Nullable<string>
  userPhotoUrl: Nullable<string>
  ratingOverall: number
  ratingCleanliness: Nullable<number>
  ratingFacilities: Nullable<number>
  ratingWomensArea: Nullable<number>
  ratingParking: Nullable<number>
  reviewText: Nullable<string>
  status: ContentStatus
  createdAt: string
}

/** `RatingSummaryDto` (backend_analysis.md §4). Sub-category averages are
 * `null` (not just absent) whenever nobody has rated that sub-category yet
 * — the backend returns the field, just with a `null` value, hence
 * `Nullable` rather than a plain optional here matches the doc precisely. */
export interface RatingSummaryDto {
  totalReviews: number
  averageOverall: number
  averageCleanliness: Nullable<number>
  averageFacilities: Nullable<number>
  averageWomensArea: Nullable<number>
  averageParking: Nullable<number>
}
