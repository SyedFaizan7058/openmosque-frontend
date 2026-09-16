import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { useAuthStore } from '@/features/auth/store/useAuthStore'
import { updateUserLocation } from '@/features/user/api/userApi'

export interface LocationCoords {
  lat: number
  lng: number
}

interface LocationState {
  coords: LocationCoords | null
  city: string | null
  country: string | null
  accuracy: number | null
  accuracyLevel: 'high' | 'approximate' | null
  source: 'gps' | 'manual' | 'db' | null
  isLocating: boolean
  error: string | null
  isModalOpen: boolean

  openModal: () => void
  closeModal: () => void
  setError: (error: string | null) => void
  
  /** Detects browser GPS location, reverse-geocodes city, and syncs to DB if logged in */
  detectGps: () => Promise<boolean>
  
  /** Sets location manually by city name and optional coordinates */
  setCityLocation: (city: string, country?: string, coords?: LocationCoords) => Promise<void>

  /** Syncs location from authenticated user profile from DB */
  syncFromUser: (user: { preferredCity?: string | null; preferredCountry?: string | null; latitude?: number | null; longitude?: number | null }) => void
}

/** Reverse geocodes lat/lng into city and country using OpenStreetMap Nominatim */
async function reverseGeocode(lat: number, lng: number): Promise<{ city: string; country: string } | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=14&addressdetails=1`,
      { headers: { 'Accept-Language': 'en' } }
    )
    if (!res.ok) return null
    const data = await res.json()
    const addr = data.address || {}
    const city =
      addr.city ||
      addr.town ||
      addr.village ||
      addr.municipality ||
      addr.city_district ||
      addr.suburb ||
      addr.neighbourhood ||
      addr.county ||
      addr.state_district ||
      addr.state ||
      ''
    const country = addr.country || ''
    return { city, country }
  } catch {
    return null
  }
}

/** Geocodes a city name into lat/lng coordinates */
export async function geocodeCity(query: string): Promise<{ city: string; country: string; coords: LocationCoords } | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1&addressdetails=1`,
      { headers: { 'Accept-Language': 'en' } }
    )
    if (!res.ok) return null
    const results = await res.json()
    if (!results || results.length === 0) return null
    const first = results[0]
    const addr = first.address || {}
    const city =
      addr.city ||
      addr.town ||
      addr.village ||
      addr.municipality ||
      addr.city_district ||
      addr.suburb ||
      first.name ||
      query
    const country = addr.country || ''
    return {
      city,
      country,
      coords: {
        lat: parseFloat(first.lat),
        lng: parseFloat(first.lon),
      },
    }
  } catch {
    return null
  }
}

export const useLocationStore = create<LocationState>()(
  persist(
    (set, get) => ({
      coords: null,
      city: null,
      country: null,
      accuracy: null,
      accuracyLevel: null,
      source: null,
      isLocating: false,
      error: null,
      isModalOpen: false,

      openModal: () => set({ isModalOpen: true }),
      closeModal: () => set({ isModalOpen: false, error: null }),
      setError: (error) => set({ error }),

      detectGps: async () => {
        if (typeof window === 'undefined' || !navigator.geolocation) {
          set({ error: 'Geolocation is not supported by your browser.' })
          return false
        }

        set({ isLocating: true, error: null })

        return new Promise<boolean>((resolve) => {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              const lat = Number(position.coords.latitude.toFixed(6))
              const lng = Number(position.coords.longitude.toFixed(6))
              const accuracy = Math.round(position.coords.accuracy ?? 0)
              const accuracyLevel = accuracy <= 2500 ? 'high' : 'approximate'
              const coords: LocationCoords = { lat, lng }

              // Reverse geocode to find human-readable city with high zoom
              const geo = await reverseGeocode(lat, lng)
              const city = geo?.city || 'My Location'
              const country = geo?.country || ''

              set({
                coords,
                city,
                country,
                accuracy,
                accuracyLevel,
                source: 'gps',
                isLocating: false,
                error: null,
                isModalOpen: false,
              })

              // If logged in, persist directly to PostgreSQL database
              const authUser = useAuthStore.getState().user
              if (authUser) {
                try {
                  const updated = await updateUserLocation({
                    latitude: lat,
                    longitude: lng,
                    preferredCity: city !== 'My Location' ? city : undefined,
                    preferredCountry: country || undefined,
                  })
                  useAuthStore.getState().setUser(updated)
                } catch (e) {
                  console.error('Failed to sync location to user profile in DB:', e)
                }
              }

              resolve(true)
            },
            (err) => {
              let msg = 'Could not determine your location.'
              if (err.code === err.PERMISSION_DENIED) {
                msg = 'Location permission was denied. You can select your city manually.'
              } else if (err.code === err.TIMEOUT) {
                msg = 'Location request timed out. Please try again or search your city.'
              }
              set({ isLocating: false, error: msg })
              resolve(false)
            },
            {
              enableHighAccuracy: true,
              timeout: 15000,
              maximumAge: 0,
            }
          )
        })
      },

      setCityLocation: async (cityName: string, countryName?: string, customCoords?: LocationCoords) => {
        set({ isLocating: true, error: null })

        let finalCoords = customCoords
        let finalCity = cityName
        let finalCountry = countryName || ''

        if (!finalCoords) {
          const res = await geocodeCity(cityName)
          if (res) {
            finalCoords = res.coords
            finalCity = res.city || cityName
            finalCountry = res.country || finalCountry
          } else {
            set({ isLocating: false, error: `Could not find coordinates for "${cityName}".` })
            return
          }
        }

        set({
          coords: finalCoords,
          city: finalCity,
          country: finalCountry,
          source: 'manual',
          isLocating: false,
          error: null,
          isModalOpen: false,
        })

        // If logged in, persist to PostgreSQL DB
        const authUser = useAuthStore.getState().user
        if (authUser && finalCoords) {
          try {
            const updated = await updateUserLocation({
              latitude: finalCoords.lat,
              longitude: finalCoords.lng,
              preferredCity: finalCity,
              preferredCountry: finalCountry || undefined,
            })
            useAuthStore.getState().setUser(updated)
          } catch (e) {
            console.error('Failed to sync manual location to DB:', e)
          }
        }
      },

      syncFromUser: (user) => {
        if (user.latitude != null && user.longitude != null) {
          set({
            coords: { lat: user.latitude, lng: user.longitude },
            city: user.preferredCity || get().city || 'Saved Location',
            country: user.preferredCountry || get().country || '',
            source: 'db',
          })
        } else if (user.preferredCity) {
          set({
            city: user.preferredCity,
            country: user.preferredCountry || '',
            source: 'db',
          })
        }
      },
    }),
    {
      name: 'openmosque-location-storage',
      partialize: (state) => ({
        coords: state.coords,
        city: state.city,
        country: state.country,
        source: state.source,
      }),
    }
  )
)
