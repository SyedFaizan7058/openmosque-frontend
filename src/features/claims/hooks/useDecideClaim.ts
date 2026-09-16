import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { decideClaim } from '@/features/claims/api/claimsApi'
import { claimsKeys } from '@/features/claims/api/claimsKeys'
import type { MosqueClaimDecisionDto } from '@/features/claims/types'

/** `PATCH /api/v1/admin/mosques/claims/{id}/decision` — moderator queue
 * action. An approval promotes the claimant to `MOSQUE_ADMIN` server-side
 * (backend-api-contract.md §3, badge table) — nothing extra for the
 * frontend to do beyond refreshing the queue. */
export function useDecideClaim() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ claimId, decision }: { claimId: string; decision: MosqueClaimDecisionDto }) => decideClaim(claimId, decision),
    onSuccess: (_data, { decision }) => {
      void queryClient.invalidateQueries({ queryKey: claimsKeys.all })
      void queryClient.invalidateQueries({ queryKey: ['moderation', 'counts'] })
      toast.success(decision.status === 'APPROVED' ? 'Claim approved.' : 'Claim rejected.')
    },
    onError: (err: unknown) => {
      const message =
        err && typeof err === 'object' && 'message' in err && typeof (err as { message: unknown }).message === 'string'
          ? (err as { message: string }).message
          : "Couldn't record that decision. Please try again."
      toast.error(message)
    },
  })
}
