import { describe, expect, it } from '@jest/globals';

import {
  claimErrorText,
  familyClosedCopy,
  familyInviteSubject,
  familyInviteText,
  familyLandingTitle,
  familyLinkAppUrl,
  familyLinkUrl,
  familyTokenFromUrl,
  foundLaterBody,
  openCount,
  referralPill,
  referralSub,
  referralTitle,
  sitterShort,
  type Referral,
} from '../family-links';

const T = '3f9c2a7b1e0d4c6a8b5f2e1d0c9b8a7f6e5d4c3b';

function ref(over: Partial<Referral> = {}): Referral {
  return {
    id: 'r1',
    token: T,
    parent_name: null,
    family_name: null,
    email: null,
    created_at: '2026-10-07T15:00:00Z',
    expires_at: '2026-11-06T15:00:00Z',
    joined_at: null,
    status: 'open',
    joined_family_name: null,
    invite_token: null,
    connected: false,
    ...over,
  };
}

describe('family links (S52, S0f)', () => {
  it('builds and reads the links', () => {
    expect(familyLinkUrl(T)).toBe(`https://babybadger.app/f/${T}`);
    expect(familyLinkAppUrl(T)).toBe(`babybadger://f/${T}`);
    expect(familyTokenFromUrl(`https://babybadger.app/f/${T}`)).toBe(T);
    expect(familyTokenFromUrl(`babybadger://f/${T}?x=1`)).toBe(T);
    expect(familyTokenFromUrl(`/f/${T}`)).toBe(T);
    expect(familyTokenFromUrl(`/i/${T}`)).toBeNull();
    expect(familyTokenFromUrl(`/f/${T}0`)).toBeNull();
    expect(familyTokenFromUrl(null)).toBeNull();
  });

  it('writes the S52 text from her own phone', () => {
    expect(familyInviteText({ parent: 'Dana Kim', sitter: 'Maya Rodriguez', token: T })).toBe(
      `Hi Dana! It’s Maya. I use BabyBadger for my babysitting schedule. Here’s an invite so you can see my shifts with your kids: https://babybadger.app/f/${T}`,
    );
    expect(familyInviteText({ parent: '  ', sitter: '', token: T })).toMatch(/^Hi! I use BabyBadger/);
    expect(familyInviteSubject('Maya Rodriguez')).toBe('Maya invited you to BabyBadger');
    expect(familyInviteSubject('')).toBe('An invite to BabyBadger');
  });

  it('shows only her first name and initial on S0f', () => {
    expect(sitterShort({ sitter_first: 'Maya', sitter_initial: 'R' })).toBe('Maya R.');
    expect(sitterShort({ sitter_first: 'Maya', sitter_initial: '' })).toBe('Maya');
    expect(sitterShort({})).toBe('Your sitter');
    expect(familyLandingTitle({ sitter_first: 'Maya' })).toBe('Maya invited you to BabyBadger');
    expect(familyLandingTitle({})).toBe('Your sitter invited you to BabyBadger');
  });

  it('explains links that can’t be used', () => {
    expect(familyClosedCopy('open')).toBeNull();
    expect(familyClosedCopy('unknown')).toBeNull();
    expect(familyClosedCopy('expired')?.title).toBe('This invite has expired');
    expect(familyClosedCopy('used')?.title).toBe('This invite was already used');
    expect(familyClosedCopy('closed')?.title).toBe('This invite was cancelled');
    expect(familyClosedCopy('not_found')?.title).toBe('We can’t find this invite');
  });

  it('turns claim errors into plain words (P3d)', () => {
    expect(claimErrorText('already_connected', 'Maya')).toBe('Maya already sits for your family. You’ll find her on your Sitters tab.');
    expect(claimErrorText('used', 'Maya')).toBe(familyClosedCopy('used')!.body);
    expect(claimErrorText('expired', 'Maya')).toBe(familyClosedCopy('expired')!.body);
    expect(claimErrorText('Something else', 'Maya')).toBe('Something else');
  });
});

describe('family invites list (S52b)', () => {
  it('names a row by the joined family, then what she typed', () => {
    expect(referralTitle(ref({ joined_family_name: 'The Kim family', family_name: 'Kims', parent_name: 'Dana' }))).toBe('The Kim family');
    expect(referralTitle(ref({ family_name: 'The Ortiz family', parent_name: 'Ana' }))).toBe('The Ortiz family');
    expect(referralTitle(ref({ parent_name: 'Priya' }))).toBe('Priya');
    expect(referralTitle(ref())).toBe('Family invite');
  });

  it('picks the pill', () => {
    expect(referralPill(ref())).toEqual({ label: 'Sent', kind: 'muted' });
    expect(referralPill(ref({ status: 'expired' }))).toEqual({ label: 'Expired', kind: 'warn' });
    expect(referralPill(ref({ status: 'used', invite_token: T }))).toEqual({ label: 'Joined · review', kind: 'info' });
    expect(referralPill(ref({ status: 'used', connected: true }))).toEqual({ label: 'Joined', kind: 'ok' });
    expect(referralPill(ref({ status: 'used' }))).toEqual({ label: 'Joined', kind: 'ok' });
  });

  it('writes the sub-line', () => {
    expect(referralSub(ref({ parent_name: 'Ana', family_name: 'The Ortiz family' }))).toBe('Ana · Sent Oct 7 · link works until Nov 6');
    expect(referralSub(ref({ parent_name: 'Ana' }))).toBe('Sent Oct 7 · link works until Nov 6');
    expect(referralSub(ref({ status: 'expired', expires_at: '2026-10-02T15:00:00Z' }))).toBe('Link expired Oct 2');
    expect(referralSub(ref({ status: 'used', invite_token: T }))).toBe('They chose what you can see. Review and accept.');
    expect(referralSub(ref({ status: 'used', connected: true, joined_at: '2026-10-08T15:00:00Z' }))).toBe('Joined Oct 8 · you’re connected');
  });

  it('counts open invites', () => {
    expect(openCount([ref(), ref({ status: 'used' }), ref({ status: 'expired' }), ref()])).toBe(2);
  });
});

describe('be found later (S12, S13)', () => {
  it('says what the switch means', () => {
    expect(foundLaterBody(false)).toMatch(/Off until you turn it on\. Nothing is shared today\.$/);
    expect(foundLaterBody(true)).toBe('You’ll be first in line. We’ll ask before anything goes live.');
  });
});
