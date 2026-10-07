import type { Session } from '@supabase/supabase-js';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { unregisterPush } from './push';
import { isConfigured, supabase } from './supabase';
import type { MemberRole } from './family-members';
import type { Family, Profile, SitterLink } from './types';

type SessionState = {
  loading: boolean;
  configured: boolean;
  session: Session | null;
  profile: Profile | null;
  /** Parent or family helper: the family you belong to. */
  family: Family | null;
  /** Your role in that family (migration 30): 'parent' runs it, 'helper' (e.g. grandma) watches and messages. */
  familyRole: MemberRole;
  /** Sitter: families you joined (any status). */
  sitterLinks: (SitterLink & { family: Family })[];
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
};

const Ctx = createContext<SessionState | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [family, setFamily] = useState<Family | null>(null);
  const [familyRole, setFamilyRole] = useState<MemberRole>('parent');
  const [sitterLinks, setSitterLinks] = useState<SessionState['sitterLinks']>([]);
  const [loading, setLoading] = useState(isConfigured);

  const load = useCallback(async (s: Session | null) => {
    if (!s) {
      setProfile(null);
      setFamily(null);
      setFamilyRole('parent');
      setSitterLinks([]);
      return;
    }
    const uid = s.user.id;
    const [{ data: prof }, { data: parentOf }, { data: links }] = await Promise.all([
      // alert_arrivals arrives with migration 21; until it's run the select without it is used.
      supabase
        .from('profiles')
        .select('id, full_name, role, alert_logs, alert_arrivals')
        .eq('id', uid)
        .maybeSingle()
        .then((r) => (r.error ? supabase.from('profiles').select('id, full_name, role, alert_logs').eq('id', uid).maybeSingle() : r)),
      // role arrives with migration 30; until it's run every adult is a parent.
      supabase
        .from('family_parents')
        .select('role, family:families(id, name)')
        .eq('user_id', uid)
        .limit(1)
        .then((r) => (r.error ? supabase.from('family_parents').select('family:families(id, name)').eq('user_id', uid).limit(1) : r)),
      supabase.from('family_sitters').select('family_id, sitter_id, status, joined_at, family:families(id, name)').eq('sitter_id', uid).neq('status', 'removed'),
    ]);
    setProfile((prof as Profile) ?? { id: uid, full_name: '', role: null });
    const fam = parentOf?.[0]?.family as unknown as Family | undefined;
    setFamily(fam ?? null);
    setFamilyRole((parentOf?.[0] as { role?: string } | undefined)?.role === 'helper' ? 'helper' : 'parent');
    setSitterLinks(((links ?? []) as unknown as SessionState['sitterLinks']).filter((l) => l.family));
  }, []);

  useEffect(() => {
    if (!isConfigured) return;
    supabase.auth.getSession().then(async ({ data }) => {
      setSession(data.session);
      await load(data.session);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      load(s);
    });
    return () => sub.subscription.unsubscribe();
  }, [load]);

  const value = useMemo<SessionState>(
    () => ({
      loading,
      configured: isConfigured,
      session,
      profile,
      family,
      familyRole,
      sitterLinks,
      refresh: () => load(session),
      signOut: async () => {
        await unregisterPush().catch(() => {});
        await supabase.auth.signOut();
      },
    }),
    [loading, session, profile, family, familyRole, sitterLinks, load],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSession() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useSession must be used inside SessionProvider');
  return v;
}
