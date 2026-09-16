import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { deleteReview } from '@/features/reviews/api/reviewsApi'
import { reviewsKeys } from '@/features/reviews/api/reviewsKeys'

interface DeleteReviewVars {
  mosqueId: string
  reviewId: string
  idOrSlug: string
}

/** `DELETE /api/v1/mosques/{id}/reviews/{reviewId}` — own review only. */
export function useDeleteReview() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ mosqueId, reviewId }: DeleteReviewVars) => deleteReview(mosqueId, reviewId),
    onSuccess: (_data, { idOrSlug }) => {
      void queryClient.invalidateQueries({ queryKey: reviewsKeys.list(idOrSlug) })
      void queryClient.invalidateQueries({ queryKey: reviewsKeys.summary(idOrSlug) })
      toast.success('Your review has been deleted.')
    },
    onError: () => {
      toast.error("Couldn't delete your review. Please try again.")
    },
  })
}
