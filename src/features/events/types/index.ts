import type { Nullable } from '@/lib/apiTypes'

/** Mirrors the backend `EventType` enum (backend-api-contract.md §3). */
export type EventType =
  | 'HALAQAH'
  | 'WORKSHOP'
  | 'YOUTH_PROGRAM'
  | 'CHARITY'
  | 'RAMADAN'
  | 'EID'
  | 'COMMUNITY_MEETING'
  | 'OTHER'

/** Mirrors the backend `EventAudience` enum (backend-api-contract.md §3). */
export type EventAudience = 'ALL' | 'BROTHERS' | 'SISTERS' | 'YOUTH'

/** `MosqueEventCreateDto` (request, backend-api-contract.md §4, event
 * module) — used for both creating and updating an event (`POST` and
 * `PUT` both take this same shape). `title`/`eventType`/`startDateTime`/
 * `endDateTime` are `@NotBlank`/`@NotNull`; everything else optional. */
export interface MosqueEventCreateDto {
  title: string
  description?: string
  eventType: EventType
  audience: EventAudience
  /** ISO Instant. */
  startDateTime: string
  /** ISO Instant. */
  endDateTime: string
  locationDetails?: string
  speakerName?: string
  bannerImageUrl?: string
  registrationUrl?: string
}

/** `MosqueEventResponseDto` (backend-api-contract.md §4, event module). */
export interface MosqueEventResponseDto {
  id: string
  mosqueId: string
  mosqueName: Nullable<string>
  title: string
  description: Nullable<string>
  eventType: EventType
  audience: EventAudience
  startDateTime: string
  endDateTime: string
  locationDetails: Nullable<string>
  speakerName: Nullable<string>
  bannerImageUrl: Nullable<string>
  registrationUrl: Nullable<string>
  cancelled: boolean
  createdAt: string
}
