import { axiosInstance } from '@/lib/axiosInstance'
import type { FavoriteMosqueResponseDto, FavoriteStatusDto } from '@/features/favorites/types'

/**
 * Favorites API (backend_analysis.md §5, "Favorites"). Plain async wrappers
 * around the shared `axiosInstance` — same convention as
 * `features/mosques/api/mosqueApi.ts`. All three endpoints require login.
 */

/** `GET /api/v1/users/me/favorites` — returns a plain array, NOT a
 * `PageResponse` — don't wrap this in pagination handling. */
export async function getFavorites(): Promise<FavoriteMosqueResponseDto[]> {
  const result = await axiosInstance.get('/users/me/favorites')
  return result as unknown as FavoriteMosqueResponseDto[]
}

/** `POST /api/v1/mosques/{mosqueId}/favorite`. */
export async function addFavorite(mosqueId: string): Promise<FavoriteStatusDto> {
  const result = await axiosInstance.post(`/mosques/${encodeURIComponent(mosqueId)}/favorite`)
  return result as unknown as FavoriteStatusDto
}

/** `DELETE /api/v1/mosques/{mosqueId}/favorite`. */
export async function removeFavorite(mosqueId: string): Promise<FavoriteStatusDto> {
  const result = await axiosInstance.delete(`/mosques/${encodeURIComponent(mosqueId)}/favorite`)
  return result as unknown as FavoriteStatusDto
}
