import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SvgXml } from 'react-native-svg';

import { CHEVRON_S37, OnShift, ThreadChips } from '@/components/messages';
import { shortFamily, shortName, SitterThread } from '@/components/threads';
import { Empty, Screen, initialsOf } from '@/components/ui';
import { timeOf } from '@/lib/format';
import { threadKey, useUnread } from '@/lib/messages';
import { useSession } from '@/lib/session';
import { color, font } from '@/theme';
import { Text } from '@/components/Text';

// Wireframe S37 (app/src/wireframes/S37.tsx): chips switch between the families she has signed for; the thread is
// with that family's parents. `?family=` (push alerts) opens that family's thread. The thread itself (messages,
// quick replies, photo send, read markers) is components/threads SitterThread, shared with the stacked S37t screen
// (`sitter/thread/[familyId]`) that in-shift and Home "Message" links push.
// Family colors follow join order, like the Families tab (S50).
const DOTS = ['#2F6FD6', '#D9822B', '#8676B3'];

export default function Messages() {
  const { session, sitterLinks } = useSession();
  const uid = session!.user.id;
  const params = useLocalSearchParams<{ family?: string }>();
  const { top } = useSafeAreaInsets();
  // Dots keep each family's place in join order (S50), so they're numbered before the unsigned ones drop out.
  const families = useMemo(
    () =>
      [...sitterLinks]
        .sort((a, b) => +new Date(a.joined_at) - +new Date(b.joined_at))
        .map((l, i) => ({ ...l, dot: DOTS[i % DOTS.length] }))
        .filter((l) => l.status === 'active'),
    [sitterLinks],
  );
  const [picked, setPicked] = useState<{ id: string; param?: string }>();
  const wanted = picked && picked.param === params.family ? picked.id : params.family;
  const chosen = families.find((f) => f.family_id === wanted) ?? families[0];
  const { counts } = useUnread(families.length > 1);

  if (!chosen)
    return (
      <Screen
        bleedTop
        header={
          <View style={[st.header, { paddingTop: top + 16 }]}>
            <Text style={st.title}>Messages</Text>
          </View>
        }>
        <Empty icon="message-square" title="No families yet">
          Once you join a family and sign their notice, you can message the parents here.
        </Empty>
      </Screen>
    );

  const familyId = chosen.family_id;
  return (
    <SitterThread
      key={familyId}
      familyId={familyId}
      familyName={chosen.family.name}
      uid={uid}
      header={({ parents, onShift }) => (
        <View style={[st.header, { paddingTop: top + 16 }]}>
          <Text style={st.title}>Messages</Text>
          {families.length > 1 ? (
            <ThreadChips
              chips={families.map((f) => ({
                key: f.family_id,
                label: shortFamily(f.family.name),
                dot: f.dot,
                unread: f.family_id === familyId ? 0 : (counts[threadKey(f.family_id, uid)] ?? 0),
                on: f.family_id === familyId,
              }))}
              onPick={(id) => setPicked({ id, param: params.family })}
            />
          ) : null}
          <Pressable accessibilityRole="button" onPress={() => router.push(`/sitter/family/${familyId}`)} style={({ pressed }) => [st.person, pressed && { opacity: 0.85 }]}>
            <View style={st.avatar}>
              <Text style={st.avatarText}>{initialsOf(parents[0]?.full_name)}</Text>
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={st.name}>{[shortName(parents[0]?.full_name), shortFamily(chosen.family.name)].filter(Boolean).join(' · ')}</Text>
              {onShift ? <OnShift>{`You're on shift until ${timeOf(onShift.ends_at)}`}</OnShift> : null}
            </View>
            <SvgXml xml={CHEVRON_S37} width={20} height={20} style={{ flexShrink: 0 }} />
          </Pressable>
        </View>
      )}
    />
  );
}

// Values from wireframe S37.
const st = StyleSheet.create({
  header: { gap: 12, paddingHorizontal: 20, paddingBottom: 10, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: color.line },
  title: { fontFamily: font.display, fontSize: 24, color: color.ink },
  person: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: color.ink, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontFamily: font.displayBold, fontSize: 17, color: '#FFFFFF' },
  name: { fontFamily: font.displayBold, fontSize: 17, color: color.ink },
});
