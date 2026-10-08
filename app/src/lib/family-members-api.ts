// Supabase calls for family members (migrations 30 and 32). Reads are guarded so the screens render before migration 30 is
// run: the list falls back to family_parents (everyone a parent), links come back 'unknown'.
import { api } from './data';
import type { FamilyMembers, MemberLinkDetails, MemberLinkPreview, MemberRole, Relation } from './family-members';
import { supabase } from './supabase';

/** Migration 30 hasn't been run yet. */
export function needsMigration30(e: unknown) {
  const m = typeof e === 'object' && e && 'message' in e ? String((e as { message: unknown }).message) : String(e ?? '');
  return /family_members|member_invite|family_member|leave_family|set_member_role|schema cache|Could not find the function/i.test(m);
}

const NEEDS_30 = 'This needs the latest database update (migration 30).';
const NEEDS_32 = 'This needs the latest database update (migration 32).';

/** Migration 32 (seats: owner, access levels, transfer) hasn't been run yet. */
export function needsMigration32(e: unknown) {
  const m = typeof e === 'object' && e && 'message' in e ? String((e as { message: unknown }).message) : String(e ?? '');
  return /set_member_access|transfer_family_ownership/i.test(m) && /schema cache|Could not find the function|does not exist/i.test(m);
}

function msg(e: unknown) {
  if (needsMigration32(e)) return new Error(NEEDS_32);
  return needsMigration30(e) ? new Error(NEEDS_30) : e instanceof Error ? e : new Error(String((e as { message?: string })?.message ?? e));
}

export const membersApi = {
  /** P78: members (and invites, for the owner). Before migration 30: every adult with full access, no invites, `ready: false`. */
  async list(familyId: string, myId: string): Promise<FamilyMembers & { ready: boolean }> {
    const { data, error } = await supabase.rpc('family_members', { p_family: familyId });
    if (!error && data) return { ...(data as FamilyMembers), ready: true };
    if (error && !needsMigration30(error)) throw error;
    const parents = await api.familyParents(familyId);
    return {
      ready: false,
      max: 4,
      my_role: 'parent',
      members: parents.map((p, i) => ({ user_id: p.id, name: p.full_name, role: 'parent' as const, relation: null, joined_at: '', me: p.id === myId, creator: i === 0 })),
      invites: [],
    };
  },
  /** P78b: makes the invite (first Send by text / Email / Copy link tap). role 'parent' = Full access, 'helper' = Read only. */
  async invite(familyId: string, f: { name: string; relation: Relation | ''; role: MemberRole; email: string }): Promise<{ id: string; link_token: string; expires_at: string }> {
    const { data, error } = await supabase.rpc('invite_family_member', {
      p_family: familyId,
      p_name: f.name.trim(),
      p_relation: f.relation || null,
      p_role: f.role,
      p_email: f.email.trim() || null,
    });
    if (error) throw msg(error);
    return data as { id: string; link_token: string; expires_at: string };
  },
  /** P78s: stamps sent_at once (and pushes an existing user with that email). */
  async sent(id: string) {
    const { error } = await supabase.rpc('member_invite_sent', { p_invite: id });
    if (error) throw msg(error);
  },
  /** Resend: the same link works 7 more days. */
  async resend(id: string): Promise<string> {
    const { data, error } = await supabase.rpc('resend_member_invite', { p_invite: id });
    if (error) throw msg(error);
    return data as string;
  },
  async cancel(id: string) {
    const { error } = await supabase.rpc('cancel_member_invite', { p_invite: id });
    if (error) throw msg(error);
  },
  /** P78c "Full access" switch (the owner). set_member_role (migration 30) takes the same values, so it works before 32. */
  async setRole(familyId: string, userId: string, role: MemberRole) {
    const { error } = await supabase.rpc('set_member_role', { p_family: familyId, p_user: userId, p_role: role });
    if (error) throw msg(error);
  },
  /** P78t "Make Sam the owner" (the owner, migration 32). */
  async transfer(familyId: string, userId: string) {
    const { error } = await supabase.rpc('transfer_family_ownership', { p_family: familyId, p_user: userId });
    if (error) throw msg(error);
  },
  /** P78c Remove (the owner). */
  async remove(familyId: string, userId: string) {
    const { error } = await supabase.rpc('remove_family_member', { p_family: familyId, p_user: userId });
    if (error) throw msg(error);
  },
  /** P78e Leave family (anyone but the owner, for themselves). */
  async leave(familyId: string) {
    const { error } = await supabase.rpc('leave_family', { p_family: familyId });
    if (error) throw msg(error);
  },
  /** M0: what anyone with the link may see (works signed out). 'unknown' when it can't be checked. */
  async preview(token: string): Promise<MemberLinkPreview> {
    const { data, error } = await supabase.rpc('member_invite_preview', { p_token: token });
    if (error || !data) return { status: 'unknown' };
    return data as MemberLinkPreview;
  },
  /** P78d: signed in. Throws the email-lock message ("This invite was sent to s•••@…"). */
  async details(token: string): Promise<MemberLinkDetails> {
    const { data, error } = await supabase.rpc('member_invite_details', { p_token: token });
    if (error) throw msg(error);
    return data as MemberLinkDetails;
  },
  /** P78d Join. Returns the family id. */
  async accept(token: string, yourName?: string): Promise<string> {
    const { data, error } = await supabase.rpc('accept_member_invite', { p_token: token, p_your_name: yourName?.trim() || null });
    if (error) throw msg(error);
    return data as string;
  },
};
