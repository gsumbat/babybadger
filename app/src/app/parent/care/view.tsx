import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { CareIcon } from '@/components/care';
import { HelperNote } from '@/components/familyMembers';
import { Text } from '@/components/Text';
import { ErrorText, Icon, Loading, Screen } from '@/components/ui';
import { api, useQuery } from '@/lib/data';
import { isFood, itemLine, itemTitle, scheduleLabel, timeRangeLabel } from '@/lib/care-plan';
import { cardShadow, color, font, SECTION_GAP } from '@/theme';

// Wireframe P20v Care plan item · read only (from app/src/wireframes/P20v.tsx). A read-only member taps a row on the
// care plan (P7h) and sees the whole item: the type tile, who it's for ("Whole family" or the kid), the time and days,
// and the full "how" text (P7 shows only its first line), then "Jen manages the care plan.". Full access opens the
// editor (P20a) instead. `?id=` = the care item.
export default function CareItemView() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, error } = useQuery(async () => {
    const item = await api.careItem(id);
    const kid = item.kid_id ? await api.kid(item.kid_id).catch(() => null) : null;
    return { item, kid };
  }, [id]);

  if (!data)
    return error ? (
      <Screen title="Care plan" back>
        <ErrorText>{error}</ErrorText>
      </Screen>
    ) : (
      <Loading />
    );
  const { item, kid } = data;
  const how = item.how.trim();

  return (
    <Screen
      gap={12}
      header={
        <View style={st.head}>
          <Pressable accessibilityRole="button" accessibilityLabel="Back" onPress={() => router.back()} style={st.back}>
            <Icon name="chevron-left" size={22} tint={color.ink} strokeWidth={2} />
          </Pressable>
          <Text style={st.title} numberOfLines={1}>
            {itemTitle(item)}
          </Text>
        </View>
      }>
      <View style={st.topCard}>
        <CareIcon type={item.type} />
        <View style={{ flexDirection: 'column', gap: 2, minWidth: 0, flexGrow: 1, flexShrink: 1 }}>
          <Text style={st.name}>{itemLine(item)}</Text>
          <Text style={st.sub}>{kid ? kid.name : 'Whole family'}</Text>
        </View>
        {isFood(item.type) ? (
          <View style={st.tag}>
            <Text style={st.tagText}>Food</Text>
          </View>
        ) : null}
      </View>
      <View style={st.card}>
        <View style={[st.row, st.line]}>
          <Text style={st.label}>Time</Text>
          <Text style={st.value}>{timeRangeLabel(item.starts, item.ends)}</Text>
        </View>
        <View style={st.row}>
          <Text style={st.label}>Days</Text>
          <Text style={st.value}>{scheduleLabel(item)}</Text>
        </View>
      </View>
      {how ? (
        <>
          <Text style={st.section}>HOW</Text>
          <View style={st.howCard}>
            <Text style={st.how}>{how}</Text>
          </View>
        </>
      ) : null}
      <HelperNote what="the care plan" />
    </Screen>
  );
}

// Values from wireframe P20v (header from P19e / P55).
const st = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingTop: 16, paddingHorizontal: 20, paddingBottom: 4 }, // + 4 content top = 8
  back: { width: 44, height: 44, borderRadius: 22, borderWidth: 1, borderColor: color.line, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  title: { fontFamily: font.display, fontSize: 22, color: color.ink, marginVertical: -4.62, flexGrow: 1, flexShrink: 1 },
  topCard: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, backgroundColor: '#FFFFFF', borderRadius: 24, ...cardShadow },
  name: { fontFamily: font.bodySemi, fontSize: 16, color: color.ink },
  sub: { fontFamily: font.body, fontSize: 13, color: color.ink2 },
  tag: { height: 24, paddingHorizontal: 8, justifyContent: 'center', backgroundColor: color.accentTint, borderRadius: 999, flexShrink: 0 },
  tagText: { fontFamily: font.bodyBold, fontSize: 12, color: color.ink },
  card: { paddingHorizontal: 16, backgroundColor: '#FFFFFF', borderRadius: 24, ...cardShadow },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, minHeight: 50 },
  line: { borderBottomWidth: 1, borderBottomColor: color.divider },
  label: { fontFamily: font.body, fontSize: 15, color: color.ink, flexShrink: 1 },
  value: { fontFamily: font.body, fontSize: 15, color: color.ink2, flexShrink: 1, textAlign: 'right' },
  section: { fontFamily: font.bodyBold, fontSize: 13, color: color.ink2, letterSpacing: 0.6, marginTop: SECTION_GAP },
  howCard: { paddingVertical: 14, paddingHorizontal: 16, backgroundColor: '#FFFFFF', borderRadius: 24, ...cardShadow },
  how: { fontFamily: font.body, fontSize: 15, lineHeight: 22, color: color.ink },
});
