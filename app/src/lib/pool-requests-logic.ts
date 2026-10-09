// Ask your pool: a parent asks several sitters at once (wireframes P45 Ask, P46 Request out, P47 Booked; sitter S33
// Shift request, S34 Filled, S20 overlaps her time off). Pure functions, unit-tested. Data and calls: ./pool-requests.ts.
import { addDays, dayKey, fromKey, startOfDay, type DateRange } from './calendar-logic';
import { ageInMonths } from './kid-profile';
import { isEvening, poolRow, timeText, type PoolStatus, type TimeWindow } from './pool-logic';

export type RequestStatus = 'open' | 'filled' | 'cancelled' | 'expired';
export type AskedStatus = 'sent' | 'seen' | 'accepted' | 'offered' | 'declined' | 'passed' | 'filled';

export type ShiftRequest = {
  id: string;
  family_id: string;
  created_by: string;
  starts_at: string;
  ends_at: string;
  kid_ids: string[];
  place_id: string | null;
  note: string;
  first_to_accept: boolean;
  expires_at: string;
  status: RequestStatus;
  shift_id: string | null;
  filled_by: string | null;
  created_at: string;
  /** Migration 35: the dates of one repeating booking share it (null = one date). */
  series_id?: string | null;
  /** Migration 35: the task lines the shift gets when it's booked. */
  tasks?: string[];
  /** Migration 35: 'booking' = the booking drawer asking one sitter; 'pool' = Ask your pool. */
  kind?: 'pool' | 'booking';
};

export type AskedSitter = {
  request_id: string;
  sitter_id: string;
  status: AskedStatus;
  seen_at: string | null;
  answered_at: string | null;
  offer_starts_at: string | null;
  offer_ends_at: string | null;
  created_at: string;
};

/** P45 "Request expires in". */
export const EXPIRY_HOURS = [2, 12, 24] as const;
export type ExpiryHours = (typeof EXPIRY_HOURS)[number];

/** Expiry is lazy in the database: an open request past expires_at is expired. */
export function effectiveStatus(r: Pick<ShiftRequest, 'status' | 'expires_at'>, now = new Date()): RequestStatus {
  return r.status === 'open' && +new Date(r.expires_at) <= +now ? 'expired' : r.status;
}

export const requestWindow = (r: Pick<ShiftRequest, 'starts_at' | 'ends_at'>): TimeWindow => ({ start: new Date(r.starts_at), end: new Date(r.ends_at) });

/** P46 "11 h 52 m left"; `short` (S33 pill) "11 h left"; under an hour "45 m left". */
export function timeLeft(expiresAt: string | Date, now = new Date(), short = false): string {
  const ms = +new Date(expiresAt) - +now;
  if (ms <= 0) return 'Expired';
  const min = Math.max(1, Math.floor(ms / 60_000));
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (!h) return `${m} m left`;
  return short || !m ? `${h} h left` : `${h} h ${m} m left`;
}

/** P46 bar: the share of the request's time that has gone by (0 – 1). */
export function elapsedShare(createdAt: string, expiresAt: string, now = new Date()): number {
  const a = +new Date(createdAt);
  const b = +new Date(expiresAt);
  if (b <= a) return 1;
  return Math.min(1, Math.max(0, (+now - a) / (b - a)));
}

/** P42 / P44 main button: "Ask Maya", "Ask both free sitters", "Ask 3 free sitters"; null with nobody free. */
export function askLabel(freeNames: string[]): string | null {
  if (!freeNames.length) return null;
  if (freeNames.length === 1) return `Ask ${freeNames[0]}`;
  return freeNames.length === 2 ? 'Ask both free sitters' : `Ask ${freeNames.length} free sitters`;
}

/** P45: who can be asked. Free and partly free sitters are listed (free ones ticked), the rest are hidden. */
export function askable(s: PoolStatus): 'free' | 'partly' | null {
  if (s.state === 'free' || s.state === 'on_shift') return 'free';
  return s.state === 'partly' ? 'partly' : null;
}

/** P45 row line: "Free all evening" / "Free the whole time" / "Only free until 9:00 PM". */
export function askRowSub(s: PoolStatus, w: TimeWindow): string {
  if (askable(s) === 'free') return isEvening(w) ? 'Free all evening' : 'Free the whole time';
  return `Only ${poolRow(s, w, 0).sub.replace(/^Free/, 'free')}`;
}

/** P45 "2 sitters who aren't free are hidden." */
export function hiddenNote(n: number): string {
  if (!n) return '';
  return n === 1 ? '1 sitter who isn’t free is hidden.' : `${n} sitters who aren’t free are hidden.`;
}

/** P45 button: "Send to 2 sitters". */
export const sendLabel = (n: number) => `Send to ${n} ${n === 1 ? 'sitter' : 'sitters'}`;

/** "2 min ago" for P46 "Seen 2 min ago". */
export function ago(iso: string, now = new Date()): string {
  const min = Math.floor((+now - +new Date(iso)) / 60_000);
  if (min < 1) return 'just now';
  if (min < 60) return `${min} min ago`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h} h ago`;
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/** "6:00 – 7:00 PM" (AM/PM once when both ends share it). */
export function spanText(a: Date, b: Date): string {
  const x = timeText(a);
  const y = timeText(b);
  return `${x.slice(-2) === y.slice(-2) ? x.slice(0, -3) : x} – ${y}`;
}

/** Home rows (P4b "Sat 6–7 PM request"): "Sat 6–10 PM request". */
export function requestRowTitle(w: TimeWindow): string {
  const day = w.start.toLocaleDateString('en-US', { weekday: 'short' });
  const short = (d: Date) => timeText(d).replace(':00', '');
  const a = short(w.start);
  const b = short(w.end);
  return `${day} ${a.slice(-2) === b.slice(-2) ? a.slice(0, -3) : a}–${b} request`;
}

/** Sitter Home row (S3 "Lee family asks for Sat 6 – 10 PM"). */
export function sitterRowTitle(familyName: string, w: TimeWindow): string {
  const day = w.start.toLocaleDateString('en-US', { weekday: 'short' });
  const short = (d: Date) => timeText(d).replace(':00', '');
  const a = short(w.start);
  const b = short(w.end);
  return `${familyName.replace(/^The /, '')} asks for ${day} ${a.slice(-2) === b.slice(-2) ? a.slice(0, -3) : a} – ${b}`;
}

/** Sitter Home row line (S3 "Overlaps your time off · answer by Fri"): how it fits her calendar and the time left. */
export function sitterRowSub(fit: CalendarFit, left: string): string {
  const how = fit.kind === 'time_off' ? 'Overlaps your time off' : fit.kind === 'shift' ? 'You’re already booked then' : 'Fits your calendar';
  return `${how} · ${left}`;
}

export type PillKind = 'muted' | 'primary' | 'ok' | 'warn';

/** P46 row: the line under the name and the pill. */
export function askedRow(a: AskedSitter, now = new Date()): { sub: string; pill: string; kind: PillKind } {
  switch (a.status) {
    case 'seen':
      return { sub: `Seen ${ago(a.seen_at ?? a.created_at, now)}`, pill: 'Seen', kind: 'primary' };
    case 'accepted':
      return { sub: 'Can take the whole shift', pill: 'Said yes', kind: 'ok' };
    case 'offered':
      return { sub: `Can do ${spanText(new Date(a.offer_starts_at!), new Date(a.offer_ends_at!))} only`, pill: 'Offer', kind: 'warn' };
    case 'declined':
      return { sub: 'Can’t make it', pill: 'Declined', kind: 'muted' };
    case 'passed':
      return { sub: 'You passed on her offer', pill: 'Passed', kind: 'muted' };
    case 'filled':
      return { sub: 'Told it’s filled', pill: 'Filled', kind: 'muted' };
    default:
      return { sub: `Delivered ${timeText(new Date(a.created_at))}`, pill: 'Sent', kind: 'muted' };
  }
}

const waiting = (a: AskedSitter) => a.status === 'sent' || a.status === 'seen';

/** P46 status card: "Waiting on 2 sitters" + "First to accept gets it · 11 h 52 m left". */
export function waitingCard(r: Pick<ShiftRequest, 'first_to_accept' | 'expires_at'>, asked: AskedSitter[], now = new Date()): { title: string; sub: string } {
  const n = asked.filter(waiting).length;
  const left = timeLeft(r.expires_at, now);
  const rule = r.first_to_accept ? 'First to accept gets it' : 'You pick who gets it';
  if (!n) return { title: 'No one is left to answer', sub: `Ask more sitters · ${left}` };
  return { title: `Waiting on ${n} ${n === 1 ? 'sitter' : 'sitters'}`, sub: `${rule} · ${left}` };
}

/** Parent Home row line (P4b "Waiting for Maya to answer"). */
export function parentRowSub(asked: (AskedSitter & { name: string })[]): string {
  const offer = asked.find((a) => a.status === 'offered');
  const yes = asked.find((a) => a.status === 'accepted');
  if (yes) return `${yes.name} can take it`;
  if (offer) return `${offer.name} offered ${spanText(new Date(offer.offer_starts_at!), new Date(offer.offer_ends_at!)).replace(/:00/g, '')}`;
  const w = asked.filter(waiting);
  if (w.length === 1) return `Waiting for ${w[0].name} to answer`;
  return w.length ? `Waiting on ${w.length} sitters` : 'No one could make it';
}

/** "4 hrs", "1 hr", "4.5 hrs". */
export function hoursText(w: TimeWindow): string {
  const h = Math.round(((+w.end - +w.start) / 3_600_000) * 4) / 4;
  return `${h} ${h === 1 ? 'hr' : 'hrs'}`;
}

/** S33 kids line part: "Ava, 7" (under two: "Mia, 18 mo"). */
export function kidAge(name: string, birthdate: string | null, today = new Date()): string {
  if (!birthdate) return name;
  const m = ageInMonths(birthdate, today);
  return `${name}, ${m < 24 ? `${m} mo` : Math.floor(m / 12)}`;
}

/** Whole days off as a time window: the first day's midnight to the midnight after the last day. */
const offWindow = (t: DateRange): TimeWindow => ({ start: startOfDay(fromKey(t.starts)), end: addDays(startOfDay(fromKey(t.ends)), 1) });

/** Window minus busy parts, in order. */
function subtract(w: TimeWindow, busy: TimeWindow[]): TimeWindow[] {
  let free: TimeWindow[] = [w];
  for (const b of busy) {
    free = free.flatMap((f) => {
      if (+b.end <= +f.start || +b.start >= +f.end) return [f];
      const out: TimeWindow[] = [];
      if (+b.start > +f.start) out.push({ start: f.start, end: b.start });
      if (+b.end < +f.end) out.push({ start: b.end, end: f.end });
      return out;
    });
  }
  return free;
}

export type CalendarFit =
  | { kind: 'fits' }
  | { kind: 'time_off'; off: TimeWindow; offer: TimeWindow | null; clear: { from: string; to: string } }
  | { kind: 'shift'; shift: { family_id: string; starts_at: string; ends_at: string } };

/** S33 "Fits your calendar" or why not. Her time off (whole days) comes first: S20 lets her offer the free part
 * (the longest stretch she isn't off, the first one on a tie) or give up those days. A shift she already has then
 * shows on S33 as "You’re already booked then" (Accept greyed out; migration 27 refuses double booking). */
export function calendarFit(w: TimeWindow, timeOff: DateRange[], shifts: { family_id: string; status: string; starts_at: string; ends_at: string }[]): CalendarFit {
  const offs = timeOff.map(offWindow).filter((o) => +o.start < +w.end && +o.end > +w.start);
  if (offs.length) {
    const start = new Date(Math.max(+w.start, Math.min(...offs.map((o) => +o.start))));
    const end = new Date(Math.min(+w.end, Math.max(...offs.map((o) => +o.end))));
    const free = subtract(w, offs).filter((f) => +f.end - +f.start >= 30 * 60_000);
    const offer = free.reduce<TimeWindow | null>((best, f) => (!best || +f.end - +f.start > +best.end - +best.start ? f : best), null);
    return { kind: 'time_off', off: { start, end }, offer, clear: { from: dayKey(start), to: dayKey(new Date(+end - 1)) } };
  }
  const clash = shifts.find((s) => (s.status === 'scheduled' || s.status === 'active') && +new Date(s.starts_at) < +w.end && +new Date(s.ends_at) > +w.start);
  return clash ? { kind: 'shift', shift: clash } : { kind: 'fits' };
}

/** S33 line next to "Fits your calendar": "Nothing else that evening" / "Nothing else that day". */
export const fitsSub = (w: TimeWindow) => (isEvening(w) ? 'Nothing else that evening' : 'Nothing else that day');

/** S20 bar: the window split into free / off parts, each with its share of the width and its label
 * ("6", "You're off 7–10", "11"). */
export function overlapBar(w: TimeWindow, off: TimeWindow): { kind: 'free' | 'off'; grow: number; label: string }[] {
  const hour = (d: Date) => timeText(d).replace(':00', '').slice(0, -3);
  const parts: { kind: 'free' | 'off'; grow: number; label: string }[] = [];
  const len = (a: Date, b: Date) => (+b - +a) / 3_600_000;
  if (+off.start > +w.start) parts.push({ kind: 'free', grow: len(w.start, off.start), label: hour(w.start) });
  parts.push({ kind: 'off', grow: len(off.start, off.end), label: `You’re off ${hour(off.start)}–${hour(off.end)}` });
  if (+off.end < +w.end) parts.push({ kind: 'free', grow: len(off.end, w.end), label: hour(off.end) });
  return parts;
}

/** P47 "Maya was told the shift is filled. Nothing for her to do." (several: "Maya and Jo were told … them"). */
export function toldNote(names: string[]): string {
  if (!names.length) return '';
  const who = names.length > 1 ? `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}` : names[0];
  return `${who} ${names.length > 1 ? 'were' : 'was'} told the shift is filled. Nothing for ${names.length > 1 ? 'them' : 'her'} to do.`;
}

/** P47 line under the sitter: "First shift with your family" / "3rd shift with your family". */
export function shiftNumberText(n: number): string {
  if (n <= 1) return 'First shift with your family';
  const suffix = n % 100 >= 11 && n % 100 <= 13 ? 'th' : (['th', 'st', 'nd', 'rd'][n % 10] ?? 'th');
  return `${n}${suffix} shift with your family`;
}

