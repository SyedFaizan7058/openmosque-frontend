import { axiosInstance } from '@/lib/axiosInstance'
import type { BadgeDto, UserBadgeResponseDto } from '@/features/badges/types'

/** `GET /api/v1/badges` — public, the full badge catalog. */
export async function getAllBadges(): Promise<BadgeDto[]> {
  const result = await axiosInstance.get('/badges')
  return result as unknown as BadgeDto[]
}

/** `GET /api/v1/users/me/badges` — auth-only, the current user's earned
 * badges. */
export async function getMyBadges(): Promise<UserBadgeResponseDto[]> {
  const result = await axiosInstance.get('/users/me/badges')
  return result as unknown as UserBadgeResponseDto[]
}
