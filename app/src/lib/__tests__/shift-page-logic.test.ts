import { describe, expect, it } from '@jest/globals';

import { canReportLate, clockInButton, clockInOpensLabel, clockInStep, daysBetween, shiftDayLabel, spanLabel } from '../shift-page-logic';
import type { Shift } from '../types';

// Local times, so the labels read the same in any time zone.
const at = (d: number, h: number, m = 0) => new Date(2026, 9, d, h, m);
const shift = (starts: Date, ends: Date, status: Shift['status'] = 'scheduled'): Pick<Shift, 'status' | 'starts_at' | 'ends_at'> => ({
  status,
  starts_at: starts.toISOString(),
  ends_at: ends.toISOString(),
});

// Thu Oct 8, 2026
const today = shift(at(8, 15), at(8, 19));
const saturday = shift(at(10, 10), at(10, 14));

describe('spanLabel', () => {
  it('writes the shared PM once, with zeros on the Today card', () => {
    expect(spanLabel(at(8, 15), at(8, 19), true)).toBe('3:00 – 7:00 PM');
  });
  it('drops :00 elsewhere', () => {
    expect(spanLabel(at(8, 19, 30), at(8, 22))).toBe('7:30 – 10 PM');
  });
  it('keeps both halves when AM turns into PM', () => {
    expect(spanLabel(at(10, 10), at(10, 14))).toBe('10 AM – 2 PM');
  });
});

describe('shiftDayLabel', () => {
  it('reads Today, Tomorrow, then the weekday, then MM/DD', () => {
    expect(shiftDayLabel(at(8, 15), at(8, 9))).toBe('Today');
    expect(shiftDayLabel(at(9, 15), at(8, 9))).toBe('Tomorrow');
    expect(shiftDayLabel(at(10, 10), at(8, 9))).toBe('Sat');
    expect(shiftDayLabel(at(20, 10), at(8, 9))).toBe('10/20');
  });
  it('counts calendar days, not 24-hour blocks', () => {
    expect(daysBetween(at(8, 23), at(9, 1))).toBe(1);
  });
});

describe('clockInOpensLabel', () => {
  it('says the time today', () => {
    expect(clockInOpensLabel(at(8, 14, 45), at(8, 12))).toBe('Clock in opens at 2:45 PM');
  });
  it('says the day for a later shift', () => {
    expect(clockInOpensLabel(at(10, 9, 45), at(8, 12))).toBe('Clock in opens on Sat at 9:45 AM');
    expect(clockInOpensLabel(at(9, 9, 45), at(8, 12))).toBe('Clock in opens on Fri at 9:45 AM');
  });
});

describe('clockInButton', () => {
  it('is disabled until 15 minutes before the start', () => {
    expect(clockInButton(today, at(8, 14, 30))).toEqual({ kind: 'too_early', line: 'Clock in opens at 2:45 PM' });
    expect(clockInButton(saturday, at(8, 14, 30))).toEqual({ kind: 'too_early', line: 'Clock in opens on Sat at 9:45 AM' });
  });
  it('opens at 2:45 for a 3:00 shift and stays open until the end', () => {
    expect(clockInButton(today, at(8, 14, 45)).kind).toBe('open');
    expect(clockInButton(today, at(8, 18, 59)).kind).toBe('open');
  });
  it('closes once the shift time has passed', () => {
    expect(clockInButton(today, at(8, 19, 1)).kind).toBe('ended');
  });
  it('is not shown for active, completed or cancelled shifts', () => {
    for (const s of ['active', 'completed', 'cancelled'] as const) expect(clockInButton({ ...today, status: s }, at(8, 15)).kind).toBe('none');
  });
});

describe('clockInStep', () => {
  it('asks for the house rules first, then the home zone', () => {
    expect(clockInStep({ rulesDue: true, away: true })).toBe('rules');
    expect(clockInStep({ rulesDue: false, away: true })).toBe('away');
    expect(clockInStep({ rulesDue: false, away: false })).toBe('clock_in');
  });
});

describe('canReportLate', () => {
  it('shows Running late before the shift and while clock-in is open', () => {
    expect(canReportLate(saturday, at(8, 12))).toBe(true);
    expect(canReportLate(today, at(8, 15, 10))).toBe(true);
  });
  it('hides it once the shift has passed or started', () => {
    expect(canReportLate(today, at(8, 20))).toBe(false);
    expect(canReportLate({ ...today, status: 'active' }, at(8, 15, 10))).toBe(false);
  });
});
