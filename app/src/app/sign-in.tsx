import { useState } from 'react';
import { Text, View } from 'react-native';

import { Banner, Button, ErrorText, Field, Screen, T } from '@/components/ui';
import { useSession } from '@/lib/session';
import { errorText, supabase } from '@/lib/supabase';
import { color, font } from '@/theme';

// Email one-time code: works without SMS setup. Swap to phone OTP once Twilio is connected in Supabase.
export default function SignIn() {
  const { configured } = useSession();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const validEmail = /\S+@\S+\.\S+/.test(email);

  async function sendCode() {
    setBusy(true);
    setErr('');
    const { error } = await supabase.auth.signInWithOtp({ email: email.trim(), options: { shouldCreateUser: true } });
    setBusy(false);
    if (error) setErr(errorText(error));
    else setSent(true);
  }

  async function verify() {
    setBusy(true);
    setErr('');
    const { error } = await supabase.auth.verifyOtp({ email: email.trim(), token: code.trim(), type: 'email' });
    setBusy(false);
    if (error) setErr(errorText(error));
  }

  return (
    <Screen
      footer={
        sent ? (
          <>
            <Button label="Sign in" onPress={verify} busy={busy} disabled={code.trim().length < 6} />
            <Button label="Use a different email" kind="ghost" onPress={() => setSent(false)} />
          </>
        ) : (
          <>
            <Button label="Send me a code" onPress={sendCode} busy={busy} disabled={!validEmail || !configured} />
            <Button label="I already have a code" kind="ghost" disabled={!validEmail} onPress={() => setSent(true)} />
          </>
        )
      }>
      <View style={{ height: 40 }} />
      <Text style={{ fontFamily: font.display, fontSize: 40, color: color.primary }}>BabyBadger</Text>
      <T variant="title">Know they’re safe, without hovering.</T>
      <T variant="muted">Parents see where the sitter and kids are during a shift. Sitters share location only while clocked in.</T>
      <View style={{ height: 16 }} />
      {!configured && <Banner kind="warn" icon="alert-triangle">Supabase isn’t set up yet. Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY to app/.env (see README).</Banner>}
      {sent ? (
        <>
          <T>Enter the latest code we emailed to {email}.</T>
          <Field label="Code" value={code} onChangeText={(t) => setCode(t.replace(/\D/g, ""))} keyboardType="number-pad" autoComplete="one-time-code" maxLength={10} placeholder="Code from the email" />
        </>
      ) : (
        <Field label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoComplete="email" placeholder="you@example.com" />
      )}
      <ErrorText>{err}</ErrorText>
    </Screen>
  );
}
