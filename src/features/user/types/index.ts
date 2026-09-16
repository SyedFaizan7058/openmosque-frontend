/** Mirrors `UserLocationUpdateRequestDto` (backend_analysis.md §4, user
 * module) — a request body we construct ourselves, so plain optional
 * fields are fine here (the `Nullable<T>` convention exists for *response*
 * fields that the backend might omit under `@JsonInclude(NON_NULL)`). */
export interface UserLocationUpdateRequestDto {
  preferredCity?: string
  preferredCountry?: string
  latitude?: number
  longitude?: number
}
