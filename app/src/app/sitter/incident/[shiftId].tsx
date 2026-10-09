import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { Text, TextInput } from '@/components/Text';
import { TimeField } from '@/components/TimeField';
import { Button, ErrorText, Screen } from '@/components/ui';
import { sendIncident } from '@/lib/alerts';
import { INCIDENT_TYPES, type IncidentDraft, incidentReady } from '@/lib/alerts-logic';
import { useShiftLive } from '@/lib/data';
import { timeOf } from '@/lib/format';
import { useSession } from '@/lib/session';
import { errorText } from '@/lib/supabase';
import { color, font, SECTION_GAP } from '@/theme';

// Wireframe S24 "Log an incident", translated from its HTML (app/src/wireframes/S24.tsx). Opened from S4.
// Saved as an urgent log (kind 'incident'): parents get the push at once, it opens P9 Alerts, and it's in the report.
const PLUS = '<svg viewBox="0 0 24 24" fill="none" stroke="#4B5960" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>';
const BELL = '<svg viewBox="0 0 24 24" fill="none" stroke="#A1321F" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z"/><path d="M10 20.5a2 2 0 0 0 4 0"/></svg>';

/** S24 chip: white with a line, or tinted with a 1.5 primary border and a ✓ when picked. */
function Pick({ label, on, onPress }: { label: string; on: boolean; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" accessibilityState={{ selected: on }} onPress={onPress} style={[st.pick, on && st.pickOn]}>
      <Text style={[st.pickText, on && { color: color.primary }]}>{on ? `✓ ${label}` : label}</Text>
    </Pressable>
  );
}

export default function LogIncident() {
  const { shiftId } = useLocalSearchParams<{ shiftId: string }>();
  const { session } = useSession();
  const { bundle } = useShiftLive(shiftId);
  const kids = bundle?.kids ?? [];
  const [d, setD] = useState<IncidentDraft>(() => ({ kidIds: [], type: '', when: timeOf(new Date()), where: '', text: '' }));
  const [photo, setPhoto] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const set = <K extends keyof IncidentDraft>(k: K) => (v: IncidentDraft[K]) => setD((x) => ({ ...x, [k]: v }));

  // One kid on the shift: picked for her.
  const onlyKid = kids.length === 1 ? kids[0].id : null;
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (onlyKid) setD((x) => (x.kidIds.length ? x : { ...x, kidIds: [onlyKid] }));
  }, [onlyKid]);

  const toggleKid = (id: string) => set('kidIds')(d.kidIds.includes(id) ? d.kidIds.filter((k) => k !== id) : [...d.kidIds, id]);

  async function pick() {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) return setErr('Allow camera access in Settings to add a photo.');
    const res = await ImagePicker.launchCameraAsync({ quality: 0.6, allowsEditing: true });
    if (!res.canceled) setPhoto(res.assets[0].uri);
  }

  async function send() {
    setBusy(true);
    setErr('');
    try {
      await sendIncident(shiftId, session!.user.id, d, photo);
      router.back();
    } catch (e) {
      setErr(errorText(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen title="Log an incident" back gap={12} footer={<Button label="Send to parents" onPress={send} busy={busy} disabled={!incidentReady(d)} />}>
      <Text style={st.section}>WHO</Text>
      <View style={st.row}>
        {kids.map((k) => (
          <Pick key={k.id} label={k.name} on={d.kidIds.includes(k.id)} onPress={() => toggleKid(k.id)} />
        ))}
      </View>
      <Text style={[st.section, { marginTop: SECTION_GAP }]}>WHAT KIND</Text>
      <View style={[st.row, { flexWrap: 'wrap' }]}>
        {INCIDENT_TYPES.map((t) => (
          <Pick key={t} label={t} on={d.type === t} onPress={() => set('type')(t)} />
        ))}
      </View>
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <TimeField label="When" value={d.when} onChange={set('when')} step={1} />
        <View style={{ flex: 1, minWidth: 0, gap: 6 }}>
          <Text style={st.label}>Where</Text>
          <TextInput value={d.where} onChangeText={set('where')} style={st.input} />
        </View>
      </View>
      <View style={{ gap: 6 }}>
        <Text style={st.label}>What happened and what you did</Text>
        <TextInput value={d.text} onChangeText={set('text')} multiline style={st.area} />
      </View>
      <Pressable accessibilityRole="button" accessibilityLabel="Add a photo (optional)" onPress={pick} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <View style={st.photo}>{photo ? <Image source={{ uri: photo }} style={StyleSheet.absoluteFill} contentFit="cover" /> : <SvgXml xml={PLUS} width={22} height={22} style={{ flexShrink: 0 }} />}</View>
        <Text style={st.photoText}>Add a photo (optional)</Text>
      </Pressable>
      <View style={st.banner}>
        <SvgXml xml={BELL} width={20} height={20} style={{ flexShrink: 0 }} />
        <Text style={st.bannerText}>
          <Text style={st.bannerBold}>Parents are told right away</Text> for any injury. It&apos;s also added to the shift report.
        </Text>
      </View>
      <ErrorText>{err}</ErrorText>
    </Screen>
  );
}

// values below come from wireframe S24
const st = StyleSheet.create({
  section: { fontFamily: font.bodyBold, fontSize: 13, color: color.ink2, letterSpacing: 0.6 },
  row: { flexDirection: 'row', gap: 8 },
  pick: { height: 40, paddingHorizontal: 14, borderRadius: 999, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: color.line, justifyContent: 'center' },
  pickOn: { backgroundColor: color.primaryTint, borderWidth: 1.5, borderColor: color.primary },
  pickText: { fontFamily: font.bodySemi, fontSize: 14, color: color.ink },
  label: { fontFamily: font.bodySemi, fontSize: 14, color: color.ink },
  input: { height: 48, paddingHorizontal: 14, borderRadius: 8, borderWidth: 1, borderColor: color.lineStrong, backgroundColor: '#FFFFFF', fontFamily: font.body, fontSize: 16, color: color.ink },
  // rows="3": 3 × 21 line height + 12 top and bottom
  area: { minHeight: 87, paddingTop: 12, paddingBottom: 12, paddingHorizontal: 14, borderRadius: 8, borderWidth: 1, borderColor: color.lineStrong, backgroundColor: '#FFFFFF', fontFamily: font.body, fontSize: 15, lineHeight: 21, color: color.ink, textAlignVertical: 'top' },
  photo: { width: 64, height: 64, borderRadius: 12, borderWidth: 2, borderStyle: 'dashed', borderColor: '#C9D3DD', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  photoText: { fontFamily: font.body, fontSize: 13, color: color.ink2 },
  banner: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, paddingHorizontal: 14, backgroundColor: color.badTint, borderRadius: 12 },
  bannerText: { flexShrink: 1, fontFamily: font.body, fontSize: 13, lineHeight: 18, color: '#6E2215' },
  bannerBold: { fontFamily: font.bodyBold, color: color.badInk },
});
