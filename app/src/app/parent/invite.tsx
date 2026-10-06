import * as Clipboard from 'expo-clipboard';
import { useState } from 'react';
import { Linking, Pressable, Share, StyleSheet, Text, View } from 'react-native';

import { Button, ErrorText, Field, Icon, Screen, T } from '@/components/ui';
import { api, useQuery } from '@/lib/data';
import { firstName, inviteMessage } from '@/lib/format';
import { ageLabel } from '@/lib/kid-profile';
import { useSession } from '@/lib/session';
import { errorText, supabase } from '@/lib/supabase';
import { cardShadow, color, font } from '@/theme';

// Wireframes P3 (invite your sitter) and P24 (review and send).
export default function Invite() {
  const { family, profile } = useSession();
  const { data: kids } = useQuery(() => api.kids(family!.id), [family!.id]);
  const [copied, setCopied] = useState(false);
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

  // Wireframe P24. Left out until built: sending to a phone number from the app, rate and requirements.
  if (code) {
    const msg = inviteMessage(family!.name, code);
    return (
      <Screen
        title="Review and send"
        back
        gap={12}
        footer={
          <>
            <Pressable accessibilityRole="button" onPress={() => Share.share({ message: msg })} style={st.sendBtn}>
              <Text style={st.sendText}>Send by text</Text>
            </Pressable>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Pressable accessibilityRole="button" onPress={() => Linking.openURL(`mailto:?subject=${encodeURIComponent(`${family!.name} invited you to BabyBadger`)}&body=${encodeURIComponent(msg)}`)} style={st.tonalBtn}>
                <Text style={st.tonalText}>Email</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                onPress={async () => {
                  await Clipboard.setStringAsync(msg);
                  setCopied(true);
                }}
                style={st.tonalBtn}>
                <Text style={st.tonalText}>{copied ? 'Copied' : 'Copy invite'}</Text>
              </Pressable>
            </View>
          </>
        }>
        <Text style={st.muted14}>{first} will see this:</Text>
        <View style={st.preview}>
          <Text style={st.previewTitle}>
            {firstName(profile?.full_name)} invited you to sit for {family!.name.replace(/^The /, 'the ')}
          </Text>
          {kids?.length ? (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
              {kids.map((k) => (
                <View key={k.id} style={st.kidPill}>
                  <View style={st.kidPillDot} />
                  <Text style={st.kidPillText}>
                    {k.name}
                    {k.birthdate ? `, ${ageLabel(k.birthdate).replace(' years', '')}` : ''}
                  </Text>
                </View>
              ))}
            </View>
          ) : null}
          <Text style={st.code}>{code}</Text>
          <Text style={st.note13}>You’ll share location only while clocked in, and you’ll read and sign the family’s monitoring notice first.</Text>
        </View>
        <View style={st.facts}>
          <View style={[st.fact, st.line]}>
            <Text style={st.factKey}>To</Text>
            <Text style={st.factVal}>{name.trim()}</Text>
          </View>
          <View style={st.fact}>
            <Text style={st.factKey}>Code works</Text>
            <Text style={st.factVal}>7 days, once</Text>
          </View>
        </View>
        <Text style={st.note13}>{first} enters the code in BabyBadger after choosing “I’m a sitter”.</Text>
      </Screen>
    );
  }

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
  // P24 values
  muted14: { fontFamily: font.body, fontSize: 14, color: color.ink2 },
  preview: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 16, gap: 10, ...cardShadow },
  previewTitle: { fontFamily: font.display, fontSize: 20, lineHeight: 24, color: color.ink },
  kidPill: { height: 26, paddingHorizontal: 10, borderRadius: 999, backgroundColor: color.muted, flexDirection: 'row', alignItems: 'center', gap: 6 },
  kidPillDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#8A979D' },
  kidPillText: { fontFamily: font.bodyBold, fontSize: 12, color: color.ink2 },
  note13: { fontFamily: font.body, fontSize: 13, lineHeight: 18, color: color.ink2 },
  factKey: { fontFamily: font.body, fontSize: 15, color: color.ink },
  factVal: { fontFamily: font.bodySemi, fontSize: 15, color: color.ink },
  sendBtn: { height: 54, borderRadius: 999, backgroundColor: color.primary, alignItems: 'center', justifyContent: 'center' },
  sendText: { fontFamily: font.displayBold, fontSize: 17, color: '#FFFFFF' },
  tonalBtn: { flex: 1, height: 48, borderRadius: 999, backgroundColor: color.primaryTint, alignItems: 'center', justifyContent: 'center' },
  tonalText: { fontFamily: font.displayBold, fontSize: 17, color: color.primary },
  code: { fontFamily: font.display, fontSize: 40, letterSpacing: 8, color: color.primaryStrong, textAlign: 'center' },
  facts: { backgroundColor: '#FFFFFF', borderRadius: 24, paddingHorizontal: 16, ...cardShadow },
  fact: { flexDirection: 'row', justifyContent: 'space-between', minHeight: 48, alignItems: 'center', gap: 12 },
  line: { borderBottomWidth: 1, borderBottomColor: color.divider },
  info: { flexDirection: 'row', gap: 10, backgroundColor: color.primaryTint, borderRadius: 18, padding: 14 },
  infoTitle: { fontFamily: font.bodyBold, fontSize: 14, color: color.primaryStrong },
});
