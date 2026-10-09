import { describe, expect, it } from '@jest/globals';

import {
  answerProblems,
  bookingWarning,
  dateAnswer,
  dateClash,
  dayWindows,
  defaultUntil,
  maxUntil,
  MAX_DATES,
  repeatDays,
  repeatSummary,
  sendRequestLabel,
  seriesLine,
  seriesSub,
  seriesTitle,
  seriesWarning,
  sitterSeriesSub,
  sitterSeriesTitle,
  weekdayList,
  type BookingItem,
} from '../booking-logic';
import type { AskedSitter, ShiftRequest } from '../pool-requests-logic';

const at = (y: number, m: number, d: number, h = 0, min = 0) => new Date(y, m - 1, d, h, min);
const key = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
// Mon Oct 12 2026.
const MON = at(2026, 10, 12);

describe('repeat dates (P6e)', () => {
  it('expands the picked weekdays through Until, both ends included', () => {
    const days = repeatDays(MON, [1, 3, 5], '2026-10-23');
    expect(days.map(key)).toEqual(['2026-10-12', '2026-10-14', '2026-10-16', '2026-10-19', '2026-10-21', '2026-10-23']);
  });
  it('starts on the first date even mid-day, and skips weekdays not picked', () => {
    expect(repeatDays(at(2026, 10, 12, 15, 30), [2], '2026-10-27').map(key)).toEqual(['2026-10-13', '2026-10-20', '2026-10-27']);
  });
  it('is empty with no weekdays or an Until before the first date', () => {
    expect(repeatDays(MON, [], '2026-11-12')).toEqual([]);
    expect(repeatDays(MON, [1], '2026-10-01')).toEqual([]);
  });
  it('defaults Until to 4 weeks out and never goes past 6 months or 60 dates', () => {
    expect(defaultUntil(MON)).toBe('2026-11-09');
    expect(maxUntil(MON)).toBe('2027-04-12');
    const all = repeatDays(MON, [0, 1, 2, 3, 4, 5, 6], '2028-01-01');
    expect(all).toHaveLength(MAX_DATES);
    const weekly = repeatDays(MON, [1], '2028-01-01');
    expect(key(weekly[weekly.length - 1])).toBe('2027-04-12');
  });
  it('keeps the same clock time across daylight saving (Nov 1 2026)', () => {
    const ws = dayWindows(repeatDays(at(2026, 10, 30), [5, 6, 0, 1], '2026-11-02'), '3:00 PM', '7:00 PM')!;
    expect(ws).toHaveLength(4);
    for (const w of ws) {
      expect([w.start.getHours(), w.start.getMinutes(), w.end.getHours()]).toEqual([15, 0, 19]);
    }
  });
  it('runs past midnight when the end is earlier, and is null for unreadable times', () => {
    const [w] = dayWindows([MON], '10:00 PM', '2:00 AM')!;
    expect(key(w.end)).toBe('2026-10-13');
    expect(w.end.getHours()).toBe(2);
    expect(dayWindows([MON], 'soon', '2:00 AM')).toBeNull();
  });
  it('summarises the series', () => {
    const days = repeatDays(MON, [1, 3, 5], '2026-11-13');
    expect(days).toHaveLength(15);
    expect(repeatSummary(days)).toEqual({ count: '15 shifts', rest: 'Mon, Wed, Fri · until Nov 13' });
    expect(weekdayList([at(2026, 10, 18), MON])).toBe('Mon, Sun');
    expect(sendRequestLabel(1)).toBe('Send request');
    expect(sendRequestLabel(12)).toBe('Send request for 12 shifts');
  });
});

describe('availability warning (P6g)', () => {
  const W = { start: at(2026, 10, 10, 18), end: at(2026, 10, 10, 22) };
  it('is quiet when she is free or has no hours', () => {
    expect(bookingWarning({ state: 'free' }, W, 'Maya')).toBeNull();
    expect(bookingWarning({ state: 'no_hours' }, W, 'Maya')).toBeNull();
  });
  it('offers the free part when she is partly free', () => {
    const w = bookingWarning({ state: 'partly', freeFrom: W.start, freeTo: at(2026, 10, 10, 19) }, W, 'Maya')!;
    expect(w.title).toBe('Maya is unavailable 7:00 – 10:00 PM');
    expect(w.offer).toEqual({ start: W.start, end: at(2026, 10, 10, 19) });
    expect(bookingWarning({ state: 'partly', freeFrom: at(2026, 10, 10, 19), freeTo: at(2026, 10, 10, 21) }, W, 'Maya')!.title).toBe('Maya is only free 7:00 – 9:00 PM');
  });
  it('says why when she is not free at all', () => {
    expect(bookingWarning({ state: 'away', awayUntil: '2026-10-11' }, W, 'Maya')).toEqual({ title: 'Maya is unavailable 6:00 – 10:00 PM', sub: 'Her time off. You can still ask her.', offer: null });
    expect(bookingWarning({ state: 'busy' }, W, 'Maya')!.sub).toBe('Booked that evening');
    expect(bookingWarning({ state: 'off' }, W, 'Maya')!.sub).toBe('Not her usual hours');
  });
  it('counts the busy dates of a series', () => {
    const ws = dayWindows(repeatDays(MON, [1, 3], '2026-10-21'), '3:00 PM', '7:00 PM')!;
    const s = seriesWarning([{ state: 'free' }, { state: 'busy' }, { state: 'free' }, { state: 'away', awayUntil: '2026-10-21' }], ws, 'Maya')!;
    expect(s.title).toBe('Maya is busy on 2 of 4 dates');
    expect(s.keys).toEqual(['2026-10-14', '2026-10-21']);
    expect(seriesWarning(ws.map(() => ({ state: 'free' as const })), ws, 'Maya')).toBeNull();
  });
});

const req = (id: string, day: number, over: Partial<ShiftRequest> = {}): ShiftRequest => ({
  id,
  family_id: 'f',
  created_by: 'p',
  starts_at: at(2026, 10, day, 15).toISOString(),
  ends_at: at(2026, 10, day, 19).toISOString(),
  kid_ids: [],
  place_id: null,
  note: '',
  first_to_accept: true,
  expires_at: at(2026, 10, day, 15).toISOString(),
  status: 'open',
  shift_id: null,
  filled_by: null,
  created_at: at(2026, 10, 1).toISOString(),
  series_id: 's',
  kind: 'booking',
  ...over,
});
const asked = (id: string, status: AskedSitter['status']): AskedSitter => ({ request_id: id, sitter_id: 'maya', status, seen_at: null, answered_at: null, offer_starts_at: null, offer_ends_at: null, created_at: at(2026, 10, 1).toISOString() });
const NOW = at(2026, 10, 5);

describe('waiting and answers', () => {
  it('parent row and card lines', () => {
    const items: BookingItem[] = [
      { request: req('a', 12), asked: asked('a', 'sent') },
      { request: req('b', 14), asked: asked('b', 'seen') },
    ];
    expect(seriesSub(items, 'Maya', NOW)).toBe('Waiting for Maya');
    const answered: BookingItem[] = [
      { request: req('a', 12, { status: 'filled' }), asked: asked('a', 'accepted') },
      { request: req('b', 14), asked: asked('b', 'declined') },
    ];
    expect(seriesSub(answered, 'Maya', NOW)).toBe('Maya took 1 · can’t make 1');
    expect(dateAnswer(answered[0], NOW)).toEqual({ pill: 'Booked', kind: 'ok' });
    expect(dateAnswer(answered[1], NOW).pill).toBe('Can’t make it');
    expect(dateAnswer({ request: req('c', 3), asked: asked('c', 'sent') }, NOW).pill).toBe('Expired');
  });
  it('sitter lines', () => {
    expect(sitterSeriesTitle('The Lee family', 12, MON)).toBe('Lee family · 12 shifts from Oct 12');
    expect(sitterSeriesSub(0, '2 d left')).toBe('Fits your calendar · 2 d left');
    expect(sitterSeriesSub(2, '2 d left')).toBe('2 dates clash with your calendar · 2 d left');
    expect(seriesTitle('Jen', 12)).toBe('Jen asks you to sit 12 times');
    const ws = dayWindows(repeatDays(MON, [1, 3, 5], '2026-11-13'), '3:00 PM', '7:00 PM')!;
    expect(seriesLine(ws)).toBe('Mon, Wed, Fri · 3:00 – 7:00 PM · Oct 12 – Nov 13');
  });
  it('tags dates that clash with her time off or another shift', () => {
    const w = { start: at(2026, 10, 12, 15), end: at(2026, 10, 12, 19) };
    expect(dateClash(w, [{ starts: '2026-10-12', ends: '2026-10-12' }], [])).toBe('time_off');
    expect(dateClash(w, [], [{ family_id: 'x', status: 'scheduled', starts_at: at(2026, 10, 12, 18).toISOString(), ends_at: at(2026, 10, 12, 20).toISOString() }])).toBe('busy');
    expect(dateClash(w, [], [])).toBeNull();
  });
  it('lists the dates that could not be booked', () => {
    const items: BookingItem[] = [{ request: req('a', 12), asked: asked('a', 'seen') }];
    expect(answerProblems([{ request_id: 'a', result: 'busy' }], items)).toBe('Couldn’t book Mon, Oct 12: you’re already booked then.');
    expect(answerProblems([{ request_id: 'a', result: 'booked' }], items)).toBe('');
  });
});
