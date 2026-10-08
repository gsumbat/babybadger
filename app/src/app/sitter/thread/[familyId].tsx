import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SvgXml } from 'react-native-svg';

import { CHEVRON_S37, OnShift } from '@/components/messages';
import { shortFamily, SitterThread } from '@/components/threads';
import { Icon, initialsOf } from '@/components/ui';
import { firstName, timeOf } from '@/lib/format';
import { useSession } from '@/lib/session';
import { color, font } from '@/theme';
import { Text } from '@/components/Text';

// Wireframe S37t (app/src/wireframes/S37t.tsx): the thread with one family, pushed from the shift page (S4b
// Message) and other in-shift links, so Back returns there. Header: back, the first parent's initials, "Lee family",
// the adults' first names ("Jen, Dan") and "You're on shift until 7:00 PM"; tapping it opens S10. No chips and no
// tab bar. The thread itself is the Messages tab's (components/threads SitterThread).
export default function SitterThreadScreen() {
  const { familyId } = useLocalSearchParams<{ familyId: string }>();
  const { session, sitterLinks } = useSession();
  const { top } = useSafeAreaInsets();
  const name = sitterLinks.find((l) => l.family_id === familyId)?.family.name ?? 'Family';
  return (
    <SitterThread
      stacked
      familyId={familyId}
      familyName={name}
      uid={session!.user.id}
      header={({ parents, onShift }) => (
        <View style={[st.header, { paddingTop: top + 12 }]}>
          <Pressable accessibilityRole="button" accessibilityLabel="Back" onPress={() => (router.canGoBack() ? router.back() : router.replace('/sitter'))} style={st.back}>
            <Icon name="chevron-left" size={22} tint={color.ink} strokeWidth={2} />
          </Pressable>
          <Pressable accessibilityRole="button" onPress={() => router.push(`/sitter/family/${familyId}`)} style={({ pressed }) => [st.person, pressed && { opacity: 0.85 }]}>
            <View style={st.avatar}>
              <Text style={st.avatarText}>{initialsOf(parents[0]?.full_name)}</Text>
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={st.name} numberOfLines={1}>
                {shortFamily(name)}
              </Text>
              {parents.length ? (
                <Text style={st.sub} numberOfLines={1}>
                  {parents.map((p) => firstName(p.full_name)).join(', ')}
                </Text>
              ) : null}
              {onShift ? <OnShift>{`You're on shift until ${timeOf(onShift.ends_at)}`}</OnShift> : null}
            </View>
            <SvgXml xml={CHEVRON_S37} width={20} height={20} style={{ flexShrink: 0 }} />
          </Pressable>
        </View>
      )}
    />
  );
}

// Values from wireframe S37t.
const st = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingBottom: 12, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: color.line },
  back: { width: 44, height: 44, borderRadius: 22, borderWidth: 1, borderColor: color.line, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  person: { flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: color.ink, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  avatarText: { fontFamily: font.displayBold, fontSize: 17, color: '#FFFFFF' },
  name: { fontFamily: font.displayBold, fontSize: 17, color: color.ink },
  sub: { fontFamily: font.body, fontSize: 13, color: color.ink2 },
});
