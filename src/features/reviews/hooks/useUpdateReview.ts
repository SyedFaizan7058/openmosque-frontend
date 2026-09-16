import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { updateReview } from '@/features/reviews/api/reviewsApi'
import { reviewsKeys } from '@/features/reviews/api/reviewsKeys'
import type { ReviewCreateDto } from '@/features/reviews/types'

interface UpdateReviewVars {
  mosqueId: string
  reviewId: string
  idOrSlug: string
  body: ReviewCreateDto
}

/** `PUT /api/v1/mosques/{id}/reviews/{reviewId}` — own review only. */
export function useUpdateReview() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ mosqueId, reviewId, body }: UpdateReviewVars) => updateReview(mosqueId, reviewId, body),
    onSuccess: (_data, { idOrSlug }) => {
      void queryClient.invalidateQueries({ queryKey: reviewsKeys.list(idOrSlug) })
      void queryClient.invalidateQueries({ queryKey: reviewsKeys.summary(idOrSlug) })
      toast.success('Your review has been updated.')
    },
    onError: () => {
      toast.error("Couldn't update your review. Please try again.")
    },
  })
}
