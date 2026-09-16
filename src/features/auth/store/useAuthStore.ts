import { create } from 'zustand'
import type { User as FirebaseUser } from 'firebase/auth'
import type { UserResponseDto } from '@/features/auth/types'

interface AuthState {
  /** The raw Firebase Auth user, or null when signed out. */
  firebaseUser: FirebaseUser | null
  /** The backend's `UserResponseDto` — authoritative role/profile data. */
  user: UserResponseDto | null
  /** True until the first `onAuthStateChanged` callback has resolved
   * (including the session/sync round-trip), so guards can show a spinner
   * instead of flashing a redirect. */
  isLoading: boolean
  isAuthenticated: boolean
  /** True when the authenticated user has 2FA enabled on the backend but hasn't yet completed the challenge in this session. */
  isTwoFactorRequired: boolean
  isTwoFactorVerified: boolean
  setFirebaseUser: (firebaseUser: FirebaseUser | null) => void
  setUser: (user: UserResponseDto | null) => void
  setLoading: (isLoading: boolean) => void
  setTwoFactorRequired: (required: boolean) => void
  setTwoFactorVerified: (verified: boolean) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  firebaseUser: null,
  user: null,
  isLoading: true,
  isAuthenticated: false,
  isTwoFactorRequired: false,
  isTwoFactorVerified: false,
  setFirebaseUser: (firebaseUser) => set({ firebaseUser }),
  setUser: (user) => set({ user, isAuthenticated: user !== null }),
  setLoading: (isLoading) => set({ isLoading }),
  setTwoFactorRequired: (isTwoFactorRequired) => set({ isTwoFactorRequired }),
  setTwoFactorVerified: (isTwoFactorVerified) =>
    set({ isTwoFactorVerified, isTwoFactorRequired: !isTwoFactorVerified }),
  logout: () =>
    set({
      firebaseUser: null,
      user: null,
      isAuthenticated: false,
      isLoading: false,
      isTwoFactorRequired: false,
      isTwoFactorVerified: false,
    }),
}))

/** Selector helpers — prefer these in components over destructuring the
 * whole store, so a component that only needs `role` doesn't re-render on
 * every unrelated auth-state field change. */
export const selectUser = (s: AuthState) => s.user
export const selectRole = (s: AuthState) => s.user?.role ?? null
export const selectIsAuthenticated = (s: AuthState) => s.isAuthenticated
export const selectIsLoading = (s: AuthState) => s.isLoading
export const selectFirebaseUser = (s: AuthState) => s.firebaseUser
export const selectIsTwoFactorRequired = (s: AuthState) => s.isTwoFactorRequired
export const selectIsTwoFactorVerified = (s: AuthState) => s.isTwoFactorVerified
