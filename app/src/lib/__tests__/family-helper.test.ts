import { describe, expect, it } from '@jest/globals';

import { canManage, isParentOnlyRoute, managedByLine, parentFirstNames, routeForRole, willAnswerLine } from '../family-members';

describe('family helper (read-only screens)', () => {
  it('only parents manage the family', () => {
    expect(canManage('parent')).toBe(true);
    expect(canManage('helper')).toBe(false);
    // before migration 30 everyone is a parent
    expect(canManage(null)).toBe(true);
    expect(canManage(undefined)).toBe(true);
  });

  it('lists the parents’ first names', () => {
    expect(
      parentFirstNames([
        { role: 'parent', name: 'Jen Lee' },
        { role: 'helper', name: 'Sue Bell' },
        { role: 'parent', name: ' Sam  Lee ' },
        { role: 'parent', name: '' },
      ]),
    ).toEqual(['Jen', 'Sam']);
  });

  it('words the read-only line', () => {
    expect(managedByLine(['Jen'], 'the care plan')).toBe('Jen manages the care plan.');
    expect(managedByLine(['Jen', 'Sam'], 'the care plan')).toBe('Jen and Sam manage the care plan.');
    expect(managedByLine(['Jen', 'Sam', 'Dan'], 'house rules')).toBe('Jen, Sam and Dan manage house rules.');
    expect(managedByLine([], 'the care plan')).toBe('Only parents can change this.');
    expect(managedByLine([' '], 'the care plan')).toBe('Only parents can change this.');
  });

  it('says who answers a request', () => {
    expect(willAnswerLine(['Jen'])).toBe('Jen will answer.');
    expect(willAnswerLine(['Jen', 'Sam'])).toBe('Jen or Sam will answer.');
    expect(willAnswerLine([])).toBe('A parent will answer.');
  });

  it('knows the parent-only routes', () => {
    for (const url of [
      '/parent/kid/new?id=k1&step=2',
      '/parent/care/item?id=c1',
      '/parent/places/new?kind=home',
      '/parent/places/p1',
      '/parent/rules/rule?id=r1',
      '/parent/rules/add',
      '/parent/shift/new',
      '/parent/request/abc',
      '/parent/requirements',
      '/parent/requirements/setup',
      '/parent/subscription',
      '/parent/plans?from=settings',
      '/parent/members/invite',
      '/parent/invite/i1',
      '/parent/pool-week',
    ])
      expect([url, isParentOnlyRoute(url)]).toEqual([url, true]);
    for (const url of ['/parent', '/parent/alerts', '/parent/trip/t1', '/parent/shift/s1', '/parent/kid/k1', '/parent/kid/routine?kidId=k1', '/parent/care', '/parent/places', '/parent/rules', '/parent/messages?sitter=x', '/parent/members', '/parent/members/u1'])
      expect([url, isParentOnlyRoute(url)]).toEqual([url, false]);
  });

  it('sends a helper’s push taps to a read-only screen', () => {
    expect(routeForRole('/parent/request/abc', 'helper')).toBe('/parent/sitters');
    expect(routeForRole('/parent/subscription', 'helper')).toBe('/parent/settings');
    expect(routeForRole('/parent/care/item?id=c1', 'helper')).toBe('/parent/care');
    expect(routeForRole('/parent/kid/new?id=k1&step=2', 'helper')).toBe('/parent/kid/k1');
    expect(routeForRole('/parent/kid/new', 'helper')).toBe('/parent');
    expect(routeForRole('/parent/places/p1', 'helper')).toBe('/parent/places');
    expect(routeForRole('/parent/rules/rule?id=r1', 'helper')).toBe('/parent/rules');
    // screens a helper reads stay as they are
    expect(routeForRole('/parent/alerts', 'helper')).toBe('/parent/alerts');
    expect(routeForRole('/parent/trip/t1', 'helper')).toBe('/parent/trip/t1');
    expect(routeForRole('/parent/messages?sitter=x', 'helper')).toBe('/parent/messages?sitter=x');
    // a parent goes where the push points
    expect(routeForRole('/parent/request/abc', 'parent')).toBe('/parent/request/abc');
  });
});
