import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { decideFlag } from '@/features/flags/api/flagsApi'
import { flagsKeys } from '@/features/flags/api/flagsKeys'
import type { FlagDecisionDto } from '@/features/flags/types'

/** `PATCH /api/v1/admin/community/flags/{id}/decision` — moderator queue
 * action. Invalidates every cached queue page rather than just the current
 * one, since a decision changes which page a flag belongs on. */
export function useDecideFlag() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ flagId, decision }: { flagId: string; decision: FlagDecisionDto }) => decideFlag(flagId, decision),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: flagsKeys.all })
      toast.success('Decision recorded.')
    },
    onError: () => {
      toast.error("Couldn't record that decision. Please try again.")
    },
  })
}
