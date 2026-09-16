import type { Nullable } from '@/lib/apiTypes'

export type NotificationType =
  | 'IQAMAH_CHANGE'
  | 'SUBMISSION_RECEIVED'
  | 'SUBMISSION_APPROVED'
  | 'SUBMISSION_REJECTED'
  | 'CLAIM_APPROVED'
  | 'CLAIM_REJECTED'
  | 'BADGE_EARNED'
  | 'QUESTION_ANSWERED'
  | 'EVENT_ANNOUNCEMENT'
  | 'SYSTEM_ANNOUNCEMENT'

export interface NotificationResponseDto {
  id: string
  title: string
  message: string
  type: NotificationType
  linkUrl: Nullable<string>
  /** Raw JSON string from backend or null. Always parse with parseNotificationMetadata(). */
  metadataJson: Nullable<string>
  read: boolean
  createdAt: string
}

export interface NotificationSummaryDto {
  unreadCount: number
}

export interface DeviceTokenRegisterDto {
  fcmToken: string
  deviceType?: 'WEB' | 'ANDROID' | 'IOS' | string
  deviceName?: string
}

export interface DeviceTokenResponseDto {
  id: string
  fcmToken: string
  deviceType: string
  deviceName: Nullable<string>
  lastActiveAt: string
  createdAt: string
}

/** Safely parse the raw metadataJson string returned by the backend */
export function parseNotificationMetadata<T = Record<string, unknown>>(
  metadataJson: Nullable<string>,
): T | null {
  if (!metadataJson) return null
  try {
    return JSON.parse(metadataJson) as T
  } catch {
    return null
  }
}
