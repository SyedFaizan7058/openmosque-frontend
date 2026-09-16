import type { Nullable } from '@/lib/apiTypes'

/** Mirrors the backend `SubmissionStatus` enum (backend_analysis.md §3). */
export type SubmissionStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

/** Mirrors the backend `SubmissionType` enum (backend_analysis.md §3). */
export type SubmissionType = 'NEW_MOSQUE' | 'EDIT_SUGGESTION'

/** `MosqueSubmissionRequestDto` (request, backend_analysis.md §4,
 * moderation module). `targetMosqueId`/`submissionType` are server-
 * controlled per the doc (the controller overwrites whatever the client
 * sends based on which endpoint was called), so the frontend never sets
 * them — they're typed here only because the response DTO echoes them
 * back. */
export interface MosqueSubmissionRequestDto {
  name: string
  description?: string
  address: string
  city: string
  state?: string
  country: string
  postalCode?: string
  latitude: number
  longitude: number
  contactPhone?: string
  contactEmail?: string
  websiteUrl?: string
  liveStreamUrl?: string
  facilityCodes?: string[]
  imageUrls?: string[]
}

/** `MosqueSubmissionResponseDto` (backend_analysis.md §4). */
export interface MosqueSubmissionResponseDto extends MosqueSubmissionRequestDto {
  id: string
  targetMosqueId: Nullable<string>
  submissionType: SubmissionType
  submitterId: string
  submitterName: Nullable<string>
  submitterEmail: Nullable<string>
  status: SubmissionStatus
  reviewerId: Nullable<string>
  reviewerName: Nullable<string>
  reviewComments: Nullable<string>
  reviewedAt: Nullable<string>
  createdAt: string
}

/** `SubmissionDecisionDto` (request, backend_analysis.md §4). */
export interface SubmissionDecisionDto {
  status: Extract<SubmissionStatus, 'APPROVED' | 'REJECTED'>
  reviewComments?: string
}
