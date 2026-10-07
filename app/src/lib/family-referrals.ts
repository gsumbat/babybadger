// Supabase calls for sitter -> family invites and "Be found later" (migration 29). Every read is guarded so the
// screens render before migration 29 is run: lists come back empty, the preview 'unknown', the switch off.
import type { FamilyLinkPreview, Referral } from './family-links';
import type { InviteChoices } from './invites';
import { supabase } from './supabase';

/** Migration 29 hasn't been run yet. */
export function needsMigration29(e: unknown) {
  const m = typeof e === 'object' && e && 'message' in e ? String((e as { message: unknown }).message) : String(e ?? '');
  return /family_referral|my_family_referrals|found_later|schema cache|does not exist|Could not find the function/i.test(m);
}

const NEEDS_29 = 'This needs the latest database update (migration 29).';

function msg(e: unknown) {
  return needsMigration29(e) ? new Error(NEEDS_29) : e instanceof Error ? e : new Error(String((e as { message?: string })?.message ?? e));
}

export const familyLinkApi = {
  /** S52b: her invites (not cancelled), newest first. null = migration 29 not run yet. */
  async mine(): Promise<Referral[] | null> {
    const { data, error } = await supabase.rpc('my_family_referrals');
    if (error) {
      if (needsMigration29(error)) return null;
      throw error;
    }
    return (data ?? []) as Referral[];
  },
  /** S52: makes the link (first Share / Email / Copy tap). */
  async create(f: { parent_name: string; family_name: string; email: string }): Promise<{ id: string; token: string }> {
    const { data, error } = await supabase
      .from('family_referrals')
      .insert({ parent_name: f.parent_name.trim() || null, family_name: f.family_name.trim() || null, email: f.email.trim() || null })
      .select('id, token')
      .single();
    if (error) throw msg(error);
    return data as { id: string; token: string };
  },
  /** Editing the details after the link was made (going back to S52 and sharing again). */
  async update(id: string, f: { parent_name: string; family_name: string; email: string }) {
    const { error } = await supabase
      .from('family_referrals')
      .update({ parent_name: f.parent_name.trim() || null, family_name: f.family_name.trim() || null, email: f.email.trim() || null })
      .eq('id', id);
    if (error) throw msg(error);
  },
  async cancel(id: string) {
    const { error } = await supabase.from('family_referrals').update({ cancelled_at: new Date().toISOString() }).eq('id', id);
    if (error) throw msg(error);
  },
  /** Resend: the same link works 30 more days. */
  async resend(id: string) {
    const { error } = await supabase.rpc('resend_family_referral', { p_id: id });
    if (error) throw msg(error);
  },
  /** S0f: what anyone with the link may see (works signed out). 'unknown' when it can't be checked. */
  async preview(token: string): Promise<FamilyLinkPreview> {
    const { data, error } = await supabase.rpc('family_referral_preview', { p_token: token });
    if (error || !data) return { status: 'unknown' };
    return data as FamilyLinkPreview;
  },
  /** P3d: the parent confirms. Makes the invite for the sitter (she accepts it the usual way). */
  async claim(token: string, familyId: string, c: InviteChoices): Promise<{ invite_id: string; link_token: string }> {
    const { data, error } = await supabase.rpc('claim_family_referral', {
      p_token: token,
      p_family: familyId,
      p_kid_ids: c.kid_ids,
      p_can_drive: c.can_drive,
      p_can_trip: c.can_trip,
      p_can_message: c.can_message,
      p_rate: c.rate,
      p_pay_schedule: c.pay_schedule,
    });
    if (error) throw msg(error);
    return data as { invite_id: string; link_token: string };
  },
};

/** "Be found by new families later" (S12, S13). Off before migration 29. */
export const foundLaterApi = {
  async get(): Promise<{ on: boolean; at: string | null; ready: boolean }> {
    const { data, error } = await supabase.rpc('my_found_later');
    if (error || !data) return { on: false, at: null, ready: false };
    const d = data as { on: boolean; at: string | null };
    return { on: !!d.on, at: d.at, ready: true };
  },
  async set(on: boolean): Promise<{ on: boolean; at: string | null }> {
    const { data, error } = await supabase.rpc('set_found_later', { p_on: on });
    if (error) throw needsMigration29(error) ? new Error('This switch needs the latest database update (migration 29).') : error;
    return data as { on: boolean; at: string | null };
  },
};
