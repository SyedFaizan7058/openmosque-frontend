import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { decideSubmission } from '@/features/submissions/api/submissionsApi'
import { submissionsKeys } from '@/features/submissions/api/submissionsKeys'
import type { SubmissionDecisionDto } from '@/features/submissions/types'

/** `PATCH /api/v1/admin/moderation/submissions/{id}/decision` — moderator
 * queue action. Invalidates every cached queue page (any status filter),
 * since a decision moves the submission out of `PENDING` entirely. */
export function useDecideSubmission() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ submissionId, decision }: { submissionId: string; decision: SubmissionDecisionDto }) =>
      decideSubmission(submissionId, decision),
    onSuccess: (_data, { decision }) => {
      void queryClient.invalidateQueries({ queryKey: submissionsKeys.all })
      void queryClient.invalidateQueries({ queryKey: ['moderation', 'counts'] })
      toast.success(decision.status === 'APPROVED' ? 'Submission approved.' : 'Submission rejected.')
    },
    onError: () => {
      toast.error("Couldn't record that decision. Please try again.")
    },
  })
}
