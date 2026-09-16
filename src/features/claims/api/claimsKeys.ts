import type { ClaimStatus } from '@/features/claims/types'

/** Query-key factory for the claims moderation queue. */
export const claimsKeys = {
  all: ['claims'] as const,
  queue: (status: ClaimStatus | undefined, page: number, size: number) =>
    [...claimsKeys.all, 'queue', status ?? 'ALL', page, size] as const,
}
