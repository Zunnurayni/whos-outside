"use client";

import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import type { ActivityView } from "@/lib/types";
import { formatNaira } from "@/lib/categories";

// Yola city centre (lng, lat).
const YOLA: [number, number] = [12.4954, 9.2035];

const STYLES = {
  streets: "mapbox://styles/mapbox/streets-v12",
  satellite: "mapbox://styles/mapbox/satellite-streets-v12",
  dark: "mapbox://styles/mapbox/dark-v11",
} as const;

/** Haversine distance in km between two lng/lat points. */
function distanceKm(a: [number, number], b: [number, number]): number {
  const R = 6371;
  const dLat = ((b[1] - a[1]) * Math.PI) / 180;
  const dLng = ((b[0] - a[0]) * Math.PI) / 180;
  const la1 = (a[1] * Math.PI) / 180;
  const la2 = (b[1] * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.asin(Math.sqrt(h));
}

/**
 * Real Mapbox GL map for the Radar screen. Branded activity pins, GPS user
 * location (blue dot + center-on-me), a Streets/Satellite style toggle, and
 * distance-from-user on each pin. Only mounted when a token is present.
 */
export function MapboxMap({
  token,
  activities,
  focusId,
  onFocus,
}: {
  token: string;
  activities: ActivityView[];
  focusId: string;
  onFocus: (id: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const geoRef = useRef<mapboxgl.GeolocateControl | null>(null);
  const markersRef = useRef<Record<string, mapboxgl.Marker>>({});
  const userRef = useRef<[number, number] | null>(null);
  const onFocusRef = useRef(onFocus);
  onFocusRef.current = onFocus;

  const [styleKey, setStyleKey] = useState<"streets" | "satellite">("streets");

  // Rebuild all markers (used on init and after a style change, since
  // changing style clears custom layers but markers persist — we re-add to be safe).
  const buildMarkers = (map: mapboxgl.Map) => {
    for (const id of Object.keys(markersRef.current)) {
      if (!activities.find((a) => a.id === id)) {
        markersRef.current[id].remove();
        delete markersRef.current[id];
      }
    }
    const pts: [number, number][] = [];
    for (const a of activities) {
      if (a.lng == null || a.lat == null) continue;
      pts.push([a.lng, a.lat]);
      const dist =
        userRef.current != null
          ? distanceKm(userRef.current, [a.lng, a.lat])
          : null;
      const distLabel =
        dist != null ? (dist < 1 ? `${Math.round(dist * 1000)}m` : `${dist.toFixed(1)}km`) : "";

      if (markersRef.current[a.id]) {
        const el = markersRef.current[a.id].getElement();
        el.dataset.hot = a.id === focusId ? "1" : "0";
        const d = el.querySelector(".wo-pin-dist");
        if (d) d.textContent = distLabel;
        continue;
      }
      const el = document.createElement("button");
      el.className = "wo-pin";
      el.dataset.hot = a.id === focusId ? "1" : "0";
      el.innerHTML =
        `<span class="wo-pin-emoji">${a.emoji}</span>` +
        `<span class="wo-pin-price">${a.cost === 0 ? "Free" : formatNaira(a.cost)}</span>` +
        `<span class="wo-pin-dist">${distLabel}</span>`;
      el.addEventListener("click", (e) => {
        e.stopPropagation();
        onFocusRef.current(a.id);
      });
      markersRef.current[a.id] = new mapboxgl.Marker({ element: el, anchor: "bottom" })
        .setLngLat([a.lng, a.lat])
        .addTo(map);
    }
    const first = pts[0];
    const cur = map.getBounds();
    if (pts.length > 1 && first && (!cur || !cur.contains(first))) {
      const b = pts.reduce((bb, p) => bb.extend(p), new mapboxgl.LngLatBounds(first, first));
      map.fitBounds(b, { padding: 70, maxZoom: 14, duration: 0 });
    }
  };

  // Init once.
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    mapboxgl.accessToken = token;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: STYLES.streets,
      center: YOLA,
      zoom: 12.3,
      attributionControl: false,
      doubleClickZoom: true,
      dragRotate: false,
    });
    map.touchZoomRotate.disableRotation();
    map.addControl(new mapboxgl.AttributionControl({ compact: true }));
    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "top-right");

    // GPS: blue dot + center-on-me. Prompts once on load (we trigger it after
    // load); falls back silently to Yola if denied.
    const geo = new mapboxgl.GeolocateControl({
      positionOptions: { enableHighAccuracy: true },
      trackUserLocation: true,
      showUserHeading: true,
      showAccuracyCircle: true,
    });
    map.addControl(geo, "top-right");
    geoRef.current = geo;
    geo.on("geolocate", (e: GeolocationPosition) => {
      userRef.current = [e.coords.longitude, e.coords.latitude];
      if (mapRef.current) buildMarkers(mapRef.current); // refresh distances
    });

    mapRef.current = map;

    const onLoad = () => {
      map.resize();
      buildMarkers(map);
      // Ask for the user's location once the map is ready.
      try {
        geo.trigger();
      } catch {
        /* geolocation unavailable — stay on Yola */
      }
    };
    map.on("load", onLoad);

    const t1 = setTimeout(() => map.resize(), 150);
    const t2 = setTimeout(() => map.resize(), 600);
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(() => map.resize()) : null;
    if (ro && containerRef.current) ro.observe(containerRef.current);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      ro?.disconnect();
      map.remove();
      mapRef.current = null;
      geoRef.current = null;
      markersRef.current = {};
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Switch map style (Streets ↔ Satellite). Markers are DOM elements, so they
  // survive; we re-run buildMarkers after the new style loads.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    map.setStyle(STYLES[styleKey]);
    const after = () => buildMarkers(map);
    map.once("styledata", after);
  }, [styleKey]); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync markers when activities change.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (map.isStyleLoaded()) buildMarkers(map);
    else map.once("load", () => buildMarkers(map));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activities, focusId]);

  // Fly to the focused activity.
  useEffect(() => {
    const map = mapRef.current;
    const a = activities.find((x) => x.id === focusId);
    if (!map || !a || a.lng == null || a.lat == null) return;
    map.flyTo({ center: [a.lng, a.lat], zoom: Math.max(map.getZoom(), 13.5), duration: 600 });
    for (const [id, m] of Object.entries(markersRef.current)) {
      m.getElement().dataset.hot = id === focusId ? "1" : "0";
    }
  }, [focusId, activities]);

  return (
    <div className="absolute inset-0 h-full w-full">
      <div ref={containerRef} className="absolute inset-0 h-full w-full" />
      {/* Streets / Satellite toggle — sits below the category chip row */}
      <div className="absolute left-3 top-[58px] z-20 flex overflow-hidden rounded-xl border border-line bg-surface/95 text-[0.78rem] font-bold shadow-card backdrop-blur-md">
        <button
          onClick={() => setStyleKey("streets")}
          className={`px-3 py-1.5 ${styleKey === "streets" ? "bg-fg text-bg" : "text-fg-soft"}`}
        >
          🗺️ Map
        </button>
        <button
          onClick={() => setStyleKey("satellite")}
          className={`px-3 py-1.5 ${styleKey === "satellite" ? "bg-fg text-bg" : "text-fg-soft"}`}
        >
          🛰️ Satellite
        </button>
      </div>
    </div>
  );
}
