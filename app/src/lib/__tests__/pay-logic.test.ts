import { describe, expect, it } from '@jest/globals';

import { dollars, familyShort, familyTitle, hoursBig, hoursShort, paidMinutes, payFor, periodLabel, periodRange, plural } from '../pay-logic';
import { namesList, seesKid } from '../family-setup-logic';

const at = (d: number, h: number, m = 0) => new Date(2026, 9, d, h, m).toISOString(); // October 2026

describe('pay periods', () => {
  it('week runs Monday to Sunday', () => {
    const r = periodRange('week', new Date(2026, 9, 6, 15)); // Tue Oct 6
    expect(r.from).toEqual(new Date(2026, 9, 5));
    expect(r.to).toEqual(new Date(2026, 9, 12));
    expect(periodLabel(r)).toBe('Oct 5 – 11');
    const sun = periodRange('week', new Date(2026, 9, 4, 12)); // Sun Oct 4
    expect(periodLabel(sun)).toBe('Sep 28 – Oct 4');
  });
  it('month runs the 1st to the last day', () => {
    const r = periodRange('month', new Date(2026, 9, 6));
    expect(periodLabel(r)).toBe('Oct 1 – 31');
  });
});

describe('payFor', () => {
  const shifts = [
    { id: 'a', family_id: 'lee', status: 'completed' as const, clock_in_at: at(5, 15, 2), clock_out_at: at(5, 19, 4) },
    { id: 'b', family_id: 'lee', status: 'completed' as const, clock_in_at: at(6, 15, 0), clock_out_at: at(6, 19, 0) },
    { id: 'c', family_id: 'ortiz', status: 'completed' as const, clock_in_at: at(7, 19, 30), clock_out_at: at(7, 22, 0) },
    { id: 'd', family_id: 'lee', status: 'active' as const, clock_in_at: at(8, 15, 0), clock_out_at: null },
    { id: 'e', family_id: 'lee', status: 'completed' as const, clock_in_at: at(1, 15, 0), clock_out_at: at(1, 16, 0) },
  ];
  it('adds finished shifts in the period at each family rate', () => {
    const r = payFor(shifts, { lee: 22, ortiz: null }, periodRange('week', new Date(2026, 9, 6)));
    expect(r.shifts.map((s) => s.id)).toEqual(['c', 'b', 'a']);
    expect(r.minutes).toBe(242 + 240 + 150);
    expect(r.families.find((f) => f.family_id === 'lee')).toEqual({ family_id: 'lee', minutes: 482, rate: 22, earned: 176.73 });
    expect(r.families.find((f) => f.family_id === 'ortiz')?.earned).toBe(0);
    expect(r.earned).toBe(176.73);
  });
  it('ignores open shifts', () => {
    expect(paidMinutes(shifts[3])).toBe(0);
  });
});

describe('labels', () => {
  it('formats hours, money and names', () => {
    expect(hoursBig(2910)).toBe('48H 30M');
    expect(hoursShort(482)).toBe('8 h 02 m');
    expect(hoursShort(45)).toBe('45 min');
    expect(dollars(1303.6)).toBe('$1,304');
    expect(familyTitle('The Lee family')).toBe('Lee family');
    expect(familyShort('The Lee family')).toBe('Lee');
    expect(plural('Lee')).toBe('Lees');
    expect(plural('Ortiz')).toBe('Ortizes');
  });
});

describe('family setup helpers', () => {
  it('null kid list sees every kid', () => {
    expect(seesKid(null, 'mia')).toBe(true);
    expect(seesKid(['ava'], 'mia')).toBe(false);
    expect(seesKid(['ava', 'mia'], 'mia')).toBe(true);
  });
  it('joins names', () => {
    expect(namesList(['Maya'])).toBe('Maya');
    expect(namesList(['Maya', 'Priya'])).toBe('Maya and Priya');
    expect(namesList(['Ava', 'Leo', 'Mia'])).toBe('Ava, Leo and Mia');
  });
});
