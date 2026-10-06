import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SvgXml } from 'react-native-svg';

import { SafetyBox, TaskRows } from '@/components/bits';
import { ExtendRequestCard } from '@/components/timing';
import { LogTimeline } from '@/components/LogTimeline';
import { Banner, Button, Card, ChoicePill, ErrorText, Field, Icon, type IconName, Loading, Screen } from '@/components/ui';
import { api, useQuery, useShiftLive } from '@/lib/data';
import { firstName, timeOf } from '@/lib/format';
import { rulesApi, shiftRuleRows } from '@/lib/house-rules';
import { type SharingMode, startSharing, stopSharing } from '@/lib/location-sharing';
import { useSession } from '@/lib/session';
import { formatClock, workedMinutes } from '@/lib/shift-logic';
import { timingApi, usePendingExtension } from '@/lib/shift-timing';
import { nextShiftAfter } from '@/lib/shift-timing-logic';
import { errorText, supabase } from '@/lib/supabase';
import type { LogKind } from '@/lib/types';
import { cardShadow, color, font } from '@/theme';
import { Text } from '@/components/Text';

const TILES: { kind: LogKind | 'more'; label: string; icon: IconName }[] = [
  // Wireframe S4 shows Trip first; trips aren't built yet, so the row starts at Food (Nap is under More logs).
  { kind: 'food', label: 'Food', icon: 'coffee' },
  { kind: 'photo', label: 'Photo', icon: 'camera' },
  { kind: 'more', label: 'More logs', icon: 'plus' },
];
const MOODS = ['Great day', 'Bit tired', 'Upset tummy'];
// S4 House rules strip: bell from the wireframe.
const BELL = '<svg viewBox="0 0 24 24" fill="none" stroke="#7A4E0E" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z"/><path d="M10 20.5a2 2 0 0 0 4 0"/></svg>';
// Checkbox tick from the wireframes (2.6 stroke).
const CHECK = '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7" fill="none" stroke="#FFFFFF" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

// Wireframes S4 (on shift) and S9 (wrap up the shift).
export default function SitterShift() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { sitterLinks } = useSession();
  const { bundle, error, reload } = useShiftLive(id);
  const fid = bundle?.shift.family_id;
  const { data: parents } = useQuery(() => (fid ? api.familyParents(fid) : Promise.resolve([])), [fid]);
  // House rules (migration 09); until it runs there are none and the strip stays hidden.
  const { data: rules } = useQuery(() => (fid ? rulesApi.rules(fid).catch(() => []) : Promise.resolve([])), [fid]);
  // S25: a parent's open request to stay longer (migration 14), her rate with this family (Extra pay) and her other
  // shifts (the "Tight" warning when her next shift that day starts soon after).
  const { pending: extension, reload: reloadExtension } = usePendingExtension(id);
  const sid = bundle?.shift.sitter_id;
  const { data: rate } = useQuery(() => (fid && sid ? timingApi.sitterRate(fid, sid) : Promise.resolve(null)), [fid, sid]);
  const { data: myShifts } = useQuery(() => (extension && sid ? api.sitterShifts(sid) : Promise.resolve([])), [!!extension, sid]);
  const insets = useSafeAreaInsets();
  const [mode, setMode] = useState<SharingMode | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [closing, setClosing] = useState(false);
  const [mood, setMood] = useState<string>();
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  // Make sure sharing is running whenever this screen is open on an active shift (e.g. after the app restarted).
  const active = bundle?.shift.status === 'active';
  useEffect(() => {
    if (active && id) startSharing(id).then(setMode);
  }, [active, id]);

  if (!bundle) return error ? <Screen title="Shift" back><ErrorText>{error}</ErrorText></Screen> : <Loading />;
  const { shift, tasks, logs, kids } = bundle;
  const family = sitterLinks.find((l) => l.family_id === shift.family_id)?.family.name ?? 'Family';
  const secs = shift.clock_in_at ? Math.max(0, Math.floor((now - +new Date(shift.clock_in_at)) / 1000)) : 0;
  const done = tasks.filter((t) => t.done_at).length;
  const parent = firstName(parents?.[0]?.full_name) || 'the family';
  const rulesDue = shiftRuleRows(rules ?? [], logs, kids, shift.clock_in_at, new Date(now)).filter((r) => r.state === 'due').length;

  async function toggle(taskId: string, isDone: boolean) {
    const { error: e } = await supabase.rpc('set_task_done', { p_task: taskId, p_done: isDone });
    if (e) Alert.alert('Couldn’t update', errorText(e));
    reload();
  }

  async function clockOut() {
    setBusy(true);
    const text = [mood, note.trim()].filter(Boolean).join('. ');
    const { error: e } = await supabase.rpc('clock_out', { p_shift: shift.id, p_note: text });
    setBusy(false);
    if (e) return Alert.alert('Couldn’t clock out', errorText(e));
    await stopSharing();
    router.replace('/sitter');
  }

  const openLog = (kind: LogKind | 'more') => router.push({ pathname: '/sitter/log/[shiftId]', params: { shiftId: shift.id, kind } });

  if (shift.status !== 'active')
    return (
      <Screen title={family} subtitle={`${timeOf(shift.starts_at)} – ${timeOf(shift.ends_at)}`} back>
        <Banner icon="info">{shift.status === 'completed' ? `Shift ended at ${timeOf(shift.clock_out_at!)}. Location sharing is off.` : shift.status === 'scheduled' ? 'Clock in from Home, up to 15 minutes before the start. Your location isn’t shared before then.' : 'This shift was cancelled.'}</Banner>
        <SafetyBox kids={kids} />
        {tasks.length > 0 && (
          <Card style={{ paddingVertical: 8 }}>
            <Text style={st.cardTitle}>Tasks</Text>
            <TaskRows tasks={tasks} />
          </Card>
        )}
        {logs.length > 0 && (
          <Card>
            <Text style={st.cardTitle}>Logs</Text>
            <LogTimeline logs={logs} kids={kids} />
          </Card>
        )}
      </Screen>
    );

  if (closing) {
    const mins = workedMinutes(shift, new Date(now));
    return (
      // Wireframe S9, translated from its HTML (app/src/wireframes/S9.tsx). Left out until built: Fix times, Trips, report an injury.
      <Screen
        header={
          // S9 header: 16 top, 12 below the title (8 here + the content's 4).
          <View style={st.wrapHeader}>
            <Pressable accessibilityRole="button" accessibilityLabel="Back" onPress={() => setClosing(false)} style={st.back}>
              <Icon name="chevron-left" size={22} tint={color.ink} strokeWidth={2} />
            </Pressable>
            <View style={{ flexShrink: 1 }}>
              <Text style={st.wrapTitle}>Wrap up the shift</Text>
              <Text style={st.wrapSub}>{family}</Text>
            </View>
          </View>
        }
        footer={
          <>
            <Button label="Clock out and send report" onPress={clockOut} busy={busy} />
            <Text style={st.footNote}>Location sharing stops the moment you clock out.</Text>
          </>
        }>
        <View style={st.workedCard}>
          <View style={{ flexShrink: 1 }}>
            <Text style={st.workedLabel}>Time worked</Text>
            <Text style={st.worked}>
              {Math.floor(mins / 60)} h {String(mins % 60).padStart(2, '0')} m
            </Text>
            <Text style={st.workedRange}>
              {timeOf(shift.clock_in_at!).replace(/\s?[AP]M$/i, '')} – {timeOf(new Date(now))}
            </Text>
          </View>
        </View>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <View style={[st.statTile, { backgroundColor: color.okTint }]}>
            <Text style={[st.statNum, { color: color.okInk }]}>
              {done} / {tasks.length}
            </Text>
            <Text style={[st.statLbl, { color: color.okInk }]}>Tasks done</Text>
          </View>
          <View style={[st.statTile, { backgroundColor: color.accentTint }]}>
            <Text style={st.statNum}>{logs.filter((l) => l.kind === 'food').length}</Text>
            <Text style={st.statLbl}>Meals</Text>
          </View>
          {/* Trips aren't built yet: its slot stays empty so the tiles keep the wireframe's width. */}
          <View style={{ flexGrow: 1, flexShrink: 1, flexBasis: 0 }} />
        </View>
        <View style={{ gap: 8 }}>
          <Text style={st.fieldLabel}>How did it go?</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {MOODS.map((m) => (
              <ChoicePill key={m} label={m} on={mood === m} onPress={() => setMood(mood === m ? undefined : m)} />
            ))}
          </View>
        </View>
        <Field label={`Note for ${parent}`} value={note} onChangeText={setNote} multiline placeholder="Anything parents should know" style={{ minHeight: 96, height: 96, paddingBottom: 12 }} />
      </Screen>
    );
  }

  // Wireframe S4, translated from its HTML (app/src/wireframes/S4.tsx).
  return (
    <Screen
      bleedTop
      gap={10}
      footer={
        <Pressable accessibilityRole="button" onPress={() => setClosing(true)} style={st.clockOut}>
          <Text style={st.clockOutText}>Clock out</Text>
        </Pressable>
      }>
      <View style={[st.top, { paddingTop: insets.top + 24 }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={st.topSmall}>On shift · {family}</Text>
          <View style={st.sharing}>
            <View style={[st.dot, { backgroundColor: mode === 'denied' ? color.bad : color.ok }]} />
            <Text style={st.sharingText}>{mode === 'denied' ? 'Location off' : 'Sharing location'}</Text>
          </View>
        </View>
        <Text style={st.timer}>{formatClock(Math.floor(secs / 60), secs % 60)}</Text>
        <Text style={st.topSub}>
          Ends {timeOf(shift.ends_at)} · {kids.map((k) => k.name).join(' and ') || 'Kids'}
        </Text>
      </View>
      <View style={st.tiles}>
        {TILES.map((t) => (
          <Pressable key={t.kind} accessibilityRole="button" onPress={() => openLog(t.kind)} style={({ pressed }) => [st.tile, pressed && { opacity: 0.85 }]}>
            <Icon name={t.icon} size={24} />
            <Text style={st.tileText}>{t.label}</Text>
          </Pressable>
        ))}
      </View>

      {/* S25: the parent's request sits at the top of the shift until she answers. */}
      {extension && (() => {
        const next = nextShiftAfter(shift, myShifts ?? []);
        return (
          <ExtendRequestCard
            key={extension.id}
            request={extension}
            shift={shift}
            parentName={((n) => (n ? firstName(n) : 'Parent'))(parents?.find((p) => p.id === extension.requested_by)?.full_name)}
            rate={rate ?? null}
            next={next}
            nextFamily={next ? (sitterLinks.find((l) => l.family_id === next.family_id)?.family.name ?? '') : ''}
            onAnswered={() => {
              reloadExtension();
              reload();
            }}
          />
        );
      })()}
      {mode === 'foreground' && <Banner kind="warn" icon="alert-triangle">Keep this screen open: background location needs the full app build (not Expo Go).</Banner>}
      {mode === 'denied' && <Banner kind="bad" icon="alert-triangle">Location is off. Allow it for BabyBadger in Settings so the family can see the map.</Banner>}

      {tasks.length > 0 && (
        <View style={st.taskCard}>
          <View style={st.taskHead}>
            <Text style={st.taskHeadTitle}>Tasks from {parent}</Text>
            <Text style={st.taskHeadCount}>
              {done} of {tasks.length}
            </Text>
          </View>
          {tasks.map((t) => {
            const isDone = !!t.done_at;
            return (
              <Pressable key={t.id} accessibilityRole="checkbox" accessibilityState={{ checked: isDone }} onPress={() => toggle(t.id, !isDone)} style={st.taskRow}>
                <View style={[st.box, isDone && st.boxOn]}>{isDone ? <SvgXml xml={CHECK} width={16} height={16} style={{ flexShrink: 0 }} /> : null}</View>
                <View style={{ flexShrink: 1 }}>
                  <Text style={isDone ? st.taskDone : st.taskTitle}>{t.title}</Text>
                  {isDone ? <Text style={st.taskSub}>Done {timeOf(t.done_at!)}</Text> : t.due_at ? <Text style={st.taskSub}>{timeOf(t.due_at)}</Text> : null}
                </View>
              </Pressable>
            );
          })}
        </View>
      )}
      {/* Not in wireframe S4 (S23 "Something happened · log it" leads to S24, but the kid app isn't built): opens S24. */}
      <Pressable accessibilityRole="link" onPress={() => router.push(`/sitter/incident/${shift.id}`)} style={st.incident}>
        <Text style={st.incidentText}>Report an injury</Text>
      </Pressable>
      {/* S4's House rules strip -> S43. */}
      {!!rules?.length && (
        <Pressable accessibilityRole="button" onPress={() => router.push(`/sitter/shift-rules/${shift.id}`)} style={st.rules}>
          <SvgXml xml={BELL} width={20} height={20} style={{ flexShrink: 0 }} />
          <Text style={st.rulesText}>
            <Text style={st.rulesBold}>House rules</Text>
            {rulesDue ? ` · ${rulesDue} ${rulesDue === 1 ? 'log' : 'logs'} due` : ''}
          </Text>
          <Icon name="chevron-right" size={18} tint={color.warnInk} />
        </Pressable>
      )}
      {kids.filter((k) => k.avoid_foods || k.allergies).map((k) => (
        <View key={k.id} style={st.avoid}>
          <Text style={st.avoidText}>
            <Text style={st.avoidBold}>{k.name} · food to avoid: </Text>
            {[k.avoid_foods, k.allergies && `allergic to ${k.allergies}`].filter(Boolean).join(' · ')}
          </Text>
        </View>
      ))}
    </Screen>
  );
}

const st = StyleSheet.create({
  // values below come from wireframe S4
  top: { backgroundColor: color.primary, marginHorizontal: -20, marginTop: -4, paddingHorizontal: 20, paddingBottom: 56, gap: 6 },
  topSmall: { fontFamily: font.bodySemi, fontSize: 15, color: '#FFFFFF', flexShrink: 1 },
  timer: { fontFamily: font.display, fontSize: 44, color: '#FFFFFF', marginVertical: -9.24, letterSpacing: 1 },
  topSub: { fontFamily: font.body, fontSize: 14, color: '#FFFFFF', opacity: 0.85 },
  sharing: { backgroundColor: '#FFFFFF', borderRadius: 999, paddingHorizontal: 10, height: 28, flexDirection: 'row', alignItems: 'center', gap: 6 },
  sharingText: { fontFamily: font.bodyBold, fontSize: 12, color: color.primary },
  dot: { width: 8, height: 8, borderRadius: 4 },
  tiles: { flexDirection: 'row', gap: 8, marginTop: -46 },
  tile: { flex: 1, height: 76, borderRadius: 24, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', gap: 6, ...cardShadow },
  tileText: { fontFamily: font.bodySemi, fontSize: 13, color: color.ink },
  taskCard: { backgroundColor: '#FFFFFF', borderRadius: 24, paddingVertical: 6, paddingHorizontal: 16, ...cardShadow },
  taskHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10 },
  taskHeadTitle: { fontFamily: font.bodyBold, fontSize: 15, color: color.ink },
  taskHeadCount: { fontFamily: font.body, fontSize: 14, color: color.ink2 },
  taskRow: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 52, borderTopWidth: 1, borderTopColor: color.divider },
  box: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: color.lineStrong, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  boxOn: { borderColor: color.primary, backgroundColor: color.primary },
  taskTitle: { fontFamily: font.bodyMedium, fontSize: 15, color: color.ink },
  taskDone: { fontFamily: font.body, fontSize: 15, color: color.quiet, textDecorationLine: 'line-through' },
  taskSub: { fontFamily: font.body, fontSize: 13, color: color.quiet },
  rules: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, paddingHorizontal: 14, backgroundColor: color.warnTint, borderRadius: 12 },
  rulesText: { fontFamily: font.body, fontSize: 14, color: color.ink, flexGrow: 1, flexShrink: 1 },
  rulesBold: { fontFamily: font.bodyBold, color: color.warnInk },
  avoid: { backgroundColor: color.badTint, borderRadius: 12, paddingVertical: 10, paddingHorizontal: 14 },
  avoidText: { fontFamily: font.body, fontSize: 14, color: '#6E2215' },
  avoidBold: { fontFamily: font.bodyBold, color: color.badInk },
  incident: { alignSelf: 'flex-start', height: 36, justifyContent: 'center' },
  incidentText: { fontFamily: font.bodySemi, fontSize: 14, color: color.badInk, textDecorationLine: 'underline' },
  clockOut: { height: 52, borderRadius: 999, borderWidth: 1.5, borderColor: color.primary, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  clockOutText: { fontFamily: font.displayBold, fontSize: 17, color: color.primary },
  cardTitle: { fontFamily: font.bodyBold, fontSize: 16, color: color.ink },
  // S9 values
  workedCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: '#FFFFFF', borderRadius: 24, ...cardShadow },
  workedLabel: { fontFamily: font.body, fontSize: 13, color: color.ink2 },
  worked: { fontFamily: font.display, fontSize: 32, color: color.ink, marginVertical: -6.63 },
  workedRange: { fontFamily: font.body, fontSize: 13, color: '#5F6D74' },
  statTile: { flexGrow: 1, flexShrink: 1, flexBasis: 0, minWidth: 0, gap: 2, padding: 12, borderRadius: 16 },
  statNum: { fontFamily: font.display, fontSize: 20, color: color.ink },
  statLbl: { fontFamily: font.body, fontSize: 13, color: color.ink2 },
  fieldLabel: { fontFamily: font.bodySemi, fontSize: 14, color: color.ink },
  wrapHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingTop: 16, paddingHorizontal: 20, paddingBottom: 8 },
  back: { width: 44, height: 44, borderRadius: 22, borderWidth: 1, borderColor: color.line, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  wrapTitle: { fontFamily: font.display, fontSize: 20, color: color.ink },
  wrapSub: { fontFamily: font.body, fontSize: 14, color: color.ink2 },
  footNote: { fontFamily: font.body, fontSize: 13, color: color.ink2, textAlign: 'center' },
});
