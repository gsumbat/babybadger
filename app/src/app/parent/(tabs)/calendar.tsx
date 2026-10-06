import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { WeekCalendar } from '@/components/calendar';
import { ErrorText, Icon, Screen } from '@/components/ui';
import { api, useQuery } from '@/lib/data';
import { firstName } from '@/lib/format';
import { useSession } from '@/lib/session';
import { color, font } from '@/theme';
import { Text } from '@/components/Text';

// Wireframe P6b.
export default function Calendar() {
  const { family } = useSession();
  const fid = family!.id;
  const { data, error } = useQuery(async () => {
    const [shifts, sitters, kids] = await Promise.all([api.familyShifts(fid), api.familySitters(fid), api.kids(fid)]);
    return { shifts, sitters, kids };
  }, [fid]);
  // P6b on-shift line: "Ava and Leo · soccer 4:30" (the next-task part needs per-shift tasks, not loaded here).
  const names = (data?.kids ?? []).map((k) => k.name);
  const kidNames = names.length > 1 ? `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}` : (names[0] ?? '');
  const who = (id: string) => firstName(data?.sitters.find((x) => x.sitter_id === id)?.profile?.full_name);

  return (
    <Screen
      gap={8}
      header={
        // P6b header: 24 px title (the shared tab header is 26) and a 40 px Book button pinned to the top.
        <View style={st.head}>
          <Text style={st.title}>Calendar</Text>
          <Pressable accessibilityRole="button" onPress={() => router.push('/parent/shift/new')} style={st.book}>
            <Icon name="plus" size={16} tint="#FFFFFF" strokeWidth={2.6} />
            <Text style={st.bookText}>Book</Text>
          </Pressable>
        </View>
      }>
      <ErrorText>{error}</ErrorText>
      <WeekCalendar
        shifts={data?.shifts ?? []}
        title={(s) => who(s.sitter_id)}
        sub={(s) => (s.status === 'completed' ? 'Report ready' : s.status === 'active' ? kidNames : '')}
        onOpen={(s) => router.push(`/parent/shift/${s.id}`)}
        emptyText="No sitter"
        onEmpty={() => router.push('/parent/shift/new')}
      />
    </Screen>
  );
}

// Values from wireframe P6b.
const st = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 20, paddingHorizontal: 20, paddingBottom: 8 }, // + 4 content top = 12
  title: { flexShrink: 1, fontFamily: font.display, fontSize: 24, color: color.ink },
  book: { flexDirection: 'row', alignItems: 'center', gap: 6, height: 40, paddingHorizontal: 14, borderRadius: 999, backgroundColor: color.primary },
  bookText: { fontFamily: font.displayBold, fontSize: 15, color: '#FFFFFF' },
});
