import { useEffect, useRef, useState } from 'react';
import { Loader } from 'lucide-react';

export default function MapView({ mosques = [], center, onMarkerClick }) {
  const mapRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    async function initLeafletMap() {
      try {
        if (!mapRef.current) return;
        const L = await import('leaflet');

        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
          iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
          shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        });

        const defaultLat = center?.lat || 18.5204;
        const defaultLng = center?.lng || 73.8567;

        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        }

        const map = L.map(mapRef.current).setView([defaultLat, defaultLng], 12);
        mapInstanceRef.current = map;

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors',
          maxZoom: 19,
        }).addTo(map);

        const markers = [];
        mosques.forEach((m) => {
          const lat = m.latitude || m.lat;
          const lng = m.longitude || m.lng;
          if (lat && lng && (lat !== 0 || lng !== 0)) {
            const marker = L.marker([lat, lng]).addTo(map);
            const popupContent = `
              <div style="min-width:160px; font-family: sans-serif; padding: 4px;">
                <h4 style="font-weight:700; font-size:14px; margin:0 0 4px 0; color:#111;">${m.name}</h4>
                <p style="font-size:12px; color:#555; margin:0 0 8px 0;">${m.address || m.city || ''}</p>
                <a href="/mosques/${m.id || m.slug}" style="display:inline-block; font-size:11px; background:#059669; color:#fff; font-weight:600; padding:4px 8px; border-radius:6px; text-decoration:none;">View Details &rarr;</a>
              </div>
            `;
            marker.bindPopup(popupContent);
            marker.on('click', () => {
              onMarkerClick?.(m);
            });
            markers.push(marker);
          }
        });

        if (markers.length > 0) {
          const group = L.featureGroup(markers);
          map.fitBounds(group.getBounds().pad(0.15));
        }

        if (isMounted) setMapLoaded(true);
      } catch (err) {
        console.warn('Leaflet map error:', err);
      }
    }

    initLeafletMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [mosques, center, onMarkerClick]);

  return (
    <div className="relative rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm min-h-[480px]">
      {!mapLoaded && (
        <div className="absolute inset-0 bg-gray-50 dark:bg-gray-800 flex items-center justify-center z-10">
          <div className="flex items-center gap-2 text-primary-600 dark:text-primary-400">
            <Loader size={20} className="animate-spin" />
            <span className="text-xs font-semibold">Loading interactive map...</span>
          </div>
        </div>
      )}
      <div ref={mapRef} className="w-full h-[520px] rounded-2xl z-0" />
    </div>
  );
}
