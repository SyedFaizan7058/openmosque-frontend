/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_FIREBASE_API_KEY: string
  readonly VITE_FIREBASE_AUTH_DOMAIN: string
  readonly VITE_FIREBASE_PROJECT_ID: string
  readonly VITE_FIREBASE_STORAGE_BUCKET: string
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string
  readonly VITE_FIREBASE_APP_ID: string
  readonly VITE_FIREBASE_VAPID_KEY: string
  readonly VITE_MAP_TILE_URL: string
  readonly VITE_MAP_DEFAULT_LAT: string
  readonly VITE_MAP_DEFAULT_LNG: string
  readonly VITE_MAP_DEFAULT_ZOOM: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
