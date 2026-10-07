// Who in the family's pool is free for a time window (wireframes P54 Sitters tab and P42 Sitter pool).
// Pure functions, unit-tested. Parents only see their own family's shifts, the sitter's weekly hours
// (sitter_availability) and her days off (family_sitter_time_off, no reason), so "Busy" means booked with this family.
import { addDays, dayKey, fromKey, sameDay, startOfDay, weekOf, type DateRange } from './calendar-logic';
import type { Shift } from './types';

export type TimeWindow = { start: Date; end: Date };

/** A weekday's hours, as sitter_availability stores them (weekday 0 = Sunday, times "HH:MM:SS"). */
export type WeekHours = { sitter_id: string; weekday: number; starts: string; ends: string };

export type PoolState = 'needs_sign' | 'on_shift' | 'away' | 'busy' | 'free' | 'partly' | 'off' | 'no_hours';

export type PoolStatus = {
  state: PoolState;
  /** Partly free: the part of the window she is free. */
  freeFrom?: Date;
  freeTo?: Date;
  /** Away: last day off ("YYYY-MM-DD"). */
  awayUntil?: string;
};

const at = (day: Date, h: number, m = 0) => {
  const d = startOfDay(day);
  d.setHours(h, m, 0, 0);
  return d;
};

/** The next :00 or :30 at or after now. */
export function nextHalfHour(now: Date): Date {
  const d = new Date(now);
  d.setSeconds(0, 0);
  const m = d.getMinutes();
  if (m === 0 || m === 30) return d;
  d.setMinutes(m < 30 ? 30 : 60);
  return d;
}

/** P54 "Today": 6 – 10 PM today. After 6 PM it starts at the next half hour; it always runs at least 2 hours
 * (late at night it runs past midnight). */
export function tonightWindow(now = new Date()): TimeWindow {
  const six = at(now, 18);
  const start = +now > +six ? nextHalfHour(now) : six;
  const ten = at(now, 22);
  const end = new Date(Math.max(+ten, +start + 2 * 3600_000));
  return { start, end };
}

/** P43's switch: Mornings / Afternoons / Evenings, as hours of the day. Evenings match P54's "Today" (6 – 10 PM). */
export type DaySlot = 'morning' | 'afternoon' | 'evening';
export const SLOTS: Record<DaySlot, { label: string; from: number; to: number }> = {
  morning: { label: 'Mornings', from: 8, to: 12 },
  afternoon: { label: 'Afternoons', from: 12, to: 17 },
  evening: { label: 'Evenings', from: 18, to: 22 },
};

/** Which P43 slot a window falls in (by its start). */
export function slotOf(w: TimeWindow): DaySlot {
  const h = w.start.getHours();
  return h < 12 ? 'morning' : h < 17 ? 'afternoon' : 'evening';
}

/** A P43 cell's window: the slot's hours on that day. Today, a slot that has started runs from the next half hour;
 * a slot that is over (and any past day) is null. */
export function slotWindow(day: Date, slot: DaySlot, now = new Date()): TimeWindow | null {
  const { from, to } = SLOTS[slot];
  if (isPastDay(day, now)) return null;
  let start = at(day, from);
  const end = at(day, to);
  if (+now > +start) start = nextHalfHour(now);
  return +start < +end ? { start, end } : null;
}

/** P43 card title: "Saturday evening". */
export function slotTitle(day: Date, slot: DaySlot): string {
  return `${day.toLocaleDateString('en-US', { weekday: 'long' })} ${slot}`;
}

/** P43 ?week=YYYY-MM-DD: the Monday of that week (this week when missing or unreadable). */
export function weekStart(param: string | undefined, now = new Date()): Date {
  const d = param ? fromKey(param) : now;
  return weekOf(isNaN(+d) ? now : d)[0];
}

/** A day before today (P43 cells, past days in the "Pick a time" sheet). */
export const isPastDay = (d: Date, now = new Date()) => +startOfDay(d) < +startOfDay(now);

/** Day + "6:00 PM" + "10:00 PM" -> window; an end at or before the start runs past midnight. Null if unreadable. */
export function windowFrom(dayKeyStr: string, startText: string, endText: string): TimeWindow | null {
  const day = fromKey(dayKeyStr);
  const a = clock(startText);
  const b = clock(endText);
  if (!a || !b || isNaN(+day)) return null;
  const start = at(day, a[0], a[1]);
  let end = at(day, b[0], b[1]);
  if (+end <= +start) end = addDays(end, 1);
  return { start, end };
}

function clock(text: string): [number, number] | null {
  const m = text.trim().match(/^(\d{1,2})(?::(\d{2}))?\s*([ap])\.?m?\.?$/i);
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2] ?? 0);
  if (h < 1 || h > 12 || min > 59) return null;
  return [(h % 12) + (m[3].toLowerCase() === 'p' ? 12 : 0), min];
}

/** Date -> "6:00 PM". */
export function timeText(d: Date): string {
  const h = d.getHours();
  return `${h % 12 || 12}:${String(d.getMinutes()).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`;
}

/** Date -> "9 PM" / "9:30 PM" (P42 pill "Until 9 PM"). */
export function shortTimeText(d: Date): string {
  return timeText(d).replace(':00', '');
}

/** P42 time card: "Sat, Oct 10 · 6:00 – 10:00 PM" (AM/PM once when both ends share it). */
export function windowLabel(w: TimeWindow): string {
  const day = w.start.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  const a = timeText(w.start);
  const b = timeText(w.end);
  const same = a.slice(-2) === b.slice(-2);
  return `${day} · ${same ? a.slice(0, -3) : a} – ${b}`;
}

/** Is the window an evening one (P42 "Free all evening", "Booked that evening")? */
export const isEvening = (w: TimeWindow) => w.start.getHours() >= 17;

const overlaps = (a0: number, a1: number, b0: number, b1: number) => a0 < b1 && b0 < a1;

/** The hours she set for the window's day, as dates on that day (an end before the start runs past midnight). */
function hoursOn(w: TimeWindow, hours: Pick<WeekHours, 'weekday' | 'starts' | 'ends'>[]): TimeWindow | null {
  const row = hours.find((h) => h.weekday === w.start.getDay());
  if (!row) return null;
  const [sh, sm] = row.starts.split(':').map(Number);
  const [eh, em] = row.ends.split(':').map(Number);
  const start = at(w.start, sh, sm);
  let end = at(w.start, eh, em);
  if (+end <= +start) end = addDays(end, 1);
  return { start, end };
}

export type PoolInput = {
  /** family_sitters.status: 'active' once she signed the notice. */
  linkStatus: string;
  /** Her weekly hours (all weekdays she set; empty = none set). */
  hours: Pick<WeekHours, 'weekday' | 'starts' | 'ends'>[];
  /** Her days off, both ends included. */
  timeOff: DateRange[];
  /** This family's shifts with her. */
  shifts: Pick<Shift, 'status' | 'starts_at' | 'ends_at'>[];
};

/** Where one sitter stands for a window. `onShiftNow` (P54) puts a sitter with an active shift first as "On shift". */
export function poolStatus(p: PoolInput, w: TimeWindow, opts: { onShiftNow?: boolean } = {}): PoolStatus {
  if (p.linkStatus !== 'active') return { state: 'needs_sign' };
  const live = p.shifts.filter((s) => s.status === 'scheduled' || s.status === 'active');
  if (opts.onShiftNow && live.some((s) => s.status === 'active')) return { state: 'on_shift' };
  const days = [dayKey(w.start), dayKey(new Date(+w.end - 1))];
  const away = p.timeOff.find((t) => days.some((k) => t.starts <= k && k <= t.ends));
  if (away) return { state: 'away', awayUntil: away.ends };
  if (live.some((s) => overlaps(+new Date(s.starts_at), +new Date(s.ends_at), +w.start, +w.end))) return { state: 'busy' };
  if (!p.hours.length) return { state: 'no_hours' };
  const h = hoursOn(w, p.hours);
  if (!h || !overlaps(+h.start, +h.end, +w.start, +w.end)) return { state: 'off' };
  if (+h.start <= +w.start && +h.end >= +w.end) return { state: 'free' };
  return { state: 'partly', freeFrom: new Date(Math.max(+h.start, +w.start)), freeTo: new Date(Math.min(+h.end, +w.end)) };
}

/** P54 avatar dot. */
export type DotKind = 'ok' | 'free' | 'grey' | 'warn';

/** P54: the line under a pool avatar and its dot, for today's window ("Free today"; just "Free" once it runs past
 * midnight). */
export function tabLabel(s: PoolStatus, w: TimeWindow, now = new Date()): { label: string; dot: DotKind } {
  switch (s.state) {
    case 'needs_sign':
      return { label: 'Needs to sign', dot: 'warn' };
    case 'on_shift':
      return { label: 'On shift', dot: 'ok' };
    case 'free':
      return { label: sameDay(w.start, now) ? 'Free today' : 'Free', dot: 'free' };
    case 'partly':
      return { label: partPill(s, w), dot: 'free' };
    case 'busy':
      return { label: 'Busy', dot: 'grey' };
    case 'away':
      return { label: 'Away', dot: 'grey' };
    case 'off':
      return { label: 'Not free', dot: 'grey' };
    default:
      return { label: 'No hours', dot: 'grey' };
  }
}

/** Partly free pill: "Until 9 PM", "From 7 PM", or "7 – 9 PM". */
function partPill(s: PoolStatus, w: TimeWindow): string {
  const from = +s.freeFrom! > +w.start;
  const to = +s.freeTo! < +w.end;
  if (from && to) return `${shortTimeText(s.freeFrom!).replace(/ [AP]M$/, '')} – ${shortTimeText(s.freeTo!)}`;
  return from ? `From ${shortTimeText(s.freeFrom!)}` : `Until ${shortTimeText(s.freeTo!)}`;
}

export type PoolGroup = 'free' | 'partly' | 'not_free';

/** P42 row: which group, the line under the name, and the pill. */
export function poolRow(s: PoolStatus, w: TimeWindow, shiftsDone: number, now = new Date()): { group: PoolGroup; sub: string; pill: string; pillKind: 'ok' | 'warn' | 'muted' } {
  const evening = isEvening(w);
  switch (s.state) {
    case 'free':
    case 'on_shift':
      return { group: 'free', sub: `${evening ? 'Free all evening' : 'Free the whole time'} · ${shiftsDone ? `${shiftsDone} ${shiftsDone === 1 ? 'shift' : 'shifts'}` : 'new to you'}`, pill: 'Free', pillKind: 'ok' };
    case 'partly': {
      const from = +s.freeFrom! > +w.start;
      const to = +s.freeTo! < +w.end;
      const sub = from && to ? `Free ${timeText(s.freeFrom!).slice(0, -3)} – ${timeText(s.freeTo!)}` : from ? `Free from ${timeText(s.freeFrom!)}` : `Free until ${timeText(s.freeTo!)}`;
      return { group: 'partly', sub, pill: partPill(s, w), pillKind: 'warn' };
    }
    case 'busy':
      return { group: 'not_free', sub: evening ? 'Booked that evening' : 'Booked then', pill: 'Busy', pillKind: 'muted' };
    case 'away': {
      const until = fromKey(s.awayUntil!);
      const sameYear = until.getFullYear() === now.getFullYear();
      const day = until.toLocaleDateString('en-US', { month: 'short', day: 'numeric', ...(sameYear ? {} : { year: 'numeric' }) });
      return { group: 'not_free', sub: s.awayUntil === dayKey(w.start) ? 'Away that day' : `Away until ${day}`, pill: 'Away', pillKind: 'muted' };
    }
    case 'off':
      return { group: 'not_free', sub: evening ? 'Not free that evening' : 'Not free then', pill: 'Off', pillKind: 'muted' };
    default:
      return { group: 'not_free', sub: 'Hasn’t set her hours yet', pill: 'No hours', pillKind: 'muted' };
  }
}

/** P42 primary button: "Book Maya" with one free sitter, "Book a free sitter" with several, else "Book a shift". */
export function bookLabel(freeNames: string[]): string {
  if (freeNames.length === 1) return `Book ${freeNames[0]}`;
  return freeNames.length > 1 ? 'Book a free sitter' : 'Book a shift';
}

/** P43 cell: Free (check), Part of it (½), Busy (dash: booked, no hours that day or none set), Away (hatched). */
export type CellKind = 'free' | 'part' | 'busy' | 'away';
export function cellKind(s: PoolStatus): CellKind {
  if (s.state === 'free' || s.state === 'on_shift') return 'free';
  if (s.state === 'partly') return 'part';
  return s.state === 'away' ? 'away' : 'busy';
}

/** P43 card line: "2 free · 1 until 9:00 PM · 2 not free" (one partly free sitter is spelled out, several are counted). */
export function daySummary(statuses: PoolStatus[], w: TimeWindow): string {
  const free = statuses.filter((s) => cellKind(s) === 'free').length;
  const part = statuses.filter((s) => s.state === 'partly');
  const notFree = statuses.length - free - part.length;
  const out: string[] = [];
  if (free) out.push(`${free} free`);
  if (part.length === 1) out.push(`1 ${poolRow(part[0], w, 0).sub.replace(/^Free /, '')}`);
  else if (part.length) out.push(`${part.length} partly free`);
  if (notFree) out.push(`${notFree} not free`);
  return out.join(' · ');
}

/** "Pick a time" sheet (P54d / P54f / P54g): the week shown moves by whole weeks and the month by whole months, never
 * before today. Returns the day to select. */
export function pickerMove(day: Date, unit: 'week' | 'month', n: number, now = new Date()): Date {
  let d: Date;
  if (unit === 'week') d = addDays(day, 7 * n);
  else {
    d = new Date(day.getFullYear(), day.getMonth() + n, 1);
    const last = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
    d.setDate(Math.min(day.getDate(), last));
  }
  return isPastDay(d, now) ? startOfDay(now) : d;
}

/** Can the sheet go back from this week / month? Not when today is in it. */
export function pickerCanGoBack(day: Date, unit: 'week' | 'month', now = new Date()): boolean {
  if (unit === 'week') return +weekOf(day)[0] > +weekOf(now)[0];
  return day.getFullYear() * 12 + day.getMonth() > now.getFullYear() * 12 + now.getMonth();
}
