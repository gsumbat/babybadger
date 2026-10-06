import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { ErrorText, HomeHeader, Icon, type IconName, initialsOf, Screen } from '@/components/ui';
import { api, useQuery, useShiftLive } from '@/lib/data';
import { dayOf, firstName, timeOf } from '@/lib/format';
import { startSharing } from '@/lib/location-sharing';
import { useSession } from '@/lib/session';
import { clockInState, formatClock } from '@/lib/shift-logic';
import { errorText, supabase } from '@/lib/supabase';
import type { Shift } from '@/lib/types';
import { cardShadow, color, font } from '@/theme';

// Wireframes S3 (shift today) and S3b (no shift today), translated from their HTML (app/src/wireframes/S3*.tsx).
// Left out until built: Running late, Needs-you items other than consent, earnings and payout, most tools.
export default function SitterHome() {
  const { session, profile, sitterLinks } = useSession();
  const uid = session!.user.id;
  const { data: shifts, error, reload } = useQuery(() => api.sitterShifts(uid), [uid]);
  const [busy, setBusy] = useState<string>();
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const today = new Date(now);
  const famName = (fid: string) => sitterLinks.find((l) => l.family_id === fid)?.family.name ?? 'Family';
  const needsConsent = sitterLinks.filter((l) => l.status === 'needs_consent');
  const active = shifts?.find((s) => s.status === 'active');
  const upcoming = (shifts ?? []).filter((s) => s.status === 'scheduled' && new Date(s.ends_at).getTime() > now);
  const next = upcoming[0];
  const isToday = !!next && new Date(next.starts_at).toDateString() === today.toDateString();
  const focus = active ?? (isToday ? next : undefined);
  const then = upcoming.find((s) => s !== focus);

  const weekEnd = now + 7 * 864e5;
  const thisWeek = upcoming.filter((s) => new Date(s.starts_at).getTime() < weekEnd);
  const bookedH = Math.round(thisWeek.reduce((m, s) => m + (+new Date(s.ends_at) - +new Date(s.starts_at)) / 36e5, 0));

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
      gap={10}
      header={
        <HomeHeader
          variant="sitter"
          eyebrow={today.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
          title={`Hi ${firstName(profile?.full_name)}`}
          sub={!focus ? 'No shifts today' : undefined}
          initials={initialsOf(profile?.full_name)}
          onAvatar={() => router.navigate('/sitter/me')}
        />
      }>
      <ErrorText>{error}</ErrorText>

      {focus && <TodayCard shift={focus} family={famName(focus.family_id)} then={then} thenFamily={then ? famName(then.family_id) : ''} now={now} busy={busy === focus.id} onClockIn={() => clockIn(focus)} />}

      {!focus && next && (
        <Pressable accessibilityRole="button" onPress={() => router.navigate('/sitter/calendar')} style={st.nextCard}>
          <View style={st.dateTile}>
            <Text style={st.dateDow}>{new Date(next.starts_at).toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()}</Text>
            <Text style={st.dateNum}>{new Date(next.starts_at).getDate()}</Text>
          </View>
          <View style={{ flexGrow: 1, flexShrink: 1 }}>
            <Text style={st.nextLabel}>NEXT SHIFT · {inDays(next.starts_at, now)}</Text>
            <Text style={st.nextTitle} numberOfLines={1}>
              {famName(next.family_id).replace(/^The /, '')} · {timeOf(next.starts_at)} – {timeOf(next.ends_at)}
            </Text>
            <NextSub shiftId={next.id} />
          </View>
          <Icon name="chevron-right" size={18} tint={color.ink2} />
        </Pressable>
      )}

      {needsConsent.length > 0 && (
        <>
          <View style={st.labelRow}>
            <Text style={st.label}>NEEDS YOU</Text>
            <Text style={st.labelCount}>{needsConsent.length}</Text>
          </View>
          <View style={st.listCard}>
            {needsConsent.map((l, i) => (
              <Pressable key={l.family_id} accessibilityRole="button" onPress={() => router.push(`/sitter/consent/${l.family_id}`)} style={[st.needRow, i < needsConsent.length - 1 && st.line]}>
                <View style={[st.needIcon, { backgroundColor: color.warnTint }]}>
                  <Icon name="file-text" size={20} tint={color.warnInk} />
                </View>
                <View style={{ flexGrow: 1, flexShrink: 1, minWidth: 0 }}>
                  <Text style={st.needTitle}>Sign {l.family.name.replace(/^The /, '')}’s location notice</Text>
                  <Text style={st.needSub} numberOfLines={1}>
                    They can book you once it’s signed
                  </Text>
                </View>
                <Icon name="chevron-right" size={18} tint={color.ink2} />
              </Pressable>
            ))}
          </View>
        </>
      )}

      {!focus && !next && !needsConsent.length && (
        <View style={[st.listCard, { padding: 16, gap: 4 }]}>
          <Text style={st.needTitle}>No shifts booked</Text>
          <Text style={st.needSub}>Families book you from their app. Each shift shows here, with Clock in 15 minutes before it starts.</Text>
        </View>
      )}

      <View style={st.stats}>
        <Stat v={`${bookedH} h`} l="booked this week" />
        <Stat v={String(thisWeek.length)} l="shifts this week" line />
        <Stat v={String(sitterLinks.filter((l) => l.status === 'active').length)} l="families" line />
      </View>

      <View style={st.labelRow}>
        <Text style={st.label}>TOOLS</Text>
      </View>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <Tool icon="calendar" label="Calendar" onPress={() => router.navigate('/sitter/calendar')} />
        <Tool icon="users" label="Families" onPress={() => router.navigate('/sitter/families')} />
        <Tool icon="plus" label="Join a family" onPress={() => router.push('/sitter/join')} />
        <Tool icon="edit-2" label="My details" onPress={() => router.navigate('/sitter/me')} />
      </View>
    </Screen>
  );
}

function inDays(iso: string, now: number) {
  const a = new Date(now);
  a.setHours(0, 0, 0, 0);
  const b = new Date(iso);
  b.setHours(0, 0, 0, 0);
  const d = Math.round((+b - +a) / 864e5);
  return d <= 0 ? 'TODAY' : d === 1 ? 'TOMORROW' : `IN ${d} DAYS`;
}

function NextSub({ shiftId }: { shiftId: string }) {
  const { bundle } = useShiftLive(shiftId);
  if (!bundle) return null;
  const kids = bundle.kids.map((k) => k.name).join(' and ');
  return <Text style={st.needSub}>{[kids, bundle.tasks.length ? `${bundle.tasks.length} tasks so far` : ''].filter(Boolean).join(' · ')}</Text>;
}

function Stat({ v, l, line }: { v: string; l: string; line?: boolean }) {
  return (
    <View style={[st.stat, line && { borderLeftWidth: 1, borderLeftColor: color.divider }]}>
      <Text style={st.statValue}>{v}</Text>
      <Text style={st.statLabel}>{l}</Text>
    </View>
  );
}

function Tool({ icon, label, onPress }: { icon: IconName; label: string; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [st.tool, pressed && { opacity: 0.85 }]}>
      <Icon name={icon} size={22} />
      <Text style={st.toolText}>{label}</Text>
    </Pressable>
  );
}

function TodayCard({ shift, family, then, thenFamily, now, busy, onClockIn }: { shift: Shift; family: string; then?: Shift; thenFamily: string; now: number; busy: boolean; onClockIn: () => void }) {
  const { bundle } = useShiftLive(shift.id);
  const live = shift.status === 'active';
  const ci = clockInState(shift, new Date(now));
  const tasks = bundle?.tasks ?? [];
  const firstDue = tasks.find((t) => t.due_at)?.due_at;
  const secs = shift.clock_in_at ? Math.max(0, Math.floor((now - +new Date(shift.clock_in_at)) / 1000)) : 0;
  return (
    <View style={st.today}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text style={st.family} numberOfLines={1}>
          {family}
        </Text>
        <Text style={st.time}>
          {timeOf(shift.starts_at)} – {timeOf(shift.ends_at)}
        </Text>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        <View style={st.greenDot} />
        <Text style={st.okText}>
          {live ? `On shift · ${formatClock(Math.floor(secs / 60), secs % 60)} · sharing location` : [tasks.length ? `${tasks.length} tasks` : bundle?.kids.map((k) => k.name).join(' and '), firstDue ? `first ${timeOf(firstDue)}` : ''].filter(Boolean).join(', ')}
        </Text>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: !live && ci.kind !== 'open' }}
          onPress={live ? () => router.push(`/sitter/shift/${shift.id}`) : ci.kind === 'open' ? onClockIn : undefined}
          style={[st.clockIn, !live && ci.kind !== 'open' && { opacity: 0.5 }]}>
          {busy ? <ActivityIndicator color="#FFFFFF" /> : <Icon name="clock" size={20} tint="#FFFFFF" />}
          <Text style={st.clockInText}>{live ? 'Open shift' : 'Clock in'}</Text>
        </Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel="Family details" onPress={() => router.push(`/sitter/family/${shift.family_id}`)} style={st.round}>
          <Icon name="list" size={22} />
        </Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel="Messages" onPress={() => router.navigate('/sitter/messages')} style={st.round}>
          <Icon name="message-square" size={22} />
        </Pressable>
      </View>
      {!live && ci.kind === 'too_early' && <Text style={st.needSub}>Clock-in opens at {timeOf(ci.opensAt)}. Your location isn’t shared before then.</Text>}
      {then && (
        <View style={st.then}>
          <Text style={st.thenText}>
            <Text style={{ fontFamily: font.bodyBold }}>Then</Text> · {thenFamily.replace(/^The /, '')}, {dayOf(then.starts_at)}
          </Text>
          <Text style={st.thenTime}>
            {timeOf(then.starts_at)} – {timeOf(then.ends_at)}
          </Text>
        </View>
      )}
    </View>
  );
}

// Values from wireframe S3 / S3b.
const st = StyleSheet.create({
  today: { gap: 8, paddingVertical: 12, paddingHorizontal: 14, backgroundColor: '#FFFFFF', borderRadius: 24, borderWidth: 2, borderColor: color.primary, ...cardShadow },
  family: { fontFamily: font.display, fontSize: 18, color: color.ink, flexShrink: 1, marginVertical: -3.42 },
  time: { fontFamily: font.bodyBold, fontSize: 15, color: color.ink },
  greenDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: color.ok },
  okText: { fontFamily: font.bodySemi, fontSize: 13, color: color.okInk, flexShrink: 1 },
  clockIn: { flexGrow: 1, height: 48, borderRadius: 999, backgroundColor: color.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  clockInText: { fontFamily: font.displayBold, fontSize: 17, color: '#FFFFFF' },
  round: { width: 48, height: 48, borderRadius: 24, backgroundColor: color.primaryTint, alignItems: 'center', justifyContent: 'center' },
  then: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 8, borderTopWidth: 1, borderTopColor: color.divider },
  thenText: { fontFamily: font.body, fontSize: 13, color: color.ink, flexShrink: 1 },
  thenTime: { fontFamily: font.body, fontSize: 13, color: color.ink2 },
  nextCard: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14, paddingHorizontal: 16, backgroundColor: '#FFFFFF', borderRadius: 24, ...cardShadow },
  dateTile: { width: 52, height: 56, borderRadius: 14, backgroundColor: color.primaryTint, alignItems: 'center', justifyContent: 'center' },
  dateDow: { fontFamily: font.bodyBold, fontSize: 11, color: color.primaryStrong },
  dateNum: { fontFamily: font.display, fontSize: 22, color: color.primaryStrong, marginVertical: -5.62 },
  nextLabel: { fontFamily: font.bodyBold, fontSize: 12, color: color.ink2, letterSpacing: 0.4 },
  nextTitle: { fontFamily: font.display, fontSize: 18, color: color.ink, marginVertical: -3.42 },
  labelRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  label: { fontFamily: font.bodyBold, fontSize: 13, color: color.ink2, letterSpacing: 0.6 },
  labelCount: { fontFamily: font.bodyBold, fontSize: 13, color: color.ink2 },
  listCard: { paddingHorizontal: 14, backgroundColor: '#FFFFFF', borderRadius: 24, ...cardShadow },
  needRow: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 54 },
  line: { borderBottomWidth: 1, borderBottomColor: color.divider },
  needIcon: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  needTitle: { fontFamily: font.bodySemi, fontSize: 15, color: color.ink, lineHeight: 19 },
  needSub: { fontFamily: font.body, fontSize: 12, color: color.ink2, lineHeight: 16 },
  stats: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderRadius: 18, ...cardShadow },
  stat: { flex: 1, paddingVertical: 8, paddingHorizontal: 12 },
  statValue: { fontFamily: font.display, fontSize: 19, color: color.ink, marginVertical: -4.22 },
  statLabel: { fontFamily: font.body, fontSize: 12, color: color.ink2 },
  tool: { flex: 1, height: 62, borderRadius: 16, backgroundColor: color.primaryTint, alignItems: 'center', justifyContent: 'center', gap: 5, paddingHorizontal: 4 },
  toolText: { fontFamily: font.bodyBold, fontSize: 12, lineHeight: 14, color: color.primaryStrong, textAlign: 'center' },
});
