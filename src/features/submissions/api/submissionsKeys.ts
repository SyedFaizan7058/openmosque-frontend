import type { SubmissionStatus } from '@/features/submissions/types'

/** Query-key factory for the submissions moderation queue. */
export const submissionsKeys = {
  all: ['submissions'] as const,
  queue: (status: SubmissionStatus | undefined, page: number, size: number) =>
    [...submissionsKeys.all, 'queue', status ?? 'ALL', page, size] as const,
}
