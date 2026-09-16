/** `PlatformStatsDto` (backend-api-contract.md §4, moderation module). */
export interface PlatformStatsDto {
  totalMosques: number
  verifiedMosques: number
  pendingSubmissions: number
  pendingClaims: number
  activeFlags: number
  totalUsers: number
}

export interface ModerationCountsDto {
  pendingSubmissions: number
  pendingClaims: number
  pendingFlags: number
}

