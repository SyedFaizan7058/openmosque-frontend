import { lazy, Suspense } from 'react'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { cn } from '@/lib/utils'

export interface MosqueMapMarker {
  id: string
  lat: number
  lng: number
  name: string
  slug: string | null
  verified: boolean
}

export interface MosqueMapProps {
  markers: MosqueMapMarker[]
  onMarkerClick?: (marker: MosqueMapMarker) => void
  center?: { lat: number; lng: number }
  zoom?: number
  /** Renders a single, non-clustered pin (the mosque detail page's sidebar
   * map) instead of the clustered multi-marker view. */
  singleMarker?: boolean
  className?: string
}

// Leaflet + leaflet.markercluster add real weight to the bundle (see
// backend_analysis-adjacent Phase 1 note: the initial build already
// crossed the 500kB chunk-size warning). Loading the actual map
// implementation lazily keeps it out of every route that doesn't render a
// map at all, and out of the initial bundle for the ones that do.
const MosqueMapInner = lazy(() =>
  import('@/features/mosques/components/MosqueMapInner').then((mod) => ({ default: mod.MosqueMapInner })),
)

/** Public entry point for the mosque map — a thin `Suspense` boundary
 * around the actual (heavy) Leaflet implementation. Every discovery page
 * always renders an equivalent accessible list alongside this map; the map
 * itself is a supplementary visualization, not the only way to reach a
 * mosque's details. */
export function MosqueMap(props: MosqueMapProps) {
  return (
    <Suspense
      fallback={
        <div
          className={cn(
            'flex min-h-[250px] items-center justify-center rounded-2xl border border-border/80 bg-muted/20',
            props.className,
          )}
        >
          <LoadingSpinner label="Loading map…" />
        </div>
      }
    >
      <MosqueMapInner {...props} />
    </Suspense>
  )
}
