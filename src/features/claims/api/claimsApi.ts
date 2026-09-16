import { axiosInstance } from '@/lib/axiosInstance'
import type { PageResponse } from '@/lib/apiTypes'
import type { ClaimStatus, MosqueClaimDecisionDto, MosqueClaimResponseDto, MosqueClaimSubmitDto } from '@/features/claims/types'

/** Mosque claims API (backend-api-contract.md §5, "Crowdsourced
 * submissions & claims"). A successful claim approval promotes the
 * claimant to `MOSQUE_ADMIN` and awards the `VERIFIED_IMAM` badge, handled
 * entirely server-side. */

/** `POST /api/v1/mosques/{id}/claim` — user. */
export async function createClaim(mosqueId: string, body: MosqueClaimSubmitDto): Promise<MosqueClaimResponseDto> {
  const result = await axiosInstance.post(`/mosques/${encodeURIComponent(mosqueId)}/claim`, body)
  return result as unknown as MosqueClaimResponseDto
}

export interface ClaimsQueueParams {
  status?: ClaimStatus
  page: number
  size: number
}

/** `GET /api/v1/admin/mosques/claims?status=&page=&size=` —
 * MODERATOR|SUPER_ADMIN. */
export async function getClaimsQueue({ status, page, size }: ClaimsQueueParams): Promise<PageResponse<MosqueClaimResponseDto>> {
  const result = await axiosInstance.get('/admin/mosques/claims', { params: { status, page, size } })
  return result as unknown as PageResponse<MosqueClaimResponseDto>
}

/** `PATCH /api/v1/admin/mosques/claims/{id}/decision` —
 * MODERATOR|SUPER_ADMIN. */
export async function decideClaim(claimId: string, decision: MosqueClaimDecisionDto): Promise<MosqueClaimResponseDto> {
  const result = await axiosInstance.patch(`/admin/mosques/claims/${encodeURIComponent(claimId)}/decision`, decision)
  return result as unknown as MosqueClaimResponseDto
}
