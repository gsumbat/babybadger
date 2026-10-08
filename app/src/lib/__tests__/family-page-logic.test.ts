import { describe, expect, it } from '@jest/globals';

import { contactName, dialable, type FamilyContact, mapsUrl, reachableContacts, routineGroups, routineRow } from '../family-page-logic';
import type { CareItem, Kid } from '../types';

const kid = (id: string, name: string): Kid => ({ id, family_id: 'f', name, birthdate: null, avoid_foods: '', notes: '' });
const item = (over: Partial<CareItem>): CareItem => ({
  id: Math.random().toString(36).slice(2),
  family_id: 'f',
  kid_id: null,
  type: 'other',
  title: '',
  starts: null,
  ends: null,
  days: 127,
  every_minutes: null,
  details: {},
  how: '',
  created_at: '2026-10-01T00:00:00Z',
  ...over,
});

describe('contactName', () => {
  it('reads "Jen (mom)" with a relation', () => {
    expect(contactName({ full_name: 'Jen Lee', relation: 'Mom' })).toBe('Jen (mom)');
    expect(contactName({ full_name: 'Sue Bell', relation: 'Grandma' })).toBe('Sue (grandma)');
  });
  it('keeps the full name without one', () => {
    expect(contactName({ full_name: 'Jen Lee', relation: null })).toBe('Jen Lee');
    expect(contactName({ full_name: 'Sam Ortiz', relation: 'Other' })).toBe('Sam Ortiz');
    expect(contactName({ full_name: ' ', relation: null })).toBe('Family member');
  });
});

describe('dialable', () => {
  it('keeps digits and a leading +', () => {
    expect(dialable('(813) 555-0142')).toBe('8135550142');
    expect(dialable('+1 813.555.0142')).toBe('+18135550142');
  });
  it('is null for too few digits or nothing', () => {
    expect(dialable('555-01')).toBeNull();
    expect(dialable(null)).toBeNull();
  });
});

describe('routineRow', () => {
  it('shows the time range and days only when not every day', () => {
    expect(routineRow(item({ type: 'nap', starts: '13:00:00', ends: '14:30:00' }))).toMatchObject({ title: 'Nap', when: '1:00 – 2:30 PM' });
    expect(routineRow(item({ type: 'activity', title: 'Soccer', starts: '16:30:00', days: 16 }))).toMatchObject({ title: 'Soccer', when: '4:30 PM · Thursdays' });
  });
  it('reads a repeat and the bottle extras', () => {
    expect(routineRow(item({ type: 'bottle', every_minutes: 180, details: { amount: 4, unit: 'oz', milk: 'formula' } }))).toMatchObject({ title: 'Bottle · 4 oz formula', when: 'Every 3 hrs' });
  });
  it('says Any time without a time', () => {
    expect(routineRow(item({ title: 'Screen time' })).when).toBe('Any time');
  });
});

describe('routineGroups', () => {
  const ava = kid('a', 'Ava');
  const leo = kid('l', 'Leo');
  it('groups by kid in kid order, sorted by time, then Everyone', () => {
    const g = routineGroups(
      [
        item({ kid_id: 'l', type: 'bedtime', starts: '19:30:00' }),
        item({ kid_id: 'l', type: 'nap', starts: '13:00:00', ends: '14:30:00' }),
        item({ kid_id: 'a', type: 'bedtime', starts: '20:00:00' }),
        item({ title: 'Feed the cat', starts: '17:00:00' }),
        item({ kid_id: 'x', type: 'nap' }),
      ],
      [ava, leo],
    );
    expect(g.map((x) => x.title)).toEqual(['Ava’s day', 'Leo’s day', 'Everyone']);
    expect(g[1].rows.map((r) => r.title)).toEqual(['Nap', 'Bedtime']);
    expect(g[2].kid).toBeNull();
  });
  it('leaves out kids without items', () => {
    expect(routineGroups([item({ kid_id: 'a', type: 'nap' })], [ava, leo]).map((x) => x.key)).toEqual(['a']);
    expect(routineGroups([], [ava])).toEqual([]);
  });
});

describe('mapsUrl', () => {
  it('opens Apple Maps on iOS and Google Maps elsewhere', () => {
    expect(mapsUrl('12 Oak St, Tampa, FL', 'ios')).toBe('https://maps.apple.com/?q=12%20Oak%20St%2C%20Tampa%2C%20FL');
    expect(mapsUrl('12 Oak St', 'android')).toBe('https://www.google.com/maps/search/?api=1&query=12%20Oak%20St');
  });
  it('has no link when the address is hidden', () => {
    expect(mapsUrl(null, 'ios')).toBeNull();
    expect(mapsUrl('  ', 'web')).toBeNull();
  });
});

describe('reachableContacts', () => {
  const c = (over: Partial<FamilyContact>): FamilyContact => ({ user_id: 'u', full_name: 'Jen Lee', relation: 'Mom', role: 'parent', phone: null, ...over });
  it('keeps the adults with a dialable phone, in order', () => {
    const r = reachableContacts([
      c({ user_id: 'jen', phone: '(813) 555-0142 ' }),
      c({ user_id: 'sue', full_name: 'Sue Lee', relation: 'Grandma', role: 'helper', phone: '12' }),
      c({ user_id: 'dan', full_name: 'Dan Lee', relation: 'Dad', phone: '+1 813 555 0199' }),
    ]);
    expect(r).toEqual([
      { user_id: 'jen', name: 'Jen (mom)', phone: '(813) 555-0142', tel: '8135550142' },
      { user_id: 'dan', name: 'Dan (dad)', phone: '+1 813 555 0199', tel: '+18135550199' },
    ]);
  });
  it('is empty without phones or before migration 33', () => {
    expect(reachableContacts([c({})])).toEqual([]);
    expect(reachableContacts(null)).toEqual([]);
  });
});
