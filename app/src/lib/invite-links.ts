// Invite links (wireframes S0a text, S0b web landing, P24 Send by text / Email / Copy link). Pure logic only, no
// Supabase or storage, so it can be tested on its own.
// A link carries the invite's long random link_token (migration 28), never the 6-digit code: the public page can't be
// found by guessing. The code stays for typing in the app (S51) and as the last line of the parent's text.

/** The site that serves the invite page (babybadger.app/i/<token>) and the universal / app links. */
export const SITE = 'https://babybadger.app';
/** The app's own URL scheme (app.json "scheme"), for "I already have BabyBadger" on the web page. */
export const APP_SCHEME = 'babybadger';

/**
 * Store pages. TODO(George): paste the real links once the apps are live (App Store: after Apple approves the app;
 * Google Play: after the first release). Until a link is set, its button reads "Coming soon to …" and does nothing.
 */
export const STORE_URLS: { ios: string; android: string } = {
  ios: '', // e.g. https://apps.apple.com/us/app/babybadger/id0000000000
  android: '', // e.g. https://play.google.com/store/apps/details?id=com.jobbadger.babybadger
};

export type Store = 'ios' | 'android';

/** S0b download button: "Download for iPhone", or "Coming soon to the App Store" while there's no link. */
export function storeButton(store: Store, urls: { ios: string; android: string } = STORE_URLS): { label: string; url: string | null } {
  const url = urls[store].trim() || null;
  if (store === 'ios') return { label: url ? 'Download for iPhone' : 'Coming soon to the App Store', url };
  return { label: url ? 'Download for Android' : 'Coming soon to Google Play', url };
}

/** Invite codes are 6 digits (create_invite). */
export function isInviteCode(v: unknown): v is string {
  return typeof v === 'string' && /^\d{6}$/.test(v);
}

/** Link tokens are 40 lower-case hex characters (new_link_token, migration 28). */
export function isLinkToken(v: unknown): v is string {
  return typeof v === 'string' && /^[0-9a-f]{40}$/.test(v);
}

/** https://babybadger.app/i/<token> */
export function inviteUrl(token: string) {
  return `${SITE}/i/${token}`;
}

/** babybadger://i/<token> (opens the installed app on the invite). */
export function inviteAppUrl(token: string) {
  return `${APP_SCHEME}://i/${token}`;
}

/** The token in a link or path: ".../i/<token>", "babybadger://i/<token>?x", "/i/<token>". Null when there isn't one. */
export function tokenFromUrl(url: string | null | undefined): string | null {
  const m = /(?:^|\/)i\/([0-9a-f]{40})(?:[/?#]|$)/.exec(url ?? '');
  return m ? m[1] : null;
}

/** "Ava", "Ava and Leo", "Ava, Leo and Mia". */
export function namesLine(names: string[]) {
  const n = names.map((x) => x.trim()).filter(Boolean);
  if (n.length <= 1) return n[0] ?? '';
  return `${n.slice(0, -1).join(', ')} and ${n[n.length - 1]}`;
}

/** "Ava and Leo’s" (a name ending in s still gets ’s: "James’s"). */
function possessive(line: string) {
  return `${line}’s`;
}

/**
 * S0a: the text the parent sends from her own phone (P24 Send by text, Email). The code is kept as a last line so
 * the invite still works if the link doesn't open (or the app is installed after the link was tapped). Without a
 * token (database not updated to migration 28 yet) the text gives the code only.
 */
export function inviteText({ sitter, parent, kids, code, token }: { sitter: string; parent: string; kids: string[]; code: string; token: string | null | undefined }) {
  const hi = sitter.trim() ? `Hi ${sitter.trim()}!` : 'Hi!';
  const me = parent.trim() ? ` It’s ${parent.trim()}.` : '';
  const kidsLine = namesLine(kids);
  const whose = kidsLine ? `${possessive(kidsLine)} schedule` : 'the kids’ schedule';
  const start = `${hi}${me} We’re using BabyBadger for ${whose}.`;
  if (!token) return `${start} Get the BabyBadger app, choose “I’m a sitter” and enter code ${code}.`;
  return `${start} Here’s your invite: ${inviteUrl(token)}\n\nOr enter code ${code} in the app.`;
}

/** P24 Email: the subject line. */
export function inviteSubject(familyName: string) {
  return `${familyName} invited you to BabyBadger`;
}

/** mailto: link with the S0a text. `to` is the sitter's email when the parent entered one. */
export function inviteMailto(to: string | null | undefined, subject: string, body: string) {
  return `mailto:${to ? encodeURIComponent(to.trim()) : ''}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

/** P3 "Email (optional)": empty is fine; otherwise it must look like an address. */
export function emailOk(v: string) {
  const t = v.trim();
  return !t || /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(t);
}

// ---------------------------------------------------------------- S0b / S0c preview (invite_link_preview, migration 28)

export type LinkStatus = 'open' | 'used' | 'expired' | 'closed' | 'not_found' | 'unknown';

/** What anyone with the link may see. 'unknown' = the check couldn't run (offline, or migration 28 not run yet). */
export type LinkPreview = {
  status: LinkStatus;
  family_name?: string;
  invited_by?: string;
  invited_by_initials?: string;
  expires_at?: string;
  kids?: { name: string; color: string | null; age: number | null }[];
};

/** S0b title: "Jen invited you to sit for Ava and Leo". */
export function landingTitle(p: LinkPreview) {
  const who = p.invited_by?.trim() || (p.family_name ? p.family_name : 'A family');
  const kids = namesLine((p.kids ?? []).map((k) => k.name));
  return `${who} invited you to sit${kids ? ` for ${kids}` : ''}`;
}

/** S0b / S0c card: "Invite from the Lee family". */
export function cardTitle(familyName: string | undefined) {
  if (!familyName) return 'Family invite';
  return `Invite from ${familyName.replace(/^The /, 'the ')}`;
}

/** S0b2: the page for a link that can't be used any more. Null for an open (or unchecked) invite. */
export function closedCopy(status: LinkStatus): { title: string; body: string } | null {
  switch (status) {
    case 'expired':
      return { title: 'This invite has expired', body: 'Invites work for 7 days. Ask the family to send you a new one.' };
    case 'used':
      return { title: 'This invite was already used', body: 'Each invite works once. If it wasn’t you, ask the family to send you a new one.' };
    case 'closed':
      return { title: 'This invite was cancelled', body: 'Ask the family to send you a new one if you still need it.' };
    case 'not_found':
      return { title: 'We can’t find this invite', body: 'Check the link in the family’s message, or ask them to send you a new one.' };
    default:
      return null;
  }
}

/** S0d: first + last name -> the profile's full name. */
export function fullName(first: string, last: string) {
  return `${first.trim()} ${last.trim()}`.trim().replace(/\s+/g, ' ');
}

/** S0d: "Maya Rodriguez" -> ["Maya", "Rodriguez"]; "Maya" -> ["Maya", ""]. */
export function splitName(full: string | null | undefined): [string, string] {
  const parts = (full ?? '').trim().split(/\s+/).filter(Boolean);
  return [parts[0] ?? '', parts.slice(1).join(' ')];
}

/** S0d note: "The Lee family" -> "The Lees" ("The Lees will tell you what they need"). */
export function familyPlural(familyName: string | null | undefined) {
  const m = /^the (.+) family$/i.exec((familyName ?? '').trim());
  if (!m) return 'The family';
  const n = m[1].trim();
  return `The ${/(s|sh|ch|x|z)$/i.test(n) ? `${n}es` : `${n}s`}`;
}

/** First word of a name, '' when there is none (for the S0a text: "It’s Jen."). */
export function firstWord(full: string | null | undefined) {
  return (full ?? '').trim().split(/\s+/)[0] ?? '';
}
