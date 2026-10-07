import { describe, expect, it } from '@jest/globals';

import {
  can,
  defaultRole,
  familyPhrase,
  initials,
  invitePill,
  inviteSub,
  isFull,
  isLastParent,
  isRelation,
  joinBlockCopy,
  MAX_FAMILY_MEMBERS,
  memberClosedCopy,
  memberErrorText,
  memberInviteSubject,
  memberInviteText,
  memberLandingTitle,
  memberLinkAppUrl,
  memberLinkUrl,
  membersRowValue,
  memberSub,
  memberTitle,
  memberTokenFromUrl,
  roleLabel,
  roleOf,
  seatsUsed,
  type MemberInvite,
} from '../family-members';

const TOKEN = 'a'.repeat(40);
const inv = (status: MemberInvite['status'], extra: Partial<MemberInvite> = {}): MemberInvite => ({
  id: 'i',
  link_token: TOKEN,
  name: 'Sue',
  relation: 'Grandma',
  role: 'helper',
  email: null,
  created_at: '2026-10-07T15:00:00Z',
  expires_at: '2026-10-14T15:00:00Z',
  sent_at: '2026-10-07T15:00:00Z',
  status,
  ...extra,
});

describe('member limits', () => {
  it('counts members plus open invites toward 4', () => {
    expect(MAX_FAMILY_MEMBERS).toBe(4);
    expect(seatsUsed([1, 2], [inv('open'), inv('expired')])).toBe(3);
    expect(isFull([1, 2, 3], [inv('open')])).toBe(true);
    expect(isFull([1, 2, 3], [inv('expired')])).toBe(false);
    expect(isFull([1, 2, 3, 4], [])).toBe(true);
  });
  it('keeps the last parent', () => {
    const members = [
      { user_id: 'jen', role: 'parent' as const },
      { user_id: 'sue', role: 'helper' as const },
    ];
    expect(isLastParent(members, 'jen')).toBe(true);
    expect(isLastParent(members, 'sue')).toBe(false);
    expect(isLastParent([...members, { user_id: 'dan', role: 'parent' as const }], 'jen')).toBe(false);
    expect(isLastParent(members, 'nobody')).toBe(false);
  });
});

describe('roles', () => {
  it('lets parents do everything and helpers watch, message and react', () => {
    for (const a of ['manage_members', 'manage_sitters', 'billing', 'requirements', 'pay', 'book', 'edit_family', 'message', 'view'] as const) expect(can('parent', a)).toBe(true);
    expect(can('helper', 'view')).toBe(true);
    expect(can('helper', 'message')).toBe(true);
    expect(can('helper', 'react')).toBe(true);
    for (const a of ['manage_members', 'manage_sitters', 'billing', 'requirements', 'pay', 'book', 'edit_family'] as const) expect(can('helper', a)).toBe(false);
    // Before migration 30 there's no role: a parent.
    expect(can(undefined, 'billing')).toBe(true);
  });
  it('labels and defaults', () => {
    expect(roleLabel('helper')).toBe('Family helper');
    expect(roleLabel('parent')).toBe('Parent');
    expect(roleOf({ role: 'helper' })).toBe('helper');
    expect(roleOf({})).toBe('parent');
    expect(defaultRole('Dad')).toBe('parent');
    expect(defaultRole('Mom')).toBe('parent');
    expect(defaultRole('Grandma')).toBe('helper');
    expect(defaultRole('')).toBe('helper');
    expect(isRelation('Aunt')).toBe(true);
    expect(isRelation('Cousin')).toBe(false);
  });
});

describe('list labels', () => {
  it('builds the Settings row', () => {
    expect(membersRowValue(['Jen Lee', 'Dan Lee'])).toBe('Jen, Dan · 2 of 4');
    expect(membersRowValue(['Jen Lee'])).toBe('Jen · 1 of 4');
  });
  it('names rows', () => {
    expect(memberTitle({ name: 'Jen Lee', me: true })).toBe('Jen Lee · You');
    expect(memberTitle({ name: ' ', me: false })).toBe('Family member');
    expect(memberSub({ relation: 'Grandma' })).toBe('Grandma');
    expect(memberSub({ relation: null })).toBe('');
    expect(initials('Jen Lee')).toBe('JL');
    expect(initials('sue')).toBe('S');
    expect(initials('')).toBe('?');
  });
  it('describes invites', () => {
    expect(inviteSub(inv('open'))).toBe('Grandma · Sent Oct 7');
    expect(inviteSub(inv('open', { sent_at: null, relation: null }))).toBe('Not sent yet');
    expect(inviteSub(inv('expired'))).toBe('Grandma · Link expired Oct 14');
    expect(invitePill(inv('open'))).toEqual({ label: 'Family helper', kind: 'muted' });
    expect(invitePill(inv('open', { role: 'parent' }))).toEqual({ label: 'Parent', kind: 'info' });
    expect(invitePill(inv('expired'))).toEqual({ label: 'Expired', kind: 'warn' });
  });
});

describe('links and text', () => {
  it('makes and reads /m links', () => {
    expect(memberLinkUrl(TOKEN)).toBe(`https://babybadger.app/m/${TOKEN}`);
    expect(memberLinkAppUrl(TOKEN)).toBe(`babybadger://m/${TOKEN}`);
    expect(memberTokenFromUrl(`https://babybadger.app/m/${TOKEN}?x=1`)).toBe(TOKEN);
    expect(memberTokenFromUrl(`/m/${TOKEN}`)).toBe(TOKEN);
    expect(memberTokenFromUrl(`/f/${TOKEN}`)).toBeNull();
    expect(memberTokenFromUrl('/m/123')).toBeNull();
  });
  it('writes the invite text', () => {
    expect(memberInviteText({ name: 'Sue Bell', from: 'Jen Lee', family: 'The Lee family', kids: ['Ava', 'Leo'], token: TOKEN })).toBe(
      `Hi Sue! It’s Jen. I added you to the Lee family on BabyBadger so you can see Ava and Leo’s schedule and updates: https://babybadger.app/m/${TOKEN}`,
    );
    expect(memberInviteText({ name: '', from: '', family: '', kids: [], token: TOKEN })).toBe(
      `Hi! I added you to our family on BabyBadger so you can see the kids’ schedule and updates: https://babybadger.app/m/${TOKEN}`,
    );
    expect(memberInviteSubject('Jen Lee', 'The Lee family')).toBe('Jen added you to the Lee family on BabyBadger');
    expect(familyPhrase('The Lee family')).toBe('the Lee family');
    expect(familyPhrase('Smiths')).toBe('Smiths');
  });
  it('words the landing page and closed links', () => {
    expect(memberLandingTitle({ invited_by: 'Jen', family_name: 'The Lee family' })).toBe('Jen invited you to the Lee family on BabyBadger');
    expect(memberClosedCopy('open')).toBeNull();
    expect(memberClosedCopy('unknown')).toBeNull();
    expect(memberClosedCopy('expired')?.body).toMatch(/7 days/);
    expect(memberClosedCopy('used')?.title).toBe('This invite was already used');
    expect(joinBlockCopy(null, 'The Lee family')).toBeNull();
    expect(joinBlockCopy('other_family', 'The Lee family')?.title).toBe('You’re already in another family');
    expect(joinBlockCopy('already_member', 'The Lee family')?.title).toBe('You’re already in the Lee family');
  });
  it('explains errors', () => {
    expect(memberErrorText('family_full')).toBe('Your family has 4 members, the most a plan covers.');
    expect(memberErrorText('last_parent')).toMatch(/at least one parent/);
    expect(memberErrorText('already_member', 'Sue')).toBe('Sue is already in your family.');
    expect(memberErrorText('not a parent of this family')).toBe('Only a parent can do that.');
    expect(memberErrorText('expired')).toMatch(/7 days/);
    expect(memberErrorText('Something else')).toBe('Something else');
  });
});
