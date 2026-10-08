import { describe, expect, it } from '@jest/globals';
import { canEditShiftTasks, lateHomeCard, parentHomeState, taskDueOnShift } from '../shift-logic';
import type { Shift } from '../types';

// P4n: a scheduled shift whose start has passed with no clock-in.
const base: Shift = {
  id: 's1', family_id: 'f', sitter_id: 'm', note: '',
  starts_at: '2026-10-01T19:00:00Z', ends_at: '2026-10-01T23:00:00Z',
  status: 'scheduled', clock_in_at: null, clock_out_at: null,
};
const at = (iso: string) => new Date(iso);

describe('parentHomeState · late', () => {
  it('is still "soon" at the start minute and before it', () => {
    expect(parentHomeState([base], at('2026-10-01T18:59:40Z'))).toMatchObject({ kind: 'soon', minutes: 0 });
    expect(parentHomeState([base], at('2026-10-01T19:00:00Z'))).toMatchObject({ kind: 'soon', minutes: 0 });
  });
  it('turns late once the start time has passed, never "starts in 0 min"', () => {
    expect(parentHomeState([base], at('2026-10-01T19:00:20Z'))).toMatchObject({ kind: 'late', minutesLate: 1 });
    expect(parentHomeState([base], at('2026-10-01T20:36:00Z'))).toMatchObject({ kind: 'late', minutesLate: 96, shift: { id: 's1' } });
  });
  it('stays late until the shift would have ended, then the shift is no longer next', () => {
    expect(parentHomeState([base], at('2026-10-01T22:59:00Z')).kind).toBe('late');
    expect(parentHomeState([base], at('2026-10-01T23:00:01Z'))).toEqual({ kind: 'idle', next: null });
  });
  it('a live shift still wins over a late one', () => {
    const other = { ...base, id: 's2', status: 'active' as const, clock_in_at: '2026-10-01T18:00:00Z' };
    expect(parentHomeState([base, other], at('2026-10-01T19:30:00Z'))).toMatchObject({ kind: 'live', shift: { id: 's2' } });
  });
  it('a late shift comes before a shift that just ended', () => {
    const ended = { ...base, id: 's0', status: 'completed' as const, clock_out_at: '2026-10-01T17:00:00Z' };
    expect(parentHomeState([ended, base], at('2026-10-01T19:10:00Z'))).toMatchObject({ kind: 'late', shift: { id: 's1' } });
  });
  it('ignores cancelled shifts', () => {
    expect(parentHomeState([{ ...base, status: 'cancelled' }], at('2026-10-01T19:30:00Z')).kind).toBe('idle');
  });
});

describe('lateHomeCard', () => {
  const span = '3:00 – 7:00 PM';
  it('without a notice: hasn’t clocked in, how late, the times', () => {
    expect(lateHomeCard('Maya', 96, span)).toEqual({ title: 'Maya hasn’t clocked in', sub: '1 h 36 min late · 3:00 – 7:00 PM' });
    expect(lateHomeCard('Maya', 60, span).sub).toBe('1 h late · 3:00 – 7:00 PM');
    expect(lateHomeCard('Maya', 7, span, { late_minutes: null }).sub).toBe('7 min late · 3:00 – 7:00 PM');
  });
  it('with her "running late" notice: her words instead', () => {
    expect(lateHomeCard('Maya', 6, span, { late_minutes: 15, late_note: 'Traffic on I-275' })).toEqual({ title: 'Maya is running 15 min late', sub: 'Traffic on I-275 · 3:00 – 7:00 PM' });
    expect(lateHomeCard('Maya', 20, span, { late_minutes: 15, late_note: '  ' })).toEqual({ title: 'Maya is running 15 min late', sub: span });
  });
  it('once her estimate (plus 5 min) has passed, back to hasn’t clocked in with what she said', () => {
    expect(lateHomeCard('Maya', 21, span, { late_minutes: 15, late_note: 'Traffic on I-275' })).toEqual({
      title: 'Maya hasn’t clocked in',
      sub: '21 min late · 3:00 – 7:00 PM',
      said: 'Said 15 min late · Traffic on I-275',
    });
    expect(lateHomeCard('Maya', 45, span, { late_minutes: 10 }).said).toBe('Said 10 min late');
  });
});

describe('editing a booked shift’s tasks (P5e)', () => {
  // Local times so the wheel text lines up: Oct 1, 3:00 – 7:00 PM, and an overnight 9 PM – 1 AM.
  const day = { starts_at: new Date(2026, 9, 1, 15, 0).toISOString(), ends_at: new Date(2026, 9, 1, 19, 0).toISOString() };
  const night = { starts_at: new Date(2026, 9, 1, 21, 0).toISOString(), ends_at: new Date(2026, 9, 2, 1, 0).toISOString() };
  it('only upcoming or live shifts', () => {
    const now = new Date(2026, 9, 1, 12, 0);
    expect(canEditShiftTasks({ status: 'scheduled', ends_at: day.ends_at }, now)).toBe(true);
    expect(canEditShiftTasks({ status: 'active', ends_at: day.ends_at }, new Date(2026, 9, 1, 22, 0))).toBe(true);
    expect(canEditShiftTasks({ status: 'scheduled', ends_at: day.ends_at }, new Date(2026, 9, 1, 19, 1))).toBe(false);
    expect(canEditShiftTasks({ status: 'completed', ends_at: day.ends_at }, now)).toBe(false);
    expect(canEditShiftTasks({ status: 'cancelled', ends_at: day.ends_at }, now)).toBe(false);
  });
  it('puts the wheel time on the shift day', () => {
    expect(taskDueOnShift('4:30 PM', day)).toEqual({ ok: true, due: new Date(2026, 9, 1, 16, 30).toISOString() });
    expect(taskDueOnShift('', day)).toEqual({ ok: true, due: null });
    expect(taskDueOnShift('3:00 PM', day)).toMatchObject({ ok: true });
    expect(taskDueOnShift('7:00 PM', day)).toMatchObject({ ok: true });
  });
  it('a time after midnight on an overnight shift is the next morning', () => {
    expect(taskDueOnShift('12:30 AM', night)).toEqual({ ok: true, due: new Date(2026, 9, 2, 0, 30).toISOString() });
  });
  it('refuses times outside the shift', () => {
    expect(taskDueOnShift('8:00 PM', day)).toEqual({ ok: false, error: 'Pick a time during the shift.' });
    expect(taskDueOnShift('10:00 AM', day)).toEqual({ ok: false, error: 'Pick a time during the shift.' });
    expect(taskDueOnShift('soon', day)).toEqual({ ok: false, error: 'Pick a time.' });
  });
});
