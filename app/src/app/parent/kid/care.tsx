import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { HelperNote } from '@/components/familyMembers';
import { Text } from '@/components/Text';
import { ErrorText, Icon, Loading, Screen } from '@/components/ui';
import { api, useQuery } from '@/lib/data';
import { cardShadow, color, font, radius } from '@/theme';

// Wireframe P19v Keeping Ava safe · read only (from app/src/wireframes/P19v.tsx). What a read-only member sees from the
// kid profile's "Care and safety" row (P55h): the foods to avoid as red chips, then allergies, medicine and health
// notes, pediatrician and comfort item, and "Jen manages Ava’s profile.". Full access edits the same fields in P19e
// (kid/new?step=2). Not drawn: empty values ("None" / "Not added"), no foods to avoid ("None").
export default function KidCareView() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: kid, error } = useQuery(() => api.kid(id), [id]);

  if (!kid)
    return error ? (
      <Screen title="" back>
        <ErrorText>{error}</ErrorText>
      </Screen>
    ) : (
      <Loading />
    );
  const foods = kid.avoid_foods
    .split(',')
    .map((f) => f.trim())
    .filter(Boolean);
  const rows: [string, string][] = [
    ['Allergies', kid.allergies?.trim() || 'None'],
    ['Medicine and health notes', kid.health_notes?.trim() || 'Not added'],
    ['Pediatrician', kid.pediatrician?.trim() || 'Not added'],
    ['Comfort item', kid.comfort_item?.trim() || 'Not added'],
  ];

  return (
    <Screen
      gap={12}
      header={
        <View style={st.head}>
          <Pressable accessibilityRole="button" accessibilityLabel="Back" onPress={() => router.back()} style={st.back}>
            <Icon name="chevron-left" size={22} tint={color.ink} strokeWidth={2} />
          </Pressable>
          <Text style={st.title} numberOfLines={1}>
            {`Keeping ${kid.name} safe`}
          </Text>
        </View>
      }>
      <Text style={st.lead}>What sitters see on every shift.</Text>
      <Text style={st.section}>FOOD TO AVOID</Text>
      {foods.length ? (
        <View style={st.chips}>
          {foods.map((f) => (
            <View key={f} style={st.chip}>
              <Text style={st.chipText}>{f}</Text>
            </View>
          ))}
        </View>
      ) : (
        <Text style={st.none}>None</Text>
      )}
      <View style={st.card}>
        {rows.map(([label, value], i) => (
          <View key={label} style={[st.block, i < rows.length - 1 && st.line]}>
            <Text style={st.label}>{label}</Text>
            <Text style={st.value}>{value}</Text>
          </View>
        ))}
      </View>
      <HelperNote what={`${kid.name}’s profile`} />
    </Screen>
  );
}

// Values from wireframe P19v (P19e's header, lead and red chips).
const st = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingTop: 16, paddingHorizontal: 20, paddingBottom: 4 }, // + 4 content top = 8
  back: { width: 44, height: 44, borderRadius: 22, borderWidth: 1, borderColor: color.line, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  title: { fontFamily: font.display, fontSize: 22, color: color.ink, marginVertical: -4.62, flexGrow: 1, flexShrink: 1 },
  lead: { fontFamily: font.body, fontSize: 15, lineHeight: 22, color: color.ink2 },
  section: { fontFamily: font.bodyBold, fontSize: 13, letterSpacing: 0.6, color: color.ink2 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { height: 40, paddingHorizontal: 14, borderRadius: radius.pill, flexDirection: 'row', alignItems: 'center', backgroundColor: color.badTint, borderWidth: 1.5, borderColor: color.bad },
  chipText: { fontFamily: font.bodySemi, fontSize: 14, color: color.badInk },
  none: { fontFamily: font.body, fontSize: 15, color: color.ink2 },
  card: { paddingHorizontal: 16, backgroundColor: '#FFFFFF', borderRadius: 24, ...cardShadow },
  block: { gap: 2, paddingVertical: 12 },
  line: { borderBottomWidth: 1, borderBottomColor: color.divider },
  label: { fontFamily: font.body, fontSize: 13, color: color.ink2 },
  value: { fontFamily: font.body, fontSize: 15, lineHeight: 21, color: color.ink },
});
