import { describe, expect, it } from '@jest/globals';

import type { Place } from '../places-logic';
import { clockInZone, destOptions, distanceLabel, modePhrase, offPlanCards, travelMinutes, type Trip, type TripAlert, tripAlertRows, tripSteps } from '../trips-logic';

const home: Place = { id: 'h', family_id: 'f', kind: 'home', name: 'Lee home', address: null, lat: 27.95, lng: -82.46, radius_ft: 150, kid_ids: null, days: null, is_main: true, show_address: true, notes: null, created_at: '2026-01-01' };
const soccer: Place = { ...home, id: 's', kind: 'place', name: 'Riverside soccer fields', lat: 27.96, lng: -82.45, radius_ft: 300, is_main: false, created_at: '2026-01-02' };

describe('clock-in zone (S22)', () => {
  it('allows clock-in inside the zone, with no location, no home, or an approved start away', () => {
    expect(clockInZone(home, { lat: 27.95, lng: -82.4601 }, false)).toEqual({ kind: 'ok', why: 'inside' });
    expect(clockInZone(home, null, false).kind).toBe('ok');
    expect(clockInZone(undefined, { lat: 0, lng: 0 }, false).kind).toBe('ok');
    expect(clockInZone({ ...home, lat: null, lng: null }, { lat: 0, lng: 0 }, false).kind).toBe('ok');
    expect(clockInZone(home, { lat: 28, lng: -82.5 }, true)).toEqual({ kind: 'ok', why: 'approved' });
  });
  it('blocks outside the zone with the distance', () => {
    const c = clockInZone(home, { lat: 27.96, lng: -82.45 }, false);
    expect(c.kind).toBe('away');
    if (c.kind === 'away') expect(distanceLabel(c.distanceFt)).toBe('0.9 mi');
  });
});

describe('words', () => {
  it('distance and travel time (S21)', () => {
    expect(distanceLabel(340)).toBe('340 ft');
    expect(distanceLabel(4.2 * 5280)).toBe('4.2 mi');
    expect(travelMinutes(4.2 * 5280)).toBe(14);
    expect(modePhrase('walk')).toBe('on foot');
  });
});

describe('S8 destinations', () => {
  it('puts a place named in today’s tasks first and leaves out where she is', () => {
    const opts = destOptions([home, soccer], [{ title: 'Pick up Ava at soccer', due_at: null }], 'h');
    expect(opts.map((o) => o.id)).toEqual(['s']);
    expect(opts[0].sub).toBe('On today’s plan');
  });
});

const trip: Trip = { id: 't', shift_id: 'x', family_id: 'f', sitter_id: 'm', place_id: 's', custom_dest: null, start_place_id: 'h', needs_approval: false, approved_at: null, kid_ids: ['a'], mode: 'car', started_at: '2026-10-01T20:00:00Z', left_start_at: null, arrived_at: null, ended_at: null, status: 'active' };

describe('P8 and P9', () => {
  it('timeline before leaving', () => {
    expect(tripSteps(trip, home, 'Riverside soccer fields').map((s) => s.title)).toEqual(['At home', 'Riverside soccer fields']);
  });
  it('rows and off-plan cards', () => {
    const base = { family_id: 'f', shift_id: 'x', trip_id: 't', body: '', url: '', dismissed_at: null };
    const alerts: TripAlert[] = [
      { ...base, id: '1', kind: 'trip_left', title: '', data: { dest: 'soccer', mode: 'car' }, created_at: '2026-10-01T20:10:00Z' },
      { ...base, id: '2', kind: 'trip_arrived', title: '', data: { dest: 'soccer', kids: 'Ava' }, created_at: '2026-10-01T20:27:00Z' },
      { ...base, id: '3', trip_id: null, kind: 'off_plan', title: 'Off-plan location', body: 'Maya left soccer.', data: {}, created_at: '2026-10-01T21:42:00Z' },
    ];
    const rows = tripAlertRows(alerts, 'Maya');
    expect(rows.map((r) => r.title)).toEqual(['Trip started to soccer', 'Arrived at soccer']);
    expect(rows[0].sub.startsWith('By car · ')).toBe(true);
    expect(rows[1].sub.startsWith('Maya and Ava · ')).toBe(true);
    expect(rows[1].href).toBe('/parent/trip/t');
    expect(offPlanCards(alerts).map((c) => c.body)).toEqual(['Maya left soccer.']);
  });
});
