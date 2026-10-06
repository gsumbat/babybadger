import type { Session } from '@supabase/supabase-js';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { unregisterPush } from './push';
import { isConfigured, supabase } from './supabase';
import type { Family, Profile, SitterLink } from './types';

type SessionState = {
  loading: boolean;
  configured: boolean;
  session: Session | null;
  profile: Profile | null;
  /** Parent: the family you run. */
  family: Family | null;
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
  const [sitterLinks, setSitterLinks] = useState<SessionState['sitterLinks']>([]);
  const [loading, setLoading] = useState(isConfigured);

  const load = useCallback(async (s: Session | null) => {
    if (!s) {
      setProfile(null);
      setFamily(null);
      setSitterLinks([]);
      return;
    }
    const uid = s.user.id;
    const [{ data: prof }, { data: parentOf }, { data: links }] = await Promise.all([
      supabase.from('profiles').select('id, full_name, role, alert_logs').eq('id', uid).maybeSingle(),
      supabase.from('family_parents').select('family:families(id, name)').eq('user_id', uid).limit(1),
      supabase.from('family_sitters').select('family_id, sitter_id, status, joined_at, family:families(id, name)').eq('sitter_id', uid).neq('status', 'removed'),
    ]);
    setProfile((prof as Profile) ?? { id: uid, full_name: '', role: null });
    const fam = parentOf?.[0]?.family as unknown as Family | undefined;
    setFamily(fam ?? null);
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
      sitterLinks,
      refresh: () => load(session),
      signOut: async () => {
        await unregisterPush().catch(() => {});
        await supabase.auth.signOut();
      },
    }),
    [loading, session, profile, family, sitterLinks, load],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSession() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useSession must be used inside SessionProvider');
  return v;
}
