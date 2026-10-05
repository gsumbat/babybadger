import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';

import { LogTimeline } from '@/components/LogTimeline';
import { Banner, Button, Card, ErrorText, Field, Icon, type IconName, Label, Loading, Screen, T } from '@/components/ui';
import { useShiftLive } from '@/lib/data';
import { timeOf } from '@/lib/format';
import { type SharingMode, startSharing, stopSharing } from '@/lib/location-sharing';
import { useSession } from '@/lib/session';
import { formatClock } from '@/lib/shift-logic';
import { errorText, supabase } from '@/lib/supabase';
import type { LogKind } from '@/lib/types';
import { cardShadow, color, font } from '@/theme';

const QUICK: { kind: LogKind; label: string; icon: IconName }[] = [
  { kind: 'food', label: 'Food', icon: 'coffee' },
  { kind: 'nap', label: 'Nap', icon: 'moon' },
  { kind: 'activity', label: 'Activity', icon: 'play-circle' },
  { kind: 'photo', label: 'Photo', icon: 'camera' },
  { kind: 'diaper', label: 'Diaper', icon: 'droplet' },
  { kind: 'note', label: 'Note', icon: 'file-text' },
];

export default function SitterShift() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { sitterLinks } = useSession();
  const { bundle, error, reload } = useShiftLive(id);
  const [mode, setMode] = useState<SharingMode | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [closing, setClosing] = useState(false);
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

  async function toggle(taskId: string, done: boolean) {
    const { error: e } = await supabase.rpc('set_task_done', { p_task: taskId, p_done: done });
    if (e) Alert.alert('Couldn’t update', errorText(e));
    reload();
  }

  async function clockOut() {
    setBusy(true);
    const { error: e } = await supabase.rpc('clock_out', { p_shift: shift.id, p_note: note.trim() });
    setBusy(false);
    if (e) return Alert.alert('Couldn’t clock out', errorText(e));
    await stopSharing();
    router.replace('/sitter');
  }

  if (shift.status !== 'active')
    return (
      <Screen title={family} back>
        <Banner icon="info">{shift.status === 'completed' ? `Shift ended at ${timeOf(shift.clock_out_at!)}. Location sharing is off.` : 'This shift isn’t active.'}</Banner>
        <Label>Logs</Label>
        <Card>
          <LogTimeline logs={logs} kids={kids} />
        </Card>
      </Screen>
    );

  if (closing)
    return (
      <Screen
        title="Wrap up"
        back={false}
        footer={
          <>
            <Button label="Clock out and send report" onPress={clockOut} busy={busy} />
            <Button label="Not yet" kind="ghost" onPress={() => setClosing(false)} />
          </>
        }>
        <T>{tasks.filter((t) => t.done_at).length} of {tasks.length} tasks done · {logs.length} logs</T>
        <Field label="A note for the parents (optional)" value={note} onChangeText={setNote} multiline placeholder="Great afternoon. Leo napped 1 h 25 min." />
        <T variant="muted">Location sharing stops the moment you clock out.</T>
      </Screen>
    );

  return (
    <Screen bg={color.canvas} footer={<Button label="Clock out" kind="outline" onPress={() => setClosing(true)} />}>
      <View style={{ backgroundColor: color.primary, borderRadius: 24, padding: 20, gap: 6 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ color: '#FFFFFF', fontFamily: font.bodySemi, fontSize: 15 }}>On shift · {family}</Text>
          <View style={{ backgroundColor: '#FFFFFF', borderRadius: 999, paddingHorizontal: 10, height: 28, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: mode === 'denied' ? color.bad : color.ok }} />
            <Text style={{ color: color.primary, fontFamily: font.bodyBold, fontSize: 12 }}>{mode === 'denied' ? 'Location off' : 'Sharing location'}</Text>
          </View>
        </View>
        <Text style={{ color: '#FFFFFF', fontFamily: font.display, fontSize: 44, lineHeight: 52 }}>{formatClock(Math.floor(secs / 60), secs % 60)}</Text>
        <Text style={{ color: '#FFFFFF', opacity: 0.85, fontFamily: font.body, fontSize: 14 }}>
          Ends {timeOf(shift.ends_at)} · {kids.map((k) => k.name).join(' and ') || 'Kids'}
        </Text>
      </View>
      {mode === 'foreground' && <Banner kind="warn" icon="alert-triangle">Keep this screen open: background location needs the full app build (not Expo Go).</Banner>}
      {mode === 'denied' && <Banner kind="bad" icon="map-pin">Location is off. Allow it for BabyBadger in Settings so the family can see the map.</Banner>}

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {QUICK.map((q) => (
          <Pressable key={q.kind} onPress={() => router.push({ pathname: '/sitter/log/[shiftId]', params: { shiftId: shift.id, kind: q.kind } })} style={({ pressed }) => [{ width: '31.5%', height: 76, borderRadius: 20, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', gap: 6, ...cardShadow }, pressed && { opacity: 0.8 }]}>
            <Icon name={q.icon} size={22} />
            <Text style={{ fontFamily: font.bodySemi, fontSize: 13, color: color.ink }}>{q.label}</Text>
          </Pressable>
        ))}
      </View>

      {kids.some((k) => k.avoid_foods) && (
        <Banner kind="bad" icon="alert-octagon">
          {kids.filter((k) => k.avoid_foods).map((k) => `${k.name} · avoid ${k.avoid_foods}`).join('\n')}
        </Banner>
      )}

      {tasks.length > 0 && (
        <>
          <Label right={<T variant="small">{tasks.filter((t) => t.done_at).length} of {tasks.length}</T>}>Tasks</Label>
          <Card style={{ paddingVertical: 4 }}>
            {tasks.map((t, i) => (
              <Pressable key={t.id} accessibilityRole="checkbox" accessibilityState={{ checked: !!t.done_at }} onPress={() => toggle(t.id, !t.done_at)} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 52, borderBottomWidth: i === tasks.length - 1 ? 0 : 1, borderBottomColor: color.divider }}>
                <Icon name={t.done_at ? 'check-square' : 'square'} tint={t.done_at ? color.primary : color.lineStrong} size={22} />
                <View style={{ flex: 1 }}>
                  <T style={t.done_at ? { color: color.quiet, textDecorationLine: 'line-through' } : undefined}>{t.title}</T>
                  {t.done_at ? <T variant="small">Done {timeOf(t.done_at)}</T> : null}
                </View>
              </Pressable>
            ))}
          </Card>
        </>
      )}

      <Label>Today’s log</Label>
      <Card>
        <LogTimeline logs={logs} kids={kids} />
      </Card>
    </Screen>
  );
}
