import { Image } from 'expo-image';
import Head from 'expo-router/head';
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Linking, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { kidShade } from '@/components/bits';
import { Text, TextInput } from '@/components/Text';
import { Button, ErrorText, Field, Icon, Screen } from '@/components/ui';
import { cardTitle, closedCopy, familyPlural, inviteAppUrl, landingTitle, storeButton, type LinkPreview, type LinkStatus } from '@/lib/invite-links';
import { CODE_LENGTH } from '@/lib/otp';
import { cardShadow, color, font } from '@/theme';

// Wireframes S0b Invite link (web page), S0b2 link that can't be used, S0c Confirm your email, S0d Create your
// account. The route is app/i/[token].tsx.

/**
 * S0a link preview (iMessage, WhatsApp…): title, text and picture for babybadger.app/i/<token>. Rendered by the root
 * layout so the tags are in the exported HTML even while the app is still loading. Static: the family's name
 * ("Join the Lee family on BabyBadger") would need the page made on the server for each link.
 */
export function InviteHead() {
  return (
    <Head>
      <title>Join your family on BabyBadger</title>
      <meta name="description" content="A family invited you to sit. Open the invite in the BabyBadger app." />
      <meta property="og:title" content="Join your family on BabyBadger" />
      <meta property="og:description" content="A family invited you to sit. Open the invite in the BabyBadger app." />
      <meta property="og:site_name" content="BabyBadger" />
      <meta property="og:type" content="website" />
      <meta property="og:image" content="https://babybadger.app/og.png" />
    </Head>
  );
}

/** S0b / S0c invite card: parent + kid faces, "Invite from the Lee family", "Saved · waiting for you", Saved pill. */
export function InviteCard({ preview }: { preview: LinkPreview }) {
  return (
    <View style={st.card}>
      <View style={{ flexDirection: 'row' }}>
        <View style={[st.face, { backgroundColor: color.ink }]}>
          <Text style={st.faceText}>{preview.invited_by_initials || (preview.family_name ?? 'B').replace(/^The /, '')[0]?.toUpperCase()}</Text>
        </View>
        {(preview.kids ?? []).map((k, i) => (
          <View key={i} style={[st.face, { marginLeft: -10, backgroundColor: kidShade(k.color ?? undefined) }]}>
            <Text style={st.faceText}>{k.name[0]?.toUpperCase()}</Text>
          </View>
        ))}
      </View>
      <View style={{ flexGrow: 1, flexShrink: 1, minWidth: 0 }}>
        <Text style={st.cardTitle}>{cardTitle(preview.family_name)}</Text>
        <Text style={st.cardSub}>Saved · waiting for you</Text>
      </View>
      <View style={st.pill}>
        <View style={st.pillDot} />
        <Text style={st.pillText}>Saved</Text>
      </View>
    </View>
  );
}

/** Web page frame: the wireframe's 390 px column, centred on wide screens. */
function Page({ children }: { children: ReactNode }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={st.page}>
      <View style={[st.column, { paddingTop: 28 + insets.top, paddingBottom: Math.max(16, insets.bottom) }]}>
        <Text style={st.word}>BabyBadger</Text>
        {children}
      </View>
    </View>
  );
}

/** S0b: the page babybadger.app/i/<token> shows in the phone's browser. `preview` undefined while it loads. */
export function LinkLanding({ token, preview }: { token: string; preview: LinkPreview | undefined }) {
  const p = preview ?? { status: 'unknown' as LinkStatus };
  const closed = closedCopy(p.status);
  if (closed) return <ClosedPage title={closed.title} body={closed.body} />;
  const ios = storeButton('ios');
  const android = storeButton('android');
  const anyStore = !!(ios.url || android.url);
  return (
    <Page>
      <View style={{ gap: 6 }}>
        <Text style={st.h1}>{preview ? landingTitle(p) : ' '}</Text>
        <Text style={st.lead}>Get the app to see the details and accept. Your invite is saved for 7 days.</Text>
      </View>
      {preview ? <InviteCard preview={p} /> : <View style={[st.card, { height: 60 }]} />}
      <View style={{ gap: 10 }}>
        <StoreButton label={ios.label} url={ios.url} primary />
        <StoreButton label={android.label} url={android.url} />
      </View>
      <Text accessibilityRole="link" style={st.link} onPress={() => void Linking.openURL(inviteAppUrl(token)).catch(() => {})}>
        I already have BabyBadger
      </Text>
      <View style={{ flexGrow: 1 }} />
      <Text style={st.foot}>
        {anyStore
          ? 'After you install, tap the link in the message again and the app opens your invite.'
          : 'The app is almost ready. Keep the message: your invite works for 7 days.'}
      </Text>
    </Page>
  );
}

/** S0b download button. Without a store link (not live yet) it is the muted "Coming soon to …" box. */
function StoreButton({ label, url, primary }: { label: string; url: string | null; primary?: boolean }) {
  if (!url)
    return (
      <View accessibilityRole="text" style={[st.store, st.storeSoon]}>
        <Text style={[st.storeText, { color: color.ink2 }]}>{label}</Text>
      </View>
    );
  return (
    <Pressable accessibilityRole="link" onPress={() => void Linking.openURL(url)} style={[st.store, { backgroundColor: primary ? color.primary : color.primaryTint }]}>
      <Text style={[st.storeText, { color: primary ? '#FFFFFF' : color.primary }]}>{label}</Text>
    </Pressable>
  );
}

/** S0b2: a link that was used, expired or cancelled (web), or the same message in the app with a way on. */
export function ClosedPage({ title, body, action, note = true }: { title: string; body: string; action?: { label: string; onPress: () => void }; note?: boolean }) {
  return (
    <Page>
      <View style={{ gap: 6 }}>
        <Text style={st.h1}>{title}</Text>
        <Text style={st.lead}>{body}</Text>
      </View>
      {note ? (
        <View style={st.closedNote}>
          <Icon name="clock" size={22} tint={color.warnInk} />
          <Text style={st.closedText}>Invites work once and for 7 days, so an old link can’t open a family’s details.</Text>
        </View>
      ) : null}
      <View style={{ flexGrow: 1 }} />
      {action ? <Button label={action.label} onPress={action.onPress} /> : null}
    </Page>
  );
}

/** S0c Confirm your email: email, then the 6-digit code, under the invite card. */
export function ConfirmEmail({
  preview,
  step,
  email,
  setEmail,
  code,
  setCode,
  secondsLeft,
  busy,
  err,
  onSend,
  onVerify,
  onResend,
  onChange,
  onBack,
}: {
  preview: LinkPreview;
  step: 'email' | 'code';
  email: string;
  setEmail: (v: string) => void;
  code: string;
  setCode: (v: string) => void;
  secondsLeft: number;
  busy: boolean;
  err: string;
  onSend: () => void;
  onVerify: () => void;
  onResend: () => void;
  onChange: () => void;
  onBack: () => void;
}) {
  const input = useRef<TextInput>(null);
  const validEmail = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim());
  const m = Math.floor(secondsLeft / 60);
  const s = String(secondsLeft % 60).padStart(2, '0');
  return (
    <Screen
      title="Confirm your email"
      back
      onBack={onBack}
      gap={16}
      footer={
        step === 'email' ? (
          <Button label="Send me a code" onPress={onSend} busy={busy} disabled={!validEmail} />
        ) : (
          <Button label="Continue" onPress={onVerify} busy={busy} disabled={code.length < CODE_LENGTH} />
        )
      }>
      <View style={{ marginTop: 4 }}>
        <InviteCard preview={preview} />
      </View>
      {step === 'email' ? (
        <>
          <Text style={st.lead}>Type your email and we’ll send you a 6-digit code. No password needed.</Text>
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
            autoFocus
            onSubmitEditing={() => validEmail && !busy && onSend()}
          />
        </>
      ) : (
        <>
          <Text style={st.lead}>
            We emailed a 6-digit code to <Text style={st.leadBold}>{email.trim()}</Text>.
          </Text>
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
          <View style={st.row}>
            {secondsLeft > 0 ? (
              <Text style={st.status}>
                Didn’t get it? Resend in {m}:{s}
              </Text>
            ) : (
              <Text style={st.status}>
                Didn’t get it?{' '}
                <Text accessibilityRole="link" style={st.inlineLink} onPress={busy ? undefined : onResend}>
                  Resend
                </Text>
              </Text>
            )}
            <Text accessibilityRole="link" style={st.inlineLink} onPress={onChange}>
              Change email
            </Text>
          </View>
          <View style={st.amber}>
            <Text style={st.amberText}>
              <Text style={st.amberBold}>Check spam too.</Text> The code works for 1 hour. Use this email to sign in from now on.
            </Text>
          </View>
        </>
      )}
      <ErrorText>{err}</ErrorText>
    </Screen>
  );
}

/** S0d Create your account: photo, first and last name, the email she just confirmed. Face ID is left out. */
export function CreateAccount({
  familyName,
  email,
  first,
  last,
  setFirst,
  setLast,
  photoUri,
  setPhotoUri,
  busy,
  err,
  onDone,
  onBack,
}: {
  familyName: string | undefined;
  email: string;
  first: string;
  last: string;
  setFirst: (v: string) => void;
  setLast: (v: string) => void;
  photoUri: string | null;
  setPhotoUri: (v: string | null) => void;
  busy: boolean;
  err: string;
  onDone: () => void;
  onBack: () => void;
}) {
  const [pickErr, setPickErr] = useState('');
  async function pick() {
    setPickErr('');
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return setPickErr('Allow photos access in Settings to add a photo.');
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.6, allowsEditing: true, aspect: [1, 1] });
    if (!res.canceled) setPhotoUri(res.assets[0].uri);
  }
  return (
    <Screen title="Create your account" back onBack={onBack} gap={14} footer={<Button label="See my invite" onPress={onDone} busy={busy} disabled={first.trim().length < 1 || `${first}${last}`.trim().length < 2} />}>
      <Pressable accessibilityRole="button" accessibilityLabel="Add a photo" onPress={pick} style={{ flexDirection: 'row', alignItems: 'center', gap: 16, marginTop: 4 }}>
        {photoUri ? (
          <Image source={{ uri: photoUri }} style={st.photo} />
        ) : (
          <View style={[st.photo, st.photoEmpty]}>
            <Icon name="plus" size={26} tint={color.primary} />
          </View>
        )}
        <View style={{ gap: 2, flexShrink: 1 }}>
          <Text style={st.photoTitle}>{photoUri ? 'Change photo' : 'Add a photo'}</Text>
          <Text style={st.photoSub}>Families see it on your profile</Text>
        </View>
      </Pressable>
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Field label="First name" value={first} onChangeText={setFirst} autoCapitalize="words" autoComplete="given-name" textContentType="givenName" style={st.input48} />
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Field label="Last name" value={last} onChangeText={setLast} autoCapitalize="words" autoComplete="family-name" textContentType="familyName" style={st.input48} />
        </View>
      </View>
      <Field label="Email" value={email} editable={false} style={[st.input48, { backgroundColor: color.muted, color: color.ink2 }]} />
      <View style={st.later}>
        <Icon name="award" size={22} tint={color.primaryStrong} />
        <Text style={st.laterText}>Certifications, languages and background check come later, from your profile. {familyPlural(familyName)} will tell you what they need.</Text>
      </View>
      <ErrorText>{pickErr || err}</ErrorText>
    </Screen>
  );
}

/** Countdown for "Resend in 0:24". */
export function useCountdown(until: number) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (until <= Date.now()) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [until]);
  return Math.max(0, Math.ceil((until - now) / 1000));
}

// Values from wireframes S0b, S0c and S0d.
const st = StyleSheet.create({
  page: { flex: 1, backgroundColor: color.canvas, alignItems: 'center' },
  column: { flex: 1, width: '100%', maxWidth: 480, paddingHorizontal: 20, gap: 18 },
  word: { fontFamily: font.display, fontSize: 22, color: color.ink, marginVertical: -4.62 },
  h1: { fontFamily: font.display, fontSize: 28, lineHeight: 34, color: color.ink },
  lead: { fontFamily: font.body, fontSize: 15, lineHeight: 22, color: color.ink2 },
  leadBold: { fontFamily: font.bodyBold, color: color.ink },
  card: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, paddingHorizontal: 14, backgroundColor: '#FFFFFF', borderRadius: 24, ...cardShadow },
  face: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  faceText: { fontFamily: font.displayBold, fontSize: 16, color: '#FFFFFF' },
  cardTitle: { fontFamily: font.bodyBold, fontSize: 14, color: color.ink },
  cardSub: { fontFamily: font.body, fontSize: 12, color: color.ink2 },
  pill: { height: 26, paddingHorizontal: 10, borderRadius: 999, backgroundColor: color.okTint, flexDirection: 'row', alignItems: 'center', gap: 6, flexShrink: 0 },
  pillDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: color.ok },
  pillText: { fontFamily: font.bodyBold, fontSize: 12, color: color.okInk },
  store: { height: 54, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  storeSoon: { backgroundColor: color.muted },
  storeText: { fontFamily: font.displayBold, fontSize: 17 },
  link: { fontFamily: font.bodySemi, fontSize: 15, color: color.primary, textAlign: 'center', textDecorationLine: 'underline' },
  foot: { fontFamily: font.body, fontSize: 12, lineHeight: 17, color: color.ink2, textAlign: 'center' },
  closedNote: { flexDirection: 'row', gap: 12, padding: 14, backgroundColor: color.warnTint, borderRadius: 14 },
  closedText: { flexShrink: 1, fontFamily: font.body, fontSize: 14, lineHeight: 20, color: color.ink },
  boxes: { flexDirection: 'row', gap: 8 },
  box: { flex: 1, minWidth: 0, height: 58, borderRadius: 12, borderWidth: 2, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  digit: { fontFamily: font.display, fontSize: 28, color: color.ink },
  hiddenInput: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, opacity: 0.01, color: 'transparent' },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  status: { flexShrink: 1, fontFamily: font.body, fontSize: 14, color: color.ink2 },
  inlineLink: { fontFamily: font.bodySemi, fontSize: 14, color: color.primary, textDecorationLine: 'underline' },
  amber: { paddingVertical: 10, paddingHorizontal: 14, backgroundColor: color.warnTint, borderRadius: 12 },
  amberText: { fontFamily: font.body, fontSize: 13, lineHeight: 18, color: '#5C4310' },
  amberBold: { fontFamily: font.bodyBold, color: color.warnInk },
  photo: { width: 72, height: 72, borderRadius: 36, flexShrink: 0 },
  photoEmpty: { backgroundColor: color.primaryTint, borderWidth: 2, borderStyle: 'dashed', borderColor: '#9AA8AE', alignItems: 'center', justifyContent: 'center' },
  photoTitle: { fontFamily: font.bodySemi, fontSize: 15, color: color.ink },
  photoSub: { fontFamily: font.body, fontSize: 13, color: color.ink2 },
  input48: { minHeight: 48, height: 48 },
  later: { flexDirection: 'row', gap: 12, paddingVertical: 12, paddingHorizontal: 14, backgroundColor: color.primaryTint, borderRadius: 14 },
  laterText: { flexShrink: 1, fontFamily: font.body, fontSize: 14, lineHeight: 20, color: color.ink },
});
