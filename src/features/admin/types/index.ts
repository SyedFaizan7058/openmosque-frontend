import type { UserRole } from '@/lib/constants'

/** Mirrors `UserRoleUpdateRequestDto` (backend-api-contract.md §4, user
 * module) — request-only, built by us. */
export interface UserRoleUpdateRequestDto {
  role: UserRole
}
