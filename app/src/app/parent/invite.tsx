import * as Clipboard from 'expo-clipboard';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Linking, Pressable, Share, StyleSheet, View } from 'react-native';

import { Button, ErrorText, Field, Icon, Screen } from '@/components/ui';
import { api, useQuery } from '@/lib/data';
import { firstName, inviteMessage } from '@/lib/format';
import { ageLabel } from '@/lib/kid-profile';
import { useSession } from '@/lib/session';
import { errorText, supabase } from '@/lib/supabase';
import { cardShadow, color, font } from '@/theme';
import { Text } from '@/components/Text';

// Wireframes P3 (invite your sitter, from the Home setup list), P3b (invite a sitter, from anywhere else) and
// P24 (review and send). Home setup opens this with ?from=setup.
// Left out until built (P3, P3b): Mobile number (the app shares a code; invites don't store a phone).
export default function Invite() {
  const { from } = useLocalSearchParams<{ from?: string }>();
  const fromSetup = from === 'setup';
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
          <View style={{ gap: 8, marginTop: -4 }}>
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
          </View>
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
                    {k.birthdate ? `, ${ageLabel(k.birthdate)}` : ''}
                  </Text>
                </View>
              ))}
            </View>
          ) : null}
          <Text style={st.code}>{code}</Text>
          <Text style={st.note13}>You’ll share location only while clocked in.</Text>
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

  const info = (
    <View style={st.info}>
      <Icon name="shield" size={24} tint={color.primary} />
      <View style={{ flexShrink: 1, gap: 4 }}>
        <Text style={st.infoTitle}>{first} will be asked to agree to</Text>
        <Text style={st.infoBody}>Sharing location only while clocked in, and a monitoring notice you both keep a copy of.</Text>
      </View>
    </View>
  );
  const nameField = <Field label="Name" value={name} onChangeText={setName} placeholder="Maya" autoComplete="name" autoCapitalize="words" autoFocus />;
  const footer = (
    // P3/P3b footer: 12 px above, 10 px gap (Screen's footer has 8 and 8).
    <View style={{ gap: 10, marginTop: 4 }}>
      <Button label="Continue" onPress={create} busy={busy} disabled={name.trim().length < 2} />
      <Text style={st.next}>Next: you get a code to send {name.trim() ? first : 'her'}</Text>
    </View>
  );

  // Wireframe P3b: the standard back header ("Invite a sitter"), no step count, progress or skip.
  if (!fromSetup) {
    return (
      <Screen title="Invite a sitter" back gap={14} footer={footer}>
        {/* Wireframe content starts 12 px under the header; Screen's starts 4 px down. */}
        <Text style={[st.lead, { marginTop: 8 }]}>Someone you already know and trust.</Text>
        {nameField}
        {info}
        <ErrorText>{err}</ErrorText>
      </Screen>
    );
  }

  return (
    <Screen
      gap={14}
      header={
        // P3 header: back, "Step 2 of 3", Skip for now, 66% progress bar. The extra bottom padding makes up the
        // wireframe's 12 px above the title (Screen's content starts 4 px down).
        <View style={st.header}>
          <View style={st.backRow}>
            <Pressable accessibilityRole="button" accessibilityLabel="Back" onPress={() => router.back()} style={st.back}>
              <Icon name="chevron-left" size={22} tint={color.ink} strokeWidth={2} />
            </Pressable>
            <Text style={st.stepText}>Step 2 of 3</Text>
            <Pressable accessibilityRole="button" onPress={() => router.back()} hitSlop={10}>
              <Text style={st.skip}>Skip for now</Text>
            </Pressable>
          </View>
          <View style={st.progress}>
            <View style={st.progressFill} />
          </View>
        </View>
      }
      footer={footer}>
      <Text style={st.title}>Invite your sitter</Text>
      <Text style={[st.lead, { marginTop: -6 }]}>Someone you already know and trust. Finding new sitters comes later.</Text>
      {nameField}
      {info}
      <ErrorText>{err}</ErrorText>
    </Screen>
  );
}

const st = StyleSheet.create({
  // P3 values
  header: { paddingTop: 16, paddingHorizontal: 20, paddingBottom: 16, gap: 14 },
  backRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  back: { width: 44, height: 44, borderRadius: 22, borderWidth: 1, borderColor: color.line, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  stepText: { flexShrink: 1, fontFamily: font.bodySemi, fontSize: 14, color: color.ink2 }, // P3: no flex-grow, Skip sits right after it
  skip: { fontFamily: font.bodySemi, fontSize: 15, color: color.primary, textDecorationLine: 'underline' },
  progress: { height: 6, borderRadius: 3, backgroundColor: '#DDE3EA', overflow: 'hidden' },
  progressFill: { width: '66%', height: 6, backgroundColor: color.primary },
  title: { fontFamily: font.display, fontSize: 26, color: color.ink, marginVertical: -4.83 },
  lead: { fontFamily: font.body, fontSize: 15, lineHeight: 22, color: color.ink2 },
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
  info: { flexDirection: 'row', gap: 12, backgroundColor: color.primaryTint, borderRadius: 16, padding: 16 },
  infoTitle: { fontFamily: font.bodyBold, fontSize: 15, color: color.primaryStrong },
  infoBody: { fontFamily: font.body, fontSize: 14, lineHeight: 20, color: color.ink },
});
