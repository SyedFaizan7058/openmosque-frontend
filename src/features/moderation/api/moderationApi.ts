import { axiosInstance } from '@/lib/axiosInstance'
import type { PlatformStatsDto, ModerationCountsDto } from '@/features/moderation/types'

/** `GET /api/v1/admin/stats` — MODERATOR|SUPER_ADMIN */
export async function getPlatformStats(): Promise<PlatformStatsDto> {
  const result = await axiosInstance.get('/admin/stats')
  return result as unknown as PlatformStatsDto
}

/** `GET /api/v1/admin/moderation/counts` — MODERATOR|SUPER_ADMIN */
export async function getModerationCounts(): Promise<ModerationCountsDto> {
  const result = await axiosInstance.get('/admin/moderation/counts')
  return result as unknown as ModerationCountsDto
}
