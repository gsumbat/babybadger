import { describe, expect, it } from '@jest/globals';

import { amountChoices, bottleDetail, bottleLog, bottleTaskDetails, bottleTaskKid, bottleTaskTitle, convertAmount, isBottleTask, loggedAt, plannedEvery, planBottle, planLine, snapAmount } from '../bottle';
import { describeLog } from '../shift-logic';
import type { CareItem } from '../types';

const kids = [
  { id: 'mia', name: 'Mia' },
  { id: 'leo', name: 'Leo' },
];

function item(over: Partial<CareItem>): CareItem {
  return { id: Math.random().toString(36).slice(2), family_id: 'f', kid_id: 'mia', type: 'bottle', title: '', starts: '07:00:00', ends: null, days: 127, every_minutes: null, details: {}, how: '', created_at: '2026-10-01T00:00:00Z', ...over };
}

describe('bottle tasks', () => {
  it('spots a planned bottle line', () => {
    expect(isBottleTask('12:00 Bottle · 4 oz formula · Mia')).toBe(true);
    expect(isBottleTask('3:00 Bottle')).toBe(true);
    expect(isBottleTask('Bottle · 120 ml breast milk')).toBe(true);
    expect(isBottleTask('12:00 Bottles of water for the park')).toBe(false);
    expect(isBottleTask('3:15 Pick up Ava')).toBe(false);
    expect(isBottleTask('Wash the bottle')).toBe(false);
  });
  it('matches the kid by the line’s suffix, else the only kid', () => {
    expect(bottleTaskKid('12:00 Bottle · 4 oz formula · Leo', kids)).toBe('leo');
    expect(bottleTaskKid('12:00 Bottle · 4 oz formula · mia', kids)).toBe('mia');
    expect(bottleTaskKid('12:00 Bottle · 4 oz formula', kids)).toBeNull();
    expect(bottleTaskKid('12:00 Bottle · 4 oz formula', [kids[0]])).toBe('mia');
    expect(bottleTaskKid('12:00 Bottle', [])).toBeNull();
  });
  it('reads the amount and milk from the line, and drops the time from the title', () => {
    expect(bottleTaskDetails('12:00 Bottle · 4.5 oz formula · Mia')).toEqual({ amount: 4.5, unit: 'oz', milk: 'formula' });
    expect(bottleTaskDetails('12:00 Bottle · 120 ml breast milk')).toEqual({ amount: 120, unit: 'ml', milk: 'breast milk' });
    expect(bottleTaskDetails('12:00 Bottle')).toEqual({});
    expect(bottleTaskTitle('12:00 Bottle · 4 oz formula')).toBe('Bottle · 4 oz formula');
  });
});

describe('the plan', () => {
  const every3 = item({ starts: '07:00:00', every_minutes: 180, details: { amount: 4, unit: 'oz', milk: 'formula' } });
  const night = item({ starts: '19:30:00', details: { amount: 6, unit: 'oz' } });
  it('picks the kid’s bottle nearest to the time', () => {
    expect(planBottle([every3, night], 'mia', new Date(2026, 9, 9, 13, 10))).toBe(every3);
    expect(planBottle([every3, night], 'mia', new Date(2026, 9, 9, 20, 0))).toBe(night);
    expect(planBottle([night, every3], 'mia', new Date(2026, 9, 9, 2, 0))).toBe(every3);
    expect(planBottle([every3], 'leo', new Date())).toBeNull();
    expect(planBottle([every3], null, new Date())).toBeNull();
  });
  it('falls back to the first bottle without a time', () => {
    const untimed = item({ starts: null, every_minutes: 180 });
    expect(planBottle([untimed], 'mia', new Date())).toBe(untimed);
  });
  it('words the plan line and the interval', () => {
    expect(planLine(every3)).toBe('4 oz formula, every 3 hrs');
    expect(planLine(night)).toBe('6 oz');
    expect(planLine(item({ every_minutes: 120 }))).toBe('a bottle, every 2 hrs');
    expect(plannedEvery([night, every3], 'mia')).toBe(180);
    expect(plannedEvery([night], 'mia')).toBeNull();
  });
});

describe('amounts', () => {
  it('steps half ounces or 10 ml', () => {
    expect(amountChoices('oz').slice(0, 3)).toEqual([0.5, 1, 1.5]);
    expect(amountChoices('oz').at(-1)).toBe(16);
    expect(amountChoices('ml').slice(0, 2)).toEqual([10, 20]);
    expect(snapAmount(4.3, 'oz')).toBe(4.5);
    expect(convertAmount(4, 'oz', 'ml')).toBe(120);
    expect(convertAmount(120, 'ml', 'oz')).toBe(4);
  });
  it('reads the S5b time as today, or yesterday past midnight', () => {
    const now = new Date(2026, 9, 9, 0, 20);
    expect(loggedAt('12:05 AM', now)).toEqual(new Date(2026, 9, 9, 0, 5));
    expect(loggedAt('11:50 PM', now)).toEqual(new Date(2026, 9, 8, 23, 50));
    expect(loggedAt('nonsense', now)).toBe(now);
  });
});

describe('bottle logs', () => {
  const data = { meal: 'bottle', milk: 'formula', bottle_amount: '4', bottle_unit: 'oz', amount: 'all', what: '4 oz formula' };
  it('reads and describes a bottle log', () => {
    expect(bottleLog({ kind: 'food', data })).toEqual({ milk: 'formula', amount: 4, unit: 'oz', drank: 'all' });
    expect(bottleDetail(bottleLog({ kind: 'food', data })!)).toBe('4 oz formula · drank all');
    expect(describeLog({ kind: 'food', data })).toEqual({ title: 'Bottle', detail: '4 oz formula · drank all' });
    expect(bottleLog({ kind: 'food', data: { meal: 'lunch', what: 'Pasta' } })).toBeNull();
    // An older bottle log (amount typed) keeps the old wording.
    expect(describeLog({ kind: 'food', data: { meal: 'bottle', amount: '4 oz' } })).toEqual({ title: 'Bottle', detail: 'ate 4 oz' });
  });
});
