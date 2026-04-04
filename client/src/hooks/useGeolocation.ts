import { useState, useEffect } from 'react';

interface GeoState {
  lat: number | null;
  lng: number | null;
  error: string | null;
  loading: boolean;
}

export function useGeolocation() {
  const [state, setState] = useState<GeoState>({
    lat: null,
    lng: null,
    error: null,
    loading: true,
  });

  useEffect(() => {
    if (!navigator.geolocation) {
      setState(s => ({ ...s, error: 'Geolocation is not supported by your browser.', loading: false }));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      pos => {
        setState({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          error: null,
          loading: false,
        });
      },
      err => {
        setState(s => ({ ...s, error: err.message, loading: false }));
      },
      { timeout: 8000, maximumAge: 60_000 }
    );
  }, []);

  return state;
}
