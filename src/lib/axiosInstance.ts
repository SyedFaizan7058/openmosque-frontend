import axios from 'axios'
import type { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { toast } from 'sonner'
import { API_V1 } from '@/lib/constants'
import { auth as firebaseAuth } from '@/features/auth/firebase/firebaseConfig'
import { useAuthStore } from '@/features/auth/store/useAuthStore'
import type { ApiResponse } from '@/lib/apiTypes'
import type { ApiErrorDetail } from '@/features/auth/types'

export const axiosInstance = axios.create({
  baseURL: API_V1,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

// --- Request interceptor -----------------------------------------------
// Belt-and-suspenders per backend_analysis.md §2.2: the backend accepts
// either a Bearer header or the om_access_token cookie. We send both — the
// cookie rides along automatically via withCredentials, and we attach a
// freshly-fetched Firebase ID token here on every request (the SDK caches
// and silently refreshes it internally, so this is cheap).
axiosInstance.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const currentFirebaseUser = firebaseAuth?.currentUser
  if (currentFirebaseUser) {
    try {
      const idToken = await currentFirebaseUser.getIdToken()
      config.headers.set('Authorization', `Bearer ${idToken}`)
    } catch (err) {
      console.error('[OpenMosque] Failed to attach Firebase ID token to request:', err)
    }
  }
  return config
})

// --- Response interceptor -----------------------------------------------
axiosInstance.interceptors.response.use(
  (response: AxiosResponse<ApiResponse<unknown>>) => {
    // Unwrap the envelope: callers receive `T`, not `ApiResponse<T>`. This
    // deliberately returns something other than an `AxiosResponse` — every
    // call site in `authApi.ts` (and future API modules) casts the
    // resolved value back to its real DTO type to reconcile axios's static
    // generics with this runtime-unwrapped shape.
    const envelope = response.data
    return envelope?.data as unknown as AxiosResponse
  },
  (error: AxiosError<ApiResponse<unknown>>) => {
    const status = error.response?.status
    const envelopeError = error.response?.data?.error

    const normalizedError: ApiErrorDetail = envelopeError ?? {
      code: 'UNKNOWN_ERROR',
      message: error.message || 'Something went wrong. Please try again.',
    }

    if (status === 401) {
      useAuthStore.getState().logout()
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    } else if (status === 403) {
      toast.error("You don't have permission to do that.")
    } else if (status === 429) {
      const retryAfter = error.response?.headers?.['retry-after']
      const remaining = error.response?.headers?.['x-ratelimit-remaining']
      toast.error(
        retryAfter
          ? `You're doing that too much. Try again in ${retryAfter}s.`
          : `Rate limit reached${remaining ? ` (0 remaining)` : ''}. Please slow down.`,
      )
    }

    return Promise.reject(normalizedError)
  },
)
