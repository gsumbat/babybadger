// Sitter -> family invites (wireframes S52 Invite a family, S52b sent list, S0f family link page, P3d Connect with
// Maya) and the "Be found by new families later" consent (S12 / S13). Pure logic only, so it can be tested on its own.
// A family link is babybadger.app/f/<token>: the referral's own 40-hex token (migration 29), never anything guessable.
// Phase 1: no marketplace. A family only reaches a sitter through the link she sends herself.
import { APP_SCHEME, emailOk, isLinkToken, SITE } from './invite-links';

export { emailOk, isLinkToken };

/** https://babybadger.app/f/<token> */
export function familyLinkUrl(token: string) {
  return `${SITE}/f/${token}`;
}

/** babybadger://f/<token> (opens the installed app on the link). */
export function familyLinkAppUrl(token: string) {
  return `${APP_SCHEME}://f/${token}`;
}

/** The token in ".../f/<token>", "babybadger://f/<token>?x", "/f/<token>". Null when there isn't one. */
export function familyTokenFromUrl(url: string | null | undefined): string | null {
  const m = /(?:^|\/)f\/([0-9a-f]{40})(?:[/?#]|$)/.exec(url ?? '');
  return m ? m[1] : null;
}

/** First word of a name. */
function first(name: string | null | undefined) {
  return (name ?? '').trim().split(/\s+/)[0] ?? '';
}

/**
 * S52: the text Maya sends from her own phone. "Hi Dana! It’s Maya. I use BabyBadger for my babysitting schedule.
 * Here’s an invite so you can see my shifts with your kids: https://babybadger.app/f/<token>"
 */
export function familyInviteText({ parent, sitter, token }: { parent: string | null | undefined; sitter: string | null | undefined; token: string }) {
  const p = first(parent);
  const s = first(sitter);
  const hi = p ? `Hi ${p}!` : 'Hi!';
  const me = s ? ` It’s ${s}.` : '';
  return `${hi}${me} I use BabyBadger for my babysitting schedule. Here’s an invite so you can see my shifts with your kids: ${familyLinkUrl(token)}`;
}

/** S52 Email: subject line. */
export function familyInviteSubject(sitter: string | null | undefined) {
  const s = first(sitter);
  return s ? `${s} invited you to BabyBadger` : 'An invite to BabyBadger';
}

// ---------------------------------------------------------------- S52b list (my_family_referrals, migration 29)

export type ReferralStatus = 'open' | 'used' | 'closed' | 'expired';

export type Referral = {
  id: string;
  token: string;
  parent_name: string | null;
  family_name: string | null;
  email: string | null;
  created_at: string;
  expires_at: string;
  joined_at: string | null;
  status: ReferralStatus;
  joined_family_name: string | null;
  /** The family's invite while it still waits for her (Review invite -> /i/<token>). */
  invite_token: string | null;
  /** She accepted the family's invite (family_sitters row). */
  connected: boolean;
};

/** S52b pill: Sent / Joined / Expired. A joined family she still has to accept reads "Joined · review". */
export function referralPill(r: Pick<Referral, 'status' | 'invite_token' | 'connected'>): { label: string; kind: 'ok' | 'info' | 'warn' | 'muted' } {
  if (r.status === 'used') return r.connected ? { label: 'Joined', kind: 'ok' } : r.invite_token ? { label: 'Joined · review', kind: 'info' } : { label: 'Joined', kind: 'ok' };
  if (r.status === 'expired') return { label: 'Expired', kind: 'warn' };
  if (r.status === 'closed') return { label: 'Cancelled', kind: 'muted' };
  return { label: 'Sent', kind: 'muted' };
}

/** S52b row title: the family's real name once it joined, else what she typed ("The Kim family", "Dana"), else "Family invite". */
export function referralTitle(r: Pick<Referral, 'joined_family_name' | 'family_name' | 'parent_name'>) {
  return r.joined_family_name?.trim() || r.family_name?.trim() || r.parent_name?.trim() || 'Family invite';
}

/** "Oct 7" from an ISO time (US format). */
function shortDay(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/** S52b row sub-line. */
export function referralSub(r: Pick<Referral, 'status' | 'created_at' | 'expires_at' | 'joined_at' | 'parent_name' | 'family_name' | 'joined_family_name' | 'invite_token' | 'connected'>) {
  if (r.status === 'used') {
    if (r.connected) return `Joined ${shortDay(r.joined_at ?? r.created_at)} · you’re connected`;
    if (r.invite_token) return 'They chose what you can see. Review and accept.';
    return `Joined ${shortDay(r.joined_at ?? r.created_at)}`;
  }
  if (r.status === 'expired') return `Link expired ${shortDay(r.expires_at)}`;
  const who = r.parent_name && r.family_name ? `${r.parent_name} · ` : '';
  return `${who}Sent ${shortDay(r.created_at)} · link works until ${shortDay(r.expires_at)}`;
}

/** Open = still counts toward the 20 cap (S52 shows the cap note near it). */
export const MAX_OPEN_REFERRALS = 20;
export function openCount(list: Pick<Referral, 'status'>[]) {
  return list.filter((r) => r.status === 'open').length;
}

// ---------------------------------------------------------------- S0f landing (family_referral_preview, migration 29)

export type FamilyLinkStatus = ReferralStatus | 'not_found' | 'unknown';

export type FamilyLinkPreview = {
  status: FamilyLinkStatus;
  sitter_first?: string;
  sitter_initial?: string;
  initials?: string;
  expires_at?: string;
  mine?: boolean;
};

/** "Maya R." (or "Maya", or "Your sitter"). */
export function sitterShort(p: Pick<FamilyLinkPreview, 'sitter_first' | 'sitter_initial'>) {
  const f = p.sitter_first?.trim();
  if (!f) return 'Your sitter';
  return p.sitter_initial ? `${f} ${p.sitter_initial}.` : f;
}

/** S0f title: "Maya invited you to BabyBadger". */
export function familyLandingTitle(p: Pick<FamilyLinkPreview, 'sitter_first'>) {
  return `${p.sitter_first?.trim() || 'Your sitter'} invited you to BabyBadger`;
}

/** S0f for a link that can't be used. Null for an open (or unchecked) link. */
export function familyClosedCopy(status: FamilyLinkStatus): { title: string; body: string } | null {
  switch (status) {
    case 'expired':
      return { title: 'This invite has expired', body: 'Invite links work for 30 days. Ask your sitter to send you a new one.' };
    case 'used':
      return { title: 'This invite was already used', body: 'A family already joined with this link. If it wasn’t you, ask your sitter for a new one.' };
    case 'closed':
      return { title: 'This invite was cancelled', body: 'Ask your sitter to send you a new one if you still need it.' };
    case 'not_found':
      return { title: 'We can’t find this invite', body: 'Check the link in your sitter’s message, or ask her to send you a new one.' };
    default:
      return null;
  }
}

/** P3d: what claim_family_referral's errors mean for the parent. */
export function claimErrorText(message: string, sitter: string) {
  if (/already_connected/.test(message)) return `${sitter} already sits for your family. You’ll find her on your Sitters tab.`;
  if (/^used$/.test(message)) return familyClosedCopy('used')!.body;
  if (/^expired$/.test(message)) return familyClosedCopy('expired')!.body;
  if (/^closed$/.test(message)) return familyClosedCopy('closed')!.body;
  if (/^not_found$/.test(message)) return familyClosedCopy('not_found')!.body;
  return message;
}

// ---------------------------------------------------------------- "Be found by new families later" (S12, S13)

export const FOUND_LATER = {
  title: 'Be found by new families later',
  off: 'When BabyBadger opens to new families near you, we can show your profile. Off until you turn it on. Nothing is shared today.',
  on: 'You’ll be first in line. We’ll ask before anything goes live.',
};

export function foundLaterBody(on: boolean) {
  return on ? FOUND_LATER.on : FOUND_LATER.off;
}
