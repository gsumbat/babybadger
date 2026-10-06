// Homes and places data (migration 16). Types and pure logic are in ./places-logic.ts and re-exported here.
// Parents read and write public.places; sitters read public.places_for_sitter (the address is blank there when
// the parent turned "Sitters see the address" off). familyPlaces() reads the view, so it works for both.
import * as Location from 'expo-location';
import { Platform } from 'react-native';

import type { LatLng, Place, PlaceInput } from './places-logic';
import { formatAddress } from './places-logic';
import { supabase } from './supabase';

export * from './places-logic';

function must<T>(r: { data: T | null; error: { message: string } | null }): T {
  if (r.error) throw new Error(r.error.message);
  return r.data as T;
}

const COLS = 'id, family_id, kind, name, address, lat, lng, radius_ft, kid_ids, days, is_main, show_address, notes, created_at, updated_at';

/** Every home and place of the family the signed-in parent or sitter can see. Throws before migration 16 runs. */
export async function familyPlaces(familyId: string): Promise<Place[]> {
  return must(await supabase.from('places_for_sitter').select(COLS).eq('family_id', familyId).order('created_at')) as Place[];
}

export const placesApi = {
  /** Parents: the family's homes and places from the table itself. */
  async list(familyId: string) {
    return must(await supabase.from('places').select(COLS).eq('family_id', familyId).order('created_at')) as Place[];
  },
  async get(id: string) {
    return must(await supabase.from('places').select(COLS).eq('id', id).single()) as Place;
  },
  /** Insert (no id) or update. Making a home main clears the old main in the database. */
  async upsert(familyId: string, fields: PlaceInput, id?: string) {
    const q = id ? supabase.from('places').update(fields).eq('id', id) : supabase.from('places').insert({ ...fields, family_id: familyId });
    return must(await q.select(COLS).single()) as Place;
  },
  async remove(id: string) {
    must(await supabase.from('places').delete().eq('id', id));
  },
  /** Upcoming booked shifts at this home (nP14: removing a home with upcoming shifts asks to move them first). */
  async upcomingShiftsAt(placeId: string) {
    const r = await supabase.from('shifts').select('id').eq('place_id', placeId).eq('status', 'scheduled').gte('starts_at', new Date().toISOString());
    return r.error ? 0 : (r.data?.length ?? 0);
  },
};

/** Geocoding needs the phone (iOS / Android). On the web preview it isn't available. */
export const canGeocode = Platform.OS !== 'web';

async function ensurePermission() {
  // Android's geocoder needs the foreground location permission; iOS doesn't, but asking is harmless.
  try {
    const p = await Location.getForegroundPermissionsAsync();
    if (p.granted) return true;
    if (!p.canAskAgain) return false;
    return (await Location.requestForegroundPermissionsAsync()).granted;
  } catch {
    return false;
  }
}

/** Address → map position. Null when it can't be found, or on the web (the user can still save without one). */
export async function geocode(address: string): Promise<LatLng | null> {
  if (!canGeocode || !address.trim()) return null;
  try {
    if (Platform.OS === 'android') await ensurePermission();
    const hit = (await Location.geocodeAsync(address.trim()))[0];
    return hit ? { lat: hit.latitude, lng: hit.longitude } : null;
  } catch {
    return null;
  }
}

export type AddressResult = { address: string; lat: number | null; lng: number | null };

/** P58 search: up to 3 matches with their full address. Empty on the web or when nothing is found. */
export async function searchAddresses(query: string): Promise<AddressResult[]> {
  if (!canGeocode || query.trim().length < 4) return [];
  try {
    if (Platform.OS === 'android') await ensurePermission();
    const hits = (await Location.geocodeAsync(query.trim())).slice(0, 3);
    const rows = await Promise.all(
      hits.map(async (h) => {
        const named = (await Location.reverseGeocodeAsync({ latitude: h.latitude, longitude: h.longitude }).catch(() => []))[0];
        return { address: (named && formatAddress(named)) || query.trim(), lat: h.latitude, lng: h.longitude };
      }),
    );
    return rows.filter((r, i) => rows.findIndex((x) => x.address === r.address) === i);
  } catch {
    return [];
  }
}

/** P58 "Use where I am now": the phone's position and, on a phone, its street address. Null without permission. */
export async function currentAddress(): Promise<AddressResult | null> {
  try {
    if (!(await ensurePermission())) return null;
    const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
    const lat = pos.coords.latitude;
    const lng = pos.coords.longitude;
    let address = '';
    if (canGeocode) {
      const named = (await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng }).catch(() => []))[0];
      address = named ? formatAddress(named) : '';
    }
    return { address, lat, lng };
  } catch {
    return null;
  }
}

// P58 → P57 hand-off: the address picked on "Add a place" opens the edit screen as a new, unsaved home or place.
export type PlaceDraft = { kind: Place['kind']; address: string; lat: number | null; lng: number | null };
let draft: PlaceDraft | null = null;
export function setPlaceDraft(d: PlaceDraft) {
  draft = d;
}
export function peekPlaceDraft() {
  return draft;
}
