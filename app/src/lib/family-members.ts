// Family members (wireframes P78 Family members, P78f full, P78v non-owner, P78b / P78br / P78s invite, P78c / P78g /
// P78t / P78e member, P78d join, M0 the babybadger.app/m/<token> page, P4m read-only Home). Pure logic only, so it can be tested on its own.
// 4 seats per family (members plus open invites, migration 30). The owner (families.created_by, migration 32) adds
// people and gives each one an access level with the "Full access" switch:
//   * Full access (stored role 'parent'): everything a parent does (sitters, pay, requirements, bookings, kids, the
//     care plan) except managing seats and the subscription, which only the owner does;
//   * Read only (stored role 'helper', e.g. grandma): sees the kids, schedule, live shift and updates; messages the
//     sitter.
// The owner always has full access and hands the family over with "Make Sam the owner" before leaving.
import { APP_SCHEME, emailOk, isLinkToken, SITE } from './invite-links';

export { emailOk, isLinkToken };

export const MAX_FAMILY_MEMBERS = 4;

/** Stored values (migration 30): 'parent' = Full access, 'helper' = Read only. */
export type MemberRole = 'parent' | 'helper';
/** What the app calls them (migration 32 returns both). */
export type MemberAccess = 'full' | 'read_only';

export function accessOf(role: MemberRole | null | undefined): MemberAccess {
  return role === 'helper' ? 'read_only' : 'full';
}

export function roleForAccess(full: boolean): MemberRole {
  return full ? 'parent' : 'helper';
}
export const RELATIONS = ['Mom', 'Dad', 'Grandma', 'Grandpa', 'Aunt', 'Uncle', 'Other'] as const;
export type Relation = (typeof RELATIONS)[number];

export function isRelation(v: unknown): v is Relation {
  return typeof v === 'string' && (RELATIONS as readonly string[]).includes(v);
}

/** P78b / P78br / P78c "Full access" switch: the line under it changes with the switch. */
export const ACCESS_SUB: Record<MemberAccess, string> = {
  full: 'Can book shifts, edit the care plan and manage sitters.',
  read_only: 'Sees the kids, schedule, live shift and updates. Can message the sitter.',
};

export function accessSub(role: MemberRole | null | undefined) {
  return ACCESS_SUB[accessOf(role)];
}

/** "Full access" / "Read only". */
export function roleLabel(role: MemberRole | null | undefined) {
  return role === 'helper' ? 'Read only' : 'Full access';
}

/** The switch's starting point for a relation: Mom and Dad get full access; relatives read only. */
export function defaultRole(relation: Relation | '' | null | undefined): MemberRole {
  return relation === 'Mom' || relation === 'Dad' ? 'parent' : 'helper';
}

/** Before migration 30 every adult is a parent. */
export function roleOf(row: { role?: string | null } | null | undefined): MemberRole {
  return row?.role === 'helper' ? 'helper' : 'parent';
}

// ---------------------------------------------------------------- what a role may do (the database enforces it too)
export type FamilyAction =
  | 'manage_members'
  | 'manage_sitters'
  | 'billing'
  | 'requirements'
  | 'pay'
  | 'book'
  | 'edit_family'
  | 'message'
  | 'react'
  | 'view';

const HELPER_CAN: FamilyAction[] = ['message', 'react', 'view'];

/** Seats and the subscription are the owner's; everything else needs full access. */
const OWNER_ONLY: FamilyAction[] = ['manage_members', 'billing'];

export function can(role: MemberRole | null | undefined, action: FamilyAction, owner = false) {
  if (OWNER_ONLY.includes(action)) return owner;
  if (role === 'helper') return HELPER_CAN.includes(action);
  return true;
}

/** Full-access screens can be changed by this role (kids, the care plan, rules, places, bookings, sitters). */
export function canManage(role: MemberRole | null | undefined) {
  return can(role, 'edit_family');
}

// ---------------------------------------------------------------- read-only screens
/** The full-access members' first names, in order ("Jen", "Sam"). */
export function parentFirstNames(members: Pick<Member, 'role' | 'name'>[]) {
  return members.filter((m) => m.role === 'parent').map((m) => first(m.name)).filter(Boolean);
}

/**
 * The calm line a read-only member sees where full access has an Add or Edit button: "Jen manages the care plan.",
 * "Jen and Sam manage the care plan." Without names (not loaded yet): "Only full-access members can change this."
 */
export function managedByLine(parents: string[], what: string) {
  const n = parents.map((x) => x.trim()).filter(Boolean);
  if (!n.length) return 'Only full-access members can change this.';
  const who = n.length === 1 ? n[0] : `${n.slice(0, -1).join(', ')} and ${n[n.length - 1]}`;
  return `${who} ${n.length === 1 ? 'manages' : 'manage'} ${what}.`;
}

/** A read-only member looking at a request only full access answers (P8h trip, P9 clock-in away): "Jen will answer.", "Jen or Sam will answer." */
export function willAnswerLine(parents: string[]) {
  const n = parents.map((x) => x.trim()).filter(Boolean);
  if (!n.length) return 'A parent will answer.';
  const who = n.length === 1 ? n[0] : `${n.slice(0, -1).join(', ')} or ${n[n.length - 1]}`;
  return `${who} will answer.`;
}

/**
 * Routes only full access opens (they're behind Stack.Protected in parent/_layout; the database refuses the writes
 * too). Each maps to the read-only screen a read-only member lands on instead, e.g. from a push. First match wins.
 */
const PARENT_ONLY: { test: RegExp; to: (m: RegExpExecArray, query: URLSearchParams) => string }[] = [
  { test: /^\/parent\/kid\/new$/, to: (_m, q) => (q.get('id') ? `/parent/kid/${q.get('id')}` : '/parent') },
  { test: /^\/parent\/care\/item$/, to: (_m, q) => (q.get('id') ? `/parent/care/view?id=${q.get('id')}` : '/parent/care') },
  { test: /^\/parent\/places\/(new|[^/]+)$/, to: () => '/parent/places' },
  { test: /^\/parent\/rules\/(add|rule)$/, to: () => '/parent/rules' },
  { test: /^\/parent\/shift\/new$/, to: () => '/parent/calendar' },
  { test: /^\/parent\/(invite|invite\/[^/]+|sitter-list|pool|pool-ask|pool-week|request\/[^/]+|requirements|requirements\/[^/]+)$/, to: () => '/parent/sitters' },
  { test: /^\/parent\/setup$/, to: () => '/parent' },
];

/** Routes only the owner opens (seats and billing, migration 32): everyone else lands on the screen beside them. */
const OWNER_ONLY_ROUTES: { test: RegExp; to: () => string }[] = [
  { test: /^\/parent\/members\/invite$/, to: () => '/parent/members' },
  { test: /^\/parent\/(plans|trial-started|subscription|cancel)$/, to: () => '/parent/settings' },
];

function splitUrl(url: string) {
  const i = url.indexOf('?');
  const path = (i < 0 ? url : url.slice(0, i)).replace(/\/+$/, '') || '/';
  return { path, query: new URLSearchParams(i < 0 ? '' : url.slice(i + 1)) };
}

/** Is this a full-access-only screen ("/parent/care/item?id=…", "/parent/request/abc")? */
export function isParentOnlyRoute(url: string) {
  const { path } = splitUrl(url);
  return PARENT_ONLY.some((r) => r.test.test(path));
}

/** Is this an owner-only screen (member invites, plans, subscription)? */
export function isOwnerOnlyRoute(url: string) {
  const { path } = splitUrl(url);
  return OWNER_ONLY_ROUTES.some((r) => r.test.test(path));
}

/**
 * Where a tap on a push (data.url) takes this member: the url itself, or the screen beside an owner-only one (for
 * anyone but the owner) or the read-only screen beside a full-access one (for read only).
 */
export function routeForRole(url: string, role: MemberRole | null | undefined, owner = false) {
  const { path, query } = splitUrl(url);
  if (!owner) for (const r of OWNER_ONLY_ROUTES) if (r.test.test(path)) return r.to();
  if (canManage(role)) return url;
  for (const r of PARENT_ONLY) {
    const m = r.test.exec(path);
    if (m) return r.to(m, query);
  }
  return url;
}

// ---------------------------------------------------------------- members and invites (family_members RPC)
export type Member = {
  user_id: string;
  name: string;
  role: MemberRole;
  relation: Relation | null;
  joined_at: string;
  me: boolean;
  creator: boolean;
  /** The family's owner (migration 32; `creator` before it). */
  owner?: boolean;
};

/** Is this member the owner? (Before migration 32: the creator.) */
export function isOwnerMember(m: Pick<Member, 'owner' | 'creator'>) {
  return m.owner ?? m.creator;
}

export type MemberInviteStatus = 'open' | 'used' | 'closed' | 'expired';

export type MemberInvite = {
  id: string;
  link_token: string;
  name: string;
  relation: Relation | null;
  role: MemberRole;
  email: string | null;
  created_at: string;
  expires_at: string;
  sent_at: string | null;
  status: MemberInviteStatus;
};

export type FamilyMembers = {
  max: number;
  my_role: MemberRole;
  members: Member[];
  invites: MemberInvite[];
  /** Migration 32: the owner's user id, whether it's you, and members plus open invites (non-owners get no invites). */
  owner?: string;
  i_own?: boolean;
  seats_used?: number;
};

/** Members plus open (not expired) invites: what counts toward the 4. */
export function seatsUsed(members: unknown[], invites: Pick<MemberInvite, 'status'>[], known?: number) {
  const counted = members.length + invites.filter((i) => i.status === 'open').length;
  return typeof known === 'number' ? Math.max(known, counted) : counted;
}

/** P78 header: "4 seats · 2 used". */
export function seatsLine(used: number, max = MAX_FAMILY_MEMBERS) {
  return `${max} seats · ${Math.min(used, max)} used`;
}

/** P78v: what a non-owner reads instead of Add ("Jen manages seats."). */
export function managesSeatsLine(owner: string | null | undefined) {
  const n = first(owner);
  return n ? `${n} manages seats.` : 'The family’s owner manages seats.';
}

/** The owner's first name from the list ("Jen"), or ''. */
export function ownerFirstName(members: Pick<Member, 'owner' | 'creator' | 'name'>[]) {
  return first(members.find(isOwnerMember)?.name);
}

export function isFull(members: unknown[], invites: Pick<MemberInvite, 'status'>[], max = MAX_FAMILY_MEMBERS) {
  return seatsUsed(members, invites) >= max;
}

/** The full-access members in a list. */
export function parentCount(members: Pick<Member, 'role'>[]) {
  return members.filter((m) => m.role === 'parent').length;
}

/** The last full-access member (before migration 32; the owner always has full access now). */
export function isLastParent(members: Pick<Member, 'role' | 'user_id'>[], userId: string) {
  const m = members.find((x) => x.user_id === userId);
  return !!m && m.role === 'parent' && parentCount(members) <= 1;
}

function first(name: string | null | undefined) {
  return (name ?? '').trim().split(/\s+/)[0] ?? '';
}

/** P12b row: "Jen, Dan · 2 of 4 seats". */
export function membersRowValue(names: string[], max = MAX_FAMILY_MEMBERS) {
  const n = names.map(first).filter(Boolean);
  return `${n.join(', ')}${n.length ? ' · ' : ''}${names.length} of ${max} seats`;
}

/** P78 row title: "Jen Lee · You". */
export function memberTitle(m: Pick<Member, 'name' | 'me'>) {
  const name = m.name.trim() || 'Family member';
  return m.me ? `${name} · You` : name;
}

/** P78 row sub-line: the relation ("Grandma"); nothing for someone without one. */
export function memberSub(m: Pick<Member, 'relation'>) {
  return m.relation ?? '';
}

/** P78 avatar letters: "JL", or "S". */
export function initials(name: string | null | undefined) {
  const parts = (name ?? '').trim().split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase() || '?';
}

/** "Oct 7" (US format). */
export function shortDay(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/** P78 invite sub-line: "Grandma · Sent Oct 7", "Grandma · Link expired Oct 14", "Not sent yet". */
export function inviteSub(i: Pick<MemberInvite, 'relation' | 'status' | 'sent_at' | 'created_at' | 'expires_at'>) {
  const rel = i.relation ? `${i.relation} · ` : '';
  if (i.status === 'expired') return `${rel}Link expired ${shortDay(i.expires_at)}`;
  return `${rel}${i.sent_at ? `Sent ${shortDay(i.sent_at)}` : 'Not sent yet'}`;
}

/** P78 invite pill: the access level while open, "Expired" once the link ran out. */
export function invitePill(i: Pick<MemberInvite, 'status' | 'role'>): { label: string; kind: 'info' | 'muted' | 'warn' } {
  if (i.status === 'expired') return { label: 'Expired', kind: 'warn' };
  return { label: roleLabel(i.role), kind: i.role === 'parent' ? 'info' : 'muted' };
}

/** P78 member pill: "Owner" for the owner, else the access level. */
export function memberPill(m: Pick<Member, 'role' | 'owner' | 'creator'>): { label: string; kind: 'ok' | 'info' | 'muted' } {
  if (isOwnerMember(m)) return { label: 'Owner', kind: 'ok' };
  return { label: roleLabel(m.role), kind: m.role === 'parent' ? 'info' : 'muted' };
}

// ---------------------------------------------------------------- links and the text the parent sends
/** https://babybadger.app/m/<token> */
export function memberLinkUrl(token: string) {
  return `${SITE}/m/${token}`;
}

/** babybadger://m/<token> (opens the installed app on the link). */
export function memberLinkAppUrl(token: string) {
  return `${APP_SCHEME}://m/${token}`;
}

/** The token in ".../m/<token>", "babybadger://m/<token>?x", "/m/<token>". Null when there isn't one. */
export function memberTokenFromUrl(url: string | null | undefined): string | null {
  const m = /(?:^|\/)m\/([0-9a-f]{40})(?:[/?#]|$)/.exec(url ?? '');
  return m ? m[1] : null;
}

/** "Ava", "Ava and Leo", "Ava, Leo and Mia". */
function namesLine(names: string[]) {
  const n = names.map((x) => x.trim()).filter(Boolean);
  if (n.length <= 1) return n[0] ?? '';
  return `${n.slice(0, -1).join(', ')} and ${n[n.length - 1]}`;
}

/** "the Lee family" from "The Lee family" (keeps other names as they are). */
export function familyPhrase(family: string | null | undefined) {
  const f = (family ?? '').trim();
  if (!f) return 'our family';
  return /^the\s/i.test(f) ? `the ${f.slice(4)}` : f;
}

/**
 * P78b: "Hi Sue! It’s Jen. I added you to the Lee family on BabyBadger so you can see Ava and Leo’s schedule and
 * updates: https://babybadger.app/m/<token>"
 */
export function memberInviteText({ name, from, family, kids, token }: { name: string; from: string | null | undefined; family: string | null | undefined; kids: string[]; token: string }) {
  const n = first(name);
  const me = first(from);
  const k = namesLine(kids.map(first));
  const fam = familyPhrase(family);
  return `${n ? `Hi ${n}!` : 'Hi!'}${me ? ` It’s ${me}.` : ''} I added you to ${fam} on BabyBadger so you can see ${k ? `${k}’s` : 'the kids’'} schedule and updates: ${memberLinkUrl(token)}`;
}

/** P78b Email subject. */
export function memberInviteSubject(from: string | null | undefined, family: string | null | undefined) {
  const me = first(from);
  return `${me || 'Someone'} added you to ${familyPhrase(family)} on BabyBadger`;
}

// ---------------------------------------------------------------- M0 / P78d (member_invite_preview / _details)
export type MemberLinkStatus = MemberInviteStatus | 'not_found' | 'unknown';

export type MemberLinkPreview = { status: MemberLinkStatus; family_name?: string; invited_by?: string };

export type MemberLinkDetails = MemberLinkPreview & {
  name?: string;
  relation?: Relation | null;
  role?: MemberRole;
  access?: MemberAccess;
  expires_at?: string;
  kids?: string[];
  /** Why the signed-in person can't join (null = they can). */
  block?: 'already_member' | 'other_family' | 'sitter_account' | null;
  mine?: boolean;
};

/** M0 title: "Jen invited you to the Lee family on BabyBadger". */
export function memberLandingTitle(p: Pick<MemberLinkPreview, 'invited_by' | 'family_name'>) {
  const who = p.invited_by?.trim() || 'A parent';
  return `${who} invited you to ${familyPhrase(p.family_name)} on BabyBadger`;
}

/** M0 / P78d for a link that can't be used. Null for an open (or unchecked) link. */
export function memberClosedCopy(status: MemberLinkStatus): { title: string; body: string } | null {
  switch (status) {
    case 'expired':
      return { title: 'This invite has expired', body: 'Family invites work for 7 days. Ask for a new one.' };
    case 'used':
      return { title: 'This invite was already used', body: 'Someone already joined with this link. If it wasn’t you, ask for a new one.' };
    case 'closed':
      return { title: 'This invite was cancelled', body: 'Ask the parent who sent it for a new one if you still need it.' };
    case 'not_found':
      return { title: 'We can’t find this invite', body: 'Check the link in the message, or ask for a new one.' };
    default:
      return null;
  }
}

/** P78d: why someone can't join, in plain words. */
export function joinBlockCopy(block: MemberLinkDetails['block'], family: string | null | undefined): { title: string; body: string } | null {
  const fam = familyPhrase(family);
  switch (block) {
    case 'already_member':
      return { title: `You’re already in ${fam}`, body: 'Open Home to see the kids and updates.' };
    case 'other_family':
      return { title: 'You’re already in another family', body: `An account can belong to one family. Leave your family in Settings › Family members first, or sign in with another email to join ${fam}.` };
    case 'sitter_account':
      return { title: 'This is a sitter account', body: `You’re signed in as a sitter. To join ${fam} as a family member, sign in with another email.` };
    default:
      return null;
  }
}

/** What the member RPCs' short errors mean for the person tapping. */
export function memberErrorText(message: string, name = 'them') {
  if (/family_full/.test(message)) return `Your family has ${MAX_FAMILY_MEMBERS} members, the most a plan covers.`;
  if (/last_parent/.test(message)) return 'A family needs someone with full access. Give someone else full access first.';
  if (/owner_leave/.test(message)) return 'You’re the owner. Make someone else the owner before you leave.';
  if (/owner_access/.test(message)) return 'The owner always has full access.';
  if (/needs_full_access/.test(message)) return 'Give them full access first. The owner needs full access.';
  if (/already_owner/.test(message)) return 'You’re already the owner.';
  if (/not the family owner/.test(message)) return 'Only the family’s owner can do that.';
  if (/already_member/.test(message)) return `${name === 'them' ? 'They’re' : `${name} is`} already in your family.`;
  if (/other_family/.test(message)) return joinBlockCopy('other_family', null)!.body;
  if (/sitter_account/.test(message)) return 'You’re signed in as a sitter. Sign in with another email to join as a family member.';
  if (/^used$/.test(message)) return memberClosedCopy('used')!.body;
  if (/^expired$/.test(message)) return memberClosedCopy('expired')!.body;
  if (/^closed$/.test(message)) return memberClosedCopy('closed')!.body;
  if (/^not_found$/.test(message)) return memberClosedCopy('not_found')!.body;
  if (/not a parent/.test(message)) return 'Only someone with full access can do that.';
  return message;
}
