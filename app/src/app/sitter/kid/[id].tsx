import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Button, Loading, Screen } from '@/components/ui';
import { api, useQuery } from '@/lib/data';
import { formatTime } from '@/lib/care-plan';
import { firstName } from '@/lib/format';
import { ageInMonths, ageLabel } from '@/lib/kid-profile';
import { useSession } from '@/lib/session';
import { color, font } from '@/theme';
import { Text } from '@/components/Text';

// Wireframe S26 NewChild, translated from app/src/wireframes/S26.tsx: the sheet a sitter gets when a parent adds a
// child and turns on "Tell Maya about Mia" (P21; push from migration 21 opens /sitter/kid/<id>). Shows the kid's
// food to avoid, naps and bedtime from the care plan, and comfort item; rows without data are left out.
// Left out until built: "The family asks for Infant CPR. Yours expires Oct 22." (requirements, S27). Not drawn: the
// kid can't be seen (turned off again, or not signed): "You can’t see this child’s details." with Got it.
const STRIPES = ['#2F6FD6', '#D9822B', '#8676B3']; // S50 family colors, in join order

export default function NewChild() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { sitterLinks } = useSession();
  const { data, loading } = useQuery(async () => {
    const kid = await api.kid(id);
    const [care, parents] = await Promise.all([api.kidCareItems(id).catch(() => []), api.familyParents(kid.family_id).catch(() => [])]);
    return { kid, care, parents };
  }, [id]);

  const done = () => (router.canGoBack() ? router.back() : router.replace('/sitter'));
  if (loading) return <Loading />;
  if (!data)
    return (
      <Screen bleedTop bg={color.surface} header={<View style={{ height: 24 }} />} footer={<Button label="Got it" onPress={done} />}>
        <Text style={st.sub}>You can’t see this child’s details.</Text>
      </Screen>
    );

  const { kid, care, parents } = data;
  const links = [...sitterLinks].sort((a, b) => +new Date(a.joined_at) - +new Date(b.joined_at));
  const i = links.findIndex((l) => l.family_id === kid.family_id);
  const familyName = links[i]?.family.name ?? '';
  const months = kid.birthdate ? ageInMonths(kid.birthdate) : null;
  const age = months == null ? '' : months < 12 ? `, ${ageLabel(kid.birthdate)}` : `, ${Math.floor(months / 12)}`;
  const pronoun = kid.gender === 'girl' ? 'her' : kid.gender === 'boy' ? 'him' : 'them';
  const by = parents[0] ? firstName(parents[0].full_name) : 'The family';
  const times = (type: 'nap' | 'bedtime') =>
    care
      .filter((c) => c.type === type && c.starts)
      .map((c) => formatTime(c.starts))
      .join(' · ');
  const rows = [
    ['Naps', times('nap')],
    ['Bedtime', times('bedtime')],
    ['Comfort item', kid.comfort_item ?? ''],
  ].filter(([, v]) => v);
  const foods = (kid.avoid_foods || '')
    .split(',')
    .map((f) => f.trim())
    .filter(Boolean);

  return (
    <Screen
      bleedTop
      bg={color.surface}
      gap={14}
      header={<View style={{ height: 24 }} />}
      footer={
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Button label="Full details" kind="tonal" style={{ flex: 1 }} onPress={() => router.replace(`/sitter/family/${kid.family_id}`)} />
          <Button label="Got it" style={{ flex: 1 }} onPress={done} />
        </View>
      }>
      {familyName ? (
        <View style={st.famRow}>
          <View style={[st.dot, { backgroundColor: STRIPES[Math.max(0, i) % STRIPES.length] }]} />
          <Text style={st.famName}>{familyName}</Text>
        </View>
      ) : null}
      <View style={st.kidRow}>
        <View style={[st.avatar, { backgroundColor: kid.color || color.accent }]}>
          <Text style={st.avatarText}>{kid.name[0]?.toUpperCase()}</Text>
        </View>
        <View style={{ flexShrink: 1 }}>
          <Text style={st.title}>
            Meet {kid.name}
            {age}
          </Text>
          <Text style={st.sub}>
            {by} added {pronoun} to the family
          </Text>
        </View>
      </View>
      {foods.length ? (
        <View style={st.food}>
          <Text style={st.foodTitle}>Food to avoid</Text>
          <Text style={st.foodText}>{foods.join(' · ')}</Text>
        </View>
      ) : null}
      {rows.length ? (
        <View style={st.facts}>
          {rows.map(([k, v], n) => (
            <View key={k} style={[st.fact, n < rows.length - 1 && st.line]}>
              <Text style={st.factKey}>{k}</Text>
              <Text style={st.factVal}>{v}</Text>
            </View>
          ))}
        </View>
      ) : null}
    </Screen>
  );
}

// Values from wireframe S26.
const st = StyleSheet.create({
  famRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  famName: { flexShrink: 1, fontFamily: font.bodySemi, fontSize: 14, color: color.ink2 },
  kidRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatar: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  avatarText: { fontFamily: font.display, fontSize: 24, color: color.ink },
  title: { fontFamily: font.display, fontSize: 24, color: color.ink, marginVertical: -5.22 },
  sub: { fontFamily: font.body, fontSize: 14, color: color.ink2 },
  food: { gap: 2, paddingVertical: 12, paddingHorizontal: 14, backgroundColor: color.badTint, borderRadius: 12 },
  foodTitle: { fontFamily: font.bodyBold, fontSize: 14, color: color.badInk },
  foodText: { fontFamily: font.body, fontSize: 14, color: '#6E2215' },
  facts: { paddingVertical: 4, paddingHorizontal: 14, backgroundColor: color.canvas, borderRadius: 12 },
  fact: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, minHeight: 50 },
  line: { borderBottomWidth: 1, borderBottomColor: color.divider },
  factKey: { flexShrink: 1, fontFamily: font.body, fontSize: 15, color: color.ink },
  factVal: { flexShrink: 1, fontFamily: font.bodySemi, fontSize: 15, color: color.ink },
});
