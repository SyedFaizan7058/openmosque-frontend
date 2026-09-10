import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';
import { authService } from '../services/authService';

const LOCATION_STORAGE_KEY = 'om_user_location';

const POPULAR_CITIES = [
  { name: 'Udgir', state: 'Maharashtra', country: 'India', lat: 18.392135, lng: 77.119612 },
  { name: 'Pune', state: 'Maharashtra', country: 'India', lat: 18.5204, lng: 73.8567 },
  { name: 'Mumbai', state: 'Maharashtra', country: 'India', lat: 19.0760, lng: 72.8777 },
  { name: 'Delhi', state: 'Delhi', country: 'India', lat: 28.6139, lng: 77.2090 },
  { name: 'Hyderabad', state: 'Telangana', country: 'India', lat: 17.3850, lng: 78.4867 },
  { name: 'Bengaluru', state: 'Karnataka', country: 'India', lat: 12.9716, lng: 77.5946 },
  { name: 'London', state: 'Greater London', country: 'United Kingdom', lat: 51.5074, lng: -0.1278 },
  { name: 'New York', state: 'NY', country: 'United States', lat: 40.7128, lng: -74.0060 },
  { name: 'Toronto', state: 'ON', country: 'Canada', lat: 43.6532, lng: -79.3832 },
  { name: 'Dubai', state: 'Dubai', country: 'United Arab Emirates', lat: 25.2048, lng: 55.2708 },
  { name: 'Istanbul', state: 'Istanbul', country: 'Turkey', lat: 41.0082, lng: 28.9784 }
];

const LocationContext = createContext(null);

export function LocationProvider({ children }) {
  const { user } = useAuth();
  
  // Location state: { mode: 'gps'|'city'|'map', city: string, country: string, lat: number, lng: number }
  const [currentLocation, setCurrentLocation] = useState(() => {
    try {
      const saved = localStorage.getItem(LOCATION_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to parse saved location', e);
    }
    return null;
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [detectingGps, setDetectingGps] = useState(false);
  const [gpsError, setGpsError] = useState(null);

  const prevUserRef = useRef(user?.id || user?.uid || null);

  // On logout and new login, reset and re-prompt location selection without requiring page refresh
  useEffect(() => {
    const currentUserId = user?.id || user?.uid || null;
    const isAuthTransition = prevUserRef.current !== currentUserId;
    prevUserRef.current = currentUserId;

    if (isAuthTransition) {
      if (!user) {
        // Logged out: reset location and re-prompt selection modal
        setCurrentLocation(null);
        try {
          localStorage.removeItem(LOCATION_STORAGE_KEY);
          localStorage.removeItem('om_location_dismissed');
        } catch {}
        setIsModalOpen(true);
      } else if (user?.preferredCity) {
        // Logged in with user preferred location: sync it
        const syncedLocation = {
          mode: 'city',
          city: user.preferredCity,
          country: user.preferredCountry || 'India',
          lat: user.latitude || null,
          lng: user.longitude || null,
          isAccountLocation: true,
        };
        setCurrentLocation(syncedLocation);
        localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(syncedLocation));
        setIsModalOpen(false);
      } else {
        // Logged in without saved location: prompt selection
        setCurrentLocation(null);
        try {
          localStorage.removeItem(LOCATION_STORAGE_KEY);
          localStorage.removeItem('om_location_dismissed');
        } catch {}
        setIsModalOpen(true);
      }
    } else if (!user && !currentLocation && !localStorage.getItem('om_location_dismissed')) {
      const timer = setTimeout(() => {
        setIsModalOpen(true);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [user]);

  // Set and persist location
  const setLocation = useCallback(async (locationData) => {
    setCurrentLocation(locationData);
    localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(locationData));
    localStorage.removeItem('om_location_dismissed');
    setIsModalOpen(false);

    // If logged in, sync to backend PostgreSQL profile
    if (user) {
      try {
        await authService.updatePreferredLocation(locationData);
      } catch (e) {
        console.warn('Could not sync location to backend user profile:', e);
      }
    }
  }, [user]);

  // Auto Detect GPS Flow
  const detectGpsLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser.');
      return;
    }

    setDetectingGps(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        let detectedCity = 'Current Location';
        let detectedCountry = '';

        // Reverse Geocode using free OpenStreetMap Nominatim
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10`);
          if (res.ok) {
            const data = await res.json();
            const addr = data.address || {};
            let rawCity = addr.city || addr.town || addr.municipality || addr.state_district || addr.county || 'Pune';
            
            // If located in Pimpri-Chinchwad / Pune metropolitan area
            if (rawCity.toLowerCase().includes('pimpri') || rawCity.toLowerCase().includes('chinchwad') || (addr.state_district && addr.state_district.toLowerCase().includes('pune'))) {
              detectedCity = 'Pune';
            } else {
              detectedCity = rawCity;
            }
            detectedCountry = addr.country || 'India';
          }
        } catch (err) {
          console.warn('Reverse geocoding failed, using coordinates directly:', err);
        }

        const newLoc = {
          mode: 'gps',
          city: detectedCity,
          country: detectedCountry,
          lat,
          lng,
        };

        setLocation(newLoc);
        setDetectingGps(false);
      },
      (error) => {
        setDetectingGps(false);
        if (error.code === 1) {
          setGpsError('Location access was denied. Please select your city manually.');
        } else {
          setGpsError('Could not detect location. Please select your city.');
        }
      },
      { timeout: 12000, enableHighAccuracy: true }
    );
  }, [setLocation]);

  const selectCity = useCallback((cityName) => {
    const matched = POPULAR_CITIES.find(c => c.name.toLowerCase() === cityName.toLowerCase());
    const locationData = {
      mode: 'city',
      city: matched ? matched.name : cityName,
      country: matched ? matched.country : '',
      lat: matched ? matched.lat : null,
      lng: matched ? matched.lng : null,
    };
    setLocation(locationData);
  }, [setLocation]);

  const dismissModal = useCallback(() => {
    setIsModalOpen(false);
    localStorage.setItem('om_location_dismissed', 'true');
  }, []);

  const openLocationModal = useCallback(() => {
    setGpsError(null);
    setIsModalOpen(true);
  }, []);

  return (
    <LocationContext.Provider
      value={{
        currentLocation,
        isModalOpen,
        detectingGps,
        gpsError,
        popularCities: POPULAR_CITIES,
        openLocationModal,
        dismissModal,
        detectGpsLocation,
        selectCity,
        setLocation,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}

export function useLocationContext() {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocationContext must be used within a LocationProvider');
  }
  return context;
}

export default LocationContext;
