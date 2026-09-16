import { axiosInstance } from '@/lib/axiosInstance'
import type { UserResponseDto } from '@/features/auth/types'
import type { UserLocationUpdateRequestDto } from '@/features/user/types'

/** `PUT /api/v1/users/me/location` (backend_analysis.md §5) — returns the
 * updated, authoritative `UserResponseDto`. */
export async function updateUserLocation(body: UserLocationUpdateRequestDto): Promise<UserResponseDto> {
  const result = await axiosInstance.put('/users/me/location', body)
  return result as unknown as UserResponseDto
}
