import { describe, expect, it } from '@jest/globals';

import {
  askable,
  askedRow,
  askLabel,
  askRowSub,
  calendarFit,
  effectiveStatus,
  elapsedShare,
  hiddenNote,
  hoursText,
  kidAge,
  overlapBar,
  parentRowSub,
  requestRowTitle,
  sendLabel,
  shiftNumberText,
  sitterRowSub,
  sitterRowTitle,
  spanText,
  timeLeft,
  toldNote,
  waitingCard,
  type AskedSitter,
} from '../pool-requests-logic';

const at = (y: number, m: number, d: number, h = 0, min = 0) => new Date(y, m - 1, d, h, min);
// Sat Oct 10 2026, 6 – 10 PM.
const W = { start: at(2026, 10, 10, 18), end: at(2026, 10, 10, 22) };
const NOW = at(2026, 10, 6, 15, 49);
const asked = (status: AskedSitter['status'], extra: Partial<AskedSitter> = {}): AskedSitter => ({
  request_id: 'r',
  sitter_id: 's',
  status,
  seen_at: null,
  answered_at: null,
  offer_starts_at: null,
  offer_ends_at: null,
  created_at: at(2026, 10, 6, 15, 41).toISOString(),
  ...extra,
});

describe('request status and time left', () => {
  it('an open request past its expiry is expired', () => {
    expect(effectiveStatus({ status: 'open', expires_at: at(2026, 10, 6, 15).toISOString() }, NOW)).toBe('expired');
    expect(effectiveStatus({ status: 'open', expires_at: at(2026, 10, 7).toISOString() }, NOW)).toBe('open');
    expect(effectiveStatus({ status: 'filled', expires_at: at(2026, 10, 6, 15).toISOString() }, NOW)).toBe('filled');
  });
  it('time left reads like P46 and the S33 pill', () => {
    const exp = new Date(+NOW + (11 * 60 + 52) * 60_000 + 30_000);
    expect(timeLeft(exp, NOW)).toBe('11 h 52 m left');
    expect(timeLeft(exp, NOW, true)).toBe('11 h left');
    expect(timeLeft(new Date(+NOW + 45 * 60_000), NOW)).toBe('45 m left');
    expect(timeLeft(new Date(+NOW + 2 * 3600_000), NOW)).toBe('2 h left');
    expect(timeLeft(new Date(+NOW - 1), NOW)).toBe('Expired');
  });
  it('the bar fills as time goes by', () => {
    const c = at(2026, 10, 6, 12).toISOString();
    const e = at(2026, 10, 7, 0).toISOString();
    expect(elapsedShare(c, e, at(2026, 10, 6, 18))).toBeCloseTo(0.5);
    expect(elapsedShare(c, e, at(2026, 10, 8))).toBe(1);
    expect(elapsedShare(c, e, at(2026, 10, 6))).toBe(0);
  });
});

describe('P42 / P45 asking', () => {
  it('main button', () => {
    expect(askLabel(['Maya'])).toBe('Ask Maya');
    expect(askLabel(['Maya', 'Priya'])).toBe('Ask both free sitters');
    expect(askLabel(['Maya', 'Priya', 'Jo'])).toBe('Ask 3 free sitters');
    expect(askLabel([])).toBeNull();
  });
  it('free and partly free are listed; the rest are hidden', () => {
    expect(askable({ state: 'free' })).toBe('free');
    expect(askable({ state: 'partly', freeFrom: W.start, freeTo: at(2026, 10, 10, 21) })).toBe('partly');
    expect(askable({ state: 'busy' })).toBeNull();
    expect(askable({ state: 'away', awayUntil: '2026-10-14' })).toBeNull();
    expect(hiddenNote(2)).toBe('2 sitters who aren’t free are hidden.');
    expect(hiddenNote(1)).toBe('1 sitter who isn’t free is hidden.');
    expect(hiddenNote(0)).toBe('');
  });
  it('row lines', () => {
    expect(askRowSub({ state: 'free' }, W)).toBe('Free all evening');
    expect(askRowSub({ state: 'free' }, { start: at(2026, 10, 10, 9), end: at(2026, 10, 10, 12) })).toBe('Free the whole time');
    expect(askRowSub({ state: 'partly', freeFrom: W.start, freeTo: at(2026, 10, 10, 21) }, W)).toBe('Only free until 9:00 PM');
    expect(askRowSub({ state: 'partly', freeFrom: at(2026, 10, 10, 19), freeTo: W.end }, W)).toBe('Only free from 7:00 PM');
    expect(sendLabel(2)).toBe('Send to 2 sitters');
    expect(sendLabel(1)).toBe('Send to 1 sitter');
  });
});

describe('P46 rows and card', () => {
  it('each answer has its line and pill', () => {
    expect(askedRow(asked('sent'), NOW)).toEqual({ sub: 'Delivered 3:41 PM', pill: 'Sent', kind: 'muted' });
    expect(askedRow(asked('seen', { seen_at: new Date(+NOW - 2 * 60_000).toISOString() }), NOW)).toEqual({ sub: 'Seen 2 min ago', pill: 'Seen', kind: 'primary' });
    expect(askedRow(asked('offered', { offer_starts_at: W.start.toISOString(), offer_ends_at: at(2026, 10, 10, 19).toISOString() }), NOW).sub).toBe('Can do 6:00 – 7:00 PM only');
    expect(askedRow(asked('declined'), NOW).pill).toBe('Declined');
  });
  it('waiting card', () => {
    const exp = new Date(+NOW + (11 * 60 + 52) * 60_000 + 30_000).toISOString();
    expect(waitingCard({ first_to_accept: true, expires_at: exp }, [asked('sent'), asked('seen')], NOW)).toEqual({ title: 'Waiting on 2 sitters', sub: 'First to accept gets it · 11 h 52 m left' });
    expect(waitingCard({ first_to_accept: false, expires_at: exp }, [asked('seen'), asked('declined')], NOW).title).toBe('Waiting on 1 sitter');
    expect(waitingCard({ first_to_accept: true, expires_at: exp }, [asked('declined')], NOW).title).toBe('No one is left to answer');
  });
  it('Home rows', () => {
    expect(requestRowTitle(W)).toBe('Sat 6–10 PM request');
    expect(requestRowTitle({ start: at(2026, 10, 10, 11), end: at(2026, 10, 10, 14, 30) })).toBe('Sat 11 AM–2:30 PM request');
    expect(sitterRowTitle('The Lee family', W)).toBe('Lee family asks for Sat 6 – 10 PM');
    expect(sitterRowSub({ kind: 'fits' }, '11 h left')).toBe('Fits your calendar · 11 h left');
    expect(parentRowSub([{ ...asked('sent'), name: 'Maya' }])).toBe('Waiting for Maya to answer');
    expect(parentRowSub([{ ...asked('sent'), name: 'Maya' }, { ...asked('seen'), name: 'Priya' }])).toBe('Waiting on 2 sitters');
    expect(parentRowSub([{ ...asked('offered', { offer_starts_at: W.start.toISOString(), offer_ends_at: at(2026, 10, 10, 19).toISOString() }), name: 'Maya' }])).toBe('Maya offered 6 – 7 PM');
    expect(parentRowSub([{ ...asked('accepted'), name: 'Priya' }])).toBe('Priya can take it');
  });
});

describe('S33 / S20 calendar fit', () => {
  it('fits when nothing else is on', () => {
    expect(calendarFit(W, [], [])).toEqual({ kind: 'fits' });
  });
  it('another shift that overlaps', () => {
    const s = { family_id: 'f2', status: 'scheduled', starts_at: at(2026, 10, 10, 17).toISOString(), ends_at: at(2026, 10, 10, 19).toISOString() };
    expect(calendarFit(W, [], [s]).kind).toBe('shift');
    expect(calendarFit(W, [], [{ ...s, status: 'cancelled' }]).kind).toBe('fits');
  });
  it('a whole day off leaves nothing to offer', () => {
    const f = calendarFit(W, [{ starts: '2026-10-09', ends: '2026-10-11' }], []);
    expect(f.kind).toBe('time_off');
    if (f.kind !== 'time_off') return;
    expect(f.offer).toBeNull();
    expect(f.off).toEqual(W);
    expect(f.clear).toEqual({ from: '2026-10-10', to: '2026-10-10' });
  });
  it('a window past midnight into a day off offers the evening before', () => {
    const late = { start: at(2026, 10, 10, 20), end: at(2026, 10, 11, 2) };
    const f = calendarFit(late, [{ starts: '2026-10-11', ends: '2026-10-11' }], []);
    if (f.kind !== 'time_off') throw new Error('expected time off');
    expect(f.offer).toEqual({ start: at(2026, 10, 10, 20), end: at(2026, 10, 11) });
    expect(f.clear).toEqual({ from: '2026-10-11', to: '2026-10-11' });
    expect(overlapBar(late, f.off).map((p) => [p.kind, p.grow, p.label])).toEqual([
      ['free', 4, '8'],
      ['off', 2, 'You’re off 12–2'],
    ]);
  });
});

describe('words', () => {
  it('hours, kids, spans', () => {
    expect(hoursText(W)).toBe('4 hrs');
    expect(hoursText({ start: W.start, end: at(2026, 10, 10, 19) })).toBe('1 hr');
    expect(hoursText({ start: W.start, end: at(2026, 10, 10, 22, 30) })).toBe('4.5 hrs');
    expect(kidAge('Ava', '2019-03-01', NOW)).toBe('Ava, 7');
    expect(kidAge('Mia', '2025-04-01', NOW)).toBe('Mia, 18 mo');
    expect(kidAge('Leo', null, NOW)).toBe('Leo');
    expect(spanText(W.start, W.end)).toBe('6:00 – 10:00 PM');
    expect(spanText(at(2026, 10, 10, 11), W.start)).toBe('11:00 AM – 6:00 PM');
  });
  it('P47', () => {
    expect(toldNote(['Maya'])).toBe('Maya was told the shift is filled. Nothing for her to do.');
    expect(toldNote(['Maya', 'Jo'])).toBe('Maya and Jo were told the shift is filled. Nothing for them to do.');
    expect(toldNote([])).toBe('');
    expect(shiftNumberText(1)).toBe('First shift with your family');
    expect(shiftNumberText(2)).toBe('2nd shift with your family');
    expect(shiftNumberText(11)).toBe('11th shift with your family');
    expect(shiftNumberText(23)).toBe('23rd shift with your family');
  });
});
