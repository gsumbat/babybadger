// Care plan helpers (wireframes P7, P20, P20a): weekday masks, times, suggestions by age, and which items fall
// inside a shift. Pure functions, unit-tested in __tests__/care-plan.test.ts.
import type { BottleUnit, CareDetails, CareItem, CareType, Kid, Milk } from './types';

export const CARE_TYPES: { type: CareType; label: string }[] = [
  { type: 'nap', label: 'Nap' },
  { type: 'bottle', label: 'Bottle' },
  { type: 'meal', label: 'Meal' },
  { type: 'diaper', label: 'Diaper' },
  { type: 'bedtime', label: 'Bedtime' },
  { type: 'medicine', label: 'Medicine' },
  { type: 'activity', label: 'Activity' },
  { type: 'other', label: 'Other' },
];

export function typeLabel(type: CareType): string {
  return CARE_TYPES.find((t) => t.type === type)?.label ?? 'Other';
}

export function isCareType(v: unknown): v is CareType {
  return CARE_TYPES.some((t) => t.type === v);
}

/** Meals tab on P7 (and the "Food" tag). */
export function isFood(type: CareType): boolean {
  return type === 'meal' || type === 'bottle';
}

/** The row's name: what the parent typed, or the type ("Bedtime"). A diaper item has no name of its own: it reads
 * "Diaper check", or "Potty break" for potty training. */
export function itemTitle(item: Pick<CareItem, 'title' | 'type'> & { details?: CareDetails | null }): string {
  if (item.type === 'diaper') return item.details?.potty ? 'Potty break' : 'Diaper check';
  return item.title.trim() || typeLabel(item.type);
}

// ---------------------------------------------------------------- per-type extras (P20a, P20f, P20g)
/** P20a's "Milk" choices for a bottle. */
export const MILKS: { value: Milk; label: string }[] = [
  { value: 'formula', label: 'Formula' },
  { value: 'breast milk', label: 'Breast milk' },
  { value: 'whole milk', label: 'Whole milk' },
];

function isMilk(v: unknown): v is Milk {
  return MILKS.some((m) => m.value === v);
}

/** P20a's "Unit" dropdown for a bottle; oz is the default. */
export const BOTTLE_UNITS: { value: BottleUnit; label: string }[] = [
  { value: 'oz', label: 'oz' },
  { value: 'ml', label: 'ml' },
];

/** The most a bottle can hold, by unit. */
const MAX_AMOUNT: Record<BottleUnit, number> = { oz: 32, ml: 1000 };

export function isBottleUnit(v: unknown): v is BottleUnit {
  return v === 'oz' || v === 'ml';
}

const isAmount = (n: unknown): n is number => typeof n === 'number' && Number.isFinite(n) && n > 0;

/** A bottle's amount and unit, reading the old {amount_oz} shape as ounces. */
function bottleAmount(d: CareDetails): { amount: number; unit: BottleUnit } | null {
  if (isAmount(d.amount)) return { amount: d.amount, unit: isBottleUnit(d.unit) ? d.unit : 'oz' };
  if (isAmount(d.amount_oz)) return { amount: d.amount_oz, unit: 'oz' };
  return null;
}

/** Only the keys that belong to the type, with empty values dropped (potty false = plain diapers). */
export function cleanDetails(type: CareType, d: CareDetails | null | undefined): CareDetails {
  const out: CareDetails = {};
  if (!d) return out;
  if (type === 'bottle') {
    // The unit only goes with an amount; the old amount_oz is rewritten as {amount, unit: 'oz'}.
    const a = bottleAmount(d);
    if (a) {
      out.amount = a.amount;
      out.unit = a.unit;
    }
    if (isMilk(d.milk)) out.milk = d.milk;
  } else if (type === 'diaper') {
    if (d.potty === true) out.potty = true;
  } else if (type === 'medicine') {
    const dose = typeof d.dose === 'string' ? d.dose.trim() : '';
    if (dose) out.dose = dose;
  }
  return out;
}

export function hasDetails(d: CareDetails | null | undefined): boolean {
  return !!d && Object.keys(d).length > 0;
}

/** A care_items row as read from the database; before migration 08 every_minutes and details are missing. A bottle
 * saved before the Unit dropdown has {amount_oz: 4}; it reads as {amount: 4, unit: 'oz'}. */
export function normalizeCareItem(row: Omit<CareItem, 'every_minutes' | 'details'> & { every_minutes?: number | null; details?: CareDetails | null }): CareItem {
  let details: CareDetails = row.details && typeof row.details === 'object' && !Array.isArray(row.details) ? row.details : {};
  if ('amount_oz' in details) {
    const { amount_oz, ...rest } = details;
    details = rest;
    if (row.type === 'bottle' && !isAmount(rest.amount) && isAmount(amount_oz)) details = { ...rest, amount: amount_oz, unit: 'oz' };
  }
  return { ...row, every_minutes: row.every_minutes ?? null, details };
}

/** P20a's bottle amount in the chosen unit: "4" -> 4, "4.5" / "4,5" -> 4.5, "120" ml -> 120 (oz up to 32, ml up to
 * 1000); null when empty, undefined when it isn't an amount. */
export function parseAmount(text: string, unit: BottleUnit = 'oz'): number | null | undefined {
  const t = text.trim().replace(',', '.');
  if (!t) return null;
  if (!/^\d*(\.\d{0,2})?$/.test(t) || !/\d/.test(t)) return undefined;
  const n = Number(t);
  return Number.isFinite(n) && n > 0 && n <= MAX_AMOUNT[unit] ? n : undefined;
}

const amountText = (n: number, unit: BottleUnit) => `${Math.round(n * 100) / 100} ${unit}`;

/** The extras on their own: "4 oz formula", "120 ml breast milk", "4 oz", "breast milk", "5 ml"; '' when none. */
export function detailLabel(item: Pick<CareItem, 'type'> & { details?: CareDetails | null }): string {
  const d = cleanDetails(item.type, item.details);
  if (item.type === 'bottle') return [d.amount ? amountText(d.amount, d.unit ?? 'oz') : '', d.milk ?? ''].filter(Boolean).join(' ');
  if (item.type === 'medicine') return d.dose ?? '';
  return '';
}

/** The task line (P7 rows, P55 summary, booking tasks): "Bottle · 4 oz formula", "Tylenol · 5 ml", "Potty break". */
export function itemLine(item: Pick<CareItem, 'title' | 'type'> & { details?: CareDetails | null }, sep = ' · '): string {
  return [itemTitle(item), detailLabel(item)].filter(Boolean).join(sep);
}

// ---------------------------------------------------------------- days (Sun=1, Mon=2 ... Sat=64)
export const EVERY_DAY = 127;
export const WEEKDAYS = 62;
const WEEKEND = 65;
const SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const PLURAL = ['Sundays', 'Mondays', 'Tuesdays', 'Wednesdays', 'Thursdays', 'Fridays', 'Saturdays'];
/** P20a's day circles, Sunday first. */
export const DAY_LETTERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export function hasDay(mask: number, weekday: number): boolean {
  return (mask & (1 << weekday)) !== 0;
}

export function toggleDay(mask: number, weekday: number): number {
  return mask ^ (1 << weekday);
}

/** "Every day", "Weekdays", "Weekends", "Thursdays", "Mon, Wed". */
export function daysLabel(mask: number): string {
  const m = mask & EVERY_DAY;
  if (m === EVERY_DAY) return 'Every day';
  if (m === WEEKDAYS) return 'Weekdays';
  if (m === WEEKEND) return 'Weekends';
  const on = SHORT.map((_, i) => i).filter((i) => hasDay(m, i));
  if (on.length === 0) return 'No days';
  if (on.length === 1) return PLURAL[on[0]];
  // Monday first reads naturally in the US ("Mon, Wed, Sun").
  return [...on.filter((i) => i > 0), ...on.filter((i) => i === 0)].map((i) => SHORT[i]).join(', ');
}

// ---------------------------------------------------------------- interval repeats (P20 "Every 3 hrs")
/** P20a's "How often" choices; null = once. */
export const REPEAT_CHOICES: (number | null)[] = [null, 120, 180, 240];
/** Medicine is spaced further apart (P20g). */
export const MEDICINE_REPEAT_CHOICES: (number | null)[] = [null, 240, 360, 480];

/** "How often" choices by type; [] = the editor hides it and the item is saved as once (every_minutes null). */
export function repeatChoices(type: CareType): (number | null)[] {
  if (type === 'bottle' || type === 'diaper') return REPEAT_CHOICES;
  if (type === 'medicine') return MEDICINE_REPEAT_CHOICES;
  return [];
}

/** 120 -> "Every 2 hrs", 60 -> "Every 1 hr", 90 -> "Every 90 min"; '' when it doesn't repeat. */
export function repeatLabel(everyMinutes: number | null | undefined): string {
  if (!everyMinutes) return '';
  if (everyMinutes % 60) return `Every ${everyMinutes} min`;
  const h = everyMinutes / 60;
  return `Every ${h} ${h === 1 ? 'hr' : 'hrs'}`;
}

/** The sub-line next to an item's times (P20, P7): "Every day", "Weekdays"; a repeating item reads
 * "Every 3 hrs", plus " · Weekdays" only when it isn't every day. */
export function scheduleLabel(item: Pick<CareItem, 'days'> & { every_minutes?: number | null }): string {
  const repeat = repeatLabel(item.every_minutes);
  if (!repeat) return daysLabel(item.days);
  return (item.days & EVERY_DAY) === EVERY_DAY ? repeat : `${repeat} · ${daysLabel(item.days)}`;
}

/** "Thu" when the item runs on one day only (P55's "Soccer Thu 4:30"), else ''. */
function singleDay(mask: number): string {
  const on = SHORT.map((_, i) => i).filter((i) => hasDay(mask, i));
  return on.length === 1 ? SHORT[on[0]] : '';
}

// ---------------------------------------------------------------- times ("HH:MM:SS" in the database)
/** "7:00 PM", "19:00", "7pm", "7" -> "19:00" / "07:00"; null when it isn't a time. Empty -> null too. */
export function parseTime(text: string): string | null {
  const m = text.trim().match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm|a|p)?$/i);
  if (!m) return null;
  let h = Number(m[1]);
  const min = Number(m[2] ?? 0);
  const ap = m[3]?.[0]?.toLowerCase();
  if (min > 59 || h > 23 || (ap && (h < 1 || h > 12))) return null;
  if (ap === 'p' && h !== 12) h += 12;
  if (ap === 'a' && h === 12) h = 0;
  return `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
}

function hm(t: string): [number, number] {
  const [h, m] = t.split(':').map(Number);
  return [h, m];
}

export function minutesOf(t: string): number {
  const [h, m] = hm(t);
  return h * 60 + m;
}

/** "19:00:00" -> "7:00 PM" (P20 chips, P20a fields). */
export function formatTime(t: string | null): string {
  if (!t) return '';
  const [h, m] = hm(t);
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`;
}

/** P20v "Time": "3:30 – 4:00 PM", "11:30 AM – 1:00 PM", "7:00 PM" (no end), "Any time" (neither). */
export function timeRangeLabel(starts: string | null, ends: string | null): string {
  const a = formatTime(starts);
  const b = formatTime(ends);
  if (!a && !b) return 'Any time';
  if (!a) return `Until ${b}`;
  if (!b) return a;
  return a.slice(-2) === b.slice(-2) ? `${a.slice(0, -3)} – ${b}` : `${a} – ${b}`;
}

/** "15:15:00" -> "3:15" (P7's time column). */
export function shortTime(t: string | null): string {
  if (!t) return '';
  const [h, m] = hm(t);
  return `${h % 12 || 12}:${String(m).padStart(2, '0')}`;
}

/** "13:00" + "15:00" -> "1–3"; "9:30" + "10:30" -> "9:30–10:30" (P55's "School 8–3"). */
function shortRange(a: string, b: string): string {
  const drop = (t: string) => shortTime(t).replace(/:00$/, '');
  return `${drop(a)}–${drop(b)}`;
}

/** Saved items in day order: timed first by start, then the ones still without a time. */
export function sortItems<T extends Pick<CareItem, 'starts' | 'created_at'>>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    if (a.starts && b.starts) return minutesOf(a.starts) - minutesOf(b.starts) || a.created_at.localeCompare(b.created_at);
    if (a.starts) return -1;
    if (b.starts) return 1;
    return a.created_at.localeCompare(b.created_at);
  });
}

/** P55 Routine row: "Nap 1–3 · Bedtime 7:30 · Soccer Thu 4:30" from the first three items. */
export function routineSummary(items: CareItem[], max = 3): string {
  return sortItems(items)
    .slice(0, max)
    .map((i) => {
      const day = singleDay(i.days);
      const repeat = repeatLabel(i.every_minutes).toLowerCase();
      // A repeating item reads "Bottle every 3 hrs" (its times would read like a single slot).
      const time = repeat ? repeat : i.starts ? (i.ends ? shortRange(i.starts, i.ends) : shortTime(i.starts)) : '';
      // "Bottle 4 oz formula every 3 hrs": no " · " inside an item, since it separates the items.
      return [itemLine(i, ' '), day, time].filter(Boolean).join(' ');
    })
    .join(' · ');
}

// ---------------------------------------------------------------- booking
export type ShiftCareItem = { item: CareItem; at: Date };

/** Items that run on the shift's day(s) and start inside [start, end]. Kid items only for the given kids
 * (all kids when the list is empty); untimed items are skipped since they can't be placed.
 * A repeating item (every_minutes) adds one entry per interval from its start until its end time (next day when
 * the end is earlier than the start), or until the shift ends, and never past its next day's start. With no start
 * time it runs from the shift start (on a day it is set for) to its end time or the shift end. */
export function itemsForShift(items: CareItem[], start: Date, end: Date, kidIds: string[] = []): ShiftCareItem[] {
  if (!(end > start)) return [];
  const out: ShiftCareItem[] = [];
  const at = (d: Date, t: string, plusDays = 0) => {
    const [h, m] = hm(t);
    return new Date(d.getFullYear(), d.getMonth(), d.getDate() + plusDays, h, m);
  };
  const forKids = (item: CareItem) => !(item.kid_id && kidIds.length && !kidIds.includes(item.kid_id));
  const run = (item: CareItem, first: Date, last: Date) => {
    const step = (item.every_minutes ?? 0) * 60000;
    for (let t = +first; t <= +last && t <= +end; t += step) {
      if (t >= +start) out.push({ item, at: new Date(t) });
      if (!step) break;
    }
  };
  // A day early so a repeat that began before the shift still lands its later times inside it.
  const day = new Date(start.getFullYear(), start.getMonth(), start.getDate() - 1);
  for (; day <= end; day.setDate(day.getDate() + 1)) {
    for (const item of items) {
      if (!item.starts || !hasDay(item.days, day.getDay()) || !forKids(item)) continue;
      const first = at(day, item.starts);
      if (!item.every_minutes) {
        run(item, first, first);
        continue;
      }
      const nextDay = new Date(at(day, item.starts, 1).getTime() - 1);
      let last = nextDay;
      if (item.ends) {
        const e = at(day, item.ends, minutesOf(item.ends) <= minutesOf(item.starts) ? 1 : 0);
        if (e < last) last = e;
      }
      run(item, first, last);
    }
  }
  // Repeating items without a start time begin when the shift does.
  for (const item of items) {
    if (item.starts || !item.every_minutes || !hasDay(item.days, start.getDay()) || !forKids(item)) continue;
    let last = end;
    if (item.ends) {
      const e = at(start, item.ends);
      if (e <= start) e.setDate(e.getDate() + 1);
      if (e < last) last = e;
    }
    run(item, start, last);
  }
  return out.sort((a, b) => +a.at - +b.at);
}

/** Booking's task lines: "3:15 Pick up Ava", "1:00 Nap · Mia". */
export function shiftTaskLines(items: CareItem[], start: Date, end: Date, kidIds: string[], kidName: (id: string) => string | undefined): string[] {
  return itemsForShift(items, start, end, kidIds).map(({ item, at }) => {
    const time = `${at.getHours() % 12 || 12}:${String(at.getMinutes()).padStart(2, '0')}`;
    const who = item.kid_id ? kidName(item.kid_id) : undefined;
    return `${time} ${itemLine(item)}${who ? ` · ${who}` : ''}`;
  });
}

// ---------------------------------------------------------------- P20 "Suggested for age N"
export type Suggestion = { type: CareType; title: string; every_minutes?: number };

/** Plain defaults by age; no times, so each row asks the parent to "Set a time" (repeats show their interval).
 * No amounts or doses either (details stay empty): the parent fills those in on P20a. */
export function suggestedRoutine(ageMonths: number | null): Suggestion[] {
  if (ageMonths !== null && ageMonths < 12)
    return [
      { type: 'nap', title: 'Morning nap' },
      { type: 'bottle', title: 'Bottle', every_minutes: 180 },
      { type: 'nap', title: 'Afternoon nap' },
      { type: 'diaper', title: 'Diaper check', every_minutes: 120 },
      { type: 'bedtime', title: 'Bedtime' },
    ];
  if (ageMonths !== null && ageMonths < 48)
    return [
      { type: 'meal', title: 'Lunch' },
      { type: 'nap', title: 'Nap' },
      { type: 'meal', title: 'Snack' },
      { type: 'meal', title: 'Dinner' },
      { type: 'bedtime', title: 'Bedtime' },
    ];
  return [
    { type: 'meal', title: 'Snack' },
    { type: 'meal', title: 'Dinner' },
    { type: 'other', title: 'Bath' },
    { type: 'bedtime', title: 'Bedtime' },
  ];
}

/** The segment label: "Suggested for age 3", or "Suggested for babies" under one. */
export function suggestedLabel(ageMonths: number | null): string {
  if (ageMonths === null) return 'Suggested';
  if (ageMonths < 12) return 'Suggested for babies';
  return `Suggested for age ${Math.floor(ageMonths / 12)}`;
}

// P7 kid filter (All · Ava · Leo, ?kidId=). null = All: the whole family's plan as before. A kid: family items marked
// "Everyone" plus that kid's own; Routines shows only her row; food to avoid only on Meals.

/** The kid a screen is filtered to (?kidId=, e.g. a kid's shift report), or null for all (no param, or a kid that
 * isn't in the family). */
export function planKidId(kids: Pick<Kid, 'id'>[], param: string | null | undefined): string | null {
  return param && kids.some((k) => k.id === param) ? param : null;
}

/** Care plan (P7) "Family to-dos": the whole-family items (no kid), in time order. Each kid's own items are her day. */
export function familyItems<T extends Pick<CareItem, 'kid_id' | 'starts' | 'created_at'>>(items: T[]): T[] {
  return sortItems(items.filter((i) => i.kid_id === null));
}

/** A kid's day (P20, "Her plan"): her own items and the whole-family ones, one list in time order. */
export function kidDayItems<T extends Pick<CareItem, 'kid_id' | 'starts' | 'created_at'>>(items: T[], kidId: string): T[] {
  return sortItems(items.filter((i) => i.kid_id === null || i.kid_id === kidId));
}
