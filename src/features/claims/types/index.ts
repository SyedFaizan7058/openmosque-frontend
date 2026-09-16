import type { Nullable } from '@/lib/apiTypes'

/** Mirrors the backend `ClaimStatus` enum (backend-api-contract.md §3). */
export type ClaimStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

/** `MosqueClaimSubmitDto` (request, backend-api-contract.md §4, claim
 * module). */
export interface MosqueClaimSubmitDto {
  fullName: string
  phoneNumber: string
  officialEmail: string
  positionInMosque: string
  proofDocumentUrl: string
}

/** `MosqueClaimResponseDto` (backend-api-contract.md §4). */
export interface MosqueClaimResponseDto extends MosqueClaimSubmitDto {
  id: string
  mosqueId: string
  mosqueName: string
  claimantId: string
  claimantEmail: string
  status: ClaimStatus
  reviewerId: Nullable<string>
  reviewerName: Nullable<string>
  reviewComments: Nullable<string>
  reviewedAt: Nullable<string>
  createdAt: string
}

/** `MosqueClaimDecisionDto` (request, backend-api-contract.md §4). */
export interface MosqueClaimDecisionDto {
  status: ClaimStatus
  reviewComments?: string
}
