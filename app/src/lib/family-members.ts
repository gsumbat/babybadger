// Family members (wireframes P78 Family members, P78f full, P78b / P78s invite, P78c / P78e member, P78d join, M0 the
// babybadger.app/m/<token> page, P4m helper's Home). Pure logic only, so it can be tested on its own.
// Up to 4 adults per family (members plus open invites, migration 30). Two roles:
//   * parent: everything (sitters, pay, requirements, bookings, billing, members);
//   * helper ("Family helper", e.g. grandma): sees the kids, schedule, live shift and updates; messages the sitter.
import { APP_SCHEME, emailOk, isLinkToken, SITE } from './invite-links';

export { emailOk, isLinkToken };

export const MAX_FAMILY_MEMBERS = 4;

export type MemberRole = 'parent' | 'helper';
export const RELATIONS = ['Mom', 'Dad', 'Grandma', 'Grandpa', 'Aunt', 'Uncle', 'Other'] as const;
export type Relation = (typeof RELATIONS)[number];

export function isRelation(v: unknown): v is Relation {
  return typeof v === 'string' && (RELATIONS as readonly string[]).includes(v);
}

/** P78b / P78c role cards: label and the one-line explanation. */
export const ROLE_OPTIONS: { value: MemberRole; label: string; sub: string }[] = [
  { value: 'parent', label: 'Parent', sub: 'Everything you can do: sitters, pay and the plan.' },
  { value: 'helper', label: 'Family helper', sub: 'Sees the kids, the schedule and updates. Messages the sitter.' },
];

export function roleLabel(role: MemberRole | null | undefined) {
  return role === 'helper' ? 'Family helper' : 'Parent';
}

/** A sensible role for a relation: Mom and Dad run the family; relatives help. */
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

export function can(role: MemberRole | null | undefined, action: FamilyAction) {
  if (role === 'helper') return HELPER_CAN.includes(action);
  return true;
}

/** Parent-only screens can be changed by this role (kids, the care plan, rules, places, bookings, sitters). */
export function canManage(role: MemberRole | null | undefined) {
  return can(role, 'edit_family');
}

// ---------------------------------------------------------------- read-only screens for a family helper
/** The parents' first names, in order ("Jen", "Sam"). */
export function parentFirstNames(members: Pick<Member, 'role' | 'name'>[]) {
  return members.filter((m) => m.role === 'parent').map((m) => first(m.name)).filter(Boolean);
}

/**
 * The calm read-only line a helper sees where a parent has an Add or Edit button: "Jen manages the care plan.",
 * "Jen and Sam manage the care plan." Without names (not loaded yet, or no parent found): "Only parents can change this."
 */
export function managedByLine(parents: string[], what: string) {
  const n = parents.map((x) => x.trim()).filter(Boolean);
  if (!n.length) return 'Only parents can change this.';
  const who = n.length === 1 ? n[0] : `${n.slice(0, -1).join(', ')} and ${n[n.length - 1]}`;
  return `${who} ${n.length === 1 ? 'manages' : 'manage'} ${what}.`;
}

/** A helper looking at a request only a parent answers (P8h trip, P9 clock-in away): "Jen will answer.", "Jen or Sam will answer." */
export function willAnswerLine(parents: string[]) {
  const n = parents.map((x) => x.trim()).filter(Boolean);
  if (!n.length) return 'A parent will answer.';
  const who = n.length === 1 ? n[0] : `${n.slice(0, -1).join(', ')} or ${n[n.length - 1]}`;
  return `${who} will answer.`;
}

/**
 * Routes only a parent opens (they're behind Stack.Protected in parent/_layout; the database refuses the writes too).
 * Each maps to the read-only screen a helper lands on instead, e.g. from a push. Order matters: first match wins.
 */
const PARENT_ONLY: { test: RegExp; to: (m: RegExpExecArray, query: URLSearchParams) => string }[] = [
  { test: /^\/parent\/kid\/new$/, to: (_m, q) => (q.get('id') ? `/parent/kid/${q.get('id')}` : '/parent') },
  { test: /^\/parent\/care\/item$/, to: () => '/parent/care' },
  { test: /^\/parent\/places\/(new|[^/]+)$/, to: () => '/parent/places' },
  { test: /^\/parent\/rules\/(add|rule)$/, to: () => '/parent/rules' },
  { test: /^\/parent\/shift\/new$/, to: () => '/parent/calendar' },
  { test: /^\/parent\/(invite|invite\/[^/]+|sitter-list|pool|pool-ask|pool-week|request\/[^/]+|requirements|requirements\/[^/]+)$/, to: () => '/parent/sitters' },
  { test: /^\/parent\/members\/invite$/, to: () => '/parent/members' },
  { test: /^\/parent\/(plans|trial-started|subscription|cancel)$/, to: () => '/parent/settings' },
  { test: /^\/parent\/setup$/, to: () => '/parent' },
];

function splitUrl(url: string) {
  const i = url.indexOf('?');
  const path = (i < 0 ? url : url.slice(0, i)).replace(/\/+$/, '') || '/';
  return { path, query: new URLSearchParams(i < 0 ? '' : url.slice(i + 1)) };
}

/** Is this a parent-only screen ("/parent/care/item?id=…", "/parent/request/abc")? */
export function isParentOnlyRoute(url: string) {
  const { path } = splitUrl(url);
  return PARENT_ONLY.some((r) => r.test.test(path));
}

/** Where a tap on a push (data.url) takes this role: the url itself, or a helper's read-only screen for a parent-only one. */
export function routeForRole(url: string, role: MemberRole | null | undefined) {
  if (canManage(role)) return url;
  const { path, query } = splitUrl(url);
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
};

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

export type FamilyMembers = { max: number; my_role: MemberRole; members: Member[]; invites: MemberInvite[] };

/** Members plus open (not expired) invites: what counts toward the 4. */
export function seatsUsed(members: unknown[], invites: Pick<MemberInvite, 'status'>[]) {
  return members.length + invites.filter((i) => i.status === 'open').length;
}

export function isFull(members: unknown[], invites: Pick<MemberInvite, 'status'>[], max = MAX_FAMILY_MEMBERS) {
  return seatsUsed(members, invites) >= max;
}

/** The parents in a list. */
export function parentCount(members: Pick<Member, 'role'>[]) {
  return members.filter((m) => m.role === 'parent').length;
}

/** The last parent can't leave, be removed or become a helper. */
export function isLastParent(members: Pick<Member, 'role' | 'user_id'>[], userId: string) {
  const m = members.find((x) => x.user_id === userId);
  return !!m && m.role === 'parent' && parentCount(members) <= 1;
}

function first(name: string | null | undefined) {
  return (name ?? '').trim().split(/\s+/)[0] ?? '';
}

/** P12b row: "Jen, Dan · 2 of 4". */
export function membersRowValue(names: string[], max = MAX_FAMILY_MEMBERS) {
  const n = names.map(first).filter(Boolean);
  return `${n.join(', ')}${n.length ? ' · ' : ''}${names.length} of ${max}`;
}

/** P78 row title: "Jen Lee · You". */
export function memberTitle(m: Pick<Member, 'name' | 'me'>) {
  const name = m.name.trim() || 'Family member';
  return m.me ? `${name} · You` : name;
}

/** P78 row sub-line: the relation ("Grandma"); nothing for someone without one (the family's creator). */
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

/** P78 invite pill: the role while open, "Expired" once the link ran out. */
export function invitePill(i: Pick<MemberInvite, 'status' | 'role'>): { label: string; kind: 'info' | 'muted' | 'warn' } {
  if (i.status === 'expired') return { label: 'Expired', kind: 'warn' };
  return i.role === 'parent' ? { label: 'Parent', kind: 'info' } : { label: 'Family helper', kind: 'muted' };
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
  if (/last_parent/.test(message)) return 'A family needs at least one parent. Make someone else a parent first.';
  if (/already_member/.test(message)) return `${name === 'them' ? 'They’re' : `${name} is`} already in your family.`;
  if (/other_family/.test(message)) return joinBlockCopy('other_family', null)!.body;
  if (/sitter_account/.test(message)) return 'You’re signed in as a sitter. Sign in with another email to join as a family member.';
  if (/^used$/.test(message)) return memberClosedCopy('used')!.body;
  if (/^expired$/.test(message)) return memberClosedCopy('expired')!.body;
  if (/^closed$/.test(message)) return memberClosedCopy('closed')!.body;
  if (/^not_found$/.test(message)) return memberClosedCopy('not_found')!.body;
  if (/not a parent/.test(message)) return 'Only a parent can do that.';
  return message;
}
