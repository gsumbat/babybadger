import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { RequestRow } from '@/components/poolRequest';
import { RunningLateSheet } from '@/components/timing';
import { ErrorText, HomeHeader, Icon, type IconName, initialsOf, Screen } from '@/components/ui';
import { api, useQuery, useShiftLive } from '@/lib/data';
import { dayOf, firstName, timeOf } from '@/lib/format';
import { familyPossessive, sitterRulesState } from '@/lib/house-rules';
import { startSharing } from '@/lib/location-sharing';
import { availabilityApi } from '@/lib/availability';
import { calendarFit, requestWindow, requestsApi, sitterRowSub, sitterRowTitle, timeLeft } from '@/lib/pool-requests';
import { useSession } from '@/lib/session';
import { clockInState, formatClock } from '@/lib/shift-logic';
import { errorText, supabase } from '@/lib/supabase';
import { checkClockInZone } from '@/lib/trips';
import type { Shift } from '@/lib/types';
import { cardShadow, color, font } from '@/theme';
import { Text } from '@/components/Text';

// Wireframes S3 (shift today), S3b (no shift today) and S3d (nothing booked), translated from their HTML
// (app/src/wireframes/S3*.tsx). "Running late?" opens S21 before clock-in. Needs you lists pool requests waiting for her answer (S3's "Lee family asks for Sat 6 – 10 PM" row, opens S33 / S20). Left out until built: Needs-you items other than consent, rules and requests, earnings and
// payout and most tools. Clock in checks the home zone first (S22 when she isn't there yet). Availability and Time off (tools, S3d's "Set your availability") open S11.
// Times follow the wireframe: "3:00 – 7:00 PM" on the today card, "7:30 – 10 PM" elsewhere.
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
  // Families that changed their Must house rules since she last agreed (S42 before her next shift).
  const activeIds = sitterLinks.filter((l) => l.status === 'active').map((l) => l.family_id);
  const { data: rulesDue } = useQuery(async () => {
    const states = await Promise.all(activeIds.map(async (fid) => ({ fid, ...(await sitterRulesState(fid, uid)) })));
    return states.filter((x) => x.needsAgreement).map((x) => x.fid);
  }, [activeIds, uid]);
  const needsRules = sitterLinks.filter((l) => rulesDue?.includes(l.family_id));
  // Pool requests waiting for her answer (S33 / S20). Nothing before migration 25 runs.
  const { data: requests } = useQuery(async () => {
    const list = await requestsApi.waitingForMe(uid).catch(() => []);
    return { list, off: list.length ? await availabilityApi.myTimeOff(uid).catch(() => []) : [] };
  }, [uid]);
  const asks = requests?.list ?? [];
  const active = shifts?.find((s) => s.status === 'active');
  const upcoming = (shifts ?? []).filter((s) => s.status === 'scheduled' && new Date(s.ends_at).getTime() > now);
  const next = upcoming[0];
  const isToday = !!next && new Date(next.starts_at).toDateString() === today.toDateString();
  const focus = active ?? (isToday ? next : undefined);
  const then = upcoming.find((s) => s !== focus);
  // S3d: nothing active and nothing coming up.
  const nothingBooked = !focus && !next;

  // S3: hours booked this week; S3b (no shift today): hours booked next week. Weeks start Monday, like the calendar.
  const monday = new Date(now);
  monday.setHours(0, 0, 0, 0);
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
  const weekFrom = +monday + (focus ? 0 : 7 * 864e5);
  const weekTo = weekFrom + 7 * 864e5;
  const inWeek = (shifts ?? []).filter((s) => s.status !== 'cancelled' && +new Date(s.starts_at) >= weekFrom && +new Date(s.starts_at) < weekTo);
  const bookedH = Math.round(inWeek.reduce((m, s) => m + (+new Date(s.ends_at) - +new Date(s.starts_at)) / 36e5, 0));

  async function clockIn(s: Shift) {
    setBusy(s.id);
    // Clock-in zone (migrations 16-17): outside the shift's home, S22 explains and offers "Clock in when I arrive".
    // No location (web, permission off) or no home on the map: allowed, as before.
    const zone = await checkClockInZone(s).catch(() => null);
    if (zone?.kind === 'away') {
      setBusy(undefined);
      return router.push(`/sitter/clockin/${s.id}`);
    }
    const { error: e } = await supabase.rpc('clock_in', { p_shift: s.id });
    if (e) {
      setBusy(undefined);
      // Refused until she agrees to the family's current house rules: open them (S42).
      if (/house rules/i.test(e.message)) return router.push(`/sitter/rules/${s.family_id}`);
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
          sub={nothingBooked ? 'Nothing booked yet' : !focus ? 'No shifts today' : undefined}
          initials={initialsOf(profile?.full_name)}
          onAvatar={() => router.navigate('/sitter/me')}
        />
      }>
      <ErrorText>{error}</ErrorText>

      {focus && <TodayCard shift={focus} family={famName(focus.family_id)} then={then} thenFamily={then ? famName(then.family_id) : ''} now={now} busy={busy === focus.id} onClockIn={() => clockIn(focus)} onCancelled={reload} />}

      {!focus && next && (
        <Pressable accessibilityRole="button" onPress={() => router.navigate('/sitter/calendar')} style={st.nextCard}>
          <View style={st.dateTile}>
            <Text style={st.dateDow}>{new Date(next.starts_at).toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()}</Text>
            <Text style={st.dateNum}>{new Date(next.starts_at).getDate()}</Text>
          </View>
          <View style={{ flexGrow: 1, flexShrink: 1 }}>
            <Text style={st.nextLabel}>NEXT SHIFT · {inDays(next.starts_at, now)}</Text>
            <Text style={st.nextTitle} numberOfLines={1}>
              {famName(next.family_id).replace(/^The /, '')} · {span(next.starts_at, next.ends_at)}
            </Text>
            <NextSub shiftId={next.id} />
          </View>
          <Icon name="chevron-right" size={18} tint={color.ink2} />
        </Pressable>
      )}

      {nothingBooked && (
        <>
          <View style={st.emptyCard}>
            <View style={st.emptyIcon}>
              <Icon name="calendar" size={34} />
            </View>
            <Text style={st.emptyTitle}>No shifts booked</Text>
            <Text style={st.emptyText}>When a family books you, the shift shows up here and you get a notification.</Text>
            <Pressable accessibilityRole="button" onPress={() => router.push('/sitter/availability')} style={st.availBtn}>
              <Text style={st.availText}>Set your availability</Text>
            </Pressable>
          </View>
          {sitterLinks.length > 0 && (
            <Pressable accessibilityRole="button" onPress={() => router.navigate('/sitter/families')} style={st.familiesRow}>
              <Icon name="users" size={22} />
              <View style={{ flexGrow: 1, flexShrink: 1 }}>
                <Text style={st.familiesTitle}>Your families</Text>
                <Text style={st.familiesSub} numberOfLines={1}>
                  {sitterLinks.map((l) => l.family.name).join(', ')}
                </Text>
              </View>
              <Icon name="chevron-right" size={20} tint={color.ink2} />
            </Pressable>
          )}
        </>
      )}

      {asks.length + needsConsent.length + needsRules.length > 0 && (
        <>
          <View style={st.labelRow}>
            <Text style={st.label}>NEEDS YOU</Text>
            <Text style={st.labelCount}>{asks.length + needsConsent.length + needsRules.length}</Text>
          </View>
          <View style={st.listCard}>
            {asks.map((r, i) => (
              <RequestRow
                key={`req-${r.id}`}
                title={sitterRowTitle(famName(r.family_id), requestWindow(r))}
                sub={sitterRowSub(calendarFit(requestWindow(r), requests?.off ?? [], shifts ?? []), timeLeft(r.expires_at, today, true))}
                last={i === asks.length - 1 && !needsRules.length && !needsConsent.length}
                sitter
                onPress={() => router.push({ pathname: '/sitter/request/[id]', params: { id: r.id } })}
              />
            ))}
            {needsRules.map((l, i) => (
              <Pressable key={`rules-${l.family_id}`} accessibilityRole="button" onPress={() => router.push(`/sitter/rules/${l.family_id}`)} style={[st.needRow, (i < needsRules.length - 1 || needsConsent.length > 0) && st.line]}>
                <View style={[st.needIcon, { backgroundColor: color.warnTint }]}>
                  <Icon name="file-text" size={20} tint={color.warnInk} />
                </View>
                <View style={{ flexGrow: 1, flexShrink: 1, minWidth: 0 }}>
                  <Text style={st.needTitle}>Agree to {familyPossessive(l.family.name).title} house rules</Text>
                  <Text style={st.needSub} numberOfLines={1}>
                    Needed before your next shift
                  </Text>
                </View>
                <Icon name="chevron-right" size={18} tint={color.ink2} />
              </Pressable>
            ))}
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

      {/* Pay stats (earned, payout) aren't built yet; only the booked hours are shown. S3d has no stats. */}
      {!nothingBooked && (
        <View style={st.stats}>
          <Stat v={`${bookedH} h`} l={focus ? 'booked this week' : 'booked next week'} />
        </View>
      )}

      <View style={st.labelRow}>
        <Text style={st.label}>TOOLS</Text>
      </View>
      {/* Built tools in the wireframe's order (Availability, Time off, ..., My details); the last tile keeps its empty
          slot so the tiles stay the wireframe's width. */}
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <Tool icon="clock" label="Availability" onPress={() => router.push('/sitter/availability')} />
        <Tool xml={TIME_OFF} label="Time off" onPress={() => router.push('/sitter/availability')} />
        <Tool icon="edit-2" label="My details" onPress={() => router.navigate('/sitter/me')} />
        <View style={{ flex: 1 }} />
      </View>
    </Screen>
  );
}

const MERIDIEM = /\s?([AP]M)$/i;
/** "3:00 – 7:00 PM" (zeros) or "7:30 – 10 PM": the shared AM/PM is written once. */
function span(start: string, end: string, zeros = false) {
  const clock = (iso: string) => (zeros ? timeOf(iso) : timeOf(iso).replace(':00', ''));
  const a = clock(start);
  const b = clock(end);
  const same = a.match(MERIDIEM)?.[1] === b.match(MERIDIEM)?.[1];
  return `${same ? a.replace(MERIDIEM, '') : a} – ${b}`;
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

function Stat({ v, l }: { v: string; l: string }) {
  return (
    <View style={st.stat}>
      <Text style={st.statValue}>{v}</Text>
      <Text style={st.statLabel}>{l}</Text>
    </View>
  );
}

// S3 "Time off" tool icon: a calendar with a cross.
const TIME_OFF =
  '<svg viewBox="0 0 24 24" fill="none" stroke="#47698A" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4M9.5 13.5l5 5M14.5 13.5l-5 5"/></svg>';

function Tool({ icon, xml, label, onPress }: { icon?: IconName; xml?: string; label: string; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [st.tool, pressed && { opacity: 0.85 }]}>
      {xml ? <SvgXml xml={xml} width={22} height={22} style={{ flexShrink: 0 }} /> : icon ? <Icon name={icon} size={22} /> : null}
      <Text style={st.toolText}>{label}</Text>
    </Pressable>
  );
}

function TodayCard({ shift, family, then, thenFamily, now, busy, onClockIn, onCancelled }: { shift: Shift; family: string; then?: Shift; thenFamily: string; now: number; busy: boolean; onClockIn: () => void; onCancelled: () => void }) {
  const { bundle } = useShiftLive(shift.id);
  const [lateOpen, setLateOpen] = useState(false);
  const [sentLate, setSentLate] = useState<number>();
  const lateMin = sentLate ?? (shift as Shift & { late_minutes?: number | null }).late_minutes ?? undefined;
  const live = shift.status === 'active';
  const ci = clockInState(shift, new Date(now));
  const tasks = bundle?.tasks ?? [];
  const firstDue = tasks.find((t) => t.due_at)?.due_at;
  const secs = shift.clock_in_at ? Math.max(0, Math.floor((now - +new Date(shift.clock_in_at)) / 1000)) : 0;
  const sameDay = !!then && new Date(then.starts_at).toDateString() === new Date(shift.starts_at).toDateString();
  // Before clock-in opens the button explains itself instead of adding a line under it (not in wireframe S3).
  const press = live
    ? () => router.push(`/sitter/shift/${shift.id}`)
    : ci.kind === 'open'
      ? onClockIn
      : ci.kind === 'too_early'
        ? () => Alert.alert('Clock-in opens at ' + timeOf(ci.opensAt), 'Your location isn’t shared before then.')
        : undefined;
  return (
    <View style={st.today}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text style={st.family} numberOfLines={1}>
          {family}
        </Text>
        <Text style={st.time}>
          {span(shift.starts_at, shift.ends_at, true)}
        </Text>
      </View>
      {/* S3: status on the left, "Running late?" (S21) on the right until she clocks in. */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexShrink: 1 }}>
          <View style={[st.greenDot, lateMin && !live ? { backgroundColor: color.warn } : null]} />
          <Text style={[st.okText, lateMin && !live ? { color: color.warnInk } : null]}>
            {/* S3e: after "Tell the family" the line confirms it until she clocks in. */}
            {!live && lateMin ? `Told the family · ${lateMin} min late` : live ? `On shift · ${formatClock(Math.floor(secs / 60), secs % 60)} · sharing location` : [tasks.length ? `${tasks.length} tasks` : bundle?.kids.map((k) => k.name).join(' and '), firstDue ? `first ${timeOf(firstDue).replace(MERIDIEM, '')}` : ''].filter(Boolean).join(', ')}
          </Text>
        </View>
        {!live && ci.kind !== 'ended' && (
          <Text accessibilityRole="button" numberOfLines={1} onPress={() => setLateOpen(true)} style={st.lateLink}>
            Running late?
          </Text>
        )}
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Pressable accessibilityRole="button" onPress={press} style={st.clockIn}>
          {busy ? <ActivityIndicator color="#FFFFFF" /> : <Icon name="clock" size={20} tint="#FFFFFF" strokeWidth={2} />}
          <Text style={st.clockInText}>{live ? 'Open shift' : 'Clock in'}</Text>
        </Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel="Family details" onPress={() => router.push(`/sitter/family/${shift.family_id}`)} style={st.round}>
          <Icon name="list" size={22} />
        </Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel="Messages" onPress={() => router.navigate('/sitter/messages')} style={st.round}>
          <Icon name="message-square" size={22} />
        </Pressable>
      </View>
      {!live && <RunningLateSheet open={lateOpen} onClose={() => setLateOpen(false)} onCancelled={onCancelled} onSent={setSentLate} shift={shift} family={family} tasks={tasks} />}
      {then && (
        <View style={st.then}>
          <Text style={st.thenText}>
            <Text style={{ fontFamily: font.bodyBold }}>Then</Text> · {[thenFamily.replace(/^The /, ''), sameDay ? then.note : dayOf(then.starts_at)].filter(Boolean).join(', ')}
          </Text>
          <Text style={st.thenTime}>
            {span(then.starts_at, then.ends_at)}
          </Text>
        </View>
      )}
    </View>
  );
}

// Values from wireframes S3 / S3b / S3d.
const st = StyleSheet.create({
  today: { gap: 8, paddingVertical: 12, paddingHorizontal: 14, backgroundColor: '#FFFFFF', borderRadius: 24, borderWidth: 2, borderColor: color.primary, ...cardShadow },
  family: { fontFamily: font.display, fontSize: 18, color: color.ink, flexShrink: 1 },
  time: { fontFamily: font.bodyBold, fontSize: 15, color: color.ink, flexShrink: 1 },
  greenDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: color.ok },
  okText: { fontFamily: font.bodySemi, fontSize: 13, color: color.okInk, flexShrink: 1 },
  lateLink: { fontFamily: font.bodyBold, fontSize: 13, color: color.primary, textDecorationLine: 'underline', flexShrink: 0 },
  clockIn: { flexGrow: 1, flexShrink: 1, height: 48, borderRadius: 999, backgroundColor: color.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  clockInText: { fontFamily: font.displayBold, fontSize: 17, color: '#FFFFFF' },
  round: { width: 48, height: 48, borderRadius: 24, backgroundColor: color.primaryTint, alignItems: 'center', justifyContent: 'center' },
  then: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 8, borderTopWidth: 1, borderTopColor: color.divider },
  thenText: { fontFamily: font.body, fontSize: 13, color: color.ink, flexShrink: 1 },
  thenTime: { fontFamily: font.body, fontSize: 13, color: color.ink2, flexShrink: 1 },
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
  stat: { flexGrow: 1, flexShrink: 1, flexBasis: 0, minWidth: 0, paddingVertical: 8, paddingHorizontal: 12 },
  statValue: { fontFamily: font.display, fontSize: 19, color: color.ink, marginVertical: -4.22 },
  statLabel: { fontFamily: font.body, fontSize: 12, color: color.ink2 },
  tool: { flexGrow: 1, flexShrink: 1, flexBasis: 0, minWidth: 0, height: 62, borderRadius: 16, backgroundColor: color.primaryTint, alignItems: 'center', justifyContent: 'center', gap: 5, paddingHorizontal: 4 },
  emptyCard: { alignItems: 'center', gap: 10, paddingTop: 24, paddingHorizontal: 20, paddingBottom: 20, backgroundColor: '#FFFFFF', borderRadius: 24, ...cardShadow },
  emptyIcon: { width: 72, height: 72, borderRadius: 36, backgroundColor: color.primaryTint, alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { fontFamily: font.display, fontSize: 22, color: color.ink, marginVertical: -4.62, marginTop: 4, textAlign: 'center' },
  emptyText: { fontFamily: font.body, fontSize: 15, color: color.ink2, lineHeight: 22, textAlign: 'center' },
  familiesRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, paddingHorizontal: 16, backgroundColor: '#FFFFFF', borderRadius: 24, ...cardShadow },
  familiesTitle: { fontFamily: font.bodySemi, fontSize: 15, color: color.ink },
  familiesSub: { fontFamily: font.body, fontSize: 13, color: color.ink2 },
  // S3d "Set your availability": outlined, 54 high, 8 below the text.
  availBtn: { alignSelf: 'stretch', marginTop: 8, height: 54, borderRadius: 999, borderWidth: 1.5, borderColor: color.primary, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  availText: { fontFamily: font.displayBold, fontSize: 17, color: color.primary, textAlign: 'center' },
  toolText: { fontFamily: font.bodyBold, fontSize: 12, lineHeight: 14, color: color.primaryStrong, textAlign: 'center' },
});
