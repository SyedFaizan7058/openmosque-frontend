import { useQueries } from '@tanstack/react-query'
import { getMosqueByIdOrSlug } from '@/features/mosques/api/mosqueApi'
import { mosqueKeys } from '@/features/mosques/api/mosqueKeys'
import type { MosqueResponseDto } from '@/features/mosques/types'

/** Fetches the full `MosqueResponseDto` for each mosque a
 * MOSQUE_ADMIN has an approved claim on (`UserResponseDto
 * .claimedMosqueIds`). There's no dedicated "list the mosques I administer"
 * endpoint in the backend, so this reuses the public
 * `GET /mosques/{idOrSlug}` per id — cheap in practice, since almost every
 * admin has exactly one claimed mosque, and the result rides the same
 * `mosqueKeys.detail` cache entry the public detail page uses. */
export function useAdminMosques(mosqueIds: string[]) {
  const queries = useQueries({
    queries: mosqueIds.map((id) => ({
      queryKey: mosqueKeys.detail(id),
      queryFn: () => getMosqueByIdOrSlug(id),
    })),
  })

  const mosques: MosqueResponseDto[] = queries
    .map((q) => q.data)
    .filter((m): m is MosqueResponseDto => m != null)

  return {
    mosques,
    isLoading: mosqueIds.length > 0 && queries.some((q) => q.isLoading),
    isError: queries.some((q) => q.isError),
  }
}
