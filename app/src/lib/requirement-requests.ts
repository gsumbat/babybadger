// Requirement requests (migration 31; wireframes P11 / P7a status rows, P79 Ask sheet, P79b / P79c document viewer,
// S53 requests, S53b share, S53c "I don't have it", S17d background check upload). Pure logic only, so it can be unit
// tested; the data calls are in ./requirement-requests-api.ts.
//   * Phase 1 ("bring your own sitter"): BabyBadger checks nothing. A parent asks, the sitter shares a card, a report
//     or a confirmation, and a parent of the family taps "Looks good". Only then does the requirement count as met.
//   * Never say "verified", "vetted", "screened" or "safe sitter". Say "shared", "seen by you", "Looks good".

export type RequestStatus = 'asked' | 'shared' | 'met' | 'declined';

export type SharedCredential = {
  id: string;
  kind: string;
  title: string;
  issuer: string | null;
  issued_on: string | null;
  expires_on: string | null;
  /** Only while it is shared with the family (or for the sitter herself). */
  file_path?: string | null;
};

/** One request, as my_requirement_requests / family_requirement_requests return it. */
export type ReqRequest = {
  id: string;
  family_id: string;
  sitter_id: string;
  req_key: string;
  status: RequestStatus;
  /** The parent's note (asking, or asking again). */
  note: string | null;
  asked_at: string | null;
  /** First name of the parent who asked. */
  asked_by: string | null;
  shared_at: string | null;
  sitter_note: string | null;
  reviewed_at: string | null;
  reviewed_by: string | null;
  title: string;
  level: 'must' | 'prefer';
  /** Credential kinds that satisfy it; null = self-declared (a confirmation, no file). */
  kinds: string[] | null;
  why: string | null;
  credential: SharedCredential | null;
};

/** family_requirement_requests: every requirement of the family for one sitter. */
export type FamilyReqRow = {
  requirement_id: string;
  key: string;
  req_key: string;
  title: string;
  level: 'must' | 'prefer';
  kinds: string[] | null;
  /** Languages come from her profile (S16), not from a request. */
  language: boolean;
  speaks: boolean | null;
  request: ReqRequest | null;
};

/** my_requirement_requests: the sitter's requests, one group per family. */
export type FamilyRequests = { family_id: string; family_name: string; requests: ReqRequest[] };

// ---------------------------------------------------------------- which cards count for which requirement
/** Credential kinds that satisfy each requirement key (the same table as req_credential_kinds in migration 31). */
export const CREDENTIAL_KINDS: Record<string, string[]> = {
  background_check: ['background_check'],
  cpr_first_aid: ['first_aid', 'cpr_child'],
  cpr_infant: ['cpr_infant'],
  cpr_child: ['cpr_child'],
  first_aid: ['first_aid'],
  newborn_care: ['newborn_care'],
  water_safety: ['water_safety'],
  vaccination: ['vaccination'],
  drivers_license: ['drivers_license'],
};
const ANY_KIND = ['cpr_infant', 'cpr_child', 'first_aid', 'newborn_care', 'water_safety', 'drivers_license', 'background_check', 'vaccination', 'other'];

/** Kinds for a requirement key; null when she confirms it herself (non-smoker, pets, age 18+, references, the
 * parent's own unless it asks for a document). */
export function kindsFor(key: string, details?: { proof?: string }): string[] | null {
  if (CREDENTIAL_KINDS[key]) return CREDENTIAL_KINDS[key];
  if (key === 'custom' && details?.proof === 'document') return ANY_KIND;
  return null;
}

export const isSelfDeclared = (r: Pick<ReqRequest, 'kinds'>) => !r.kinds;

/** '2026-10-07' for a Date, local time. */
export function dayString(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function isExpired(expiresOn: string | null | undefined, today = new Date()) {
  return !!expiresOn && expiresOn.slice(0, 10) < dayString(today);
}

type CredLite = { id: string; kind: string; expires_on: string | null };

/** S53b: her credentials that can be shared for it, current ones first (latest expiry first), expired ones last. */
export function matchingCredentials<T extends CredLite>(kinds: string[] | null, creds: T[], today = new Date()): { cred: T; expired: boolean }[] {
  if (!kinds) return [];
  return creds
    .filter((c) => kinds.includes(c.kind))
    .map((cred) => ({ cred, expired: isExpired(cred.expires_on, today) }))
    .sort((a, b) => Number(a.expired) - Number(b.expired) || (b.cred.expires_on ?? '9999').localeCompare(a.cred.expires_on ?? '9999'));
}

/** The S15 tile to open from "Add new" (S53b): CPR and First Aid opens First Aid, a background check opens S17d. */
export function addKindFor(kinds: string[] | null): string | null {
  if (!kinds || kinds.length > 2) return null;
  return kinds[0];
}

// ---------------------------------------------------------------- parent side (P11, P7a, P79b)
export type ParentState = 'not_asked' | 'asked' | 'shared' | 'met' | 'declined' | 'expired' | 'speaks' | 'no_language';

/** Where one requirement stands for one sitter, as the family sees it. A card that ran out reads Expired, whether it
 * was shared or already marked Looks good. */
export function parentState(row: Pick<FamilyReqRow, 'language' | 'speaks' | 'request'>, today = new Date()): ParentState {
  if (row.language) return row.speaks ? 'speaks' : 'no_language';
  const q = row.request;
  if (!q) return 'not_asked';
  if ((q.status === 'met' || q.status === 'shared') && isExpired(q.credential?.expires_on, today)) return 'expired';
  return q.status;
}

/** P11 / P7a pill text. */
export const STATE_LABEL: Record<ParentState, string> = {
  not_asked: 'Not asked',
  asked: 'Asked',
  shared: 'Shared, see it',
  met: 'Looks good ✓',
  declined: 'Doesn’t have it',
  expired: 'Expired',
  speaks: 'On her profile ✓',
  no_language: 'Not on her profile',
};

/** Pill color (components/ui Pill kinds). */
export const STATE_PILL: Record<ParentState, 'ok' | 'warn' | 'bad' | 'info' | 'muted'> = {
  not_asked: 'muted',
  asked: 'info',
  shared: 'warn',
  met: 'ok',
  declined: 'bad',
  expired: 'bad',
  speaks: 'ok',
  no_language: 'muted',
};

/** Only "Looks good" (and a language on her profile) counts; an expired card doesn't. */
export function countsAsMet(row: Pick<FamilyReqRow, 'language' | 'speaks' | 'request'>, today = new Date()) {
  const s = parentState(row, today);
  return s === 'met' || s === 'speaks';
}

/** Rows a parent can ask for (P79): not languages, not already shared or met. */
export function askable(rows: FamilyReqRow[], today = new Date()) {
  return rows.filter((r) => !r.language && ['not_asked', 'asked', 'declined', 'expired'].includes(parentState(r, today)));
}

/** P79 pre-checked: the must-haves she hasn't shared or met yet. */
export function askDefaults(rows: FamilyReqRow[], today = new Date()) {
  return askable(rows, today)
    .filter((r) => r.level === 'must')
    .map((r) => r.req_key);
}

/** P11 card head: "2 of 5 look good · 1 to look at". */
export function progressLine(rows: FamilyReqRow[], today = new Date()) {
  const must = rows.filter((r) => r.level === 'must');
  if (!must.length) return '';
  const met = must.filter((r) => countsAsMet(r, today)).length;
  const toSee = rows.filter((r) => parentState(r, today) === 'shared').length;
  const head = met === must.length ? `All ${must.length} look good` : `${met} of ${must.length} look good`;
  return toSee ? `${head} · ${toSee} to look at` : head;
}

/** P11 / P7a "Ask Maya" button: "Ask Maya" with nothing to ask hides it (empty string). */
export function askLabel(name: string, rows: FamilyReqRow[], today = new Date()) {
  return askable(rows, today).length ? `Ask ${name}` : '';
}

// ---------------------------------------------------------------- sitter side (S53, Home)
/** "The Lee family asked for: CPR and First Aid, Infant CPR" (Home Needs you, S14, S53). */
export function askedLine(familyName: string, titles: string[]) {
  return `${familyName} asked for: ${titles.join(', ')}`;
}

/** The requests still waiting for her (asked; a shared card that expired). */
export function waitingOnHer(reqs: ReqRequest[], today = new Date()) {
  return reqs.filter((q) => q.status === 'asked' || (q.status !== 'declined' && isExpired(q.credential?.expires_on, today)));
}

export type SitterState = 'asked' | 'shared' | 'met' | 'declined' | 'expired';
export function sitterState(q: Pick<ReqRequest, 'status' | 'credential'>, today = new Date()): SitterState {
  if (q.status !== 'asked' && q.status !== 'declined' && isExpired(q.credential?.expires_on, today)) return 'expired';
  return q.status;
}

/** S53 pill text on her side. */
export const SITTER_LABEL: Record<SitterState, string> = {
  asked: 'Asked',
  shared: 'Shared, waiting',
  met: 'Looks good ✓',
  declined: 'You don’t have it',
  expired: 'Expired',
};
export const SITTER_PILL: Record<SitterState, 'ok' | 'warn' | 'bad' | 'info' | 'muted'> = {
  asked: 'warn',
  shared: 'info',
  met: 'ok',
  declined: 'muted',
  expired: 'bad',
};

/** S53 sub-line under each request. */
export function sitterSub(q: ReqRequest, today = new Date()) {
  const s = sitterState(q, today);
  if (s === 'asked') return q.note ? `“${q.note}”` : isSelfDeclared(q) ? 'Confirm it for this family' : 'Share a photo of your card';
  if (s === 'shared') return q.credential ? `${q.credential.title} · they’ll take a look` : 'They’ll take a look';
  if (s === 'met') return q.reviewed_by ? `${q.reviewed_by} saw it` : 'Seen by the family';
  if (s === 'expired') return 'Add the new card and share it again';
  return q.sitter_note ? `“${q.sitter_note}”` : 'You told them';
}

/** S53b confirmation for self-declared items. */
export function selfPrompt(key: string, title: string) {
  switch (key) {
    case 'non_smoker':
      return 'I don’t smoke or vape.';
    case 'pets':
      return 'I’m OK with pets.';
    case 'age_18':
      return 'I’m 18 or older.';
    case 'references':
      return 'I can give 2 past families you can call.';
    default:
      return `Yes: ${title}`;
  }
}

function ageYears(birthdate: string, today: Date) {
  const [y, m, d] = birthdate.slice(0, 10).split('-').map(Number);
  let years = today.getFullYear() - y;
  if (today.getMonth() + 1 < m || (today.getMonth() + 1 === m && today.getDate() < d)) years--;
  return years;
}

/** Age 18+: her birthday decides when she gave one. null = no birthday (she confirms it herself). */
export function ageCheck(birthdate: string | null | undefined, today = new Date()): { ok: boolean; line: string } | null {
  if (!birthdate) return null;
  const age = ageYears(birthdate, today);
  return age >= 18 ? { ok: true, line: `Your birthday says you’re ${age}.` } : { ok: false, line: 'Your birthday says you’re under 18, so you can’t share this one.' };
}

// ---------------------------------------------------------------- viewer (P79b)
/** '2026-06-01' -> '06/01/2026' */
export function usDate(day: string | null | undefined) {
  if (!day) return '';
  const [y, m, d] = day.slice(0, 10).split('-');
  return `${m}/${d}/${y}`;
}

/** P79b date line: "Issued 06/01/2026 · Expires 06/01/2028" ("Expired 09/01/2026" once it ran out). */
export function datesLine(c: Pick<SharedCredential, 'issued_on' | 'expires_on'>, today = new Date()) {
  const parts = [];
  if (c.issued_on) parts.push(`Issued ${usDate(c.issued_on)}`);
  if (c.expires_on) parts.push(`${isExpired(c.expires_on, today) ? 'Expired' : 'Expires'} ${usDate(c.expires_on)}`);
  return parts.join(' · ');
}

export const isPdf = (path: string | null | undefined) => !!path && /\.pdf$/i.test(path);

/** Push / status words a parent sees after reviewing ("Looks good" / "Ask again"). */
export function reviewedLine(q: Pick<ReqRequest, 'status' | 'reviewed_by'>) {
  if (q.status !== 'met') return '';
  return q.reviewed_by ? `${q.reviewed_by} said it looks good` : 'Looks good';
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
/** A timestamp or '2026-10-22' -> 'Oct 22' (local day). */
export function shortDay(at: string | null | undefined) {
  if (!at) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(at)) {
    const [, m, d] = at.split('-').map(Number);
    return `${MONTHS[m - 1]} ${d}`;
  }
  const d = new Date(at);
  return `${MONTHS[d.getMonth()]} ${d.getDate()}`;
}

/** P11 / P79d sub-line under each requirement. */
export function parentSub(row: FamilyReqRow, today = new Date()) {
  const q = row.request;
  const s = parentState(row, today);
  switch (s) {
    case 'speaks':
    case 'no_language':
      return row.level === 'must' ? 'Must have' : 'Nice to have';
    case 'not_asked':
      return 'Not asked yet';
    case 'asked':
      return q?.asked_at ? `Asked ${shortDay(q.asked_at)}` : 'Asked';
    case 'shared':
      return `Shared ${shortDay(q?.shared_at)} · tap to see it`.replace('Shared  ·', 'Shared ·');
    case 'expired':
      return `Expired ${shortDay(q?.credential?.expires_on)}`;
    case 'declined':
      return q?.sitter_note ? `“${q.sitter_note}”` : 'She doesn’t have it';
    case 'met': {
      const who = q?.reviewed_by ? `${q.reviewed_by} said it looks good` : 'Looks good to you';
      const exp = q?.credential?.expires_on;
      const soon = exp && exp.slice(0, 10) <= dayString(new Date(today.getTime() + 30 * 86400000));
      return soon ? `${who} · expires ${shortDay(exp)}` : who;
    }
  }
}

/** P79c (a family helper): "Jen and Sam decide if it looks good." */
export function decidesLine(parents: string[]) {
  const n = parents.map((x) => x.trim()).filter(Boolean);
  if (!n.length) return 'A parent in your family decides if it looks good.';
  const who = n.length === 1 ? n[0] : `${n.slice(0, -1).join(', ')} and ${n[n.length - 1]}`;
  return `${who} ${n.length === 1 ? 'decides' : 'decide'} if it looks good.`;
}
