import { initializeApp, getApps } from 'firebase/app'
import type { FirebaseApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import type { Auth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

/**
 * True only when every required Firebase Web SDK key is present. A fresh
 * clone of this repo has empty `.env.local` values until someone plugs in
 * a real Firebase project — the app must still render (just without
 * working sign-in) rather than crash on a blank screen.
 */
export const isFirebaseConfigured: boolean = Boolean(
  firebaseConfig.apiKey && firebaseConfig.authDomain && firebaseConfig.projectId,
)

let app: FirebaseApp | null = null
let auth: Auth | null = null

if (isFirebaseConfigured) {
  app = getApps().length > 0 ? getApps()[0]! : initializeApp(firebaseConfig)
  auth = getAuth(app)
} else {
  // Deliberately console.error (not throw) — a missing Firebase project is
  // an expected state during initial Phase 1 setup, not a fatal bug.
  console.error(
    '[OpenMosque] Firebase is not configured: one or more VITE_FIREBASE_* ' +
      'env vars are empty. Sign-in will be unavailable until .env.local is ' +
      'filled in with a real Firebase project config. See .env.example.',
  )
}

export { app as firebaseApp, auth }
