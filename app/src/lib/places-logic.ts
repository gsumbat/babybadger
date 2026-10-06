// Homes and places (migration 16, wireframes P56-P58, design note nP14): types and pure logic, no I/O.
// Homes are clock-in zones (a family can have more than one); other places only raise arrive / leave alerts.

export type PlaceKind = 'home' | 'place';

export type Place = {
  id: string;
  family_id: string;
  kind: PlaceKind;
  name: string;
  /** Null for a sitter when the parent turned "Sitters see the address" off. */
  address: string | null;
  lat: number | null;
  lng: number | null;
  radius_ft: number;
  /** Kids who stay / go here. Null = every kid. */
  kid_ids: string[] | null;
  /** 0 = Sun .. 6 = Sat. Null = every day. */
  days: number[] | null;
  is_main: boolean;
  show_address: boolean;
  notes: string | null;
  created_at?: string;
  updated_at?: string;
};

export type PlaceInput = Omit<Place, 'id' | 'family_id' | 'created_at' | 'updated_at'>;

export type LatLng = { lat: number; lng: number };

/** P57 "Clock-in zone size". */
export const RADIUS_OPTIONS = [
  { label: 'Small', ft: 75 },
  { label: 'Medium', ft: 150 },
  { label: 'Large', ft: 300 },
] as const;
export const DEFAULT_RADIUS_FT = 150;

/** P57 day circles run Monday first. Values are 0 = Sun .. 6 = Sat. */
export const WEEK_MON_FIRST = [1, 2, 3, 4, 5, 6, 0] as const;
const SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const DAY_LETTER = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

const EARTH_R_FT = 20_902_231; // mean Earth radius (6,371,008.8 m) in feet

/** Straight-line distance in feet (haversine). */
export function distanceFt(a: LatLng, b: LatLng): number {
  const rad = Math.PI / 180;
  const dLat = (b.lat - a.lat) * rad;
  const dLng = (b.lng - a.lng) * rad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_R_FT * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** Is a point inside the place's zone? False when the place has no map position yet. */
export function insidePlace(p: Pick<Place, 'lat' | 'lng' | 'radius_ft'>, at: LatLng, slackFt = 0) {
  if (p.lat == null || p.lng == null) return false;
  return distanceFt({ lat: p.lat, lng: p.lng }, at) <= p.radius_ft + slackFt;
}

export const homesOf = (places: Place[]) => sortPlaces(places.filter((p) => p.kind === 'home'));
export const otherPlacesOf = (places: Place[]) => sortPlaces(places.filter((p) => p.kind === 'place'));

/** Main home first, then oldest first. */
export function sortPlaces(places: Place[]) {
  return [...places].sort((a, b) => Number(b.is_main) - Number(a.is_main) || (a.created_at ?? '').localeCompare(b.created_at ?? ''));
}

export function mainHome(places: Place[]): Place | undefined {
  const homes = homesOf(places);
  return homes.find((h) => h.is_main) ?? homes[0];
}

/** The home a shift happens at: its place_id, or the main home when it has none (null = main). */
export function placeForShift(places: Place[], shift: { place_id?: string | null }): Place | undefined {
  const picked = shift.place_id ? places.find((p) => p.id === shift.place_id && p.kind === 'home') : undefined;
  return picked ?? mainHome(places);
}

/** Booking default (nP14): the home whose days include that day (and whose kids include the shift's kids),
 * else the main home. A home without set days doesn't claim a day over the main home. */
export function defaultHomeFor(places: Place[], day: Date, kidIds: string[] = []): Place | undefined {
  const dow = day.getDay();
  const homes = homesOf(places);
  const fits = (h: Place) => !!h.days?.includes(dow) && (!kidIds.length || !h.kid_ids?.length || kidIds.some((k) => h.kid_ids!.includes(k)));
  return homes.find((h) => !h.is_main && fits(h)) ?? homes.find((h) => h.is_main && fits(h)) ?? mainHome(places);
}

/** "Mon – Thu", "Fri – Sun", "Mon, Wed", "Every day". Null = every day. */
export function daysLabel(days: number[] | null | undefined): string {
  if (!days || days.length === 0 || new Set(days).size >= 7) return 'Every day';
  const on = new Set(days);
  if (on.size === 1) return SHORT[[...on][0]];
  // A run that wraps the week (Fri, Sat, Sun) reads as one range: find where it starts.
  const order = [...WEEK_MON_FIRST];
  const start = order.findIndex((d, i) => on.has(d) && !on.has(order[(i + 6) % 7]));
  if (start >= 0) {
    let len = 0;
    while (len < 7 && on.has(order[(start + len) % 7])) len++;
    if (len === on.size && len >= 3) return `${SHORT[order[start]]} – ${SHORT[order[(start + len - 1) % 7]]}`;
  }
  return order.filter((d) => on.has(d)).map((d) => SHORT[d]).join(', ');
}

/** P57 map pill: "Clock-in zone · 150 ft". */
export function zoneLabel(p: Pick<Place, 'kind' | 'radius_ft'>) {
  return `${p.kind === 'home' ? 'Clock-in zone' : 'Alert zone'} · ${p.radius_ft} ft`;
}

/** Settings row (P12b): "2 homes, 3 places". */
export function placesCountLabel(places: Place[]) {
  const homes = places.filter((p) => p.kind === 'home').length;
  const others = places.length - homes;
  const parts = [homes && `${homes} ${homes === 1 ? 'home' : 'homes'}`, others && `${others} ${others === 1 ? 'place' : 'places'}`].filter(Boolean);
  return parts.length ? parts.join(', ') : 'None yet';
}

/** Kid ids: every kid selected is stored as null so kids added later stay included. */
export function storedKidIds(selected: string[], allKidIds: string[]): string[] | null {
  const mine = allKidIds.filter((id) => selected.includes(id));
  return mine.length === 0 || mine.length === allKidIds.length ? null : mine;
}

/** Days: every day (or none) is stored as null. */
export function storedDays(selected: number[]): number[] | null {
  const set = [...new Set(selected)].filter((d) => d >= 0 && d <= 6).sort((a, b) => a - b);
  return set.length === 0 || set.length === 7 ? null : set;
}

/** Which P56 icon a place gets (school book, ball, family heart, else a map pin). */
export function placeIcon(p: Pick<Place, 'kind' | 'name'>): 'home' | 'school' | 'ball' | 'heart' | 'pin' {
  if (p.kind === 'home') return 'home';
  const n = p.name.toLowerCase();
  if (/school|elementary|academy|daycare|preschool|college|class/.test(n)) return 'school';
  if (/soccer|park|field|gym|pool|practice|court|playground|swim|dance|karate/.test(n)) return 'ball';
  if (/grandma|grandpa|nana|granny|abuela|abuelo|aunt|uncle|cousin/.test(n)) return 'heart';
  return 'pin';
}

/** P58 result rows: "88 Channelside Dr" over "Tampa, FL 33602". */
export function splitAddress(address: string): { line1: string; line2: string } {
  const i = address.indexOf(',');
  return i < 0 ? { line1: address.trim(), line2: '' } : { line1: address.slice(0, i).trim(), line2: address.slice(i + 1).trim() };
}

/** Builds "88 Channelside Dr, Tampa, FL 33602" from geocoder parts. */
export function formatAddress(a: { name?: string | null; streetNumber?: string | null; street?: string | null; city?: string | null; region?: string | null; postalCode?: string | null; formattedAddress?: string | null }) {
  const street = [a.streetNumber, a.street].filter(Boolean).join(' ') || a.name || '';
  const regionZip = [a.region, a.postalCode].filter(Boolean).join(' ');
  const built = [street, a.city, regionZip].filter(Boolean).join(', ');
  return built || a.formattedAddress || '';
}
