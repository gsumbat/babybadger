import { router } from 'expo-router';
import { View } from 'react-native';

import { LiveMap } from '@/components/LiveMap';
import { Avatar, Button, Card, ErrorText, Label, Pill, Row, Screen, T } from '@/components/ui';
import { api, useQuery, useShiftLive } from '@/lib/data';
import { firstName, rangeOf, timeOf } from '@/lib/format';
import { describeLog, formatDuration, parentHomeState, workedMinutes } from '@/lib/shift-logic';
import { useSession } from '@/lib/session';

export default function ParentHome() {
  const { family, profile } = useSession();
  const fid = family!.id;
  const { data, error } = useQuery(async () => {
    const [shifts, kids, sitters] = await Promise.all([api.familyShifts(fid), api.kids(fid), api.familySitters(fid)]);
    return { shifts, kids, sitters };
  }, [fid]);

  const state = data ? parentHomeState(data.shifts) : null;
  const sitterName = (id: string) => firstName(data?.sitters.find((s) => s.sitter_id === id)?.profile?.full_name);

  return (
    <Screen title={family!.name} subtitle={`Hi ${firstName(profile?.full_name)}`}>
      <ErrorText>{error}</ErrorText>
      {state?.kind === 'live' && <LiveCard shiftId={state.shift.id} sitter={sitterName(state.shift.sitter_id)} />}
      {state?.kind === 'soon' && (
        <Card onPress={() => router.push(`/parent/shift/${state.shift.id}`)}>
          <Pill label={state.minutes === 0 ? 'Starting now' : `Starts in ${state.minutes} min`} kind="info" />
          <T variant="title">{sitterName(state.shift.sitter_id)} · {rangeOf(state.shift.starts_at, state.shift.ends_at)}</T>
          <T variant="muted">Her location starts when she clocks in, not before.</T>
        </Card>
      )}
      {state?.kind === 'ended' && (
        <Card onPress={() => router.push(`/parent/shift/${state.shift.id}`)}>
          <Pill label="Shift ended" kind="muted" />
          <T variant="title">{sitterName(state.shift.sitter_id)} worked {formatDuration(workedMinutes(state.shift))}</T>
          <T variant="muted">Clocked out at {timeOf(state.shift.clock_out_at!)}. Read the report.</T>
        </Card>
      )}
      {state?.kind === 'idle' && state.next && (
        <Card onPress={() => router.push(`/parent/shift/${state.next!.id}`)}>
          <Label>Next shift</Label>
          <T variant="title">{rangeOf(state.next.starts_at, state.next.ends_at)}</T>
          <T variant="muted">With {sitterName(state.next.sitter_id)}</T>
        </Card>
      )}

      {data && (data.kids.length === 0 || !data.sitters.some((s) => s.status === 'active') || data.shifts.length === 0) && (
        <>
          <Label>Get set up</Label>
          <Card style={{ paddingVertical: 4 }}>
            <Row icon="smile" title="Add your kids" sub={data.kids.length ? `${data.kids.length} added` : 'Names, foods to avoid'} onPress={() => router.push('/parent/kid/new')} right={data.kids.length ? <Pill label="Done" /> : undefined} />
            <Row icon="user-plus" title="Invite your sitter" sub="She signs the location notice when she joins" onPress={() => router.push('/parent/invite')} right={data.sitters.some((s) => s.status === 'active') ? <Pill label="Done" /> : undefined} />
            <Row icon="calendar" title="Book a shift" sub="Pick a time and add tasks" onPress={() => router.push('/parent/shift/new')} last />
          </Card>
        </>
      )}

      <Label>What do you need?</Label>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <Button label="Book a shift" icon="plus" kind="tonal" style={{ flex: 1 }} onPress={() => router.push('/parent/shift/new')} />
        <Button label="Invite" icon="user-plus" kind="tonal" style={{ flex: 1 }} onPress={() => router.push('/parent/invite')} />
      </View>
    </Screen>
  );
}

function LiveCard({ shiftId, sitter }: { shiftId: string; sitter: string }) {
  const { bundle } = useShiftLive(shiftId);
  if (!bundle) return null;
  const done = bundle.tasks.filter((t) => t.done_at).length;
  const lastLog = bundle.logs[0];
  return (
    <Card onPress={() => router.push(`/parent/shift/${shiftId}`)}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <Avatar name={sitter} />
        <View style={{ flex: 1 }}>
          <T variant="title">{sitter} is on shift</T>
          <T variant="muted">{formatDuration(workedMinutes(bundle.shift))} in · until {timeOf(bundle.shift.ends_at)}</T>
        </View>
        <Pill label="Live" />
      </View>
      <LiveMap points={bundle.points} height={180} />
      <T variant="muted">
        Tasks {done} of {bundle.tasks.length}
        {lastLog ? ` · Last log: ${describeLog(lastLog).title} at ${timeOf(lastLog.happened_at)}` : ''}
      </T>
    </Card>
  );
}
