import { describe, expect, it } from '@jest/globals';

import { bookLabel, nextHalfHour, poolRow, poolStatus, tabLabel, tonightWindow, weekendChip, windowFrom, windowLabel, type PoolInput } from '../pool-logic';

const at = (y: number, m: number, d: number, h = 0, min = 0) => new Date(y, m - 1, d, h, min);
// Tue Oct 6 2026 at 2 PM.
const NOW = at(2026, 10, 6, 14);
const base: PoolInput = { linkStatus: 'active', hours: [{ weekday: 2, starts: '15:00:00', ends: '22:00:00' }], timeOff: [], shifts: [] };
const shift = (start: Date, end: Date, status: 'scheduled' | 'active' | 'completed' | 'cancelled' = 'scheduled') => ({ status, starts_at: start.toISOString(), ends_at: end.toISOString() });

describe('time windows', () => {
  it('tonight is 6 – 10 PM before 6', () => {
    const w = tonightWindow(NOW);
    expect(w.start).toEqual(at(2026, 10, 6, 18));
    expect(w.end).toEqual(at(2026, 10, 6, 22));
  });
  it('after 6 PM tonight starts at the next half hour', () => {
    expect(tonightWindow(at(2026, 10, 6, 19, 10)).start).toEqual(at(2026, 10, 6, 19, 30));
    expect(nextHalfHour(at(2026, 10, 6, 19, 30))).toEqual(at(2026, 10, 6, 19, 30));
    expect(nextHalfHour(at(2026, 10, 6, 19, 31))).toEqual(at(2026, 10, 6, 20));
  });
  it('late at night tonight still runs 2 hours', () => {
    const w = tonightWindow(at(2026, 10, 6, 21, 40));
    expect(w.start).toEqual(at(2026, 10, 6, 22));
    expect(w.end).toEqual(at(2026, 10, 7, 0));
  });
  it('the weekend chip is the coming Saturday, or Sunday on a Saturday', () => {
    expect(weekendChip(NOW)).toEqual({ label: 'Sat evening', window: { start: at(2026, 10, 10, 18), end: at(2026, 10, 10, 22) } });
    expect(weekendChip(at(2026, 10, 10, 9)).label).toBe('Sun evening');
    expect(weekendChip(at(2026, 10, 10, 9)).window.start).toEqual(at(2026, 10, 11, 18));
    expect(weekendChip(at(2026, 10, 11, 9)).window.start).toEqual(at(2026, 10, 17, 18));
  });
  it('reads a picked day and times, past midnight too', () => {
    expect(windowFrom('2026-10-10', '6:00 PM', '10:00 PM')).toEqual({ start: at(2026, 10, 10, 18), end: at(2026, 10, 10, 22) });
    expect(windowFrom('2026-10-10', '9:00 PM', '1:00 AM')?.end).toEqual(at(2026, 10, 11, 1));
    expect(windowFrom('2026-10-10', 'soon', '1:00 AM')).toBeNull();
  });
  it('labels the window like P42', () => {
    expect(windowLabel({ start: at(2026, 10, 10, 18), end: at(2026, 10, 10, 22) })).toBe('Sat, Oct 10 · 6:00 – 10:00 PM');
    expect(windowLabel({ start: at(2026, 10, 10, 10), end: at(2026, 10, 10, 14, 30) })).toBe('Sat, Oct 10 · 10:00 AM – 2:30 PM');
  });
});

describe('pool status', () => {
  const tonight = tonightWindow(NOW);
  it('needs to sign comes first', () => {
    expect(poolStatus({ ...base, linkStatus: 'needs_consent' }, tonight).state).toBe('needs_sign');
  });
  it('on shift now (P54 only)', () => {
    const p = { ...base, shifts: [shift(at(2026, 10, 6, 12), at(2026, 10, 6, 16), 'active')] };
    expect(poolStatus(p, tonight, { onShiftNow: true }).state).toBe('on_shift');
    expect(poolStatus(p, tonight).state).toBe('free');
  });
  it('free when her hours cover the window', () => {
    expect(poolStatus(base, tonight)).toEqual({ state: 'free' });
    expect(tabLabel(poolStatus(base, tonight), tonight)).toEqual({ label: 'Free tonight', dot: 'free' });
  });
  it('partly free', () => {
    const p = { ...base, hours: [{ weekday: 2, starts: '15:00:00', ends: '21:00:00' }] };
    const s = poolStatus(p, tonight);
    expect(s.state).toBe('partly');
    expect(tabLabel(s, tonight).label).toBe('Until 9 PM');
    expect(poolRow(s, tonight, 0)).toMatchObject({ group: 'partly', sub: 'Free until 9:00 PM', pill: 'Until 9 PM' });
    const later = poolStatus({ ...base, hours: [{ weekday: 2, starts: '19:00:00', ends: '23:00:00' }] }, tonight);
    expect(poolRow(later, tonight, 0)).toMatchObject({ sub: 'Free from 7:00 PM', pill: 'From 7 PM' });
    const mid = poolStatus({ ...base, hours: [{ weekday: 2, starts: '19:00:00', ends: '21:00:00' }] }, tonight);
    expect(poolRow(mid, tonight, 0)).toMatchObject({ sub: 'Free 7:00 – 9:00 PM', pill: '7 – 9 PM' });
  });
  it('busy when this family booked her then (cancelled shifts do not count)', () => {
    const p = { ...base, shifts: [shift(at(2026, 10, 6, 19), at(2026, 10, 6, 23))] };
    expect(poolStatus(p, tonight).state).toBe('busy');
    expect(tabLabel(poolStatus(p, tonight), tonight)).toEqual({ label: 'Busy', dot: 'grey' });
    expect(poolStatus({ ...base, shifts: [shift(at(2026, 10, 6, 19), at(2026, 10, 6, 23), 'cancelled')] }, tonight).state).toBe('free');
    expect(poolStatus({ ...base, shifts: [shift(at(2026, 10, 6, 15), at(2026, 10, 6, 18))] }, tonight).state).toBe('free');
  });
  it('away on a day off', () => {
    const p = { ...base, timeOff: [{ starts: '2026-10-05', ends: '2026-10-14' }] };
    const s = poolStatus(p, tonight);
    expect(s).toEqual({ state: 'away', awayUntil: '2026-10-14' });
    expect(poolRow(s, tonight, 3, NOW)).toMatchObject({ group: 'not_free', sub: 'Away until Oct 14', pill: 'Away' });
  });
  it('not free on a day she has no hours, and no hours at all', () => {
    expect(poolStatus({ ...base, hours: [{ weekday: 3, starts: '15:00:00', ends: '22:00:00' }] }, tonight).state).toBe('off');
    expect(poolStatus({ ...base, hours: [] }, tonight).state).toBe('no_hours');
    expect(tabLabel({ state: 'off' }, tonight).label).toBe('Not free');
  });
  it('P42 free row counts shifts with the family', () => {
    expect(poolRow({ state: 'free' }, tonight, 14).sub).toBe('Free all evening · 14 shifts');
    expect(poolRow({ state: 'free' }, tonight, 0).sub).toBe('Free all evening · new to you');
    expect(poolRow({ state: 'free' }, { start: at(2026, 10, 6, 9), end: at(2026, 10, 6, 12) }, 1).sub).toBe('Free the whole time · 1 shift');
  });
  it('book button', () => {
    expect(bookLabel(['Maya'])).toBe('Book Maya');
    expect(bookLabel(['Maya', 'Priya'])).toBe('Book a free sitter');
    expect(bookLabel([])).toBe('Book a shift');
  });
});
