// Web / fallback: native maps need the phone. Shows the wireframe's drawn map (P57) with the zone pill.
import { MapSketch } from './places';

export function PlaceMap({ lat, lng, label }: { lat: number | null; lng: number | null; radiusFt: number; label: string }) {
  return <MapSketch label={label} zone={lat != null && lng != null} />;
}
