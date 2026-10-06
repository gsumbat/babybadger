import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { KidDot, kidSub, SafetyBox, TaskRows } from '@/components/bits';
import { LiveMap } from '@/components/LiveMap';
import { LogTimeline } from '@/components/LogTimeline';
import { Avatar, Button, Card, ErrorText, Loading, Pill, Screen, T } from '@/components/ui';
import { useShiftLive } from '@/lib/data';
import { dayOf, firstName, timeOf } from '@/lib/format';
import { routeLengthM, workedMinutes } from '@/lib/shift-logic';
import { errorText, supabase } from '@/lib/supabase';
import { color, font } from '@/theme';

// Live view (P4 detail) while on shift, report (P5) after clock-out, details before.
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
  const mins = workedMinutes(shift);
  const when = `${dayOf(shift.starts_at)} · ${timeOf(shift.starts_at)} – ${timeOf(shift.ends_at)}`;

  async function cancel() {
    const go = async () => {
      const { error: e } = await supabase.from('shifts').update({ status: 'cancelled' }).eq('id', shift.id);
      if (e) Alert.alert('Could not cancel', errorText(e));
      else router.back();
    };
    Alert.alert('Cancel this shift?', `${name} will be told it’s cancelled.`, [{ text: 'Keep it' }, { text: 'Cancel shift', style: 'destructive', onPress: go }]);
  }

  const taskCard = tasks.length > 0 && (
    <Card style={{ paddingVertical: 12 }}>
      <View style={st.cardHead}>
        <Text style={st.cardTitle}>{shift.status === 'completed' ? 'Tasks' : 'Today’s plan'}</Text>
        <Pill label={`${done} of ${tasks.length} done`} kind={done === tasks.length ? 'ok' : 'info'} />
      </View>
      <TaskRows tasks={tasks} round />
    </Card>
  );

  if (shift.status === 'completed')
    return (
      <Screen title="Shift report" subtitle={`${name} · ${dayOf(shift.starts_at)}`} back>
        <View style={st.blue}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <View>
              <Text style={st.blueSmall}>Time worked</Text>
              <Text style={st.blueBig}>
                {Math.floor(mins / 60)} h {String(mins % 60).padStart(2, '0')} m
              </Text>
            </View>
            <Text style={st.blueSmall}>
              {timeOf(shift.clock_in_at!)} – {timeOf(shift.clock_out_at!)}
            </Text>
          </View>
        </View>
        {points.length > 0 && (
          <View>
            <LiveMap points={points} height={170} />
            <T variant="small" style={{ marginTop: 6 }}>
              Route {(routeLengthM(points) / 1609).toFixed(1)} mi · shared only while clocked in
            </T>
          </View>
        )}
        <SafetyBox kids={kids} />
        {taskCard}
        <Card>
          <View style={st.cardHead}>
            <Text style={st.cardTitle}>Logs</Text>
            <T variant="small">{logs.length} entries</T>
          </View>
          <LogTimeline logs={logs} kids={kids} compact />
        </Card>
        <Card>
          <Text style={st.cardTitle}>Notes</Text>
          <T variant={shift.note ? 'body' : 'muted'}>{shift.note || `${name} didn’t leave a note.`}</T>
        </Card>
        {logs.some((l) => l.photo_path) && (
          <Card>
            <Text style={st.cardTitle}>Photos</Text>
            <LogTimeline logs={logs.filter((l) => l.photo_path)} kids={kids} />
          </Card>
        )}
      </Screen>
    );

  if (shift.status === 'active')
    return (
      <Screen title={`${name} is on shift`} subtitle={when} back>
        <View>
          <LiveMap points={points} height={260} />
          <View style={{ position: 'absolute', left: 12, top: 12 }}>
            <Pill label={`On shift · ${Math.floor(mins / 60)} h ${mins % 60} m`} />
          </View>
        </View>
        <SafetyBox kids={kids} />
        {taskCard}
        <Card>
          <Text style={st.cardTitle}>Today’s log</Text>
          <LogTimeline logs={logs} kids={kids} />
        </Card>
      </Screen>
    );

  return (
    <Screen
      title={shift.status === 'cancelled' ? 'Cancelled shift' : 'Booked shift'}
      subtitle={when}
      back
      footer={shift.status === 'scheduled' ? <Button label="Cancel shift" kind="outline" onPress={cancel} /> : undefined}>
      <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <Avatar name={name} size={48} />
        <View style={{ flex: 1 }}>
          <Text style={st.cardTitle}>{name}</Text>
          <T variant="muted">{shift.status === 'cancelled' ? 'This shift was cancelled' : 'Her location starts when she clocks in, not before'}</T>
        </View>
        <Pill label={shift.status === 'cancelled' ? 'Cancelled' : 'Booked'} kind={shift.status === 'cancelled' ? 'bad' : 'info'} />
      </Card>
      {kids.length > 0 && (
        <Card style={{ paddingVertical: 4 }}>
          {kids.map((k, i) => (
            <View key={k.id} style={[st.kidRow, i < kids.length - 1 && { borderBottomWidth: 1, borderBottomColor: color.divider }]}>
              <KidDot kid={k} />
              <View style={{ flex: 1 }}>
                <T variant="strong">{k.name}</T>
                {kidSub(k) ? <T variant="small">{kidSub(k)}</T> : null}
              </View>
            </View>
          ))}
        </Card>
      )}
      {taskCard}
    </Screen>
  );
}

const st = StyleSheet.create({
  blue: { backgroundColor: color.primary, borderRadius: 24, padding: 16, gap: 12 },
  blueSmall: { fontFamily: font.body, fontSize: 13, color: '#FFFFFF', opacity: 0.9 },
  blueBig: { fontFamily: font.display, fontSize: 32, color: '#FFFFFF' },
  cardHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { fontFamily: font.bodyBold, fontSize: 16, color: color.ink },
  kidRow: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 60 },
});
