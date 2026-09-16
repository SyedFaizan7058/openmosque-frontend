import { axiosInstance } from '@/lib/axiosInstance'
import type { PageResponse } from '@/lib/apiTypes'
import type { ContentFlagCreateDto, ContentFlagResponseDto, FlagDecisionDto } from '@/features/flags/types'

/** Content flags API (backend_analysis.md §5, community module). */

/** `POST /api/v1/community/flag` — user. */
export async function createFlag(body: ContentFlagCreateDto): Promise<ContentFlagResponseDto> {
  const result = await axiosInstance.post('/community/flag', body)
  return result as unknown as ContentFlagResponseDto
}

export interface FlagsQueueParams {
  page: number
  size: number
}

/** `GET /api/v1/admin/community/flags?page=&size=` — MODERATOR|SUPER_ADMIN. */
export async function getFlagsQueue({ page, size }: FlagsQueueParams): Promise<PageResponse<ContentFlagResponseDto>> {
  const result = await axiosInstance.get('/admin/community/flags', { params: { page, size } })
  return result as unknown as PageResponse<ContentFlagResponseDto>
}

/** `PATCH /api/v1/admin/community/flags/{id}/decision` — MODERATOR|SUPER_ADMIN. */
export async function decideFlag(flagId: string, decision: FlagDecisionDto): Promise<ContentFlagResponseDto> {
  const result = await axiosInstance.patch(`/admin/community/flags/${encodeURIComponent(flagId)}/decision`, decision)
  return result as unknown as ContentFlagResponseDto
}
