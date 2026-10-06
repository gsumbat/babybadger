// House rules (wireframes P74, P75, P76, S42, S43; design note nP17). Pure logic, no Supabase, so it can be tested.
// Data access lives in ./house-rules.ts.
import { describeLog } from './shift-logic';
import type { Kid, LogEntry, LogKind } from './types';

export type RuleCategory = 'logs' | 'phone' | 'safety' | 'food' | 'home';
export type RuleStrength = 'must' | 'prefer';
/** P76 "Personal phone during a shift". */
export type PhoneUse = 'emergencies' | 'naps' | 'any';
/** Rule extras (migration 09 `options`): phone use and its two switches (P76); how often photo updates are due. */
export type RuleOptions = { use?: PhoneUse; no_social?: boolean; no_posts?: boolean; every_hours?: number };

export type HouseRule = {
  id: string;
  family_id: string;
  /** The P75 chip it came from; null = written by the parent. */
  key: string | null;
  title: string;
  sub: string;
  category: RuleCategory;
  strength: RuleStrength;
  options: RuleOptions;
  sort: number;
  /** Set by the database when this Must rule last asked sitters for a new OK. */
  must_since: string | null;
  created_at: string;
  updated_at: string;
};

export type HouseRuleInput = Pick<HouseRule, 'key' | 'title' | 'sub' | 'category' | 'strength' | 'options' | 'sort'>;

export type RuleAgreement = { family_id: string; sitter_id: string; agreed_at: string };

/** Icon paths copied from the wireframes (P74 / S42 / S43 rows, 24×24). */
export type RuleIcon = 'meals' | 'nap' | 'activity' | 'photo' | 'diaper' | 'phone' | 'social' | 'screen' | 'visitors' | 'door' | 'home' | 'shield';
export const RULE_ICONS: Record<RuleIcon, string> = {
  meals: '<path d="M6 3v7a2 2 0 0 0 4 0V3M8 10v11M17 21V3c-2.5 1-3.5 3.5-3.5 7.5h3.5"/>',
  nap: '<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>',
  activity: '<circle cx="12" cy="12" r="9"/><path d="M10 8.5l5 3.5-5 3.5z"/>',
  photo: '<path d="M4 8h3l2-2.5h6L17 8h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>',
  // The S44 diaper tile's icon (wfIcons "droplet").
  diaper: '<path d="M3.5 7h17v3a8.5 8.5 0 0 1-17 0z"/><path d="M8 7v3M16 7v3"/>',
  phone: '<rect x="7" y="2.5" width="10" height="19" rx="2.5"/><path d="M4 4l16 16"/>',
  social: '<circle cx="12" cy="12" r="9"/><path d="M5.6 5.6l12.8 12.8"/><path d="M9 10.5h6M9 13.5h4"/>',
  screen: '<rect x="3" y="5" width="18" height="12" rx="2"/><path d="M8 21h8M12 17v4"/>',
  visitors: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c0-3.5 3-5.5 6.5-5.5s6.5 2 6.5 5.5M16 4.8a3.5 3.5 0 0 1 0 6.4M18.5 14.8c1.8.7 3 2.3 3 4.7"/>',
  door: '<path d="M6 21V4h10v17M4 21h16"/><path d="M13 12.5h0"/>',
  home: '<path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z"/>',
  // P76's agreement box / P4e's House rules tile.
  shield: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M8.5 12l2.5 2.5 4.5-4.5"/>',
};

export function ruleIconXml(icon: RuleIcon, stroke: string) {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="${stroke}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${RULE_ICONS[icon]}</svg>`;
}

type CatalogueRule = {
  key: string;
  /** P75 chip label. */
  chip: string;
  /** P74 row (what the parent reads). */
  title: string;
  sub?: string;
  /** S42 / S43 row (what the sitter reads), when it differs. */
  sitterTitle?: string;
  sitterSub?: string;
  category: RuleCategory;
  strength: RuleStrength;
  icon: RuleIcon;
  /** Log rules: the log type that fulfils it on a shift (S43). */
  log?: LogKind;
  options?: RuleOptions;
};

/** The P75 "Most chosen by parents" chips, in its order and sections. */
export const CATALOGUE: CatalogueRule[] = [
  { key: 'meals', chip: 'Meals and snacks', title: 'Log meals and snacks', sub: 'What and how much they ate', sitterSub: 'Tap Food during the shift', category: 'logs', strength: 'must', icon: 'meals', log: 'food' },
  { key: 'naps', chip: 'Naps and sleep', title: 'Log naps and sleep', sub: 'Start and end time', category: 'logs', strength: 'must', icon: 'nap', log: 'nap' },
  { key: 'activities', chip: 'Activities', title: 'Log activities', sub: 'What they did, 1–2 lines', sitterSub: '', category: 'logs', strength: 'prefer', icon: 'activity', log: 'activity' },
  { key: 'photos', chip: 'Photo updates', title: 'Photo update', sub: 'Every 2 hours', sitterTitle: 'Photo update every 2 hours', sitterSub: '', category: 'logs', strength: 'prefer', icon: 'photo', log: 'photo', options: { every_hours: 2 } },
  { key: 'diapers', chip: 'Diapers and potty', title: 'Diapers and potty', category: 'logs', strength: 'prefer', icon: 'diaper', log: 'diaper' },
  { key: 'phone', chip: 'Phone for emergencies only', title: 'Personal phone: emergencies only', sub: 'Messages with us are fine', sitterTitle: 'Your phone: emergencies and our messages', sitterSub: '', category: 'phone', strength: 'must', icon: 'phone', options: { use: 'emergencies' } },
  { key: 'social', chip: 'No social media', title: 'No social media, never post the kids', category: 'phone', strength: 'must', icon: 'social' },
  { key: 'screen_time', chip: 'Screen time limit', title: 'Kids’ screen time', sub: '30 min a day, shows we approved', sitterTitle: 'Kids’ screen time: 30 min a day', sitterSub: '', category: 'phone', strength: 'must', icon: 'screen' },
  { key: 'screens_meals', chip: 'No screens at meals', title: 'No screens at meals', category: 'phone', strength: 'prefer', icon: 'screen' },
  { key: 'driving', chip: 'No phone while driving', title: 'No phone while driving', category: 'phone', strength: 'must', icon: 'phone' },
  { key: 'visitors', chip: 'No visitors', title: 'No visitors without asking', category: 'safety', strength: 'must', icon: 'visitors' },
  { key: 'leaving', chip: 'Ask before leaving home', title: 'Ask before leaving the house', sub: 'Planned trips in the care plan are fine', sitterSub: '', category: 'safety', strength: 'must', icon: 'door' },
  { key: 'bath', chip: 'Never alone in bath or pool', title: 'Never alone in bath or pool', category: 'safety', strength: 'must', icon: 'shield' },
  { key: 'doors', chip: 'Doors locked', title: 'Doors locked', category: 'safety', strength: 'must', icon: 'door' },
  { key: 'food_plan', chip: 'Only food from the meal plan', title: 'Only food from the meal plan', category: 'food', strength: 'must', icon: 'meals' },
  { key: 'sweets', chip: 'No sweets after 5 PM', title: 'No sweets after 5 PM', category: 'food', strength: 'prefer', icon: 'meals' },
  { key: 'bedtime', chip: 'Bedtime as written', title: 'Bedtime as written', category: 'food', strength: 'prefer', icon: 'nap' },
  { key: 'tidy', chip: 'Tidy before you go', title: 'Tidy toys and dishes before you go', category: 'home', strength: 'prefer', icon: 'home' },
  { key: 'discipline', chip: 'Gentle discipline, no yelling', title: 'Gentle discipline, no yelling', category: 'home', strength: 'must', icon: 'home' },
  { key: 'smoking', chip: 'No smoking or vaping', title: 'No smoking or vaping', category: 'home', strength: 'must', icon: 'home' },
  { key: 'spanish', chip: 'Speak Spanish with the kids', title: 'Speak Spanish with the kids', category: 'home', strength: 'prefer', icon: 'home' },
];

/** P75 sections. */
export const CHIP_SECTIONS: { category: RuleCategory; label: string }[] = [
  { category: 'logs', label: 'UPDATES AND LOGS' },
  { category: 'phone', label: 'PHONE AND SCREENS' },
  { category: 'safety', label: 'SAFETY' },
  { category: 'food', label: 'FOOD AND ROUTINE' },
  { category: 'home', label: 'HOME AND CONDUCT' },
];

/** P74 / S42 sections: P74 draws safety and home together as "SAFETY AND HOME". Food rules use P75's heading. */
export const LIST_SECTIONS: { categories: RuleCategory[]; label: string }[] = [
  { categories: ['logs'], label: 'UPDATES AND LOGS' },
  { categories: ['phone'], label: 'PHONE AND SCREENS' },
  { categories: ['safety', 'home'], label: 'SAFETY AND HOME' },
  { categories: ['food'], label: 'FOOD AND ROUTINE' },
];

export function catalogueRule(key: string | null | undefined) {
  return key ? CATALOGUE.find((c) => c.key === key) : undefined;
}

/** The row a P75 chip adds. */
export function chipRule(key: string): HouseRuleInput {
  const i = CATALOGUE.findIndex((c) => c.key === key);
  const c = CATALOGUE[i];
  if (!c) throw new Error(`Unknown house rule ${key}`);
  return { key: c.key, title: c.title, sub: c.sub ?? '', category: c.category, strength: c.strength, options: { ...(c.options ?? {}) }, sort: i };
}

/** A rule the parent wrote herself ("+ Write your own rule"). */
export function ownRule(title: string, strength: RuleStrength): HouseRuleInput {
  return { key: null, title: title.trim(), sub: '', category: 'home', strength, options: {}, sort: 1000 };
}

export function ruleIcon(rule: Pick<HouseRule, 'key' | 'category'>): RuleIcon {
  return catalogueRule(rule.key)?.icon ?? (rule.category === 'safety' ? 'shield' : rule.category === 'food' ? 'meals' : rule.category === 'phone' ? 'phone' : 'home');
}

export function sortRules<T extends Pick<HouseRule, 'sort' | 'created_at'>>(rules: T[]): T[] {
  return [...rules].sort((a, b) => a.sort - b.sort || a.created_at.localeCompare(b.created_at));
}

/** Sections with rules in them, in list order (P74, S42). */
export function groupRules<T extends Pick<HouseRule, 'category' | 'sort' | 'created_at'>>(rules: T[]) {
  return LIST_SECTIONS.map((s) => ({ label: s.label, rules: sortRules(rules.filter((r) => s.categories.includes(r.category))) })).filter((s) => s.rules.length);
}

/** P76 choices. parentTitle / parentSub: the P74 row; sitterTitle: the S42 / S43 row. Only the "emergencies" wording is
 * drawn (P74, S42); the other two rows reuse the choice's own words. */
export const PHONE_USES: { value: PhoneUse; title: string; sub: string; parentTitle: string; parentSub: string; sitterTitle: string }[] = [
  { value: 'emergencies', title: 'Emergencies and messages with us', sub: 'Calls, BabyBadger, texts with {parents}', parentTitle: 'Personal phone: emergencies only', parentSub: 'Messages with us are fine', sitterTitle: 'Your phone: emergencies and our messages' },
  { value: 'naps', title: 'OK during naps and quiet time', sub: 'Not while the kids are awake and playing', parentTitle: 'Personal phone: naps and quiet time', parentSub: 'Not while the kids are awake and playing', sitterTitle: 'Your phone: OK during naps and quiet time' },
  { value: 'any', title: 'No limit', sub: 'Use your judgment', parentTitle: 'Personal phone: no limit', parentSub: 'Use your judgment', sitterTitle: 'Your phone: no limit' },
];

/** P76 header: the phone rule's detail is "Sitter’s phone use". */
export function detailTitle(rule: Pick<HouseRule, 'key' | 'title'>) {
  return rule.key === 'phone' ? 'Sitter’s phone use' : rule.title;
}

/** Only conduct rules about the phone get P76's "agreement, not tracking" box. */
export function isPhoneConduct(rule: Pick<HouseRule, 'key'>) {
  return rule.key === 'phone' || rule.key === 'social';
}

/** The phone rule's title and sub-line follow its P76 choice. */
export function withPhoneChoice(rule: HouseRuleInput, use: PhoneUse): HouseRuleInput {
  const u = PHONE_USES.find((p) => p.value === use)!;
  return { ...rule, title: u.parentTitle, sub: u.parentSub, options: { ...rule.options, use } };
}

/** What the sitter reads on S42 / S43. */
export function sitterLine(rule: Pick<HouseRule, 'key' | 'title' | 'sub' | 'options'>): { title: string; sub: string } {
  const c = catalogueRule(rule.key);
  if (rule.key === 'phone') {
    const u = PHONE_USES.find((p) => p.value === (rule.options.use ?? 'emergencies'))!;
    const sub = [rule.options.no_social && 'No social media on shift', rule.options.no_posts && 'Never post photos of the kids'].filter(Boolean).join(' · ');
    return { title: u.sitterTitle, sub };
  }
  if (!c) return { title: rule.title, sub: rule.sub };
  // A catalogue rule keeps the sitter wording only while the parent hasn't changed its wording.
  const edited = rule.title !== c.title || rule.sub !== (c.sub ?? '');
  if (edited) return { title: rule.title, sub: rule.sub };
  return { title: c.sitterTitle ?? c.title, sub: c.sitterSub ?? c.sub ?? '' };
}

/** "7 must-dos, 3 wishes." (S42) */
export function rulesCount(rules: Pick<HouseRule, 'strength'>[]) {
  const must = rules.filter((r) => r.strength === 'must').length;
  const prefer = rules.length - must;
  const parts = [must && `${must} must-do${must === 1 ? '' : 's'}`, prefer && `${prefer} wish${prefer === 1 ? '' : 'es'}`].filter(Boolean);
  return parts.length ? `${parts.join(', ')}.` : '';
}

/** "10 rules" (P12b Settings row). */
export function rulesLabel(n: number) {
  return n ? `${n} rule${n === 1 ? '' : 's'}` : 'None yet';
}

/** Has a sitter whose last OK was at `agreedAt` agreed to these rules? True when there are no Must rules. Same test as
 * house_rules_agreed() in migration 09. */
export function rulesAgreed(rules: Pick<HouseRule, 'strength' | 'must_since'>[], agreedAt: string | null | undefined) {
  const since = rules.filter((r) => r.strength === 'must' && r.must_since).map((r) => +new Date(r.must_since!));
  const hasMust = rules.some((r) => r.strength === 'must');
  if (!hasMust) return true;
  if (!agreedAt) return false;
  return since.every((t) => t <= +new Date(agreedAt));
}

/** "Maya and Priya", "Maya, Priya and Sam". */
export function joinNames(names: string[]) {
  return names.length <= 1 ? (names[0] ?? '') : `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`;
}

/** "The Lee family" -> "The Lees’" (S42 title) and "the Lee family’s" (S42 agreement line). */
export function familyPossessive(name: string) {
  const m = /^the (.+) family$/i.exec(name.trim());
  if (m) return { title: `The ${m[1]}s’`, line: `the ${m[1]} family’s` };
  return { title: `${name}’s`, line: `${name}’s` };
}

export type ShiftRuleRow = { rule: HouseRule; kind: LogKind; title: string; sub: string; state: 'done' | 'due' | 'later' };

function shortTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }).replace(/\s?[AP]M$/i, '');
}

function ago(ms: number) {
  const min = Math.max(0, Math.round(ms / 60000));
  return min < 60 ? `${min} min ago` : `${Math.round(min / 60)} h ago`;
}

/** S43 "Logs": one row per log rule. Done once the shift has a log of that type; a photo rule repeats (Log now again
 * when the last photo is older than its interval). Rows read like the wireframe: "Snack · Ava and Leo · 3:30",
 * "Activities · 1 logged · park", "Photo update · Last one 2 h ago". */
export function shiftRuleRows(rules: HouseRule[], logs: LogEntry[], kids: Pick<Kid, 'id' | 'name'>[], clockInAt: string | null, now = new Date()): ShiftRuleRow[] {
  const names = (ids: string[]) => joinNames(ids.map((id) => kids.find((k) => k.id === id)?.name).filter((n): n is string => !!n));
  const rows: ShiftRuleRow[] = [];
  for (const rule of sortRules(rules)) {
    const kind = catalogueRule(rule.key)?.log;
    if (rule.category !== 'logs' || !kind) continue;
    const label = catalogueRule(rule.key)!.chip;
    const mine = logs.filter((l) => l.kind === kind).sort((a, b) => b.happened_at.localeCompare(a.happened_at));
    const last = mine[0];
    if (kind === 'photo') {
      const every = (rule.options.every_hours ?? 0) * 3600_000;
      const from = last ? +new Date(last.happened_at) : clockInAt ? +new Date(clockInAt) : +now;
      const due = every ? +now - from >= every : !last;
      rows.push({ rule, kind, title: 'Photo update', sub: last ? `Last one ${ago(+now - +new Date(last.happened_at))}` : rule.sub, state: due ? 'due' : last ? 'done' : 'later' });
      continue;
    }
    if (!last) {
      rows.push({ rule, kind, title: label, sub: 'None logged yet', state: 'due' });
      continue;
    }
    if (kind === 'activity') {
      const what = last.data?.what?.trim();
      rows.push({ rule, kind, title: label, sub: [`${mine.length} logged`, what].filter(Boolean).join(' · '), state: 'done' });
      continue;
    }
    const who = names(last.kid_ids ?? []);
    rows.push({ rule, kind, title: describeLog(last).title, sub: [who, shortTime(last.happened_at)].filter(Boolean).join(' · '), state: 'done' });
  }
  return rows;
}
