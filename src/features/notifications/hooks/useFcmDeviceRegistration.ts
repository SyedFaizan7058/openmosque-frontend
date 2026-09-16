import { useEffect, useRef } from 'react'
import { isSupported, getMessaging, getToken } from 'firebase/messaging'
import { firebaseApp } from '@/features/auth/firebase/firebaseConfig'
import { registerDeviceToken } from '@/features/notifications/api/notificationsApi'
import { useAuthStore } from '@/features/auth/store/useAuthStore'

/**
 * Re-registers browser FCM device token on login / foreground.
 * Degrades gracefully if browser doesn't support FCM or if notifications
 * permission is not granted.
 */
export function useFcmDeviceRegistration() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const hasRegisteredRef = useRef(false)

  useEffect(() => {
    if (!isAuthenticated || !firebaseApp || hasRegisteredRef.current) return

    const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY
    if (!vapidKey) return

    let isMounted = true

    async function register() {
      try {
        const supported = await isSupported()
        if (!supported || !isMounted) return

        if (typeof Notification === 'undefined' || Notification.permission !== 'granted') {
          // Do not harass user if not granted; user can enable via browser prompt when prompted
          return
        }

        const messaging = getMessaging(firebaseApp!)
        const currentToken = await getToken(messaging, { vapidKey })

        if (currentToken && isMounted) {
          hasRegisteredRef.current = true
          await registerDeviceToken({
            fcmToken: currentToken,
            deviceType: 'WEB',
            deviceName: `${navigator.userAgent.slice(0, 100)}`,
          })
        }
      } catch (err) {
        // FCM registration failure is non-fatal — in-app notifications still work
        console.warn('[OpenMosque] FCM registration skipped or failed:', err)
      }
    }

    void register()

    return () => {
      isMounted = false
    }
  }, [isAuthenticated])
}
