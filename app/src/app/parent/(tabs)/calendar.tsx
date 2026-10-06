import { router } from 'expo-router';
import { Pressable, Text } from 'react-native';

import { WeekCalendar } from '@/components/calendar';
import { ErrorText, Icon, Screen } from '@/components/ui';
import { api, useQuery } from '@/lib/data';
import { firstName } from '@/lib/format';
import { useSession } from '@/lib/session';
import { color, font } from '@/theme';

// Wireframe P6b.
export default function Calendar() {
  const { family } = useSession();
  const fid = family!.id;
  const { data, error } = useQuery(async () => {
    const [shifts, sitters, kids] = await Promise.all([api.familyShifts(fid), api.familySitters(fid), api.kids(fid)]);
    return { shifts, sitters, kids };
  }, [fid]);
  const who = (id: string) => firstName(data?.sitters.find((x) => x.sitter_id === id)?.profile?.full_name);

  return (
    <Screen
      title="Calendar"
      gap={8}
      right={
        <Pressable accessibilityRole="button" onPress={() => router.push('/parent/shift/new')} style={{ height: 40, paddingHorizontal: 14, borderRadius: 999, backgroundColor: color.primary, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Icon name="plus" size={18} tint="#FFFFFF" />
          <Text style={{ fontFamily: font.displayBold, fontSize: 15, color: '#FFFFFF' }}>Book</Text>
        </Pressable>
      }>
      <ErrorText>{error}</ErrorText>
      <WeekCalendar
        shifts={data?.shifts ?? []}
        title={(s) => who(s.sitter_id)}
        sub={(s) => (s.status === 'completed' ? 'Report ready' : s.status === 'active' ? 'Live now' : '')}
        onOpen={(s) => router.push(`/parent/shift/${s.id}`)}
        emptyText="No sitter"
        onEmpty={() => router.push('/parent/shift/new')}
      />
    </Screen>
  );
}
