import type { Nullable } from '@/lib/apiTypes'

// See `Nullable<T>`'s doc comment in `@/lib/apiTypes` for why every optional
// field below uses it instead of a bare `T | null`, and why any check
// against one of these fields must be loose (`== null`/`!= null`/`??`).

/** Mirrors the backend `CalculationMethod` enum (backend_analysis.md §3). */
export type CalculationMethod =
  | 'KARACHI'
  | 'ISNA'
  | 'MUSLIM_WORLD_LEAGUE'
  | 'UMM_AL_QURA'
  | 'EGYPTIAN'
  | 'TEHRAN'
  | 'GULF'
  | 'KUWAIT'
  | 'QATAR'
  | 'SINGAPORE'
  | 'FRANCE'
  | 'TURKEY'
  | 'RUSSIA'
  | 'CUSTOM'

/** Mirrors the backend `JuristicSchool` enum (backend_analysis.md §3). */
export type JuristicSchool = 'STANDARD' | 'HANAFI'

/** The five daily prayer names plus sunrise, as they appear in
 * `SinglePrayerTimeDto.prayerName` (backend_analysis.md §4, prayer module). */
export type PrayerName = 'FAJR' | 'SUNRISE' | 'DHUHR' | 'ASR' | 'MAGHRIB' | 'ISHA'

/** `SinglePrayerTimeDto` (backend_analysis.md §4). `iqamahTime` is null for
 * `SUNRISE` (there's no iqamah for sunrise) — the doc doesn't mark the other
 * fields nullable, so only `iqamahTime` gets `Nullable<T>`. */
export interface SinglePrayerTimeDto {
  prayerName: PrayerName
  /** `"HH:mm"` */
  adhanTime: string
  /** `"HH:mm"`, null for `SUNRISE`. */
  iqamahTime: Nullable<string>
  isNext: boolean
  timeRemainingFormatted: string
  asrShafiTime?: Nullable<string>
  asrHanafiTime?: Nullable<string>
}

/** `FridayJummahScheduleDto` (backend_analysis.md §4). Only
 * `secondJummahTime` and `khutbahLanguage` are marked `?` in the doc. */
export interface FridayJummahScheduleDto {
  /** `"HH:mm"` */
  firstJummahTime: string
  /** `"HH:mm"?` */
  secondJummahTime: Nullable<string>
  khutbahLanguage: Nullable<string>
}

/** `PrayerTimesDayResponseDto` — the composite response for
 * `GET /mosques/{idOrSlug}/prayer-times` (backend_analysis.md §4). Most
 * fields on this DTO are not marked `?` in the doc; `timeRemainingMinutes`
 * is the one exception (`long?`). `jummahSchedule` itself isn't marked
 * nullable in the doc text, but a mosque with no Friday config configured
 * server-side would simply omit it under `@JsonInclude(NON_NULL)` — treated
 * as `Nullable<T>` here defensively since the widget must not crash on a
 * mosque that hasn't set up Jummah times yet. */
export interface PrayerTimesDayResponseDto {
  mosqueId: string
  mosqueName: Nullable<string>
  mosqueSlug: Nullable<string>
  /** `YYYY-MM-DD` */
  date: string
  hijriDate: string
  timeZone: string
  calculationMethod: string
  calculationMethodName: string
  juristicSchool: string
  currentPrayer: string
  nextPrayer: string
  /** `"HH:mm"` */
  nextPrayerTime: string
  timeRemainingMinutes: Nullable<number>
  timeRemainingFormatted: string
  asrShafiTime?: Nullable<string>
  asrHanafiTime?: Nullable<string>
  ishraaqTime?: Nullable<string>
  chaashtTime?: Nullable<string>
  zawaalTime?: Nullable<string>
  sunsetTime?: Nullable<string>
  iftaarTime?: Nullable<string>
  tahajjudTime?: Nullable<string>
  sahoorEndTime?: Nullable<string>
  // Widened defensively for the same reason as the fields called out above
  // — see `MosqueSummaryDto.facilityCodes` for the live-crash precedent.
  timings: Nullable<SinglePrayerTimeDto[]>
  jummahSchedule: Nullable<FridayJummahScheduleDto>
}

/** `CalculationMethodDto` (backend_analysis.md §4). None of its fields are
 * marked `?` in the doc. */
export interface CalculationMethodDto {
  code: string
  name: string
  aladhanMethodId: number
}
