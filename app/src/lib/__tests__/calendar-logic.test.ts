import { describe, expect, it, jest } from '@jest/globals';

import { availabilitySummary, fromDayHours, hoursLabel, namesLabel, toDayHours, upcomingTimeOff } from '../availability';
import { addMonths, bookingSlot, dayKey, dayTitle, dayWindow, familyColor, FAMILY_COLORS, formatHours, hoursOf, inRanges, monthGrid, rangeLabel, shiftsOn, weekOf, weekTitle } from '../calendar-logic';
import type { Shift } from '../types';

// availability.ts talks to Supabase; these tests only use its pure helpers (jest hoists this above the imports).
jest.mock('../supabase', () => ({ supabase: {} }));

const at = (y: number, m: number, d: number, h = 0, min = 0) => new Date(y, m - 1, d, h, min);
const shift = (start: Date, end: Date, extra: Partial<Shift> = {}): Shift => ({
  id: String(+start), family_id: 'f', sitter_id: 'm', note: '', status: 'scheduled', clock_in_at: null, clock_out_at: null,
  starts_at: start.toISOString(), ends_at: end.toISOString(), ...extra,
});

describe('weeks and months', () => {
  it('starts weeks on Monday', () => {
    const w = weekOf(at(2026, 10, 1)); // Thursday
    expect(dayKey(w[0])).toBe('2026-09-28');
    expect(dayKey(w[6])).toBe('2026-10-04');
    expect(weekTitle(w)).toBe('Sep 28 – Oct 4');
    expect(weekTitle(weekOf(at(2026, 10, 7)))).toBe('Oct 5 – 11');
  });
  it('builds the October 2026 grid like P6c (Sep 28 to Nov 1, 5 weeks)', () => {
    const g = monthGrid(at(2026, 10, 15));
    expect(g).toHaveLength(5);
    expect(dayKey(g[0][0])).toBe('2026-09-28');
    expect(dayKey(g[4][6])).toBe('2026-11-01');
  });
  it('clamps the day when moving months', () => {
    expect(dayKey(addMonths(at(2027, 1, 31), 1))).toBe('2027-02-28');
    expect(dayKey(addMonths(at(2026, 10, 1), -1))).toBe('2026-09-01');
  });
});

describe('shifts on a day', () => {
  const a = shift(at(2026, 10, 1, 15), at(2026, 10, 1, 19));
  const b = shift(at(2026, 10, 1, 19, 30), at(2026, 10, 1, 22));
  const c = shift(at(2026, 10, 1, 9), at(2026, 10, 1, 10), { status: 'cancelled' });
  it('leaves out cancelled shifts and sorts by start', () => {
    expect(shiftsOn([b, c, a], at(2026, 10, 1)).map((s) => s.id)).toEqual([a.id, b.id]);
  });
  it('adds up hours (S6a "6.5 hrs booked")', () => {
    expect(formatHours(hoursOf([a, b]))).toBe('6.5');
    expect(formatHours(hoursOf([a]))).toBe('4');
  });
  it('keeps the 2 PM – 10 PM window and widens it for early or late shifts', () => {
    expect(dayWindow([a, b], at(2026, 10, 1))).toEqual({ from: 14, to: 22 });
    expect(dayWindow([shift(at(2026, 10, 1, 8, 30), at(2026, 10, 1, 23, 15))], at(2026, 10, 1))).toEqual({ from: 8, to: 24 });
  });
  it('puts the booking box after the last shift, never in the past', () => {
    const win = { from: 14, to: 22 };
    expect(bookingSlot([a], at(2026, 10, 1), win, at(2026, 10, 1, 16))).toEqual({ from: 19, to: 21 });
    expect(bookingSlot([], at(2026, 10, 2), win, at(2026, 10, 1, 16))).toEqual({ from: 15, to: 17 });
    expect(bookingSlot([], at(2026, 10, 1), win, at(2026, 10, 1, 16, 10))).toEqual({ from: 17, to: 19 });
    expect(bookingSlot([a], at(2026, 9, 30), win, at(2026, 10, 1, 16))).toBeNull();
    expect(bookingSlot([b], at(2026, 10, 1), win, at(2026, 10, 1, 16))).toBeNull();
  });
  it('titles the day (P6a)', () => {
    expect(dayTitle(at(2026, 10, 1), at(2026, 10, 1, 9))).toEqual({ title: 'Today', sub: 'Thursday, October 1' });
    expect(dayTitle(at(2026, 10, 2), at(2026, 10, 1, 9)).title).toBe('Tomorrow');
    expect(dayTitle(at(2026, 10, 5), at(2026, 10, 1, 9))).toEqual({ title: 'Monday', sub: 'October 5' });
  });
});

describe('time off', () => {
  const off = [{ starts: '2026-10-16', ends: '2026-10-18' }];
  it('marks the days inside a range, both ends included', () => {
    expect(inRanges(at(2026, 10, 16), off)).toBe(true);
    expect(inRanges(at(2026, 10, 18), off)).toBe(true);
    expect(inRanges(at(2026, 10, 19), off)).toBe(false);
  });
  it('labels ranges like S11', () => {
    const now = at(2026, 10, 1);
    expect(rangeLabel(off[0], now)).toBe('Oct 16 – 18');
    expect(rangeLabel({ starts: '2026-10-30', ends: '2026-11-02' }, now)).toBe('Oct 30 – Nov 2');
    expect(rangeLabel({ starts: '2026-10-16', ends: '2026-10-16' }, now)).toBe('Oct 16');
    expect(rangeLabel({ starts: '2026-12-30', ends: '2027-01-02' }, now)).toBe('Dec 30 – Jan 2, 2027');
  });
  it('keeps only time off that has not ended, soonest first', () => {
    const list = [{ starts: '2026-11-01', ends: '2026-11-02' }, { starts: '2026-09-01', ends: '2026-09-02' }, ...off];
    expect(upcomingTimeOff(list, '2026-10-01').map((t) => t.starts)).toEqual(['2026-10-16', '2026-11-01']);
  });
});

describe('weekly hours (S11)', () => {
  it('lists Monday first; days without a row are off and borrow saved hours', () => {
    const days = toDayHours([{ weekday: 1, starts: '14:30:00', ends: '22:00:00' }]);
    expect(days.map((d) => d.weekday)).toEqual([1, 2, 3, 4, 5, 6, 0]);
    expect(days[0]).toEqual({ weekday: 1, on: true, starts: '2:30 PM', ends: '10:00 PM' });
    expect(days[1]).toEqual({ weekday: 2, on: false, starts: '2:30 PM', ends: '10:00 PM' });
  });
  it('saves only the days that are on, and refuses an end before the start', () => {
    const days = toDayHours([{ weekday: 1, starts: '14:30:00', ends: '22:00:00' }]);
    expect(fromDayHours(days, 's')).toEqual([{ sitter_id: 's', weekday: 1, starts: '14:30', ends: '22:00' }]);
    expect(fromDayHours([{ weekday: 2, on: true, starts: '9:00 PM', ends: '5:00 PM' }], 's')).toBeNull();
    expect(fromDayHours([{ weekday: 2, on: false, starts: '9:00 PM', ends: '5:00 PM' }], 's')).toEqual([]);
  });
  it('writes the shared AM/PM once', () => {
    expect(hoursLabel('2:30 PM', '10:00 PM')).toBe('2:30 – 10:00 PM');
    expect(hoursLabel('10:00 AM', '11:00 PM')).toBe('10:00 AM – 11:00 PM');
  });
  it('sums the week up for S39', () => {
    const wk = [1, 2, 3, 4, 5].map((weekday) => ({ weekday, starts: '14:00:00' }));
    expect(availabilitySummary(wk)).toBe('Weekdays after 2 PM');
    expect(availabilitySummary([{ weekday: 0, starts: '10:00:00' }, { weekday: 6, starts: '09:30:00' }])).toBe('Weekends');
    expect(availabilitySummary([{ weekday: 1, starts: '14:30:00' }, { weekday: 4, starts: '14:30:00' }])).toBe('Mon, Thu after 2:30 PM');
    expect(availabilitySummary([])).toBe('');
  });
});

describe('labels and colors', () => {
  it('joins kid names', () => {
    expect(namesLabel(['Ava', 'Leo'])).toBe('Ava and Leo');
    expect(namesLabel(['Ava', 'Leo', 'Mia'])).toBe('Ava, Leo and Mia');
    expect(namesLabel([])).toBe('');
  });
  it('colors families in the order the sitter joined them', () => {
    const links = [
      { family_id: 'ortiz', joined_at: '2026-09-10T00:00:00Z' },
      { family_id: 'lee', joined_at: '2026-09-01T00:00:00Z' },
    ];
    expect(familyColor(links, 'lee')).toBe(FAMILY_COLORS[0]);
    expect(familyColor(links, 'ortiz')).toBe(FAMILY_COLORS[1]);
  });
});
