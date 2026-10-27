"use client";

import { useState, useCallback } from "react";

interface GeoState {
  lat: number | null;
  lng: number | null;
  loading: boolean;
  error: string | null;
  /** manual city fallback when the user declines GPS */
  city: string;
}

// Default map centre used before the browser returns a GPS fix.
const DEFAULT_CENTER = { lat: 9.2035, lng: 12.4954 };

/**
 * Browser geolocation with a manual fallback, per the spec's privacy stance:
 * GPS is never required. If the user declines, we keep the default centre
 * until they share a location or pick a venue.
 */
export function useGeolocation() {
  const [state, setState] = useState<GeoState>({
    lat: DEFAULT_CENTER.lat,
    lng: DEFAULT_CENTER.lng,
    loading: false,
    error: null,
    city: "Near you",
  });

  const request = useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setState((s) => ({ ...s, error: "Geolocation not available" }));
      return;
    }
    setState((s) => ({ ...s, loading: true, error: null }));
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        setState((s) => ({
          ...s,
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          loading: false,
        })),
      (err) =>
        setState((s) => ({
          ...s,
          loading: false,
          error: err.message || "Location permission denied",
        })),
      { enableHighAccuracy: false, timeout: 8000 }
    );
  }, []);

  const setCity = useCallback((city: string) => {
    setState((s) => ({ ...s, city }));
  }, []);

  return { ...state, request, setCity };
}
