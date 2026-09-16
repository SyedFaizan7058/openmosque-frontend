import type { UserRole } from '@/lib/constants'

/** Query-key factory for the super-admin user directory. */
export const adminUsersKeys = {
  all: ['admin-users'] as const,
  list: (role: UserRole | undefined, search: string | undefined, page: number, size: number) =>
    [...adminUsersKeys.all, 'list', role ?? 'ALL', search ?? '', page, size] as const,
}
