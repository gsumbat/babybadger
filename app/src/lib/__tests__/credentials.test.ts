import { describe, expect, it } from '@jest/globals';

import {
  agesLabel,
  backgroundStatus,
  choiceOf,
  cleanLanguage,
  credentialBadge,
  credentialState,
  credentialSub,
  daysUntil,
  driveLabel,
  expiringSoon,
  expiryLine,
  familyCredentials,
  familyViewLines,
  fromUsDate,
  languagesLine,
  profileLine,
  profileStrength,
  shortName,
  suggestions,
  usDate,
  type Credential,
  type SitterProfile,
} from '../credentials-logic';

const NOW = new Date(2026, 9, 1, 15, 30); // Oct 1, 2026, 3:30 PM

function cred(extra: Partial<Credential>): Credential {
  return { id: 'c', sitter_id: 's', kind: 'first_aid', title: 'CPR and First Aid', issuer: null, issued_on: null, expires_on: null, file_path: null, verified_at: null, created_at: '2026-09-01T12:00:00Z', ...extra };
}

describe('credentials', () => {
  it('works out the date state (30-day window, off on the date)', () => {
    expect(credentialState(cred({}), NOW)).toBe('missing_date');
    expect(credentialState(cred({ expires_on: '2027-03-01' }), NOW)).toBe('valid');
    expect(credentialState(cred({ expires_on: '2026-10-31' }), NOW)).toBe('expiring'); // 30 days
    expect(credentialState(cred({ expires_on: '2026-11-01' }), NOW)).toBe('valid'); // 31 days
    expect(credentialState(cred({ expires_on: '2026-10-22' }), NOW)).toBe('expiring');
    expect(credentialState(cred({ expires_on: '2026-10-02' }), NOW)).toBe('expiring');
    expect(credentialState(cred({ expires_on: '2026-10-01' }), NOW)).toBe('expired');
    expect(credentialState(cred({ expires_on: '2025-01-01' }), NOW)).toBe('expired');
    expect(daysUntil('2026-10-22', NOW)).toBe(21);
  });

  it('picks the pill', () => {
    expect(credentialBadge(cred({ verified_at: '2026-09-02T00:00:00Z', expires_on: '2027-03-01' }), NOW)).toBe('verified');
    expect(credentialBadge(cred({ verified_at: '2026-09-02T00:00:00Z', expires_on: '2026-10-22' }), NOW)).toBe('expiring');
    expect(credentialBadge(cred({ expires_on: '2026-09-01' }), NOW)).toBe('expired');
    expect(credentialBadge(cred({}), NOW)).toBe('in_review');
  });

  it('lists what expires soon, soonest first, without the background check', () => {
    const list = [
      cred({ id: 'a', expires_on: '2026-10-29' }),
      cred({ id: 'b', expires_on: '2026-10-22' }),
      cred({ id: 'c', expires_on: '2027-01-01' }),
      cred({ id: 'd', kind: 'background_check', expires_on: '2026-10-10' }),
      cred({ id: 'e', expires_on: '2026-09-01' }),
    ];
    expect(expiringSoon(list, NOW).map((c) => c.id)).toEqual(['b', 'a']);
  });

  it('describes the background check', () => {
    expect(backgroundStatus(null, NOW)).toBe('none');
    expect(backgroundStatus(cred({ kind: 'background_check' }), NOW)).toBe('in_progress');
    expect(backgroundStatus(cred({ kind: 'background_check', verified_at: '2026-08-01T00:00:00Z', expires_on: '2027-08-01' }), NOW)).toBe('cleared');
    expect(backgroundStatus(cred({ kind: 'background_check', verified_at: '2025-08-01T00:00:00Z', expires_on: '2026-08-01' }), NOW)).toBe('expired');
  });

  it('writes the row lines like S13 / S14', () => {
    expect(credentialSub(cred({ issuer: 'American Red Cross', expires_on: '2027-03-01' }), NOW)).toBe('American Red Cross · to Mar 2027');
    expect(credentialSub(cred({ issuer: 'American Heart Assoc.', expires_on: '2026-10-22' }), NOW)).toBe('American Heart Assoc. · to Oct 22');
    expect(credentialSub(cred({ created_at: NOW.toISOString() }), NOW)).toBe('Uploaded today');
    expect(expiryLine(cred({ expires_on: '2027-03-01' }), NOW)).toBe('Expires Mar 2027');
    expect(expiryLine(cred({ expires_on: '2026-09-20' }), NOW)).toBe('Expired Sep 20');
    expect(expiryLine(cred({}), NOW)).toBe('No expiry date');
  });

  it('maps saved rows back to the S15 tiles', () => {
    expect(choiceOf({ kind: 'cpr_infant', title: 'Infant CPR' }).key).toBe('cpr_infant');
    expect(choiceOf({ kind: 'other', title: 'Special needs care' }).key).toBe('special_needs');
    expect(choiceOf({ kind: 'other', title: 'Swim coach' }).key).toBe('other');
    expect(choiceOf({ kind: 'cpr_child', title: 'Child CPR' }).key).toBe('first_aid');
  });

  it('reads and writes US dates', () => {
    expect(usDate('2026-03-05')).toBe('03/05/2026');
    expect(usDate(null)).toBe('');
    expect(fromUsDate('3/5/2026')).toBe('2026-03-05');
    expect(fromUsDate('03/05/27')).toBe('2027-03-05');
    expect(fromUsDate('02/30/2026')).toBeNull();
    expect(fromUsDate('2026-03-05')).toBeNull();
  });

  it('handles languages', () => {
    const langs = [
      { sitter_id: 's', language: 'Spanish', level: 'fluent' as const },
      { sitter_id: 's', language: 'English', level: 'native' as const },
    ];
    expect(languagesLine(langs)).toBe('English · Spanish');
    expect(languagesLine(langs, true)).toBe('English (native) · Spanish (fluent)');
    expect(languagesLine([{ language: 'Portuguese', level: 'conversational' }], true)).toBe('Portuguese (good)');
    expect(suggestions([{ language: 'french' }])).toEqual(['Mandarin', 'ASL', 'Russian']);
    expect(cleanLanguage('  haitian   creole ')).toBe('Haitian creole');
    expect(cleanLanguage('asl')).toBe('ASL');
    expect(cleanLanguage('  ')).toBe('');
  });

  it('builds the profile lines', () => {
    expect(profileLine({ home_area: 'Seminole Heights, Tampa', years_experience: 6 })).toBe('Tampa · 6 years with kids');
    expect(profileLine({ home_area: null, years_experience: 1 })).toBe('1 year with kids');
    expect(profileLine(null)).toBe('');
    expect(agesLabel(0, 10)).toBe('Newborn – 10');
    expect(agesLabel(null, null)).toBe('');
    expect(driveLabel(true, true)).toBe('Yes · own car');
    expect(driveLabel(false, null)).toBe('No');
    expect(driveLabel(null, null)).toBe('');
    expect(shortName('Maya Rodriguez')).toBe('Maya R.');
    expect(shortName('Maya')).toBe('Maya');
  });

  it('scores profile strength and names the next step', () => {
    const empty = profileStrength(null, [], []);
    expect(empty.percent).toBe(0);
    expect(empty.next).toBe('Next: add a certification, like Newborn care or Water safety.');
    const p: SitterProfile = { sitter_id: 's', phone: '813', home_area: 'Tampa', bio: 'Hi', years_experience: 6, ages_from: null, ages_to: null, can_drive: null, own_car: null, rate: null, teaches_language: false, photo_path: null };
    const some = profileStrength(p, [cred({ kind: 'background_check' })], [{ sitter_id: 's', language: 'English', level: 'native' }]);
    expect(some.percent).toBe(67); // bio, phone, area, language; no certificate (background doesn't count), no photo
    const full = profileStrength({ ...p, photo_path: 'x' }, [cred({})], [{ sitter_id: 's', language: 'English', level: 'native' }]);
    expect(full).toEqual({ percent: 100, next: 'Your profile is complete.' });
  });
});

describe('sitterAge', () => {
  const { sitterAge, profileLine } = require('../credentials-logic');
  const today = new Date(2026, 9, 6);
  it('counts whole years, birthday not reached yet', () => {
    expect(sitterAge('2002-10-07', today)).toBe(23);
    expect(sitterAge('2002-10-06', today)).toBe(24);
  });
  it('is null without a birthday', () => expect(sitterAge(null, today)).toBeNull());
  it('leads the profile line', () => expect(profileLine({ home_area: 'Hyde Park, Tampa', years_experience: 5, birthdate: '2002-01-01' }, today)).toBe('24 years old · Tampa · 5 years with kids'));
});

describe('what families see (P11 / S19)', () => {
  it('lists verified, unexpired credentials: first certificate, background check, then the rest', () => {
    const creds = [
      cred({ id: 'cpr', kind: 'first_aid', verified_at: '2026-09-01T00:00:00Z', expires_on: '2027-03-01' }),
      cred({ id: 'inf', kind: 'cpr_infant', verified_at: '2026-09-01T00:00:00Z', expires_on: '2026-10-22' }),
      cred({ id: 'bg', kind: 'background_check', verified_at: '2026-08-10T00:00:00Z' }),
      cred({ id: 'old', kind: 'water_safety', verified_at: '2026-01-01T00:00:00Z', expires_on: '2026-09-01' }),
      cred({ id: 'new', kind: 'newborn_care' }),
    ];
    expect(familyCredentials(creds, NOW).map((c) => c.id)).toEqual(['cpr', 'bg', 'inf']);
  });
  it('S19 lines under the name', () => {
    expect(familyViewLines({ years_experience: 6, ages_from: 0, ages_to: 10, can_drive: true, rate: 20 })).toEqual(['6 years · ages newborn – 10', 'Drives · $20 / hour']);
    expect(familyViewLines({ years_experience: 1, ages_from: 3, ages_to: null, can_drive: false, rate: 18.5 })).toEqual(['1 year · ages 3 and up', '$18.50 / hour']);
    expect(familyViewLines(null)).toEqual(['', '']);
  });
});
