import type { Nullable } from '@/lib/apiTypes'

/** `MosqueKhutbahCreateDto` (request, backend-api-contract.md §4, event
 * module) — used for both creating and updating a khutbah entry.
 * `khutbahDate`/`topic`/`khatibName`/`khutbahTime` are required;
 * `batchNumber` defaults to 1 server-side if omitted, `language` defaults
 * to `"English"`. */
export interface MosqueKhutbahCreateDto {
  /** `YYYY-MM-DD` */
  khutbahDate: string
  topic: string
  khatibName: string
  batchNumber?: number
  /** `HH:mm:ss` */
  khutbahTime: string
  /** `HH:mm:ss` */
  adhaanTime?: string
  /** `HH:mm:ss` */
  iqamahTime?: string
  language?: string
  streamUrl?: string
  recordingUrl?: string
  notes?: string
}

/** `MosqueKhutbahResponseDto` (backend-api-contract.md §4, event module). */
export interface MosqueKhutbahResponseDto {
  id: string
  mosqueId: string
  mosqueName: Nullable<string>
  /** `YYYY-MM-DD` */
  khutbahDate: string
  topic: string
  khatibName: string
  batchNumber: number
  /** `HH:mm:ss` */
  khutbahTime: string
  adhaanTime: Nullable<string>
  iqamahTime: Nullable<string>
  language: string
  streamUrl: Nullable<string>
  recordingUrl: Nullable<string>
  notes: Nullable<string>
}
