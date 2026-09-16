import { axiosInstance } from '@/lib/axiosInstance'
import type { PageResponse } from '@/lib/apiTypes'
import type { RatingSummaryDto, ReviewCreateDto, ReviewResponseDto } from '@/features/reviews/types'

/**
 * Reviews & ratings API (backend_analysis.md §5, "Community: reviews,
 * ratings, Q&A, flags"). Plain async wrappers around the shared
 * `axiosInstance` — same convention as `features/mosques/api/mosqueApi.ts`.
 * Every mutation here takes a mosque `id` (UUID), not `idOrSlug` — the
 * write-side community endpoints are `{id}`-only per the backend contract,
 * unlike the public read endpoints which accept either.
 */

export interface ReviewsPageParams {
  idOrSlug: string
  page: number
  size: number
}

/** `GET /api/v1/mosques/{idOrSlug}/reviews?page=&size=` — public. */
export async function getReviews({ idOrSlug, page, size }: ReviewsPageParams): Promise<PageResponse<ReviewResponseDto>> {
  const result = await axiosInstance.get(`/mosques/${encodeURIComponent(idOrSlug)}/reviews`, {
    params: { page, size },
  })
  return result as unknown as PageResponse<ReviewResponseDto>
}

/** `GET /api/v1/mosques/{idOrSlug}/ratings-summary` — public. */
export async function getRatingSummary(idOrSlug: string): Promise<RatingSummaryDto> {
  const result = await axiosInstance.get(`/mosques/${encodeURIComponent(idOrSlug)}/ratings-summary`)
  return result as unknown as RatingSummaryDto
}

/** `POST /api/v1/mosques/{id}/reviews` — user. 409s if this user already
 * reviewed this mosque (DB unique constraint, see backend_analysis.md §6) —
 * `useCreateReview` surfaces that as a friendly "you already reviewed
 * this" message rather than a generic error. */
export async function createReview(mosqueId: string, body: ReviewCreateDto): Promise<ReviewResponseDto> {
  const result = await axiosInstance.post(`/mosques/${encodeURIComponent(mosqueId)}/reviews`, body)
  return result as unknown as ReviewResponseDto
}

/** `PUT /api/v1/mosques/{id}/reviews/{reviewId}` — user, own review only. */
export async function updateReview(mosqueId: string, reviewId: string, body: ReviewCreateDto): Promise<ReviewResponseDto> {
  const result = await axiosInstance.put(`/mosques/${encodeURIComponent(mosqueId)}/reviews/${encodeURIComponent(reviewId)}`, body)
  return result as unknown as ReviewResponseDto
}

/** `DELETE /api/v1/mosques/{id}/reviews/{reviewId}` — user, own review only.
 * Returns `200 OK` with no body (soft delete — see backend_analysis.md §6),
 * not `204`. */
export async function deleteReview(mosqueId: string, reviewId: string): Promise<void> {
  await axiosInstance.delete(`/mosques/${encodeURIComponent(mosqueId)}/reviews/${encodeURIComponent(reviewId)}`)
}
