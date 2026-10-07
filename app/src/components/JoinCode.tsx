import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { InviteReview } from '@/components/InviteReview';
import { Button, ErrorText, Field, Icon, Screen } from '@/components/ui';
import { inviteApi, type InvitePreview } from '@/lib/invites';
import { useSession } from '@/lib/session';
import { errorText, supabase } from '@/lib/supabase';
import { color, font } from '@/theme';
import { Text, TextInput } from '@/components/Text';

// Wireframe S51, translated from its HTML (app/src/wireframes/S51.tsx).
// Invite codes are 6 digits (create_invite in the core migration). The six boxes are drawn under one real number
// field so typing, pasting and deleting work like any input. "Your name" only shows when the profile has no name yet:
// accept_invite keeps an existing name, so the field would do nothing otherwise.
// "See my invite" opens S1 (components/InviteReview.tsx) with what the family shares; accepting it goes on to S27
// (the family's requirements), then S42 / S2.
const LENGTH = 6;

/** Wireframe S51: join a family with the parent's invite code. Used by the Join screen and by sitter sign-up. */
export function JoinCode({ onBack }: { onBack?: () => void }) {
  const { profile, refresh } = useSession();
  const [code, setCode] = useState('');
  const hasName = !!(profile?.full_name ?? '').trim();
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [preview, setPreview] = useState<InvitePreview | null>(null);
  const yourName = hasName ? profile!.full_name : name.trim();

  async function see() {
    setBusy(true);
    setErr('');
    try {
      setPreview(await inviteApi.preview(code));
    } catch (e) {
      setErr(errorText(e));
    } finally {
      setBusy(false);
    }
  }

  async function join() {
    setBusy(true);
    setErr('');
    const { data, error } = await supabase.rpc('accept_invite', { p_code: code, p_your_name: yourName });
    setBusy(false);
    if (error) return setErr(errorText(error));
    await refresh();
    // S1 -> S27 family requirements (skipped when the family has none) -> S42 house rules -> S2 notice.
    router.replace(`/sitter/requirements/${data as string}?next=consent`);
  }

  async function decline() {
    setBusy(true);
    setErr('');
    try {
      await inviteApi.decline(code);
      setPreview(null);
      setCode('');
    } catch (e) {
      setErr(errorText(e));
    } finally {
      setBusy(false);
    }
  }

  if (preview) return <InviteReview invite={preview} onAccept={join} onDecline={decline} busy={busy} err={err} />;

  return (
    <Screen
      title="Join a family"
      back
      onBack={onBack}
      footer={
        <>
          <Button label="See my invite" onPress={see} busy={busy} disabled={code.length !== LENGTH || yourName.length < 2} />
          <Text style={st.footnote}>Codes work once and expire after 7 days.</Text>
        </>
      }>
      <View style={st.body}>
        <Text style={st.intro}>Enter the 6-digit code from the parent’s invite. You’ll see who they are and what they share before you join.</Text>
        <View style={{ gap: 6 }}>
          <Text style={st.label}>Invite code</Text>
          <View style={st.boxes}>
            {Array.from({ length: LENGTH }, (_, i) => (
              <View key={i} style={[st.box, i < code.length && st.boxOn]}>
                <Text style={st.digit}>{code[i] ?? ''}</Text>
              </View>
            ))}
            <TextInput
              accessibilityLabel="Invite code"
              value={code}
              onChangeText={(t) => setCode(t.replace(/\D/g, '').slice(0, LENGTH))}
              keyboardType="number-pad"
              maxLength={LENGTH}
              autoFocus
              caretHidden
              selectionColor="transparent"
              style={st.hiddenInput}
            />
          </View>
        </View>
        {!hasName && <Field label="Your name" value={name} onChangeText={setName} placeholder="First and last name" autoCapitalize="words" textContentType="name" />}
        <View style={st.note}>
          <Icon name="shield" size={24} />
          <Text style={st.noteText}>
            <Text style={st.noteBold}>Nothing is shared yet.</Text> The family sees your location only after you sign their notice, and only while you’re clocked in.
          </Text>
        </View>
        <ErrorText>{err}</ErrorText>
      </View>
    </Screen>
  );
}

// Values from wireframe S51.
const st = StyleSheet.create({
  body: { gap: 16, paddingTop: 4 },
  intro: { fontFamily: font.body, fontSize: 15, color: color.ink2, lineHeight: 22 },
  label: { fontFamily: font.bodySemi, fontSize: 14, color: color.ink },
  boxes: { flexDirection: 'row', gap: 8 },
  box: { flexGrow: 1, flexShrink: 1, flexBasis: 0, minWidth: 0, height: 58, borderRadius: 12, borderWidth: 2, borderColor: color.line, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  boxOn: { borderColor: color.primary },
  digit: { fontFamily: font.display, fontSize: 28, color: color.ink },
  hiddenInput: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, color: 'transparent', backgroundColor: 'transparent', fontSize: 1 },
  note: { flexDirection: 'row', gap: 12, paddingVertical: 14, paddingHorizontal: 16, backgroundColor: color.primaryTint, borderRadius: 16 },
  noteText: { fontFamily: font.body, fontSize: 14, color: color.ink, lineHeight: 20, flexShrink: 1 },
  noteBold: { fontFamily: font.bodyBold, color: color.primaryStrong },
  footnote: { fontFamily: font.body, fontSize: 13, color: color.ink2, textAlign: 'center' },
});
