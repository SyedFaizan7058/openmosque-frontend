import { axiosInstance } from '@/lib/axiosInstance'
import type { PageResponse } from '@/lib/apiTypes'
import type {
  DeviceTokenRegisterDto,
  DeviceTokenResponseDto,
  NotificationResponseDto,
  NotificationSummaryDto,
} from '@/features/notifications/types'

/**
 * Notifications API (backend-api-contract.md §4 & §5).
 * All endpoints under `/users/me/notifications` require authentication.
 */

export interface GetNotificationsParams {
  page?: number
  size?: number
}

/** `GET /api/v1/users/me/notifications` — paginated in-app notifications. */
export async function getNotifications(
  params: GetNotificationsParams = {},
): Promise<PageResponse<NotificationResponseDto>> {
  const result = await axiosInstance.get('/users/me/notifications', { params })
  return result as unknown as PageResponse<NotificationResponseDto>
}

/** `GET /api/v1/users/me/notifications/unread-count` — unread count for badge. */
export async function getUnreadCount(): Promise<NotificationSummaryDto> {
  const result = await axiosInstance.get('/users/me/notifications/unread-count')
  return result as unknown as NotificationSummaryDto
}

/** `PATCH /api/v1/users/me/notifications/{id}/read` — mark single notification as read. */
export async function markNotificationAsRead(id: string): Promise<void> {
  await axiosInstance.patch(`/users/me/notifications/${encodeURIComponent(id)}/read`)
}

/** `PATCH /api/v1/users/me/notifications/read-all` — mark all notifications as read. */
export async function markAllNotificationsAsRead(): Promise<number> {
  const result = await axiosInstance.patch('/users/me/notifications/read-all')
  return result as unknown as number
}

/** `POST /api/v1/users/me/notifications/devices` — register FCM push device token. */
export async function registerDeviceToken(
  dto: DeviceTokenRegisterDto,
): Promise<DeviceTokenResponseDto> {
  const result = await axiosInstance.post('/users/me/notifications/devices', dto)
  return result as unknown as DeviceTokenResponseDto
}

/** `DELETE /api/v1/users/me/notifications/devices/{fcmToken}` — unregister FCM token. */
export async function unregisterDeviceToken(fcmToken: string): Promise<void> {
  await axiosInstance.delete(`/users/me/notifications/devices/${encodeURIComponent(fcmToken)}`)
}

/** `GET /api/v1/users/me/notifications/devices` — list registered devices for current user. */
export async function getUserDevices(): Promise<DeviceTokenResponseDto[]> {
  const result = await axiosInstance.get('/users/me/notifications/devices')
  return result as unknown as DeviceTokenResponseDto[]
}
