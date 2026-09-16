import { z } from 'zod'

/** Mirrors the backend `CalculationMethod`/`JuristicSchool`/
 * `IqamahCalculationType` enums (backend-api-contract.md §3) — kept as
 * local const tuples (rather than importing the `CalculationMethod` union
 * type from `features/prayer/types`) because `z.enum` needs a literal
 * tuple value, not just a type, to build its own runtime validator. */
const CALCULATION_METHODS = [
  'KARACHI',
  'ISNA',
  'MUSLIM_WORLD_LEAGUE',
  'UMM_AL_QURA',
  'EGYPTIAN',
  'TEHRAN',
  'GULF',
  'KUWAIT',
  'QATAR',
  'SINGAPORE',
  'FRANCE',
  'TURKEY',
  'RUSSIA',
  'CUSTOM',
] as const
const JURISTIC_SCHOOLS = ['STANDARD', 'HANAFI'] as const
const IQAMAH_TYPES = ['OFFSET_AFTER_ADHAN', 'FIXED_TIME'] as const

/** All the numeric/time fields below stay plain strings, same convention
 * as `mosqueSubmissionSchema`'s latitude/longitude — what a text `<input>`
 * actually produces, parsed to the real type when building the request
 * body. */
export const prayerConfigFormSchema = z.object({
  calculationMethod: z.enum(CALCULATION_METHODS),
  juristicSchool: z.enum(JURISTIC_SCHOOLS),
  timeZone: z.string().max(64).optional(),
  fajrAngle: z.string().optional(),
  ishaAngle: z.string().optional(),
  highLatitudeRule: z.string().max(64).optional(),
})
export type PrayerConfigFormValues = z.infer<typeof prayerConfigFormSchema>

const iqamahPrayerSchema = z.object({
  type: z.enum(IQAMAH_TYPES),
  offsetMinutes: z.string().optional(),
  /** `"HH:mm"` from a native `<input type="time">`. */
  fixedTime: z.string().optional(),
  adhanTime: z.string().optional(),
})

export const iqamahScheduleFormSchema = z.object({
  fajr: iqamahPrayerSchema,
  dhuhr: iqamahPrayerSchema,
  asr: iqamahPrayerSchema,
  maghrib: iqamahPrayerSchema,
  isha: iqamahPrayerSchema,
  jummah1Time: z.string().optional(),
  jummah2Time: z.string().optional(),
  jummahKhutbahLanguage: z.string().max(50).optional(),
})
export type IqamahScheduleFormValues = z.infer<typeof iqamahScheduleFormSchema>

/** Mirrors `MosqueUpdateRequestDto`'s validation — same shape/rules as
 * `mosqueSubmissionSchema` (submissions feature), duplicated rather than
 * imported since the two forms serve different actions (a direct write
 * here vs. a moderation-queued suggestion there) and this codebase keeps
 * each feature's schema self-contained rather than cross-importing form
 * validation across feature boundaries. `latitude`/`longitude` are
 * `@NotNull`-validated here too even though the DTO itself only requires
 * them as primitives (0.0 default) — an admin directly overwriting their
 * mosque's coordinates with an accidental blank is worth blocking
 * client-side. */
const optionalUrl = z.string().url('Please enter a valid URL').optional().or(z.literal(''))

export const mosqueProfileFormSchema = z.object({
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
  imageUrls: z.array(z.string()),
})
export type MosqueProfileFormValues = z.infer<typeof mosqueProfileFormSchema>
