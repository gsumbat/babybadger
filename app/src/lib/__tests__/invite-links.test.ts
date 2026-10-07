import { describe, expect, it } from '@jest/globals';

import {
  cardTitle,
  closedCopy,
  emailOk,
  familyPlural,
  firstWord,
  fullName,
  inviteAppUrl,
  inviteMailto,
  inviteText,
  inviteUrl,
  isInviteCode,
  isLinkToken,
  landingTitle,
  namesLine,
  splitName,
  storeButton,
  tokenFromUrl,
} from '../invite-links';

const T = '3f9c2a7b1e0d4c6a8b5f2e1d0c9b8a7f6e5d4c3b';

describe('invite links (S0a, S0b, P24)', () => {
  it('builds the links', () => {
    expect(inviteUrl(T)).toBe(`https://babybadger.app/i/${T}`);
    expect(inviteAppUrl(T)).toBe(`babybadger://i/${T}`);
    expect(isLinkToken(T)).toBe(true);
    expect(isLinkToken('274139')).toBe(false);
    expect(isLinkToken(T.toUpperCase())).toBe(false);
    expect(isLinkToken(T.slice(1))).toBe(false);
    expect(isInviteCode('274139')).toBe(true);
    expect(isInviteCode('27413')).toBe(false);
    expect(isInviteCode('[code]')).toBe(false);
    expect(isInviteCode(undefined)).toBe(false);
  });
  it('finds the token in a link, never a 6-digit code', () => {
    expect(tokenFromUrl(`https://babybadger.app/i/${T}`)).toBe(T);
    expect(tokenFromUrl(`babybadger://i/${T}?x=1`)).toBe(T);
    expect(tokenFromUrl(`/i/${T}`)).toBe(T);
    expect(tokenFromUrl('/i/274139')).toBeNull();
    expect(tokenFromUrl(`/i/${T}0`)).toBeNull();
    expect(tokenFromUrl(null)).toBeNull();
  });
  it('lists names', () => {
    expect(namesLine([])).toBe('');
    expect(namesLine(['Ava'])).toBe('Ava');
    expect(namesLine(['Ava', 'Leo'])).toBe('Ava and Leo');
    expect(namesLine(['Ava', ' Leo ', 'Mia', ''])).toBe('Ava, Leo and Mia');
  });
  it('writes the S0a text with the code as a fallback line', () => {
    expect(inviteText({ sitter: 'Maya', parent: 'Jen', kids: ['Ava', 'Leo'], code: '274139', token: T })).toBe(
      `Hi Maya! It’s Jen. We’re using BabyBadger for Ava and Leo’s schedule. Here’s your invite: https://babybadger.app/i/${T}\n\nOr enter code 274139 in the app.`,
    );
    expect(inviteText({ sitter: '', parent: '', kids: [], code: '000123', token: T })).toBe(
      `Hi! We’re using BabyBadger for the kids’ schedule. Here’s your invite: https://babybadger.app/i/${T}\n\nOr enter code 000123 in the app.`,
    );
    // Before migration 28 there is no token: code only, and the code never goes in a link
    const old = inviteText({ sitter: 'Maya', parent: 'Jen', kids: ['Ava'], code: '274139', token: null });
    expect(old).toBe('Hi Maya! It’s Jen. We’re using BabyBadger for Ava’s schedule. Get the BabyBadger app, choose “I’m a sitter” and enter code 274139.');
    expect(old).not.toContain('/i/');
  });
  it('makes the email link', () => {
    expect(inviteMailto(' maya@example.com ', 'The Lee family invited you to BabyBadger', 'Hi Maya!\nCode')).toBe(
      'mailto:maya%40example.com?subject=The%20Lee%20family%20invited%20you%20to%20BabyBadger&body=Hi%20Maya!%0ACode',
    );
    expect(inviteMailto(null, 'S', 'B')).toBe('mailto:?subject=S&body=B');
  });
  it('checks the optional email', () => {
    expect(emailOk('')).toBe(true);
    expect(emailOk(' maya@example.com ')).toBe(true);
    expect(emailOk('maya@')).toBe(false);
    expect(emailOk('maya example.com')).toBe(false);
  });
  it('shows "coming soon" until a store link is set', () => {
    expect(storeButton('ios', { ios: '', android: '' })).toEqual({ label: 'Coming soon to the App Store', url: null });
    expect(storeButton('android', { ios: '', android: ' ' })).toEqual({ label: 'Coming soon to Google Play', url: null });
    expect(storeButton('ios', { ios: 'https://apps.apple.com/x', android: '' })).toEqual({ label: 'Download for iPhone', url: 'https://apps.apple.com/x' });
    expect(storeButton('android', { ios: '', android: 'https://play.google.com/x' }).label).toBe('Download for Android');
  });
  it('titles the landing page and card', () => {
    const p = { status: 'open' as const, family_name: 'The Lee family', invited_by: 'Jen', kids: [{ name: 'Ava', color: null, age: 7 }, { name: 'Leo', color: null, age: 4 }] };
    expect(landingTitle(p)).toBe('Jen invited you to sit for Ava and Leo');
    expect(landingTitle({ ...p, invited_by: '', kids: [] })).toBe('The Lee family invited you to sit');
    expect(landingTitle({ status: 'unknown' })).toBe('A family invited you to sit');
    expect(cardTitle('The Lee family')).toBe('Invite from the Lee family');
    expect(cardTitle(undefined)).toBe('Family invite');
  });
  it('explains links that no longer work', () => {
    expect(closedCopy('open')).toBeNull();
    expect(closedCopy('unknown')).toBeNull();
    expect(closedCopy('expired')?.title).toBe('This invite has expired');
    expect(closedCopy('used')?.title).toBe('This invite was already used');
    expect(closedCopy('closed')?.title).toBe('This invite was cancelled');
    expect(closedCopy('not_found')?.title).toBe('We can’t find this invite');
  });
  it('splits and joins names (S0d)', () => {
    expect(fullName(' Maya ', ' Rodriguez ')).toBe('Maya Rodriguez');
    expect(fullName('Maya', '')).toBe('Maya');
    expect(splitName('Maya de la Cruz')).toEqual(['Maya', 'de la Cruz']);
    expect(splitName('')).toEqual(['', '']);
    expect(splitName(null)).toEqual(['', '']);
  });
  it('names the family in the S0d note', () => {
    expect(familyPlural('The Lee family')).toBe('The Lees');
    expect(familyPlural('the Ortiz family')).toBe('The Ortizes');
    expect(familyPlural('The Walsh family')).toBe('The Walshes');
    expect(familyPlural('Lee household')).toBe('The family');
    expect(familyPlural(undefined)).toBe('The family');
  });
  it('takes a first name for the text', () => {
    expect(firstWord(' Jen Lee ')).toBe('Jen');
    expect(firstWord('')).toBe('');
    expect(firstWord(null)).toBe('');
  });
});
