// Pure rules for the parent's shift log (wireframe P77) and the sitter's photo-request strip (S4b).
import { catalogueRule, joinNames, type HouseRule, type ShiftRuleRow } from './house-rules-logic';
import { describeLog, parseTimeOnDay } from './shift-logic';
import type { Kid, LogEntry, LogKind, Task } from './types';

export type LogFilter = 'all' | 'food' | 'sleep' | 'activities' | 'photos';
/** P77 filter chips, in order. */
export const LOG_FILTERS: { value: LogFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'food', label: 'Food' },
  { value: 'sleep', label: 'Sleep' },
  { value: 'activities', label: 'Activities' },
  { value: 'photos', label: 'Photos' },
];
const FILTER_KIND: Record<Exclude<LogFilter, 'all'>, LogKind> = { food: 'food', sleep: 'nap', activities: 'activity', photos: 'photo' };

/** One P77 timeline row. A nap with a start and an end becomes two rows ("Nap started", "Nap ended"); done tasks
 * ("Picked up Ava") show under All only. */
export type LogRow = {
  key: string;
  kind: LogKind | 'task';
  /** The log behind the row (null for a task). */
  logId: string | null;
  title: string;
  detail: string;
  /** Kid tag: "Leo", "Ava, Leo", "Both" (both of two), "All" (all of 3+); '' for none ("Everyone" with a kid selected). */
  kid: string;
  at: string;
  photoPath: string | null;
  urgent: boolean;
};

export function kidTag(ids: string[], kids: Pick<Kid, 'id' | 'name'>[]): string {
  if (!ids.length) return '';
  if (kids.length > 1 && ids.length >= kids.length && kids.every((k) => ids.includes(k.id))) return kids.length === 2 ? 'Both' : 'All';
  return ids.map((id) => kids.find((k) => k.id === id)?.name).filter(Boolean).join(', ');
}

/** "1 h 25 min" / "40 min" between two dates; '' when not after. */
export function lengthBetween(from: Date, to: Date): string {
  const min = Math.round((+to - +from) / 60000);
  if (min <= 0) return '';
  const h = Math.floor(min / 60);
  const m = min % 60;
  return h ? (m ? `${h} h ${m} min` : `${h} h`) : `${m} min`;
}

/** S45 "How did it go?" read as a sentence. */
const NAP_HOW: Record<string, string> = { easily: 'fell asleep easily', 'took a while': 'took a while to fall asleep', 'woke up upset': 'woke up upset' };

/** A typed nap time ("3:45 PM") on the day the nap was logged; never later than when it was logged. */
function napTime(text: string | undefined, loggedAt: string): Date | null {
  if (!text) return null;
  const logged = new Date(loggedAt);
  const d = parseTimeOnDay(text, logged);
  if (!d) return null;
  if (+d > +logged + 60_000) d.setDate(d.getDate() - 1);
  return d;
}

function logRows(l: LogEntry, kids: Pick<Kid, 'id' | 'name'>[]): LogRow[] {
  const base = { logId: l.id, kid: kidTag(l.kid_ids ?? [], kids), photoPath: l.photo_path, urgent: l.urgent };
  const d = l.data ?? {};
  if (l.kind === 'nap') {
    const start = napTime(d.started_at, l.happened_at);
    const end = d.ended_at ? napTime(d.ended_at, l.happened_at) : null;
    const how = d.how ? (NAP_HOW[d.how] ?? d.how) : '';
    if (end) {
      const s = start && +start <= +end ? start : null;
      return [
        { ...base, key: `${l.id}-end`, kind: 'nap', title: 'Nap ended', detail: [s ? lengthBetween(s, end) : '', how].filter(Boolean).join(' · '), at: end.toISOString() },
        ...(s ? [{ ...base, key: `${l.id}-start`, kind: 'nap' as const, title: 'Nap started', detail: d.note ?? '', at: s.toISOString() }] : []),
      ];
    }
    return [{ ...base, key: l.id, kind: 'nap', title: 'Nap started', detail: [d.note, how].filter(Boolean).join(' · '), at: (start ?? new Date(l.happened_at)).toISOString() }];
  }
  if (l.kind === 'photo') {
    const cap = d.caption?.trim();
    return [{ ...base, key: l.id, kind: 'photo', title: 'Photo update', detail: cap ? `“${cap}”` : '', at: l.happened_at }];
  }
  const t = describeLog(l);
  return [{ ...base, key: l.id, kind: l.kind, title: t.title, detail: t.detail, at: l.happened_at }];
}

/** Kid filter (P5 / P77 kid chips, or opened for one kid with ?kidId=): a log is hers when its kid_ids include her, or
 * are empty (the whole family). Logs only for other kids drop out. No kid: every log. */
export function logForKid(l: Pick<LogEntry, 'kid_ids'>, kidId: string | null | undefined): boolean {
  if (!kidId) return true;
  const ids = l.kid_ids ?? [];
  return !ids.length || ids.includes(kidId);
}
export function kidLogs<L extends Pick<LogEntry, 'kid_ids'>>(logs: L[], kidId: string | null | undefined): L[] {
  return kidId ? logs.filter((l) => logForKid(l, kidId)) : logs;
}

const named = (title: string, name: string) => new RegExp(`(^|[^\\p{L}])${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?=$|[^\\p{L}])`, 'iu').test(title);
/** Shift tasks carry no kid, so a task is matched by name: one that names only other kids on the shift ("Soccer for
 * Leo") drops out for her; one that names her ("Pick up Ava") or no kid stays. */
export function taskForKid(title: string, kids: Pick<Kid, 'id' | 'name'>[], kidId: string | null | undefined): boolean {
  if (!kidId) return true;
  const me = kids.find((k) => k.id === kidId);
  if (me && named(title, me.name)) return true;
  return !kids.some((k) => k.id !== kidId && k.name.trim() && named(title, k.name.trim()));
}
export function kidTasks<T extends Pick<Task, 'title'>>(tasks: T[], kids: Pick<Kid, 'id' | 'name'>[], kidId: string | null | undefined): T[] {
  return kidId ? tasks.filter((t) => taskForKid(t.title, kids, kidId)) : tasks;
}

/** P5 / P77 titles with a kid selected: "Ava’s report", "Ava’s log". */
export function reportTitle(kidName: string | null | undefined): string {
  return kidName ? `${kidName}’s report` : 'Shift report';
}
export function logTitle(kidName: string | null | undefined, live: boolean): string {
  return kidName ? `${kidName}’s log` : live ? 'Today’s log' : 'Shift log';
}

/** The P77 timeline for a filter, newest first. With a kid: her logs and the whole family's (tagged "Everyone" when
 * the shift has 2+ kids), and the done tasks that don't name only other kids. */
export function shiftLogRows(logs: LogEntry[], tasks: Pick<Task, 'id' | 'title' | 'done_at'>[], kids: Pick<Kid, 'id' | 'name'>[], filter: LogFilter = 'all', kidId: string | null = null): LogRow[] {
  const kind = filter === 'all' ? null : FILTER_KIND[filter];
  const rows = kidLogs(logs, kidId)
    .filter((l) => !kind || l.kind === kind)
    .flatMap((l) => logRows(l, kids))
    .map((r) => (kidId && !r.kid && kids.length > 1 ? { ...r, kid: 'Everyone' } : r));
  if (!kind)
    for (const t of kidTasks(tasks, kids, kidId))
      if (t.done_at) rows.push({ key: `task-${t.id}`, kind: 'task', logId: null, title: t.title, detail: '', kid: '', at: t.done_at, photoPath: null, urgent: false });
  return rows.sort((a, b) => +new Date(b.at) - +new Date(a.at));
}

/** A pick-up or drop-off task gets P77's car icon; other done tasks a check. */
export function isRideTask(title: string) {
  return /\b(pick(ed)?\s*up|drop(ped)?\s*off|pickup|drop-off)\b/i.test(title);
}

/** "5:10" (P77 times have no AM / PM). */
export function shortClock(iso: string) {
  return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }).replace(/\s?[AP]M$/i, '');
}

const RULE_WORD: Partial<Record<LogKind, string>> = { food: 'meals', nap: 'nap', activity: 'activity', diaper: 'diapers', photo: 'photo update' };
const cap = (s: string) => (s ? s[0].toUpperCase() + s.slice(1) : s);

/** When the next photo update is due under a photo rule with an interval: the last photo (or clock-in) plus the
 * interval. Null without such a rule. */
export function nextPhotoDue(rules: Pick<HouseRule, 'key' | 'category' | 'options'>[], logs: Pick<LogEntry, 'kind' | 'happened_at'>[], clockInAt: string | null): Date | null {
  const rule = rules.find((r) => r.category === 'logs' && catalogueRule(r.key)?.log === 'photo' && (r.options?.every_hours ?? 0) > 0);
  if (!rule) return null;
  const last = logs.filter((l) => l.kind === 'photo').sort((a, b) => b.happened_at.localeCompare(a.happened_at))[0];
  const from = last ? last.happened_at : clockInAt;
  if (!from) return null;
  return new Date(+new Date(from) + (rule.options.every_hours ?? 0) * 3600_000);
}

/** P77 house-rules strip. On track (green): "Meals, nap and activity logged · next photo due 6:30". Something due
 * (amber, P77b): "House rules: 2 logs due." + "Meals and photo update". Null when the family has no log rules. */
export function rulesStrip(rows: ShiftRuleRow[], nextPhoto: Date | null): { ok: boolean; lead: string; text: string } | null {
  if (!rows.length) return null;
  const due = rows.filter((r) => r.state === 'due');
  if (due.length) {
    const words = due.map((r) => RULE_WORD[r.kind] ?? r.title.toLowerCase());
    return { ok: false, lead: `House rules: ${due.length} ${due.length === 1 ? 'log' : 'logs'} due.`, text: cap(joinNames(words)) };
  }
  const done = rows.filter((r) => r.state === 'done' && !(r.kind === 'photo' && nextPhoto)).map((r) => RULE_WORD[r.kind] ?? r.title.toLowerCase());
  const parts = [done.length ? `${cap(joinNames(done))} logged` : '', nextPhoto ? `next photo due ${shortClock(nextPhoto.toISOString())}` : ''].filter(Boolean);
  return { ok: true, lead: 'House rules on track.', text: cap(parts.join(' · ')) };
}

export type PhotoRequest = { id: string; shift_id: string; parent_id: string; created_at: string };
/** Matches ask_for_photo() in migration 26. */
export const PHOTO_ASK_GAP_MIN = 10;

/** The newest request the sitter hasn't answered with a photo yet (S4b strip), or null. */
export function openPhotoRequest(requests: PhotoRequest[], logs: Pick<LogEntry, 'kind' | 'happened_at'>[]): PhotoRequest | null {
  const last = [...requests].sort((a, b) => b.created_at.localeCompare(a.created_at))[0];
  if (!last) return null;
  const answered = logs.some((l) => l.kind === 'photo' && +new Date(l.happened_at) >= +new Date(last.created_at));
  return answered ? null : last;
}

/** Parent side (P77c): the footer reads "Photo asked" while a request is open and less than 10 minutes old. */
export function photoAskWaiting(requests: PhotoRequest[], logs: Pick<LogEntry, 'kind' | 'happened_at'>[], now = new Date()): boolean {
  const open = openPhotoRequest(requests, logs);
  return !!open && +now - +new Date(open.created_at) < PHOTO_ASK_GAP_MIN * 60_000;
}

export type LogReaction = { log_id: string; parent_id: string; kind: 'love'; shift_id: string | null; created_at: string };

/** Log ids with at least one heart. */
export function lovedLogs(reactions: Pick<LogReaction, 'log_id' | 'kind'>[]): Set<string> {
  return new Set(reactions.filter((r) => r.kind === 'love').map((r) => r.log_id));
}
