import { z } from 'zod'

/** Same convention as `mosqueSubmissionSchema`'s lat/lng fields: a numeric
 * value that stays a plain string (what a text `<input>` actually
 * produces), validated against a numeric range and parsed to a real number
 * only when building the request body on submit. */
function numericRangeString(min: number, max: number, message: string) {
  return z.string().min(1, 'Required').refine((v) => Number.isFinite(Number(v)) && Number(v) >= min && Number(v) <= max, message)
}

/** Mirrors `CityIngestRequestDto`'s validation. */
export const cityIngestFormSchema = z.object({
  city: z.string().min(1, 'Required').max(200),
  country: z.string().max(100).optional(),
  dryRun: z.boolean(),
})
export type CityIngestFormValues = z.infer<typeof cityIngestFormSchema>

/** Mirrors `RadiusIngestRequestDto`'s validation (`@Min(100) @Max(100000)`
 * on `radiusMeters`, per backend-api-contract.md §4). */
export const radiusIngestFormSchema = z.object({
  latitude: numericRangeString(-90, 90, 'Must be between -90 and 90'),
  longitude: numericRangeString(-180, 180, 'Must be between -180 and 180'),
  radiusMeters: numericRangeString(100, 100000, 'Must be between 100 and 100,000 meters'),
  defaultCity: z.string().max(100).optional(),
  defaultCountry: z.string().max(100).optional(),
  dryRun: z.boolean(),
})
export type RadiusIngestFormValues = z.infer<typeof radiusIngestFormSchema>

/** Mirrors `BboxIngestRequestDto`'s validation, plus two client-only
 * sanity checks (north > south, east > west) the DTO itself doesn't
 * enforce — a backwards box is a user-input mistake worth catching before
 * it burns an Overpass API call. */
export const bboxIngestFormSchema = z
  .object({
    south: numericRangeString(-90, 90, 'Must be between -90 and 90'),
    west: numericRangeString(-180, 180, 'Must be between -180 and 180'),
    north: numericRangeString(-90, 90, 'Must be between -90 and 90'),
    east: numericRangeString(-180, 180, 'Must be between -180 and 180'),
    defaultCity: z.string().max(100).optional(),
    defaultCountry: z.string().max(100).optional(),
    dryRun: z.boolean(),
  })
  .refine((v) => Number(v.north) > Number(v.south), { message: 'North must be greater than south', path: ['north'] })
  .refine((v) => Number(v.east) > Number(v.west), { message: 'East must be greater than west', path: ['east'] })
export type BboxIngestFormValues = z.infer<typeof bboxIngestFormSchema>
