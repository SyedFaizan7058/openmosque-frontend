import { z } from 'zod'

/** Mirrors `MosqueSubmissionRequestDto`'s validation (backend_analysis.md
 * §4): `name`/`address`/`city`/`country` `@NotBlank`; `latitude`
 * `@NotNull @DecimalMin(-90) @DecimalMax(90)`; `longitude` `@NotNull
 * @DecimalMin(-180) @DecimalMax(180)`; everything else optional. Latitude/
 * longitude stay plain strings here (what a text `<input>` actually
 * produces, same convention as `features/user/schemas.ts`'s location
 * form) and are parsed to numbers when building the request body. URL
 * fields use `.url()` client-side even though the backend DTO has no
 * `@URL`/`@Pattern` on them — a friendlier place to catch a typo than a
 * 400 from the server. */
const optionalUrl = z.string().url('Please enter a valid URL').optional().or(z.literal(''))

export const mosqueSubmissionSchema = z.object({
  name: z.string().min(1, 'Required').max(200),
  description: z.string().max(2000).optional(),
  address: z.string().min(1, 'Required').max(255),
  city: z.string().min(1, 'Required').max(100),
  state: z.string().max(100).optional(),
  country: z.string().min(1, 'Required').max(100),
  postalCode: z.string().max(20).optional(),
  latitude: z
    .string()
    .min(1, 'Required')
    .refine((v) => Number.isFinite(Number(v)) && Number(v) >= -90 && Number(v) <= 90, 'Must be between -90 and 90'),
  longitude: z
    .string()
    .min(1, 'Required')
    .refine((v) => Number.isFinite(Number(v)) && Number(v) >= -180 && Number(v) <= 180, 'Must be between -180 and 180'),
  contactPhone: z.string().max(30).optional(),
  contactEmail: z.string().email('Please enter a valid email').optional().or(z.literal('')),
  websiteUrl: optionalUrl,
  liveStreamUrl: optionalUrl,
  facilityCodes: z.array(z.string()),
  imageUrls: z.array(z.string()).optional(),
})

export type MosqueSubmissionFormValues = z.infer<typeof mosqueSubmissionSchema>
