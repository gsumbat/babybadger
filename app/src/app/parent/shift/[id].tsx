import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { KidDot, SafetyBox, TaskRows, kidChipTone } from '@/components/bits';
import { LiveMap } from '@/components/LiveMap';
import { LogEntries, LogTypeChips, useLogLove } from '@/components/logFeed';
import { LogTimeline, PhotoThumb } from '@/components/LogTimeline';
import { EditableTasksCard } from '@/components/shiftTasks';
import { Avatar, Button, Card, Chip, ErrorText, Icon, Loading, Pill, Screen, T } from '@/components/ui';
import { planKidId } from '@/lib/care-plan';
import { useShiftLive } from '@/lib/data';
import { dayOf, firstName, timeOf } from '@/lib/format';
import { ageLabel } from '@/lib/kid-profile';
import { kidLogs, kidTasks, reportTitle, shiftLogRows } from '@/lib/shift-log-logic';
import { type LogFilter, useShiftReactions } from '@/lib/shift-log';
import { canEditShiftTasks, describeLog, workedMinutes } from '@/lib/shift-logic';
import { useSession } from '@/lib/session';
import { useCanManage } from '@/lib/use-family-role';
import { errorText, supabase } from '@/lib/supabase';
import { cardShadow, color, font } from '@/theme';
import { Text } from '@/components/Text';

// Live view (P4 detail) while on shift, report (P5) after clock-out, details before (P5b).
// P5e: on an upcoming or live shift a full-access parent edits Today's plan (add, rename, retime, remove; migration 34
// pushes the sitter). Read-only members, and completed or cancelled shifts, keep the read-only card.
// Kid filter (like the care plan): opened for one kid (P55's "Last report", ?kidId=) it is only her report (P5k:
// "Ava’s report", no chips). Opened for the family (Home, calendar, pushes) the report shows All · Ava · Leo chips under
// the header (2+ kids on the shift). A kid: her logs and the whole family's (lib/shift-log-logic kidLogs), tasks that
// don't name only other kids (tasks store no kid, so they match by name: kidTasks), photos likewise. The Logs card
// shows the whole log in place (type chips + timeline, components/logFeed), hers when a kid is picked. Time, pay, the map and the notes are the shift's. The live "Today’s log" card
// follows ?kidId= too (no chips drawn there).
export default function ParentShift() {
  const params = useLocalSearchParams<{ id: string; kidId?: string }>();
  const { id } = params;
  // Opened from a kid's profile: that kid's report only, no switching to All or another kid.
  const [scoped] = useState(() => !!params.kidId);
  const { bundle, error, reload } = useShiftLive(id);
  const { reactions, setReactions } = useShiftReactions(id);
  const [logFilter, setLogFilter] = useState<LogFilter>('all');
  const [, tick] = useState(0);
  // A family helper (migration 30) can't cancel a booking.
  const { familyRole, session } = useSession();
  const loved = useLogLove(id, session!.user.id, reactions, setReactions);
  const manage = useCanManage();
  useEffect(() => {
    const t = setInterval(() => tick((n) => n + 1), 30_000);
    return () => clearInterval(t);
  }, []);

  if (!bundle) return error ? <Screen title="Shift" back><ErrorText>{error}</ErrorText></Screen> : <Loading />;
  const { shift, points, kids, sitter } = bundle;
  const kidId = planKidId(kids, params.kidId);
  const kidName = kids.find((k) => k.id === kidId)?.name;
  // setParams keeps the choice in the route, so back / forward land on the same kid.
  const pick = (k: string | null) => router.setParams({ kidId: k ?? undefined });
  const logs = kidLogs(bundle.logs, kidId);
  const logParams = kidId ? { shiftId: shift.id, kidId } : { shiftId: shift.id };
  const name = firstName(sitter?.full_name);
  const tasks = shift.status === 'completed' ? kidTasks(bundle.tasks, kids, kidId) : bundle.tasks;
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

  const taskCard = manage && canEditShiftTasks(shift) ? (
    <EditableTasksCard shift={shift} tasks={tasks} onChanged={reload} />
  ) : tasks.length > 0 && (
    <Card style={{ paddingVertical: 12 }}>
      <View style={st.cardHead}>
        <Text style={st.cardTitle}>{shift.status === 'completed' ? 'Tasks' : 'Today’s plan'}</Text>
        <Pill label={`${done} of ${tasks.length} done`} kind={done === tasks.length ? 'ok' : 'info'} />
      </View>
      <TaskRows tasks={tasks} round />
    </Card>
  );

  // Wireframe P5, translated from its HTML (app/src/wireframes/P5.tsx). Left out until built: total pay,
  // Approve hours, Replay route, house-rules check.
  if (shift.status === 'completed') {
    const photos = logs.filter((l) => l.photo_path);
    // The log rows (incidents have their own cards): all of them for the count, the chosen type for the timeline.
    const notIncident = (r: { kind: string }) => r.kind !== 'incident';
    const allRows = shiftLogRows(bundle.logs, bundle.tasks, kids, 'all', kidId).filter(notIncident);
    const shownRows = logFilter === 'all' ? allRows : shiftLogRows(bundle.logs, bundle.tasks, kids, logFilter, kidId).filter(notIncident);
    const anyLog = bundle.logs.some((l) => l.kind !== 'incident');
    return (
      <Screen
        header={
          // P5 header: 20 px title and 14 px subtitle (the shared back header is 22 / 13).
          <View style={st.headWrap}>
            <View style={st.head}>
              <Pressable accessibilityRole="button" accessibilityLabel="Back" onPress={() => router.back()} style={st.backBtn}>
                <Icon name="chevron-left" size={22} tint={color.ink} strokeWidth={2} />
              </Pressable>
              <View style={{ flexShrink: 1 }}>
                <Text style={st.headTitle}>{reportTitle(kidName)}</Text>
                <Text style={st.headSub}>
                  {name} · {new Date(shift.starts_at).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                </Text>
              </View>
            </View>
            {!scoped && kids.length > 1 ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={st.chips} contentContainerStyle={st.chipRow}>
                <Chip label="All" on={!kidId} onPress={() => pick(null)} />
                {kids.map((k) => (
                  <Chip key={k.id} label={k.name} on={k.id === kidId} tone={kidChipTone(k)} onPress={() => pick(k.id)} lead={<KidDot kid={k} size={20} />} />
                ))}
              </ScrollView>
            ) : null}
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
        {/* Incidents (S24: a fall, an injury…) stand alone above the log, one red card each, like Notes. */}
        {logs
          .filter((l) => l.kind === 'incident')
          .map((l) => {
            const d = describeLog(l);
            const who = l.kid_ids?.length ? l.kid_ids.map((k) => kids.find((x) => x.id === k)?.name).filter(Boolean).join(', ') : '';
            return (
              <View key={l.id} style={st.incident}>
                <View style={st.cardHead}>
                  <Text style={st.incidentTitle}>{d.title}</Text>
                  <Text style={st.incidentTime}>{timeOf(l.happened_at)}</Text>
                </View>
                {who ? <Text style={st.incidentWho}>{who}</Text> : null}
                {d.detail ? <Text style={st.incidentText}>{d.detail}</Text> : null}
              </View>
            );
          })}
        {/* P5 Logs: the whole log right here (P77's type chips and timeline, "Love it" on photos), no "See all" page. */}
        <View style={st.card}>
          <View style={st.cardHead}>
            <Text style={st.cardTitle}>Logs</Text>
            {allRows.length ? <Text style={st.count}>{allRows.length}</Text> : null}
          </View>
          {/* The type chips show whenever the shift has any log, so they don't come and go as the kid changes. */}
          {anyLog ? <LogTypeChips filter={logFilter} onChange={setLogFilter} inset={16} /> : null}
          <View style={{ marginTop: 2 }}>
            <LogEntries rows={shownRows} filter={logFilter} loved={loved.mine} onLove={loved.toggle} live={false} />
          </View>
        </View>
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
        <Card onPress={() => router.push({ pathname: '/parent/log/[shiftId]', params: logParams })}>
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
                {/* Age only: food to avoid and allergies are for the sitter; parents wrote them. */}
                {ageLabel(k.birthdate) ? <T variant="small">{ageLabel(k.birthdate)}</T> : null}
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
  headWrap: { gap: 12, paddingTop: 16, paddingHorizontal: 20, paddingBottom: 8 }, // + 4 content top = 12
  head: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  // Kid chips under the header (as P7), edge to edge so a long row scrolls past the gutter.
  chips: { marginHorizontal: -20, flexGrow: 0 },
  chipRow: { gap: 8, paddingHorizontal: 20 },
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
  cardHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { fontFamily: font.bodyBold, fontSize: 15, color: color.ink },
  count: { fontFamily: font.bodyBold, fontSize: 13, color: color.ink2 },
  // An incident on the report: its own card, red tint, outside the log.
  incident: { gap: 4, paddingVertical: 14, paddingHorizontal: 16, backgroundColor: color.badTint, borderRadius: 24 },
  incidentTitle: { flexShrink: 1, fontFamily: font.bodyBold, fontSize: 15, color: color.badInk },
  incidentTime: { fontFamily: font.bodySemi, fontSize: 13, color: color.badInk },
  incidentWho: { fontFamily: font.bodyBold, fontSize: 13, color: color.ink },
  incidentText: { fontFamily: font.body, fontSize: 14, lineHeight: 20, color: color.ink },
  kidRow: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 60 },
});
