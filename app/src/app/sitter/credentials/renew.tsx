import { router, useLocalSearchParams } from 'expo-router';
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/Text';
import { Button, ErrorText, Loading, Pill, Screen } from '@/components/ui';
import { credentialApi, credentialState, daysUntil, monthDay, needsMigration19, MIGRATION_19_TEXT } from '@/lib/credentials';
import { useQuery } from '@/lib/data';
import { cardShadow, color, font, SECTION_GAP } from '@/theme';

// Wireframe S18 Renew certification, from app/src/wireframes/S18.tsx. Opened from the S14 banner (the certificate
// expiring soonest, within 30 days). "Upload new card" opens S15 filled in.
// "Expiring" is worked out in the app from the expiry date (no server job): the reminders at 30, 14 and 3 days in
// the copy aren't sent yet. Left out until built: the "The Lee family requires it" card (family requirements, built
// separately) and "Find a class near me". Not drawn: the number card once the date has passed (red, "expired").
export default function Renew() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: c, error } = useQuery(() => credentialApi.get(id), [id]);
  if (!c) return error ? <Screen back title="Renew"><ErrorText>{needsMigration19(error) ? MIGRATION_19_TEXT : error}</ErrorText></Screen> : <Loading />;

  const left = c.expires_on ? Math.max(0, daysUntil(c.expires_on)) : 0;
  const gone = credentialState(c) === 'expired';
  const date = c.expires_on ? monthDay(c.expires_on) : '';

  return (
    <Screen back title={`Renew ${c.title}`} gap={14} footer={<Button label="Upload new card" icon="upload" onPress={() => router.push({ pathname: '/sitter/credentials/add', params: { id: c.id } })} />}>
      <View style={[st.count, gone && { backgroundColor: color.badTint }]}>
        <Text style={[st.big, gone && { color: color.badInk }]}>{left}</Text>
        <Text style={[st.countText, gone && { color: color.badInk }]}>{gone ? `days left · expired ${date}` : `${left === 1 ? 'day' : 'days'} until it expires · ${date}`}</Text>
      </View>
      <Text style={[st.label, { marginTop: SECTION_GAP }]}>WHAT HAPPENS</Text>
      <View style={st.card}>
        <Step pill={<Pill label="Now" kind="warn" />} text="Families you shared it with still see it. Reminders at 30, 14 and 3 days." />
        <Step pill={<Pill label={date || 'Expiry'} kind="bad" />} text="It shows as Expired to families you shared it with." />
        <Step pill={<Pill label="Renewed" kind="ok" />} text="Upload the new card and share it with your families." />
      </View>
    </Screen>
  );
}

function Step({ pill, text }: { pill: ReactNode; text: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
      <View style={{ flexShrink: 0 }}>{pill}</View>
      <Text style={st.stepText}>{text}</Text>
    </View>
  );
}

// Values from wireframe S18.
const st = StyleSheet.create({
  count: { alignItems: 'center', gap: 6, padding: 18, backgroundColor: color.warnTint, borderRadius: 20 },
  big: { fontFamily: font.display, fontSize: 48, color: color.warnInk, marginVertical: -12.45, textAlign: 'center' },
  countText: { fontFamily: font.bodyBold, fontSize: 15, color: color.warnInk, textAlign: 'center' },
  label: { fontFamily: font.bodyBold, fontSize: 13, color: color.ink2, letterSpacing: 0.6 },
  card: { gap: 12, paddingVertical: 14, paddingHorizontal: 16, backgroundColor: '#FFFFFF', borderRadius: 24, ...cardShadow },
  stepText: { flexShrink: 1, fontFamily: font.body, fontSize: 14, lineHeight: 20, color: color.ink },
});
