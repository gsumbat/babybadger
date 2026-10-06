// Pure rules for incidents (S24) and the parents' Alerts feed (P9). No React, no Supabase: unit-tested.
import { timeOf } from './format';
import { describeLog, parseTimeOnDay } from './shift-logic';
import type { Kid, LogEntry, Shift } from './types';

/** S24 "What kind" chips, in the wireframe's order. Stored as data.type on the log. */
export const INCIDENT_TYPES = ['Fall or bump', 'Fever or sick', 'Allergic reaction', 'Behavior', 'Other'] as const;
export type IncidentType = (typeof INCIDENT_TYPES)[number];

export type IncidentDraft = { kidIds: string[]; type: IncidentType | ''; when: string; where: string; text: string };

/** Send is enabled once a kid, a kind and what happened are filled in (When defaults to now, Where is optional). */
export function incidentReady(d: IncidentDraft): boolean {
  return d.kidIds.length > 0 && !!d.type && d.text.trim().length > 0;
}

/** The log's data column: {type, where, text}, empty values left out. */
export function incidentData(d: IncidentDraft): Record<string, string> {
  const out: Record<string, string> = {};
  if (d.type) out.type = d.type;
  if (d.where.trim()) out.where = d.where.trim();
  if (d.text.trim()) out.text = d.text.trim();
  return out;
}

/** "4:38 PM" picked on the wheel → when it happened. A time later than now means last night (overnight shifts);
 * unreadable or empty → now. */
export function incidentTime(when: string, now = new Date()): Date {
  const t = parseTimeOnDay(when, now);
  if (!t) return now;
  if (+t > +now + 60_000) t.setDate(t.getDate() - 1);
  return t;
}

/** Which shift Alerts shows: the live one, else the latest shift that started today. */
export function alertShift(shifts: Shift[], now = new Date()): Shift | null {
  const live = shifts.find((s) => s.status === 'active');
  if (live) return live;
  const today = now.toDateString();
  return (
    shifts
      .filter((s) => s.clock_in_at && new Date(s.clock_in_at).toDateString() === today)
      .sort((a, b) => b.clock_in_at!.localeCompare(a.clock_in_at!))[0] ?? null
  );
}

const names = (ids: string[], kids: Kid[]) =>
  ids
    .map((id) => kids.find((k) => k.id === id)?.name)
    .filter(Boolean)
    .join(' and ');

/** P9 top red card for an incident: "Injury · Leo" (a fall or bump), otherwise the kind ("Fever or sick · Leo"). */
export type IncidentCard = { id: string; shiftId: string; title: string; body: string; time: string };

export function incidentCard(log: LogEntry, kids: Kid[]): IncidentCard {
  const type = log.data?.type || 'Other';
  const head = type === 'Fall or bump' ? 'Injury' : type;
  const who = names(log.kid_ids, kids);
  return {
    id: log.id,
    shiftId: log.shift_id,
    title: who ? `${head} · ${who}` : head,
    body: log.data?.text || describeLog(log).detail || type,
    time: timeOf(log.happened_at),
  };
}

/** P9 "EARLIER TODAY" row. icon picks the wireframe's circle: clock (clock-in/out), food (fork), late, a log kind, or
 * a trip / zone alert (migration 17): arrived (green pin), trip (car), away (pin, clock-in away), offplan. */
export type AlertRow = { id: string; at: string; icon: 'clock' | 'late' | 'food' | 'arrived' | 'trip' | 'away' | 'offplan' | LogEntry['kind']; title: string; sub: string };

/** Late notice columns (migration 14). Read defensively: before that migration runs they don't exist. */
type MaybeLate = Partial<{ late_minutes: number | null; late_note: string | null; late_at: string | null }>;

function pronoun(ids: string[], kids: Kid[]) {
  if (ids.length !== 1) return 'their';
  const g = kids.find((k) => k.id === ids[0])?.gender;
  return g === 'girl' ? 'her' : g === 'boy' ? 'his' : 'their';
}

/** One row for a log: food reads like the wireframe ("Ava ate all of her snack" / "Apple slices, crackers · 3:34 PM"),
 * other kinds use the same words as the timeline and the push ("Leo · Nap" / "3:45 PM – 5:10 PM · 5:12 PM"). */
export function logRow(log: LogEntry, kids: Kid[]): AlertRow {
  const who = names(log.kid_ids, kids);
  const time = timeOf(log.happened_at);
  const d = log.data ?? {};
  if (log.kind === 'food' && who && d.amount) {
    const meal = (d.meal || 'food').toLowerCase();
    return { id: log.id, at: log.happened_at, icon: 'food', title: `${who} ate ${d.amount} of ${pronoun(log.kid_ids, kids)} ${meal}`, sub: [d.what, time].filter(Boolean).join(' · ') };
  }
  const desc = describeLog(log);
  return {
    id: log.id,
    at: log.happened_at,
    icon: log.kind === 'food' ? 'food' : log.kind,
    title: who ? `${who} · ${desc.title}` : desc.title,
    sub: [desc.detail, time].filter(Boolean).join(' · '),
  };
}

/** Everything for P9: incidents as red cards (newest first), the rest as rows (newest first). */
export function buildAlerts(shift: Shift, logs: LogEntry[], kids: Kid[], sitter: string): { incidents: IncidentCard[]; rows: AlertRow[] } {
  const incidents = logs
    .filter((l) => l.kind === 'incident')
    .sort((a, b) => b.happened_at.localeCompare(a.happened_at))
    .map((l) => incidentCard(l, kids));
  const rows: AlertRow[] = logs.filter((l) => l.kind !== 'incident').map((l) => logRow(l, kids));
  const late = shift as Shift & MaybeLate;
  if (late.late_at) {
    rows.push({
      id: `late-${shift.id}`,
      at: late.late_at,
      icon: 'late',
      title: `${sitter} is running late`,
      sub: [late.late_minutes ? `${late.late_minutes} min` : '', late.late_note ?? '', timeOf(late.late_at)].filter(Boolean).join(' · '),
    });
  }
  if (shift.clock_in_at) rows.push({ id: `in-${shift.id}`, at: shift.clock_in_at, icon: 'clock', title: `${sitter} clocked in`, sub: timeOf(shift.clock_in_at) });
  if (shift.clock_out_at) rows.push({ id: `out-${shift.id}`, at: shift.clock_out_at, icon: 'clock', title: `${sitter} clocked out`, sub: timeOf(shift.clock_out_at) });
  rows.sort((a, b) => b.at.localeCompare(a.at));
  return { incidents, rows };
}
