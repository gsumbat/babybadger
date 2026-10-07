import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';

import { KidDot, kidSub, SafetyBox, TaskRows } from '@/components/bits';
import { LiveMap } from '@/components/LiveMap';
import { LogTimeline, PhotoThumb } from '@/components/LogTimeline';
import { Avatar, Button, Card, ErrorText, Icon, Loading, Pill, Screen, T } from '@/components/ui';
import { useShiftLive } from '@/lib/data';
import { dayOf, firstName, timeOf } from '@/lib/format';
import { describeLog, workedMinutes } from '@/lib/shift-logic';
import { useSession } from '@/lib/session';
import { errorText, supabase } from '@/lib/supabase';
import { cardShadow, color, font } from '@/theme';
import { Text } from '@/components/Text';

// Live view (P4 detail) while on shift, report (P5) after clock-out, details before.
export default function ParentShift() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { bundle, error } = useShiftLive(id);
  const [, tick] = useState(0);
  // A family helper (migration 30) can't cancel a booking.
  const { familyRole } = useSession();
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

  // Wireframe P5, translated from its HTML (app/src/wireframes/P5.tsx). Left out until built: total pay,
  // Approve hours, Replay route, house-rules check, the full log page.
  if (shift.status === 'completed') {
    const photos = logs.filter((l) => l.photo_path);
    const hm = (iso: string) => timeOf(iso).replace(/\s?[AP]M$/i, '');
    const who = (ids: string[]) => (ids.length === 0 || (kids.length > 1 && ids.length === kids.length) ? (kids.length > 1 ? 'both' : '') : ids.map((i) => kids.find((k) => k.id === i)?.name).filter(Boolean).join(', '));
    return (
      <Screen
        header={
          // P5 header: 20 px title and 14 px subtitle (the shared back header is 22 / 13).
          <View style={st.head}>
            <Pressable accessibilityRole="button" accessibilityLabel="Back" onPress={() => router.back()} style={st.backBtn}>
              <Icon name="chevron-left" size={22} tint={color.ink} strokeWidth={2} />
            </Pressable>
            <View style={{ flexShrink: 1 }}>
              <Text style={st.headTitle}>Shift report</Text>
              <Text style={st.headSub}>
                {name} · {new Date(shift.starts_at).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
              </Text>
            </View>
          </View>
        }>
        <View style={st.blue}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' }}>
            <View style={{ flexShrink: 1 }}>
              <Text style={st.blueSmall}>Time worked</Text>
              <Text style={st.blueBig}>
                {Math.floor(mins / 60)} h {String(mins % 60).padStart(2, '0')} m
              </Text>
            </View>
            <Text style={st.blueSmall}>
              {timeOf(shift.clock_in_at!).replace(/\s?[AP]M$/i, '')} – {timeOf(shift.clock_out_at!)}
            </Text>
          </View>
        </View>
        {points.length > 0 && (
          <View style={st.mapBox}>
            <LiveMap points={points} height={130} flush />
          </View>
        )}
        <View style={st.card}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={st.cardTitle}>Tasks</Text>
            <View style={[st.smallPill, done < tasks.length && { backgroundColor: color.warnTint }]}>
              <Text style={[st.smallPillText, done < tasks.length && { color: color.warnInk }]}>
                {done} of {tasks.length} done
              </Text>
            </View>
          </View>
          <Text style={st.summary}>{tasks.length ? tasks.map((t) => (t.done_at ? t.title : `${t.title} (not done)`)).join(' · ') : 'No tasks were set for this shift.'}</Text>
        </View>
        {/* P5's Logs card opens the full log (P77, ended: P77d). */}
        <Pressable accessibilityRole="link" onPress={() => router.push({ pathname: '/parent/log/[shiftId]', params: { shiftId: shift.id } })} style={[st.card, { gap: 8 }]}>
          <View style={st.cardHead}>
            <Text style={st.cardTitle}>Logs</Text>
            {logs.length ? <Text style={st.seeAll}>See all {logs.length} ›</Text> : null}
          </View>
          {logs.length === 0 ? <Text style={st.summary}>Nothing logged.</Text> : null}
          {[...logs].reverse().map((l) => {
            const d = describeLog(l);
            return (
              <View key={l.id} style={{ flexDirection: 'row', gap: 10 }}>
                <Text style={st.logTime}>{hm(l.happened_at)}</Text>
                <Text style={[st.logText, l.urgent && { color: color.badInk }]}>{[d.title, who(l.kid_ids), d.detail].filter(Boolean).join(' · ')}</Text>
              </View>
            );
          })}
        </Pressable>
        <View style={st.card}>
          <Text style={st.cardTitle}>Notes</Text>
          <Text style={st.summary}>{shift.note || `${name} didn’t leave a note.`}</Text>
        </View>
        {photos.length > 0 && (
          <View style={st.card}>
            <Text style={st.cardTitle}>Photos</Text>
            <View style={{ gap: 8 }}>
              {Array.from({ length: Math.ceil(photos.length / 3) }, (_, r) => (
                <View key={r} style={{ flexDirection: 'row', gap: 8 }}>
                  {[0, 1, 2].map((c) => {
                    const l = photos[r * 3 + c];
                    return l ? <PhotoThumb key={l.id} path={l.photo_path!} style={st.thumb} /> : <View key={c} style={st.thumb} />;
                  })}
                </View>
              ))}
            </View>
          </View>
        )}
      </Screen>
    );
  }

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
        <Card onPress={() => router.push({ pathname: '/parent/log/[shiftId]', params: { shiftId: shift.id } })}>
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
      footer={shift.status === 'scheduled' && familyRole === 'parent' ? <Button label="Cancel shift" kind="outline" onPress={cancel} /> : undefined}>
      <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <Avatar name={name} size={48} />
        <View style={{ flex: 1 }}>
          <Text style={st.cardTitle}>{name}</Text>
          <T variant="muted">{shift.status === 'cancelled' ? 'This shift was cancelled' : 'Her location starts when she clocks in, not before'}</T>
        </View>
        <Pill label={shift.status === 'cancelled' ? 'Cancelled' : 'Confirmed'} kind={shift.status === 'cancelled' ? 'bad' : 'ok'} />
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
  // P5 values
  head: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingTop: 16, paddingHorizontal: 20, paddingBottom: 8 }, // + 4 content top = 12
  backBtn: { width: 44, height: 44, borderRadius: 22, borderWidth: 1, borderColor: color.line, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  headTitle: { fontFamily: font.display, fontSize: 20, color: color.ink },
  headSub: { fontFamily: font.body, fontSize: 14, color: color.ink2 },
  thumb: { flexGrow: 1, flexShrink: 1, flexBasis: 0, minWidth: 0, height: 64, borderRadius: 10 },
  blue: { backgroundColor: color.primary, borderRadius: 20, padding: 16, gap: 12 },
  blueSmall: { fontFamily: font.body, fontSize: 13, color: '#FFFFFF', opacity: 0.8 },
  blueBig: { fontFamily: font.display, fontSize: 32, color: '#FFFFFF', marginVertical: -6.63 },
  mapBox: { borderRadius: 20, borderWidth: 1, borderColor: color.line, overflow: 'hidden' },
  card: { gap: 10, paddingVertical: 14, paddingHorizontal: 16, backgroundColor: '#FFFFFF', borderRadius: 24, ...cardShadow },
  smallPill: { flexDirection: 'row', alignSelf: 'flex-start', alignItems: 'center', height: 24, paddingHorizontal: 8, borderRadius: 999, backgroundColor: color.okTint },
  smallPillText: { fontFamily: font.bodyBold, fontSize: 12, color: color.okInk },
  summary: { fontFamily: font.body, fontSize: 14, lineHeight: 20, color: color.ink2 },
  logTime: { width: 40, fontFamily: font.body, fontSize: 14, color: color.quiet },
  logText: { flexShrink: 1, fontFamily: font.body, fontSize: 14, color: color.ink },
  cardHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { fontFamily: font.bodyBold, fontSize: 15, color: color.ink },
  seeAll: { fontFamily: font.bodyBold, fontSize: 13, color: color.primary },
  kidRow: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 60 },
});
