import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';

import { hasDetails, normalizeCareItem } from './care-plan';
import type { FamilyContact } from './family-page-logic';
import { supabase } from './supabase';
import type { CareItemInput, Invite, Kid, LocationPoint, LogEntry, Profile, Shift, SitterLink, Task } from './types';

/** Load data when the screen gains focus; returns [data, reload, loading, error]. */
export function useQuery<T>(fn: () => Promise<T>, deps: unknown[]): { data: T | undefined; reload: () => Promise<void>; loading: boolean; error: string } {
  const [data, setData] = useState<T>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const fnRef = useRef(fn);
  useEffect(() => {
    fnRef.current = fn;
  });
  const key = JSON.stringify(deps);
  const run = useCallback(async () => {
    try {
      setError('');
      setData(await fnRef.current());
    } catch (e) {
      setError(e instanceof Error ? e.message : String((e as { message?: string })?.message ?? e));
    } finally {
      setLoading(false);
    }
    // re-create when the inputs change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  useFocusEffect(
    useCallback(() => {
      run();
    }, [run]),
  );
  return { data, reload: run, loading, error };
}

type CareRow = Parameters<typeof normalizeCareItem>[0];

/** every_minutes null and details {} are the column defaults (migration 08). Leaving them out keeps items without
 * a repeat or extras saving before that migration runs; `keep` sends them anyway to clear a saved value. */
function withoutEmptyExtras<T extends Partial<CareItemInput>>(fields: T, keep: { every_minutes?: boolean; details?: boolean } = {}) {
  const row: Partial<CareItemInput> = { ...fields };
  if ('every_minutes' in row && row.every_minutes == null && !keep.every_minutes) delete row.every_minutes;
  if ('details' in row && !hasDetails(row.details) && !keep.details) delete row.details;
  return row;
}

function must<T>(r: { data: T | null; error: { message: string } | null }): T {
  if (r.error) throw new Error(r.error.message);
  return r.data as T;
}

export const api = {
  async familyShifts(familyId: string) {
    return must(await supabase.from('shifts').select('*').eq('family_id', familyId).order('starts_at', { ascending: true })) as Shift[];
  },
  async sitterShifts(sitterId: string) {
    return must(await supabase.from('shifts').select('*').eq('sitter_id', sitterId).neq('status', 'cancelled').order('starts_at')) as Shift[];
  },
  async kids(familyId: string) {
    return must(await supabase.from('kids').select('*').eq('family_id', familyId).order('created_at')) as Kid[];
  },
  async kid(id: string) {
    return must(await supabase.from('kids').select('*').eq('id', id).single()) as Kid;
  },
  /** Shifts this kid is on (shift_kids), newest first. */
  async kidShifts(kidId: string) {
    const rows = must(await supabase.from('shift_kids').select('shift:shifts(*)').eq('kid_id', kidId)) as unknown as { shift: Shift | null }[];
    return rows
      .map((r) => r.shift)
      .filter((s): s is Shift => !!s)
      .sort((a, b) => b.starts_at.localeCompare(a.starts_at));
  },
  async familySitters(familyId: string) {
    const links = must(await supabase.from('family_sitters').select('*').eq('family_id', familyId).neq('status', 'removed')) as SitterLink[];
    const ids = links.map((l) => l.sitter_id);
    const people = ids.length ? (must(await supabase.from('profiles').select('id, full_name, role').in('id', ids)) as Profile[]) : [];
    return links.map((l) => ({ ...l, profile: people.find((p) => p.id === l.sitter_id) }));
  },
  async openInvites(familyId: string) {
    return must(
      await supabase.from('invites').select('*').eq('family_id', familyId).is('accepted_at', null).is('cancelled_at', null).gt('expires_at', new Date().toISOString()).order('created_at', { ascending: false }),
    ) as Invite[];
  },
  /** Parents of a family (sitters may read them once they've joined). */
  async familyParents(familyId: string) {
    const links = must(await supabase.from('family_parents').select('user_id').eq('family_id', familyId)) as { user_id: string }[];
    const ids = links.map((l) => l.user_id);
    return ids.length ? (must(await supabase.from('profiles').select('id, full_name, role').in('id', ids)) as Profile[]) : [];
  },
  /** The family's adults with their phones (S10 PARENTS; migration 33): for family members and sitters who signed the
   * notice. Throws before migration 33 runs. */
  async familyContacts(familyId: string) {
    return must(await supabase.rpc('family_contacts', { p_family: familyId })) as FamilyContact[];
  },
  /** A sitter's own number (S40, sitter_profiles.phone): readable by the parents and members of her families
   * (sitter_can_be_seen_by, migration 19). null when she hasn't added one or it can't be read. P4n's Call. */
  async sitterPhone(sitterId: string) {
    const r = await supabase.from('sitter_profiles').select('phone').eq('sitter_id', sitterId).maybeSingle();
    return r.error ? null : ((r.data as { phone: string | null } | null)?.phone ?? null);
  },
  /** Shift tasks after booking (P5e, migration 34): full-access parents, upcoming or live shifts; the sitter gets a push. */
  async addShiftTask(shiftId: string, title: string, dueAt: string | null) {
    return must(await supabase.rpc('add_shift_task', { p_shift: shiftId, p_title: title, p_due: dueAt })) as Task;
  },
  async editShiftTask(taskId: string, title: string, dueAt: string | null) {
    return must(await supabase.rpc('edit_shift_task', { p_task: taskId, p_title: title, p_due: dueAt })) as Task;
  },
  async deleteShiftTask(taskId: string) {
    must(await supabase.rpc('delete_shift_task', { p_task: taskId }));
  },
  /** Settings › Account › Phone (P12b / P12p, migration 33): her own number, null when none. */
  async myPhone() {
    return (must(await supabase.rpc('my_phone')) as string | null) ?? null;
  },
  /** Saves (or clears with '') her number; the database checks it looks like a phone number. */
  async setMyPhone(phone: string) {
    return (must(await supabase.rpc('set_my_phone', { p_phone: phone })) as string | null) ?? null;
  },
  /** Care plan (P7): every item in the family, whole-family tasks and each kid's day. */
  async careItems(familyId: string) {
    return (must(await supabase.from('care_items').select('*').eq('family_id', familyId).order('created_at')) as CareRow[]).map(normalizeCareItem);
  },
  /** One kid's day (P20). */
  async kidCareItems(kidId: string) {
    return (must(await supabase.from('care_items').select('*').eq('kid_id', kidId).order('created_at')) as CareRow[]).map(normalizeCareItem);
  },
  async careItem(id: string) {
    return normalizeCareItem(must(await supabase.from('care_items').select('*').eq('id', id).single()) as CareRow);
  },
  async createCareItem(familyId: string, fields: CareItemInput) {
    return normalizeCareItem(must(await supabase.from('care_items').insert({ ...withoutEmptyExtras(fields), family_id: familyId }).select().single()) as CareRow);
  },
  /** `keep` lists the extras the saved row already has, so they are cleared even when the new value is empty. */
  async updateCareItem(id: string, fields: Partial<CareItemInput>, keep: { every_minutes?: boolean; details?: boolean } = {}) {
    return normalizeCareItem(must(await supabase.from('care_items').update(withoutEmptyExtras(fields, keep)).eq('id', id).select().single()) as CareRow);
  },
  async deleteCareItem(id: string) {
    must(await supabase.from('care_items').delete().eq('id', id));
  },
  async profilesById(ids: string[]) {
    if (!ids.length) return {} as Record<string, Profile>;
    const rows = must(await supabase.from('profiles').select('id, full_name, role').in('id', ids)) as Profile[];
    return Object.fromEntries(rows.map((p) => [p.id, p]));
  },
};

export type ShiftBundle = {
  shift: Shift;
  tasks: Task[];
  logs: LogEntry[];
  points: LocationPoint[];
  kids: Kid[];
  sitter?: Profile;
};

/** Everything about one shift, kept live with Supabase Realtime (location, logs, tasks, status). */
export function useShiftLive(shiftId: string | undefined) {
  const [bundle, setBundle] = useState<ShiftBundle | null>(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (!shiftId) return;
    try {
      const shift = must(await supabase.from('shifts').select('*').eq('id', shiftId).single()) as Shift;
      const [tasks, logs, points, kidLinks, sitter] = await Promise.all([
        supabase.from('shift_tasks').select('*').eq('shift_id', shiftId).order('position'),
        supabase.from('logs').select('*').eq('shift_id', shiftId).order('happened_at', { ascending: false }),
        supabase.from('locations').select('*').eq('shift_id', shiftId).order('recorded_at').limit(2000),
        supabase.from('shift_kids').select('kid:kids(*)').eq('shift_id', shiftId),
        supabase.from('profiles').select('id, full_name, role').eq('id', shift.sitter_id).maybeSingle(),
      ]);
      setBundle({
        shift,
        tasks: (tasks.data ?? []) as Task[],
        logs: (logs.data ?? []) as LogEntry[],
        points: (points.data ?? []) as LocationPoint[],
        kids: ((kidLinks.data ?? []) as unknown as { kid: Kid }[]).map((k) => k.kid).filter(Boolean),
        sitter: (sitter.data as Profile) ?? undefined,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }, [shiftId]);

  useEffect(() => {
    // initial fetch, then live updates from Realtime
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
    if (!shiftId) return;
    const ch = supabase
      // A unique name per subscription: two screens (or a remount) on the same shift would otherwise share one
      // channel and crash with "cannot add postgres_changes callbacks after subscribe()".
      .channel(`shift-${shiftId}-${Math.random().toString(36).slice(2)}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'locations', filter: `shift_id=eq.${shiftId}` }, (p) =>
        setBundle((b) => (b ? { ...b, points: [...b.points, p.new as LocationPoint] } : b)),
      )
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'logs', filter: `shift_id=eq.${shiftId}` }, (p) =>
        setBundle((b) => (b ? { ...b, logs: [p.new as LogEntry, ...b.logs] } : b)),
      )
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'shift_tasks', filter: `shift_id=eq.${shiftId}` }, (p) =>
        setBundle((b) => (b ? { ...b, tasks: b.tasks.map((t) => (t.id === (p.new as Task).id ? (p.new as Task) : t)) } : b)),
      )
      // A parent adds or removes a task after booking (P5e): the sitter's shift page follows along.
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'shift_tasks', filter: `shift_id=eq.${shiftId}` }, (p) =>
        setBundle((b) => (b && !b.tasks.some((t) => t.id === (p.new as Task).id) ? { ...b, tasks: [...b.tasks, p.new as Task].sort((x, y) => x.position - y.position) } : b)),
      )
      // Deletes can't be filtered by column (Realtime sends only the old id), so match it against this shift's tasks.
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'shift_tasks' }, (p) =>
        setBundle((b) => (b && b.tasks.some((t) => t.id === (p.old as Partial<Task>).id) ? { ...b, tasks: b.tasks.filter((t) => t.id !== (p.old as Partial<Task>).id) } : b)),
      )
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'shifts', filter: `id=eq.${shiftId}` }, (p) =>
        setBundle((b) => (b ? { ...b, shift: p.new as Shift } : b)),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [shiftId, load]);

  // Coming back to the screen (e.g. from a "Jen added a task" push) fetches again, in case Realtime missed something
  // while the app was in the background. The first focus is the initial fetch above.
  const focusedOnce = useRef(false);
  useFocusEffect(
    useCallback(() => {
      if (focusedOnce.current) load();
      focusedOnce.current = true;
    }, [load]),
  );

  return { bundle, reload: load, error };
}

export async function photoUrl(path: string) {
  const { data } = await supabase.storage.from('shift-photos').createSignedUrl(path, 3600);
  return data?.signedUrl ?? null;
}
