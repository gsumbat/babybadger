import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { OnShift } from '@/components/messages';
import { ParentThread } from '@/components/threads';
import { ErrorText, Icon, Loading, Screen } from '@/components/ui';
import { api, useQuery } from '@/lib/data';
import { firstName, timeOf } from '@/lib/format';
import { useSession } from '@/lib/session';
import { color, font } from '@/theme';
import { Text } from '@/components/Text';

// Wireframe P10 (app/src/wireframes/P10.tsx), the stacked version it draws: back button, the sitter's initial and
// name, "On shift until 7:00 PM", no chips, no tab bar. Pushed by the "Message" links (trip P8, request, log, sitter
// profile P11) so Back returns there; read-only members open it too (P10r: no "Running late" quick reply). The
// Messages tab is the same thread with S37's chips. Left out until built: the Call button (P10 draws it).
export default function ParentThreadScreen() {
  const { sitterId } = useLocalSearchParams<{ sitterId: string }>();
  const { session, family } = useSession();
  const { top } = useSafeAreaInsets();
  const { data: sitters, error } = useQuery(async () => (family ? api.familySitters(family.id) : []), [family?.id]);
  const back = () => (router.canGoBack() ? router.back() : router.replace('/parent'));

  if (!sitters && !error) return <Loading />;
  const sitter = sitters?.find((s) => s.sitter_id === sitterId);
  if (!family || !sitter)
    return (
      <Screen title="Messages" back onBack={back}>
        <ErrorText>{error || 'This sitter isn’t part of your family.'}</ErrorText>
      </Screen>
    );
  const name = firstName(sitter.profile?.full_name);
  return (
    <ParentThread
      stacked
      familyId={family.id}
      sitterId={sitterId}
      sitterName={name}
      uid={session!.user.id}
      header={({ onShift }) => (
        <View style={[st.header, { paddingTop: top + 12 }]}>
          <Pressable accessibilityRole="button" accessibilityLabel="Back" onPress={back} style={st.back}>
            <Icon name="chevron-left" size={22} tint={color.ink} strokeWidth={2} />
          </Pressable>
          <View style={st.avatar}>
            <Text style={st.avatarText}>{name.charAt(0).toUpperCase()}</Text>
          </View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={st.name}>{name}</Text>
            {onShift ? <OnShift>{`On shift until ${timeOf(onShift.ends_at)}`}</OnShift> : null}
          </View>
        </View>
      )}
    />
  );
}

// Values from wireframe P10.
const st = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingBottom: 12, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: color.line },
  back: { width: 44, height: 44, borderRadius: 22, borderWidth: 1, borderColor: color.line, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: color.primary, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  avatarText: { fontFamily: font.bodyBold, fontSize: 16, color: '#FFFFFF' },
  name: { fontFamily: font.displayBold, fontSize: 17, color: color.ink },
});
