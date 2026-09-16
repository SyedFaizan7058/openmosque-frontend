import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { createReview } from '@/features/reviews/api/reviewsApi'
import { reviewsKeys } from '@/features/reviews/api/reviewsKeys'
import type { ReviewCreateDto } from '@/features/reviews/types'
import type { ApiErrorDetail } from '@/features/auth/types'

interface CreateReviewVars {
  mosqueId: string
  idOrSlug: string
  body: ReviewCreateDto
}

/** `POST /api/v1/mosques/{id}/reviews`. A DB unique constraint means a
 * second review from the same user for the same mosque 409s
 * (`RESOURCE_ALREADY_EXISTS` or a raw `CONFLICT`, backend_analysis.md §6) —
 * surfaced as a specific, actionable message rather than the generic
 * error toast. */
export function useCreateReview() {
  const queryClient = useQueryClient()

  return useMutation<unknown, ApiErrorDetail, CreateReviewVars>({
    mutationFn: ({ mosqueId, body }) => createReview(mosqueId, body),
    onSuccess: (_data, { idOrSlug }) => {
      void queryClient.invalidateQueries({ queryKey: reviewsKeys.list(idOrSlug) })
      void queryClient.invalidateQueries({ queryKey: reviewsKeys.summary(idOrSlug) })
      toast.success('Your review has been posted.')
    },
    onError: (error) => {
      if (error?.code === 'RESOURCE_ALREADY_EXISTS' || error?.code === 'CONFLICT') {
        toast.error("You've already reviewed this mosque — edit your existing review instead.")
        return
      }
      toast.error(error?.message || "Couldn't post your review. Please try again.")
    },
  })
}
