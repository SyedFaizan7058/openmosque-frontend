import { axiosInstance } from '@/lib/axiosInstance'
import type {
  IqamahScheduleDto,
  IqamahScheduleUpdateDto,
  MosqueAdminStatsDto,
  MosqueUpdateRequestDto,
  PrayerConfigDto,
  PrayerConfigUpdateDto,
} from '@/features/mosqueAdmin/types'
import type { MosqueResponseDto } from '@/features/mosques/types'

/** Mosque Admin API (backend-api-contract.md §5, "Prayer times" +
 * "mosque module" sections). Every call here takes a mosque `id` (UUID) —
 * the `/mosque-admin/**` routes are admin/mutation endpoints, not
 * slug-aware public reads. */

/** `GET /api/v1/mosque-admin/mosques/{id}/prayer-config` —
 * MOSQUE_ADMIN|SUPER_ADMIN. */
export async function getPrayerConfig(mosqueId: string): Promise<PrayerConfigDto> {
  const result = await axiosInstance.get(`/mosque-admin/mosques/${encodeURIComponent(mosqueId)}/prayer-config`)
  return result as unknown as PrayerConfigDto
}

/** `PUT /api/v1/mosque-admin/mosques/{id}/prayer-config` —
 * MOSQUE_ADMIN|SUPER_ADMIN. */
export async function updatePrayerConfig(mosqueId: string, body: PrayerConfigUpdateDto): Promise<PrayerConfigDto> {
  const result = await axiosInstance.put(`/mosque-admin/mosques/${encodeURIComponent(mosqueId)}/prayer-config`, body)
  return result as unknown as PrayerConfigDto
}

/** `GET /api/v1/mosque-admin/mosques/{id}/iqamah-schedule` —
 * MOSQUE_ADMIN|SUPER_ADMIN. */
export async function getIqamahSchedule(mosqueId: string): Promise<IqamahScheduleDto> {
  const result = await axiosInstance.get(`/mosque-admin/mosques/${encodeURIComponent(mosqueId)}/iqamah-schedule`)
  return result as unknown as IqamahScheduleDto
}

/** `PUT /api/v1/mosque-admin/mosques/{id}/iqamah-schedule` —
 * MOSQUE_ADMIN|SUPER_ADMIN. */
export async function updateIqamahSchedule(
  mosqueId: string,
  body: IqamahScheduleUpdateDto,
): Promise<IqamahScheduleDto> {
  const result = await axiosInstance.put(`/mosque-admin/mosques/${encodeURIComponent(mosqueId)}/iqamah-schedule`, body)
  return result as unknown as IqamahScheduleDto
}

/** `GET /api/v1/mosque-admin/mosques/{id}/stats` — MOSQUE_ADMIN|SUPER_ADMIN
 * |MODERATOR (the one `/mosque-admin/**` sub-route the security config
 * also grants to moderators, per backend-api-contract.md §6's route
 * matrix). */
export async function getMosqueAdminStats(mosqueId: string): Promise<MosqueAdminStatsDto> {
  const result = await axiosInstance.get(`/mosque-admin/mosques/${encodeURIComponent(mosqueId)}/stats`)
  return result as unknown as MosqueAdminStatsDto
}

/** `PUT /api/v1/mosques/{id}` — deliberately NOT under `/mosque-admin/`;
 * see the doc comment on `MosqueUpdateRequestDto`. A direct write to an
 * already-owned, already-verified mosque (no moderation queue), unlike
 * `suggest-edit` which any visitor can use and always goes to review. */
export async function updateMosqueProfile(mosqueId: string, body: MosqueUpdateRequestDto): Promise<MosqueResponseDto> {
  const result = await axiosInstance.put(`/mosques/${encodeURIComponent(mosqueId)}`, body)
  return result as unknown as MosqueResponseDto
}
