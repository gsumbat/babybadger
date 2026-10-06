import { router, useLocalSearchParams } from 'expo-router';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';

import { kidShade } from '@/components/bits';
import { ErrorText, Icon, Screen } from '@/components/ui';
import { api, useQuery } from '@/lib/data';
import { ageLabel } from '@/lib/kid-profile';
import { useSession } from '@/lib/session';
import { cardShadow, color, font } from '@/theme';

// Wireframe S10, translated from its HTML (app/src/wireframes/S10.tsx).
// Left out until built: routines (screen time, bedtime), parents' phone numbers, home address.
export default function SitterFamily() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { sitterLinks } = useSession();
  const name = sitterLinks.find((l) => l.family_id === id)?.family.name ?? 'Family';
  const { data: kids, error } = useQuery(() => api.kids(id!), [id]);
  const list = kids ?? [];
  const avoid = list.filter((k) => k.avoid_foods || k.allergies);
  const doctors = list.filter((k) => k.pediatrician);
  const rows: (typeof list)[] = [];
  for (let i = 0; i < list.length; i += 2) rows.push(list.slice(i, i + 2));

  return (
    <Screen
      gap={12}
      header={
        <View style={st.header}>
          <BackButton />
          <View style={st.familyDot} />
          <Text style={st.title} numberOfLines={1}>
            {name}
          </Text>
        </View>
      }>
      <ErrorText>{error}</ErrorText>
      {avoid.map((k) => (
        <View key={k.id} style={st.avoid}>
          <Text style={st.avoidTitle}>{k.name} · food to avoid</Text>
          <Text style={st.avoidText}>{[k.avoid_foods, k.allergies && `allergic to ${k.allergies}`].filter(Boolean).join(' · ')}</Text>
        </View>
      ))}
      <View style={{ gap: 10 }}>
        {rows.map((r) => (
          <View key={r[0].id} style={{ flexDirection: 'row', gap: 10 }}>
            {r.map((k) => (
              <View key={k.id} style={st.kidCard}>
                <View style={[st.kidDot, { backgroundColor: kidShade(k.color) }]}>
                  <Text style={st.kidLetter}>{k.name[0]?.toUpperCase()}</Text>
                </View>
                <Text style={st.kidName}>
                  {k.name}
                  {k.birthdate ? `, ${ageLabel(k.birthdate).replace(' years', '')}` : ''}
                </Text>
                <Text style={st.kidSub}>{[k.health_notes, k.comfort_item && `comfort: ${k.comfort_item}`, k.notes].filter(Boolean).join(' · ') || 'No notes yet'}</Text>
              </View>
            ))}
            {r.length === 1 ? <View style={{ flex: 1 }} /> : null}
          </View>
        ))}
      </View>
      {doctors.length > 0 && (
        <>
          <Text style={st.label}>EMERGENCY</Text>
          <View style={st.card}>
            {doctors.map((k, i) => {
              const phone = (k.pediatrician ?? '').replace(/[^\d+]/g, '');
              return (
                <View key={k.id} style={[st.emRow, i < doctors.length - 1 && st.line]}>
                  <View style={{ flexShrink: 1 }}>
                    <Text style={st.emName}>Pediatrician · {k.name}</Text>
                    <Text style={st.emSub}>{k.pediatrician}</Text>
                  </View>
                  {phone.length >= 7 ? (
                    <Pressable accessibilityRole="button" accessibilityLabel={`Call pediatrician for ${k.name}`} onPress={() => Linking.openURL(`tel:${phone}`)} style={st.call}>
                      <Icon name="phone" size={20} />
                    </Pressable>
                  ) : null}
                </View>
              );
            })}
          </View>
        </>
      )}
      <View style={[st.card, st.shareRow]}>
        <Icon name="shield" size={20} />
        <View style={{ flexGrow: 1, flexShrink: 1 }}>
          <Text style={st.emName}>Location sharing with this family</Text>
          <Text style={st.shareSub}>Only while clocked in · notice signed</Text>
        </View>
      </View>
    </Screen>
  );
}

function BackButton() {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel="Back" onPress={() => router.back()} style={st.back}>
      <Icon name="chevron-left" size={22} tint={color.ink} />
    </Pressable>
  );
}

// Values from wireframe S10.
const st = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingTop: 16, paddingHorizontal: 20, paddingBottom: 12 },
  back: { width: 44, height: 44, borderRadius: 22, borderWidth: 1, borderColor: color.line, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  familyDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#2F6FD6' },
  title: { fontFamily: font.display, fontSize: 22, color: color.ink, flexShrink: 1 },
  avoid: { gap: 2, paddingVertical: 12, paddingHorizontal: 14, backgroundColor: color.badTint, borderRadius: 12 },
  avoidTitle: { fontFamily: font.bodyBold, fontSize: 14, color: color.badInk },
  avoidText: { fontFamily: font.body, fontSize: 14, color: '#6E2215' },
  kidCard: { flex: 1, gap: 8, padding: 14, backgroundColor: '#FFFFFF', borderRadius: 24, ...cardShadow },
  kidDot: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  kidLetter: { fontFamily: font.bodyBold, fontSize: 16, color: '#FFFFFF' },
  kidName: { fontFamily: font.bodyBold, fontSize: 16, color: color.ink },
  kidSub: { fontFamily: font.body, fontSize: 13, lineHeight: 18, color: color.ink2 },
  label: { fontFamily: font.bodyBold, fontSize: 13, color: color.ink2, letterSpacing: 0.6, marginTop: 4 },
  card: { paddingVertical: 4, paddingHorizontal: 16, backgroundColor: '#FFFFFF', borderRadius: 24, ...cardShadow },
  emRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 52 },
  line: { borderBottomWidth: 1, borderBottomColor: color.divider },
  emName: { fontFamily: font.bodySemi, fontSize: 15, color: color.ink },
  emSub: { fontFamily: font.body, fontSize: 13, color: '#5F6D74' },
  call: { width: 44, height: 44, borderRadius: 22, backgroundColor: color.primaryTint, alignItems: 'center', justifyContent: 'center' },
  shareRow: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 60 },
  shareSub: { fontFamily: font.body, fontSize: 12, color: color.ink2 },
});
