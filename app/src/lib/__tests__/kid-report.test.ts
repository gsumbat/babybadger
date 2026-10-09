import { describe, expect, it } from '@jest/globals';

import { bottleAmount, dayBuckets, dayHeading, formatMinutes, groupByDay, isReportRange, kidPatterns, napMinutes, perDay, rangeDayCount, rangeSince, spanLabel, summaryLines } from '../kid-report';
import type { LogEntry } from '../types';

const now = new Date(2026, 9, 9, 15, 0); // Fri Oct 9, 2026, 3 PM
const at = (day: number, h: number, m = 0) => new Date(2026, 9, day, h, m).toISOString();
function log(kind: LogEntry['kind'], when: string, data: Record<string, string> = {}): LogEntry {
  return { id: Math.random().toString(36).slice(2), shift_id: 's', author_id: 'm', kind, kid_ids: [], data, photo_path: null, urgent: false, happened_at: when };
}

describe('ranges', () => {
  it('starts each range at local midnight', () => {
    expect(rangeSince('today', now)).toEqual(new Date(2026, 9, 9));
    expect(rangeSince('week', now)).toEqual(new Date(2026, 9, 3));
    expect(rangeSince('month', now)).toEqual(new Date(2026, 8, 9));
    expect(rangeSince('3m', now)).toEqual(new Date(2026, 6, 9));
    expect(rangeSince('6m', now)).toEqual(new Date(2026, 3, 9));
    expect(rangeSince('1y', now)).toEqual(new Date(2025, 9, 9));
  });
  it('counts the days in a range', () => {
    expect(rangeDayCount(rangeSince('today', now), now)).toBe(1);
    expect(rangeDayCount(rangeSince('week', now), now)).toBe(7);
    expect(rangeDayCount(rangeSince('month', now), now)).toBe(31);
  });
  it('labels the span', () => {
    expect(spanLabel(new Date(2026, 9, 2), new Date(2026, 9, 8))).toBe('Oct 2 – 8');
    expect(spanLabel(new Date(2026, 8, 9), new Date(2026, 9, 8))).toBe('Sep 9 – Oct 8');
    expect(spanLabel(new Date(2025, 9, 9), new Date(2026, 9, 8))).toBe('Oct 9, 2025 – Oct 8, 2026');
    expect(spanLabel(new Date(2026, 9, 8), new Date(2026, 9, 8, 15))).toBe('Oct 8');
  });
  it('checks route values', () => {
    expect(isReportRange('3m')).toBe(true);
    expect(isReportRange('2y')).toBe(false);
    expect(isReportRange(undefined)).toBe(false);
  });
});

describe('naps', () => {
  it('reads the length from the typed times', () => {
    expect(napMinutes(log('nap', at(8, 15), { started_at: '1:00 PM', ended_at: '2:30 PM' }))).toBe(90);
    expect(napMinutes(log('nap', at(8, 23), { started_at: '11:30 PM', ended_at: '12:15 AM' }))).toBe(45);
    expect(napMinutes(log('nap', at(8, 15), { started_at: '1:00 PM' }))).toBeNull();
    expect(napMinutes(log('nap', at(8, 15), { started_at: 'after lunch', ended_at: '2 PM' }))).toBeNull();
    expect(napMinutes(log('food', at(8, 15), { started_at: '1:00 PM', ended_at: '2:30 PM' }))).toBeNull();
  });
  it('formats minutes', () => {
    expect(formatMinutes(40)).toBe('40 min');
    expect(formatMinutes(120)).toBe('2 h');
    expect(formatMinutes(85)).toBe('1 h 25 min');
  });
});

describe('patterns', () => {
  const logs = [
    log('food', at(9, 12), { meal: 'lunch', what: 'Pasta', amount: 'all' }),
    log('food', at(9, 15), { meal: 'snack', what: 'Apple', amount: 'some' }),
    log('food', at(8, 10), { meal: 'bottle', amount: '4 oz' }),
    log('food', at(8, 13), { what: 'Formula', amount: '5.5 oz' }),
    log('nap', at(8, 15), { started_at: '1:00 PM', ended_at: '2:30 PM' }),
    log('nap', at(9, 14), { started_at: '1:00 PM', ended_at: '1:45 PM' }),
    log('nap', at(9, 13), { started_at: '1:00 PM' }),
    log('diaper', at(9, 9), { diaper: 'wet' }),
    log('diaper', at(9, 10), { diaper: 'dirty' }),
    log('diaper', at(8, 11), { diaper: 'both', potty: 'tried' }),
    log('diaper', at(8, 12), { diaper: 'wet', potty: 'success!' }),
    log('diaper', at(8, 16), { diaper: 'dry', potty: 'not today' }),
    log('activity', at(9, 16), { what: 'Park' }),
    log('incident', at(9, 17), { type: 'Fall or bump' }),
    log('photo', at(9, 17)),
  ];
  const p = kidPatterns(logs);
  it('counts feeding, bottles and their amounts', () => {
    expect(p.feeding).toEqual({ total: 4, meals: 1, snacks: 1, bottles: 2, oz: 9.5, ml: 0 });
    expect(bottleAmount('120 ml')).toEqual({ amount: 120, unit: 'ml' });
    expect(bottleAmount('4,5 oz')).toEqual({ amount: 4.5, unit: 'oz' });
    expect(bottleAmount('all')).toBeNull();
  });
  it('totals naps that have both times', () => {
    expect(p.sleep).toEqual({ naps: 3, timed: 2, totalMin: 135 });
  });
  it('counts diapers and potty tries', () => {
    expect(p.diapers).toEqual({ total: 5, wet: 2, dirty: 1, both: 1, dry: 1, potty: 2, pottySuccess: 1 });
  });
  it('counts the rest and the logged days', () => {
    expect(p.activities).toBe(1);
    expect(p.incidents).toBe(1);
    expect(p.photos).toBe(1);
    expect(p.days).toBe(2);
    expect(kidPatterns([]).days).toBe(0);
  });
  it('averages per day', () => {
    expect(perDay(5, 2)).toBe('2.5');
    expect(perDay(4, 2)).toBe('2');
    expect(perDay(1, 3)).toBe('0.3');
    expect(perDay(3, 0)).toBe('');
  });
});

describe('per-day buckets', () => {
  const logs = [log('food', at(9, 12)), log('food', at(9, 15)), log('food', at(3, 9)), log('diaper', at(9, 9)), log('food', at(1, 9))];
  it('makes a bar a day for a week, oldest first', () => {
    const b = dayBuckets(logs, ['food'], rangeSince('week', now), now);
    expect(b).toHaveLength(7);
    expect(b[0].start).toEqual(new Date(2026, 9, 3));
    expect(b.map((x) => x.count)).toEqual([1, 0, 0, 0, 0, 0, 2]);
  });
  it('makes a bar a week past 45 days', () => {
    const b = dayBuckets(logs, ['food', 'diaper'], rangeSince('3m', now), now);
    expect(b).toHaveLength(Math.ceil(rangeDayCount(rangeSince('3m', now), now) / 7));
    expect(b.reduce((s, x) => s + x.count, 0)).toBe(5);
  });
});

describe('history days', () => {
  it('heads days as Today, Yesterday or the date', () => {
    expect(dayHeading(at(9, 8), now)).toBe('Today');
    expect(dayHeading(at(8, 23), now)).toBe('Yesterday');
    expect(dayHeading(at(5, 8), now)).toBe('Mon, Oct 5');
    expect(dayHeading(new Date(2025, 9, 5, 8).toISOString(), now)).toBe('Sun, Oct 5, 2025');
  });
  it('groups rows by day in order', () => {
    const g = groupByDay([{ at: at(9, 15) }, { at: at(9, 9) }, { at: at(7, 12) }], now);
    expect(g.map((x) => [x.label, x.rows.length])).toEqual([
      ['Today', 2],
      ['Wed, Oct 7', 1],
    ]);
  });
});

describe('summary markdown', () => {
  it('reads headings, bullets and text', () => {
    expect(summaryLines('## Feeding\n\n- Ate **well**\n* Two bottles\nSome text\n### Questions')).toEqual([
      { type: 'h', text: 'Feeding' },
      { type: 'li', text: 'Ate well' },
      { type: 'li', text: 'Two bottles' },
      { type: 'p', text: 'Some text' },
      { type: 'h', text: 'Questions' },
    ]);
  });
});
