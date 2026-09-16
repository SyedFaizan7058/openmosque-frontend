import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { toast } from 'sonner'
import { auth as firebaseAuth, isFirebaseConfigured } from '@/features/auth/firebase/firebaseConfig'
import { get2FAStatus } from '@/features/auth/2fa/api/twoFactorApi'
import { isDevice2FAVerified } from '@/features/auth/2fa/lib/twoFactorStorage'
import { postAuthSession, postUsersSync } from '@/features/auth/api/authApi'
import { useAuthStore } from '@/features/auth/store/useAuthStore'
import { useLocationStore } from '@/stores/useLocationStore'

interface AuthProviderProps {
  children: ReactNode
}

/**
 * Orchestrates the full auth flow described in backend_analysis.md §2:
 *
 * 1. Listen for Firebase auth state changes.
 * 2. On sign-in: get a fresh ID token, POST it to `/auth/session` (sets
 *    HttpOnly cookies), then POST `/users/sync` (auto-provisions/fetches
 *    the backend User row, which carries the authoritative `role`).
 * 3. Check 2FA status: if enabled, require 2FA challenge.
 * 4. On sign-out: clear the Zustand auth store.
 *
 * This is the ONLY place auth side effects happen — pages and components
 * read from `useAuthStore`, they never call Firebase or the auth API
 * directly (aside from `LoginForm`/`RegisterForm` triggering a sign-in).
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const setFirebaseUser = useAuthStore((s) => s.setFirebaseUser)
  const setUser = useAuthStore((s) => s.setUser)
  const setLoading = useAuthStore((s) => s.setLoading)
  const setTwoFactorRequired = useAuthStore((s) => s.setTwoFactorRequired)

  useEffect(() => {
    if (!isFirebaseConfigured || !firebaseAuth) {
      // No Firebase project configured yet — render the app in a signed-out
      // state rather than hanging on a spinner forever.
      setLoading(false)
      return
    }

    const unsubscribe = onAuthStateChanged(firebaseAuth, async (firebaseUser) => {
      setFirebaseUser(firebaseUser)

      if (!firebaseUser) {
        setUser(null)
        setLoading(false)
        return
      }

      try {
        const idToken = await firebaseUser.getIdToken()

        await postAuthSession({ token: idToken })

        const syncedUser = await postUsersSync({
          firebaseUid: firebaseUser.uid,
          email: firebaseUser.email ?? `${firebaseUser.uid}@openmosque.org`,
          displayName: firebaseUser.displayName,
          phoneNumber: firebaseUser.phoneNumber,
          photoUrl: firebaseUser.photoURL,
        })

        setUser(syncedUser)
        if (syncedUser) {
          useLocationStore.getState().syncFromUser(syncedUser)
        }

        try {
          const twoFactorStatus = await get2FAStatus()
          if (twoFactorStatus?.enabled) {
            const alreadyVerified = isDevice2FAVerified(firebaseUser.uid)
            if (alreadyVerified) {
              setTwoFactorRequired(false)
            } else {
              setTwoFactorRequired(true)
            }
          } else {
            setTwoFactorRequired(false)
          }
        } catch (twoFaErr) {
          console.warn('[OpenMosque] 2FA check error (non-fatal):', twoFaErr)
        }
      } catch (err) {
        console.error('[OpenMosque] Auth sync failed:', err)
        toast.error('We could not complete sign-in. Please try again.')
        setUser(null)
      } finally {
        setLoading(false)
      }
    })

    return () => unsubscribe()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return children
}
