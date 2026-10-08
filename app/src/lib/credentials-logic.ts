// Sitter profile and credentials (migration 19; wireframes S13, S14–S18, S40, S41, P11). Pure logic only, so it can
// be unit tested; the data calls are in ./credentials.ts.

export type CredentialKind = 'cpr_infant' | 'cpr_child' | 'first_aid' | 'newborn_care' | 'water_safety' | 'drivers_license' | 'background_check' | 'vaccination' | 'other';

/** One certificate (or the background check). Dates are 'YYYY-MM-DD'. verified_at is reserved for a later in-app
 * check: phase 1 checks nothing, so the app never shows it (no "Verified" / "In review"). */
export type Credential = {
  id: string;
  sitter_id: string;
  kind: CredentialKind;
  title: string;
  issuer: string | null;
  issued_on: string | null;
  expires_on: string | null;
  file_path: string | null;
  verified_at: string | null;
  created_at: string;
  updated_at?: string;
};

export type CredentialInput = Pick<Credential, 'kind' | 'title' | 'issuer' | 'issued_on' | 'expires_on' | 'file_path'>;

export type LanguageLevel = 'native' | 'fluent' | 'conversational' | 'basic';
export type SitterLanguage = { sitter_id: string; language: string; level: LanguageLevel };

/** S40 / S13 details. Name is profiles.full_name. */
export type SitterProfile = {
  sitter_id: string;
  phone: string | null;
  home_area: string | null;
  bio: string | null;
  years_experience: number | null;
  ages_from: number | null;
  ages_to: number | null;
  can_drive: boolean | null;
  own_car: boolean | null;
  rate: number | null;
  teaches_language: boolean;
  photo_path: string | null;
  /** 'YYYY-MM-DD' (migration 23). Families see her age, never the date. */
  birthdate?: string | null;
};

export const BIO_MAX = 300;
/** "Expiring" = expires within this many days (S14 / S18; reminders at 30, 14 and 3 days). */
export const EXPIRING_DAYS = 30;

// ---------------------------------------------------------------- dates

/** 'YYYY-MM-DD' → local midnight. */
export function parseDay(day: string): Date {
  const [y, m, d] = day.slice(0, 10).split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

/** Local date → 'YYYY-MM-DD'. */
export function toDay(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** 'YYYY-MM-DD' → '10/22/2026' (US format, CLAUDE.md). */
export function usDate(day: string | null): string {
  if (!day) return '';
  const d = parseDay(day);
  return `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}/${d.getFullYear()}`;
}

/** Typed '10/22/2026' (or 10/22/26) → 'YYYY-MM-DD'; null when it isn't a real date. */
export function fromUsDate(text: string): string | null {
  const m = text.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{2}|\d{4})$/);
  if (!m) return null;
  const y = m[3].length === 2 ? 2000 + Number(m[3]) : Number(m[3]);
  const d = new Date(y, Number(m[1]) - 1, Number(m[2]));
  if (d.getMonth() !== Number(m[1]) - 1 || d.getDate() !== Number(m[2])) return null;
  return toDay(d);
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** 'Mar 2027' */
export function monthYear(day: string): string {
  const d = parseDay(day);
  return `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

/** 'Oct 22' */
export function monthDay(day: string): string {
  const d = parseDay(day);
  return `${MONTHS[d.getMonth()]} ${d.getDate()}`;
}

/** 'Oct 22, 2026' */
export function longDate(day: string): string {
  return `${monthDay(day)}, ${parseDay(day).getFullYear()}`;
}

/** 'Oct 22' this year, 'Mar 2027' otherwise (S14 "to Oct 22" / "to Mar 2027"). */
export function shortExpiry(day: string, now = new Date()): string {
  return parseDay(day).getFullYear() === now.getFullYear() ? monthDay(day) : monthYear(day);
}

/** Whole days from today to the date (0 = today, negative = past). */
export function daysUntil(day: string, now = new Date()): number {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((parseDay(day).getTime() - today.getTime()) / 86_400_000);
}

// ---------------------------------------------------------------- state

/** Date state only: valid, expiring (within 30 days), expired (on or after the expiry date), or missing_date (no
 * expiry entered). */
export function credentialState(c: Pick<Credential, 'expires_on'>, now = new Date()): 'valid' | 'expiring' | 'expired' | 'missing_date' {
  if (!c.expires_on) return 'missing_date';
  const left = daysUntil(c.expires_on, now);
  if (left <= 0) return 'expired';
  if (left <= EXPIRING_DAYS) return 'expiring';
  return 'valid';
}

/** Where her own card stands (S13 / S14 / S41 pill): Added, Expiring (within 30 days) or Expired. BabyBadger checks
 * nothing in phase 1, so there is no "Verified" or "In review". */
export type CardState = 'added' | 'expiring' | 'expired';

export function cardState(c: Pick<Credential, 'expires_on'>, now = new Date()): CardState {
  const s = credentialState(c, now);
  if (s === 'expired') return 'expired';
  if (s === 'expiring') return 'expiring';
  return 'added';
}

export const CARD_LABEL: Record<CardState, string> = { added: 'Added', expiring: 'Expiring', expired: 'Expired' };
export const CARD_PILL: Record<CardState, 'ok' | 'warn' | 'bad'> = { added: 'ok', expiring: 'warn', expired: 'bad' };

/** The certificates, without the background check. */
export function certificates(creds: Credential[]): Credential[] {
  return creds.filter((c) => c.kind !== 'background_check');
}

/** The background check row (latest): a report she uploaded (S17d). */
export function backgroundCheck(creds: Credential[]): Credential | null {
  const rows = creds.filter((c) => c.kind === 'background_check').sort((a, b) => b.created_at.localeCompare(a.created_at));
  return rows[0] ?? null;
}

/** S13 / S14 / S39 background check pill: none yet, Added (her report) or Expired. */
export type BackgroundStatus = 'none' | 'added' | 'expired';
export function backgroundStatus(bg: Credential | null, now = new Date()): BackgroundStatus {
  if (!bg) return 'none';
  if (credentialState(bg, now) === 'expired') return 'expired';
  return 'added';
}

/** Certificates expiring within 30 days (not yet expired), soonest first: S14 banner, S18, S39 "1 expiring". */
export function expiringSoon(creds: Credential[], now = new Date()): Credential[] {
  return certificates(creds)
    .filter((c) => credentialState(c, now) === 'expiring')
    .sort((a, b) => (a.expires_on ?? '').localeCompare(b.expires_on ?? ''));
}

export function expired(creds: Credential[], now = new Date()): Credential[] {
  return certificates(creds).filter((c) => credentialState(c, now) === 'expired');
}

// ---------------------------------------------------------------- S15 choices

/** The S15 tiles, in order. "Special needs care" and "Early childhood ed." are stored as kind 'other' with that title. */
export type CertChoice = { key: string; kind: CredentialKind; label: string };
export const CERT_CHOICES: CertChoice[] = [
  { key: 'first_aid', kind: 'first_aid', label: 'CPR and First Aid' },
  { key: 'cpr_infant', kind: 'cpr_infant', label: 'Infant CPR' },
  { key: 'newborn_care', kind: 'newborn_care', label: 'Newborn care' },
  { key: 'water_safety', kind: 'water_safety', label: 'Water safety' },
  { key: 'vaccination', kind: 'vaccination', label: 'Vaccinations' },
  { key: 'special_needs', kind: 'other', label: 'Special needs care' },
  { key: 'early_childhood', kind: 'other', label: 'Early childhood ed.' },
  { key: 'drivers_license', kind: 'drivers_license', label: "Driver's license" },
  { key: 'other', kind: 'other', label: 'Other' },
];

/** Which S15 tile a saved credential belongs to (drives its icon). */
export function choiceOf(c: Pick<Credential, 'kind' | 'title'>): CertChoice {
  if (c.kind === 'other') return CERT_CHOICES.find((x) => x.kind === 'other' && x.label === c.title) ?? CERT_CHOICES[CERT_CHOICES.length - 1];
  if (c.kind === 'cpr_child') return CERT_CHOICES[0];
  return CERT_CHOICES.find((x) => x.kind === c.kind) ?? CERT_CHOICES[CERT_CHOICES.length - 1];
}

/** S14 sections: SAFETY (CPR, first aid, water safety; the background check row is added by the screen), SKILLS (the rest). */
export function isSafety(kind: CredentialKind) {
  return kind === 'first_aid' || kind === 'cpr_infant' || kind === 'cpr_child' || kind === 'water_safety' || kind === 'vaccination';
}

/** S14 row sub-line: "American Red Cross · to Mar 2027"; no issuer or date: "Uploaded today" / "Uploaded Oct 2". */
export function credentialSub(c: Credential, now = new Date()): string {
  const parts = [c.issuer?.trim(), c.expires_on ? `to ${shortExpiry(c.expires_on, now)}` : ''].filter(Boolean);
  if (parts.length) return parts.join(' · ');
  const added = toDay(new Date(c.created_at));
  return `Uploaded ${added === toDay(now) ? 'today' : monthDay(added)}`;
}

/** S13 row sub-line: "Expires Mar 2027" / "Expired Oct 22" / "No expiry date". */
export function expiryLine(c: Credential, now = new Date()): string {
  if (!c.expires_on) return 'No expiry date';
  return `${credentialState(c, now) === 'expired' ? 'Expired' : 'Expires'} ${shortExpiry(c.expires_on, now)}`;
}

// ---------------------------------------------------------------- languages

export const LEVELS: { value: LanguageLevel; label: string }[] = [
  { value: 'basic', label: 'Basic' },
  { value: 'conversational', label: 'Good' },
  { value: 'fluent', label: 'Fluent' },
  { value: 'native', label: 'Native' },
];
export function levelLabel(level: LanguageLevel) {
  return LEVELS.find((l) => l.value === level)?.label ?? level;
}

/** S16 chips: English and Spanish always first (on or off), then the other languages she added, in the order she
 * added them (each removable). "+ Add language" (S16b) types any other. */
export const FIXED_LANGUAGES = ['English', 'Spanish'];
export function languageChips(langs: Pick<SitterLanguage, 'language'>[]): { language: string; fixed: boolean; on: boolean }[] {
  const has = (name: string) => langs.some((l) => l.language.toLowerCase() === name.toLowerCase());
  return [
    ...FIXED_LANGUAGES.map((language) => ({ language, fixed: true, on: has(language) })),
    ...langs.filter((l) => !FIXED_LANGUAGES.some((f) => f.toLowerCase() === l.language.toLowerCase())).map((l) => ({ language: l.language, fixed: false, on: true })),
  ];
}

/** "Spanish" from " spanish ". Empty when blank. */
export function cleanLanguage(text: string) {
  const t = text.trim().replace(/\s+/g, ' ');
  if (!t) return '';
  return t.length <= 3 ? t.toUpperCase() : t[0].toUpperCase() + t.slice(1);
}

const LEVEL_RANK: Record<LanguageLevel, number> = { native: 0, fluent: 1, conversational: 2, basic: 3 };
/** Strongest first, then by name. */
export function sortLanguages<T extends Pick<SitterLanguage, 'language' | 'level'>>(langs: T[]): T[] {
  return [...langs].sort((a, b) => LEVEL_RANK[a.level] - LEVEL_RANK[b.level] || a.language.localeCompare(b.language));
}

/** S13 / S39: "English · Spanish". With levels (S14): "English (native) · Spanish (fluent)". */
export function languagesLine(langs: Pick<SitterLanguage, 'language' | 'level'>[], withLevel = false) {
  return sortLanguages(langs)
    .map((l) => (withLevel ? `${l.language} (${levelLabel(l.level).toLowerCase()})` : l.language))
    .join(' · ');
}

// ---------------------------------------------------------------- profile

/** S13 header line: "Tampa · 6 years with kids" (the city is the last part of the home area). */
export function profileLine(p: Pick<SitterProfile, 'home_area' | 'years_experience' | 'birthdate'> | null, today = new Date()): string {
  const area = p?.home_area?.split(',').pop()?.trim();
  const years = p?.years_experience;
  const age = sitterAge(p?.birthdate, today);
  return [age != null ? `${age} years old` : '', area, years != null ? `${years} ${years === 1 ? 'year' : 'years'} with kids` : ''].filter(Boolean).join(' · ');
}

/** Whole years from a 'YYYY-MM-DD' birthday; null when not set. */
export function sitterAge(birthdate: string | null | undefined, today = new Date()): number | null {
  if (!birthdate) return null;
  const [y, m, d] = birthdate.split('-').map(Number);
  if (!y || !m || !d) return null;
  let age = today.getFullYear() - y;
  if (today.getMonth() + 1 < m || (today.getMonth() + 1 === m && today.getDate() < d)) age--;
  return age >= 0 ? age : null;
}

/** S13 About "Ages": "Newborn – 10". */
export function agesLabel(from: number | null, to: number | null): string {
  if (from == null && to == null) return '';
  const age = (n: number) => (n === 0 ? 'Newborn' : String(n));
  if (from != null && to != null) return `${age(from)} – ${to}`;
  return from != null ? `${age(from)} and up` : `Up to ${to}`;
}

/** S13 About "Can drive kids": "Yes · own car". */
export function driveLabel(canDrive: boolean | null, ownCar: boolean | null): string {
  if (canDrive == null) return '';
  if (!canDrive) return 'No';
  return ownCar ? 'Yes · own car' : 'Yes';
}

/** "Maya R." (families see this until they book her, S40). */
export function shortName(full: string) {
  const parts = full.trim().split(/\s+/).filter(Boolean);
  if (parts.length < 2) return parts[0] ?? '';
  return `${parts[0]} ${parts[parts.length - 1][0].toUpperCase()}.`;
}

/** S13 "Profile strength": photo, about me, mobile, home area, a certification, a language. The background check is
 * the provider's, so it doesn't count. `next` is the first thing missing. */
export function profileStrength(p: SitterProfile | null, creds: Credential[], langs: SitterLanguage[]): { percent: number; next: string } {
  const steps: [boolean, string][] = [
    [certificates(creds).length > 0, 'Next: add a certification, like Newborn care or Water safety.'],
    [!!p?.photo_path, 'Next: add a clear face photo.'],
    [!!p?.bio?.trim(), 'Next: write a few lines about you.'],
    [!!p?.phone?.trim(), 'Next: add your mobile number.'],
    [!!p?.home_area?.trim(), 'Next: add your home area.'],
    [langs.length > 0, 'Next: add the languages you speak.'],
  ];
  const done = steps.filter(([ok]) => ok).length;
  return { percent: Math.round((done / steps.length) * 100), next: steps.find(([ok]) => !ok)?.[1] ?? 'Your profile is complete.' };
}

// ---------------------------------------------------------------- what families see (P11, S19)

/** S19 lines under her name: "6 years · ages newborn – 10" and "Drives · $20 / hour" ('' when nothing is set). */
export function familyViewLines(p: Pick<SitterProfile, 'years_experience' | 'ages_from' | 'ages_to' | 'can_drive' | 'rate'> | null): [string, string] {
  const years = p?.years_experience;
  const ages = agesLabel(p?.ages_from ?? null, p?.ages_to ?? null);
  const rate = p?.rate;
  return [
    [years != null ? `${years} ${years === 1 ? 'year' : 'years'}` : '', ages ? `ages ${ages[0].toLowerCase()}${ages.slice(1)}` : ''].filter(Boolean).join(' · '),
    [p?.can_drive ? 'Drives' : '', rate != null ? `$${Number(rate).toFixed(Number(rate) % 1 ? 2 : 0)} / hour` : ''].filter(Boolean).join(' · '),
  ];
}

// ---------------------------------------------------------------- S3 Needs you

/** A family's must-have that a card can meet: the family name ("The Lee family") and the credential kinds that
 * count for it (CREDENTIAL_KINDS in ./requirement-requests). */
export type CardMust = { family: string; kinds: string[] };

/** One S3 "Needs you" row for a card: "Infant CPR expires in 21 days" / "Infant CPR expired Oct 2" ·
 * "Renew and share the new card · Lee family requires it". Opens S41 (`id`). */
export type CardReminder = { id: string; title: string; sub: string; expired: boolean };

const familyWord = (name: string) => name.trim().replace(/^the /i, '');

/** "Lee family requires it" / "Lee and Kim families require it" / "3 families require it". */
export function requiresLine(families: string[]): string {
  const names = [...new Set(families.map(familyWord))];
  if (!names.length) return '';
  if (names.length === 1) return `${names[0]} requires it`;
  const bare = names.map((n) => /^(.+) family$/i.exec(n)?.[1]);
  if (names.length === 2 && bare.every(Boolean)) return `${bare[0]} and ${bare[1]} families require it`;
  return `${names.length} families require it`;
}

/** S3 Needs you: her certificates that expire within 30 days or have expired, soonest (or longest gone) first.
 * A card she has already replaced (a newer one of the same kind and title that is still good) is left out. */
export function cardReminders(creds: Credential[], musts: CardMust[] = [], now = new Date()): CardReminder[] {
  const certs = certificates(creds);
  const replaced = (c: Credential) =>
    certs.some((o) => o.id !== c.id && o.kind === c.kind && o.title === c.title && (o.expires_on ?? '9999') > (c.expires_on ?? '') && credentialState(o, now) !== 'expired');
  return certs
    .filter((c) => {
      const s = credentialState(c, now);
      return (s === 'expiring' || s === 'expired') && !replaced(c);
    })
    .sort((a, b) => (a.expires_on ?? '').localeCompare(b.expires_on ?? ''))
    .map((c) => {
      const left = daysUntil(c.expires_on!, now);
      const expiredNow = left <= 0;
      const title = expiredNow ? `${c.title} expired ${shortExpiry(c.expires_on!, now)}` : `${c.title} expires in ${left} ${left === 1 ? 'day' : 'days'}`;
      const needs = requiresLine(musts.filter((m) => m.kinds.includes(c.kind)).map((m) => m.family));
      return { id: c.id, title, sub: ['Renew and share the new card', needs].filter(Boolean).join(' · '), expired: expiredNow };
    });
}
