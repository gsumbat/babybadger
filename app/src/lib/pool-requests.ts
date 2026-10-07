// Ask your pool (migration 25): reads and the database calls. The rules (who may ask, first to accept, expiry,
// filling the others) live in the database; the wording in ./pool-requests-logic.ts.
import { useEffect } from 'react';

import { supabase } from './supabase';
import type { AskedSitter, ExpiryHours, ShiftRequest } from './pool-requests-logic';

export * from './pool-requests-logic';

/** Shown instead of the screen when migration 25 hasn't been run yet. */
export const NEEDS_MIGRATION = 'This needs the latest database update (migration 25).';

function must<T>(r: { data: T | null; error: { message: string; code?: string } | null }): T {
  if (r.error) throw new Error(missingTable(r.error) ? NEEDS_MIGRATION : r.error.message);
  return r.data as T;
}

/** The table or function isn't there yet (migration 25 not run). */
const missingTable = (e: { message: string; code?: string }) =>
  e.code === '42P01' || e.code === 'PGRST205' || e.code === 'PGRST202' || /does not exist|could not find the (table|function)/i.test(e.message);

export type BookResult = { result: 'booked' | 'accepted' | 'offered' | 'filled' | 'cancelled' | 'expired'; shift_id?: string };

export const requestsApi = {
  /** One request with everyone asked (a sitter only gets her own row back). */
  async get(id: string) {
    const [req, asked] = await Promise.all([
      supabase.from('shift_requests').select('*').eq('id', id).maybeSingle(),
      supabase.from('shift_request_sitters').select('*').eq('request_id', id).order('created_at'),
    ]);
    return { request: must(req) as ShiftRequest | null, asked: must(asked) as AskedSitter[] };
  },
  /** The family's open requests (parent Home "Needs you"), with their asked rows. */
  async openForFamily(familyId: string) {
    const reqs = must(await supabase.from('shift_requests').select('*').eq('family_id', familyId).eq('status', 'open').gt('expires_at', new Date().toISOString()).order('starts_at')) as ShiftRequest[];
    if (!reqs.length) return [] as { request: ShiftRequest; asked: AskedSitter[] }[];
    const asked = must(await supabase.from('shift_request_sitters').select('*').in('request_id', reqs.map((r) => r.id))) as AskedSitter[];
    return reqs.map((request) => ({ request, asked: asked.filter((a) => a.request_id === request.id) }));
  },
  /** Requests sent to this sitter that still need her answer (sitter Home). */
  async waitingForMe(sitterId: string) {
    const mine = must(await supabase.from('shift_request_sitters').select('*').eq('sitter_id', sitterId).in('status', ['sent', 'seen'])) as AskedSitter[];
    if (!mine.length) return [] as ShiftRequest[];
    return must(await supabase.from('shift_requests').select('*').in('id', mine.map((m) => m.request_id)).eq('status', 'open').gt('expires_at', new Date().toISOString()).order('starts_at')) as ShiftRequest[];
  },
  async create(p: { familyId: string; start: Date; end: Date; sitterIds: string[]; kidIds: string[]; note: string; firstToAccept: boolean; hours: ExpiryHours; placeId?: string | null }) {
    return must(
      await supabase.rpc('create_shift_request', {
        p_family: p.familyId,
        p_starts: p.start.toISOString(),
        p_ends: p.end.toISOString(),
        p_sitters: p.sitterIds,
        p_kid_ids: p.kidIds,
        p_note: p.note,
        p_first_to_accept: p.firstToAccept,
        p_expires_hours: p.hours,
        p_place: p.placeId ?? null,
      }),
    ) as string;
  },
  async addSitters(requestId: string, sitterIds: string[]) {
    return must(await supabase.rpc('add_shift_request_sitters', { p_request: requestId, p_sitters: sitterIds })) as number;
  },
  async cancel(requestId: string) {
    must(await supabase.rpc('cancel_shift_request', { p_request: requestId }));
  },
  async book(requestId: string, sitterId: string) {
    return must(await supabase.rpc('book_shift_request', { p_request: requestId, p_sitter: sitterId })) as string;
  },
  async passOffer(requestId: string, sitterId: string) {
    must(await supabase.rpc('pass_shift_request_offer', { p_request: requestId, p_sitter: sitterId }));
  },
  async markSeen(requestId: string) {
    must(await supabase.rpc('mark_shift_request_seen', { p_request: requestId }));
  },
  /** S33 Accept / S20 "Accept all and cancel my time off" (clear = the days of time off to give up). */
  async accept(requestId: string, clear?: { from: string; to: string }) {
    return must(await supabase.rpc('accept_shift_request', { p_request: requestId, p_clear_from: clear?.from ?? null, p_clear_to: clear?.to ?? null })) as BookResult;
  },
  async offer(requestId: string, start: Date, end: Date) {
    return must(await supabase.rpc('offer_shift_request', { p_request: requestId, p_starts: start.toISOString(), p_ends: end.toISOString() })) as BookResult;
  },
  async decline(requestId: string) {
    must(await supabase.rpc('decline_shift_request', { p_request: requestId }));
  },
  /** Closes requests past their expiry (and pushes their parents). Quietly does nothing before migration 25. */
  async expireDue() {
    await supabase.rpc('expire_shift_requests').then(
      () => undefined,
      () => undefined,
    );
  },
};

/** Reloads when the request or anyone's answer changes (P46, S33). Unique channel name per subscription. */
export function useRequestLive(requestId: string | undefined, onChange: () => void) {
  useEffect(() => {
    if (!requestId) return;
    const ch = supabase
      .channel(`shift-request-${requestId}-${Math.random().toString(36).slice(2)}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'shift_requests', filter: `id=eq.${requestId}` }, () => onChange())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'shift_request_sitters', filter: `request_id=eq.${requestId}` }, () => onChange())
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [requestId, onChange]);
}
