import { describe, expect, it } from '@jest/globals';
import { clockInState, describeLog, formatDuration, parentHomeState, parseTimeOnDay, routeLengthM, workedMinutes } from '../shift-logic';
import type { Shift } from '../types';

const base: Shift = {
  id: 's1', family_id: 'f', sitter_id: 'm', note: '',
  starts_at: '2026-10-01T19:00:00Z', ends_at: '2026-10-01T23:00:00Z',
  status: 'scheduled', clock_in_at: null, clock_out_at: null,
};

describe('clockInState', () => {
  it('is too early more than 15 minutes before the start', () => {
    const s = clockInState(base, new Date('2026-10-01T18:40:00Z'));
    expect(s.kind).toBe('too_early');
  });
  it('opens 15 minutes before the start', () => {
    expect(clockInState(base, new Date('2026-10-01T18:45:00Z')).kind).toBe('open');
  });
  it('closes after the shift ends', () => {
    expect(clockInState(base, new Date('2026-10-01T23:01:00Z')).kind).toBe('ended');
  });
  it('does not apply to active shifts', () => {
    expect(clockInState({ ...base, status: 'active' }).kind).toBe('not_scheduled');
  });
});

describe('parentHomeState', () => {
  const now = new Date('2026-10-01T18:30:00Z');
  it('shows live when a shift is active', () => {
    expect(parentHomeState([{ ...base, status: 'active' }], now).kind).toBe('live');
  });
  it('shows starting soon within 60 minutes', () => {
    const st = parentHomeState([base], now);
    expect(st.kind).toBe('soon');
    if (st.kind === 'soon') expect(st.minutes).toBe(30);
  });
  it('shows ended for 12 hours after clock-out', () => {
    const done = { ...base, status: 'completed' as const, clock_out_at: '2026-10-01T15:00:00Z' };
    expect(parentHomeState([done], now).kind).toBe('ended');
    expect(parentHomeState([done], new Date('2026-10-02T04:00:00Z')).kind).toBe('idle');
  });
  it('is idle with the next shift when nothing is near', () => {
    const later = { ...base, starts_at: '2026-10-03T19:00:00Z', ends_at: '2026-10-03T23:00:00Z' };
    const st = parentHomeState([later], now);
    expect(st.kind).toBe('idle');
    if (st.kind === 'idle') expect(st.next?.starts_at).toBe(later.starts_at);
  });
});

describe('time helpers', () => {
  it('counts worked minutes', () => {
    expect(workedMinutes({ clock_in_at: '2026-10-01T19:02:00Z', clock_out_at: '2026-10-01T23:04:00Z' })).toBe(242);
    expect(formatDuration(242)).toBe('4 h 02 m');
    expect(formatDuration(25)).toBe('25 min');
  });
  it('parses times people type', () => {
    const day = new Date(2026, 9, 1);
    expect(parseTimeOnDay('3:45 pm', day)?.getHours()).toBe(15);
    expect(parseTimeOnDay('15:45', day)?.getMinutes()).toBe(45);
    expect(parseTimeOnDay('12 am', day)?.getHours()).toBe(0);
    expect(parseTimeOnDay('25:00', day)).toBeNull();
    expect(parseTimeOnDay('soon', day)).toBeNull();
  });
  it('measures a route', () => {
    const m = routeLengthM([{ lat: 27.95, lng: -82.46 }, { lat: 27.96, lng: -82.46 }]);
    expect(Math.round(m / 10) * 10).toBe(1110);
  });
});

describe('describeLog', () => {
  it('summarises food', () => {
    expect(describeLog({ kind: 'food', data: { meal: 'snack', what: 'Apple slices', amount: 'all' } })).toEqual({ title: 'Snack', detail: 'Apple slices · ate all' });
  });
  it('summarises a running nap', () => {
    expect(describeLog({ kind: 'nap', data: { started_at: '3:45 PM' } }).title).toBe('Nap started');
  });
});
