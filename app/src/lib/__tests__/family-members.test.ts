import { describe, expect, it } from '@jest/globals';

import {
  accessOf,
  accessSub,
  can,
  defaultRole,
  familyPhrase,
  initials,
  invitePill,
  inviteSub,
  isFull,
  isLastParent,
  isOwnerMember,
  managesSeatsLine,
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
  memberPill,
  membersRowValue,
  memberSub,
  memberTitle,
  memberTokenFromUrl,
  ownerFirstName,
  roleForAccess,
  roleLabel,
  roleOf,
  seatsLine,
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
    // migration 32 sends the count (a non-owner gets no invites)
    expect(seatsUsed([1, 2], [], 3)).toBe(3);
    expect(seatsUsed([1, 2], [inv('open')], 2)).toBe(3);
    expect(seatsLine(2)).toBe('4 seats · 2 used');
    expect(seatsLine(5)).toBe('4 seats · 4 used');
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

describe('access levels and the owner', () => {
  it('gives full access everything but seats and billing; read only watches, messages and reacts', () => {
    for (const a of ['manage_sitters', 'requirements', 'pay', 'book', 'edit_family', 'message', 'view'] as const) expect(can('parent', a)).toBe(true);
    for (const a of ['manage_members', 'billing'] as const) {
      expect(can('parent', a)).toBe(false);
      expect(can('parent', a, true)).toBe(true);
      expect(can('helper', a)).toBe(false);
    }
    expect(can('helper', 'view')).toBe(true);
    expect(can('helper', 'message')).toBe(true);
    expect(can('helper', 'react')).toBe(true);
    for (const a of ['manage_sitters', 'requirements', 'pay', 'book', 'edit_family'] as const) expect(can('helper', a)).toBe(false);
    // Before migration 30 there's no role: full access.
    expect(can(undefined, 'book')).toBe(true);
  });
  it('labels and defaults', () => {
    expect(roleLabel('helper')).toBe('Read only');
    expect(roleLabel('parent')).toBe('Full access');
    expect(accessOf('helper')).toBe('read_only');
    expect(accessOf('parent')).toBe('full');
    expect(accessOf(null)).toBe('full');
    expect(roleForAccess(true)).toBe('parent');
    expect(roleForAccess(false)).toBe('helper');
    expect(accessSub('parent')).toBe('Can book shifts, edit the care plan and manage sitters.');
    expect(accessSub('helper')).toBe('Sees the kids, schedule, live shift and updates. Can message the sitter.');
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
    expect(membersRowValue(['Jen Lee', 'Dan Lee'])).toBe('Jen, Dan · 2 of 4 seats');
    expect(membersRowValue(['Jen Lee'])).toBe('Jen · 1 of 4 seats');
  });
  it('finds the owner', () => {
    const members = [
      { name: 'Jen Lee', role: 'parent' as const, owner: false, creator: true },
      { name: 'Dan Lee', role: 'parent' as const, owner: true, creator: false },
      { name: 'Sue Bell', role: 'helper' as const, owner: false, creator: false },
    ];
    expect(isOwnerMember(members[1])).toBe(true);
    // before migration 32: the creator
    expect(isOwnerMember({ creator: true })).toBe(true);
    expect(ownerFirstName(members)).toBe('Dan');
    expect(ownerFirstName([])).toBe('');
    expect(memberPill(members[1])).toEqual({ label: 'Owner', kind: 'ok' });
    expect(memberPill(members[0])).toEqual({ label: 'Full access', kind: 'info' });
    expect(memberPill(members[2])).toEqual({ label: 'Read only', kind: 'muted' });
    expect(managesSeatsLine('Jen Lee')).toBe('Jen manages seats.');
    expect(managesSeatsLine('')).toBe('The family’s owner manages seats.');
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
    expect(invitePill(inv('open'))).toEqual({ label: 'Read only', kind: 'muted' });
    expect(invitePill(inv('open', { role: 'parent' }))).toEqual({ label: 'Full access', kind: 'info' });
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
    expect(memberErrorText('last_parent')).toMatch(/full access/);
    expect(memberErrorText('owner_leave')).toBe('You’re the owner. Make someone else the owner before you leave.');
    expect(memberErrorText('owner_access')).toBe('The owner always has full access.');
    expect(memberErrorText('needs_full_access')).toMatch(/^Give them full access first/);
    expect(memberErrorText('not the family owner')).toBe('Only the family’s owner can do that.');
    expect(memberErrorText('already_member', 'Sue')).toBe('Sue is already in your family.');
    expect(memberErrorText('not a parent of this family')).toBe('Only someone with full access can do that.');
    expect(memberErrorText('expired')).toMatch(/7 days/);
    expect(memberErrorText('Something else')).toBe('Something else');
  });
});
