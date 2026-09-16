import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { getSubmissionsQueue } from '@/features/submissions/api/submissionsApi'
import { submissionsKeys } from '@/features/submissions/api/submissionsKeys'
import type { SubmissionStatus } from '@/features/submissions/types'

/** `GET /api/v1/admin/moderation/submissions`, paginated, optionally
 * filtered by status — moderator queue. */
export function useSubmissionsQueue(status: SubmissionStatus | undefined, page: number, size = 20) {
  return useQuery({
    queryKey: submissionsKeys.queue(status, page, size),
    queryFn: () => getSubmissionsQueue({ status, page, size }),
    placeholderData: keepPreviousData,
  })
}
