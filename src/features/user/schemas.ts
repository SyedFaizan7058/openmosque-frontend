import { z } from 'zod'

/** Validates a numeric-range field while keeping the underlying form value
 * a plain string (matches what a text `<input>` actually produces) — an
 * empty string is treated as "not provided" and always passes. */
function numericRangeString(min: number, max: number, message: string) {
  return z.string().refine((val) => {
    if (val.trim() === '') return true
    const parsed = Number(val)
    return Number.isFinite(parsed) && parsed >= min && parsed <= max
  }, message)
}

/** Mirrors `UserLocationUpdateRequestDto`'s validation constraints
 * (backend_analysis.md §4): city/country `@Size(max=100)`, latitude
 * `@DecimalMin(-90) @DecimalMax(90)`, longitude `@DecimalMin(-180)
 * @DecimalMax(180)` — all four fields optional. Every field stays a plain
 * string here (what a text `<input>` actually produces); the page converts
 * blank strings to `undefined` and numeric strings to numbers when building
 * the request body on submit. */
export const locationUpdateSchema = z.object({
  preferredCity: z.string().max(100, 'Must be at most 100 characters'),
  preferredCountry: z.string().max(100, 'Must be at most 100 characters'),
  latitude: numericRangeString(-90, 90, 'Must be between -90 and 90'),
  longitude: numericRangeString(-180, 180, 'Must be between -180 and 180'),
})

export type LocationUpdateFormValues = z.infer<typeof locationUpdateSchema>
