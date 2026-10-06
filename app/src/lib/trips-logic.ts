// Pure rules for trips and the clock-in zone (S8, P8, C2, S22, S21 distance card, P9 trip rows). No React, no
// Supabase: unit-tested. The database (migration 17) does the geofence and the alerts; this file only words and
// decides what the screens show.
import type { AlertRow } from './alerts-logic';
import { timeOf } from './format';
import { distanceFt, insidePlace, type LatLng, type Place } from './places-logic';

export type TripMode = 'walk' | 'car' | 'transit';
export type TripStatus = 'pending' | 'active' | 'arrived' | 'ended' | 'declined';

/** A trip (migration 17). place_id null = "Somewhere else" (custom_dest), which waits for a parent. */
export type Trip = {
  id: string;
  shift_id: string;
  family_id: string;
  sitter_id: string;
  place_id: string | null;
  custom_dest: string | null;
  start_place_id: string | null;
  needs_approval: boolean;
  approved_at: string | null;
  kid_ids: string[];
  mode: TripMode;
  started_at: string;
  left_start_at: string | null;
  arrived_at: string | null;
  ended_at: string | null;
  status: TripStatus;
};

export type TripAlertKind = 'trip_left' | 'trip_arrived' | 'trip_request' | 'off_plan' | 'clockin_away';

/** A row of public.alerts (written only by the database; parents read and dismiss). */
export type TripAlert = {
  id: string;
  family_id: string;
  shift_id: string;
  trip_id: string | null;
  kind: TripAlertKind;
  title: string;
  body: string;
  url: string;
  data: { dest?: string; mode?: TripMode; kids?: string; minutes?: number; zone?: string; away_mi?: number | null; note?: string; request_id?: string };
  created_at: string;
  dismissed_at: string | null;
};

/** S22 "Starting somewhere else?" request. */
export type ClockinRequest = {
  id: string;
  shift_id: string;
  family_id: string;
  sitter_id: string;
  note: string;
  status: 'pending' | 'approved' | 'declined';
  answered_by: string | null;
  answered_at: string | null;
  created_at: string;
};

/** S8 segmented control, in the wireframe's order. Car is picked first (the wireframe's selected segment). */
export const MODES: { value: TripMode; label: string }[] = [
  { value: 'walk', label: 'Walk' },
  { value: 'car', label: 'Car' },
  { value: 'transit', label: 'Transit' },
];

/** "by car" / "on foot" / "by transit" (same words as the push, migration 17's trip_mode_phrase). */
export function modePhrase(m: TripMode) {
  return m === 'walk' ? 'on foot' : m === 'transit' ? 'by transit' : 'by car';
}

/** Rough door-to-door speeds for "about 14 min by car" and P8's "6 min". */
const MPH: Record<TripMode, number> = { walk: 3, car: 18, transit: 12 };

/** Minutes to cover `ft` at the mode's usual speed (at least 1). */
export function travelMinutes(ft: number, mode: TripMode = 'car') {
  return Math.max(1, Math.round((ft / 5280 / MPH[mode]) * 60));
}

/** "4.2 mi" (one decimal; "0.1 mi" at least) or "350 ft" under 1,000 ft. */
export function distanceLabel(ft: number) {
  if (ft < 1000) return `${Math.max(10, Math.round(ft / 10) * 10)} ft`;
  return `${Math.max(0.1, ft / 5280).toFixed(1)} mi`;
}

/** Where a trip goes: the saved place's name, or what she typed for "Somewhere else". */
export function tripDest(trip: Pick<Trip, 'place_id' | 'custom_dest'>, places: Pick<Place, 'id' | 'name'>[]) {
  return places.find((p) => p.id === trip.place_id)?.name ?? trip.custom_dest ?? 'a saved place';
}

/** Pending or active: the one a shift can have open. */
export const isOpenTrip = (t: Pick<Trip, 'status'>) => t.status === 'pending' || t.status === 'active';

// ---------------------------------------------------------------- clock-in zone (S22)

export type ZoneCheck =
  | { kind: 'ok'; why: 'inside' | 'no_location' | 'no_home' | 'approved' }
  | { kind: 'away'; home: Place; distanceFt: number; at: LatLng };

/** Clock-in opens inside the shift's home zone. Allowed anyway when the phone has no location (web, permission off),
 * the family hasn't saved a home with a map position, or a parent approved starting somewhere else. */
export function clockInZone(home: Place | undefined, at: LatLng | null, approved: boolean): ZoneCheck {
  if (approved) return { kind: 'ok', why: 'approved' };
  if (!home || home.lat == null || home.lng == null) return { kind: 'ok', why: 'no_home' };
  if (!at) return { kind: 'ok', why: 'no_location' };
  if (insidePlace(home, at)) return { kind: 'ok', why: 'inside' };
  return { kind: 'away', home, distanceFt: distanceFt({ lat: home.lat, lng: home.lng }, at), at };
}

/** S22 "You're not at the Lee home yet": the home's own name, or "the home" for an unnamed one. */
export function homeTitle(home: Pick<Place, 'name'>) {
  return /home/i.test(home.name) ? `the ${home.name}` : home.name;
}

/** S22 body: "Clock-in opens when you're within 150 ft of the family's address." */
export function zoneLine(home: Pick<Place, 'radius_ft'>) {
  return `Clock-in opens when you're within ${home.radius_ft} ft of the family's address.`;
}

// ---------------------------------------------------------------- S8 destinations

export type DestOption = { id: string; name: string; sub: string; planned: boolean };

/** S8 "Where to?": saved places other than where she is now; a place named in one of today's tasks reads
 * "On today's plan · 4:10 PM" and comes first. Homes come after places. */
export function destOptions(places: Place[], tasks: { title: string; due_at: string | null }[], here?: string | null): DestOption[] {
  const opts = places
    .filter((p) => p.id !== here)
    .map((p) => {
      const task = tasks.find((t) => t.title.toLowerCase().includes(p.name.toLowerCase()) || p.name.toLowerCase().split(/\s+/).some((w) => w.length > 4 && t.title.toLowerCase().includes(w)));
      return { id: p.id, name: p.name, kind: p.kind, planned: !!task, sub: task ? ['On today’s plan', task.due_at ? timeOf(task.due_at) : ''].filter(Boolean).join(' · ') : '' };
    });
  const rank = (o: (typeof opts)[number]) => (o.planned ? 0 : o.kind === 'place' ? 1 : 2);
  return opts.sort((a, b) => rank(a) - rank(b)).map(({ id, name, sub, planned }) => ({ id, name, sub, planned }));
}

/** The place she's in now, from her latest position. */
export function placeAt(places: Place[], at: LatLng | null) {
  if (!at) return undefined;
  return places
    .filter((p) => insidePlace(p, at))
    .sort((a, b) => distanceFt({ lat: a.lat!, lng: a.lng! }, at) - distanceFt({ lat: b.lat!, lng: b.lng! }, at))[0];
}

// ---------------------------------------------------------------- P8 trip view

const names = (ids: string[], kids: { id: string; name: string }[]) =>
  ids
    .map((id) => kids.find((k) => k.id === id)?.name)
    .filter(Boolean)
    .join(' and ');

/** P8 header: "Heading to soccer" / "Maya with Ava · by car". */
export function tripHeading(trip: Trip, dest: string) {
  if (trip.status === 'pending') return `Asks to go to ${dest}`;
  if (trip.status === 'declined') return `Not going to ${dest}`;
  if (trip.status === 'arrived') return `At ${dest}`;
  if (trip.status === 'ended') return `Trip to ${dest} ended`;
  return `Heading to ${dest}`;
}

export function tripSub(trip: Trip, sitter: string, kids: { id: string; name: string }[]) {
  const who = names(trip.kid_ids, kids);
  return `${sitter}${who ? ` with ${who}` : ''} · ${modePhrase(trip.mode)}`;
}

/** P8 "6 min / arrive ~4:27" while she's on the way to a place with a map position. */
export function tripEta(trip: Trip, dest: Pick<Place, 'lat' | 'lng'> | undefined, last: LatLng | undefined, now = new Date()) {
  if (trip.status !== 'active' || !dest || dest.lat == null || dest.lng == null || !last) return null;
  const min = travelMinutes(distanceFt(last, { lat: dest.lat, lng: dest.lng }), trip.mode);
  return { min, at: timeOf(new Date(+now + min * 60_000)).replace(/\s?[AP]M$/i, '') };
}

/** P8 two-step timeline: where she left from, then the destination. */
export function tripSteps(trip: Trip, start: Pick<Place, 'kind' | 'name'> | undefined, dest: string) {
  const from = !start ? 'Started the trip' : start.kind === 'home' ? 'Left home' : `Left ${start.name}`;
  const left = trip.left_start_at
    ? { title: from, sub: `${timeOf(trip.left_start_at)} · you were notified`, done: true }
    : { title: start?.kind === 'home' ? 'At home' : start ? `At ${start.name}` : 'Starting', sub: 'You’ll get an alert when she leaves', done: false };
  const arrive = trip.arrived_at
    ? { title: dest, sub: `Arrived ${timeOf(trip.arrived_at)}`, done: true }
    : trip.place_id
      ? { title: dest, sub: 'You’ll get an alert on arrival', done: false }
      : { title: dest, sub: 'Not a saved place: no arrival alert', done: false };
  return [left, arrive];
}

// ---------------------------------------------------------------- P9 rows

/** P9 "EARLIER TODAY" rows for trip and zone alerts ("Arrived at soccer" / "Maya and Ava · 4:27 PM",
 * "Trip started to soccer" / "By car · 4:10 PM"). Off-plan alerts are cards until dismissed, then rows. */
export function tripAlertRows(alerts: TripAlert[], sitter: string): (AlertRow & { href?: string; alert: TripAlert })[] {
  return alerts
    .filter((a) => a.kind !== 'off_plan' || a.dismissed_at)
    .map((a) => {
      const time = timeOf(a.created_at);
      const dest = a.data?.dest ?? '';
      const mode = a.data?.mode ? modePhrase(a.data.mode) : '';
      const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
      const base = { id: `alert-${a.id}`, at: a.created_at, alert: a, href: a.trip_id ? `/parent/trip/${a.trip_id}` : undefined };
      switch (a.kind) {
        case 'trip_arrived':
          return { ...base, icon: 'arrived' as const, title: `Arrived at ${dest}`, sub: [a.data?.kids ? `${sitter}${a.data.kids.includes(' and ') ? ',' : ' and'} ${a.data.kids}` : sitter, time].filter(Boolean).join(' · ') };
        case 'trip_left':
          return { ...base, icon: 'trip' as const, title: `Trip started to ${dest}`, sub: [cap(mode), time].filter(Boolean).join(' · ') };
        case 'trip_request':
          return { ...base, icon: 'trip' as const, title: `${sitter} asked to go to ${dest}`, sub: [a.data?.kids, mode, time].filter(Boolean).join(' · ') };
        case 'clockin_away':
          return { ...base, icon: 'away' as const, title: `${sitter} asked to clock in away from home`, sub: [a.data?.note, time].filter(Boolean).join(' · ') };
        default:
          return { ...base, icon: 'offplan' as const, title: 'Off-plan location', sub: [a.body, time].join(' · ') };
      }
    });
}

/** P9 red card for an open off-plan alert: "Off-plan location" / "Maya left Riverside soccer fields …". */
export function offPlanCards(alerts: TripAlert[]) {
  return alerts
    .filter((a) => a.kind === 'off_plan' && !a.dismissed_at)
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .map((a) => ({ id: a.id, shiftId: a.shift_id, title: 'Off-plan location', body: a.body, time: timeOf(a.created_at) }));
}
