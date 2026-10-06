import { describe, expect, it } from '@jest/globals';

import { ageLabel, isoToUS, kidWeek, maskUSDate, parseUSDate, safetyLine, suggestedFoods } from '../kid-profile';

const today = new Date(2026, 9, 5); // Oct 5, 2026

describe('US birthdays', () => {
  it('masks as you type', () => {
    expect(maskUSDate('09')).toBe('09');
    expect(maskUSDate('0914')).toBe('09/14');
    expect(maskUSDate('09/14/2025')).toBe('09/14/2025');
    expect(maskUSDate('091420251')).toBe('09/14/2025');
  });
  it('parses month/day/year into ISO', () => {
    expect(parseUSDate('09/14/2025', today)).toBe('2025-09-14');
    expect(parseUSDate('02/30/2025', today)).toBeNull();
    expect(parseUSDate('12/01/2026', today)).toBeNull(); // future
    expect(parseUSDate('9/14/2025', today)).toBeNull();
    expect(isoToUS('2025-09-14')).toBe('09/14/2025');
  });
});

describe('ages and suggestions', () => {
  it('labels ages', () => {
    expect(ageLabel('2026-09-20', today)).toBe('Newborn');
    expect(ageLabel('2026-04-05', today)).toBe('6 months');
    expect(ageLabel('2025-10-05', today)).toBe('1 year');
    expect(ageLabel('2025-08-01', today)).toBe('14 months');
    expect(ageLabel('2020-01-01', today)).toBe('6 yrs 9 mos');
    expect(ageLabel('2020-10-01', today)).toBe('6 yrs');
    expect(ageLabel('2024-09-01', today)).toBe('2 yrs 1 mo');
  });
  it('suggests foods by age', () => {
    expect(suggestedFoods(6)).toContain('Honey');
    expect(suggestedFoods(30)).toContain('Whole grapes');
    expect(suggestedFoods(90)).toContain('Peanuts');
  });
  it('builds the sitter warning line', () => {
    expect(safetyLine({ name: 'Mia', avoid_foods: 'honey', allergies: 'penicillin' })).toBe('Mia · avoid honey · allergic to penicillin');
    expect(safetyLine({ name: 'Leo', avoid_foods: '', allergies: '' })).toBeNull();
  });
});

describe('child profile (P55)', () => {
  it('counts this week (Mon-Sun) and finds the last report', () => {
    const at = (y: number, mo: number, d: number) => new Date(y, mo, d, 15).toISOString();
    const shifts = [
      { id: 'a', starts_at: at(2026, 9, 4), status: 'completed' }, // Sun before: last week
      { id: 'b', starts_at: at(2026, 9, 5), status: 'completed' }, // Mon
      { id: 'c', starts_at: at(2026, 9, 7), status: 'cancelled' },
      { id: 'd', starts_at: at(2026, 9, 11), status: 'scheduled' }, // Sun
      { id: 'e', starts_at: at(2026, 9, 12), status: 'scheduled' }, // next Mon
    ];
    const w = kidWeek(shifts, new Date(2026, 9, 8));
    expect(w.count).toBe(2);
    expect(w.last?.id).toBe('b');
    expect(kidWeek([], today).last).toBeUndefined();
  });
});
