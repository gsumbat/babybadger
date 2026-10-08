// Requirement requests data (migration 31). Pure logic is in ./requirement-requests.ts and re-exported here.
// Every write goes through an RPC; the database checks who may do what (parents ask and review, the sitter shares).
import type { FamilyReqRow, FamilyRequests, ReqRequest } from './requirement-requests';
import { supabase } from './supabase';

export * from './requirement-requests';

function must<T>(r: { data: T | null; error: { message: string } | null }): T {
  if (r.error) throw new Error(r.error.message);
  return r.data as T;
}

/** True when the error means migration 31 hasn't been run yet. */
export function needsMigration31(error: unknown) {
  const msg = error instanceof Error ? error.message : String((error as { message?: string })?.message ?? error ?? '');
  return /requirement_request|ask_requirements|share_requirement|review_requirement/i.test(msg) && /does not exist|schema cache|not found|could not find/i.test(msg);
}
export const MIGRATION_31_TEXT = 'Requests need the latest database update (migration 31).';

/** Friendlier words for the database's refusals. */
export function requestErrorText(e: unknown) {
  const msg = e instanceof Error ? e.message : String((e as { message?: string })?.message ?? e ?? '');
  if (needsMigration31(e)) return MIGRATION_31_TEXT;
  if (/under_18/.test(msg)) return 'Your birthday says you’re under 18, so you can’t share this one.';
  if (/not a parent/.test(msg)) return 'Only a parent in the family can do this.';
  return msg;
}

export const requirementRequestsApi = {
  /** P11 / P7a / P79b: every requirement of the family for one sitter (any family member). */
  async forSitter(familyId: string, sitterId: string): Promise<FamilyReqRow[]> {
    return (must(await supabase.rpc('family_requirement_requests', { p_family: familyId, p_sitter: sitterId })) as FamilyReqRow[] | null) ?? [];
  },
  /** forSitter, or [] (with missing = true) before migration 31 runs. */
  async forSitterOrMissing(familyId: string, sitterId: string): Promise<{ rows: FamilyReqRow[]; missing: boolean }> {
    try {
      return { rows: await this.forSitter(familyId, sitterId), missing: false };
    } catch (e) {
      if (needsMigration31(e)) return { rows: [], missing: true };
      throw e;
    }
  },
  /** S53 / Home / S14: her requests, by family. [] before migration 31 (or on any error). */
  async mine(): Promise<FamilyRequests[]> {
    try {
      return (must(await supabase.rpc('my_requirement_requests')) as FamilyRequests[] | null) ?? [];
    } catch {
      return [];
    }
  },
  /** One request (the sitter's own, or her family's). */
  async get(id: string): Promise<{ family_id: string; sitter_id: string } | null> {
    return must(await supabase.from('requirement_requests').select('family_id, sitter_id').eq('id', id).maybeSingle()) as { family_id: string; sitter_id: string } | null;
  },
  /** P79 Send. Returns how many were asked. */
  async ask(familyId: string, sitterId: string, keys: string[], note: string) {
    return must(await supabase.rpc('ask_requirements', { p_family: familyId, p_sitter: sitterId, p_keys: keys, p_note: note.trim() || null })) as number;
  },
  /** S53b: share one of her cards (or, self-declared, nothing) with an optional note. */
  async share(requestId: string, credentialId: string | null, note: string) {
    return must(await supabase.rpc('share_requirement', { p_request: requestId, p_credential: credentialId, p_note: note.trim() || null })) as ReqRequest;
  },
  /** S53c "I don't have it". */
  async decline(requestId: string, note: string) {
    must(await supabase.rpc('decline_requirement', { p_request: requestId, p_note: note.trim() || null }));
  },
  /** P79b Looks good (ok) / Ask again (with a note). */
  async review(requestId: string, ok: boolean, note = '') {
    must(await supabase.rpc('review_requirement', { p_request: requestId, p_ok: ok, p_note: note.trim() || null }));
  },
  async cancel(requestId: string) {
    must(await supabase.rpc('cancel_requirement_request', { p_request: requestId }));
  },
};
