import { router } from 'expo-router';
import { useState } from 'react';

import { ShiftList, WeekStrip } from '@/components/calendar';
import { ErrorText, Screen } from '@/components/ui';
import { api, useQuery } from '@/lib/data';
import { useSession } from '@/lib/session';

// Wireframe S6: week strip and the shifts families booked with you.
export default function SitterCalendar() {
  const { session, sitterLinks } = useSession();
  const uid = session!.user.id;
  const { data: shifts, error } = useQuery(() => api.sitterShifts(uid), [uid]);
  const [day, setDay] = useState(() => new Date());
  const fam = (fid: string) => sitterLinks.find((l) => l.family_id === fid)?.family.name ?? 'Family';
  return (
    <Screen title="Calendar">
      <ErrorText>{error}</ErrorText>
      <WeekStrip day={day} onDay={setDay} shifts={shifts ?? []} />
      <ShiftList shifts={shifts ?? []} day={day} title={(s) => fam(s.family_id)} onOpen={(s) => router.push(`/sitter/shift/${s.id}`)} empty="Nothing booked this day." />
    </Screen>
  );
}
