import type { UserRole } from '@/lib/constants'
import type { ApiError, Nullable } from '@/lib/apiTypes'

export type { UserRole }

/**
 * Mirrors `UserResponseDto` (backend_analysis.md §4, user module).
 * This is the authoritative shape of "our" user record, distinct from the
 * Firebase user object — `role` here is what actually gates the UI.
 *
 * Every optional field uses `Nullable<T>` (see `@/lib/apiTypes`'s doc
 * comment) rather than a bare `T | null` — this file predates that
 * convention (it shipped in Phase 1, before a `.toFixed()` crash in Phase 2
 * traced back to exactly this gap), but `claimedMosqueIds` arriving as
 * `undefined` rather than `[]` (a live crash: "Cannot read properties of
 * undefined (reading 'includes')" on `MosqueDetailPage`) confirms the same
 * `@JsonInclude(NON_NULL)` behavior applies here too, so every field below
 * is widened to match, not just the one that happened to crash first. */
export interface UserResponseDto {
  id: string
  firebaseUid: string
  email: string
  displayName: Nullable<string>
  phoneNumber: Nullable<string>
  photoUrl: Nullable<string>
  role: UserRole
  points: number
  active: boolean
  verified: boolean
  preferredCity: Nullable<string>
  preferredCountry: Nullable<string>
  latitude: Nullable<number>
  longitude: Nullable<number>
  claimedMosqueIds: Nullable<string[]>
  createdAt: string
}

/** Mirrors `UserSyncRequestDto` (backend_analysis.md §4). */
export interface UserSyncRequestDto {
  firebaseUid: string
  email: string
  displayName?: string | null
  phoneNumber?: string | null
  photoUrl?: string | null
  preferredCity?: string | null
  preferredCountry?: string | null
  latitude?: number | null
  longitude?: number | null
}

/** Body accepted by `POST /api/v1/auth/session` (backend_analysis.md §2.2). */
export interface AuthSessionRequestDto {
  token: string
  refreshToken?: string
}

/** Normalized shape thrown by the axios error interceptor (see
 * `lib/axiosInstance.ts`) — an alias of the shared `ApiError`
 * (`lib/apiTypes.ts`), kept here so existing auth call sites don't need to
 * change their import path. */
export type ApiErrorDetail = ApiError
