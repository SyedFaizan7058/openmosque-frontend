import type { Nullable } from '@/lib/apiTypes'
import type { ContentStatus } from '@/features/reviews/types'

/** Mirrors the backend `QuestionStatus` enum (backend_analysis.md §3). */
export type QuestionStatus = 'OPEN' | 'ANSWERED' | 'FLAGGED' | 'HIDDEN'

/** `QuestionCreateDto` (request, backend_analysis.md §4, community
 * module) — used for both asking a new question (`POST .../questions`)
 * and editing an existing one (`PUT /community/questions/{id}`). */
export interface QuestionCreateDto {
  questionText: string
}

/** `AnswerCreateDto` (request, backend_analysis.md §4) — used for both
 * posting a new answer and editing an existing one. */
export interface AnswerCreateDto {
  answerText: string
}

/** `AnswerResponseDto` (backend_analysis.md §4). `officialMosqueAdmin`
 * flags an answer from the claimed admin of the mosque being asked
 * about — worth a visual badge so visitors can tell an authoritative
 * answer from a fellow visitor's. */
export interface AnswerResponseDto {
  id: string
  questionId: string
  userId: string
  userDisplayName: Nullable<string>
  userPhotoUrl: Nullable<string>
  answerText: string
  officialMosqueAdmin: boolean
  status: ContentStatus
  createdAt: string
}

/** `QuestionResponseDto` (backend_analysis.md §4) — carries its answers
 * inline, so a single page fetch renders the full thread with no N+1. */
export interface QuestionResponseDto {
  id: string
  mosqueId: string
  userId: string
  userDisplayName: Nullable<string>
  userPhotoUrl: Nullable<string>
  questionText: string
  status: QuestionStatus
  createdAt: string
  // Widened defensively, matching the now-established pattern in this
  // codebase: a field typed as a required array in the doc/backend contract
  // (`claimedMosqueIds` was too) can still arrive as `undefined` when the
  // underlying Java collection is null rather than empty.
  answers: Nullable<AnswerResponseDto[]>
}
