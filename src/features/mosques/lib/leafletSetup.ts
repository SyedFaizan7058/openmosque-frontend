import L from 'leaflet'

/**
 * `leaflet.markercluster`'s UMD build (`leaflet.markercluster-src.js`)
 * references a bare, unimported `L` global inside its factory function
 * rather than `require`-ing `leaflet` itself — a bundler (Vite/Rollup)
 * resolves that free variable against `globalThis`, so without this the
 * plugin throws `L is not defined` the moment it's imported. Importing
 * *this* module (which runs before `leaflet.markercluster` in
 * `MosqueMapInner.tsx`'s import order — ES module side effects run in
 * source order) sets `window.L` first. Scoped to this one feature folder
 * so the rest of the app never touches a global `L`.
 */
declare global {
  interface Window {
    L?: typeof L
  }
}

if (typeof window !== 'undefined' && !window.L) {
  window.L = L
}

export default L
