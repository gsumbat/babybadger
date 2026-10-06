import { router } from 'expo-router';

import { WeekCalendar } from '@/components/calendar';
import { ErrorText, Screen } from '@/components/ui';
import { api, useQuery } from '@/lib/data';
import { useSession } from '@/lib/session';

// Wireframe S6 (same week layout as P6b).
export default function SitterCalendar() {
  const { session, sitterLinks } = useSession();
  const uid = session!.user.id;
  const { data: shifts, error } = useQuery(() => api.sitterShifts(uid), [uid]);
  const fam = (fid: string) => (sitterLinks.find((l) => l.family_id === fid)?.family.name ?? 'Family').replace(/^The /, '');
  return (
    <Screen title="Calendar" gap={8}>
      <ErrorText>{error}</ErrorText>
      <WeekCalendar shifts={shifts ?? []} title={(s) => fam(s.family_id)} onOpen={(s) => router.push(`/sitter/shift/${s.id}`)} emptyText="Free" />
    </Screen>
  );
}
