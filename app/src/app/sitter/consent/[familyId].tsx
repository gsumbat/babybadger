import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';


import { Button, Card, ErrorText, Field, Icon, Label, Screen, T } from '@/components/ui';
import { useSession } from '@/lib/session';
import { errorText, supabase } from '@/lib/supabase';
import { NOTICE_VERSION, TERMS_VERSION } from '@/lib/types';
import { cardShadow, color, font } from '@/theme';

// [LEGAL REVIEW] Placeholder text. Final notice wording depends on state law and must come from counsel.
const NOTICE = (family: string) => [
  ['Who is monitoring', `${family} uses BabyBadger to see where the person caring for their children is during a shift. BabyBadger provides the app; the family decides to use it.`],
  ['What is collected', 'Your phone’s location, clock-in and clock-out times, trips, and entries you add (food, naps, notes, photos).'],
  ['When', 'Only between clock-in and clock-out. Nothing is collected between shifts. A shift left running closes itself 2 hours after its end time.'],
  ['Who sees it', 'Parents in this family. Not other families, and not BabyBadger staff except for support you ask for.'],
  ['How long it’s kept', '[RETENTION PERIOD], then deleted.'],
  ['Your choices', 'You can see everything the family sees, and you can leave the family at any time. Without location, you can’t clock in for this family.'],
];

export default function Consent() {
  const { familyId } = useLocalSearchParams<{ familyId: string }>();
  const { sitterLinks, profile, refresh } = useSession();
  const family = sitterLinks.find((l) => l.family_id === familyId)?.family.name ?? 'This family';
  const [read, setRead] = useState(false);
  const [reading, setReading] = useState(false);
  const [agree, setAgree] = useState(false);
  const [name, setName] = useState(profile?.full_name ?? '');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  async function sign() {
    setBusy(true);
    setErr('');
    const { error } = await supabase.rpc('sign_consent', { p_family: familyId, p_signed_name: name.trim(), p_notice_version: NOTICE_VERSION, p_terms_version: TERMS_VERSION });
    setBusy(false);
    if (error) return setErr(errorText(error));
    await refresh();
    router.replace('/sitter');
  }

  // Wireframe S2a: the notice itself, with a short summary on top.
  if (reading)
    return (
      <Screen title="Monitoring notice" subtitle={`${family} · ${NOTICE_VERSION}`} back onBack={() => setReading(false)} footer={<Button label="I’ve read it" onPress={() => { setRead(true); setReading(false); }} />}>
        <View style={st.short}>
          <Text style={st.shortLabel}>IN SHORT</Text>
          <T>{family} sees your location only between clock-in and clock-out. Nothing is shared between shifts. You can see everything they see.</T>
        </View>
        {NOTICE(family).map(([h, b], i) => (
          <View key={h} style={{ gap: 4 }}>
            <Text style={st.h}>
              {i + 1}. {h}
            </Text>
            <T variant="muted">{b}</T>
          </View>
        ))}
        <T variant="small">[LEGAL REVIEW] Final wording depends on state law, e.g. employee monitoring notice rules.</T>
      </Screen>
    );

  // Wireframe S2.
  return (
    <Screen
      caption="Before your first shift"
      title="Location is shared only while you’re working"
      back
      footer={
        <>
          <Button label="Sign and allow location" onPress={sign} busy={busy} disabled={!read || !agree || name.trim().length < 2} />
          <T variant="small" style={{ textAlign: 'center' }}>
            A signed copy goes to you and the family. Next, your phone asks for location.
          </T>
        </>
      }>
      <Card>
        <View style={{ flexDirection: 'row', height: 14, borderRadius: 7, overflow: 'hidden' }}>
          <View style={{ flex: 1, backgroundColor: color.muted }} />
          <View style={{ flex: 2, backgroundColor: color.primary }} />
          <View style={{ flex: 1, backgroundColor: color.muted }} />
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <T variant="small">Off</T>
          <T variant="strong" style={{ color: color.primary, fontSize: 13 }}>
            Clock in → Clock out
          </T>
          <T variant="small">Off</T>
        </View>
      </Card>
      <View style={st.facts}>
        {[
          ['Employer', family],
          ['Collected', 'Location, times, entries'],
          ['Seen by', 'Parents in this family'],
          ['Kept for', '[RETENTION PERIOD]'],
        ].map(([k, v], i) => (
          <View key={k} style={[st.fact, i < 3 && { borderBottomWidth: 1, borderBottomColor: color.divider }]}>
            <Text style={st.factKey}>{k}</Text>
            <Text style={st.factVal}>{v}</Text>
          </View>
        ))}
      </View>
      <Label right={<T variant="small">Required</T>}>Read before you sign</Label>
      <View style={[st.facts, { paddingVertical: 0, paddingHorizontal: 14 }]}>
        <Pressable accessibilityRole="button" onPress={() => setReading(true)} style={st.docRow}>
          <View style={st.docIcon}>
            <Icon name={read ? 'check' : 'file-text'} size={18} tint={read ? color.ok : color.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: font.bodySemi, fontSize: 15, lineHeight: 19, color: color.ink }}>Monitoring notice</Text>
            <Text style={{ fontFamily: font.body, fontSize: 12, color: color.ink2 }}>{read ? 'Read ✓' : `From ${family} · 2 min read`}</Text>
          </View>
          <Icon name="chevron-right" size={18} tint={color.ink2} />
        </Pressable>
      </View>
      <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: agree, disabled: !read }} onPress={() => read && setAgree((x) => !x)} style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-start', opacity: read ? 1 : 0.5 }}>
        <View style={[st.check, agree && st.checkOn]}>{agree ? <Icon name="check" size={16} tint="#FFFFFF" /> : null}</View>
        <T style={{ flex: 1 }}>I’ve read and agree to the monitoring notice, the Terms and the Privacy policy.</T>
      </Pressable>
      {!read && <T variant="small">Open the notice first; then you can agree.</T>}
      <Field label="Type your full name to sign" value={name} onChangeText={setName} autoComplete="name" placeholder="Full name" />
      <ErrorText>{err}</ErrorText>
    </Screen>
  );
}

const st = StyleSheet.create({
  // S2 values
  facts: { paddingVertical: 4, paddingHorizontal: 16, backgroundColor: '#FFFFFF', borderRadius: 24, ...cardShadow },
  fact: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 9 },
  factKey: { fontFamily: font.body, fontSize: 14, color: color.ink2 },
  factVal: { fontFamily: font.bodySemi, fontSize: 14, color: color.ink, flexShrink: 1 },
  short: { backgroundColor: color.primaryTint, borderRadius: 18, padding: 14, gap: 6 },
  shortLabel: { fontFamily: font.bodyBold, fontSize: 12, letterSpacing: 0.6, color: color.primaryStrong },
  h: { fontFamily: font.bodyBold, fontSize: 16, color: color.ink },
  docRow: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 60 },
  docIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: color.primaryTint, alignItems: 'center', justifyContent: 'center' },
  check: { width: 24, height: 24, borderRadius: 7, borderWidth: 2, borderColor: color.lineStrong, alignItems: 'center', justifyContent: 'center' },
  checkOn: { backgroundColor: color.primary, borderColor: color.primary },
});
