// Pure rules shared by the screens. Mirrors the checks in the clock_in SQL function so the UI and the database agree.
import type { LocationPoint, LogEntry, Shift } from './types';

export const CLOCK_IN_OPENS_MIN = 15;

export type ClockInState =
  | { kind: 'too_early'; opensAt: Date }
  | { kind: 'open' }
  | { kind: 'ended' }
  | { kind: 'not_scheduled' };

export function clockInState(shift: Pick<Shift, 'status' | 'starts_at' | 'ends_at'>, now = new Date()): ClockInState {
  if (shift.status !== 'scheduled') return { kind: 'not_scheduled' };
  const opensAt = new Date(new Date(shift.starts_at).getTime() - CLOCK_IN_OPENS_MIN * 60_000);
  if (now < opensAt) return { kind: 'too_early', opensAt };
  if (now > new Date(shift.ends_at)) return { kind: 'ended' };
  return { kind: 'open' };
}

export type ParentHomeState =
  | { kind: 'live'; shift: Shift }
  | { kind: 'soon'; shift: Shift; minutes: number }
  /** P4n: its start time has passed and the sitter hasn't clocked in (still 'scheduled', not over yet). */
  | { kind: 'late'; shift: Shift; minutesLate: number }
  | { kind: 'ended'; shift: Shift }
  | { kind: 'idle'; next: Shift | null };

/** Which Home state the parent sees, top rule first (matches the P4 logic note). */
export function parentHomeState(shifts: Shift[], now = new Date()): ParentHomeState {
  const live = shifts.find((s) => s.status === 'active');
  if (live) return { kind: 'live', shift: live };

  const upcoming = shifts
    .filter((s) => s.status === 'scheduled' && new Date(s.ends_at) > now)
    .sort((a, b) => +new Date(a.starts_at) - +new Date(b.starts_at));
  const next = upcoming[0] ?? null;
  if (next) {
    // Past the start with no clock-in: "late" until the shift's end, then it's no longer next.
    if (+now > +new Date(next.starts_at)) return { kind: 'late', shift: next, minutesLate: Math.max(1, Math.floor((+now - +new Date(next.starts_at)) / 60_000)) };
    const minutes = Math.round((+new Date(next.starts_at) - +now) / 60_000);
    if (minutes <= 60) return { kind: 'soon', shift: next, minutes: Math.max(0, minutes) };
  }

  const recentlyEnded = shifts
    .filter((s) => s.status === 'completed' && s.clock_out_at && +now - +new Date(s.clock_out_at) < 12 * 3600_000)
    .sort((a, b) => +new Date(b.clock_out_at!) - +new Date(a.clock_out_at!))[0];
  if (recentlyEnded) return { kind: 'ended', shift: recentlyEnded };

  return { kind: 'idle', next };
}

/** "45 min", "1 h", "1 h 36 min" (same words as lib/shift-timing-logic minutesLabel). */
function minutesWords(min: number): string {
  const m = Math.max(0, Math.round(min));
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  return m % 60 ? `${h} h ${m % 60} min` : `${h} h`;
}

/** Slack after her own "running late" estimate before Home stops trusting it. */
export const LATE_NOTICE_GRACE_MIN = 5;

/**
 * P4n's card words. `span` is the shift's "3:00 – 7:00 PM".
 * - No notice: "Maya hasn't clocked in" / "1 h 36 min late · 3:00 – 7:00 PM".
 * - She sent "running late" (S21) and is still inside it (+5 min): "Maya is running 15 min late" / "Traffic on I-275 · 3:00 – 7:00 PM".
 * - Her estimate has passed: back to "hasn't clocked in", with her notice as a quiet line ("Said 15 min late · Traffic on I-275").
 */
export function lateHomeCard(sitter: string, minutesLate: number, span: string, notice?: { late_minutes?: number | null; late_note?: string | null }): { title: string; sub: string; said?: string } {
  const told = notice?.late_minutes ? notice.late_minutes : 0;
  const note = notice?.late_note?.trim() || '';
  if (told && minutesLate <= told + LATE_NOTICE_GRACE_MIN) {
    return { title: `${sitter} is running ${told} min late`, sub: [note, span].filter(Boolean).join(' · ') };
  }
  return {
    title: `${sitter} hasn’t clocked in`,
    sub: `${minutesWords(minutesLate)} late · ${span}`,
    ...(told ? { said: [`Said ${told} min late`, note].filter(Boolean).join(' · ') } : {}),
  };
}

export function workedMinutes(shift: Pick<Shift, 'clock_in_at' | 'clock_out_at'>, now = new Date()): number {
  if (!shift.clock_in_at) return 0;
  const end = shift.clock_out_at ? new Date(shift.clock_out_at) : now;
  return Math.max(0, Math.round((+end - +new Date(shift.clock_in_at)) / 60_000));
}

export function formatDuration(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h === 0) return `${m} min`;
  return `${h} h ${m.toString().padStart(2, '0')} m`;
}

export function formatClock(min: number, seconds = 0): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

/** Straight-line distance in meters (haversine). */
export function distanceM(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const s = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

export function routeLengthM(points: Pick<LocationPoint, 'lat' | 'lng'>[]): number {
  let total = 0;
  for (let i = 1; i < points.length; i++) total += distanceM(points[i - 1], points[i]);
  return total;
}

/** What the sitter picked on S48 (stored as wet / dirty / both / dry so older logs read the same). */
export const DIAPER_LABELS: Record<string, string> = { wet: '#1', dirty: '#2', both: 'Both', dry: 'Dry' };

export function diaperLabel(v: string | undefined): string {
  return v ? (DIAPER_LABELS[v] ?? v) : '';
}

/** One line for a log entry, used in the timeline and the report. */
export function describeLog(log: Pick<LogEntry, 'kind' | 'data'>): { title: string; detail: string } {
  const d = log.data ?? {};
  switch (log.kind) {
    case 'food':
      return { title: cap(d.meal || 'Food'), detail: [d.what, d.amount && `ate ${d.amount}`].filter(Boolean).join(' · ') };
    case 'nap':
      return { title: d.ended_at ? 'Nap' : 'Nap started', detail: [d.started_at && d.ended_at ? `${d.started_at} – ${d.ended_at}` : d.started_at, d.how].filter(Boolean).join(' · ') };
    case 'activity':
      return { title: cap(d.what || 'Activity'), detail: [d.duration, d.note].filter(Boolean).join(' · ') };
    case 'diaper':
      return { title: d.potty ? `Potty: ${d.potty}` : 'Diaper', detail: [diaperLabel(d.diaper), d.note].filter(Boolean).join(' · ') };
    case 'photo':
      return { title: 'Photo update', detail: d.caption ?? '' };
    case 'incident':
      // S24 (migration 15 sends the same words): "Incident: Fall or bump", "Backyard · Scraped his knee…"
      return { title: `Incident: ${d.type || 'Other'}`, detail: [d.where, d.text].filter(Boolean).join(' · ') };
    case 'note':
    default:
      return { title: cap(d.category || 'Note'), detail: d.text ?? '' };
  }
}

function cap(s: string) {
  return s ? s[0].toUpperCase() + s.slice(1) : s;
}

/** Parse "3:45 PM" / "15:45" on a given day. Returns null when the text isn't a time. */
export function parseTimeOnDay(text: string, day: Date): Date | null {
  const m = text.trim().match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/i);
  if (!m) return null;
  let h = Number(m[1]);
  const min = Number(m[2] ?? 0);
  const ap = m[3]?.toLowerCase();
  if (min > 59 || h > 23 || (ap && (h < 1 || h > 12))) return null;
  if (ap === 'pm' && h !== 12) h += 12;
  if (ap === 'am' && h === 12) h = 0;
  const d = new Date(day);
  d.setHours(h, min, 0, 0);
  return d;
}

/** P5e: may this shift's tasks still change? Upcoming (scheduled, not over) or live. Mirrors editable_shift (migration 34). */
export function canEditShiftTasks(shift: Pick<Shift, 'status' | 'ends_at'>, now = new Date()): boolean {
  return shift.status === 'active' || (shift.status === 'scheduled' && +new Date(shift.ends_at) > +now);
}

/** P5e time wheel text ("4:30 PM", '' = no time) → the task's due_at on the shift's day. A time before the start on a
 * shift that runs past midnight is the next morning. Outside the shift: an error (the database checks it too). */
export function taskDueOnShift(text: string, shift: Pick<Shift, 'starts_at' | 'ends_at'>): { ok: true; due: string | null } | { ok: false; error: string } {
  if (!text.trim()) return { ok: true, due: null };
  const start = new Date(shift.starts_at);
  const end = new Date(shift.ends_at);
  let d = parseTimeOnDay(text, start);
  if (!d) return { ok: false, error: 'Pick a time.' };
  const slack = 60_000;
  if (+d < +start - slack) d = new Date(+d + 24 * 3600_000);
  if (+d < +start - slack || +d > +end + slack) return { ok: false, error: 'Pick a time during the shift.' };
  return { ok: true, due: d.toISOString() };
}
