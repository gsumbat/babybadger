// Running late (S21), cancelling (S21 "I can't make it today") and staying longer (S25): data and types.
// Needs migration 14 (supabase/migrations/20261006000014_shift_timing.sql). Until it runs, reads come back empty and
// the screens simply don't show these parts.
import { useCallback, useEffect, useState } from 'react';

import { supabase } from './supabase';
import type { Shift } from './types';

/** Late notice and cancellation fields on a shift (migration 14). Absent before the migration runs. */
export type ShiftTiming = Shift & {
  late_minutes?: number | null;
  late_note?: string;
  late_at?: string | null;
  cancelled_by?: string | null;
  cancel_reason?: string;
  cancelled_at?: string | null;
};

export type ExtensionStatus = 'pending' | 'accepted' | 'declined' | 'withdrawn';

/** A parent's request for the sitter to stay longer (S25). */
export type ShiftExtension = {
  id: string;
  shift_id: string;
  requested_by: string;
  new_ends_at: string;
  note: string;
  status: ExtensionStatus;
  answered_ends_at: string | null;
  answered_at: string | null;
  created_at: string;
};

function check<T>(r: { data: T | null; error: { message: string } | null }): T {
  if (r.error) throw new Error(r.error.message);
  return r.data as T;
}

export const timingApi = {
  /** S21 "Tell the Lee family": stores the late notice and pushes the parents (risk = "Pick up Ava at 3:15 is at risk."). */
  async reportLate(shiftId: string, minutes: number, note: string, risk: string) {
    return check(await supabase.rpc('report_late', { p_shift: shiftId, p_minutes: minutes, p_note: note.trim(), p_risk: risk })) as ShiftTiming;
  },
  /** S21 "I can't make it today": cancels her own shift; the parents get an urgent push. */
  async cancelMyShift(shiftId: string, reason: string) {
    return check(await supabase.rpc('cancel_my_shift', { p_shift: shiftId, p_reason: reason.trim() })) as ShiftTiming;
  },
  /** Parent asks the sitter to stay until `until` (replaces an open request). */
  async requestExtension(shiftId: string, until: Date, note: string) {
    return check(await supabase.rpc('request_extension', { p_shift: shiftId, p_until: until.toISOString(), p_note: note.trim() })) as ShiftExtension;
  },
  /** Sitter answers (S25): accept until `until`, or decline. */
  async answerExtension(requestId: string, accept: boolean, until?: Date) {
    return check(await supabase.rpc('answer_extension', { p_request: requestId, p_accept: accept, p_until: until ? until.toISOString() : null })) as ShiftTiming;
  },
  /** The open request on a shift, if any. Empty before migration 14. */
  async pendingExtension(shiftId: string) {
    const r = await supabase.from('shift_extensions').select('*').eq('shift_id', shiftId).eq('status', 'pending').order('created_at', { ascending: false }).limit(1);
    return r.error ? null : ((r.data?.[0] as ShiftExtension | undefined) ?? null);
  },
  /** Her hourly rate with this family (P23 Pay, migration 11), for S25's Extra pay row. */
  async sitterRate(familyId: string, sitterId: string) {
    const r = await supabase.from('family_sitters').select('rate').eq('family_id', familyId).eq('sitter_id', sitterId).maybeSingle();
    const rate = (r.data as { rate?: number | string | null } | null)?.rate;
    return r.error || rate == null ? null : Number(rate);
  },
};

let channelSeq = 0;

/** The open extension request on a shift, kept live with Realtime (S25 card, parent's Live card). */
export function usePendingExtension(shiftId: string | undefined) {
  const [pending, setPending] = useState<ShiftExtension | null>(null);
  const load = useCallback(async () => {
    setPending(shiftId ? await timingApi.pendingExtension(shiftId) : null);
  }, [shiftId]);
  useEffect(() => {
    // initial fetch, then live updates
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
    if (!shiftId) return;
    // Each subscription gets its own channel name (a shared name breaks when two screens mount at once).
    const ch = supabase
      .channel(`shift-ext-${shiftId}-${++channelSeq}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'shift_extensions', filter: `shift_id=eq.${shiftId}` }, () => load())
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [shiftId, load]);
  return { pending, reload: load };
}
