/** Mirrors the backend's `folderCategory`/`category` pattern constraint —
 * `UploadUrlRequestDto.folderCategory` and `/media/upload-direct`'s
 * `category` form field both validate against this same set
 * (backend-api-contract.md §4/§5, media module). */
export type MediaFolderCategory = 'MOSQUE_IMAGE' | 'PROOF_DOCUMENT' | 'EVENT_BANNER' | 'USER_AVATAR'

/** Server-side `FileSecurityValidator` allow-list (backend-api-contract.md
 * §6) — checked again client-side so a user gets an immediate, specific
 * error instead of waiting on a round trip that's guaranteed to fail.
 * Deliberately excludes `heic`: the pre-signed-URL request DTO's content
 * type regex allows `image/heic`, but the binary validator's extension
 * allow-list does not, so a HEIC file can pass request validation and
 * still fail upload — not worth exposing as an option here. */
export const ALLOWED_UPLOAD_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'pdf'] as const
export const ALLOWED_UPLOAD_ACCEPT = '.jpg,.jpeg,.png,.webp,.pdf'

/** Client-side sanity cap, independent of whatever limit the server
 * enforces — just to fail fast on an obviously-too-large file instead of
 * spending a full upload round trip to find out. */
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024

export function hasAllowedExtension(fileName: string): boolean {
  const ext = fileName.split('.').pop()?.toLowerCase()
  return !!ext && (ALLOWED_UPLOAD_EXTENSIONS as readonly string[]).includes(ext)
}
