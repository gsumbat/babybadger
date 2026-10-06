import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { cardStyle } from '@/components/bits';
import { ActionGrid, Button, Card, ErrorText, HomeHeader, Icon, initialsOf, Label, Screen, T } from '@/components/ui';
import { api, useQuery, useShiftLive } from '@/lib/data';
import { dayOf, firstName, timeOf } from '@/lib/format';
import { startSharing } from '@/lib/location-sharing';
import { useSession } from '@/lib/session';
import { clockInState, formatDuration, workedMinutes } from '@/lib/shift-logic';
import { errorText, supabase } from '@/lib/supabase';
import type { Shift } from '@/lib/types';
import { color, font } from '@/theme';

// Wireframes S3 (today), S3b (no shift today), S3c (setup).
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
  const isToday = next && new Date(next.starts_at).toDateString() === now.toDateString();
  const then = upcoming[1];

  const weekEnd = new Date(now);
  weekEnd.setDate(now.getDate() + 7);
  const thisWeek = upcoming.filter((s) => new Date(s.starts_at) < weekEnd);
  const bookedMin = thisWeek.reduce((m, s) => m + (+new Date(s.ends_at) - +new Date(s.starts_at)) / 60000, 0);

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
    <Screen
      header={
        <HomeHeader
          eyebrow={now.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
          title={`Hi ${firstName(profile?.full_name)}`}
          initials={initialsOf(profile?.full_name)}
          onAvatar={() => router.navigate('/sitter/me')}
        />
      }>
      <ErrorText>{error}</ErrorText>

      {active && (
        <Pressable onPress={() => router.push(`/sitter/shift/${active.id}`)} style={st.activeCard}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={st.activeSmall}>On shift · {famName(active.family_id)}</Text>
            <View style={st.sharing}>
              <View style={st.greenDot} />
              <Text style={st.sharingText}>Sharing location</Text>
            </View>
          </View>
          <Text style={st.activeBig}>{formatDuration(workedMinutes(active))}</Text>
          <Text style={st.activeSmall}>Ends {timeOf(active.ends_at)} · tap to open</Text>
        </Pressable>
      )}

      {!active && next && isToday && <TodayCard shift={next} family={famName(next.family_id)} then={then} thenFamily={then ? famName(then.family_id) : ''} busy={busy === next.id} onClockIn={() => clockIn(next)} />}

      {!active && next && !isToday && (
        <Pressable onPress={() => router.navigate('/sitter/calendar')} style={[cardStyle, st.nextCard]}>
          <View style={st.dateTile}>
            <Text style={st.dateDow}>{new Date(next.starts_at).toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()}</Text>
            <Text style={st.dateNum}>{new Date(next.starts_at).getDate()}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={st.cardLabel}>NEXT SHIFT · {dayOf(next.starts_at).toUpperCase()}</Text>
            <Text style={st.strong16}>
              {famName(next.family_id)} · {timeOf(next.starts_at)} – {timeOf(next.ends_at)}
            </Text>
          </View>
          <Icon name="chevron-right" size={18} tint={color.ink2} />
        </Pressable>
      )}

      {needsConsent.length > 0 && (
        <>
          <Label right={<T variant="small">{needsConsent.length}</T>}>Needs you</Label>
          <Card style={{ paddingVertical: 4 }}>
            {needsConsent.map((l, i) => (
              <Pressable key={l.family_id} onPress={() => router.push(`/sitter/consent/${l.family_id}`)} style={[st.needRow, i < needsConsent.length - 1 && st.line]}>
                <View style={[st.needIcon, { backgroundColor: color.warnTint }]}>
                  <Icon name="file-text" size={18} tint={color.warnInk} />
                </View>
                <View style={{ flex: 1 }}>
                  <T variant="strong">Sign {l.family.name}’s location notice</T>
                  <T variant="small">They can book you once it’s signed</T>
                </View>
                <Icon name="chevron-right" size={18} tint={color.ink2} />
              </Pressable>
            ))}
          </Card>
        </>
      )}

      {!active && !next && !needsConsent.length && (
        <Card>
          <T variant="strong">No shifts booked</T>
          <T variant="muted">Families book you from their app. You’ll see each shift here, with a Clock in button 15 minutes before it starts.</T>
        </Card>
      )}

      <View style={[cardStyle, st.stats]}>
        <Stat v={`${Math.round(bookedMin / 60)} h`} l={'booked this\nweek'} />
        <Stat v={String(thisWeek.length)} l={'shifts this\nweek'} />
        <Stat v={String(sitterLinks.filter((l) => l.status === 'active').length)} l={'families'} last />
      </View>

      <Label>Tools</Label>
      <ActionGrid
        items={[
          { icon: 'calendar', label: 'Calendar', onPress: () => router.navigate('/sitter/calendar') },
          { icon: 'users', label: 'Families', onPress: () => router.navigate('/sitter/families') },
          { icon: 'user-plus', label: 'Join a family', onPress: () => router.push('/sitter/join') },
          { icon: 'edit-2', label: 'My details', onPress: () => router.navigate('/sitter/me'), dot: needsConsent.length > 0 },
        ]}
      />
    </Screen>
  );
}

function Stat({ v, l, last }: { v: string; l: string; last?: boolean }) {
  return (
    <View style={[{ flex: 1, paddingHorizontal: 12, paddingVertical: 10 }, !last && { borderRightWidth: 1, borderRightColor: color.divider }]}>
      <Text style={{ fontFamily: font.display, fontSize: 20, color: color.ink }}>{v}</Text>
      <T variant="small">{l}</T>
    </View>
  );
}

function TodayCard({ shift, family, then, thenFamily, busy, onClockIn }: { shift: Shift; family: string; then?: Shift; thenFamily: string; busy: boolean; onClockIn: () => void }) {
  const { bundle } = useShiftLive(shift.id);
  const st2 = clockInState(shift);
  const firstTask = bundle?.tasks[0];
  return (
    <View style={[cardStyle, st.today]}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={st.family}>{family}</Text>
        <Text style={st.strong16}>
          {timeOf(shift.starts_at)} – {timeOf(shift.ends_at)}
        </Text>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        <View style={st.greenDot} />
        <Text style={st.okText}>
          {bundle?.kids.map((k) => k.name).join(' and ') || 'Kids'}
          {bundle?.tasks.length ? ` · ${bundle.tasks.length} tasks` : ''}
          {firstTask ? `, first: ${firstTask.title}` : ''}
        </Text>
      </View>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <Button label="Clock in" icon="clock" onPress={onClockIn} busy={busy} disabled={st2.kind !== 'open'} style={{ flex: 1 }} />
        <Pressable accessibilityRole="button" accessibilityLabel="Shift details" onPress={() => router.push(`/sitter/shift/${shift.id}`)} style={st.round}>
          <Icon name="list" size={20} tint={color.primary} />
        </Pressable>
      </View>
      {st2.kind === 'too_early' && <T variant="small">Clock-in opens at {timeOf(st2.opensAt)}. Your location isn’t shared before then.</T>}
      {then && (
        <View style={st.then}>
          <T variant="small" style={{ flex: 1 }}>
            <Text style={{ fontFamily: font.bodyBold, color: color.ink }}>Then </Text>
            {thenFamily} · {dayOf(then.starts_at)}
          </T>
          <T variant="small">
            {timeOf(then.starts_at)} – {timeOf(then.ends_at)}
          </T>
        </View>
      )}
    </View>
  );
}

const st = StyleSheet.create({
  today: { padding: 16, gap: 10, borderWidth: 2, borderColor: color.primary },
  family: { fontFamily: font.display, fontSize: 20, color: color.ink },
  strong16: { fontFamily: font.bodyBold, fontSize: 15, color: color.ink },
  okText: { fontFamily: font.bodySemi, fontSize: 13, color: color.okInk, flex: 1 },
  greenDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: color.ok },
  round: { width: 54, height: 54, borderRadius: 27, backgroundColor: color.primaryTint, alignItems: 'center', justifyContent: 'center' },
  then: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: color.divider, paddingTop: 10 },
  activeCard: { backgroundColor: color.primary, borderRadius: 24, padding: 16, gap: 4 },
  activeSmall: { fontFamily: font.bodySemi, fontSize: 14, color: '#FFFFFF' },
  activeBig: { fontFamily: font.display, fontSize: 34, color: '#FFFFFF' },
  sharing: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#FFFFFF', borderRadius: 999, paddingHorizontal: 10, height: 26 },
  sharingText: { fontFamily: font.bodyBold, fontSize: 12, color: color.primary },
  nextCard: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  dateTile: { width: 52, height: 56, borderRadius: 14, backgroundColor: color.canvas, alignItems: 'center', justifyContent: 'center' },
  dateDow: { fontFamily: font.bodyBold, fontSize: 11, color: color.ink2 },
  dateNum: { fontFamily: font.display, fontSize: 22, color: color.ink },
  cardLabel: { fontFamily: font.bodyBold, fontSize: 11, letterSpacing: 0.6, color: color.ink2 },
  needRow: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 62 },
  needIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  line: { borderBottomWidth: 1, borderBottomColor: color.divider },
  stats: { flexDirection: 'row' },
});
