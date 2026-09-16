import { axiosInstance } from '@/lib/axiosInstance'
import type { PageResponse } from '@/lib/apiTypes'
import type { MosqueEventCreateDto, MosqueEventResponseDto } from '@/features/events/types'

/** Events API (backend-api-contract.md §5, "Events & Khutbahs") — the
 * public read side (Phase 4) plus Mosque Admin's create/update/delete
 * (Phase 5), kept in one file per this codebase's convention of mixing
 * public + write endpoints for one resource in a single API module (see
 * `reviewsApi.ts`). There's no separate "list my mosque's events for
 * admin" endpoint — `MosqueAdminEventController` only exposes the three
 * mutations below, so the admin page reuses `getMosqueEvents` (the same
 * public list) for its own listing. */

export interface EventsPageParams {
  idOrSlug: string
  page: number
  size: number
}

/** `GET /api/v1/mosques/{idOrSlug}/events?type=&page=&size=` — public. */
export async function getMosqueEvents({ idOrSlug, page, size }: EventsPageParams): Promise<PageResponse<MosqueEventResponseDto>> {
  const result = await axiosInstance.get(`/mosques/${encodeURIComponent(idOrSlug)}/events`, { params: { page, size } })
  return result as unknown as PageResponse<MosqueEventResponseDto>
}

/** `POST /api/v1/mosque-admin/mosques/{id}/events` —
 * MOSQUE_ADMIN|SUPER_ADMIN. */
export async function createEvent(mosqueId: string, body: MosqueEventCreateDto): Promise<MosqueEventResponseDto> {
  const result = await axiosInstance.post(`/mosque-admin/mosques/${encodeURIComponent(mosqueId)}/events`, body)
  return result as unknown as MosqueEventResponseDto
}

/** `PUT /api/v1/mosque-admin/mosques/{id}/events/{eventId}` —
 * MOSQUE_ADMIN|SUPER_ADMIN. */
export async function updateEvent(
  mosqueId: string,
  eventId: string,
  body: MosqueEventCreateDto,
): Promise<MosqueEventResponseDto> {
  const result = await axiosInstance.put(
    `/mosque-admin/mosques/${encodeURIComponent(mosqueId)}/events/${encodeURIComponent(eventId)}`,
    body,
  )
  return result as unknown as MosqueEventResponseDto
}

/** `DELETE /api/v1/mosque-admin/mosques/{id}/events/{eventId}` —
 * MOSQUE_ADMIN|SUPER_ADMIN. */
export async function deleteEvent(mosqueId: string, eventId: string): Promise<void> {
  await axiosInstance.delete(`/mosque-admin/mosques/${encodeURIComponent(mosqueId)}/events/${encodeURIComponent(eventId)}`)
}
