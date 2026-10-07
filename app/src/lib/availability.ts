// Sitter availability and time off (wireframe S11, migration 12), plus the extra per-shift details the Day view
// (P6a / S6a) draws. Kept out of data.ts so it can grow on its own.
import { formatTime, minutesOf, parseTime } from './care-plan';
import type { DateRange } from './calendar-logic';
import { supabase } from './supabase';
import type { Task } from './types';

/** One weekday the sitter is available. weekday: 0 = Sunday ... 6 = Saturday (Date.getDay()). Times "HH:MM:SS". */
export type Availability = { sitter_id: string; weekday: number; starts: string; ends: string };

/** Whole days off, both ends included ("YYYY-MM-DD"). The note is only ever read by the sitter herself. */
export type TimeOff = DateRange & { id: string; sitter_id: string; note: string };

/** What parents get (family_sitter_time_off): who and which days, never the note. */
export type SitterAway = DateRange & { sitter_id: string };

/** S11 lists the week Monday first. */
export const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0];
export const WEEKDAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/** The editable S11 state for one weekday: times as "2:30 PM" text, as TimeWheel gives them. */
export type DayHours = { weekday: number; on: boolean; starts: string; ends: string };

/** S11 rows from saved availability; days without a row are off. An off day borrows the first saved hours, so
 * turning it on starts from something sensible. */
export function toDayHours(rows: Pick<Availability, 'weekday' | 'starts' | 'ends'>[]): DayHours[] {
  const first = rows[0];
  return WEEK_ORDER.map((weekday) => {
    const r = rows.find((x) => x.weekday === weekday);
    const src = r ?? first;
    return { weekday, on: !!r, starts: src ? formatTime(src.starts) : '3:00 PM', ends: src ? formatTime(src.ends) : '9:00 PM' };
  });
}

/** Rows to save for the days that are on; null when a day's hours aren't valid (end must come after start). */
export function fromDayHours(days: DayHours[], sitterId: string): Availability[] | null {
  const out: Availability[] = [];
  for (const d of days) {
    if (!d.on) continue;
    const a = parseTime(d.starts);
    const b = parseTime(d.ends);
    if (!a || !b || minutesOf(b) <= minutesOf(a)) return null;
    out.push({ sitter_id: sitterId, weekday: d.weekday, starts: a, ends: b });
  }
  return out;
}

const MERIDIEM = /\s?([AP]M)$/i;

/** "2:30 PM" + "10:00 PM" -> "2:30 – 10:00 PM"; "10:00 AM" + "11:00 PM" -> "10:00 AM – 11:00 PM" (S11). */
export function hoursLabel(starts: string, ends: string): string {
  const same = starts.match(MERIDIEM)?.[1]?.toUpperCase() === ends.match(MERIDIEM)?.[1]?.toUpperCase();
  return `${same ? starts.replace(MERIDIEM, '') : starts} – ${ends}`;
}

/** S39's line under "Availability and time off", e.g. "Weekdays after 2 PM". Empty when nothing is set. */
export function availabilitySummary(rows: Pick<Availability, 'weekday' | 'starts'>[]): string {
  if (!rows.length) return '';
  const days = new Set(rows.map((r) => r.weekday));
  const has = (list: number[]) => list.every((d) => days.has(d));
  const label =
    days.size === 7
      ? 'Every day'
      : days.size === 5 && has([1, 2, 3, 4, 5])
        ? 'Weekdays'
        : days.size === 2 && has([0, 6])
          ? 'Weekends'
          : WEEK_ORDER.filter((d) => days.has(d))
              .map((d) => WEEKDAY_SHORT[d])
              .join(', ');
  const starts = new Set(rows.map((r) => r.starts.slice(0, 5)));
  if (starts.size !== 1) return label;
  const at = formatTime(rows[0].starts).replace(':00', '');
  return `${label} after ${at}`;
}

/** Time off that hasn't ended yet, soonest first. */
export function upcomingTimeOff<T extends DateRange>(list: T[], todayKey: string): T[] {
  return list.filter((t) => t.ends >= todayKey).sort((a, b) => a.starts.localeCompare(b.starts));
}

function must<T>(r: { data: T | null; error: { message: string } | null }): T {
  if (r.error) throw new Error(r.error.message);
  return r.data as T;
}

export const availabilityApi = {
  async mine(sitterId: string) {
    return must(await supabase.from('sitter_availability').select('sitter_id, weekday, starts, ends').eq('sitter_id', sitterId).order('weekday')) as Availability[];
  },
  /** Replaces the sitter's week: the given days are saved, every other day is cleared. */
  async save(sitterId: string, rows: Availability[]) {
    if (rows.length) must(await supabase.from('sitter_availability').upsert(rows.map((r) => ({ ...r, updated_at: new Date().toISOString() })), { onConflict: 'sitter_id,weekday' }));
    const off = [0, 1, 2, 3, 4, 5, 6].filter((d) => !rows.some((r) => r.weekday === d));
    if (off.length) must(await supabase.from('sitter_availability').delete().eq('sitter_id', sitterId).in('weekday', off));
  },
  async myTimeOff(sitterId: string) {
    return must(await supabase.from('sitter_time_off').select('*').eq('sitter_id', sitterId).order('starts')) as TimeOff[];
  },
  async addTimeOff(sitterId: string, range: DateRange) {
    return must(await supabase.from('sitter_time_off').insert({ sitter_id: sitterId, starts: range.starts, ends: range.ends }).select().single()) as TimeOff;
  },
  /** Parents: weekly hours of the family's active sitters (P54 / P42 who is free; RLS sitter_availability_parent_read). */
  async hoursOf(sitterIds: string[]) {
    if (!sitterIds.length) return [] as Availability[];
    return must(await supabase.from('sitter_availability').select('sitter_id, weekday, starts, ends').in('sitter_id', sitterIds)) as Availability[];
  },
  /** Parents: days off of the family's active sitters (P6c "Maya away"). */
  async familyTimeOff(familyId: string) {
    return must(await supabase.rpc('family_sitter_time_off', { p_family: familyId })) as SitterAway[];
  },
};

/** Kids on each shift and the timed tasks, for the Day view blocks (P6a "Ava and Leo", "Pick up Ava"). */
export async function shiftDayDetails(shiftIds: string[]): Promise<{ kids: Record<string, string[]>; tasks: Record<string, Task[]> }> {
  if (!shiftIds.length) return { kids: {}, tasks: {} };
  const [kidRows, taskRows] = await Promise.all([
    supabase.from('shift_kids').select('shift_id, kid:kids(name)').in('shift_id', shiftIds),
    supabase.from('shift_tasks').select('*').in('shift_id', shiftIds).order('position'),
  ]);
  const kids: Record<string, string[]> = {};
  for (const r of (must(kidRows) ?? []) as unknown as { shift_id: string; kid: { name: string } | null }[]) {
    if (r.kid) (kids[r.shift_id] ??= []).push(r.kid.name);
  }
  const tasks: Record<string, Task[]> = {};
  for (const t of (must(taskRows) ?? []) as Task[]) (tasks[t.shift_id] ??= []).push(t);
  return { kids, tasks };
}

/** "Ava and Leo", "Ava, Leo and Mia". */
export function namesLabel(names: string[]): string {
  return names.length > 1 ? `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}` : (names[0] ?? '');
}
