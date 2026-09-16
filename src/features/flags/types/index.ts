import type { Nullable } from '@/lib/apiTypes'

/** Mirrors the backend `TargetType` enum (backend_analysis.md §3) — what
 * kind of community content a flag/report points at. */
export type TargetType = 'REVIEW' | 'QUESTION' | 'ANSWER'

/** Mirrors the backend `FlagStatus` enum (backend_analysis.md §3). */
export type FlagStatus = 'PENDING' | 'RESOLVED' | 'DISMISSED'

/** `ContentFlagCreateDto` (request, backend_analysis.md §4, community
 * module). */
export interface ContentFlagCreateDto {
  targetType: TargetType
  targetId: string
  reason: string
}

/** `ContentFlagResponseDto` (backend_analysis.md §4). */
export interface ContentFlagResponseDto {
  id: string
  targetType: TargetType
  targetId: string
  reporterId: string
  reporterEmail: Nullable<string>
  reason: string
  status: FlagStatus
  reviewerId: Nullable<string>
  reviewerNotes: Nullable<string>
  createdAt: string
}

/** `FlagDecisionDto` (request, backend_analysis.md §4) — only `RESOLVED`
 * and `DISMISSED` are meaningful moderator decisions per the doc. */
export interface FlagDecisionDto {
  status: Extract<FlagStatus, 'RESOLVED' | 'DISMISSED'>
  reviewerNotes?: string
}
