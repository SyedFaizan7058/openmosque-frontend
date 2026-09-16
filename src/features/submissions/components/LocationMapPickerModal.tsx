import { useEffect, useMemo, useState } from 'react'
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { LocateFixed, MapPin } from 'lucide-react'
import L from '@/features/mosques/lib/leafletSetup'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { MAP_DEFAULT_LAT, MAP_DEFAULT_LNG, MAP_DEFAULT_ZOOM, MAP_TILE_URL } from '@/lib/constants'

interface LocationMapPickerModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialLat?: number | null
  initialLng?: number | null
  onConfirm: (coords: { lat: number; lng: number }) => void
}

function createPickerIcon(): L.DivIcon {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="34" height="34" viewBox="0 0 24 24" fill="#007378" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="drop-shadow-md"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3" fill="#ffffff"/></svg>`
  return L.divIcon({
    html: svg,
    className: 'om-picker-marker',
    iconSize: [34, 34],
    iconAnchor: [17, 34],
    popupAnchor: [0, -32],
  })
}

const pickerIcon = createPickerIcon()

function MapEventsHandler({ onSelect }: { onSelect: (coords: { lat: number; lng: number }) => void }) {
  const map = useMap()

  useMapEvents({
    click(e) {
      onSelect({ lat: Number(e.latlng.lat.toFixed(6)), lng: Number(e.latlng.lng.toFixed(6)) })
    },
  })

  // Ensures map dimensions recalculate once the dialog modal mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize()
    }, 150)
    return () => clearTimeout(timer)
  }, [map])

  return null
}

export function LocationMapPickerModal({
  open,
  onOpenChange,
  initialLat,
  initialLng,
  onConfirm,
}: LocationMapPickerModalProps) {
  const hasInitial = typeof initialLat === 'number' && typeof initialLng === 'number' && !isNaN(initialLat) && !isNaN(initialLng)

  const [selectedCoords, setSelectedCoords] = useState<{ lat: number; lng: number }>(() => ({
    lat: hasInitial ? initialLat! : MAP_DEFAULT_LAT,
    lng: hasInitial ? initialLng! : MAP_DEFAULT_LNG,
  }))

  useEffect(() => {
    if (open && hasInitial) {
      setSelectedCoords({ lat: initialLat!, lng: initialLng! })
    }
  }, [open, hasInitial, initialLat, initialLng])

  const center = useMemo<[number, number]>(() => [selectedCoords.lat, selectedCoords.lng], [selectedCoords])

  function handleMarkerDrag(e: L.LeafletEvent) {
    const marker = e.target as L.Marker
    const pos = marker.getLatLng()
    setSelectedCoords({
      lat: Number(pos.lat.toFixed(6)),
      lng: Number(pos.lng.toFixed(6)),
    })
  }

  function handleUseDeviceLocation() {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setSelectedCoords({
          lat: Number(pos.coords.latitude.toFixed(6)),
          lng: Number(pos.coords.longitude.toFixed(6)),
        })
      },
      () => {},
      { timeout: 10000 },
    )
  }

  function handleConfirm() {
    onConfirm(selectedCoords)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl sm:max-w-3xl p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="size-5 text-primary" aria-hidden="true" />
            Pin Mosque Location
          </DialogTitle>
          <DialogDescription>
            Click anywhere on the map or drag the pin to set the exact coordinates of the mosque.
          </DialogDescription>
        </DialogHeader>

        <div className="relative h-[360px] sm:h-[420px] w-full overflow-hidden rounded-xl border border-border">
          {open && (
            <MapContainer
              center={center}
              zoom={hasInitial ? 15 : MAP_DEFAULT_ZOOM}
              scrollWheelZoom={true}
              className="h-full w-full"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url={MAP_TILE_URL}
              />
              <Marker
                position={[selectedCoords.lat, selectedCoords.lng]}
                icon={pickerIcon}
                draggable={true}
                eventHandlers={{ dragend: handleMarkerDrag }}
              />
              <MapEventsHandler onSelect={setSelectedCoords} />
            </MapContainer>
          )}

          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleUseDeviceLocation}
            className="absolute bottom-3 left-3 z-[1000] shadow-md bg-card/95 hover:bg-card text-foreground gap-1.5"
          >
            <LocateFixed className="size-4 text-primary" />
            <span>My location</span>
          </Button>
        </div>

        {/* Selected Coordinates bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-muted/60 px-3.5 py-2 text-xs">
          <div className="flex items-center gap-4">
            <span>
              <strong className="text-muted-foreground">Latitude:</strong>{' '}
              <code className="font-mono font-medium text-foreground">{selectedCoords.lat}</code>
            </span>
            <span>
              <strong className="text-muted-foreground">Longitude:</strong>{' '}
              <code className="font-mono font-medium text-foreground">{selectedCoords.lng}</code>
            </span>
          </div>
          <span className="text-muted-foreground hidden sm:inline">Tip: Drag the pin or click on map</span>
        </div>

        <DialogFooter className="flex-row justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={handleConfirm} className="gap-1.5">
            <MapPin className="size-4" />
            <span>Confirm location</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
