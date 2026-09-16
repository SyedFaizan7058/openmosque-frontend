import { axiosInstance } from '@/lib/axiosInstance'
import type { MediaFolderCategory } from '@/features/media/types'

/** Media upload API (backend-api-contract.md §4/§5, media module).
 *
 * `POST /api/v1/media/upload-direct` (multipart/form-data, fields `file` +
 * `category`) is used here rather than the documented pre-signed `/media/
 * upload-url` flow: that flow is two round trips (ask for a URL, then
 * `PUT` the raw bytes to it) meant for large/high-volume uploads routed
 * straight to storage. For a one-shot "choose a file" control like a claim
 * proof document, `upload-direct` is a single call that returns the final
 * public URL directly — simpler, and the file sizes involved here are
 * small. A bulk uploader (e.g. many mosque photos at once) should still
 * use the pre-signed flow instead of routing large payloads through this
 * app server.
 */

/** `POST /api/v1/media/upload-direct` — user. Returns the public URL. */
export async function uploadMediaDirect(file: File, category: MediaFolderCategory): Promise<string> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('category', category)

  const result = await axiosInstance.post('/media/upload-direct', formData, {
    // `axiosInstance` sets a default JSON content type; explicitly
    // clearing it here (rather than setting 'multipart/form-data'
    // ourselves) lets the browser generate the header itself, boundary
    // param included — a manually-set multipart Content-Type without a
    // boundary is not parseable by the server.
    headers: { 'Content-Type': undefined },
  })
  return result as unknown as string
}
