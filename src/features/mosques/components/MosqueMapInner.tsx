import { useEffect, useMemo } from 'react'
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet'
import L from '@/features/mosques/lib/leafletSetup'
import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'
import 'leaflet.markercluster'
import { Link } from 'react-router-dom'
import { MAP_DEFAULT_LAT, MAP_DEFAULT_LNG, MAP_DEFAULT_ZOOM, MAP_TILE_URL } from '@/lib/constants'
import { cn } from '@/lib/utils'
import type { MosqueMapMarker, MosqueMapProps } from '@/features/mosques/components/MosqueMap'

/**
 * The actual Leaflet implementation, loaded lazily by `MosqueMap.tsx`.
 *
 * Deliberately does NOT use Leaflet's default marker icon images — under
 * Vite those resolve to broken asset paths without extra config. Instead
 * every marker gets a hand-built `L.divIcon` (a small inline SVG matching
 * Lucide's `MapPin` glyph), colored by verification status.
 */

function createMosqueDivIcon(verified: boolean): L.DivIcon {
  const fill = verified ? '#007378' : '#64748b'
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="${fill}" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3" fill="#ffffff"/></svg>`
  return L.divIcon({
    html: svg,
    className: 'om-mosque-marker',
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -28],
  })
}

const verifiedIcon = createMosqueDivIcon(true)
const unverifiedIcon = createMosqueDivIcon(false)

function iconFor(marker: MosqueMapMarker): L.DivIcon {
  return marker.verified ? verifiedIcon : unverifiedIcon
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (ch) => {
    switch (ch) {
      case '&':
        return '&amp;'
      case '<':
        return '&lt;'
      case '>':
        return '&gt;'
      case '"':
        return '&quot;'
      default:
        return '&#39;'
    }
  })
}

interface ClusterLayerProps {
  markers: MosqueMapMarker[]
  onMarkerClick?: (marker: MosqueMapMarker) => void
}

/** Imperatively manages a `L.markerClusterGroup()` layer via `useMap()`.
 * `leaflet.markercluster` is a plain JS plugin with no React bindings, so
 * this is the small bridge component the plugin needs — everything else
 * in this file stays declarative react-leaflet JSX. */
function ClusterLayer({ markers, onMarkerClick }: ClusterLayerProps) {
  const map = useMap()

  useEffect(() => {
    const clusterGroup = L.markerClusterGroup()

    markers.forEach((marker) => {
      const leafletMarker = L.marker([marker.lat, marker.lng], { icon: iconFor(marker) })
      const detailHref = `/mosques/${encodeURIComponent(marker.slug ?? marker.id)}`
      leafletMarker.bindPopup(
        `<div class="om-map-popup"><strong>${escapeHtml(marker.name)}</strong><br/><a href="${detailHref}">View details</a></div>`,
      )
      if (onMarkerClick) {
        leafletMarker.on('click', () => onMarkerClick(marker))
      }
      clusterGroup.addLayer(leafletMarker)
    })

    map.addLayer(clusterGroup)
    if (markers.length > 0) {
      map.fitBounds(clusterGroup.getBounds().pad(0.2), { maxZoom: 15 })
    }

    return () => {
      map.removeLayer(clusterGroup)
    }
  }, [map, markers, onMarkerClick])

  return null
}

export function MosqueMapInner({ markers, onMarkerClick, center, zoom, singleMarker, className }: MosqueMapProps) {
  const initialCenter = useMemo<[number, number]>(() => {
    if (center) return [center.lat, center.lng]
    const first = markers[0]
    if (first) return [first.lat, first.lng]
    return [MAP_DEFAULT_LAT, MAP_DEFAULT_LNG]
  }, [center, markers])

  const initialZoom = zoom ?? MAP_DEFAULT_ZOOM
  const single = singleMarker ? markers[0] : undefined

  return (
    <div className={cn('relative z-0 isolate overflow-hidden rounded-2xl border border-border/80 shadow-xs bg-muted/20', className)}>
      {/* The map itself is a supplementary visualization — every page that
          renders one also renders an equivalent accessible list, which is
          the primary way a keyboard/screen-reader user reaches a mosque's
          details. */}
      <p className="sr-only">
        Interactive map of mosque locations. An accessible list with the same results is provided elsewhere on this
        page.
      </p>
      <MapContainer
        center={initialCenter}
        zoom={initialZoom}
        scrollWheelZoom
        style={{ height: '100%', minHeight: singleMarker ? 250 : 320, width: '100%', borderRadius: 'inherit' }}
      >
        {/* Attribution text matches the default tile source (plain OSM, no
            CARTO) — see the doc comment on `MAP_TILE_URL` for why. Update
            this if `VITE_MAP_TILE_URL` is ever pointed at a different
            provider that requires different credit. */}
        <TileLayer url={MAP_TILE_URL} attribution="&copy; OpenStreetMap contributors" />

        {singleMarker ? (
          single && (
            <Marker position={[single.lat, single.lng]} icon={iconFor(single)}>
              <Popup>
                <div className="om-map-popup">
                  <strong>{single.name}</strong>
                  <br />
                  <Link to={`/mosques/${single.slug ?? single.id}`}>View details</Link>
                </div>
              </Popup>
            </Marker>
          )
        ) : (
          <ClusterLayer markers={markers} onMarkerClick={onMarkerClick} />
        )}
      </MapContainer>
    </div>
  )
}
