import { router } from 'expo-router';
import { useState } from 'react';
import { Share, StyleSheet, Text, View } from 'react-native';

import { Button, ErrorText, Field, Icon, Screen, T } from '@/components/ui';
import { inviteMessage } from '@/lib/format';
import { useSession } from '@/lib/session';
import { errorText, supabase } from '@/lib/supabase';
import { cardShadow, color, font } from '@/theme';

// Wireframes P3 (invite your sitter) and P24 (review and send).
export default function Invite() {
  const { family } = useSession();
  const [name, setName] = useState('');
  const [code, setCode] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const first = name.trim().split(/\s+/)[0] || 'Your sitter';

  async function create() {
    setBusy(true);
    setErr('');
    const { data, error } = await supabase.rpc('create_invite', { p_family: family!.id, p_sitter_name: name.trim() });
    setBusy(false);
    if (error) return setErr(errorText(error));
    setCode(data as string);
  }

  if (code)
    return (
      <Screen
        title="Review and send"
        back
        footer={
          <>
            <Button label="Send by text" icon="message-circle" onPress={() => Share.share({ message: inviteMessage(family!.name, code) })} />
            <Button label="Done" kind="ghost" onPress={() => router.back()} />
          </>
        }>
        <T variant="muted">{first} will see this:</T>
        <View style={st.preview}>
          <Text style={st.previewTitle}>{family!.name} invited you to sit for them</Text>
          <T variant="small">Open BabyBadger, choose “I’m a sitter” and enter this code:</T>
          <Text style={st.code}>{code}</Text>
          <T variant="small">You’ll share location only while clocked in, and you’ll read and sign their monitoring notice first.</T>
        </View>
        <View style={st.facts}>
          <View style={[st.fact, st.line]}>
            <T>To</T>
            <T variant="strong">{name.trim()}</T>
          </View>
          <View style={st.fact}>
            <T>Code works</T>
            <T variant="strong">7 days, once</T>
          </View>
        </View>
      </Screen>
    );

  return (
    <Screen
      caption="Invite a sitter"
      back
      gap={14}
      footer={
        <>
          <Button label="Continue" onPress={create} busy={busy} disabled={name.trim().length < 2} />
          <Text style={st.next}>Next: you get a code to send {name.trim() ? first : 'her'}</Text>
        </>
      }>
      <Text style={st.title}>Invite your sitter</Text>
      <Text style={st.lead}>Someone you already know and trust. Finding new sitters comes later.</Text>
      <Field label="Name" value={name} onChangeText={setName} placeholder="Maya" autoComplete="name" autoCapitalize="words" autoFocus />
      <View style={st.info}>
        <Icon name="shield" size={20} tint={color.primary} />
        <View style={{ flex: 1, gap: 2 }}>
          <Text style={st.infoTitle}>{first} will be asked to agree to</Text>
          <T variant="small" style={{ fontSize: 13, lineHeight: 18 }}>
            Sharing location only while clocked in, and a monitoring notice you both keep a copy of.
          </T>
        </View>
      </View>
      <ErrorText>{err}</ErrorText>
    </Screen>
  );
}

const st = StyleSheet.create({
  // P3 values
  title: { fontFamily: font.display, fontSize: 26, color: color.ink, marginVertical: -4.83 },
  lead: { fontFamily: font.body, fontSize: 15, lineHeight: 22, color: color.ink2, marginTop: -6 },
  next: { fontFamily: font.body, fontSize: 13, color: color.ink2, textAlign: 'center' },
  preview: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 18, gap: 8, ...cardShadow },
  previewTitle: { fontFamily: font.display, fontSize: 20, color: color.ink },
  code: { fontFamily: font.display, fontSize: 42, letterSpacing: 8, color: color.primaryStrong, textAlign: 'center', marginVertical: 6 },
  facts: { backgroundColor: '#FFFFFF', borderRadius: 24, paddingHorizontal: 16, ...cardShadow },
  fact: { flexDirection: 'row', justifyContent: 'space-between', minHeight: 52, alignItems: 'center' },
  line: { borderBottomWidth: 1, borderBottomColor: color.divider },
  info: { flexDirection: 'row', gap: 10, backgroundColor: color.primaryTint, borderRadius: 18, padding: 14 },
  infoTitle: { fontFamily: font.bodyBold, fontSize: 14, color: color.primaryStrong },
});
