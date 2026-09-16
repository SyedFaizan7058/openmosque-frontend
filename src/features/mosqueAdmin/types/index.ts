import type { Nullable } from '@/lib/apiTypes'
import type { CalculationMethod, JuristicSchool } from '@/features/prayer/types'

/** Mirrors the backend `IqamahCalculationType` enum (backend-api-contract.md
 * §3). */
export type IqamahCalculationType = 'OFFSET_AFTER_ADHAN' | 'FIXED_TIME'

/** `PrayerConfigDto` (backend-api-contract.md §4, prayer module). Only
 * `calculationMethodDisplayName`, `fajrAngle`, `ishaAngle`, and
 * `highLatitudeRule` are marked `?` in the doc. */
export interface PrayerConfigDto {
  id: string
  mosqueId: string
  calculationMethod: CalculationMethod
  calculationMethodDisplayName: Nullable<string>
  juristicSchool: JuristicSchool
  timeZone: string
  fajrAngle: Nullable<number>
  ishaAngle: Nullable<number>
  highLatitudeRule: Nullable<string>
}

/** `PrayerConfigUpdateDto` (request, `PUT /mosque-admin/mosques/{id}/
 * prayer-config`). `calculationMethod`/`juristicSchool` `@NotNull`,
 * everything else optional. */
export interface PrayerConfigUpdateDto {
  calculationMethod: CalculationMethod
  juristicSchool: JuristicSchool
  timeZone?: string
  fajrAngle?: number
  ishaAngle?: number
  highLatitudeRule?: string
}

export type IqamahPrayerKey = 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha'

/**
 * `IqamahScheduleDto` (backend-api-contract.md §4, prayer module).
 *
 * The doc notates the per-prayer fields as `{Prayer}Type` (capitalized)
 * alongside `{prayer}OffsetMinutes`/`{prayer}FixedTime`/`{prayer}AdhanTime`
 * (lowercase) — almost certainly just inconsistent notation in the doc
 * rather than an actual capitalized JSON key (every other DTO in this
 * contract, and every field in this codebase, is plain camelCase), so all
 * five `{prayer}Type` fields below are typed lowercase-first
 * (`fajrType`, not `FajrType`). If a live response ever disagrees, this is
 * the one place to fix it.
 */
export interface IqamahScheduleDto {
  id: string
  mosqueId: string
  fajrType: IqamahCalculationType
  fajrOffsetMinutes: Nullable<number>
  fajrFixedTime: Nullable<string>
  fajrAdhanTime: Nullable<string>
  dhuhrType: IqamahCalculationType
  dhuhrOffsetMinutes: Nullable<number>
  dhuhrFixedTime: Nullable<string>
  dhuhrAdhanTime: Nullable<string>
  asrType: IqamahCalculationType
  asrOffsetMinutes: Nullable<number>
  asrFixedTime: Nullable<string>
  asrAdhanTime: Nullable<string>
  maghribType: IqamahCalculationType
  maghribOffsetMinutes: Nullable<number>
  maghribFixedTime: Nullable<string>
  maghribAdhanTime: Nullable<string>
  ishaType: IqamahCalculationType
  ishaOffsetMinutes: Nullable<number>
  ishaFixedTime: Nullable<string>
  ishaAdhanTime: Nullable<string>
  jummah1Time: Nullable<string>
  jummah2Time: Nullable<string>
  jummahKhutbahLanguage: Nullable<string>
}

/** `IqamahScheduleUpdateDto` (request) — same shape as the response DTO but
 * every `{prayer}Type` is required (`@NotNull`) even though the specific
 * time value for that prayer stays optional. */
export interface IqamahScheduleUpdateDto {
  fajrType: IqamahCalculationType
  fajrOffsetMinutes?: number
  fajrFixedTime?: string
  fajrAdhanTime?: string
  dhuhrType: IqamahCalculationType
  dhuhrOffsetMinutes?: number
  dhuhrFixedTime?: string
  dhuhrAdhanTime?: string
  asrType: IqamahCalculationType
  asrOffsetMinutes?: number
  asrFixedTime?: string
  asrAdhanTime?: string
  maghribType: IqamahCalculationType
  maghribOffsetMinutes?: number
  maghribFixedTime?: string
  maghribAdhanTime?: string
  ishaType: IqamahCalculationType
  ishaOffsetMinutes?: number
  ishaFixedTime?: string
  ishaAdhanTime?: string
  jummah1Time?: string
  jummah2Time?: string
  jummahKhutbahLanguage?: string
}

/** `MosqueAdminStatsDto` (backend-api-contract.md §4, mosque module).
 * `ratingsBreakdown` is a `Map<int,long>` (star value 1-5 -> count) — JSON
 * object with numeric-looking string keys, so `Record<string, number>` is
 * the honest client-side shape (object keys are always strings in JS). */
export interface MosqueAdminStatsDto {
  totalFavorites: number
  totalReviews: number
  averageRating: number
  ratingsBreakdown: Record<string, number>
  upcomingEventsCount: number
  unansweredQuestionsCount: number
}

/** `MosqueUpdateRequestDto` (request, `PUT /api/v1/mosques/{id}` — note:
 * NOT under `/mosque-admin/`, a documented discrepancy in
 * backend-api-contract.md §6). Same field shape as `MosqueSubmissionForm`'s
 * schema, kept as its own type here (rather than imported from the
 * submissions feature) since the two are conceptually different actions —
 * this is a direct write to an already-owned mosque, that one goes through
 * moderation review. `latitude`/`longitude` are primitive `double` here
 * (0.0 default, not `@NotNull`-validated), unlike the create/submission
 * DTOs. */
export interface MosqueUpdateRequestDto {
  name: string
  description?: string
  address: string
  city: string
  state?: string
  country: string
  postalCode?: string
  latitude: number
  longitude: number
  contactPhone?: string
  contactEmail?: string
  websiteUrl?: string
  liveStreamUrl?: string
  facilityCodes?: string[]
  imageUrls?: string[]
}
