import { router } from 'expo-router';
import { useState } from 'react';

import { ShiftList, WeekStrip } from '@/components/calendar';
import { Button, ErrorText, Screen } from '@/components/ui';
import { api, useQuery } from '@/lib/data';
import { firstName } from '@/lib/format';
import { useSession } from '@/lib/session';

// Wireframes P6 / P6b: week strip, the selected day's shifts, then what's coming up.
export default function Calendar() {
  const { family } = useSession();
  const fid = family!.id;
  const { data, error } = useQuery(async () => {
    const [shifts, sitters] = await Promise.all([api.familyShifts(fid), api.familySitters(fid)]);
    return { shifts, sitters };
  }, [fid]);
  const [day, setDay] = useState(() => new Date());
  const who = (id: string) => firstName(data?.sitters.find((x) => x.sitter_id === id)?.profile?.full_name);

  return (
    <Screen title="Calendar" right={<Button label="Book" icon="plus" style={{ height: 44 }} onPress={() => router.push('/parent/shift/new')} />}>
      <ErrorText>{error}</ErrorText>
      <WeekStrip day={day} onDay={setDay} shifts={data?.shifts ?? []} />
      <ShiftList shifts={data?.shifts ?? []} day={day} title={(s) => who(s.sitter_id)} onOpen={(s) => router.push(`/parent/shift/${s.id}`)} empty="No sitter booked this day." />
    </Screen>
  );
}
