// Bottles planned by the parent (care plan P20a: care_items type 'bottle') and confirmed by the sitter (S5b bottle log,
// S4m "Confirm" on a planned bottle task). Pure functions, unit-tested in __tests__/bottle.test.ts.
import { detailLabel, MILKS, minutesOf, parseTime, repeatLabel, sortItems } from './care-plan';
import type { BottleUnit, CareItem, Kid, Milk } from './types';

/** "How much did she drink?" (the food log's None / Some / Most / All). */
export const DRANK = ['none', 'some', 'most', 'all'] as const;
export type Drank = (typeof DRANK)[number];

/** Millilitres in a US fluid ounce. */
export const ML_PER_OZ = 29.57;

/** The amount wheel's steps: half ounces, or 10 ml. */
export const AMOUNT_STEP: Record<BottleUnit, number> = { oz: 0.5, ml: 10 };
const AMOUNT_MAX: Record<BottleUnit, number> = { oz: 16, ml: 480 };
/** Before there's a plan: a 4 oz / 120 ml bottle. */
export const DEFAULT_AMOUNT: Record<BottleUnit, number> = { oz: 4, ml: 120 };

/** The wheel's values for a unit: 0.5 … 16 oz, or 10 … 480 ml. */
export function amountChoices(unit: BottleUnit): number[] {
  const step = AMOUNT_STEP[unit];
  return Array.from({ length: Math.round(AMOUNT_MAX[unit] / step) }, (_, i) => Math.round((i + 1) * step * 10) / 10);
}

/** An amount on the unit's wheel (nearest step, inside the range). */
export function snapAmount(n: number, unit: BottleUnit): number {
  const step = AMOUNT_STEP[unit];
  return Math.min(AMOUNT_MAX[unit], Math.max(step, Math.round(Math.round(n / step) * step * 10) / 10));
}

/** 4 oz -> 120 ml, 120 ml -> 4 oz (snapped to the other unit's wheel). */
export function convertAmount(n: number, from: BottleUnit, to: BottleUnit): number {
  if (from === to) return snapAmount(n, to);
  return snapAmount(to === 'ml' ? n * ML_PER_OZ : n / ML_PER_OZ, to);
}

/** "4", "4.5", "120". */
export const amountText = (n: number) => String(Math.round(n * 10) / 10);

// ---------------------------------------------------------------- shift tasks (S4m)
const TASK_TIME = /^\d{1,2}:\d{2}\s+/;

/** A booking task line for a planned bottle (shiftTaskLines): "12:00 Bottle · 4 oz formula · Mia", "3:00 Bottle". */
export function isBottleTask(title: string): boolean {
  return /^(?:\d{1,2}:\d{2}\s+)?bottle(?:\s+·|\s*$)/i.test(title.trim());
}

/** S4m's title for a bottle task: the line without its leading time (the time moves to the sub-line). */
export function bottleTaskTitle(title: string): string {
  return title.trim().replace(TASK_TIME, '');
}

/** The kid a bottle task is for: the line's " · Mia" suffix, else the shift's only kid, else null. */
export function bottleTaskKid(title: string, kids: Pick<Kid, 'id' | 'name'>[]): string | null {
  const parts = title.split(' · ');
  const last = parts.length > 1 ? parts[parts.length - 1].trim().toLowerCase() : '';
  const named = last ? kids.find((k) => k.name.trim().toLowerCase() === last) : undefined;
  if (named) return named.id;
  return kids.length === 1 ? kids[0].id : null;
}

/** What the task line says about the bottle: "Bottle · 4 oz formula" -> {amount: 4, unit: 'oz', milk: 'formula'}. */
export function bottleTaskDetails(title: string): { amount?: number; unit?: BottleUnit; milk?: Milk } {
  const out: { amount?: number; unit?: BottleUnit; milk?: Milk } = {};
  const m = title.match(/(\d+(?:[.,]\d+)?)\s*(oz|ml)\b/i);
  if (m) {
    out.amount = Number(m[1].replace(',', '.'));
    out.unit = m[2].toLowerCase() as BottleUnit;
  }
  const milk = MILKS.find((x) => new RegExp(`\\b${x.value}\\b`, 'i').test(title));
  if (milk) out.milk = milk.value;
  return out;
}

// ---------------------------------------------------------------- the plan (P20a bottle items)
/** Minutes (0-1439) from `at` to the nearest of the item's times that day, either way round midnight; null when it has
 * no start time. A repeat counts each of its times until its end (or the next day's start). */
function minutesAway(item: Pick<CareItem, 'starts' | 'ends' | 'every_minutes'>, at: Date): number | null {
  if (!item.starts) return null;
  const now = at.getHours() * 60 + at.getMinutes();
  const start = minutesOf(item.starts);
  let last = start;
  if (item.every_minutes) {
    last = start + 1439;
    if (item.ends) last = Math.min(last, minutesOf(item.ends) + (minutesOf(item.ends) <= start ? 1440 : 0));
  }
  let best = Infinity;
  for (let t = start; t <= last; t += item.every_minutes || 1440) {
    const d = Math.abs((t % 1440) - now);
    best = Math.min(best, d, 1440 - d);
  }
  return best;
}

/** The kid's planned bottle closest to `at` (now, or the task's time), else her first bottle item; null with none. */
export function planBottle<T extends Pick<CareItem, 'kid_id' | 'type' | 'starts' | 'ends' | 'every_minutes' | 'created_at'>>(items: T[], kidId: string | null | undefined, at: Date): T | null {
  if (!kidId) return null;
  const mine = sortItems(items.filter((i) => i.type === 'bottle' && i.kid_id === kidId));
  let best: T | null = null;
  let bestAway = Infinity;
  for (const i of mine) {
    const away = minutesAway(i, at);
    if (away != null && away < bestAway) {
      best = i;
      bestAway = away;
    }
  }
  return best ?? mine[0] ?? null;
}

/** P5m "Plan: every 3 hrs": the kid's repeating bottle's interval in minutes, null when none repeats. */
export function plannedEvery(items: Pick<CareItem, 'kid_id' | 'type' | 'every_minutes'>[], kidId: string): number | null {
  return items.find((i) => i.type === 'bottle' && i.kid_id === kidId && i.every_minutes)?.every_minutes ?? null;
}

/** S5b's plan line after "From Jen’s plan: ": "4 oz formula, every 3 hrs", "4 oz formula", "a bottle, every 3 hrs". */
export function planLine(item: Pick<CareItem, 'type' | 'details' | 'every_minutes'>): string {
  const what = detailLabel(item) || 'a bottle';
  const every = repeatLabel(item.every_minutes).toLowerCase();
  return every ? `${what}, ${every}` : what;
}

// ---------------------------------------------------------------- bottle logs (food log, meal 'bottle')
export type BottleLog = { milk: string; amount: number | null; unit: BottleUnit; drank: string };

/** A food log saved from S5b: meal 'bottle' with milk, bottle_amount, bottle_unit and amount (what she drank). Null
 * for other food logs and for older bottle logs without these fields. */
export function bottleLog(l: { kind: string; data: Record<string, string> | null }): BottleLog | null {
  const d = l.data ?? {};
  if (l.kind !== 'food' || (d.meal ?? '').toLowerCase() !== 'bottle' || !(d.bottle_amount || d.milk)) return null;
  const n = Number(d.bottle_amount);
  return { milk: d.milk ?? '', amount: Number.isFinite(n) && n > 0 ? n : null, unit: d.bottle_unit === 'ml' ? 'ml' : 'oz', drank: d.amount ?? '' };
}

/** "4 oz formula · drank all" (P77 rows, the shift report, S4m's done task). */
export function bottleDetail(b: BottleLog): string {
  return [[b.amount ? `${amountText(b.amount)} ${b.unit}` : '', b.milk].filter(Boolean).join(' '), b.drank ? `drank ${b.drank}` : ''].filter(Boolean).join(' · ');
}

/** The S5b time wheel's "3:45 PM" as a date: today, or yesterday when that would be in the future (past midnight). */
export function loggedAt(text: string, now = new Date()): Date {
  const t = parseTime(text);
  if (!t) return now;
  const d = new Date(now);
  d.setHours(Number(t.slice(0, 2)), Number(t.slice(3, 5)), 0, 0);
  if (+d > +now + 60_000) d.setDate(d.getDate() - 1);
  return d;
}
