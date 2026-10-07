import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';

import { InviteReview } from '@/components/InviteReview';
import { ClosedPage, ConfirmEmail, CreateAccount, LinkLanding, useCountdown } from '@/components/inviteLink';
import { useInviteAnswer } from '@/components/JoinCode';
import { Loading } from '@/components/ui';
import { sitterProfileApi, uploadPhoto } from '@/lib/credentials';
import { rememberPendingInvite } from '@/lib/home-route';
import { closedCopy, fullName, isLinkToken, splitName, type LinkPreview } from '@/lib/invite-links';
import { inviteApi, type InvitePreview } from '@/lib/invites';
import { emailContact, RESEND_SECONDS, sendSignInCode, verifySignInCode } from '@/lib/otp';
import { useSession } from '@/lib/session';
import { errorText, supabase } from '@/lib/supabase';

// babybadger.app/i/<token>: the invite link a parent sends from P24 (wireframes S0a–S0e). The token is the invite's long
// random link_token (migration 28), never the 6-digit code; signed in, invite_code_for_link turns it into the code. Works signed in or out (the
// route sits outside the signed-in / signed-out guards in app/_layout.tsx).
//   * Web (the link opened in a browser): S0b, the landing page with the store buttons. S0b2 when the link can't be used.
//   * The app (universal link, babybadger://i/<token>, or the S0e push): signed out -> S0c Confirm your email (the token
//     is kept on the phone meanwhile) -> S0d Create your account for a new sitter -> S1 -> S27 -> S42 -> S2 (the same
//     answer logic as S51, components/JoinCode). A signed-in sitter goes straight to S1.
// In development the web preview can run the app flow with ?flow=app.
export default function InviteLink() {
  const params = useLocalSearchParams<{ token?: string; flow?: string }>();
  const token = isLinkToken(params.token) ? params.token : null;
  const web = Platform.OS === 'web' && !(__DEV__ && params.flow === 'app');
  const [loaded, setLoaded] = useState<LinkPreview>();
  const preview: LinkPreview | undefined = token ? loaded : { status: 'not_found' };

  useEffect(() => {
    if (!token) return;
    let live = true;
    inviteApi.linkPreview(token).then((p) => live && setLoaded(p));
    return () => {
      live = false;
    };
  }, [token]);

  // The page's link-preview tags (S0a) are in app/_layout.tsx (InviteHead), so they're in the exported HTML.
  if (web) return <LinkLanding token={token ?? ''} preview={preview} />;
  if (!preview) return <Loading />;
  return <AppFlow token={token} preview={preview} />;
}

/** The phone app's side of the link. */
function AppFlow({ token, preview }: { token: string | null; preview: LinkPreview }) {
  const { session, profile } = useSession();
  const closed = !token ? closedCopy('not_found') : closedCopy(preview.status);

  // Keep the link's token on the phone while she signs in; forget a link that can't be used.
  const parent = !!session && profile?.role === 'parent';
  useEffect(() => {
    if (token && !closed && !parent) rememberPendingInvite(token);
    else rememberPendingInvite(null);
  }, [token, closed, parent]);

  const home = () => router.replace('/');
  if (closed || !token) {
    const c = closed ?? closedCopy('not_found')!;
    return <ClosedPage title={c.title} body={c.body} action={session ? { label: 'Go to Home', onPress: home } : { label: 'Sign in', onPress: () => router.replace('/sign-in') }} />;
  }
  if (!session) return <SignedOut preview={preview} />;
  // Just signed in: wait for the profile so an existing sitter doesn't see S0d.
  if (profile?.id !== session.user.id) return <Loading />;
  if (profile?.role === 'parent')
    return (
      <ClosedPage
        note={false}
        title="This invite is for a sitter"
        body="You’re signed in as a parent. To join this family as a sitter, sign out and open the link again."
        action={{ label: 'Go to Home', onPress: home }}
      />
    );
  return <SignedIn token={token} preview={preview} />;
}

/** S0c: email, then the code. Signing in re-renders the flow as SignedIn. */
function SignedOut({ preview }: { preview: LinkPreview }) {
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [resendAt, setResendAt] = useState(0);
  const secondsLeft = useCountdown(resendAt);

  async function send() {
    setBusy(true);
    setErr('');
    try {
      await sendSignInCode(emailContact(email));
      setCode('');
      setResendAt(Date.now() + RESEND_SECONDS * 1000);
      setStep('code');
    } catch (e) {
      setErr(errorText(e));
    } finally {
      setBusy(false);
    }
  }

  async function verify() {
    setBusy(true);
    setErr('');
    try {
      await verifySignInCode(emailContact(email), code);
    } catch (e) {
      setErr(errorText(e));
      setBusy(false);
    }
  }

  return (
    <ConfirmEmail
      {...{ preview, step, email, setEmail, code, setCode, secondsLeft, busy, err }}
      onSend={send}
      onVerify={verify}
      onResend={send}
      onChange={() => {
        setErr('');
        setCode('');
        setStep('email');
      }}
      onBack={() => {
        if (step === 'code') {
          setErr('');
          setCode('');
          return setStep('email');
        }
        // The invite stays saved on the phone: after a normal sign-in the app comes back to it.
        if (router.canGoBack()) router.back();
        else router.replace('/sign-in');
      }}
    />
  );
}

/** S0d for a new sitter, then S1 for the code. */
function SignedIn({ token, preview }: { token: string; preview: LinkPreview }) {
  const { session, profile, refresh, signOut } = useSession();
  const uid = session!.user.id;
  const isNew = profile?.role !== 'sitter';
  const [first0, last0] = splitName(profile?.full_name);
  const [first, setFirst] = useState(first0);
  const [last, setLast] = useState(last0);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [named, setNamed] = useState(!isNew);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [invite, setInvite] = useState<{ code: string; preview: InvitePreview } | null>(null);
  const [closed, setClosed] = useState<{ title: string; body: string; note?: boolean; wrongEmail?: boolean } | null>(null);
  const answer = useInviteAnswer();
  const name = fullName(first, last) || profile?.full_name || '';

  // The link -> its 6-digit code -> the signed-in preview (S1; marks the invite opened for the parent's P25). Done
  // before S0d, so someone signed in with the wrong email finds out before making an account.
  useEffect(() => {
    let live = true;
    (async () => {
      const link = await inviteApi.codeForLink(token);
      if (!link.code) throw new Error(link.status);
      return { code: link.code, preview: await inviteApi.preview(link.code) };
    })()
      .then((r) => live && setInvite(r))
      .catch((e) => {
        if (!live) return;
        const msg = errorText(e);
        // Sent to another email (migration 28): keep the link so signing in with the right email comes back here.
        if (/^This invite was sent to/.test(msg)) return setClosed({ title: 'This invite is for another email', body: msg, note: false, wrongEmail: true });
        rememberPendingInvite(null);
        setClosed(
          /expired/i.test(msg)
            ? closedCopy('expired')
            : /parent in this family/i.test(msg)
              ? { title: 'This is your family’s invite', body: 'Send the link to your sitter. She opens it on her phone.', note: false }
              : /not_found/i.test(msg)
                ? closedCopy('not_found')
                : /closed/i.test(msg)
                  ? closedCopy('closed')
                  : /not found|already used|used/i.test(msg)
                    ? closedCopy('used')
                    : { title: 'We couldn’t open this invite', body: msg, note: false },
        );
      });
    return () => {
      live = false;
    };
  }, [token]);

  async function saveAccount() {
    setBusy(true);
    setErr('');
    try {
      const { error } = await supabase.from('profiles').update({ full_name: name }).eq('id', uid);
      if (error) throw error;
      if (photoUri) {
        const path = await uploadPhoto(uid, photoUri);
        await sitterProfileApi.save(uid, { photo_path: path });
      }
      await refresh();
      setNamed(true);
    } catch (e) {
      setErr(errorText(e));
    } finally {
      setBusy(false);
    }
  }

  if (closed)
    return (
      <ClosedPage
        title={closed.title}
        body={closed.body}
        note={closed.note}
        action={closed.wrongEmail ? { label: 'Use another email', onPress: signOut } : { label: 'Go to Home', onPress: () => router.replace('/') }}
      />
    );
  if (!invite) return <Loading />;
  if (!named)
    return (
      <CreateAccount
        familyName={preview.family_name}
        email={session?.user.email ?? ''}
        {...{ first, last, setFirst, setLast, photoUri, setPhotoUri, busy, err }}
        onDone={saveAccount}
        onBack={signOut}
      />
    );
  return (
    <InviteReview
      invite={invite.preview}
      onAccept={() => answer.accept(invite.code, name)}
      onDecline={async () => {
        if (await answer.decline(invite.code)) router.replace('/');
      }}
      busy={answer.busy}
      err={answer.err}
    />
  );
}
