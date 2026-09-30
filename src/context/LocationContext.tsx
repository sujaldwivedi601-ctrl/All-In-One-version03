import React, { createContext, useContext, useState, useEffect } from 'react';

export interface LocationState {
  latitude: number | null;
  longitude: number | null;
  locationName: string;
  source: 'gps' | 'search' | 'profile' | 'none';
  isLocating: boolean;
  gpsError: string | null;
  detectLocation: () => Promise<boolean>;
  setLocation: (lat: number, lon: number, name: string, source?: 'gps' | 'search' | 'profile') => void;
}

const LocationContext = createContext<LocationState>({
  latitude: null,
  longitude: null,
  locationName: '',
  source: 'none',
  isLocating: false,
  gpsError: null,
  detectLocation: async () => false,
  setLocation: () => {},
});

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [latitude, setLatitude] = useState<number | null>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('efarmer_user_lat');
      return saved ? parseFloat(saved) : null;
    }
    return null;
  });

  const [longitude, setLongitude] = useState<number | null>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('efarmer_user_lon');
      return saved ? parseFloat(saved) : null;
    }
    return null;
  });

  const [locationName, setLocationName] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('efarmer_user_location_name') || '';
    }
    return '';
  });

  const [source, setSource] = useState<'gps' | 'search' | 'profile' | 'none'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('efarmer_user_location_source') as any) || 'none';
    }
    return 'none';
  });

  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  const setLocation = (lat: number, lon: number, name: string, src: 'gps' | 'search' | 'profile' = 'search') => {
    setLatitude(lat);
    setLongitude(lon);
    setLocationName(name);
    setSource(src);
    setGpsError(null);
    if (typeof window !== 'undefined') {
      localStorage.setItem('efarmer_user_lat', lat.toString());
      localStorage.setItem('efarmer_user_lon', lon.toString());
      localStorage.setItem('efarmer_user_location_name', name);
      localStorage.setItem('efarmer_user_location_source', src);
    }
  };

  const detectLocation = async (): Promise<boolean> => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser.');
      return false;
    }

    setIsLocating(true);
    setGpsError(null);

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          let label = `${lat.toFixed(2)}°N, ${lon.toFixed(2)}°E`;

          // Reverse geocode via BigDataCloud or Open-Meteo to get user's real village/city name
          try {
            const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`);
            if (res.ok) {
              const data = await res.json();
              const city = data.locality || data.city || data.principalSubdivision;
              const state = data.principalSubdivision;
              if (city) {
                label = state ? `${city}, ${state}` : city;
              }
            }
          } catch (e) {
            console.warn('Reverse geocode fallback:', e);
          }

          setLocation(lat, lon, label, 'gps');
          setIsLocating(false);
          resolve(true);
        },
        (error) => {
          setIsLocating(false);
          let msg = 'Could not get device location. Please allow location access or search your village.';
          if (error.code === error.PERMISSION_DENIED) {
            msg = 'Location permission was denied. Tap "Set Location" to search your town or village.';
          } else if (error.code === error.POSITION_UNAVAILABLE) {
            msg = 'Location signal unavailable.';
          }
          setGpsError(msg);
          resolve(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
      );
    });
  };

  return (
    <LocationContext.Provider value={{
      latitude,
      longitude,
      locationName,
      source,
      isLocating,
      gpsError,
      detectLocation,
      setLocation,
    }}>
      {children}
    </LocationContext.Provider>
  );
};

export const useUserLocation = () => useContext(LocationContext);
