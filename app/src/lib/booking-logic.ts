// Booking sends a request (migration 35; wireframes P6d Send request, P6e Repeat, P6g the sitter is unavailable,
// S33s a repeating request). Pure functions, unit-tested. Data and calls: ./booking.ts.
import { addDays, dayKey, fromKey, startOfDay, type DateRange } from './calendar-logic';
import { isEvening, type PoolStatus, type TimeWindow } from './pool-logic';
import { calendarFit, effectiveStatus, spanText, type AskedSitter, type PillKind, type ShiftRequest } from './pool-requests-logic';
import { parseTimeOnDay } from './shift-logic';

/** What create_booking_request takes at most (P6e). */
export const MAX_DATES = 60;
export const MAX_MONTHS = 6;
/** P6e day buttons, Sunday first (Date.getDay()). */
export const WEEKDAY_LETTERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'] as const;
const WEEKDAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
export const weekdayName = (n: number) => WEEKDAY_NAMES[n];

/** P6e "Until" default: 4 weeks after the first date ("YYYY-MM-DD"). */
export const defaultUntil = (first: Date) => dayKey(addDays(first, 28));

/** The latest "Until": 6 months after the first date. */
export function maxUntil(first: Date): string {
  const d = startOfDay(first);
  return dayKey(new Date(d.getFullYear(), d.getMonth() + MAX_MONTHS, d.getDate()));
}

/** P6e: every day from the first date through "Until" (never past 6 months) that falls on a picked weekday, at most
 * 60. Days are local midnights, so each date keeps the same clock time across a daylight saving change. */
export function repeatDays(first: Date, weekdays: number[], until: string): Date[] {
  const last = until && until < maxUntil(first) ? until : maxUntil(first);
  const out: Date[] = [];
  for (let d = startOfDay(first); dayKey(d) <= last && out.length < MAX_DATES; d = addDays(d, 1)) {
    if (weekdays.includes(d.getDay())) out.push(d);
  }
  return out;
}

/** The same Starts / Ends on each day ("3:00 PM" or "15:00"); an end at or before the start runs past midnight.
 * Null when a time can't be read. */
export function dayWindows(days: Date[], start: string, end: string): TimeWindow[] | null {
  const out: TimeWindow[] = [];
  for (const day of days) {
    const a = parseTimeOnDay(start, day);
    let b = parseTimeOnDay(end, day);
    if (!a || !b) return null;
    if (+b <= +a) b = addDays(b, 1);
    out.push({ start: a, end: b });
  }
  return out;
}

/** "Mon, Wed, Fri" (Monday first, like the S33s line). */
export function weekdayList(days: Date[]): string {
  const set = [...new Set(days.map((d) => d.getDay()))].sort((a, b) => ((a + 6) % 7) - ((b + 6) % 7));
  return set.map((n) => WEEKDAY_NAMES[n].slice(0, 3)).join(', ');
}

const monthDay = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

/** P6e summary: count "12 shifts" (bold) and the rest "Mon, Wed, Fri · until Nov 13". */
export function repeatSummary(days: Date[]): { count: string; rest: string } {
  const n = days.length;
  const count = `${n} ${n === 1 ? 'shift' : 'shifts'}`;
  if (!n) return { count, rest: 'pick at least one day' };
  return { count, rest: `${weekdayList(days)} · until ${monthDay(days[n - 1])}` };
}

/** P6e button: "Send request" / "Send request for 12 shifts". */
export const sendRequestLabel = (n: number) => (n > 1 ? `Send request for ${n} shifts` : 'Send request');

/** S33s card line: "Mon, Wed, Fri · 3:00 – 7:00 PM · Oct 12 – Nov 13" (the first date's times). */
export function seriesLine(ws: TimeWindow[]): string {
  if (!ws.length) return '';
  const first = ws[0];
  const last = ws[ws.length - 1];
  return `${weekdayList(ws.map((w) => w.start))} · ${spanText(first.start, first.end)} · ${monthDay(first.start)} – ${monthDay(last.start)}`;
}

/** S33s title: "Jen asks you to sit 12 times". */
export const seriesTitle = (parent: string, n: number) => `${parent} asks you to sit ${n} times`;

// ---------------------------------------------------------------- P6g availability
export type BookingWarning = { title: string; sub: string; offer: TimeWindow | null };

/** P6g: why she may not be free for the window, from the pool's status (lib/pool-logic). Null when she's free, or
 * hasn't set her hours (nothing to warn about). offer = the part she is free ("Book 6:00 – 7:00 PM"). */
export function bookingWarning(s: PoolStatus, w: TimeWindow, name: string): BookingWarning | null {
  switch (s.state) {
    case 'partly': {
      const from = s.freeFrom!;
      const to = s.freeTo!;
      const offer = { start: from, end: to };
      if (+from > +w.start && +to < +w.end) return { title: `${name} is only free ${spanText(from, to)}`, sub: 'Not her usual hours', offer };
      const off = +to < +w.end ? { start: to, end: w.end } : { start: w.start, end: from };
      return { title: `${name} is unavailable ${spanText(off.start, off.end)}`, sub: 'Not her usual hours', offer };
    }
    case 'busy':
      return { title: `${name} is unavailable ${spanText(w.start, w.end)}`, sub: isEvening(w) ? 'Booked that evening' : 'Booked then', offer: null };
    case 'away':
      return { title: `${name} is unavailable ${spanText(w.start, w.end)}`, sub: 'Her time off. You can still ask her.', offer: null };
    case 'off':
      return { title: `${name} is unavailable ${spanText(w.start, w.end)}`, sub: 'Not her usual hours', offer: null };
    default:
      return null;
  }
}

/** P6g for a series: "Maya is busy on 2 of 12 dates" and those dates' keys ("Skip those dates"). Null when she's
 * free on every date. */
export function seriesWarning(statuses: PoolStatus[], ws: TimeWindow[], name: string): { title: string; sub: string; keys: string[] } | null {
  const bad = ws.filter((w, i) => bookingWarning(statuses[i], w, name));
  if (!bad.length) return null;
  const n = ws.length;
  return {
    title: `${name} is busy on ${bad.length} of ${n} ${n === 1 ? 'date' : 'dates'}`,
    sub: bad.slice(0, 3).map((w) => w.start.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })).join(' · ') + (bad.length > 3 ? ` · ${bad.length - 3} more` : ''),
    keys: bad.map((w) => dayKey(w.start)),
  };
}

// ---------------------------------------------------------------- waiting and answers
/** The requests of one series (or a single request), with the sitter's row. */
export type BookingItem = { request: ShiftRequest; asked: AskedSitter | undefined };

/** Parent Home row for a series (P4b): "12 shifts with Maya". */
export const seriesRowTitle = (n: number, name: string) => `${n} ${n === 1 ? 'shift' : 'shifts'} with ${name}`;

/** Parent Home row line / P46 series card: "Waiting for Maya", "Maya took 10 · can’t make 2". */
export function seriesSub(items: BookingItem[], name: string, now = new Date()): string {
  const open = items.filter((x) => effectiveStatus(x.request, now) === 'open');
  const waiting = open.filter((x) => x.asked?.status === 'sent' || x.asked?.status === 'seen').length;
  if (waiting) return `Waiting for ${name}`;
  const took = items.filter((x) => x.request.status === 'filled').length;
  const no = open.filter((x) => x.asked?.status === 'declined').length;
  const parts = [took ? `${name} took ${took}` : '', no ? `can’t make ${no}` : ''].filter(Boolean);
  return parts.length ? parts.join(' · ') : `${name} answered`;
}

/** P46 series: one date's answer. */
export function dateAnswer(x: BookingItem, now = new Date()): { pill: string; kind: PillKind } {
  const st = effectiveStatus(x.request, now);
  if (st === 'filled') return { pill: 'Booked', kind: 'ok' };
  if (st === 'cancelled') return { pill: 'Cancelled', kind: 'muted' };
  if (st === 'expired') return { pill: 'Expired', kind: 'muted' };
  if (x.asked?.status === 'declined') return { pill: 'Can’t make it', kind: 'muted' };
  if (x.asked?.status === 'offered') return { pill: 'Offer', kind: 'warn' };
  return { pill: x.asked?.status === 'seen' ? 'Seen' : 'Waiting', kind: 'primary' };
}

/** Sitter Home row for a series (S3): "Lee family · 12 shifts from Oct 12". */
export function sitterSeriesTitle(familyName: string, n: number, first: Date): string {
  return `${familyName.replace(/^The /, '')} · ${n} ${n === 1 ? 'shift' : 'shifts'} from ${monthDay(first)}`;
}

/** S33s date tag: her time off, another shift, or nothing. */
export function dateClash(w: TimeWindow, timeOff: DateRange[], shifts: { family_id: string; status: string; starts_at: string; ends_at: string }[]): 'time_off' | 'busy' | null {
  const fit = calendarFit(w, timeOff, shifts);
  return fit.kind === 'time_off' ? 'time_off' : fit.kind === 'shift' ? 'busy' : null;
}

/** Sitter Home row line for a series: "Fits your calendar" / "2 dates clash with your calendar" + time left. */
export function sitterSeriesSub(clashes: number, left: string): string {
  return `${clashes ? `${clashes} ${clashes === 1 ? 'date clashes' : 'dates clash'} with your calendar` : 'Fits your calendar'} · ${left}`;
}

/** S33s after "Accept": the dates that couldn't be booked, e.g. "Couldn’t book Mon, Oct 12: you’re already booked then." */
export function answerProblems(results: { request_id: string; result: string }[], items: BookingItem[]): string {
  const why: Record<string, string> = { busy: 'you’re already booked then', missing_requirement: 'you’re missing a must-have requirement', failed: 'something went wrong' };
  return results
    .filter((r) => why[r.result])
    .map((r) => {
      const req = items.find((x) => x.request.id === r.request_id)?.request;
      const day = req ? new Date(req.starts_at).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : 'a date';
      return `Couldn’t book ${day}: ${why[r.result]}.`;
    })
    .join(' ');
}

/** "YYYY-MM-DD" -> "Nov 13" (P6e). */
export const shortDay = (key: string) => monthDay(fromKey(key));
