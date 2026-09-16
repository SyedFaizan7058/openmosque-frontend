import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { createClaim } from '@/features/claims/api/claimsApi'
import type { MosqueClaimSubmitDto } from '@/features/claims/types'

/** `POST /api/v1/mosques/{id}/claim`. */
export function useCreateClaim() {
  return useMutation({
    mutationFn: ({ mosqueId, body }: { mosqueId: string; body: MosqueClaimSubmitDto }) => createClaim(mosqueId, body),
    onSuccess: () => {
      toast.success("Your claim has been submitted for review.")
    },
    onError: () => {
      toast.error("Couldn't submit your claim. Please try again.")
    },
  })
}
