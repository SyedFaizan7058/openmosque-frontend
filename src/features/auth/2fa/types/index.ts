export interface TwoFactorStatusResponseDto {
  enabled: boolean
  remainingBackupCodes: number
}

export interface TwoFactorSetupResponseDto {
  secret: string
  qrCodeUri: string
  manualEntryKey: string
  instructions: string
}

export interface TwoFactorEnableResponseDto {
  enabled: boolean
  backupCodes: string[]
  message: string
}

export interface TwoFactorVerifyRequestDto {
  code?: string
  backupCode?: string
}
