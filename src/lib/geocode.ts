// Mapbox geocoding (client-side). Returns venue suggestions biased to Yola.
// No token → returns [], and the Create form falls back to a plain text input.

export interface GeoResult {
  name: string;
  place: string; // full place name / context
  lat: number;
  lng: number;
}

const YOLA_PROXIMITY = "12.4954,9.2035"; // lng,lat

export async function geocodeVenues(query: string, token: string): Promise<GeoResult[]> {
  if (!token || query.trim().length < 2) return [];
  const url =
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json` +
    `?access_token=${token}` +
    `&proximity=${YOLA_PROXIMITY}` +
    `&country=NG` +
    `&limit=5` +
    `&types=poi,address,place,locality,neighborhood`;

  try {
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    return (data.features ?? []).map((f: any): GeoResult => ({
      name: f.text ?? f.place_name,
      place: f.place_name ?? "",
      lng: f.center?.[0],
      lat: f.center?.[1],
    }));
  } catch {
    return [];
  }
}
