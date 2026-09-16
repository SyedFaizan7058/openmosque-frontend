import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { getClaimsQueue } from '@/features/claims/api/claimsApi'
import { claimsKeys } from '@/features/claims/api/claimsKeys'
import type { ClaimStatus } from '@/features/claims/types'

/** `GET /api/v1/admin/mosques/claims`, paginated, optionally filtered by
 * status — moderator queue. */
export function useClaimsQueue(status: ClaimStatus | undefined, page: number, size = 20) {
  return useQuery({
    queryKey: claimsKeys.queue(status, page, size),
    queryFn: () => getClaimsQueue({ status, page, size }),
    placeholderData: keepPreviousData,
  })
}
