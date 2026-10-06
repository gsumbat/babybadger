// Pure rules for S21 Running late and S25 Extend shift (migration 14). Mirrors the checks in report_late /
// request_extension / answer_extension so the screens and the database agree. No React, no Supabase: unit tested.
import type { Shift, Task } from './types';

/** S21 "HOW LATE" chips. */
export const LATE_CHOICES = [5, 10, 15, 30] as const;
/** Parent's "stay longer" chips: minutes past the current end. */
export const EXTEND_CHOICES = [15, 30, 45, 60] as const;
/** The database refuses extensions longer than this past the current end. */
export const MAX_EXTEND_MIN = 12 * 60;
/** Gap the sitter needs before her next shift (S25: next starts 7:30, "Staying past 7:15 makes you late there"). */
export const NEXT_SHIFT_BUFFER_MIN = 15;

const MIN = 60_000;

/** "3:15" (no AM/PM), as the wireframes write task times and chips. */
export function clock(d: Date | string): string {
  const t = new Date(d);
  return `${t.getHours() % 12 || 12}:${String(t.getMinutes()).padStart(2, '0')}`;
}

/** "3:15 PM". */
export function clockAmPm(d: Date | string): string {
  const t = new Date(d);
  return `${clock(t)} ${t.getHours() < 12 ? 'AM' : 'PM'}`;
}

/** "45 min", "1 h", "1 h 15 min". */
export function minutesLabel(min: number): string {
  const m = Math.max(0, Math.round(min));
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  return m % 60 ? `${h} h ${m % 60} min` : `${h} h`;
}

/** The shift's first task with a time that isn't done yet (S21 "pickup at 3:15"). */
export function firstTimedTask(tasks: Pick<Task, 'title' | 'due_at' | 'done_at'>[]) {
  return tasks.filter((t) => t.due_at && !t.done_at).sort((a, b) => +new Date(a.due_at!) - +new Date(b.due_at!))[0];
}

/** "Pick up Ava" → "pick up Ava" for the middle of a sentence. */
export function taskPhrase(title: string): string {
  const t = title.trim();
  return t ? t[0].toLowerCase() + t.slice(1) : t;
}

/** The late arrival reaches the task's time (S21: starts 3:00 + 15 min late = pickup at 3:15 is at risk). */
export function isAtRisk(startsAt: string, lateMin: number, task?: Pick<Task, 'due_at'>): boolean {
  if (!task?.due_at || !lateMin) return false;
  return +new Date(startsAt) + lateMin * MIN >= +new Date(task.due_at);
}

/** S21 amber banner's bold line, also the end of the parents' push: "Pick up Ava at 3:15 is at risk." */
export function riskLine(task: Pick<Task, 'title' | 'due_at'>): string {
  const t = task.title.trim();
  return `${t ? t[0].toUpperCase() + t.slice(1) : 'Task'} at ${clock(task.due_at!)} is at risk.`;
}

/** "Maya is running 15 min late" (push title and the parents' P4c line). */
export function lateText(sitter: string, minutes: number): string {
  return `${sitter} is running ${minutes} min late`;
}

/** Same-day shift of hers that starts once this one ends, the nearest first (S25 "your Ortiz shift starts 7:30 PM"). */
export function nextShiftAfter<S extends Pick<Shift, 'id' | 'starts_at' | 'ends_at' | 'status'>>(shift: S, mine: S[]): S | undefined {
  const day = new Date(shift.ends_at).toDateString();
  return mine
    .filter((s) => s.id !== shift.id && (s.status === 'scheduled' || s.status === 'active') && +new Date(s.starts_at) >= +new Date(shift.ends_at) && new Date(s.starts_at).toDateString() === day)
    .sort((a, b) => +new Date(a.starts_at) - +new Date(b.starts_at))[0];
}

/** Latest she can stay and still reach her next shift on time. */
export function latestSafeEnd(next: Pick<Shift, 'starts_at'>): Date {
  return new Date(+new Date(next.starts_at) - NEXT_SHIFT_BUFFER_MIN * MIN);
}

/** S25 chips before "Custom": the latest safe time when the request runs past it, then the time asked. */
export function extensionChoices(currentEnd: string, requested: string, safe?: Date): Date[] {
  const req = new Date(requested);
  if (safe && +safe > +new Date(currentEnd) && +safe < +req) return [safe, req];
  return [req];
}

/** Is a chosen end a valid extension (after the current end, at most 12 hours past it)? */
export function validExtension(currentEnd: string, until: Date): boolean {
  const extra = (+until - +new Date(currentEnd)) / MIN;
  return extra > 0 && extra <= MAX_EXTEND_MIN;
}

/** "7:50 PM" from the custom time wheel → a time after the current end (the next day when it is past midnight). */
export function customEnd(text: string, currentEnd: string): Date | null {
  const m = text.trim().match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/i);
  if (!m) return null;
  let h = Number(m[1]);
  const min = Number(m[2] ?? 0);
  const ap = m[3]?.toLowerCase();
  if (min > 59 || h > 23 || (ap && (h < 1 || h > 12))) return null;
  if (ap === 'pm' && h !== 12) h += 12;
  if (ap === 'am' && h === 12) h = 0;
  const end = new Date(currentEnd);
  const d = new Date(end);
  d.setHours(h, min, 0, 0);
  if (+d <= +end) d.setDate(d.getDate() + 1);
  return d;
}

/** Parent's chips: end times 15 / 30 / 45 / 60 min after the current end. */
export function extendOptions(currentEnd: string): Date[] {
  return EXTEND_CHOICES.map((m) => new Date(+new Date(currentEnd) + m * MIN));
}

/** "$22 × 0.75 hr = $16.50"; null when no rate is set (the row is left out). */
export function extraPay(rate: number | null | undefined, minutes: number): string | null {
  if (rate == null || !(rate > 0) || !(minutes > 0)) return null;
  const hrs = Math.round((minutes / 60) * 100) / 100;
  return `${money(rate)} × ${hrs} hr = ${money(Math.round(rate * hrs * 100) / 100, true)}`;
}

function money(v: number, cents = false): string {
  return `$${!cents && Number.isInteger(v) ? v : v.toFixed(2)}`;
}

/** S25 big line: the parent's note, then the question ("Stuck in a meeting. Can you stay until 7:45?"). */
export function requestQuestion(note: string, until: string): string {
  return [note.trim(), `Can you stay until ${clock(until)}?`].filter(Boolean).join(' ');
}

/** "Tell the Lee family" / "Ask Maya…" use the family name without a leading "The". */
export function familyShort(name: string): string {
  return name.replace(/^the\s+/i, '');
}
