import { useEffect, useState } from 'react'
import type { Nullable } from '@/lib/apiTypes'

interface PrayerCountdown {
  /** e.g. "2h 14m 03s" / "14m 03s" / "03s", or `null` while there's nothing
   * to count down (no `timeRemainingMinutes` yet). */
  formatted: string | null
  isZero: boolean
}

function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  const pad = (n: number) => String(n).padStart(2, '0')

  if (hours > 0) return `${hours}h ${pad(minutes)}m ${pad(seconds)}s`
  if (minutes > 0) return `${minutes}m ${pad(seconds)}s`
  return `${pad(seconds)}s`
}

/**
 * Live countdown to the next prayer, driven by a server-supplied
 * `timeRemainingMinutes` (from `PrayerTimesDayResponseDto`) rather than by
 * comparing wall-clock prayer-time strings against `Date.now()` — the
 * server already resolved "now" relative to the mosque's own time zone and
 * calculation method, so re-deriving that client-side across a midnight
 * rollover would be a real source of bugs this sidesteps entirely.
 *
 * On mount, and whenever `timeRemainingMinutes` changes (e.g. a refetch
 * after the previous countdown hit zero, or a `DateNav` day change), a
 * `targetTimestamp` is computed once and a 1s interval ticks the formatted
 * remaining time down from it. The interval stops itself once it hits zero
 * — it does not keep looping — so the calling component decides whether/when
 * to refetch.
 */
export function usePrayerCountdown(timeRemainingMinutes: Nullable<number>): PrayerCountdown {
  const [remainingMs, setRemainingMs] = useState<number | null>(null)

  useEffect(() => {
    // Loose `== null` per the shared Nullable<T> convention — an absent
    // `timeRemainingMinutes` arrives as `undefined`, not `null`.
    if (timeRemainingMinutes == null) {
      setRemainingMs(null)
      return
    }

    const targetTimestamp = Date.now() + timeRemainingMinutes * 60_000
    const tick = () => setRemainingMs(Math.max(0, targetTimestamp - Date.now()))

    tick()
    const intervalId = window.setInterval(() => {
      const next = Math.max(0, targetTimestamp - Date.now())
      setRemainingMs(next)
      if (next <= 0) window.clearInterval(intervalId)
    }, 1000)

    return () => window.clearInterval(intervalId)
  }, [timeRemainingMinutes])

  if (remainingMs == null) return { formatted: null, isZero: false }
  return { formatted: formatDuration(remainingMs), isZero: remainingMs <= 0 }
}
