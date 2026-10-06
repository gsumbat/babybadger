import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { WeekCalendar } from '@/components/calendar';
import { ErrorText, Screen } from '@/components/ui';
import { api, useQuery } from '@/lib/data';
import { useSession } from '@/lib/session';
import { color, font } from '@/theme';
import { Text } from '@/components/Text';

// Wireframe S6 (same week layout as P6b). Left out until built: Time off button, Day / Month switch.
export default function SitterCalendar() {
  const { session, sitterLinks } = useSession();
  const uid = session!.user.id;
  const { data: shifts, error } = useQuery(() => api.sitterShifts(uid), [uid]);
  // "The Lee family" -> "Lee", as in the wireframe's "Lee · 3–7 PM".
  const fam = (fid: string) => (sitterLinks.find((l) => l.family_id === fid)?.family.name ?? 'Family').replace(/^The /, '').replace(/ family$/i, '');
  return (
    <Screen
      gap={7}
      header={
        <View style={st.header}>
          <Text style={st.title}>Calendar</Text>
        </View>
      }>
      <ErrorText>{error}</ErrorText>
      <WeekCalendar shifts={shifts ?? []} title={(s) => fam(s.family_id)} onOpen={(s) => router.push(`/sitter/shift/${s.id}`)} emptyText="Free" />
    </Screen>
  );
}

// Values from wireframe S6. The title row is 40 high (the Time off button sets it); the week nav sits 12 below it,
// and Screen's content adds 4 on top, so the header keeps 8 at the bottom.
const st = StyleSheet.create({
  header: { minHeight: 40 + 20 + 8, justifyContent: 'center', paddingTop: 20, paddingHorizontal: 20, paddingBottom: 8 },
  title: { fontFamily: font.display, fontSize: 24, color: color.ink },
});
