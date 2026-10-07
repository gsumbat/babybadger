import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { BackHandler, Pressable, StyleSheet, View } from 'react-native';
import { KeyboardAwareScrollView, KeyboardStickyView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SvgXml } from 'react-native-svg';

import { Banner, Button, ErrorText, Field, Screen } from '@/components/ui';
import { isRole, rememberSignupRole } from '@/lib/home-route';
import { useSession } from '@/lib/session';
import { errorText, supabase } from '@/lib/supabase';
import { cardShadow, color, font } from '@/theme';
import { Text, TextInput } from '@/components/Text';

// Email one-time code: Supabase sends 6 digits. Swap to phone OTP once Twilio is connected in Supabase.
const CODE_LENGTH = 6;
const RESEND_SECONDS = 60;
const KEYBOARD_TOOLBAR = 42; // height of the Done bar above the keyboard (see _layout)

// Wireframe P0b mail icon.
const MAIL = '<svg width="22" height="22" viewBox="0 0 24 24" style="flex-shrink: 0; fill: none; stroke: #47698A; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round"><rect x="3" y="5" width="18" height="14" rx="2"></rect><path d="M3.5 6.5l8.5 6.5 8.5-6.5"></path></svg>';

/** Wireframes P0 Sign in (email) and P0b Sign-in code. `?role=` comes from P1 Welcome when signing up. */
export default function SignIn() {
  const { configured } = useSession();
  const params = useLocalSearchParams<{ role?: string }>();
  const role = isRole(params.role) ? params.role : null;
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [resendAt, setResendAt] = useState(0); // time the Resend link unlocks
  const [now, setNow] = useState(() => Date.now());

  const validEmail = /\S+@\S+\.\S+/.test(email.trim());
  const secondsLeft = Math.max(0, Math.ceil((resendAt - now) / 1000));

  // Countdown tick while the resend wait runs.
  useEffect(() => {
    if (step !== 'code' || resendAt <= Date.now()) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [step, resendAt]);

  // Android back on the code step returns to the email step (same as the back button and "Change").
  useEffect(() => {
    if (step !== 'code') return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      setErr('');
      setCode('');
      setStep('email');
      return true;
    });
    return () => sub.remove();
  }, [step]);

  function toEmail() {
    setErr('');
    setCode('');
    setStep('email');
  }

  function toCode() {
    setErr('');
    setStep('code');
  }

  async function sendCode() {
    setBusy(true);
    setErr('');
    const { error } = await supabase.auth.signInWithOtp({ email: email.trim(), options: { shouldCreateUser: true } });
    setBusy(false);
    if (error) return setErr(errorText(error));
    setCode('');
    setNow(Date.now());
    setResendAt(Date.now() + RESEND_SECONDS * 1000);
    toCode();
  }

  async function verify() {
    setBusy(true);
    setErr('');
    // Saved before verifying: a good code signs in and this screen goes away right away.
    rememberSignupRole(role);
    const { error } = await supabase.auth.verifyOtp({ email: email.trim(), token: code, type: 'email' });
    setBusy(false);
    if (error) setErr(errorText(error));
  }

  if (step === 'code') return <CodeStep {...{ email, code, setCode, busy, err, secondsLeft, verify, resend: sendCode, back: toEmail }} />;

  return (
    <EmailStep
      {...{ email, setEmail, busy, err, configured }}
      canSend={validEmail && configured}
      send={sendCode}
      haveCode={() => (validEmail ? toCode() : setErr('Type your email first.'))}
      getStarted={() => router.push('/welcome')}
    />
  );
}

// Wireframe P0.
function EmailStep({
  email,
  setEmail,
  busy,
  err,
  configured,
  canSend,
  send,
  haveCode,
  getStarted,
}: {
  email: string;
  setEmail: (v: string) => void;
  busy: boolean;
  err: string;
  configured: boolean;
  canSend: boolean;
  send: () => void;
  haveCode: () => void;
  getStarted: () => void;
}) {
  const insets = useSafeAreaInsets();
  const [footerH, setFooterH] = useState(0);
  return (
    <View style={st.screen}>
      <KeyboardAwareScrollView
        bottomOffset={footerH + KEYBOARD_TOOLBAR + 16}
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive">
        {/* Hero runs under the status bar; below it the content sits as in the wireframe. */}
        <View style={[st.hero, { height: 330 + insets.top, paddingTop: 40 + insets.top }]}>
          <Image source={require('@/assets/images/badger-mascot.png')} style={{ width: 140, height: 171 }} contentFit="contain" accessibilityLabel="BabyBadger mascot waving" />
          <Text style={st.word}>BabyBadger</Text>
        </View>
        <View style={st.body}>
          <Text style={st.title}>Welcome back</Text>
          <Text style={st.lead}>Sign in with your email. We’ll send you a code, no password needed.</Text>
          <Field
            label="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            textContentType="emailAddress"
            placeholder="you@example.com"
            returnKeyType="send"
            onSubmitEditing={() => canSend && !busy && send()}
          />
          {!configured && <Banner kind="warn" icon="alert-triangle">Supabase isn’t set up yet. Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY to app/.env (see README).</Banner>}
          <ErrorText>{err}</ErrorText>
        </View>
      </KeyboardAwareScrollView>
      <KeyboardStickyView offset={{ closed: 0, opened: -KEYBOARD_TOOLBAR + 16 }}>
        <View style={[st.footer, { paddingBottom: Math.max(insets.bottom, 32) }]} onLayout={(e) => setFooterH(e.nativeEvent.layout.height)}>
          <Button label="Send me a code" onPress={send} busy={busy} disabled={!canSend} />
          <View style={st.links}>
            <Text accessibilityRole="link" style={st.link} onPress={haveCode}>
              I already have a code
            </Text>
            <Text accessibilityRole="link" style={st.link} onPress={getStarted}>
              New here? Get started
            </Text>
          </View>
          {/* Development builds only: the test accounts (Jen Lee / Maya) can't receive the email code. */}
          {__DEV__ && (
            <Text accessibilityRole="link" style={[st.link, { alignSelf: 'center', color: color.ink2 }]} onPress={() => router.push('/dev-login')}>
              Test accounts
            </Text>
          )}
        </View>
      </KeyboardStickyView>
    </View>
  );
}

// Wireframe P0b.
function CodeStep({
  email,
  code,
  setCode,
  busy,
  err,
  secondsLeft,
  verify,
  resend,
  back,
}: {
  email: string;
  code: string;
  setCode: (v: string) => void;
  busy: boolean;
  err: string;
  secondsLeft: number;
  verify: () => void;
  resend: () => void;
  back: () => void;
}) {
  const input = useRef<TextInput>(null);
  const m = Math.floor(secondsLeft / 60);
  const s = String(secondsLeft % 60).padStart(2, '0');
  return (
    <Screen title="Check your email" back onBack={back} gap={16} footer={<Button label="Sign in" onPress={verify} busy={busy} disabled={code.length < CODE_LENGTH} />}>
      <View style={[st.card, { marginTop: 4 }]}>
        <View style={st.cardIcon}>
          <SvgXml xml={MAIL} width={22} height={22} style={{ flexShrink: 0 }} />
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={st.cardTitle}>Code sent to</Text>
          <Text style={st.cardEmail} numberOfLines={1}>
            {email.trim()}
          </Text>
        </View>
        <Text accessibilityRole="link" style={[st.link, { flexShrink: 0 }]} onPress={back}>
          Change
        </Text>
      </View>
      <Text style={st.hint}>Type the 6-digit code from the email. It works for 1 hour.</Text>
      {/* Six boxes show the digits; one invisible field on top takes the typing, paste and code autofill. */}
      <Pressable onPress={() => input.current?.focus()} style={st.boxes}>
        {Array.from({ length: CODE_LENGTH }, (_, i) => (
          <View key={i} style={[st.box, { borderColor: i < code.length ? color.primary : color.line }]}>
            <Text style={st.digit}>{code[i] ?? ''}</Text>
          </View>
        ))}
        <TextInput
          ref={input}
          value={code}
          onChangeText={(t) => setCode(t.replace(/\D/g, '').slice(0, CODE_LENGTH))}
          keyboardType="number-pad"
          autoComplete="one-time-code"
          textContentType="oneTimeCode"
          maxLength={CODE_LENGTH}
          autoFocus
          caretHidden
          accessibilityLabel="6-digit code"
          style={st.hiddenInput}
        />
      </Pressable>
      <View style={st.links}>
        {secondsLeft > 0 ? (
          <Text style={st.status}>
            Didn’t get it? Resend in {m}:{s}
          </Text>
        ) : (
          <Text style={st.status}>
            Didn’t get it?{' '}
            <Text accessibilityRole="link" style={st.resend} onPress={busy ? undefined : resend}>
              Resend
            </Text>
          </Text>
        )}
        <Text style={st.status}>Check spam too</Text>
      </View>
      <ErrorText>{err}</ErrorText>
    </Screen>
  );
}

const st = StyleSheet.create({
  screen: { flex: 1, backgroundColor: color.canvas },
  // P0 hero: 330 tall below the status bar, mascot 140x171, wordmark 34.
  hero: { flexShrink: 0, alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: color.primary, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 },
  word: { fontFamily: font.display, fontSize: 34, color: '#FFFFFF', marginVertical: -10.23 },
  body: { flexGrow: 1, gap: 14, paddingTop: 24, paddingHorizontal: 24 },
  title: { fontFamily: font.display, fontSize: 28, color: color.ink, marginVertical: -5.43 },
  lead: { fontFamily: font.body, fontSize: 16, lineHeight: 23, color: color.ink2, marginTop: -8 },
  footer: { gap: 14, paddingTop: 16, paddingHorizontal: 24, backgroundColor: color.canvas },
  links: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  link: { flexShrink: 1, fontFamily: font.bodySemi, fontSize: 14, color: color.primary, textDecorationLine: 'underline' },
  card: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, backgroundColor: '#FFFFFF', borderRadius: 24, ...cardShadow },
  cardIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: color.primaryTint, alignItems: 'center', justifyContent: 'center' },
  cardTitle: { fontFamily: font.bodyBold, fontSize: 14, color: color.ink },
  cardEmail: { fontFamily: font.body, fontSize: 15, color: color.ink2 },
  hint: { fontFamily: font.body, fontSize: 15, lineHeight: 22, color: color.ink2 },
  boxes: { flexDirection: 'row', gap: 8 },
  box: { flex: 1, minWidth: 0, height: 58, borderRadius: 12, borderWidth: 2, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  digit: { fontFamily: font.display, fontSize: 28, color: color.ink },
  hiddenInput: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, opacity: 0.01, color: 'transparent' },
  status: { flexShrink: 1, fontFamily: font.body, fontSize: 14, color: color.ink2 },
  resend: { fontFamily: font.bodySemi, color: color.primary, textDecorationLine: 'underline' },
});
