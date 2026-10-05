import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';

import { supabase } from './supabase';
import type { Invite, Kid, LocationPoint, LogEntry, Profile, Shift, SitterLink, Task } from './types';

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
      .channel(`shift-${shiftId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'locations', filter: `shift_id=eq.${shiftId}` }, (p) =>
        setBundle((b) => (b ? { ...b, points: [...b.points, p.new as LocationPoint] } : b)),
      )
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'logs', filter: `shift_id=eq.${shiftId}` }, (p) =>
        setBundle((b) => (b ? { ...b, logs: [p.new as LogEntry, ...b.logs] } : b)),
      )
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'shift_tasks', filter: `shift_id=eq.${shiftId}` }, (p) =>
        setBundle((b) => (b ? { ...b, tasks: b.tasks.map((t) => (t.id === (p.new as Task).id ? (p.new as Task) : t)) } : b)),
      )
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'shifts', filter: `id=eq.${shiftId}` }, (p) =>
        setBundle((b) => (b ? { ...b, shift: p.new as Shift } : b)),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [shiftId, load]);

  return { bundle, reload: load, error };
}

export async function photoUrl(path: string) {
  const { data } = await supabase.storage.from('shift-photos').createSignedUrl(path, 3600);
  return data?.signedUrl ?? null;
}
