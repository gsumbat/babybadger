import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { cardStyle, SafetyBox, TaskRows } from '@/components/bits';
import { LogTimeline } from '@/components/LogTimeline';
import { Banner, Button, Card, Chip, ErrorText, Field, Icon, type IconName, Label, Loading, Screen, Stat, T } from '@/components/ui';
import { useShiftLive } from '@/lib/data';
import { timeOf } from '@/lib/format';
import { type SharingMode, startSharing, stopSharing } from '@/lib/location-sharing';
import { useSession } from '@/lib/session';
import { formatClock, workedMinutes } from '@/lib/shift-logic';
import { errorText, supabase } from '@/lib/supabase';
import type { LogKind } from '@/lib/types';
import { color, font } from '@/theme';

const TILES: { kind: LogKind | 'more'; label: string; icon: IconName }[] = [
  { kind: 'food', label: 'Food', icon: 'coffee' },
  { kind: 'nap', label: 'Nap', icon: 'moon' },
  { kind: 'photo', label: 'Photo', icon: 'camera' },
  { kind: 'more', label: 'More logs', icon: 'plus' },
];
const MOODS = ['Great day', 'Bit tired', 'Upset tummy'];

// Wireframes S4 (on shift) and S9 (wrap up the shift).
export default function SitterShift() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { sitterLinks } = useSession();
  const { bundle, error, reload } = useShiftLive(id);
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
      <Screen
        title="Wrap up the shift"
        subtitle={family}
        back
        onBack={() => setClosing(false)}
        footer={
          <>
            <Button label="Clock out and send report" onPress={clockOut} busy={busy} />
            <T variant="small" style={{ textAlign: 'center' }}>
              Location sharing stops the moment you clock out.
            </T>
          </>
        }>
        <View style={[cardStyle, { padding: 16 }]}>
          <T variant="small">Time worked</T>
          <Text style={st.worked}>
            {Math.floor(mins / 60)} h {String(mins % 60).padStart(2, '0')} m
          </Text>
          <T variant="small">
            {timeOf(shift.clock_in_at!)} – {timeOf(new Date(now))}
          </T>
        </View>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Stat value={`${done}/${tasks.length}`} label="Tasks done" tint={color.okTint} />
          <Stat value={String(logs.filter((l) => l.kind === 'food').length)} label="Meals" tint={color.accentTint} />
          <Stat value={String(logs.length)} label="Logs" tint={color.primaryTint} />
        </View>
        <Text style={st.fieldLabel}>How did it go?</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {MOODS.map((m) => (
            <Chip key={m} label={m} on={mood === m} onPress={() => setMood(mood === m ? undefined : m)} />
          ))}
        </View>
        <Field label="Note for the parents" value={note} onChangeText={setNote} multiline placeholder="Anything parents should know" />
      </Screen>
    );
  }

  return (
    <Screen bleedTop scroll footer={<Button label="Clock out" kind="outline" onPress={() => setClosing(true)} />}>
      <View style={[st.top, { paddingTop: insets.top + 16 }]}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
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
            <Icon name={t.icon} size={22} tint={color.ink} />
            <Text style={st.tileText}>{t.label}</Text>
          </Pressable>
        ))}
      </View>

      {mode === 'foreground' && <Banner kind="warn" icon="alert-triangle">Keep this screen open: background location needs the full app build (not Expo Go).</Banner>}
      {mode === 'denied' && <Banner kind="bad" icon="map-pin">Location is off. Allow it for BabyBadger in Settings so the family can see the map.</Banner>}

      {tasks.length > 0 && (
        <Card style={{ paddingVertical: 10 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={st.cardTitle}>Tasks from the family</Text>
            <T variant="muted">
              {done} of {tasks.length}
            </T>
          </View>
          <TaskRows tasks={tasks} onToggle={(t) => toggle(t.id, !t.done_at)} />
        </Card>
      )}
      <SafetyBox kids={kids} />

      <Label>Today’s log</Label>
      <Card>
        <LogTimeline logs={logs} kids={kids} />
      </Card>
    </Screen>
  );
}

const st = StyleSheet.create({
  top: { backgroundColor: color.primary, marginHorizontal: -20, marginTop: -4, paddingHorizontal: 20, paddingBottom: 52, gap: 4 },
  topSmall: { fontFamily: font.bodySemi, fontSize: 15, color: '#FFFFFF' },
  timer: { fontFamily: font.display, fontSize: 44, color: '#FFFFFF' },
  topSub: { fontFamily: font.body, fontSize: 14, color: '#FFFFFF', opacity: 0.88 },
  sharing: { backgroundColor: '#FFFFFF', borderRadius: 999, paddingHorizontal: 10, height: 28, flexDirection: 'row', alignItems: 'center', gap: 6 },
  sharingText: { fontFamily: font.bodyBold, fontSize: 12, color: color.primary },
  dot: { width: 8, height: 8, borderRadius: 4 },
  tiles: { flexDirection: 'row', gap: 8, marginTop: -48 },
  tile: { flex: 1, height: 76, borderRadius: 20, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', gap: 6, shadowColor: color.edge, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 1, shadowRadius: 0, elevation: 2 },
  tileText: { fontFamily: font.bodySemi, fontSize: 13, color: color.ink },
  cardTitle: { fontFamily: font.bodyBold, fontSize: 16, color: color.ink },
  worked: { fontFamily: font.display, fontSize: 32, color: color.ink },
  fieldLabel: { fontFamily: font.bodyBold, fontSize: 13, color: color.ink2 },
});
