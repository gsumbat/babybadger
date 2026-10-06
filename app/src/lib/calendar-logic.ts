// Date math for the Calendar tabs (wireframes P6a–c, S6, S6a, S6c). Pure functions, unit-tested.
import type { Shift } from './types';

export type CalendarView = 'day' | 'week' | 'month';

export const sameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString();

export function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

/** Same day of the month n months away, clamped to the month's last day (Jan 31 + 1 month = Feb 28). */
export function addMonths(d: Date, n: number): Date {
  const x = new Date(d.getFullYear(), d.getMonth() + n, 1, d.getHours(), d.getMinutes());
  const last = new Date(x.getFullYear(), x.getMonth() + 1, 0).getDate();
  x.setDate(Math.min(d.getDate(), last));
  return x;
}

/** "2026-10-01" in local time (the date columns of sitter_time_off). */
export function dayKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** "2026-10-01" -> local midnight. */
export function fromKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/** The Monday-to-Sunday week around d. */
export function weekOf(d: Date): Date[] {
  const start = startOfDay(d);
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

/** Month grid (P6c / S6c): Monday-first weeks covering the month, padded with the days around it. */
export function monthGrid(d: Date): Date[][] {
  const first = new Date(d.getFullYear(), d.getMonth(), 1);
  const last = new Date(d.getFullYear(), d.getMonth() + 1, 0);
  const weeks: Date[][] = [];
  for (let w = weekOf(first)[0]; w <= last; w = addDays(w, 7)) weeks.push(weekOf(w));
  return weeks;
}

/** Shifts that start on this day (cancelled ones are never drawn). */
export function shiftsOn(shifts: Shift[], d: Date): Shift[] {
  return shifts.filter((s) => s.status !== 'cancelled' && sameDay(new Date(s.starts_at), d)).sort((a, b) => a.starts_at.localeCompare(b.starts_at));
}

export function shiftsInMonth(shifts: Shift[], d: Date): Shift[] {
  return shifts.filter((s) => {
    const x = new Date(s.starts_at);
    return s.status !== 'cancelled' && x.getFullYear() === d.getFullYear() && x.getMonth() === d.getMonth();
  });
}

export function hoursOf(shifts: Pick<Shift, 'starts_at' | 'ends_at'>[]): number {
  return shifts.reduce((h, s) => h + Math.max(0, +new Date(s.ends_at) - +new Date(s.starts_at)) / 36e5, 0);
}

/** 6.5 -> "6.5", 4 -> "4", 4.25 -> "4.3" (S6a "6.5 hrs booked"). */
export function formatHours(h: number): string {
  return String(Math.round(h * 10) / 10);
}

/** Hours since midnight, e.g. 3:15 PM -> 15.25. */
export function hourOf(d: Date): number {
  return d.getHours() + d.getMinutes() / 60;
}

/** The day timeline's hours (P6a / S6a show 2 PM – 10 PM): widened to fit every shift that day. */
export function dayWindow(shifts: Pick<Shift, 'starts_at' | 'ends_at'>[], day: Date, from = 14, to = 22): { from: number; to: number } {
  let a = from;
  let b = to;
  const midnight = startOfDay(day);
  for (const s of shifts) {
    const start = (+new Date(s.starts_at) - +midnight) / 36e5;
    const end = (+new Date(s.ends_at) - +midnight) / 36e5;
    a = Math.min(a, Math.floor(start));
    b = Math.max(b, Math.ceil(end));
  }
  return { from: Math.max(0, a), to: Math.min(24, b) };
}

/** Where P6a's dashed "+ Book a sitter" box goes: the 2 hours after the day's last shift (or from 3 PM on an empty
 * day), never in the past. Null on past days or when less than an hour of the window is left. */
export function bookingSlot(shifts: Pick<Shift, 'starts_at' | 'ends_at'>[], day: Date, win: { from: number; to: number }, now = new Date()): { from: number; to: number } | null {
  const midnight = startOfDay(day);
  if (+midnight < +startOfDay(now)) return null;
  let from = Math.max(win.from, 15);
  if (shifts.length) from = Math.max(...shifts.map((s) => (+new Date(s.ends_at) - +midnight) / 36e5));
  if (sameDay(day, now)) from = Math.max(from, Math.ceil(hourOf(now)));
  const to = Math.min(win.to, from + 2);
  return to - from >= 1 ? { from, to } : null;
}

/** Day nav title (P6a "Today" / "Thursday, October 1"). */
export function dayTitle(d: Date, now = new Date()): { title: string; sub: string } {
  const full = d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  const diff = Math.round((+startOfDay(d) - +startOfDay(now)) / 864e5);
  const rel = diff === 0 ? 'Today' : diff === 1 ? 'Tomorrow' : diff === -1 ? 'Yesterday' : '';
  if (rel) return { title: rel, sub: full };
  return { title: d.toLocaleDateString('en-US', { weekday: 'long' }), sub: d.toLocaleDateString('en-US', { month: 'long', day: 'numeric' }) };
}

/** "Sep 28 – Oct 4" / "Oct 5 – 11" (P6b). */
export function weekTitle(days: Date[]): string {
  const short = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const a = days[0];
  const b = days[days.length - 1];
  return `${short(a)} – ${b.getMonth() === a.getMonth() ? b.getDate() : short(b)}`;
}

/** "October 2026" (P6c). */
export function monthTitle(d: Date): string {
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

export type DateRange = { starts: string; ends: string };

/** Is this day inside any of the ranges (dates "YYYY-MM-DD", both ends included)? */
export function inRanges(d: Date, ranges: DateRange[]): boolean {
  const k = dayKey(d);
  return ranges.some((r) => r.starts <= k && k <= r.ends);
}

/** "Oct 16 – 18", "Oct 30 – Nov 2", "Oct 16" (S11 time off). Adds the year when it isn't this year's. */
export function rangeLabel(r: DateRange, now = new Date()): string {
  const a = fromKey(r.starts);
  const b = fromKey(r.ends);
  const year = (d: Date) => (d.getFullYear() !== now.getFullYear() ? `, ${d.getFullYear()}` : '');
  const short = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  if (r.starts === r.ends) return short(a) + year(a);
  if (a.getFullYear() !== b.getFullYear()) return `${short(a)}${year(a)} – ${short(b)}${year(b)}`;
  return `${short(a)} – ${b.getMonth() === a.getMonth() ? b.getDate() : short(b)}${year(b)}`;
}

/** Families get the S50 stripe colors in the order the sitter joined them (no color is stored yet). */
export const FAMILY_COLORS = [
  { dot: '#2F6FD6', tint: '#D9E5FA', ink: '#1F4E9A' }, // S6a Lee
  { dot: '#D9822B', tint: '#F9D9B5', ink: '#8A4A12' }, // S6a Ortiz
  { dot: '#8676B3', tint: '#E6E2F1', ink: '#4F4478' },
];

export function familyColor(links: { family_id: string; joined_at: string }[], familyId: string) {
  const order = [...links].sort((a, b) => +new Date(a.joined_at) - +new Date(b.joined_at)).map((l) => l.family_id);
  const i = order.indexOf(familyId);
  return FAMILY_COLORS[(i < 0 ? 0 : i) % FAMILY_COLORS.length];
}
