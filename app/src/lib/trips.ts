// Trips (S8, P8) and the clock-in zone (S22, S21 distance card): data and live hooks. Needs migrations 16 (places)
// and 17 (trips, alerts, clockin_requests). Until they run, reads come back empty and clock-in is never blocked.
// The geofence, the alerts and the pushes all happen in the database on each GPS point (migration 17).
import * as Location from 'expo-location';
import { useCallback, useEffect, useState } from 'react';
import { Platform } from 'react-native';

import { startSharing } from './location-sharing';
import { familyPlaces, type LatLng, type Place, placeForShift } from './places';
import { supabase } from './supabase';
import { type ClockinRequest, clockInZone, type Trip, type TripAlert, type TripMode, type ZoneCheck } from './trips-logic';
import type { LocationPoint, Shift } from './types';

export * from './trips-logic';

function must<T>(r: { data: T | null; error: { message: string } | null }): T {
  if (r.error) throw new Error(r.error.message);
  return r.data as T;
}

let seq = 0;
/** Unique Realtime channel name per subscription (CLAUDE.md). */
const channelName = (base: string) => `${base}-${++seq}-${Math.random().toString(36).slice(2, 8)}`;

export type TripStart = { shiftId: string; sitterId: string; placeId: string | null; customDest?: string; kidIds: string[]; mode: TripMode };

export const tripsApi = {
  /** S8 "Start trip". The database fills in the family, the start zone and whether a parent must approve. */
  async start(t: TripStart) {
    return must(
      await supabase
        .from('trips')
        .insert({ shift_id: t.shiftId, sitter_id: t.sitterId, place_id: t.placeId, custom_dest: t.placeId ? null : (t.customDest ?? '').trim(), kid_ids: t.kidIds, mode: t.mode })
        .select('*')
        .single(),
    ) as Trip;
  },
  /** The sitter ends her open trip (S4 strip). */
  async end(tripId: string) {
    must(await supabase.from('trips').update({ status: 'ended' }).eq('id', tripId));
  },
  /** A parent answers a "Somewhere else" trip (P8). */
  async answer(tripId: string, ok: boolean) {
    must(await supabase.from('trips').update({ status: ok ? 'active' : 'declined' }).eq('id', tripId));
  },
  async get(id: string) {
    return must(await supabase.from('trips').select('*').eq('id', id).single()) as Trip;
  },
  /** Every trip on a shift, oldest first. Empty before migration 17. */
  async forShift(shiftId: string) {
    const r = await supabase.from('trips').select('*').eq('shift_id', shiftId).order('started_at');
    return r.error ? [] : ((r.data ?? []) as Trip[]);
  },
  /** P9: the shift's trip and zone alerts, newest first. Empty before migration 17. */
  async alerts(shiftId: string) {
    const r = await supabase.from('alerts').select('*').eq('shift_id', shiftId).order('created_at', { ascending: false });
    return r.error ? [] : ((r.data ?? []) as TripAlert[]);
  },
  /** P9 "This is expected, dismiss". */
  async dismiss(alertId: string) {
    must(await supabase.from('alerts').update({ dismissed_at: new Date().toISOString() }).eq('id', alertId));
  },
  /** S22 "Starting somewhere else?": asks the parents (they get a push). */
  async requestAway(shiftId: string, note = '') {
    return must(await supabase.rpc('request_clockin_away', { p_shift: shiftId, p_note: note })) as ClockinRequest;
  },
  /** A parent answers (P9). */
  async answerAway(requestId: string, ok: boolean) {
    return must(await supabase.rpc('answer_clockin_away', { p_request: requestId, p_ok: ok })) as ClockinRequest;
  },
  /** The latest request to start away on a shift, or null. */
  async awayRequest(shiftId: string) {
    const r = await supabase.from('clockin_requests').select('*').eq('shift_id', shiftId).order('created_at', { ascending: false }).limit(1);
    return r.error ? null : ((r.data?.[0] as ClockinRequest | undefined) ?? null);
  },
  async awayRequestById(id: string) {
    const r = await supabase.from('clockin_requests').select('*').eq('id', id).maybeSingle();
    return r.error ? null : ((r.data as ClockinRequest | null) ?? null);
  },
  /** GPS points of a shift since `from` (P8 route). */
  async points(shiftId: string, from?: string) {
    let q = supabase.from('locations').select('*').eq('shift_id', shiftId).order('recorded_at').limit(2000);
    if (from) q = q.gte('recorded_at', from);
    const r = await q;
    return r.error ? [] : ((r.data ?? []) as LocationPoint[]);
  },
};

/** The family's homes and places, or [] before migration 16 / on error. */
export async function placesOrEmpty(familyId: string) {
  return familyPlaces(familyId).catch(() => [] as Place[]);
}

/** The phone's position right now, or null on the web, without permission, or without a fix. Read on the phone
 * only: nothing is sent to the server before clock-in. */
export async function currentPosition(): Promise<LatLng | null> {
  if (Platform.OS === 'web') return null;
  try {
    const p = await Location.requestForegroundPermissionsAsync();
    if (!p.granted) return null;
    const last = await Location.getLastKnownPositionAsync({ maxAge: 60_000, requiredAccuracy: 100 });
    const fix = last ?? (await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }));
    return { lat: fix.coords.latitude, lng: fix.coords.longitude };
  } catch {
    return null;
  }
}

/** Is she inside the shift's home zone? (S3 Clock in → S22 when she isn't.) */
export async function checkClockInZone(shift: Shift & { place_id?: string | null }, at?: LatLng | null): Promise<ZoneCheck & { places: Place[] }> {
  const places = await placesOrEmpty(shift.family_id);
  const home = placeForShift(places, shift);
  if (!home || home.lat == null) return { kind: 'ok', why: 'no_home', places };
  const req = await tripsApi.awayRequest(shift.id);
  const pos = at === undefined ? await currentPosition() : at;
  return { ...clockInZone(home, pos, req?.status === 'approved'), places };
}

/** Clock in (the database checks the window, the notice and the house rules) and start sharing location. */
export async function clockInShift(shiftId: string) {
  const { error } = await supabase.rpc('clock_in', { p_shift: shiftId });
  if (error) throw error;
  return startSharing(shiftId);
}

/** Live list of a shift's trips (S4 strip, S9 count, P4 "On a trip" pill). */
export function useShiftTrips(shiftId: string | undefined) {
  const [trips, setTrips] = useState<Trip[]>([]);
  const load = useCallback(async () => {
    setTrips(shiftId ? await tripsApi.forShift(shiftId) : []);
  }, [shiftId]);
  useEffect(() => {
    // initial fetch, then live updates
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
    if (!shiftId) return;
    const ch = supabase
      .channel(channelName(`trips-${shiftId}`))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'trips', filter: `shift_id=eq.${shiftId}` }, () => load())
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [shiftId, load]);
  return { trips, reload: load };
}

/** Live trip + its route (P8). */
export function useTripLive(tripId: string | undefined) {
  const [trip, setTrip] = useState<Trip | null>(null);
  const [points, setPoints] = useState<LocationPoint[]>([]);
  const [error, setError] = useState('');
  const shiftId = trip?.shift_id;
  const from = trip?.started_at;
  const load = useCallback(async () => {
    if (!tripId) return;
    try {
      const t = await tripsApi.get(tripId);
      setTrip(t);
      // a little before the start, so the route begins at the door
      setPoints(await tripsApi.points(t.shift_id, new Date(+new Date(t.started_at) - 5 * 60_000).toISOString()));
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }, [tripId]);
  useEffect(() => {
    // initial fetch
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);
  useEffect(() => {
    if (!tripId || !shiftId) return;
    const ch = supabase
      .channel(channelName(`trip-${tripId}`))
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'trips', filter: `id=eq.${tripId}` }, (p) => setTrip(p.new as Trip))
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'locations', filter: `shift_id=eq.${shiftId}` }, (p) => {
        const pt = p.new as LocationPoint;
        if (!from || pt.recorded_at >= from) setPoints((xs) => [...xs, pt]);
      })
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [tripId, shiftId, from]);
  return { trip, points, error, reload: load };
}

/** Live trip and zone alerts of a shift (P9). */
export function useShiftAlerts(shiftId: string | undefined) {
  const [alerts, setAlerts] = useState<TripAlert[]>([]);
  const load = useCallback(async () => {
    setAlerts(shiftId ? await tripsApi.alerts(shiftId) : []);
  }, [shiftId]);
  useEffect(() => {
    // initial fetch, then live updates
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
    if (!shiftId) return;
    const ch = supabase
      .channel(channelName(`alerts-${shiftId}`))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'alerts', filter: `shift_id=eq.${shiftId}` }, () => load())
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [shiftId, load]);
  return { alerts, reload: load };
}

/** Live S22 request (the sitter waits for the parent's answer). */
export function useAwayRequest(shiftId: string | undefined) {
  const [request, setRequest] = useState<ClockinRequest | null>(null);
  const load = useCallback(async () => {
    setRequest(shiftId ? await tripsApi.awayRequest(shiftId) : null);
  }, [shiftId]);
  useEffect(() => {
    // initial fetch, then live updates
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
    if (!shiftId) return;
    const ch = supabase
      .channel(channelName(`clockin-req-${shiftId}`))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'clockin_requests', filter: `shift_id=eq.${shiftId}` }, () => load())
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [shiftId, load]);
  return { request, reload: load };
}

/** Distance from the phone to the shift's home, for S21's card ("You're 4.2 mi away"). Null when unknown. */
export function useDistanceToHome(shift: (Shift & { place_id?: string | null }) | undefined, enabled: boolean) {
  const [check, setCheck] = useState<ZoneCheck | null>(null);
  const sid = shift?.id;
  useEffect(() => {
    if (!enabled || !shift) return;
    let live = true;
    checkClockInZone(shift).then((c) => live && setCheck(c), () => live && setCheck(null));
    return () => {
      live = false;
    };
    // shift object identity changes on every Realtime update; the id is enough
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sid, enabled]);
  return check?.kind === 'away' ? check.distanceFt : null;
}
