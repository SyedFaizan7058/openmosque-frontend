import { z } from 'zod'

/** Mirrors `ReviewCreateDto`'s validation (backend_analysis.md §4):
 * `ratingOverall` is the only required field (`@NotNull @Min(1) @Max(5)`);
 * every sub-rating is optional but, if present, is also `@Min(1) @Max(5)`.
 * `reviewText` has no documented `@Size` limit — the 2000-char cap here is
 * a UX guard against an unreasonably long submission, not a backend
 * constraint, so it's generous on purpose. */
export const reviewFormSchema = z.object({
  ratingOverall: z.number().min(1, 'Please choose an overall rating').max(5),
  ratingCleanliness: z.number().min(1).max(5).optional(),
  ratingFacilities: z.number().min(1).max(5).optional(),
  ratingWomensArea: z.number().min(1).max(5).optional(),
  ratingParking: z.number().min(1).max(5).optional(),
  reviewText: z.string().max(2000, 'Please keep your review under 2000 characters').optional(),
})

export type ReviewFormValues = z.infer<typeof reviewFormSchema>
