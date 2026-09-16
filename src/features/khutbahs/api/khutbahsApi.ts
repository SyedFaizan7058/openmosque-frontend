import { axiosInstance } from '@/lib/axiosInstance'
import type { MosqueKhutbahCreateDto, MosqueKhutbahResponseDto } from '@/features/khutbahs/types'

/** Khutbahs API (backend-api-contract.md §5, "Events & Khutbahs") — public
 * read plus Mosque Admin create/update/delete, one file per this
 * codebase's convention (see `eventsApi.ts`). No feature module existed
 * for khutbahs before this phase — the public detail page has no
 * "Khutbahs" tab yet (a reasonable follow-up, out of scope for the Mosque
 * Admin dashboard this phase is building). */

/** `GET /api/v1/mosques/{idOrSlug}/khutbahs` — public. Plain array, not
 * paginated (unlike events/reviews/questions). */
export async function getMosqueKhutbahs(idOrSlug: string): Promise<MosqueKhutbahResponseDto[]> {
  const result = await axiosInstance.get(`/mosques/${encodeURIComponent(idOrSlug)}/khutbahs`)
  return result as unknown as MosqueKhutbahResponseDto[]
}

/** `POST /api/v1/mosque-admin/mosques/{id}/khutbahs` —
 * MOSQUE_ADMIN|SUPER_ADMIN. */
export async function createKhutbah(mosqueId: string, body: MosqueKhutbahCreateDto): Promise<MosqueKhutbahResponseDto> {
  const result = await axiosInstance.post(`/mosque-admin/mosques/${encodeURIComponent(mosqueId)}/khutbahs`, body)
  return result as unknown as MosqueKhutbahResponseDto
}

/** `PUT /api/v1/mosque-admin/mosques/{id}/khutbahs/{khutbahId}` —
 * MOSQUE_ADMIN|SUPER_ADMIN. */
export async function updateKhutbah(
  mosqueId: string,
  khutbahId: string,
  body: MosqueKhutbahCreateDto,
): Promise<MosqueKhutbahResponseDto> {
  const result = await axiosInstance.put(
    `/mosque-admin/mosques/${encodeURIComponent(mosqueId)}/khutbahs/${encodeURIComponent(khutbahId)}`,
    body,
  )
  return result as unknown as MosqueKhutbahResponseDto
}

/** `DELETE /api/v1/mosque-admin/mosques/{id}/khutbahs/{khutbahId}` —
 * MOSQUE_ADMIN|SUPER_ADMIN. */
export async function deleteKhutbah(mosqueId: string, khutbahId: string): Promise<void> {
  await axiosInstance.delete(
    `/mosque-admin/mosques/${encodeURIComponent(mosqueId)}/khutbahs/${encodeURIComponent(khutbahId)}`,
  )
}
