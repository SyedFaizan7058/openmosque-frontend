import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { StarRatingInput } from '@/features/reviews/components/StarRatingInput'
import { useCreateReview } from '@/features/reviews/hooks/useCreateReview'
import { useUpdateReview } from '@/features/reviews/hooks/useUpdateReview'
import { reviewFormSchema } from '@/features/reviews/schemas'
import type { ReviewFormValues } from '@/features/reviews/schemas'
import type { ReviewResponseDto } from '@/features/reviews/types'

interface ReviewFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mosqueId: string
  idOrSlug: string
  /** Present -> editing this review (`PUT`); absent -> creating a new one
   * (`POST`). Keeping one dialog component for both, rather than a
   * separate edit dialog, since the form body is identical. */
  existingReview?: ReviewResponseDto
}

/** Create/edit dialog for a mosque review — one overall star rating
 * (required) plus four optional sub-category ratings and free-text. */
export function ReviewForm({ open, onOpenChange, mosqueId, idOrSlug, existingReview }: ReviewFormProps) {
  const createReview = useCreateReview()
  const updateReview = useUpdateReview()
  const isEditing = Boolean(existingReview)
  const isPending = createReview.isPending || updateReview.isPending

  const { control, register, handleSubmit, reset, formState: { errors } } = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewFormSchema),
    defaultValues: {
      ratingOverall: existingReview?.ratingOverall ?? 0,
      ratingCleanliness: existingReview?.ratingCleanliness ?? undefined,
      ratingFacilities: existingReview?.ratingFacilities ?? undefined,
      ratingWomensArea: existingReview?.ratingWomensArea ?? undefined,
      ratingParking: existingReview?.ratingParking ?? undefined,
      reviewText: existingReview?.reviewText ?? '',
    },
  })

  function onSubmit(values: ReviewFormValues) {
    const body = {
      ratingOverall: values.ratingOverall,
      ratingCleanliness: values.ratingCleanliness,
      ratingFacilities: values.ratingFacilities,
      ratingWomensArea: values.ratingWomensArea,
      ratingParking: values.ratingParking,
      reviewText: values.reviewText?.trim() || undefined,
    }

    const onDone = () => {
      onOpenChange(false)
      reset()
    }

    if (existingReview) {
      updateReview.mutate({ mosqueId, reviewId: existingReview.id, idOrSlug, body }, { onSuccess: onDone })
    } else {
      createReview.mutate({ mosqueId, idOrSlug, body }, { onSuccess: onDone })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit your review' : 'Write a review'}</DialogTitle>
          <DialogDescription>Share your experience to help other visitors.</DialogDescription>
        </DialogHeader>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)} noValidate>
          <Controller
            name="ratingOverall"
            control={control}
            render={({ field }) => (
              <StarRatingInput label="Overall rating" required value={field.value || undefined} onChange={field.onChange} />
            )}
          />
          {errors.ratingOverall ? <p role="alert" className="-mt-2 text-sm text-destructive">{errors.ratingOverall.message}</p> : null}

          <div className="grid grid-cols-2 gap-4">
            <Controller
              name="ratingCleanliness"
              control={control}
              render={({ field }) => (
                <StarRatingInput label="Cleanliness" size="sm" value={field.value} onChange={field.onChange} />
              )}
            />
            <Controller
              name="ratingFacilities"
              control={control}
              render={({ field }) => (
                <StarRatingInput label="Facilities" size="sm" value={field.value} onChange={field.onChange} />
              )}
            />
            <Controller
              name="ratingWomensArea"
              control={control}
              render={({ field }) => (
                <StarRatingInput label="Women's area" size="sm" value={field.value} onChange={field.onChange} />
              )}
            />
            <Controller
              name="ratingParking"
              control={control}
              render={({ field }) => (
                <StarRatingInput label="Parking" size="sm" value={field.value} onChange={field.onChange} />
              )}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="review-text" className="text-sm font-medium text-foreground">
              Your review (optional)
            </label>
            <Textarea
              id="review-text"
              rows={4}
              placeholder="What stood out about this mosque?"
              aria-invalid={!!errors.reviewText}
              aria-describedby={errors.reviewText ? 'review-text-error' : undefined}
              {...register('reviewText')}
            />
            {errors.reviewText ? (
              <p id="review-text-error" role="alert" className="text-sm text-destructive">
                {errors.reviewText.message}
              </p>
            ) : null}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
              {isEditing ? 'Save changes' : 'Post review'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
