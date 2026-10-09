import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { kidBadge } from '@/components/bits';
import { ErrorText, Icon, Screen } from '@/components/ui';
import { api, useQuery } from '@/lib/data';
import { timeOf } from '@/lib/format';
import { useSession } from '@/lib/session';
import type { Kid, Shift } from '@/lib/types';
import { cardShadow, color, font } from '@/theme';
import { Text } from '@/components/Text';

// Wireframe S50, translated from its HTML (app/src/wireframes/S50.tsx).
// Families have no color of their own yet, so the side stripes take the wireframe's three colors in the order the
// sitter joined. Kids show only for families whose notice is signed (sitters can't see kids before that).
const STRIPES = ['#2F6FD6', '#D9822B', '#8676B3'];

export default function Families() {
  const { session, sitterLinks } = useSession();
  const uid = session!.user.id;
  const links = [...sitterLinks].sort((a, b) => +new Date(a.joined_at) - +new Date(b.joined_at));
  const activeIds = links.filter((l) => l.status === 'active').map((l) => l.family_id);
  const { data, error } = useQuery(async () => {
    const [shifts, kids] = await Promise.all([api.sitterShifts(uid), Promise.all(activeIds.map((id) => api.kids(id)))]);
    return { shifts, kids: kids.flat() };
  }, [uid, activeIds]);
  const [now] = useState(() => Date.now());

  return (
    <Screen
      gap={12}
      header={
        <View style={st.header}>
          <Text style={st.title}>Families</Text>
          <Pressable accessibilityRole="button" onPress={() => router.push('/sitter/join')} style={({ pressed }) => [st.join, pressed && { opacity: 0.85 }]}>
            <Icon name="plus" size={16} strokeWidth={2.2} />
            <Text style={st.joinText}>Join with a code</Text>
          </Pressable>
        </View>
      }>
      <ErrorText>{error}</ErrorText>
      <Text style={st.label}>YOUR FAMILIES · {links.length}</Text>
      {links.length > 0 && (
        <View style={st.card}>
          {links.map((l, i) => {
            const signed = l.status === 'active';
            const kids = (data?.kids ?? []).filter((k) => k.family_id === l.family_id);
            const next = (data?.shifts ?? []).find((s) => s.family_id === l.family_id && (s.status === 'scheduled' || s.status === 'active') && +new Date(s.ends_at) > now);
            const sub = !signed ? `Joined ${shortDate(l.joined_at)} · not bookable yet` : next ? `Next shift ${when(next, now)}` : data ? 'No shifts booked' : '';
            return (
              <Pressable
                key={l.family_id}
                accessibilityRole="button"
                onPress={() => router.push(signed ? `/sitter/family/${l.family_id}` : `/sitter/consent/${l.family_id}`)}
                style={[st.row, i < links.length - 1 && st.line]}>
                <View style={[st.stripe, { backgroundColor: STRIPES[i % STRIPES.length] }]} />
                <View style={st.text}>
                  <Text style={st.name}>{l.family.name}</Text>
                  {sub ? <Text style={st.sub}>{sub}</Text> : null}
                </View>
                <View style={{ flexDirection: 'row', flexShrink: 0 }}>
                  {kids.map((k, j) => (
                    <KidCircle key={k.id} kid={k} first={j === 0} />
                  ))}
                </View>
                {!signed && (
                  <View style={st.pill}>
                    <Text style={st.pillText}>Sign notice</Text>
                  </View>
                )}
                <Icon name="chevron-right" size={20} tint={color.ink2} />
              </Pressable>
            );
          })}
        </View>
      )}
      <Text style={st.note}>Each family sees only its own shifts. They never see the other families you work for.</Text>
    </Screen>
  );
}

function KidCircle({ kid, first }: { kid: Kid; first: boolean }) {
  return (
    <View style={[st.kid, { backgroundColor: kidBadge(kid).bg }, !first && { marginLeft: -10 }]}>
      <Text style={[st.kidLetter, { color: kidBadge(kid).ink }]}>{kid.name[0]?.toUpperCase()}</Text>
    </View>
  );
}

/** "Oct 5" */
function shortDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/** "Sat 10 AM" within the coming week, "Oct 14, 10 AM" after that. */
function when(s: Shift, now: number) {
  const d = new Date(s.starts_at);
  const time = timeOf(d).replace(':00', '');
  return +d - now < 6 * 864e5 ? `${d.toLocaleDateString('en-US', { weekday: 'short' })} ${time}` : `${shortDate(s.starts_at)}, ${time}`;
}

// Values from wireframe S50.
const st = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 20, paddingHorizontal: 20, paddingBottom: 8 },
  title: { fontFamily: font.display, fontSize: 26, color: color.ink, flexShrink: 1 },
  join: { flexDirection: 'row', alignItems: 'center', gap: 4, height: 36, paddingHorizontal: 12, backgroundColor: color.primaryTint, borderRadius: 999, flexShrink: 1 },
  joinText: { fontFamily: font.bodyBold, fontSize: 14, color: color.primary },
  label: { fontFamily: font.bodyBold, fontSize: 13, color: color.ink2, letterSpacing: 0.6 },
  card: { paddingHorizontal: 14, backgroundColor: '#FFFFFF', borderRadius: 24, ...cardShadow },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 76 },
  line: { borderBottomWidth: 1, borderBottomColor: color.divider },
  stripe: { alignSelf: 'stretch', width: 6, flexShrink: 0, marginVertical: 14, borderRadius: 3 },
  text: { gap: 2, minWidth: 0, flexGrow: 1, flexShrink: 1 },
  name: { fontFamily: font.bodyBold, fontSize: 16, color: color.ink },
  sub: { fontFamily: font.body, fontSize: 13, color: color.ink2 },
  kid: { width: 36, height: 36, flexShrink: 0, borderRadius: 18, borderWidth: 2, borderColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  kidLetter: { fontFamily: font.displayBold, fontSize: 15, color: '#FFFFFF' },
  pill: { flexDirection: 'row', alignItems: 'center', height: 26, flexShrink: 0, paddingHorizontal: 10, backgroundColor: color.warnTint, borderRadius: 999 },
  pillText: { fontFamily: font.bodyBold, fontSize: 12, color: color.warnInk },
  note: { fontFamily: font.body, fontSize: 13, color: color.ink2, lineHeight: 18 },
});
