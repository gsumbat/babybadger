// Shift log reactions ("Love it") and photo requests ("Ask for a photo"), migration 26. Pure rules are in
// ./shift-log-logic.ts and re-exported here. Every read is guarded so screens render before migration 26 runs.
import { useCallback, useEffect, useState } from 'react';

import type { LogReaction, PhotoRequest } from './shift-log-logic';
import { supabase } from './supabase';

export * from './shift-log-logic';

export const MIGRATION_26_TEXT = 'This needs the latest database update (migration 26).';

/** Turns "function not found" / "relation does not exist" from before migration 26 into a plain sentence. */
function plain(e: { message?: string; code?: string } | null): Error | null {
  if (!e) return null;
  const m = e.message ?? '';
  if (e.code === 'PGRST202' || e.code === 'PGRST205' || e.code === '42P01' || /ask_for_photo|log_reactions|photo_requests/.test(m)) return new Error(MIGRATION_26_TEXT);
  return new Error(m);
}

export const shiftLogApi = {
  async reactions(shiftId: string): Promise<LogReaction[]> {
    const r = await supabase.from('log_reactions').select('*').eq('shift_id', shiftId);
    if (r.error) throw plain(r.error);
    return (r.data ?? []) as LogReaction[];
  },
  async photoRequests(shiftId: string): Promise<PhotoRequest[]> {
    const r = await supabase.from('photo_requests').select('*').eq('shift_id', shiftId).order('created_at', { ascending: false }).limit(20);
    if (r.error) throw plain(r.error);
    return (r.data ?? []) as PhotoRequest[];
  },
  async love(logId: string, parentId: string) {
    const r = await supabase.from('log_reactions').insert({ log_id: logId, parent_id: parentId, kind: 'love' });
    // Already loved (double tap, or the realtime echo raced the tap): nothing to do.
    if (r.error && r.error.code !== '23505') throw plain(r.error);
  },
  async unlove(logId: string, parentId: string) {
    const r = await supabase.from('log_reactions').delete().eq('log_id', logId).eq('parent_id', parentId).eq('kind', 'love');
    if (r.error) throw plain(r.error);
  },
  async askForPhoto(shiftId: string): Promise<PhotoRequest> {
    const r = await supabase.rpc('ask_for_photo', { p_shift: shiftId });
    if (r.error) throw plain(r.error);
    return r.data as PhotoRequest;
  },
};

/** A shift's hearts and photo requests, kept live (Realtime, one uniquely named channel per subscription). Empty
 * lists before migration 26. */
export function useShiftReactions(shiftId: string | undefined) {
  const [reactions, setReactions] = useState<LogReaction[]>([]);
  const [requests, setRequests] = useState<PhotoRequest[]>([]);

  const load = useCallback(async () => {
    if (!shiftId) return;
    const [r, q] = await Promise.all([shiftLogApi.reactions(shiftId).catch(() => [] as LogReaction[]), shiftLogApi.photoRequests(shiftId).catch(() => [] as PhotoRequest[])]);
    setReactions(r);
    setRequests(q);
  }, [shiftId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
    if (!shiftId) return;
    const same = (a: Pick<LogReaction, 'log_id' | 'parent_id' | 'kind'>, b: Pick<LogReaction, 'log_id' | 'parent_id' | 'kind'>) =>
      a.log_id === b.log_id && a.parent_id === b.parent_id && a.kind === b.kind;
    const ch = supabase
      .channel(`shift-log-${shiftId}-${Math.random().toString(36).slice(2)}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'log_reactions', filter: `shift_id=eq.${shiftId}` }, (p) => {
        const row = p.new as LogReaction;
        setReactions((rs) => (rs.some((r) => same(r, row)) ? rs : [...rs, row]));
      })
      // Deletes can't be filtered by column; the old row carries the key, so drop it if it's one of ours.
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'log_reactions' }, (p) => {
        const row = p.old as LogReaction;
        setReactions((rs) => rs.filter((r) => !same(r, row)));
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'photo_requests', filter: `shift_id=eq.${shiftId}` }, (p) => {
        const row = p.new as PhotoRequest;
        setRequests((qs) => (qs.some((q) => q.id === row.id) ? qs : [row, ...qs]));
      })
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [shiftId, load]);

  return { reactions, requests, setReactions, setRequests, reload: load };
}
