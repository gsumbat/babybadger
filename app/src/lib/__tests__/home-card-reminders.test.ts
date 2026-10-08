import { describe, expect, it } from '@jest/globals';

import { cardReminders, requiresLine, type Credential } from '../credentials-logic';

const NOW = new Date(2026, 9, 1, 15, 30); // Oct 1, 2026, 3:30 PM

function cred(extra: Partial<Credential>): Credential {
  return { id: 'c', sitter_id: 's', kind: 'cpr_infant', title: 'Infant CPR', issuer: null, issued_on: null, expires_on: null, file_path: null, verified_at: null, created_at: '2026-09-01T12:00:00Z', ...extra };
}

describe('requiresLine', () => {
  it('names one or two families, counts more', () => {
    expect(requiresLine([])).toBe('');
    expect(requiresLine(['The Lee family', 'The Lee family'])).toBe('Lee family requires it');
    expect(requiresLine(['The Lee family', 'The Kim family'])).toBe('Lee and Kim families require it');
    expect(requiresLine(['The Lee family', 'The Kim family', 'The Ortiz family'])).toBe('3 families require it');
    expect(requiresLine(['Smiths', 'The Kim family'])).toBe('2 families require it');
  });
});

describe('cardReminders (S3 Needs you)', () => {
  it('lists a card expiring within 30 days with the family that requires it', () => {
    const rows = cardReminders([cred({ id: 'a', expires_on: '2026-10-22' })], [{ family: 'The Lee family', kinds: ['cpr_infant'] }], NOW);
    expect(rows).toEqual([{ id: 'a', title: 'Infant CPR expires in 21 days', sub: 'Renew and share the new card · Lee family requires it', expired: false }]);
  });

  it('says "1 day" and leaves the family out when no one requires that kind', () => {
    const rows = cardReminders([cred({ id: 'a', expires_on: '2026-10-02' })], [{ family: 'The Lee family', kinds: ['first_aid'] }], NOW);
    expect(rows[0]).toMatchObject({ title: 'Infant CPR expires in 1 day', sub: 'Renew and share the new card' });
  });

  it('lists expired cards (on or after the expiry day) first, with the date', () => {
    const rows = cardReminders(
      [cred({ id: 'soon', expires_on: '2026-10-20' }), cred({ id: 'gone', kind: 'first_aid', title: 'CPR and First Aid', expires_on: '2026-09-02' }), cred({ id: 'today', kind: 'water_safety', title: 'Water safety', expires_on: '2026-10-01' })],
      [],
      NOW,
    );
    expect(rows.map((r) => [r.id, r.title, r.expired])).toEqual([
      ['gone', 'CPR and First Aid expired Sep 2', true],
      ['today', 'Water safety expired Oct 1', true],
      ['soon', 'Infant CPR expires in 19 days', false],
    ]);
  });

  it('skips cards that are fine, have no date, the background check, and cards already replaced', () => {
    const rows = cardReminders(
      [
        cred({ id: 'ok', expires_on: '2027-03-01' }),
        cred({ id: 'nodate', kind: 'first_aid', title: 'CPR and First Aid' }),
        cred({ id: 'bg', kind: 'background_check', title: 'Background check', expires_on: '2026-10-05' }),
        cred({ id: 'old', kind: 'water_safety', title: 'Water safety', expires_on: '2026-09-01' }),
        cred({ id: 'new', kind: 'water_safety', title: 'Water safety', expires_on: '2028-09-01' }),
      ],
      [],
      NOW,
    );
    expect(rows).toEqual([]);
  });

  it('shows the year for a date in another year', () => {
    const rows = cardReminders([cred({ id: 'a', expires_on: '2025-12-30' })], [], NOW);
    expect(rows[0].title).toBe('Infant CPR expired Dec 2025');
  });
});
