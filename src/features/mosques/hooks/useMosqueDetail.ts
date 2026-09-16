import { useQuery } from '@tanstack/react-query'
import { getMosqueByIdOrSlug } from '@/features/mosques/api/mosqueApi'
import { mosqueKeys } from '@/features/mosques/api/mosqueKeys'
import type { MosqueResponseDto } from '@/features/mosques/types'
import type { ApiErrorDetail } from '@/features/auth/types'

/** `GET /api/v1/mosques/{idOrSlug}`. A `RESOURCE_NOT_FOUND` error (404) is
 * not retried — `MosqueDetailPage` renders the not-found UI immediately
 * instead of retrying a request that can never succeed. */
export function useMosqueDetail(idOrSlug: string | undefined) {
  return useQuery<MosqueResponseDto, ApiErrorDetail>({
    queryKey: mosqueKeys.detail(idOrSlug ?? ''),
    queryFn: () => getMosqueByIdOrSlug(idOrSlug as string),
    enabled: Boolean(idOrSlug),
    retry: (failureCount, error) => {
      if (error?.code === 'RESOURCE_NOT_FOUND') return false
      return failureCount < 1
    },
  })
}
