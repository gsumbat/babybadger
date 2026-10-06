// Pure thread logic for messages (wireframes P10, S37), kept apart from the Supabase calls so it can be unit tested.
import type { Shift } from './types';

export type Message = {
  id: string;
  family_id: string;
  sitter_id: string;
  author_id: string;
  body: string;
  photo_path: string | null;
  created_at: string;
};

export type ReadMark = { family_id: string; sitter_id: string; user_id: string; read_at: string };

/** What the thread shows, oldest first: day labels, clock-in pills and messages. */
export type ThreadItem =
  | { kind: 'day'; key: string; label: string }
  | { kind: 'clockIn'; key: string; at: string }
  | { kind: 'message'; key: string; message: Message; mine: boolean; seen: boolean };

export const threadKey = (familyId: string, sitterId: string) => `${familyId}:${sitterId}`;

/** "Today", otherwise MM/DD/YYYY. */
export function dayLabel(iso: string, now = new Date()) {
  const d = new Date(iso);
  if (d.toDateString() === now.toDateString()) return 'Today';
  return `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}/${d.getFullYear()}`;
}

/** Merges messages and the shifts' clock-ins in time order, with a day label before each new day.
 * `mySide` says whose messages sit on the right: the sitter's own, or (for a parent) any parent's. */
export function buildThread(messages: Message[], shifts: Pick<Shift, 'id' | 'clock_in_at'>[], reads: ReadMark[], mySide: (m: Message) => boolean, now = new Date()): ThreadItem[] {
  type Ev = { at: string; item: ThreadItem };
  const evs: Ev[] = [];
  for (const s of shifts) if (s.clock_in_at) evs.push({ at: s.clock_in_at, item: { kind: 'clockIn', key: `in-${s.id}`, at: s.clock_in_at } });
  for (const m of messages) {
    const mine = mySide(m);
    // seen = someone on the other side has read the thread since this message was sent
    const seen = mine && reads.some((r) => r.user_id !== m.author_id && !mySide({ ...m, author_id: r.user_id }) && r.read_at >= m.created_at);
    evs.push({ at: m.created_at, item: { kind: 'message', key: m.id, message: m, mine, seen } });
  }
  evs.sort((a, b) => +new Date(a.at) - +new Date(b.at));
  const out: ThreadItem[] = [];
  let day = '';
  for (const e of evs) {
    const label = dayLabel(e.at, now);
    if (label !== day) {
      day = label;
      out.push({ kind: 'day', key: `day-${label}`, label });
    }
    out.push(e.item);
  }
  return out;
}
