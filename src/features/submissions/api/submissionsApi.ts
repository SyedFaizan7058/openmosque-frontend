import { axiosInstance } from '@/lib/axiosInstance'
import type { PageResponse } from '@/lib/apiTypes'
import type { MosqueSubmissionRequestDto, MosqueSubmissionResponseDto, SubmissionDecisionDto, SubmissionStatus } from '@/features/submissions/types'

/** Crowdsourced submissions API (backend_analysis.md §5, "Crowdsourced
 * submissions & claims" + "moderation"). */

/** `POST /api/v1/mosques/submissions` — user. Submits a brand-new mosque
 * for moderator review (`submissionType: NEW_MOSQUE`, set server-side). */
export async function createMosqueSubmission(body: MosqueSubmissionRequestDto): Promise<MosqueSubmissionResponseDto> {
  const result = await axiosInstance.post('/mosques/submissions', body)
  return result as unknown as MosqueSubmissionResponseDto
}

/** `POST /api/v1/mosques/{id}/suggest-edit` — user. Suggests a correction
 * to an existing mosque's profile (`submissionType: EDIT_SUGGESTION` and
 * `targetMosqueId`, both set server-side). */
export async function suggestMosqueEdit(mosqueId: string, body: MosqueSubmissionRequestDto): Promise<MosqueSubmissionResponseDto> {
  const result = await axiosInstance.post(`/mosques/${encodeURIComponent(mosqueId)}/suggest-edit`, body)
  return result as unknown as MosqueSubmissionResponseDto
}

export interface SubmissionsQueueParams {
  status?: SubmissionStatus
  page: number
  size: number
}

/** `GET /api/v1/admin/moderation/submissions?status=&page=&size=` —
 * MODERATOR|SUPER_ADMIN. */
export async function getSubmissionsQueue({ status, page, size }: SubmissionsQueueParams): Promise<PageResponse<MosqueSubmissionResponseDto>> {
  const result = await axiosInstance.get('/admin/moderation/submissions', { params: { status, page, size } })
  return result as unknown as PageResponse<MosqueSubmissionResponseDto>
}

/** `PATCH /api/v1/admin/moderation/submissions/{id}/decision` —
 * MODERATOR|SUPER_ADMIN. */
export async function decideSubmission(submissionId: string, decision: SubmissionDecisionDto): Promise<MosqueSubmissionResponseDto> {
  const result = await axiosInstance.patch(`/admin/moderation/submissions/${encodeURIComponent(submissionId)}/decision`, decision)
  return result as unknown as MosqueSubmissionResponseDto
}
