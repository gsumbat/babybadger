import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, View } from 'react-native';

import { Banner, Button, Card, ErrorText, Label, Pill, Row, Screen, T } from '@/components/ui';
import { api, useQuery } from '@/lib/data';
import { dayOf, firstName, rangeOf, timeOf } from '@/lib/format';
import { startSharing } from '@/lib/location-sharing';
import { useSession } from '@/lib/session';
import { clockInState, formatDuration, workedMinutes } from '@/lib/shift-logic';
import { errorText, supabase } from '@/lib/supabase';
import type { Shift } from '@/lib/types';

export default function SitterHome() {
  const { session, profile, sitterLinks } = useSession();
  const uid = session!.user.id;
  const { data: shifts, error, reload } = useQuery(() => api.sitterShifts(uid), [uid]);
  const [busy, setBusy] = useState<string>();
  const [, tick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => tick((n) => n + 1), 30_000);
    return () => clearInterval(t);
  }, []);

  const famName = (fid: string) => sitterLinks.find((l) => l.family_id === fid)?.family.name ?? 'Family';
  const needsConsent = sitterLinks.filter((l) => l.status === 'needs_consent');
  const now = new Date();
  const active = shifts?.find((s) => s.status === 'active');
  const upcoming = (shifts ?? []).filter((s) => s.status === 'scheduled' && new Date(s.ends_at) > now);
  const next = upcoming[0];
  const later = upcoming.slice(1, 6);

  async function clockIn(s: Shift) {
    setBusy(s.id);
    const { error: e } = await supabase.rpc('clock_in', { p_shift: s.id });
    if (e) {
      setBusy(undefined);
      return Alert.alert('Can’t clock in yet', errorText(e));
    }
    const mode = await startSharing(s.id);
    setBusy(undefined);
    if (mode === 'denied') Alert.alert('Location is off', 'The family can’t see the map until you allow location for BabyBadger in Settings.');
    router.push(`/sitter/shift/${s.id}`);
    reload();
  }

  return (
    <Screen title={`Hi ${firstName(profile?.full_name)}`} subtitle={now.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}>
      <ErrorText>{error}</ErrorText>
      {needsConsent.map((l) => (
        <Card key={l.family_id} onPress={() => router.push(`/sitter/consent/${l.family_id}`)}>
          <Pill label="Action needed" kind="warn" />
          <T variant="title">Sign {l.family.name}’s location notice</T>
          <T variant="muted">They can book you once you’ve read and signed it.</T>
        </Card>
      ))}

      {active && (
        <Card onPress={() => router.push(`/sitter/shift/${active.id}`)}>
          <Pill label="On shift · sharing location" />
          <T variant="title">{famName(active.family_id)}</T>
          <T variant="muted">{formatDuration(workedMinutes(active))} in · ends {timeOf(active.ends_at)}</T>
          <Button label="Open shift" onPress={() => router.push(`/sitter/shift/${active.id}`)} />
        </Card>
      )}

      {!active && next && (
        <>
          <Label>Next shift</Label>
          <NextShift shift={next} family={famName(next.family_id)} busy={busy === next.id} onClockIn={() => clockIn(next)} />
        </>
      )}

      {!active && !next && !needsConsent.length && <Banner icon="calendar">No shifts booked. Families book you from their app; you’ll see them here.</Banner>}

      {later.length > 0 && (
        <>
          <Label>Later</Label>
          <Card style={{ paddingVertical: 4 }}>
            {later.map((s, i) => (
              <Row key={s.id} icon="clock" title={famName(s.family_id)} sub={rangeOf(s.starts_at, s.ends_at)} last={i === later.length - 1} />
            ))}
          </Card>
        </>
      )}
    </Screen>
  );
}

function NextShift({ shift, family, busy, onClockIn }: { shift: Shift; family: string; busy: boolean; onClockIn: () => void }) {
  const st = clockInState(shift);
  return (
    <Card>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <T variant="title">{family}</T>
        <T variant="strong">{dayOf(shift.starts_at)}</T>
      </View>
      <T variant="muted">
        {timeOf(shift.starts_at)} – {timeOf(shift.ends_at)}
      </T>
      {st.kind === 'too_early' && <T variant="small">Clock-in opens at {timeOf(st.opensAt)}. Your location isn’t shared before then.</T>}
      <Button label="Clock in" icon="clock" onPress={onClockIn} busy={busy} disabled={st.kind !== 'open'} />
    </Card>
  );
}
