import { z } from 'zod'

/** Mirrors `MosqueClaimSubmitDto`'s validation (backend-api-contract.md
 * §4) — every field is `@NotBlank`, plus `officialEmail` is `@Email`. */
export const claimFormSchema = z.object({
  fullName: z.string().min(1, 'Required').max(150),
  phoneNumber: z.string().min(1, 'Required').max(30),
  officialEmail: z.string().min(1, 'Required').email('Please enter a valid email'),
  positionInMosque: z.string().min(1, 'Required').max(100),
  proofDocumentUrl: z.string().min(1, 'Please upload a proof document (PDF or image)').url('Invalid document URL'),
})

export type ClaimFormValues = z.infer<typeof claimFormSchema>
