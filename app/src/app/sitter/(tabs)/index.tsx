import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { RequestRow } from '@/components/poolRequest';
import { ErrorText, HomeHeader, Icon, type IconName, initialsOf, Screen } from '@/components/ui';
import { api, useQuery, useShiftLive } from '@/lib/data';
import { dayOf, firstName, timeOf } from '@/lib/format';
import { familyPossessive, sitterRulesState } from '@/lib/house-rules';
import { inviteApi } from '@/lib/invites';
import { availabilityApi } from '@/lib/availability';
import { dateClash, sitterSeriesSub, sitterSeriesTitle } from '@/lib/booking-logic';
import { cardReminders, sitterCredentials } from '@/lib/credentials';
import { MARKETPLACE } from '@/lib/features';
import { familyRequirements } from '@/lib/requirements';
import { calendarFit, requestWindow, requestsApi, sitterRowSub, sitterRowTitle, timeLeft } from '@/lib/pool-requests';
import { askedLine, CREDENTIAL_KINDS, requirementRequestsApi, waitingOnHer } from '@/lib/requirement-requests-api';
import { useSession } from '@/lib/session';
import { formatClock } from '@/lib/shift-logic';
import { spanLabel } from '@/lib/shift-page-logic';
import type { Shift } from '@/lib/types';
import { cardShadow, color, font, SECTION_GAP } from '@/theme';
import { Text } from '@/components/Text';

// Wireframes S3 (shift today), S3b (no shift today) and S3d (nothing booked), translated from their HTML
// (app/src/wireframes/S3*.tsx). Home shows shifts for information only: the Today card (S3 / S3e / S3f, no buttons)
// and S3b's next-shift card open the shift page (S4b), where Clock in, Running late? (S21), Family details and
// Message live. While she's on shift the card reads "On shift · 01:12:45 · sharing location". Needs you, in the
// board's order (S3f):
// new family invites sent to her email (S0e, open S1); what families asked her to share ("The Lee family asked for: …",
// S53); her cards that expire within 30 days or have expired ("Infant CPR expires in 21 days" · "Renew and share the
// new card · Lee family requires it", S41); pool requests waiting for her answer ("Lee family asks for Sat 6 – 10 PM",
// S33 / S20; a repeating booking is one row, "Lee family · 12 shifts from Oct 12", S33s); house rules (S42) and location notices. Stats: only the hours booked; earnings, payout and the "unpaid
// invoice" row wait for in-app payments (canvas S3p). TOOLS: Availability, Time off (S11), New invoice ("Soon"),
// Hours and pay (S7), Credentials (S14), My details, Requests (one waiting shift request opens it, otherwise the
// calendar); "Get found" (S35) only with MARKETPLACE.
// Times follow the wireframe: "3:00 – 7:00 PM" on the today card, "7:30 – 10 PM" elsewhere.
export default function SitterHome() {
  const { session, profile, sitterLinks } = useSession();
  const uid = session!.user.id;
  const { data: shifts, error } = useQuery(() => api.sitterShifts(uid), [uid]);
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
  // A repeating booking (migration 35) is one row: its first date stands for the series.
  const allAsks = requests?.list ?? [];
  const asks = allAsks.filter((r, i) => !r.series_id || allAsks.findIndex((x) => x.series_id === r.series_id) === i);
  const seriesOf = (sid: string) => allAsks.filter((x) => x.series_id === sid);
  // New family invites sent to her email (S0e, migration 28): listed until she answers; each opens S1 (/i/<token>).
  const { data: invites } = useQuery(() => inviteApi.mine(), [uid]);
  const newInvites = invites ?? [];
  // What families asked her to share (S53, migration 31): one row per family, "The Lee family asked for: …".
  const { data: reqGroups } = useQuery(() => requirementRequestsApi.mine(), [uid]);
  const famAsks = (reqGroups ?? []).map((g) => ({ g, open: waitingOnHer(g.requests) })).filter((x) => x.open.length);
  // Her cards that expire within 30 days or have expired (S3 "Infant CPR expires in 21 days" · "Renew and share the
  // new card · Lee family requires it"), each opening S41. "Requires it" = a must-have of a family she sits for that
  // the card's kind meets (family_requirements, migration 20; [] before it runs).
  const { data: cards } = useQuery(async () => {
    const creds = await sitterCredentials(uid).catch(() => []);
    if (!cardReminders(creds).length) return [];
    const musts = (
      await Promise.all(
        sitterLinks
          .filter((l) => l.status === 'active')
          .map(async (l) => (await familyRequirements(l.family_id)).filter((r) => r.level === 'must' && CREDENTIAL_KINDS[r.key]).map((r) => ({ family: l.family.name, kinds: CREDENTIAL_KINDS[r.key] }))),
      )
    ).flat();
    return cardReminders(creds, musts);
  }, [uid, activeIds]);
  const cardRows = cards ?? [];

  // Needs you, in the board's order (S3 / S3f): invites, share requests, expiring cards, pool requests, then house
  // rules and location notices. Pool requests use the shared RequestRow; each row draws a divider unless it is last.
  type Need = { key: string; icon: IconName; tint?: [string, string]; title: string; sub: string; onPress: () => void; pool?: boolean };
  const needRows: Need[] = [
    ...newInvites.map((inv): Need => ({
      key: `inv-${inv.link_token}`,
      icon: 'users',
      tint: [color.primaryTint, color.primaryStrong],
      title: 'New family invite',
      sub: `${inv.family_name}${inv.kids ? ` · ${inv.kids}` : ''} · Tap to review`,
      onPress: () => router.push({ pathname: '/i/[token]', params: { token: inv.link_token } }),
    })),
    ...famAsks.map(({ g, open }): Need => ({
      key: `ask-${g.family_id}`,
      icon: 'file-text',
      title: askedLine(g.family_name, open.map((q) => q.title)),
      sub: 'Share what you have · Tap to answer',
      onPress: () => router.push('/sitter/requests'),
    })),
    ...cardRows.map((c): Need => ({
      key: `card-${c.id}`,
      icon: 'award',
      title: c.title,
      sub: c.sub,
      onPress: () => router.push({ pathname: '/sitter/credentials/[id]', params: { id: c.id } }),
    })),
    ...asks.map((r): Need => ({
      key: `req-${r.id}`,
      icon: 'calendar',
      pool: true,
      title: r.series_id ? sitterSeriesTitle(famName(r.family_id), seriesOf(r.series_id).length, new Date(r.starts_at)) : sitterRowTitle(famName(r.family_id), requestWindow(r)),
      sub: r.series_id
        ? sitterSeriesSub(seriesOf(r.series_id).filter((x) => dateClash(requestWindow(x), requests?.off ?? [], shifts ?? [])).length, timeLeft(r.expires_at, today, true))
        : sitterRowSub(calendarFit(requestWindow(r), requests?.off ?? [], shifts ?? []), timeLeft(r.expires_at, today, true)),
      onPress: () => router.push({ pathname: '/sitter/request/[id]', params: { id: r.id } }),
    })),
    ...needsRules.map((l): Need => ({
      key: `rules-${l.family_id}`,
      icon: 'file-text',
      title: `Agree to ${familyPossessive(l.family.name).title} house rules`,
      sub: 'Needed before your next shift',
      onPress: () => router.push(`/sitter/rules/${l.family_id}`),
    })),
    ...needsConsent.map((l): Need => ({
      key: l.family_id,
      icon: 'file-text',
      title: `Sign ${l.family.name.replace(/^The /, '')}’s location notice`,
      sub: 'They can book you once it’s signed',
      onPress: () => router.push(`/sitter/consent/${l.family_id}`),
    })),
  ];
  const needCount = needRows.length;
  // TOOLS "Requests" (S20 on the board): one shift request waiting opens it; otherwise the calendar, where requests
  // land (S6). There is no request list screen.
  const openRequests = () => (asks.length === 1 ? router.push({ pathname: '/sitter/request/[id]', params: { id: asks[0].id } }) : router.navigate('/sitter/calendar'));
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

      {focus && <TodayCard shift={focus} family={famName(focus.family_id)} then={then} thenFamily={then ? famName(then.family_id) : ''} now={now} />}

      {!focus && next && (
        <Pressable accessibilityRole="button" accessibilityLabel="Open the next shift" onPress={() => router.push(`/sitter/shift/${next.id}`)} style={st.nextCard}>
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

      {needCount > 0 && (
        <>
          <View style={[st.labelRow, { marginTop: SECTION_GAP }]}>
            <Text style={st.label}>NEEDS YOU</Text>
            <Text style={st.labelCount}>{needCount}</Text>
          </View>
          <View style={st.listCard}>
            {needRows.map(({ key, pool, ...n }, i) =>
              pool ? <RequestRow key={key} title={n.title} sub={n.sub} last={i === needRows.length - 1} sitter onPress={n.onPress} /> : <NeedRow key={key} {...n} last={i === needRows.length - 1} />,
            )}
          </View>
        </>
      )}

      {/* Only the booked hours: earnings and payout wait for in-app payments (canvas S3p). The card opens S7, like the
          board. S3d has no stats. */}
      {!nothingBooked && (
        <Pressable accessibilityRole="button" onPress={() => router.push('/sitter/pay')} style={st.stats}>
          <Stat v={`${bookedH} h`} l={focus ? 'booked this week' : 'booked next week'} />
        </Pressable>
      )}

      <View style={[st.labelRow, { marginTop: SECTION_GAP }]}>
        <Text style={st.label}>TOOLS</Text>
      </View>
      {/* S3 / S3b / S3d: 4 x 2 tiles in the board's order. "Get found" (S35) shows only with the marketplace
          (MARKETPLACE, phase 2); without it the last slot stays empty so the tiles keep the board's width. */}
      <View style={{ gap: 8 }}>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Tool icon="clock" label="Availability" onPress={() => router.push('/sitter/availability')} />
          <Tool xml={TIME_OFF} label="Time off" onPress={() => router.push('/sitter/availability')} />
          <Tool xml={INVOICE} label="New invoice" soon onPress={() => Alert.alert('Coming soon', 'Invoices come with in-app payments.')} />
          <Tool icon="credit-card" label="Hours and pay" onPress={() => router.push('/sitter/pay')} />
        </View>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Tool icon="award" label="Credentials" dot={cardRows.length > 0} onPress={() => router.push('/sitter/credentials')} />
          <Tool icon="edit-2" label="My details" onPress={() => router.navigate('/sitter/me')} />
          {MARKETPLACE ? <Tool icon="search" label="Get found" onPress={() => Alert.alert('Coming soon')} /> : null}
          <Tool icon="inbox" label="Requests" onPress={openRequests} />
          {!MARKETPLACE && <View style={{ flex: 1 }} />}
        </View>
      </View>
    </Screen>
  );
}

const MERIDIEM = /\s?([AP]M)$/i;
const span = spanLabel;

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

// S3 "New invoice" tool icon: a receipt.
const INVOICE =
  '<svg viewBox="0 0 24 24" fill="none" stroke="#47698A" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6"/></svg>';

/** A TOOLS tile. `dot`: S3's amber dot (Credentials, a card needs renewing). `soon`: the "Soon" marker for a tool
 * that waits on a later feature (New invoice, in-app payments). */
function Tool({ icon, xml, label, dot, soon, onPress }: { icon?: IconName; xml?: string; label: string; dot?: boolean; soon?: boolean; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={soon ? `${label}, coming soon` : label} onPress={onPress} style={({ pressed }) => [st.tool, pressed && { opacity: 0.85 }]}>
      {xml ? <SvgXml xml={xml} width={22} height={22} style={{ flexShrink: 0 }} /> : icon ? <Icon name={icon} size={22} /> : null}
      <Text style={st.toolText}>{label}</Text>
      {dot && <View style={st.toolDot} />}
      {soon && (
        <View style={st.soon}>
          <Text style={st.soonText}>Soon</Text>
        </View>
      )}
    </Pressable>
  );
}

/** A Needs-you row: tinted icon, title, one-line sub, chevron (warn tint unless given). */
function NeedRow({ icon, tint = [color.warnTint, color.warnInk], title, sub, last, onPress }: { icon: IconName; tint?: [string, string]; title: string; sub: string; last: boolean; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={[st.needRow, !last && st.line]}>
      <View style={[st.needIcon, { backgroundColor: tint[0] }]}>
        <Icon name={icon} size={20} tint={tint[1]} />
      </View>
      <View style={{ flexGrow: 1, flexShrink: 1, minWidth: 0 }}>
        <Text style={st.needTitle}>{title}</Text>
        <Text style={st.needSub} numberOfLines={1}>
          {sub}
        </Text>
      </View>
      <Icon name="chevron-right" size={18} tint={color.ink2} />
    </Pressable>
  );
}

/** S3 Today card: the whole card opens the shift page (S4b before clock-in, S4 on shift). Information only: the status
 * line ("At their home · 4 tasks, first 3:15"; S3e "Told the family · 15 min late"; on shift "On shift · 01:12:45 ·
 * sharing location") and "Then · …". */
function TodayCard({ shift, family, then, thenFamily, now }: { shift: Shift; family: string; then?: Shift; thenFamily: string; now: number }) {
  const { bundle } = useShiftLive(shift.id);
  const lateMin = (shift as Shift & { late_minutes?: number | null }).late_minutes ?? undefined;
  const live = shift.status === 'active';
  const tasks = bundle?.tasks ?? [];
  const firstDue = tasks.find((t) => t.due_at)?.due_at;
  const secs = shift.clock_in_at ? Math.max(0, Math.floor((now - +new Date(shift.clock_in_at)) / 1000)) : 0;
  const sameDay = !!then && new Date(then.starts_at).toDateString() === new Date(shift.starts_at).toDateString();
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={live ? 'Open your shift' : 'Open today’s shift'} onPress={() => router.push(`/sitter/shift/${shift.id}`)} style={({ pressed }) => [st.today, pressed && { opacity: 0.9 }]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <Text style={st.family} numberOfLines={1}>
          {family}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, flexShrink: 1 }}>
          <Text style={st.time}>{span(shift.starts_at, shift.ends_at, true)}</Text>
          <Icon name="chevron-right" size={18} tint={color.ink2} />
        </View>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        <View style={[st.greenDot, lateMin && !live ? { backgroundColor: color.warn } : null]} />
        <Text style={[st.okText, lateMin && !live ? { color: color.warnInk } : null]}>
          {/* S3e: after "Tell the family" (S21, on the shift page) the line confirms it until she clocks in. */}
          {!live && lateMin ? `Told the family · ${lateMin} min late` : live ? `On shift · ${formatClock(Math.floor(secs / 60), secs % 60)} · sharing location` : [tasks.length ? `${tasks.length} tasks` : bundle?.kids.map((k) => k.name).join(' and '), firstDue ? `first ${timeOf(firstDue).replace(MERIDIEM, '')}` : ''].filter(Boolean).join(', ')}
        </Text>
      </View>
      {then && (
        <View style={st.then}>
          <Text style={st.thenText}>
            <Text style={{ fontFamily: font.bodyBold }}>Then</Text> · {[thenFamily.replace(/^The /, ''), sameDay ? then.note : dayOf(then.starts_at)].filter(Boolean).join(', ')}
          </Text>
          <Text style={st.thenTime}>{span(then.starts_at, then.ends_at)}</Text>
        </View>
      )}
    </Pressable>
  );
}

// Values from wireframes S3 / S3b / S3d.
const st = StyleSheet.create({
  today: { gap: 8, paddingVertical: 12, paddingHorizontal: 14, backgroundColor: '#FFFFFF', borderRadius: 24, borderWidth: 2, borderColor: color.primary, ...cardShadow },
  family: { fontFamily: font.display, fontSize: 18, color: color.ink, flexShrink: 1 },
  time: { fontFamily: font.bodyBold, fontSize: 15, color: color.ink, flexShrink: 1 },
  greenDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: color.ok },
  okText: { fontFamily: font.bodySemi, fontSize: 13, color: color.okInk, flexShrink: 1 },
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
  toolDot: { position: 'absolute', top: 8, right: 10, width: 9, height: 9, borderRadius: 5, backgroundColor: color.warn },
  // "Soon" marker: the muted Coming soon pill (S17d), small, in the tile's top right corner.
  soon: { position: 'absolute', top: 5, right: 5, height: 16, paddingHorizontal: 5, borderRadius: 999, backgroundColor: '#FFFFFF', justifyContent: 'center' },
  soonText: { fontFamily: font.bodyBold, fontSize: 10, lineHeight: 12, color: color.ink2 },
  toolText: { fontFamily: font.bodyBold, fontSize: 12, lineHeight: 14, color: color.primaryStrong, textAlign: 'center' },
});
