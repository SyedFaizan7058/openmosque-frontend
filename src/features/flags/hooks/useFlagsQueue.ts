import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { getFlagsQueue } from '@/features/flags/api/flagsApi'
import { flagsKeys } from '@/features/flags/api/flagsKeys'

/** `GET /api/v1/admin/community/flags`, paginated — moderator queue. */
export function useFlagsQueue(page: number, size = 20) {
  return useQuery({
    queryKey: flagsKeys.queue(page, size),
    queryFn: () => getFlagsQueue({ page, size }),
    placeholderData: keepPreviousData,
  })
}
