import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';

import { ConnectSitter, FamilyClosed, FamilyLanding } from '@/components/familyLink';
import { useInviteChoices } from '@/components/InviteAccess';
import { Loading } from '@/components/ui';
import { api, useQuery } from '@/lib/data';
import { claimErrorText, familyClosedCopy, isLinkToken, type FamilyLinkPreview } from '@/lib/family-links';
import { familyLinkApi } from '@/lib/family-referrals';
import { firstName } from '@/lib/format';
import { rememberPendingFamilyLink, rememberSignupRole } from '@/lib/home-route';
import { useSession } from '@/lib/session';
import { errorText } from '@/lib/supabase';

// babybadger.app/f/<token>: a sitter's invite to a family she already sits for (wireframes S0f, P3d; S52 sends it).
// The token is the referral's 40-hex token (migration 29); family_referral_preview shows only her first name and
// initial. Works signed in or out (the route sits outside the guards in app/_layout.tsx).
//   * Signed out (web or app): S0f. Start free trial keeps the link on the device and goes to parent sign-up
//     (P0 with role=parent) -> onboarding (family) -> P2 -> back here; "I already have BabyBadger" opens the app (web)
//     or sign-in (app). lib/home-route brings a signed-in parent back here while the link is kept.
//   * A parent with a family: P3d Connect with Maya. Connect makes the normal invite for her (claim_family_referral):
//     she gets a push, accepts it the usual way (S1 -> S27 -> S42 -> S2); the parent lands on P25.
//   * A sitter: her own link says so; anyone else's says it's for a family.
// In development the web preview can run the app flow with ?flow=app.
export default function FamilyLink() {
  const params = useLocalSearchParams<{ token?: string; flow?: string }>();
  const token = isLinkToken(params.token) ? params.token : null;
  const { session, profile, family } = useSession();
  const [loaded, setLoaded] = useState<FamilyLinkPreview>();
  const preview: FamilyLinkPreview | undefined = token ? loaded : { status: 'not_found' };
  const webPage = Platform.OS === 'web' && !(__DEV__ && params.flow === 'app') && !session;

  useEffect(() => {
    if (!token) return;
    let live = true;
    familyLinkApi.preview(token).then((p) => live && setLoaded(p));
    return () => {
      live = false;
    };
  }, [token, session?.user.id]);

  const closed = preview ? familyClosedCopy(preview.status) : null;
  const isSitter = profile?.role === 'sitter';
  // Keep a usable link on the device until the parent connects (or taps Not now); forget one that can't be used.
  const status = preview?.status;
  useEffect(() => {
    if (!status || status === 'unknown') return;
    if (token && !familyClosedCopy(status) && !isSitter) rememberPendingFamilyLink(token);
    else if (familyClosedCopy(status)) rememberPendingFamilyLink(null);
  }, [token, status, isSitter]);

  if (!preview) return <Loading />;
  const start = () => {
    if (token && !closed) rememberPendingFamilyLink(token);
    rememberSignupRole('parent');
    router.push({ pathname: '/sign-in', params: { role: 'parent' } });
  };
  if (!session) return <FamilyLanding token={token ?? ''} preview={preview} onStart={start} onHaveApp={webPage ? undefined : () => router.push('/sign-in')} />;

  const home = () => router.replace('/');
  if (closed || !token) {
    const c = closed ?? familyClosedCopy('not_found')!;
    return <FamilyClosed title={c.title} body={c.body} action={{ label: 'Go to Home', onPress: home }} />;
  }
  // Just signed in: wait for the profile.
  if (profile?.id !== session.user.id) return <Loading />;
  if (isSitter)
    return preview.mine ? (
      <FamilyClosed title="This is your family link" body="Send it to a family you sit for. When they join, you’ll review their invite." action={{ label: 'Go to Home', onPress: home }} />
    ) : (
      <FamilyClosed title="This invite is for a family" body="You’re signed in as a sitter. A parent opens this link to connect with their sitter." action={{ label: 'Go to Home', onPress: home }} />
    );
  // Signed in without a family yet: onboarding first (it starts on "Set up your family"); index brings her back here.
  if (profile?.role !== 'parent' || !family) return <Redirect />;
  return <Connect token={token} preview={preview} familyId={family.id} />;
}

/** Signed in, no family yet: go through onboarding (it reads the kept link and starts on the family form). */
function Redirect() {
  useEffect(() => {
    rememberSignupRole('parent');
    router.replace('/');
  }, []);
  return <Loading />;
}

/** P3d. */
function Connect({ token, preview, familyId }: { token: string; preview: FamilyLinkPreview; familyId: string }) {
  const { data } = useQuery(async () => {
    const [kids, parents] = await Promise.all([api.kids(familyId), api.familyParents(familyId)]);
    return { kids, parents };
  }, [familyId]);
  const c = useInviteChoices(data?.kids);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const sitter = preview.sitter_first?.trim() || 'Your sitter';
  if (!data) return <Loading />;
  const parentNames = data.parents.map((p) => firstName(p.full_name)).join(' and ');

  const leave = () => {
    rememberPendingFamilyLink(null);
    router.replace('/parent');
  };

  async function connect() {
    setBusy(true);
    setErr('');
    try {
      const r = await familyLinkApi.claim(token, familyId, c.choices());
      rememberPendingFamilyLink(null);
      router.replace('/parent');
      router.push({ pathname: '/parent/invite/[id]', params: { id: r.invite_id } });
    } catch (e) {
      setErr(claimErrorText(errorText(e), sitter));
      setBusy(false);
    }
  }

  return (
    <ConnectSitter
      preview={preview}
      choices={c}
      parentNames={parentNames}
      busy={busy}
      err={err}
      onConnect={connect}
      onNotNow={leave}
      onBack={() => (router.canGoBack() ? router.back() : leave())}
    />
  );
}
