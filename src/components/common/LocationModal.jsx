import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Crosshair, MapPin, Map, X, Search, Check, AlertCircle, Loader2 } from 'lucide-react';
import { useLocationContext } from '../../context/LocationContext';

function MapPicker({ onSelectLocation, onBack }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const [selectedCoords, setSelectedCoords] = useState(null);
  const [selectedAddress, setSelectedAddress] = useState('');
  const [geocoding, setGeocoding] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function init() {
      if (!mapContainerRef.current) return;
      const L = await import('leaflet');

      // Fix default marker icon paths in Leaflet
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      const initialLat = 18.5204;
      const initialLng = 73.8567;

      const map = L.map(mapContainerRef.current).setView([initialLat, initialLng], 6);
      mapInstanceRef.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      map.on('click', async (e) => {
        const { lat, lng } = e.latlng;
        if (!isMounted) return;

        setSelectedCoords({ lat, lng });

        if (markerRef.current) {
          markerRef.current.setLatLng([lat, lng]);
        } else {
          markerRef.current = L.marker([lat, lng]).addTo(map);
        }

        setGeocoding(true);
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10`);
          if (res.ok) {
            const data = await res.json();
            const addr = data.address || {};
            const city = addr.city || addr.town || addr.municipality || addr.state_district || addr.county || 'Selected Area';
            const country = addr.country || '';
            const label = country ? `${city}, ${country}` : city;
            setSelectedAddress(label);
          } else {
            setSelectedAddress(`Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`);
          }
        } catch {
          setSelectedAddress(`Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`);
        } finally {
          if (isMounted) setGeocoding(false);
        }
      });
    }

    init();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  const handleConfirm = () => {
    if (!selectedCoords) return;
    const parts = selectedAddress.split(',');
    const city = parts[0]?.trim() || 'Custom Location';
    const country = parts[1]?.trim() || '';
    onSelectLocation({
      mode: 'map',
      city,
      country,
      lat: selectedCoords.lat,
      lng: selectedCoords.lng,
    });
  };

  return (
    <div className="space-y-3">
      <div className="text-xs text-gray-500 dark:text-gray-400">
        Click anywhere on the map to pin your preferred location.
      </div>
      <div
        ref={mapContainerRef}
        className="w-full h-64 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-inner z-10"
      />
      {selectedCoords ? (
        <div className="p-3 rounded-xl bg-primary-50 dark:bg-primary-950/40 border border-primary-200 dark:border-primary-800 flex items-center justify-between">
          <div className="text-xs">
            <div className="font-bold text-primary-900 dark:text-primary-100">
              {geocoding ? 'Detecting place name...' : selectedAddress || 'Location Selected'}
            </div>
            <div className="text-primary-600 dark:text-primary-400 text-[10px]">
              {selectedCoords.lat.toFixed(4)}, {selectedCoords.lng.toFixed(4)}
            </div>
          </div>
          <button
            type="button"
            onClick={handleConfirm}
            className="px-4 py-1.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
          >
            Confirm
          </button>
        </div>
      ) : (
        <p className="text-[11px] text-center text-gray-400">
          Tap on any region to drop a pin
        </p>
      )}
      <button
        type="button"
        onClick={onBack}
        className="w-full py-1.5 text-xs font-semibold text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 text-center cursor-pointer"
      >
        ← Back to location options
      </button>
    </div>
  );
}

export default function LocationModal() {
  const navigate = useNavigate();
  const {
    isModalOpen,
    dismissModal,
    detectGpsLocation,
    detectingGps,
    gpsError,
    popularCities,
    selectCity,
    setLocation,
    currentLocation,
  } = useLocationContext();

  const [activeTab, setActiveTab] = useState('menu'); // 'menu' | 'city' | 'map'
  const [searchQuery, setSearchQuery] = useState('');

  if (!isModalOpen) return null;

  const filteredCities = popularCities.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.state.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.country.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header matching user reference UI */}
        <div className="relative px-6 pt-6 pb-4 border-b border-gray-100 dark:border-gray-800 text-center">
          <button
            type="button"
            onClick={dismissModal}
            className="absolute top-5 right-5 p-1.5 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Close"
          >
            <X size={20} />
          </button>
          
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Location Mode
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 px-4 leading-relaxed">
            Mosques and prayer timings will be calculated as per your preferred location mode.
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-3.5">
          {gpsError && (
            <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-800 dark:text-amber-200 text-xs">
              <AlertCircle size={16} className="shrink-0 mt-0.5 text-amber-600" />
              <span>{gpsError}</span>
            </div>
          )}

          {activeTab === 'menu' ? (
            <div className="space-y-3">
              {/* 1. Auto Detect (GPS) - Highlighted as primary */}
              <button
                type="button"
                disabled={detectingGps}
                onClick={detectGpsLocation}
                className="w-full flex items-center gap-3.5 p-4 rounded-2xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/40 border border-emerald-200/80 dark:border-emerald-800/60 text-left transition-all cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform shrink-0">
                  {detectingGps ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    <Crosshair size={20} />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-emerald-950 dark:text-emerald-100">
                      Auto Detect (GPS)
                    </span>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-200/60 dark:bg-emerald-800/60 text-emerald-800 dark:text-emerald-200">
                      Recommended
                    </span>
                  </div>
                  <p className="text-xs text-emerald-700/80 dark:text-emerald-300/80 mt-0.5">
                    {detectingGps ? 'Detecting current satellite GPS coordinates...' : 'Pinpoint nearest local mosques in your area'}
                  </p>
                </div>
              </button>

              {/* 2. Select City */}
              <button
                type="button"
                onClick={() => setActiveTab('city')}
                className="w-full flex items-center gap-3.5 p-4 rounded-2xl bg-white hover:bg-gray-50 dark:bg-gray-800/80 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700 text-left transition-all cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
                  <MapPin size={20} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-gray-900 dark:text-white">
                      Select City
                    </span>
                    {currentLocation?.city && (
                      <span className="text-xs font-semibold text-primary-600 dark:text-primary-400">
                        {currentLocation.city}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    Choose from Pune, Mumbai, Delhi, London, or any city
                  </p>
                </div>
              </button>

              {/* 3. Choose on Map */}
              <button
                type="button"
                onClick={() => setActiveTab('map')}
                className="w-full flex items-center gap-3.5 p-4 rounded-2xl bg-white hover:bg-gray-50 dark:bg-gray-800/80 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700 text-left transition-all cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
                  <Map size={20} />
                </div>
                <div className="flex-1">
                  <span className="font-bold text-sm text-gray-900 dark:text-white block">
                    Choose On Map
                  </span>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    Drop a pin on interactive map to set your location
                  </p>
                </div>
              </button>
            </div>
          ) : activeTab === 'map' ? (
            <MapPicker
              onSelectLocation={(loc) => {
                setLocation(loc);
              }}
              onBack={() => setActiveTab('menu')}
            />
          ) : (
            /* City Selection Sub-View */
            <div className="space-y-3">
              <div className="relative">
                <Search size={16} className="absolute left-3.5 top-3.5 text-gray-400" />
                <input
                  type="text"
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Type city name (e.g. Pune, Mumbai)..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {/* Custom typed city option */}
              {searchQuery.trim().length > 1 && !popularCities.some(c => c.name.toLowerCase() === searchQuery.toLowerCase()) && (
                <button
                  type="button"
                  onClick={() => selectCity(searchQuery.trim())}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-primary-50 dark:bg-primary-950/40 text-primary-700 dark:text-primary-300 text-xs font-semibold border border-primary-200 dark:border-primary-800/60 hover:bg-primary-100 transition-colors text-left"
                >
                  <span>Select &quot;{searchQuery.trim()}&quot; as my city</span>
                  <Check size={16} />
                </button>
              )}

              {/* City List */}
              <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1">
                {filteredCities.map((city) => {
                  const isSelected = currentLocation?.city?.toLowerCase() === city.name.toLowerCase();
                  return (
                    <button
                      key={city.name}
                      type="button"
                      onClick={() => selectCity(city.name)}
                      className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition-colors ${
                        isSelected
                          ? 'bg-primary-500 text-white font-semibold shadow-sm'
                          : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-800 dark:text-gray-200'
                      }`}
                    >
                      <div>
                        <div className="text-sm font-semibold">{city.name}</div>
                        <div className={`text-xs ${isSelected ? 'text-white/80' : 'text-gray-400'}`}>
                          {city.state}, {city.country}
                        </div>
                      </div>
                      {isSelected && <Check size={18} className="shrink-0" />}
                    </button>
                  );
                })}
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('menu')}
                  className="w-full py-2 text-xs font-semibold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-center transition-colors"
                >
                  ← Back to location options
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer cancel button */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900/60 border-t border-gray-100 dark:border-gray-800 text-right">
          <button
            type="button"
            onClick={dismissModal}
            className="text-sm font-semibold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors px-4 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
