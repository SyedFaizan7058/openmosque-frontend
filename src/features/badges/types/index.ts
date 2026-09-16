/**
 * `BadgeDto` / `UserBadgeResponseDto` (backend_analysis.md §4, user module).
 * Neither DTO marks any field `?` in the doc — only widen a field to
 * `Nullable<T>` where the doc actually shows a `?`, never blanket-apply it.
 */

/** `BadgeDto` — the full badge catalog, `GET /api/v1/badges`. */
export interface BadgeDto {
  id: string
  code: string
  name: string
  description: string
  iconName: string
  category: string
  thresholdPoints: number
  active: boolean
  /** ISO datetime */
  createdAt: string
}

/** `UserBadgeResponseDto` — a badge a specific user has earned. */
export interface UserBadgeResponseDto {
  /** the award row id, not the badge id */
  id: string
  badgeId: string
  code: string
  name: string
  description: string
  iconName: string
  category: string
  /** ISO datetime */
  earnedAt: string
}
