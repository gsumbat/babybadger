import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, View } from 'react-native';

import { LiveMap } from '@/components/LiveMap';
import { LogTimeline } from '@/components/LogTimeline';
import { Avatar, Banner, Button, Card, ErrorText, Icon, Label, Loading, Pill, Screen, T } from '@/components/ui';
import { useShiftLive } from '@/lib/data';
import { firstName, rangeOf, timeOf } from '@/lib/format';
import { safetyLine } from '@/lib/kid-profile';
import { formatDuration, routeLengthM, workedMinutes } from '@/lib/shift-logic';
import { errorText, supabase } from '@/lib/supabase';
import { color } from '@/theme';

export default function ParentShift() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { bundle, error } = useShiftLive(id);
  const [, tick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => tick((n) => n + 1), 30_000);
    return () => clearInterval(t);
  }, []);

  if (!bundle) return error ? <Screen title="Shift" back><ErrorText>{error}</ErrorText></Screen> : <Loading />;
  const { shift, tasks, logs, points, kids, sitter } = bundle;
  const name = firstName(sitter?.full_name);
  const done = tasks.filter((t) => t.done_at).length;
  const avoid = kids.map(safetyLine).filter(Boolean);

  async function cancel() {
    const go = async () => {
      const { error: e } = await supabase.from('shifts').update({ status: 'cancelled' }).eq('id', shift.id);
      if (e) Alert.alert('Could not cancel', errorText(e));
    };
    Alert.alert('Cancel this shift?', `${name} will be told it’s cancelled.`, [{ text: 'Keep it' }, { text: 'Cancel shift', style: 'destructive', onPress: go }]);
  }

  return (
    <Screen
      title={shift.status === 'completed' ? 'Shift report' : shift.status === 'active' ? `${name} is on shift` : 'Booked shift'}
      subtitle={rangeOf(shift.starts_at, shift.ends_at)}
      back
      footer={shift.status === 'scheduled' ? <Button label="Cancel shift" kind="outline" onPress={cancel} /> : undefined}>
      <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <Avatar name={name} />
        <View style={{ flex: 1 }}>
          <T variant="title">{name}</T>
          <T variant="muted">
            {shift.status === 'active' && `Clocked in ${timeOf(shift.clock_in_at!)} · ${formatDuration(workedMinutes(shift))}`}
            {shift.status === 'completed' && `Worked ${formatDuration(workedMinutes(shift))} · ${timeOf(shift.clock_in_at!)} – ${timeOf(shift.clock_out_at!)}`}
            {shift.status === 'scheduled' && 'Location starts when she clocks in'}
            {shift.status === 'cancelled' && 'Cancelled'}
          </T>
        </View>
        {shift.status === 'active' && <Pill label="Live" />}
        {shift.status === 'completed' && <Pill label="Done" kind="muted" />}
      </Card>

      {(shift.status === 'active' || points.length > 0) && (
        <>
          <LiveMap points={points} height={shift.status === 'active' ? 240 : 170} />
          {shift.status === 'completed' && points.length > 1 && <T variant="small">Route {(routeLengthM(points) / 1609).toFixed(1)} mi · {points.length} location points, only while clocked in</T>}
        </>
      )}

      {avoid.length > 0 && (
        <Banner kind="bad" icon="alert-octagon">
          {avoid.join('\n')}
        </Banner>
      )}

      {tasks.length > 0 && (
        <>
          <Label right={<T variant="small">{done} of {tasks.length} done</T>}>Tasks</Label>
          <Card style={{ gap: 10 }}>
            {tasks.map((t) => (
              <View key={t.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Icon name={t.done_at ? 'check-circle' : 'circle'} tint={t.done_at ? color.ok : color.lineStrong} />
                <T style={t.done_at ? { color: color.quiet, textDecorationLine: 'line-through' } : undefined}>{t.title}</T>
                {t.done_at ? <T variant="small" style={{ marginLeft: 'auto' }}>{timeOf(t.done_at)}</T> : null}
              </View>
            ))}
          </Card>
        </>
      )}

      <Label>{shift.status === 'completed' ? 'Logs' : 'Today’s log'}</Label>
      <Card>
        <LogTimeline logs={logs} kids={kids} />
      </Card>

      {shift.status === 'completed' && shift.note ? (
        <>
          <Label>{`${name}’s note`}</Label>
          <Card>
            <T>{shift.note}</T>
          </Card>
        </>
      ) : null}
    </Screen>
  );
}
