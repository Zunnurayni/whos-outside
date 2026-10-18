"use client";

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import type { ActivityView } from "@/lib/types";
import { formatNaira } from "@/lib/categories";

// Yola city centre.
const YOLA: [number, number] = [12.4954, 9.2035];

/**
 * Real Mapbox GL map for the Explore screen. Renders a branded pin per
 * activity; clicking one calls onFocus so the floating card below updates.
 * Only mounted when a token is present (see MapClient).
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
  const markersRef = useRef<Record<string, mapboxgl.Marker>>({});
  const onFocusRef = useRef(onFocus);
  onFocusRef.current = onFocus;

  // Init once.
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    mapboxgl.accessToken = token;

    const dark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: dark ? "mapbox://styles/mapbox/dark-v11" : "mapbox://styles/mapbox/light-v11",
      center: YOLA,
      zoom: 12.3,
      attributionControl: false,
    });
    map.addControl(new mapboxgl.AttributionControl({ compact: true }));
    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "top-right");
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      markersRef.current = {};
    };
  }, [token]);

  // Sync markers with activities.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const build = () => {
      // remove stale markers
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
        if (markersRef.current[a.id]) {
          markersRef.current[a.id].getElement().dataset.hot = a.id === focusId ? "1" : "0";
          continue;
        }
        const el = document.createElement("button");
        el.className = "wo-pin";
        el.dataset.hot = a.id === focusId ? "1" : "0";
        el.innerHTML = `<span class="wo-pin-emoji">${a.emoji}</span><span class="wo-pin-price">${
          a.cost === 0 ? "Free" : formatNaira(a.cost)
        }</span>`;
        el.addEventListener("click", (e) => {
          e.stopPropagation();
          onFocusRef.current(a.id);
        });
        const marker = new mapboxgl.Marker({ element: el, anchor: "bottom" })
          .setLngLat([a.lng, a.lat])
          .addTo(map);
        markersRef.current[a.id] = marker;
      }
      // fit to pins on first build
      const first = pts[0];
      const curBounds = map.getBounds();
      if (pts.length > 1 && first && (!curBounds || !curBounds.contains(first))) {
        const b = pts.reduce(
          (bb, p) => bb.extend(p),
          new mapboxgl.LngLatBounds(first, first)
        );
        map.fitBounds(b, { padding: 70, maxZoom: 14, duration: 0 });
      }
    };

    if (map.isStyleLoaded()) build();
    else map.once("load", build);
  }, [activities, focusId]);

  // Fly to the focused activity.
  useEffect(() => {
    const map = mapRef.current;
    const a = activities.find((x) => x.id === focusId);
    if (!map || !a || a.lng == null || a.lat == null) return;
    map.flyTo({ center: [a.lng, a.lat], zoom: Math.max(map.getZoom(), 13.5), duration: 600 });
    // refresh hot state on markers
    for (const [id, m] of Object.entries(markersRef.current)) {
      m.getElement().dataset.hot = id === focusId ? "1" : "0";
    }
  }, [focusId, activities]);

  return <div ref={containerRef} className="absolute inset-0" />;
}
