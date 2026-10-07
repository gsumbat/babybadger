// Sitter requirements (migration 20; wireframes P7a, P28–P32, S27). Pure logic only, so it can be unit tested; the
// data calls are in ./requirements.ts.
//   * One row per requirement the family turned on; "Off" = no row. level 'prefer' is the wireframes' "Nice".
//   * key = catalogue key (below), 'language:<Language>' or 'custom' (P31, the parent's own).
//   * The database works out whether a sitter meets each one (sitter_requirement_status); this file turns that into
//     words, counts and the draft the P28–P32 flow and P7a edit before saving.

export type ReqLevel = 'must' | 'prefer';
/** P29 / P30 / P31 segmented control: Must / Nice / Off. */
export type ReqChoice = ReqLevel | 'off';
export type ReqProof = 'self' | 'document';
export type RequirementMode = 'warn' | 'block';
/** P30 "Sitter must have" for Driving. */
export type DriveItem = 'license' | 'record' | 'insurance' | 'car_seats';

export type ReqDetails = {
  within_months?: number;
  applies?: 'car_trips' | 'every';
  items?: DriveItem[];
  /** Which kids ride (P30); null / missing = every kid. */
  kid_ids?: string[] | null;
  language?: string;
  /** P31 "Why it matters (sitter sees this)". */
  why?: string;
  proof?: ReqProof;
};

export type Requirement = {
  id: string;
  family_id: string;
  key: string;
  title: string;
  details: ReqDetails;
  level: ReqLevel;
  position: number;
  created_at: string;
  updated_at: string;
};

/** Reason codes from sitter_requirement_status (migration 20). */
export type ReqReason = 'valid' | 'expiring' | 'speaks' | 'confirmed' | 'reviewed' | 'missing' | 'expired' | 'too_old' | 'unconfirmed' | 'declined' | 'unreviewed';
export type ReqStatusRow = { requirement_id: string; met: boolean; reason: ReqReason; expires_on: string | null };

/** What the draft screens edit. `ref` = the saved id, or a local id for a new row. */
export type ReqDraft = { ref: string; id?: string; key: string; title: string; details: ReqDetails; level: ReqLevel };

export type ReqIcon = 'shield' | 'heart' | 'baby' | 'car' | 'drop' | 'globe' | 'nosmoke' | 'dog' | 'doc';

export type CatalogueItem = {
  key: string;
  /** P29 / P32 / S27 title (what's stored). */
  title: string;
  /** P7a title when it differs ("Driver's license"). */
  listTitle?: string;
  /** P29 sub-line. */
  sub: string;
  /** P7a sub-line. */
  listSub: string;
  section: 'safety' | 'skills';
  icon: ReqIcon;
  details: ReqDetails;
};

export const DEFAULT_DRIVING: ReqDetails = { applies: 'car_trips', items: ['license', 'record', 'car_seats'], kid_ids: null };

/** P29's rows, in its order (SAFETY, then SKILLS AND LIFESTYLE). */
export const CATALOGUE: CatalogueItem[] = [
  { key: 'background_check', title: 'Background check', sub: 'Within 12 months', listSub: 'Within the last 12 months', section: 'safety', icon: 'shield', details: { within_months: 12 } },
  { key: 'cpr_first_aid', title: 'CPR and First Aid', sub: 'Current certificate', listSub: 'Current certificate', section: 'safety', icon: 'heart', details: {} },
  { key: 'cpr_infant', title: 'Infant CPR', sub: 'Suggested for kids under 5', listSub: 'Current certificate', section: 'safety', icon: 'baby', details: {} },
  { key: 'water_safety', title: 'Water safety', sub: 'Pool or beach days', listSub: 'You have a pool? Turn this on', section: 'safety', icon: 'drop', details: {} },
  { key: 'drivers_license', title: 'Driving', listTitle: 'Safe driver’s license', sub: 'License, car seats', listSub: 'Needed for trips by car', section: 'skills', icon: 'car', details: DEFAULT_DRIVING },
  { key: 'non_smoker', title: 'Non-smoker', sub: 'Sitter confirms', listSub: 'Sitter confirms', section: 'skills', icon: 'nosmoke', details: { proof: 'self' } },
];

/** P7a's switch rows, in its order. */
export const LIST_KEYS = ['background_check', 'cpr_first_aid', 'cpr_infant', 'drivers_license', 'water_safety'];

/** P7a "Preferred language" chips shown before any is chosen. */
export const LANGUAGE_SUGGESTIONS = ['Spanish', 'English'];

/** P31 suggestion chips. */
export const CUSTOM_SUGGESTIONS = ['Comfortable with dogs', 'Swims', 'Can cook simple meals', 'Homework help'];

/** P30 checkboxes. */
export const DRIVE_ITEMS: { value: DriveItem; label: string }[] = [
  { value: 'license', label: 'Valid driver’s license' },
  { value: 'record', label: 'Clean driving record (checked)' },
  { value: 'insurance', label: 'Own car insurance' },
  { value: 'car_seats', label: 'Can install car seats' },
];

export function catalogueItem(key: string): CatalogueItem | undefined {
  return CATALOGUE.find((c) => c.key === key);
}

export const isLanguage = (key: string) => key.startsWith('language:');
export const languageOf = (r: Pick<Requirement, 'key' | 'details'>) => r.details.language || r.key.slice('language:'.length);
export const languageKey = (language: string) => `language:${language.trim()}`;

/** How the sitter shows it: credential (BabyBadger checks a certificate), language, self (she says Yes), document
 * (a parent reviews it), mixed (Driving: license + record from her credentials, insurance / car seats she confirms). */
export function proofOf(r: Pick<Requirement, 'key' | 'details'>): 'credential' | 'language' | 'self' | 'document' | 'mixed' {
  if (['background_check', 'cpr_first_aid', 'cpr_infant', 'cpr_child', 'first_aid', 'newborn_care', 'water_safety'].includes(r.key)) return 'credential';
  if (r.key === 'drivers_license') return 'mixed';
  if (isLanguage(r.key)) return 'language';
  return r.details.proof === 'document' ? 'document' : 'self';
}

export function reqIcon(r: Pick<Requirement, 'key' | 'title'>): ReqIcon {
  const c = catalogueItem(r.key);
  if (c) return c.icon;
  if (isLanguage(r.key)) return 'globe';
  return /\b(dogs?|pets?|cats?)\b/i.test(r.title) ? 'dog' : 'doc';
}

/** Wireframe tile colors (background, stroke) per icon. */
export const ICON_TINT: Record<ReqIcon, [string, string]> = {
  shield: ['#DCE7F1', '#47698A'],
  heart: ['#F6DCD6', '#C2412D'],
  baby: ['#F6DCD6', '#C2412D'],
  car: ['#DCE7F1', '#47698A'],
  drop: ['#DCE7F1', '#47698A'],
  globe: ['#F3E1E3', '#7A4E0E'],
  nosmoke: ['#E8ECF1', '#4B5960'],
  dog: ['#F3E1E3', '#7A4E0E'],
  doc: ['#E8ECF1', '#4B5960'],
};

/** Shown title. Languages read "Speaks Spanish". */
export function reqTitle(r: Pick<Requirement, 'key' | 'title' | 'details'>): string {
  if (isLanguage(r.key)) return `Speaks ${languageOf(r)}`;
  return catalogueItem(r.key)?.title ?? r.title;
}

// ---------------------------------------------------------------- kids
function ageYears(birthdate: string, today: Date) {
  const [y, m, d] = birthdate.slice(0, 10).split('-').map(Number);
  let years = today.getFullYear() - y;
  if (today.getMonth() + 1 < m || (today.getMonth() + 1 === m && today.getDate() < d)) years--;
  return Math.max(0, years);
}

type KidLite = { id: string; name: string; birthdate: string | null };

/** The youngest kid under 5, for "Suggested · Leo is under 5" / "Leo is 4". */
export function youngestUnder5(kids: KidLite[], today = new Date()) {
  const aged = kids.filter((k) => k.birthdate).map((k) => ({ kid: k, age: ageYears(k.birthdate!, today) }));
  const under = aged.filter((a) => a.age < 5).sort((a, b) => a.age - b.age);
  return under[0] ?? null;
}

/** P30 "Which kids ride": "Ava · booster" (5–9), "Leo · car seat" (under 5), just the name from 10. */
export function seatLabel(kid: KidLite, today = new Date()) {
  if (!kid.birthdate) return kid.name;
  const age = ageYears(kid.birthdate, today);
  return age < 5 ? `${kid.name} · car seat` : age < 10 ? `${kid.name} · booster` : kid.name;
}

/** P28 "Based on Ava 7, Leo 4 and the permissions you chose". */
export function basedOnLine(kids: KidLite[], fromInvite: boolean, today = new Date()) {
  const names = kids.map((k) => (k.birthdate ? `${k.name} ${ageYears(k.birthdate, today)}` : k.name));
  const list = names.length <= 1 ? (names[0] ?? '') : `${names.slice(0, -1).join(', ')}, ${names[names.length - 1]}`;
  if (!list) return fromInvite ? 'Based on the permissions you chose' : 'Based on your family';
  return fromInvite ? `Based on ${list} and the permissions you chose` : `Based on ${list}`;
}

/** P28 recommended set: background check and CPR for everyone, Infant CPR when a kid is under 5, Driving when the
 * invite allows driving. `why` is the right-hand note. */
export function recommended(kids: KidLite[], canDrive: boolean, today = new Date()): { key: string; why: string }[] {
  const out = [
    { key: 'background_check', why: 'Everyone' },
    { key: 'cpr_first_aid', why: 'Everyone' },
  ];
  const young = youngestUnder5(kids, today);
  if (young) out.push({ key: 'cpr_infant', why: `${young.kid.name} is ${young.age}` });
  if (canDrive) out.push({ key: 'drivers_license', why: 'You allow driving' });
  return out;
}

// ---------------------------------------------------------------- drafts
let seq = 0;
const newRef = () => `new:${++seq}`;

export function toDrafts(reqs: Requirement[]): ReqDraft[] {
  return reqs.map((r) => ({ ref: r.id, id: r.id, key: r.key, title: r.title, details: r.details, level: r.level }));
}

export function catalogueDraft(key: string, level: ReqLevel = 'must'): ReqDraft {
  const c = catalogueItem(key);
  return { ref: newRef(), key, title: c?.title ?? key, details: { ...(c?.details ?? {}) }, level };
}

export function languageDraft(language: string, level: ReqLevel = 'prefer'): ReqDraft {
  const lang = language.trim();
  return { ref: newRef(), key: languageKey(lang), title: `Speaks ${lang}`, details: { language: lang }, level };
}

export function customDraft(title: string, why: string, proof: ReqProof, level: ReqLevel): ReqDraft {
  return { ref: newRef(), key: 'custom', title: title.trim(), details: { why: why.trim(), proof }, level };
}

/** P28: the recommended set (all Must) or nothing ("Build my own"). */
export function startDrafts(choice: 'recommended' | 'blank', kids: KidLite[], canDrive: boolean, today = new Date()): ReqDraft[] {
  return choice === 'blank' ? [] : recommended(kids, canDrive, today).map((r) => catalogueDraft(r.key));
}

export function choiceOf(drafts: ReqDraft[], key: string): ReqChoice {
  return drafts.find((d) => d.key === key)?.level ?? 'off';
}

/** Must / Nice / Off on a catalogue (or language) row: Off removes it, otherwise it's added or its level changes. */
export function setChoice(drafts: ReqDraft[], key: string, choice: ReqChoice, make: () => ReqDraft = () => catalogueDraft(key)): ReqDraft[] {
  const has = drafts.some((d) => d.key === key);
  if (choice === 'off') return drafts.filter((d) => d.key !== key);
  if (has) return drafts.map((d) => (d.key === key ? { ...d, level: choice } : d));
  return [...drafts, { ...make(), level: choice }];
}

/** Replace (or add, or with null remove) one draft by ref. */
export function putDraft(drafts: ReqDraft[], ref: string, next: ReqDraft | null): ReqDraft[] {
  if (!next) return drafts.filter((d) => d.ref !== ref);
  return drafts.some((d) => d.ref === ref) ? drafts.map((d) => (d.ref === ref ? next : d)) : [...drafts, next];
}

/** Saved order: P29's catalogue order, then languages, then the parent's own. */
export function sortDrafts<T extends Pick<ReqDraft, 'key'>>(drafts: T[]): T[] {
  const rank = (k: string) => {
    const i = CATALOGUE.findIndex((c) => c.key === k);
    return i >= 0 ? i : isLanguage(k) ? 100 : 200;
  };
  return drafts.map((d, i) => ({ d, i })).sort((a, b) => rank(a.d.key) - rank(b.d.key) || a.i - b.i).map((x) => x.d);
}

export type ReqWrite = { key: string; title: string; details: ReqDetails; level: ReqLevel; position: number };

/** What to write to go from the saved rows to the draft. */
export function diffDrafts(saved: Requirement[], drafts: ReqDraft[]) {
  const sorted = sortDrafts(drafts);
  const add: ReqWrite[] = [];
  const update: { id: string; fields: Partial<ReqWrite> }[] = [];
  sorted.forEach((d, position) => {
    const was = d.id ? saved.find((s) => s.id === d.id) : undefined;
    const row = { key: d.key, title: d.title, details: d.details, level: d.level, position };
    if (!was) return add.push(row);
    const fields: Partial<ReqWrite> = {};
    if (was.title !== d.title) fields.title = d.title;
    if (JSON.stringify(was.details ?? {}) !== JSON.stringify(d.details ?? {})) fields.details = d.details;
    if (was.level !== d.level) fields.level = d.level;
    if (was.position !== position) fields.position = position;
    if (Object.keys(fields).length) update.push({ id: was.id, fields });
  });
  const keep = new Set(drafts.map((d) => d.id).filter(Boolean));
  const remove = saved.filter((s) => !keep.has(s.id)).map((s) => s.id);
  return { add, update, remove };
}

// ---------------------------------------------------------------- lines
function kidsRiding(d: Pick<ReqDraft, 'details'>, kids: KidLite[], today: Date) {
  const ids = d.details.kid_ids;
  return kids.filter((k) => !ids || ids.includes(k.id)).filter((k) => !k.birthdate || ageYears(k.birthdate, today) < 10);
}

/** P32 sub-line: Driving "Car trips only · seats for Ava, Leo"; self-confirmed and document requirements. */
export function reviewSub(d: Pick<ReqDraft, 'key' | 'details'>, kids: KidLite[], today = new Date()): string {
  if (d.key === 'drivers_license') {
    const parts = [d.details.applies === 'every' ? 'Every shift' : 'Car trips only'];
    const riding = d.details.items?.includes('car_seats') ? kidsRiding(d, kids, today) : [];
    if (riding.length) parts.push(`seats for ${riding.map((k) => k.name).join(', ')}`);
    return parts.join(' · ');
  }
  const p = proofOf(d);
  if (p === 'self') return 'Self-confirmed';
  if (p === 'document') return 'Document';
  return '';
}

export type ReviewRow = { refs: string[]; key: string; title: string; sub: string; icon: ReqIcon };

/** P32 rows for one level. CPR and First Aid with Infant CPR read as one row ("CPR and First Aid · Infant CPR"). */
export function reviewRows(drafts: ReqDraft[], level: ReqLevel, kids: KidLite[], today = new Date()): ReviewRow[] {
  const mine = sortDrafts(drafts.filter((d) => d.level === level));
  const rows: ReviewRow[] = [];
  for (const d of mine) {
    if (d.key === 'cpr_infant' && mine.some((x) => x.key === 'cpr_first_aid')) continue;
    if (d.key === 'cpr_first_aid' && mine.some((x) => x.key === 'cpr_infant')) {
      const infant = mine.find((x) => x.key === 'cpr_infant')!;
      rows.push({ refs: [d.ref, infant.ref], key: d.key, title: 'CPR and First Aid · Infant CPR', sub: '', icon: 'heart' });
      continue;
    }
    rows.push({ refs: [d.ref], key: d.key, title: reqTitle(d), sub: reviewSub(d, kids, today), icon: reqIcon(d) });
  }
  return rows;
}

// ---------------------------------------------------------------- status
export type ReqSummary = {
  /** Must-haves met. */
  met: number;
  /** Must-haves in all. */
  total: number;
  /** Titles of the must-haves she's missing, in list order. */
  missing: string[];
  allMet: boolean;
  /** Met requirements that run out within 30 days. */
  expiring: { title: string; on: string }[];
};

/** Counts the family's must-haves against the status rows. Nice-to-haves never count as missing. */
export function summarize(reqs: Requirement[], rows: ReqStatusRow[]): ReqSummary {
  const must = sortByPosition(reqs).filter((r) => r.level === 'must');
  const byId = new Map(rows.map((r) => [r.requirement_id, r]));
  const missing = must.filter((r) => !byId.get(r.id)?.met).map((r) => reqTitle(r));
  const expiring = sortByPosition(reqs)
    .map((r) => ({ r, s: byId.get(r.id) }))
    .filter((x) => x.s?.met && x.s.reason === 'expiring' && x.s.expires_on)
    .map((x) => ({ title: reqTitle(x.r), on: x.s!.expires_on! }));
  return { met: must.length - missing.length, total: must.length, missing, allMet: missing.length === 0, expiring };
}

function sortByPosition(reqs: Requirement[]) {
  return [...reqs].sort((a, b) => a.position - b.position || a.created_at.localeCompare(b.created_at));
}

/** Pill text for sitter lists: "Meets all requirements" / "Missing 1: Infant CPR" / "Missing 2: Infant CPR, Driving".
 * Empty when the family has no must-haves. */
export function requirementLabel(s: Pick<ReqSummary, 'total' | 'missing'>): string {
  if (!s.total) return '';
  if (!s.missing.length) return 'Meets all requirements';
  return `Missing ${s.missing.length}: ${s.missing.join(', ')}`;
}

/** Pill color for requirementLabel. */
export function requirementKind(s: Pick<ReqSummary, 'total' | 'missing'>): 'ok' | 'warn' | 'muted' {
  return !s.total ? 'muted' : s.missing.length ? 'warn' : 'ok';
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
/** '2026-10-22' -> 'Oct 22' */
export function monthDay(day: string) {
  const [, m, d] = day.slice(0, 10).split('-').map(Number);
  return `${MONTHS[m - 1]} ${d}`;
}

/** P7a line under "If a sitter is missing one": "Maya meets all 4 today. Her Infant CPR expires Oct 22." */
export function meetsLine(name: string, s: ReqSummary): string {
  if (!s.total) return '';
  const first = s.allMet ? `${name} meets all ${s.total} today.` : `${name} is missing ${s.missing.length}: ${s.missing.join(', ')}.`;
  const soon = s.expiring[0];
  return soon ? `${first} Her ${soon.title} expires ${monthDay(soon.on)}.` : first;
}

/** P32 note under Warn me / Block booking. */
export function modeNote(mode: RequirementMode) {
  return mode === 'block'
    ? 'She can still join your family and add what’s missing. You can’t book her until she does.'
    : 'She can still join your family and add what’s missing. You’ll see a warning when you book her.';
}

/** "The Lee family" -> "the Lees" (S27 title "What the Lees ask for"). */
export function familyShort(name: string) {
  const m = /^the (.+) family$/i.exec(name.trim());
  return m ? `the ${m[1]}s` : name.trim();
}

/** "The Lee family" -> "the Lee family" (S27 footnote). */
export function familyLower(name: string) {
  return name.trim().replace(/^The /, 'the ');
}

// ---------------------------------------------------------------- S27 (sitter)
export type SitterReqState = 'have' | 'confirm' | 'confirmed' | 'missing' | 'nice' | 'review';
export type SitterReqRow = {
  ids: string[];
  key: string;
  title: string;
  sub: string;
  icon: ReqIcon;
  state: SitterReqState;
  /** Requirement she answers Yes / No for (S27 buttons), with her answer so far. */
  confirmId?: string;
  answer?: boolean | null;
};

type CredLite = { kind: string; verified_at: string | null; expires_on: string | null };

const CRED_KINDS: Record<string, string[]> = {
  background_check: ['background_check'],
  cpr_first_aid: ['first_aid', 'cpr_child'],
  cpr_infant: ['cpr_infant'],
  water_safety: ['water_safety'],
  newborn_care: ['newborn_care'],
  drivers_license: ['drivers_license'],
};

function credLine(kinds: string[], creds: CredLite[], s: ReqStatusRow | undefined) {
  if (!s) return '';
  if (s.reason === 'expired' && s.expires_on) return `Expired ${monthDay(s.expires_on)}`;
  if (s.reason === 'too_old') return 'Older than 12 months';
  if (!s.met) return 'Add it to your profile';
  const c = creds.find((x) => kinds.includes(x.kind) && (!s.expires_on || x.expires_on === s.expires_on));
  const verified = c?.verified_at ? `Verified ${MONTHS[new Date(c.verified_at).getMonth()]} ${new Date(c.verified_at).getFullYear()}` : 'In review';
  return s.reason === 'expiring' && s.expires_on ? `${c?.verified_at ? 'Verified' : 'In review'} · expires ${monthDay(s.expires_on)}` : verified;
}

/** S27 rows: what the family asks for and where she stands on each. `answers` = her Yes / No per requirement id. */
export function sitterRows(reqs: Requirement[], rows: ReqStatusRow[], creds: CredLite[], answers: Record<string, boolean>): SitterReqRow[] {
  const byId = new Map(rows.map((r) => [r.requirement_id, r]));
  const sorted = sortByPosition(reqs);
  const out: SitterReqRow[] = [];
  for (const r of sorted) {
    const s = byId.get(r.id);
    // CPR and First Aid with Infant CPR read as one row ("CPR, First Aid, Infant CPR"), as on S27.
    const infant = r.key === 'cpr_first_aid' ? sorted.find((x) => x.key === 'cpr_infant' && x.level === r.level) : undefined;
    if (r.key === 'cpr_infant' && sorted.some((x) => x.key === 'cpr_first_aid' && x.level === r.level)) continue;
    const proof = proofOf(r);
    const nice = r.level === 'prefer';
    if (infant) {
      const si = byId.get(infant.id);
      const met = !!s?.met && !!si?.met;
      const soon = [s, si].find((x) => x?.met && x.reason === 'expiring' && x.expires_on);
      const sub = met
        ? `${creds.some((c) => ['first_aid', 'cpr_child', 'cpr_infant'].includes(c.kind) && c.verified_at) ? 'Verified' : 'In review'}${soon ? ` · ${soon === si ? 'Infant ' : ''}expires ${monthDay(soon.expires_on!)}` : ''}`
        : !s?.met && !si?.met
          ? 'Add both to your profile'
          : !s?.met
            ? 'Infant CPR done · add CPR and First Aid'
            : 'CPR and First Aid done · add Infant CPR';
      out.push({ ids: [r.id, infant.id], key: r.key, title: 'CPR, First Aid, Infant CPR', sub, icon: 'heart', state: met ? 'have' : nice ? 'nice' : 'missing' });
      continue;
    }
    const base = { ids: [r.id], key: r.key, title: reqTitle(r), icon: reqIcon(r) };
    if (proof === 'credential') {
      out.push({ ...base, sub: credLine(CRED_KINDS[r.key] ?? [r.key], creds, s), state: s?.met ? 'have' : nice ? 'nice' : 'missing' });
    } else if (proof === 'language') {
      out.push({ ...base, sub: s?.met ? `You speak ${languageOf(r)}` : 'Add it to your profile', state: s?.met ? 'have' : nice ? 'nice' : 'missing' });
    } else if (proof === 'document') {
      out.push({ ...base, sub: r.details.why ? `“${r.details.why}”` : 'The family reviews a document', state: s?.met ? 'have' : nice ? 'nice' : 'review' });
    } else if (proof === 'mixed') {
      const items = r.details.items ?? [];
      const licenseOk = s?.met || s?.reason === 'unconfirmed' || s?.reason === 'declined';
      const askMe = items.includes('insurance') || items.includes('car_seats');
      const sub = [
        items.includes('license') || !items.length ? `License${licenseOk ? ' ✓' : ''}` : '',
        items.includes('record') ? `record${licenseOk ? ' ✓' : ''}` : '',
        items.includes('insurance') ? 'insurance' : '',
        items.includes('car_seats') ? 'car seats' : '',
      ].filter(Boolean).join(' ');
      const state: SitterReqState = s?.met ? (askMe ? 'confirmed' : 'have') : !licenseOk ? (nice ? 'nice' : 'missing') : nice ? 'nice' : 'confirm';
      out.push({ ...base, sub, state, confirmId: askMe && licenseOk && !nice ? r.id : undefined, answer: answers[r.id] ?? null });
    } else {
      const state: SitterReqState = s?.met ? 'confirmed' : nice ? 'nice' : 'confirm';
      const sub = r.details.why ? `“${r.details.why}”` : 'Confirm for this family';
      out.push({ ...base, sub, state, confirmId: nice ? undefined : r.id, answer: answers[r.id] ?? null });
    }
  }
  return out;
}

/** S27 banner: "3 of 5 must-haves done." + what's left. */
export function sitterBanner(s: Pick<ReqSummary, 'met' | 'total'>, rows: SitterReqRow[]): { bold: string; rest: string; done: boolean } {
  const left = s.total - s.met;
  if (!s.total) return { bold: 'Nothing to add.', rest: 'This family has no must-haves.', done: true };
  if (!left) return { bold: `All ${s.total} must-haves done.`, rest: 'The family can book you.', done: true };
  const toConfirm = rows.filter((r) => r.confirmId && r.state === 'confirm').length;
  const rest = toConfirm === left
    ? `Confirm the last ${left === 1 ? 'one' : left} below so the family can book you.`
    : `Add or confirm the last ${left === 1 ? 'one' : left} below so the family can book you.`;
  return { bold: `${s.met} of ${s.total} must-haves done.`, rest, done: false };
}
