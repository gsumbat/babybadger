import { router } from 'expo-router';
import { useState } from 'react';

import { Button, Card, ErrorText, Label, Pill, Row, Screen, T } from '@/components/ui';
import { api, useQuery } from '@/lib/data';
import { firstName, rangeOf } from '@/lib/format';
import { useSession } from '@/lib/session';
import type { Shift } from '@/lib/types';

const statusPill: Record<Shift['status'], { label: string; kind: 'ok' | 'info' | 'muted' | 'bad' }> = {
  active: { label: 'Live', kind: 'ok' },
  scheduled: { label: 'Booked', kind: 'info' },
  completed: { label: 'Done', kind: 'muted' },
  cancelled: { label: 'Cancelled', kind: 'bad' },
};

export default function Shifts() {
  const { family } = useSession();
  const fid = family!.id;
  const { data, error } = useQuery(async () => {
    const [shifts, sitters] = await Promise.all([api.familyShifts(fid), api.familySitters(fid)]);
    return { shifts, sitters };
  }, [fid]);
  const [now] = useState(() => Date.now());
  const upcoming = (data?.shifts ?? []).filter((s) => s.status === 'active' || (s.status === 'scheduled' && +new Date(s.ends_at) > now));
  const past = (data?.shifts ?? []).filter((s) => !upcoming.includes(s)).reverse().slice(0, 20);
  const who = (id: string) => firstName(data?.sitters.find((x) => x.sitter_id === id)?.profile?.full_name);

  const list = (rows: Shift[]) => (
    <Card style={{ paddingVertical: 4 }}>
      {rows.map((s, i) => (
        <Row key={s.id} icon="clock" title={rangeOf(s.starts_at, s.ends_at)} sub={who(s.sitter_id)} right={<Pill {...statusPill[s.status]} />} onPress={() => router.push(`/parent/shift/${s.id}`)} last={i === rows.length - 1} />
      ))}
    </Card>
  );

  return (
    <Screen title="Shifts" right={<Button label="Book" icon="plus" kind="tonal" style={{ height: 40 }} onPress={() => router.push('/parent/shift/new')} />}>
      <ErrorText>{error}</ErrorText>
      <Label>Coming up</Label>
      {upcoming.length ? list(upcoming) : <T variant="muted">No shifts booked.</T>}
      {past.length > 0 && (
        <>
          <Label>Past</Label>
          {list(past)}
        </>
      )}
    </Screen>
  );
}
