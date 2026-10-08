// The sitter's shift page before clock-in (wireframes S4b "Before the shift", S4c too early) and the Home cards that
// open it (S3 / S3b). Pure functions, unit-tested in __tests__/shift-page-logic.test.ts.
// Clock in lives only on the shift page; Home shows the shift for information and opens the page.
import { clockAmPm } from './shift-timing-logic';
import { clockInState } from './shift-logic';
import type { Shift } from './types';

const MERIDIEM = /\s?([AP]M)$/i;
const SHORT_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function dayStart(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

/** Whole days from `now`'s day to `d`'s day (0 = same day, 1 = tomorrow, -1 = yesterday). */
export function daysBetween(now: Date, d: Date): number {
  return Math.round((+dayStart(d) - +dayStart(now)) / 864e5);
}

/** "3:00 PM" -> "3 PM" unless `zeros`. */
function clockText(d: Date, zeros: boolean) {
  const t = clockAmPm(d);
  return zeros ? t : t.replace(':00', '');
}

/** "3:00 – 7:00 PM" (zeros, S3's Today card and S4b) or "7:30 – 10 PM"; the shared AM/PM is written once. */
export function spanLabel(start: string | Date, end: string | Date, zeros = false): string {
  const a = clockText(new Date(start), zeros);
  const b = clockText(new Date(end), zeros);
  const same = a.match(MERIDIEM)?.[1] === b.match(MERIDIEM)?.[1];
  return `${same ? a.replace(MERIDIEM, '') : a} – ${b}`;
}

/** "Sat" within the coming week, "10/17" (MM/DD) further out. */
function dayWord(d: Date, now: Date): string {
  const n = daysBetween(now, d);
  return n >= 0 && n < 7 ? SHORT_DAYS[d.getDay()] : `${d.getMonth() + 1}/${d.getDate()}`;
}

/** S4b / S4c header eyebrow: "Today", "Tomorrow", "Sat", "10/17". */
export function shiftDayLabel(startsAt: string | Date, now = new Date()): string {
  const d = new Date(startsAt);
  const n = daysBetween(now, d);
  if (n === 0) return 'Today';
  if (n === 1) return 'Tomorrow';
  return dayWord(d, now);
}

/** S4c footer line under the disabled Clock in: "Clock in opens at 2:45 PM" (today) or "Clock in opens on Sat at
 * 9:45 AM" (another day). */
export function clockInOpensLabel(opensAt: Date, now = new Date()): string {
  const at = clockAmPm(opensAt);
  return daysBetween(now, opensAt) === 0 ? `Clock in opens at ${at}` : `Clock in opens on ${dayWord(opensAt, now)} at ${at}`;
}

export type ClockInButton =
  | { kind: 'open' } // S4b: Clock in works
  | { kind: 'too_early'; line: string } // S4c: disabled, "Clock in opens at 2:45 PM"
  | { kind: 'ended'; line: string } // the window closed without a clock-in
  | { kind: 'none' }; // not a scheduled shift (active, completed, cancelled)

/** What S4b's footer button does right now. */
export function clockInButton(shift: Pick<Shift, 'status' | 'starts_at' | 'ends_at'>, now = new Date()): ClockInButton {
  const ci = clockInState(shift, now);
  if (ci.kind === 'open') return { kind: 'open' };
  if (ci.kind === 'too_early') return { kind: 'too_early', line: clockInOpensLabel(ci.opensAt, now) };
  if (ci.kind === 'ended') return { kind: 'ended', line: 'This shift’s time has passed.' };
  return { kind: 'none' };
}

/** The first step after tapping Clock in (S4b), in the same order as before on Home: house rules that changed come
 * first (S42), then the home zone (S22 when she's away), then the clock-in itself. */
export type ClockInStep = 'rules' | 'away' | 'clock_in';
export function clockInStep(opts: { rulesDue: boolean; away: boolean }): ClockInStep {
  if (opts.rulesDue) return 'rules';
  if (opts.away) return 'away';
  return 'clock_in';
}

/** "Running late?" (S21) shows on S4b until the shift's time has passed; not once she's clocked in. */
export function canReportLate(shift: Pick<Shift, 'status' | 'starts_at' | 'ends_at'>, now = new Date()): boolean {
  const ci = clockInState(shift, now);
  return ci.kind === 'open' || ci.kind === 'too_early';
}
