import { describe, expect, it } from '@jest/globals';

import {
  cleanDetails,
  daysLabel,
  detailLabel,
  familyItems,
  formatTime,
  hasDay,
  hasDetails,
  itemLine,
  itemsForShift,
  itemTitle,
  kidDayItems,
  planKidId,
  normalizeCareItem,
  parseAmount,
  parseTime,
  repeatChoices,
  repeatLabel,
  routineSummary,
  scheduleLabel,
  shiftTaskLines,
  shortTime,
  sortItems,
  suggestedLabel,
  suggestedRoutine,
  timeRangeLabel,
  toggleDay,
} from '../care-plan';
import type { CareItem } from '../types';

let n = 0;
function item(p: Partial<CareItem>): CareItem {
  n += 1;
  return { id: `i${n}`, family_id: 'f', kid_id: null, type: 'other', title: '', starts: null, ends: null, days: 127, every_minutes: null, details: {}, how: '', created_at: `2026-10-0${n % 9}T00:00:00Z`, ...p };
}

describe('days', () => {
  it('labels masks', () => {
    expect(daysLabel(127)).toBe('Every day');
    expect(daysLabel(62)).toBe('Weekdays');
    expect(daysLabel(65)).toBe('Weekends');
    expect(daysLabel(16)).toBe('Thursdays');
    expect(daysLabel(2 | 8)).toBe('Mon, Wed');
    expect(daysLabel(1 | 2 | 8)).toBe('Mon, Wed, Sun');
    expect(daysLabel(0)).toBe('No days');
  });
  it('toggles days', () => {
    expect(toggleDay(127, 0)).toBe(126);
    expect(toggleDay(0, 4)).toBe(16);
    expect(hasDay(62, 1)).toBe(true);
    expect(hasDay(62, 0)).toBe(false);
  });
});

describe('times', () => {
  it('words a read-only item’s time (P20v)', () => {
    expect(timeRangeLabel('15:30:00', '16:00:00')).toBe('3:30 – 4:00 PM');
    expect(timeRangeLabel('11:30:00', '13:00:00')).toBe('11:30 AM – 1:00 PM');
    expect(timeRangeLabel('19:00:00', null)).toBe('7:00 PM');
    expect(timeRangeLabel(null, '20:00:00')).toBe('Until 8:00 PM');
    expect(timeRangeLabel(null, null)).toBe('Any time');
  });
  it('parses what parents type', () => {
    expect(parseTime('7:00 PM')).toBe('19:00');
    expect(parseTime('7pm')).toBe('19:00');
    expect(parseTime('12:30 am')).toBe('00:30');
    expect(parseTime('15:15')).toBe('15:15');
    expect(parseTime('9')).toBe('09:00');
    expect(parseTime('13 PM')).toBeNull();
    expect(parseTime('7:75')).toBeNull();
    expect(parseTime('')).toBeNull();
  });
  it('formats like the wireframes', () => {
    expect(formatTime('19:00:00')).toBe('7:00 PM');
    expect(formatTime('09:30:00')).toBe('9:30 AM');
    expect(formatTime('12:00:00')).toBe('12:00 PM');
    expect(formatTime(null)).toBe('');
    expect(shortTime('15:15:00')).toBe('3:15');
    expect(shortTime('00:05:00')).toBe('12:05');
  });
});

describe('items', () => {
  it('names untitled items by type', () => {
    expect(itemTitle({ title: '', type: 'bedtime' })).toBe('Bedtime');
    expect(itemTitle({ title: 'Pick up Ava', type: 'activity' })).toBe('Pick up Ava');
  });
  it('sorts timed items first', () => {
    const a = item({ title: 'a', starts: '19:00:00' });
    const b = item({ title: 'b' });
    const c = item({ title: 'c', starts: '08:00:00' });
    expect(sortItems([a, b, c]).map((i) => i.title)).toEqual(['c', 'a', 'b']);
  });
  it('summarizes a kid’s day', () => {
    const items = [
      item({ type: 'nap', starts: '13:00:00', ends: '15:00:00' }),
      item({ type: 'bedtime', starts: '19:30:00' }),
      item({ type: 'activity', title: 'Soccer', starts: '16:30:00', days: 16 }),
      item({ type: 'meal' }),
    ];
    expect(routineSummary(items)).toBe('Nap 1–3 · Soccer Thu 4:30 · Bedtime 7:30');
  });
});

describe('booking', () => {
  // Thu Oct 8, 2026, 3:00-7:00 PM
  const start = new Date(2026, 9, 8, 15, 0);
  const end = new Date(2026, 9, 8, 19, 0);
  const pickup = item({ type: 'activity', title: 'Pick up Ava', starts: '15:15:00', days: 62 });
  const soccer = item({ type: 'activity', title: 'Leave for soccer', starts: '16:10:00', days: 16 });
  const tuesday = item({ type: 'activity', title: 'Piano', starts: '16:00:00', days: 4 });
  const late = item({ type: 'bedtime', starts: '20:00:00' });
  const untimed = item({ type: 'meal', title: 'Snack' });
  const nap = item({ type: 'nap', kid_id: 'mia', starts: '15:30:00' });
  const all = [late, untimed, soccer, tuesday, pickup, nap];

  it('keeps items on that weekday inside the window', () => {
    expect(itemsForShift(all, start, end).map((x) => x.item.title || x.item.type)).toEqual(['Pick up Ava', 'nap', 'Leave for soccer']);
  });
  it('skips kids not on the shift', () => {
    expect(itemsForShift(all, start, end, ['leo']).map((x) => x.item.title)).toEqual(['Pick up Ava', 'Leave for soccer']);
  });
  it('covers overnight shifts', () => {
    const wake = item({ type: 'other', title: 'Wake up', starts: '07:00:00' });
    const r = itemsForShift([late, wake], new Date(2026, 9, 8, 18, 0), new Date(2026, 9, 9, 8, 0));
    expect(r.map((x) => x.at.getDate())).toEqual([8, 9]);
  });
  it('writes task lines', () => {
    expect(shiftTaskLines(all, start, end, [], (id) => (id === 'mia' ? 'Mia' : undefined))).toEqual(['3:15 Pick up Ava', '3:30 Nap · Mia', '4:10 Leave for soccer']);
  });
});

describe('repeats', () => {
  it('labels intervals', () => {
    expect(repeatLabel(60)).toBe('Every 1 hr');
    expect(repeatLabel(120)).toBe('Every 2 hrs');
    expect(repeatLabel(180)).toBe('Every 3 hrs');
    expect(repeatLabel(90)).toBe('Every 90 min');
    expect(repeatLabel(null)).toBe('');
  });
  it('writes the days sub-line', () => {
    expect(scheduleLabel({ days: 127, every_minutes: 180 })).toBe('Every 3 hrs');
    expect(scheduleLabel({ days: 62, every_minutes: 120 })).toBe('Every 2 hrs · Weekdays');
    expect(scheduleLabel({ days: 62, every_minutes: null })).toBe('Weekdays');
  });
  it('summarizes repeats', () => {
    const items = [item({ type: 'bottle', title: 'Bottle', starts: '12:00:00', every_minutes: 180 }), item({ type: 'bedtime', starts: '19:30:00' })];
    expect(routineSummary(items)).toBe('Bottle every 3 hrs · Bedtime 7:30');
  });

  // Thu Oct 8, 2026, 11:00 AM-7:00 PM
  const start = new Date(2026, 9, 8, 11, 0);
  const end = new Date(2026, 9, 8, 19, 0);
  const hours = (r: { at: Date }[]) => r.map((x) => `${x.at.getDate()} ${x.at.getHours()}:${String(x.at.getMinutes()).padStart(2, '0')}`);

  it('expands from the start time to the shift end', () => {
    const bottle = item({ type: 'bottle', title: 'Bottle', kid_id: 'mia', starts: '12:00:00', every_minutes: 180 });
    expect(hours(itemsForShift([bottle], start, end))).toEqual(['8 12:00', '8 15:00', '8 18:00']);
    expect(shiftTaskLines([bottle], start, end, [], () => 'Mia')).toEqual(['12:00 Bottle · Mia', '3:00 Bottle · Mia', '6:00 Bottle · Mia']);
  });
  it('stops at its end time', () => {
    const b = item({ title: 'Check', starts: '09:00:00', ends: '15:00:00', every_minutes: 120 });
    expect(hours(itemsForShift([b], start, end))).toEqual(['8 11:00', '8 13:00', '8 15:00']);
  });
  it('starts at the shift start without a start time', () => {
    const diaper = item({ type: 'diaper', title: 'Diaper check', every_minutes: 120 });
    expect(hours(itemsForShift([diaper], start, end))).toEqual(['8 11:00', '8 13:00', '8 15:00', '8 17:00', '8 19:00']);
    const until = item({ title: 'Diaper check', ends: '14:00:00', every_minutes: 90 });
    expect(hours(itemsForShift([until], start, end))).toEqual(['8 11:00', '8 12:30', '8 14:00']);
  });
  it('skips days it is off', () => {
    const weekend = item({ title: 'Check', starts: '12:00:00', every_minutes: 120, days: 65 });
    const weekendUntimed = item({ title: 'Check', every_minutes: 120, days: 65 });
    expect(itemsForShift([weekend, weekendUntimed], start, end)).toEqual([]);
  });
  it('runs overnight without doubling up', () => {
    const night = item({ title: 'Check', starts: '20:00:00', every_minutes: 180 });
    const r = itemsForShift([night], new Date(2026, 9, 8, 18, 0), new Date(2026, 9, 9, 22, 0));
    expect(hours(r)).toEqual(['8 20:00', '8 23:00', '9 2:00', '9 5:00', '9 8:00', '9 11:00', '9 14:00', '9 17:00', '9 20:00']);
    const lateStart = itemsForShift([night], new Date(2026, 9, 9, 0, 0), new Date(2026, 9, 9, 6, 0));
    expect(hours(lateStart)).toEqual(['9 2:00', '9 5:00']);
    const capped = item({ title: 'Check', starts: '20:00:00', ends: '02:00:00', every_minutes: 180 });
    expect(hours(itemsForShift([capped], new Date(2026, 9, 8, 18, 0), new Date(2026, 9, 9, 8, 0)))).toEqual(['8 20:00', '8 23:00', '9 2:00']);
  });
});

describe('suggestions', () => {
  it('suggests by age', () => {
    expect(suggestedRoutine(6).map((s) => s.title)).toEqual(['Morning nap', 'Bottle', 'Afternoon nap', 'Diaper check', 'Bedtime']);
    expect(suggestedRoutine(6).find((s) => s.title === 'Bottle')?.every_minutes).toBe(180);
    expect(suggestedRoutine(6).find((s) => s.title === 'Diaper check')?.every_minutes).toBe(120);
    expect(suggestedRoutine(30).some((s) => s.type === 'nap')).toBe(true);
    expect(suggestedRoutine(80).map((s) => s.title)).toContain('Bath');
    expect(suggestedRoutine(null).length).toBeGreaterThan(0);
  });
  it('labels the segment', () => {
    expect(suggestedLabel(14)).toBe('Suggested for age 1');
    expect(suggestedLabel(50)).toBe('Suggested for age 4');
    expect(suggestedLabel(5)).toBe('Suggested for babies');
    expect(suggestedLabel(null)).toBe('Suggested');
  });
});

describe('per-type extras', () => {
  it('writes the task line', () => {
    expect(itemLine(item({ type: 'bottle', details: { amount: 4, unit: 'oz', milk: 'formula' } }))).toBe('Bottle · 4 oz formula');
    expect(itemLine(item({ type: 'bottle', details: { amount: 120, unit: 'ml', milk: 'breast milk' } }))).toBe('Bottle · 120 ml breast milk');
    expect(itemLine(item({ type: 'bottle', details: { amount: 4.5 } }))).toBe('Bottle · 4.5 oz');
    // Saved before the Unit dropdown.
    expect(itemLine(item({ type: 'bottle', details: { amount_oz: 4, milk: 'formula' } }))).toBe('Bottle · 4 oz formula');
    expect(itemLine(item({ type: 'bottle', details: { milk: 'breast milk' } }))).toBe('Bottle · breast milk');
    expect(itemLine(item({ type: 'bottle' }))).toBe('Bottle');
    expect(itemLine(item({ type: 'medicine', title: 'Tylenol', details: { dose: '5 ml' } }))).toBe('Tylenol · 5 ml');
    expect(itemLine(item({ type: 'medicine', details: { dose: '5 ml' } }))).toBe('Medicine · 5 ml');
    expect(itemLine(item({ type: 'diaper' }))).toBe('Diaper check');
    expect(itemLine(item({ type: 'diaper', title: 'Diaper check', details: { potty: true } }))).toBe('Potty break');
    expect(itemLine(item({ type: 'other', title: 'Pick up Ava' }))).toBe('Pick up Ava');
  });
  it('ignores keys of other types', () => {
    expect(detailLabel(item({ type: 'meal', title: 'Lunch', details: { amount: 4, unit: 'ml', dose: '5 ml' } }))).toBe('');
    expect(itemLine(item({ type: 'medicine', title: 'Tylenol', details: { amount_oz: 4 } }))).toBe('Tylenol');
  });
  it('keeps only the type’s own keys', () => {
    const all = { amount: 120, unit: 'ml' as const, milk: 'formula' as const, potty: true, dose: ' 5 ml ' };
    expect(cleanDetails('bottle', all)).toEqual({ amount: 120, unit: 'ml', milk: 'formula' });
    expect(cleanDetails('diaper', all)).toEqual({ potty: true });
    expect(cleanDetails('diaper', { potty: false })).toEqual({});
    expect(cleanDetails('medicine', all)).toEqual({ dose: '5 ml' });
    expect(cleanDetails('nap', all)).toEqual({});
    expect(cleanDetails('bottle', { amount_oz: 0, milk: 'juice' as never })).toEqual({});
    // The unit only goes with an amount; an amount without a unit is ounces; amount_oz becomes amount + oz.
    expect(cleanDetails('bottle', { unit: 'ml', milk: 'formula' })).toEqual({ milk: 'formula' });
    expect(cleanDetails('bottle', { amount: 0, unit: 'ml' })).toEqual({});
    expect(cleanDetails('bottle', { amount: 4 })).toEqual({ amount: 4, unit: 'oz' });
    expect(cleanDetails('bottle', { amount: 4, unit: 'cups' as never })).toEqual({ amount: 4, unit: 'oz' });
    expect(cleanDetails('bottle', { amount_oz: 5, milk: 'whole milk' })).toEqual({ amount: 5, unit: 'oz', milk: 'whole milk' });
    expect(cleanDetails('bottle', { amount: 90, unit: 'ml', amount_oz: 4 })).toEqual({ amount: 90, unit: 'ml' });
    expect(hasDetails({})).toBe(false);
    expect(hasDetails({ potty: true })).toBe(true);
  });
  it('reads rows from before migration 08', () => {
    const { every_minutes: _e, details: _d, ...old } = item({ type: 'bottle' });
    const r = normalizeCareItem(old);
    expect(r.every_minutes).toBeNull();
    expect(r.details).toEqual({});
    expect(normalizeCareItem({ ...old, details: null }).details).toEqual({});
  });
  it('reads bottles saved before the Unit dropdown', () => {
    const { every_minutes: _e, details: _d, ...old } = item({ type: 'bottle' });
    expect(normalizeCareItem({ ...old, details: { amount_oz: 4, milk: 'formula' } }).details).toEqual({ amount: 4, unit: 'oz', milk: 'formula' });
    expect(normalizeCareItem({ ...old, details: { amount: 120, unit: 'ml', amount_oz: 4 } }).details).toEqual({ amount: 120, unit: 'ml' });
    expect(normalizeCareItem({ ...old, details: { amount: 6, unit: 'oz' } }).details).toEqual({ amount: 6, unit: 'oz' });
  });
  it('parses the amount in its unit', () => {
    expect(parseAmount('4')).toBe(4);
    expect(parseAmount(' 4,5 ', 'oz')).toBe(4.5);
    expect(parseAmount('32', 'oz')).toBe(32);
    expect(parseAmount('33', 'oz')).toBeUndefined();
    expect(parseAmount('120', 'oz')).toBeUndefined();
    expect(parseAmount('120', 'ml')).toBe(120);
    expect(parseAmount('1000', 'ml')).toBe(1000);
    expect(parseAmount('1001', 'ml')).toBeUndefined();
    expect(parseAmount('.5', 'oz')).toBe(0.5);
    expect(parseAmount('', 'ml')).toBeNull();
    expect(parseAmount('four')).toBeUndefined();
    expect(parseAmount('0')).toBeUndefined();
    expect(parseAmount('.')).toBeUndefined();
    expect(parseAmount('4.555')).toBeUndefined();
  });
  it('offers How often by type', () => {
    expect(repeatChoices('bottle')).toEqual([null, 120, 180, 240]);
    expect(repeatChoices('diaper')).toEqual([null, 120, 180, 240]);
    expect(repeatChoices('medicine')).toEqual([null, 240, 360, 480]);
    for (const t of ['meal', 'nap', 'bedtime', 'activity', 'other'] as const) expect(repeatChoices(t)).toEqual([]);
  });
  it('puts extras in the summary and booking lines', () => {
    const bottle = item({ type: 'bottle', title: 'Bottle', starts: '12:00:00', every_minutes: 180, details: { amount: 4, unit: 'oz', milk: 'formula' } });
    const med = item({ type: 'medicine', title: 'Tylenol', starts: '16:00:00', details: { dose: '5 ml' } });
    expect(routineSummary([bottle, med])).toBe('Bottle 4 oz formula every 3 hrs · Tylenol 5 ml 4:00');
    const lines = shiftTaskLines([bottle, med], new Date(2026, 9, 8, 15, 0), new Date(2026, 9, 8, 17, 30), [], () => undefined);
    expect(lines).toEqual(['3:00 Bottle · 4 oz formula', '4:00 Tylenol · 5 ml']);
  });
  it('leaves suggestion extras empty', () => {
    expect(suggestedRoutine(6).every((s) => !('details' in s))).toBe(true);
  });
});

describe('care plan split (P7 family to-dos, P20 a kid\'s day)', () => {
  it('reads the kid param, falling back to all', () => {
    const kids = [{ id: 'ava' }, { id: 'leo' }];
    expect(planKidId(kids, 'ava')).toBe('ava');
    expect(planKidId(kids, 'nobody')).toBeNull();
    expect(planKidId(kids, undefined)).toBeNull();
  });
  it('lists only the whole-family items as family to-dos, in time order', () => {
    const fam1 = item({ type: 'activity', starts: '17:30', created_at: '2026-01-01' });
    const fam2 = item({ type: 'meal', starts: '12:00', created_at: '2026-01-02' });
    const ava = item({ type: 'nap', starts: '13:00', created_at: '2026-01-03', kid_id: 'ava' });
    expect(familyItems([fam1, fam2, ava])).toEqual([fam2, fam1]);
  });
  it("puts a kid's day and the family items in one timeline", () => {
    const t = (starts: string | null, created_at: string, kid_id: string | null = null) => item({ type: 'nap', starts, created_at, kid_id });
    const fam = t('16:00', '2026-01-01');
    const avaLate = t('19:30', '2026-01-02', 'ava');
    const avaEarly = t('13:00', '2026-01-03', 'ava');
    const leo = t('12:00', '2026-01-04', 'leo');
    const anyTime = t(null, '2026-01-05', 'ava');
    expect(kidDayItems([fam, avaLate, avaEarly, leo, anyTime], 'ava')).toEqual([avaEarly, fam, avaLate, anyTime]);
  });
});
