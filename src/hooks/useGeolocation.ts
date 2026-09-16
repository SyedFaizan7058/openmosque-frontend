import { useCallback, useState } from 'react'

export interface GeoCoords {
  lat: number
  lng: number
}

interface UseGeolocationResult {
  coords: GeoCoords | null
  error: string | null
  loading: boolean
  /** Kicks off (or retries) a `getCurrentPosition` request. Passive by
   * design — nothing here calls this automatically, so a page that wants
   * "detect my location on mount" is an explicit, visible `useEffect`
   * there, not a hidden side effect of importing this hook. */
  requestLocation: () => void
}

function messageForGeolocationError(err: GeolocationPositionError): string {
  switch (err.code) {
    case err.PERMISSION_DENIED:
      return 'Location access was denied. You can still search by city or name.'
    case err.POSITION_UNAVAILABLE:
      return 'Your location could not be determined right now.'
    case err.TIMEOUT:
      return 'Locating you took too long. Please try again.'
    default:
      return 'Something went wrong while detecting your location.'
  }
}

/** Thin, reusable wrapper around `navigator.geolocation.getCurrentPosition`.
 * Used by the Home and Nearby Mosques pages, each of which decides for
 * itself when to call `requestLocation` and how to present the loading /
 * denied states. */
export function useGeolocation(): UseGeolocationResult {
  const [coords, setCoords] = useState<GeoCoords | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const requestLocation = useCallback(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setError('Geolocation is not supported by this browser.')
      return
    }
    setLoading(true)
    setError(null)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({ lat: position.coords.latitude, lng: position.coords.longitude })
        setLoading(false)
      },
      (err) => {
        setError(messageForGeolocationError(err))
        setLoading(false)
      },
      { enableHighAccuracy: false, timeout: 10_000, maximumAge: 5 * 60 * 1000 },
    )
  }, [])

  return { coords, error, loading, requestLocation }
}
