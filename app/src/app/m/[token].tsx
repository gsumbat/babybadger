import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';

import { FamilyClosed } from '@/components/familyLink';
import { JoinFamily, MemberLanding } from '@/components/memberLink';
import { Loading } from '@/components/ui';
import { isLinkToken, joinBlockCopy, memberClosedCopy, memberErrorText, type MemberLinkDetails, type MemberLinkPreview } from '@/lib/family-members';
import { membersApi } from '@/lib/family-members-api';
import { rememberPendingMemberLink, rememberSignupRole } from '@/lib/home-route';
import { useSession } from '@/lib/session';
import { errorText } from '@/lib/supabase';

// babybadger.app/m/<token>: a parent's invite to a family member (wireframes M0, P78d; P78b sends it). The token is the
// invite's 40-hex link token (migration 30); member_invite_preview shows only the family name and the inviter's first
// name. Works signed in or out (the route sits outside the guards in app/_layout.tsx).
//   * Signed out (web or app): M0. "Join the Lee family" keeps the link on the device and goes to sign-in (a new person
//     creates the account there); lib/home-route brings a signed-in person back here while the link is kept. No
//     onboarding, family setup or plans: the family's plan covers members.
//   * Signed in: P78d. Join -> accept_member_invite -> Home (a helper sees P4m). The email lock, "already in another
//     family" and sitter accounts get a clear page instead.
// In development the web preview can run the app flow with ?flow=app.
export default function MemberLink() {
  const params = useLocalSearchParams<{ token?: string; flow?: string }>();
  const token = isLinkToken(params.token) ? params.token : null;
  const { session, profile } = useSession();
  const [loaded, setLoaded] = useState<MemberLinkPreview>();
  const preview: MemberLinkPreview | undefined = token ? loaded : { status: 'not_found' };
  const webPage = Platform.OS === 'web' && !(__DEV__ && params.flow === 'app') && !session;

  useEffect(() => {
    if (!token) return;
    let live = true;
    membersApi.preview(token).then((p) => live && setLoaded(p));
    return () => {
      live = false;
    };
  }, [token, session?.user.id]);

  // Keep a usable link on the device until they join (or tap Not now); forget one that can't be used.
  const status = preview?.status;
  useEffect(() => {
    if (!status || status === 'unknown') return;
    if (token && !memberClosedCopy(status)) rememberPendingMemberLink(token);
    else rememberPendingMemberLink(null);
  }, [token, status]);

  if (!preview) return <Loading />;
  const join = () => {
    if (token && !memberClosedCopy(preview.status)) rememberPendingMemberLink(token);
    rememberSignupRole(null);
    router.push('/sign-in');
  };
  if (!session) return <MemberLanding token={token ?? ''} preview={preview} onJoin={join} onHaveApp={webPage ? undefined : () => router.push('/sign-in')} />;

  const closed = memberClosedCopy(token ? preview.status : 'not_found');
  if (closed || !token) return <FamilyClosed title={closed!.title} body={closed!.body} action={{ label: 'Go to Home', onPress: leave }} />;
  // Just signed in: wait for the profile.
  if (profile?.id !== session.user.id) return <Loading />;
  return <Join token={token} />;
}

/** Forget the link and go Home (onboarding for someone without a family yet). */
function leave() {
  rememberPendingMemberLink(null);
  router.replace('/');
}

/** P78d (signed in). */
function Join({ token }: { token: string }) {
  const { refresh, profile } = useSession();
  const [d, setD] = useState<MemberLinkDetails>();
  const [lock, setLock] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    let live = true;
    membersApi
      .details(token)
      .then((x) => live && setD(x))
      .catch((e) => live && setLock(memberErrorText(errorText(e))));
    return () => {
      live = false;
    };
  }, [token]);

  // The email lock ("This invite was sent to s•••@example.com…").
  if (lock) return <FamilyClosed title="This invite is for someone else" body={lock} action={{ label: 'Go to Home', onPress: leave }} />;
  if (!d) return <Loading />;
  const closed = memberClosedCopy(d.status);
  if (closed) return <FamilyClosed title={closed.title} body={closed.body} action={{ label: 'Go to Home', onPress: leave }} />;
  const blocked = joinBlockCopy(d.block, d.family_name);
  if (blocked) return <FamilyClosed title={blocked.title} body={blocked.body} action={{ label: 'Go to Home', onPress: leave }} />;

  async function accept() {
    setBusy(true);
    setErr('');
    try {
      await membersApi.accept(token, profile?.full_name ? undefined : d?.name);
      rememberPendingMemberLink(null);
      await refresh();
      router.replace('/parent');
    } catch (e) {
      setErr(memberErrorText(errorText(e)));
      setBusy(false);
    }
  }

  return <JoinFamily d={d} busy={busy} err={err} onJoin={accept} onNotNow={leave} onBack={() => (router.canGoBack() ? router.back() : leave())} />;
}
