import { z } from 'zod'

/** Mirrors the backend `EventType`/`EventAudience` enums
 * (backend-api-contract.md §3) — local const tuples so `z.enum` has a
 * literal value to validate against (see the matching note in
 * `mosqueAdmin/schemas.ts`). */
const EVENT_TYPES = ['HALAQAH', 'WORKSHOP', 'YOUTH_PROGRAM', 'CHARITY', 'RAMADAN', 'EID', 'COMMUNITY_MEETING', 'OTHER'] as const
const EVENT_AUDIENCES = ['ALL', 'BROTHERS', 'SISTERS', 'YOUTH'] as const

const optionalUrl = z.string().url('Please enter a valid URL').optional().or(z.literal(''))

/** `startDateTime`/`endDateTime` stay as whatever a native
 * `<input type="datetime-local">` produces (`"YYYY-MM-DDTHH:mm"`, no
 * timezone) — converted to an ISO Instant via `new Date(...).toISOString()`
 * when building the request body, interpreted in the admin's own browser
 * time zone. A mosque whose configured time zone differs from the admin's
 * browser would need a time-zone-aware picker to do this precisely; that's
 * a real simplification, not an oversight — flagged here rather than
 * silently assumed correct. */
export const eventFormSchema = z
  .object({
    title: z.string().min(1, 'Required').max(200),
    description: z.string().max(2000).optional(),
    eventType: z.enum(EVENT_TYPES),
    audience: z.enum(EVENT_AUDIENCES),
    startDateTime: z.string().min(1, 'Required'),
    endDateTime: z.string().min(1, 'Required'),
    locationDetails: z.string().max(255).optional(),
    speakerName: z.string().max(150).optional(),
    bannerImageUrl: optionalUrl,
    registrationUrl: optionalUrl,
  })
  .refine((v) => new Date(v.endDateTime).getTime() > new Date(v.startDateTime).getTime(), {
    message: 'End time must be after the start time',
    path: ['endDateTime'],
  })

export type EventFormValues = z.infer<typeof eventFormSchema>
