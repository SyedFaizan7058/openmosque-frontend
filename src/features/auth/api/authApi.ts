import { signOut } from 'firebase/auth'
import { axiosInstance } from '@/lib/axiosInstance'
import { auth as firebaseAuth } from '@/features/auth/firebase/firebaseConfig'
import { useAuthStore } from '@/features/auth/store/useAuthStore'
import type {
  AuthSessionRequestDto,
  UserResponseDto,
  UserSyncRequestDto,
} from '@/features/auth/types'

/**
 * Thin, imperative wrappers around the auth endpoints (backend_analysis.md
 * §5). These are plain async functions, not TanStack Query hooks — the
 * auth bootstrap flow in `AuthProvider` is a one-shot side effect driven by
 * Firebase's `onAuthStateChanged`, not a cacheable "query".
 *
 * The axios response interceptor already unwraps `ApiResponse<T>` down to
 * `T`, so at the type level these functions cast the resolved value —
 * that's the one place the mismatch between axios's static `AxiosResponse`
 * generics and our runtime-unwrapped envelope needs to be reconciled.
 */

/** `POST /api/v1/auth/session` — sets the om_access_token/om_refresh_token
 * HttpOnly cookies server-side. Returns a plain string message. */
export async function postAuthSession(body: AuthSessionRequestDto): Promise<string> {
  const result = await axiosInstance.post('/auth/session', body)
  return result as unknown as string
}

/** `POST /api/v1/auth/logout` — clears both auth cookies. */
export async function postAuthLogout(): Promise<string> {
  const result = await axiosInstance.post('/auth/logout')
  return result as unknown as string
}

/** `POST /api/v1/users/sync` — auto-provisions/updates the local User row
 * and returns the authoritative `UserResponseDto` (has the real `role`). */
export async function postUsersSync(body: UserSyncRequestDto): Promise<UserResponseDto> {
  const result = await axiosInstance.post('/users/sync', body)
  return result as unknown as UserResponseDto
}

/** `GET /api/v1/users/me` — fetch the current user afresh (used to
 * re-hydrate role/profile without a full sign-in round trip). */
export async function getCurrentUser(): Promise<UserResponseDto> {
  const result = await axiosInstance.get('/users/me')
  return result as unknown as UserResponseDto
}

/**
 * Full logout sequence per backend_analysis.md §2.5: clear the backend
 * cookies, sign out of Firebase, then clear local state. Order is kept
 * best-effort (each step runs even if an earlier one throws) since the
 * user's intent — "log me out" — should always succeed locally even if a
 * network call fails. Centralized here (rather than in `TopBar`) so every
 * call site of "log out" shares one implementation.
 */
export async function logoutUser(): Promise<void> {
  try {
    await postAuthLogout()
  } catch (err) {
    console.error('[OpenMosque] Logout API call failed (continuing anyway):', err)
  }
  try {
    if (firebaseAuth) await signOut(firebaseAuth)
  } catch (err) {
    console.error('[OpenMosque] Firebase sign-out failed (continuing anyway):', err)
  }
  useAuthStore.getState().logout()
}
