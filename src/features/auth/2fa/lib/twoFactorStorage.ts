const STORAGE_PREFIX = 'om_2fa_device_verified_'
const DEFAULT_EXPIRY_DAYS = 30

/**
 * Checks if 2FA has already been verified for this account on this device.
 */
export function isDevice2FAVerified(uid: string | null | undefined): boolean {
  if (!uid || typeof window === 'undefined') return false
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${uid}`)
    if (!raw) return false

    const timestamp = Number(raw)
    if (isNaN(timestamp)) {
      localStorage.removeItem(`${STORAGE_PREFIX}${uid}`)
      return false
    }

    const expiryMs = DEFAULT_EXPIRY_DAYS * 24 * 60 * 60 * 1000
    if (Date.now() - timestamp > expiryMs) {
      localStorage.removeItem(`${STORAGE_PREFIX}${uid}`)
      return false
    }

    return true
  } catch {
    return false
  }
}

/**
 * Marks 2FA as verified for this device.
 */
export function setDevice2FAVerified(uid: string | null | undefined): void {
  if (!uid || typeof window === 'undefined') return
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${uid}`, Date.now().toString())
  } catch (err) {
    console.warn('[OpenMosque] Failed to store 2FA verification flag:', err)
  }
}

/**
 * Clears 2FA device verification.
 */
export function clearDevice2FAVerified(uid: string | null | undefined): void {
  if (!uid || typeof window === 'undefined') return
  try {
    localStorage.removeItem(`${STORAGE_PREFIX}${uid}`)
  } catch (err) {
    console.warn('[OpenMosque] Failed to clear 2FA verification flag:', err)
  }
}
