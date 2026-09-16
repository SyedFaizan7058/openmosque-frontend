import { axiosInstance } from '@/lib/axiosInstance'
import type { PageResponse } from '@/lib/apiTypes'
import type { UserResponseDto } from '@/features/auth/types'
import type { UserRole } from '@/lib/constants'

/** Super-admin user directory API — `UserAdminController`, both endpoints
 * `SUPER_ADMIN` only (backend-api-contract.md §5, "Users & Auth"). */

export interface AdminUsersListParams {
  role?: UserRole
  search?: string
  page: number
  size: number
}

/** `GET /api/v1/admin/users?role=&search=&page=&size=`. */
export async function getUsers({ role, search, page, size }: AdminUsersListParams): Promise<PageResponse<UserResponseDto>> {
  const result = await axiosInstance.get('/admin/users', {
    params: {
      role,
      search: search?.trim() || undefined,
      page,
      size,
    },
  })
  return result as unknown as PageResponse<UserResponseDto>
}

/** `PATCH /api/v1/admin/users/{id}/role`. */
export async function updateUserRole(userId: string, role: UserRole): Promise<UserResponseDto> {
  const result = await axiosInstance.patch(`/admin/users/${encodeURIComponent(userId)}/role`, { role })
  return result as unknown as UserResponseDto
}
