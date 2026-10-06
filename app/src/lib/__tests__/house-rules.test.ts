import { describe, expect, it } from '@jest/globals';

import {
  CATALOGUE,
  CHIP_SECTIONS,
  chipRule,
  familyPossessive,
  groupRules,
  type HouseRule,
  joinNames,
  ownRule,
  rulesAgreed,
  rulesCount,
  shiftRuleRows,
  sitterLine,
  withPhoneChoice,
} from '../house-rules-logic';
import type { LogEntry } from '../types';

function rule(key: string, extra: Partial<HouseRule> = {}): HouseRule {
  return { ...chipRule(key), id: key, family_id: 'f', must_since: null, created_at: '2026-10-06T10:00:00Z', updated_at: '2026-10-06T10:00:00Z', ...extra };
}

function log(kind: LogEntry['kind'], at: string, data: Record<string, string> = {}, kid_ids: string[] = []): LogEntry {
  return { id: `${kind}-${at}`, shift_id: 's', author_id: 'a', kind, kid_ids, data, photo_path: null, urgent: false, happened_at: at };
}

describe('catalogue (P75)', () => {
  it('has the P75 chips, in its sections and order', () => {
    expect(CHIP_SECTIONS.map((s) => CATALOGUE.filter((c) => c.category === s.category).map((c) => c.chip))).toEqual([
      ['Meals and snacks', 'Naps and sleep', 'Activities', 'Photo updates', 'Diapers and potty'],
      ['Phone for emergencies only', 'No social media', 'Screen time limit', 'No screens at meals', 'No phone while driving'],
      ['No visitors', 'Ask before leaving home', 'Never alone in bath or pool', 'Doors locked'],
      ['Only food from the meal plan', 'No sweets after 5 PM', 'Bedtime as written'],
      ['Tidy before you go', 'Gentle discipline, no yelling', 'No smoking or vaping', 'Speak Spanish with the kids'],
    ]);
  });
  it('adds a chip with the P74 wording', () => {
    expect(chipRule('photos')).toMatchObject({ key: 'photos', title: 'Photo update', sub: 'Every 2 hours', strength: 'prefer', options: { every_hours: 2 } });
    expect(chipRule('leaving')).toMatchObject({ title: 'Ask before leaving the house', sub: 'Planned trips in the care plan are fine', category: 'safety', strength: 'must' });
    expect(ownRule('  Shoes off inside ', 'prefer')).toMatchObject({ key: null, title: 'Shoes off inside', category: 'home', strength: 'prefer' });
  });
});

describe('lists (P74, S42)', () => {
  it('groups safety and home together, logs first', () => {
    const groups = groupRules([rule('tidy'), rule('visitors'), rule('meals'), rule('sweets'), rule('phone')]);
    expect(groups.map((g) => [g.label, g.rules.map((r) => r.key)])).toEqual([
      ['UPDATES AND LOGS', ['meals']],
      ['PHONE AND SCREENS', ['phone']],
      ['SAFETY AND HOME', ['visitors', 'tidy']],
      ['FOOD AND ROUTINE', ['sweets']],
    ]);
  });
  it('uses the sitter wording on S42', () => {
    expect(sitterLine(rule('meals'))).toEqual({ title: 'Log meals and snacks', sub: 'Tap Food during the shift' });
    expect(sitterLine(rule('photos'))).toEqual({ title: 'Photo update every 2 hours', sub: '' });
    expect(sitterLine(rule('phone'))).toEqual({ title: 'Your phone: emergencies and our messages', sub: '' });
    expect(sitterLine(rule('phone', { options: { use: 'naps', no_social: true, no_posts: true } }))).toEqual({
      title: 'Your phone: OK during naps and quiet time',
      sub: 'No social media on shift · Never post photos of the kids',
    });
    expect(sitterLine(rule('visitors'))).toEqual({ title: 'No visitors without asking', sub: '' });
  });
  it('words the phone rule from its P76 choice', () => {
    expect(withPhoneChoice(chipRule('phone'), 'any')).toMatchObject({ title: 'Personal phone: no limit', sub: 'Use your judgment', options: { use: 'any' } });
    expect(withPhoneChoice(chipRule('phone'), 'emergencies')).toMatchObject({ title: 'Personal phone: emergencies only', sub: 'Messages with us are fine' });
  });
  it('counts and names', () => {
    expect(rulesCount([rule('meals'), rule('phone'), rule('tidy')])).toBe('2 must-dos, 1 wish.');
    expect(rulesCount([rule('meals')])).toBe('1 must-do.');
    expect(joinNames(['Maya', 'Priya'])).toBe('Maya and Priya');
    expect(joinNames(['Maya', 'Priya', 'Sam'])).toBe('Maya, Priya and Sam');
    expect(familyPossessive('The Lee family')).toEqual({ title: 'The Lees’', line: 'the Lee family’s' });
    expect(familyPossessive('Parks')).toEqual({ title: 'Parks’s', line: 'Parks’s' });
  });
});

describe('agreement', () => {
  const must = rule('visitors', { must_since: '2026-10-06T12:00:00Z' });
  it('needs an OK newer than every Must rule', () => {
    expect(rulesAgreed([must], null)).toBe(false);
    expect(rulesAgreed([must], '2026-10-06T11:59:00Z')).toBe(false);
    expect(rulesAgreed([must], '2026-10-06T12:00:00Z')).toBe(true);
    expect(rulesAgreed([must, rule('tidy')], '2026-10-06T13:00:00Z')).toBe(true);
  });
  it('needs nothing without Must rules', () => {
    expect(rulesAgreed([], null)).toBe(true);
    expect(rulesAgreed([rule('tidy')], null)).toBe(true);
  });
});

describe('today’s rules (S43)', () => {
  const kids = [
    { id: 'a', name: 'Ava' },
    { id: 'l', name: 'Leo' },
  ];
  const rules = [rule('meals'), rule('naps'), rule('photos'), rule('activities'), rule('visitors')];
  const clockIn = '2026-10-06T19:00:00Z';
  it('marks logged rules done and the rest due', () => {
    const logs = [log('food', '2026-10-06T19:30:00Z', { meal: 'snack' }, ['a', 'l']), log('activity', '2026-10-06T20:00:00Z', { what: 'park' })];
    const rows = shiftRuleRows(rules, logs, kids, clockIn, new Date('2026-10-06T20:30:00Z'));
    expect(rows.map((r) => [r.title, r.state])).toEqual([
      ['Snack', 'done'],
      ['Naps and sleep', 'due'],
      ['Activities', 'done'],
      ['Photo update', 'later'],
    ]);
    expect(rows[0].sub).toMatch(/^Ava and Leo · \d{1,2}:30$/);
    expect(rows[2].sub).toBe('1 logged · park');
  });
  it('asks for a photo again after its interval', () => {
    const photo = [rule('photos')];
    expect(shiftRuleRows(photo, [], kids, clockIn, new Date('2026-10-06T21:00:00Z'))[0].state).toBe('due');
    const logs = [log('photo', '2026-10-06T20:00:00Z')];
    expect(shiftRuleRows(photo, logs, kids, clockIn, new Date('2026-10-06T21:00:00Z'))[0]).toMatchObject({ state: 'done', sub: 'Last one 1 h ago' });
    expect(shiftRuleRows(photo, logs, kids, clockIn, new Date('2026-10-06T22:00:00Z'))[0]).toMatchObject({ state: 'due', sub: 'Last one 2 h ago' });
  });
});
