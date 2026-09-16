import { axiosInstance } from '@/lib/axiosInstance'
import type {
  TwoFactorStatusResponseDto,
  TwoFactorSetupResponseDto,
  TwoFactorEnableResponseDto,
  TwoFactorVerifyRequestDto,
} from '@/features/auth/2fa/types'

/**
 * Two-Factor Authentication API (backend-api-contract.md §2.8 & §5).
 * All endpoints under `/auth/2fa` require an authenticated session.
 */

/** `GET /api/v1/auth/2fa/status` — check if 2FA is active and remaining backup codes. */
export async function get2FAStatus(): Promise<TwoFactorStatusResponseDto> {
  const result = await axiosInstance.get('/auth/2fa/status')
  return result as unknown as TwoFactorStatusResponseDto
}

/** `POST /api/v1/auth/2fa/setup` — initiate setup, returns otpauth URI and secret. */
export async function post2FASetup(): Promise<TwoFactorSetupResponseDto> {
  const result = await axiosInstance.post('/auth/2fa/setup')
  return result as unknown as TwoFactorSetupResponseDto
}

/** `POST /api/v1/auth/2fa/enable` — submit 6-digit TOTP code to activate 2FA; returns backup codes once. */
export async function post2FAEnable(code: string): Promise<TwoFactorEnableResponseDto> {
  const result = await axiosInstance.post('/auth/2fa/enable', { code })
  return result as unknown as TwoFactorEnableResponseDto
}

/** `POST /api/v1/auth/2fa/verify` — verify challenge with code or backupCode. */
export async function post2FAVerify(dto: TwoFactorVerifyRequestDto): Promise<boolean> {
  const result = await axiosInstance.post('/auth/2fa/verify', dto)
  return result as unknown as boolean
}

/** `POST /api/v1/auth/2fa/disable` — disable 2FA with step-up verification. */
export async function post2FADisable(dto: TwoFactorVerifyRequestDto): Promise<void> {
  await axiosInstance.post('/auth/2fa/disable', dto)
}

/** `POST /api/v1/auth/2fa/regenerate-backup-codes` — regenerate 8 new backup recovery codes. */
export async function post2FARegenerateBackupCodes(code: string): Promise<string[]> {
  const result = await axiosInstance.post('/auth/2fa/regenerate-backup-codes', { code })
  return result as unknown as string[]
}
