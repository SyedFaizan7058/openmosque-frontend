/**
 * App-wide constants. Values that vary per environment are read from
 * `import.meta.env` (see `.env.example` for the full key list).
 */

export const API_BASE_URL: string =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'

export const API_V1 = `${API_BASE_URL}/api/v1`

/**
 * Mirrors the backend `UserRole` enum exactly (see backend_analysis.md §3).
 * `erasableSyntaxOnly` (tsconfig) forbids real TS enums, so we use a
 * `const` object + derived union type instead — same ergonomics, zero
 * runtime enum object weirdness.
 */
export const ROLES = {
  USER: 'USER',
  MOSQUE_ADMIN: 'MOSQUE_ADMIN',
  MODERATOR: 'MODERATOR',
  SUPER_ADMIN: 'SUPER_ADMIN',
} as const

export type UserRole = (typeof ROLES)[keyof typeof ROLES]

export const ALL_ROLES: UserRole[] = Object.values(ROLES)

/** Map tile / geo defaults (used by Phase 2 map views, wired now via env).
 *
 * Was `basemaps.cartocdn.com/rastertiles/voyager` (CARTO's free raster
 * tiles) — CARTO now requires an API key for that endpoint and, without
 * one, serves back tiles stamped with "API KEY REQUIRED" watermark text
 * instead of an error (a live bug reported by a user seeing that text
 * baked into the map on the mosque detail page). Switched to the standard
 * OpenStreetMap tile server, which needs no key. Its usage policy
 * (https://operations.osmfoundation.org/policies/tiles/) isn't meant for
 * heavy production traffic, so if this app grows real usage, get a proper
 * key for CARTO/Mapbox/MapTiler and set `VITE_MAP_TILE_URL` rather than
 * relying on this default indefinitely. */
export const MAP_TILE_URL: string =
  import.meta.env.VITE_MAP_TILE_URL ?? 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'

export const MAP_DEFAULT_LAT = Number(import.meta.env.VITE_MAP_DEFAULT_LAT ?? 21.3891)
export const MAP_DEFAULT_LNG = Number(import.meta.env.VITE_MAP_DEFAULT_LNG ?? 39.8579)
export const MAP_DEFAULT_ZOOM = Number(import.meta.env.VITE_MAP_DEFAULT_ZOOM ?? 12)

/** HttpOnly cookie names the backend sets (informational only — the SPA
 * never reads or writes these directly; documented here so nobody is
 * tempted to shadow them in localStorage). See backend_analysis.md §2.2. */
export const AUTH_COOKIE_NAMES = {
  ACCESS: 'om_access_token',
  REFRESH: 'om_refresh_token',
} as const
