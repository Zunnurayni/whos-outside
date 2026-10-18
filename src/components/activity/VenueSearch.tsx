"use client";

import { useEffect, useRef, useState } from "react";
import { geocodeVenues, type GeoResult } from "@/lib/geocode";

/**
 * Venue search for the Create form. With a Mapbox token it autocompletes real
 * Yola places and reports the chosen coordinates to the parent. Without a token
 * it's a plain text input (coords come back null, and the action falls back to
 * Yola centre).
 */
export function VenueSearch({
  token,
  value,
  onChange,
  onPick,
  className,
}: {
  token: string;
  value: string;
  onChange: (name: string) => void;
  onPick: (r: { name: string; lat: number | null; lng: number | null }) => void;
  className?: string;
}) {
  const [results, setResults] = useState<GeoResult[]>([]);
  const [open, setOpen] = useState(false);
  const [picked, setPicked] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (!token || picked || value.trim().length < 2) {
      setResults([]);
      return;
    }
    clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      const r = await geocodeVenues(value, token);
      setResults(r);
      setOpen(r.length > 0);
    }, 300);
    return () => clearTimeout(timer.current);
  }, [value, token, picked]);

  return (
    <div className="relative">
      <input
        id="c-venue"
        className={className}
        placeholder={token ? "Search Yola venues…" : "Type the venue name…"}
        value={value}
        autoComplete="off"
        onChange={(e) => {
          setPicked(false);
          onChange(e.target.value);
          onPick({ name: e.target.value, lat: null, lng: null });
        }}
        onFocus={() => results.length && setOpen(true)}
      />
      {open && results.length > 0 && (
        <ul className="absolute z-10 mt-1 w-full overflow-hidden rounded-xl border border-line bg-surface shadow-card">
          {results.map((r, i) => (
            <li key={i}>
              <button
                type="button"
                className="flex w-full flex-col items-start gap-0.5 px-3.5 py-2.5 text-left hover:bg-surface-2"
                onClick={() => {
                  setPicked(true);
                  setOpen(false);
                  onChange(r.name);
                  onPick({ name: r.name, lat: r.lat, lng: r.lng });
                }}
              >
                <span className="text-[0.9rem] font-semibold">📍 {r.name}</span>
                <span className="text-[0.74rem] text-fg-soft">{r.place}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
