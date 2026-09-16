import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { getUsers } from '@/features/admin/api/adminUsersApi'
import { adminUsersKeys } from '@/features/admin/api/adminUsersKeys'
import type { UserRole } from '@/lib/constants'

/** `GET /api/v1/admin/users`, paginated, optionally filtered by role and search. */
export function useAdminUsers(role: UserRole | undefined, search: string | undefined, page: number, size = 20) {
  return useQuery({
    queryKey: adminUsersKeys.list(role, search, page, size),
    queryFn: () => getUsers({ role, search, page, size }),
    placeholderData: keepPreviousData,
  })
}
