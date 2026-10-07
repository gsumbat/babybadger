// Add a child's last steps (wireframes P21 ChildSitters, P22 ChildAdded) and Settings › Sitters (P27).
// Needs migration 21 (20261006000021_family_setup.sql) for set_sitter_kid / tell_sitters_about_kid; until it runs,
// those calls fail and the screens say so, everything else still loads.
import { supabase } from './supabase';
import type { Profile, Shift, SitterLink } from './types';

export * from './family-setup-logic';

function must<T>(r: { data: T | null; error: { message: string } | null }): T {
  if (r.error) throw new Error(r.error.message);
  return r.data as T;
}

/** A family_sitters row with migration 11's kid list (null = every kid, now and later) and the sitter's name. */
export type SitterAccess = SitterLink & { kid_ids: string[] | null; rate?: number | null; profile?: Profile };

export const setupApi = {
  /** Every sitter of the family who isn't removed, with her kid list. */
  async sitters(familyId: string): Promise<SitterAccess[]> {
    const links = must(await supabase.from('family_sitters').select('*').eq('family_id', familyId).neq('status', 'removed').order('joined_at')) as SitterAccess[];
    const ids = links.map((l) => l.sitter_id);
    const people = ids.length ? (must(await supabase.from('profiles').select('id, full_name, role').in('id', ids)) as Profile[]) : [];
    return links.map((l) => ({ ...l, profile: people.find((p) => p.id === l.sitter_id) }));
  },
  /** P21 switch: this sitter sees (or no longer sees) this kid. */
  async setSitterKid(kidId: string, sitterId: string, on: boolean) {
    const { error } = await supabase.rpc('set_sitter_kid', { p_kid: kidId, p_sitter: sitterId, p_on: on });
    if (error) throw new Error(error.message);
  },
  /** P21 "Tell Maya about Mia": a push that opens S26. Returns how many sitters it reached. */
  async tellSitters(kidId: string, sitterIds: string[]) {
    const { data, error } = await supabase.rpc('tell_sitters_about_kid', { p_kid: kidId, p_sitters: sitterIds });
    if (error) throw new Error(error.message);
    return (data as number) ?? 0;
  },
  /** P21 "Add Mia to booked shifts": scheduled shifts still ahead with these sitters. */
  async upcomingShifts(familyId: string, sitterIds: string[]) {
    if (!sitterIds.length) return [] as Shift[];
    return must(
      await supabase.from('shifts').select('*').eq('family_id', familyId).eq('status', 'scheduled').gt('starts_at', new Date().toISOString()).in('sitter_id', sitterIds).order('starts_at'),
    ) as Shift[];
  },
  /** P27 Resend on an expired invite: the same code works for 7 more days. */
  async renewInvite(inviteId: string) {
    must(await supabase.from('invites').update({ expires_at: new Date(Date.now() + 7 * 864e5).toISOString() }).eq('id', inviteId));
  },
  async addKidToShifts(kidId: string, shiftIds: string[]) {
    if (!shiftIds.length) return;
    must(await supabase.from('shift_kids').upsert(shiftIds.map((shift_id) => ({ shift_id, kid_id: kidId })), { onConflict: 'shift_id,kid_id', ignoreDuplicates: true }));
  },
};
