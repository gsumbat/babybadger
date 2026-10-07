import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';

import { Hatch } from '@/components/calendar';
import { backOr, Pill, PillButton, RequestHeader } from '@/components/poolRequest';
import { Text } from '@/components/Text';
import { ErrorText, Icon, Screen } from '@/components/ui';
import { availabilityApi, type TimeOff } from '@/lib/availability';
import { familyColor } from '@/lib/calendar-logic';
import { itemsForShift } from '@/lib/care-plan';
import { api, useQuery } from '@/lib/data';
import { firstName } from '@/lib/format';
import { familyPlaces } from '@/lib/places';
import { windowLabel } from '@/lib/pool';
import { calendarFit, effectiveStatus, fitsSub, hoursText, kidAge, overlapBar, requestsApi, requestWindow, spanText, timeLeft, useRequestLive, type CalendarFit } from '@/lib/pool-requests';
import { useSession } from '@/lib/session';
import { supabase } from '@/lib/supabase';
import type { Kid } from '@/lib/types';
import { cardShadow, color, font } from '@/theme';

// Wireframes S33 Shift request, S20 Shift request (overlaps her time off) and S34 This shift was filled
// (app/src/wireframes/S33.tsx, S20.tsx, S34.tsx), for one pool request sent to this sitter (/sitter/request/<id>, from
// her Home's Needs you row and the "New shift request" push). Opening it marks it Seen for the parent (P46).
// S33: the family, day and time, kids and home, hours and her rate; "Sent to a few sitters…"; "Fits your calendar ·
// Nothing else that evening" (or "You’re already booked then" with the clash and Accept greyed out, canvas S33b); the parent's note; "See the care
// plan" (S10); Decline / Accept shift; the time-left pill. Accept books her at once with "First to accept" on (->
// Calendar), else tells the parent (canvas S33c "You said yes"). When the window overlaps her time off: S20 (canvas S20b
// adds the time-left pill and the note): offer the free part only (the longest stretch she isn't off), accept all and
// give up those days off, or decline; "Send answer". Filled by someone else: S34. Cancelled / expired / passed on her
// offer / declined: canvas S34b with its own title and line.
export default function SitterRequest() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { session, sitterLinks } = useSession();
  const uid = session!.user.id;
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(t);
  }, []);

  const { data, error, reload } = useQuery(async () => {
    await requestsApi.expireDue();
    const { request, asked } = await requestsApi.get(id);
    if (!request) return { request, mine: undefined };
    const fid = request.family_id;
    const [shifts, off, kids, parents, link, care, places] = await Promise.all([
      api.sitterShifts(uid),
      availabilityApi.myTimeOff(uid).catch((): TimeOff[] => []),
      request.kid_ids.length ? supabase.from('kids').select('*').in('id', request.kid_ids).then((r) => (r.data ?? []) as Kid[]) : Promise.resolve([] as Kid[]),
      api.familyParents(fid).catch(() => []),
      supabase.from('family_sitters').select('rate').eq('family_id', fid).eq('sitter_id', uid).maybeSingle().then((r) => (r.data as { rate: number | null } | null)?.rate ?? null),
      api.careItems(fid).catch(() => []),
      request.place_id ? familyPlaces(fid).catch(() => []) : Promise.resolve([]),
    ]);
    return { request, mine: asked.find((a) => a.sitter_id === uid), shifts, off, kids, parents, rate: link, care, place: places.find((p) => p.id === request.place_id) };
  }, [id, uid]);
  const live = useCallback(() => {
    reload();
  }, [reload]);
  useRequestLive(id, live);

  // Opening it marks it Seen (P46 "Seen 2 min ago"), once.
  const seen = useRef(false);
  useEffect(() => {
    if (seen.current || data?.mine?.status !== 'sent') return;
    seen.current = true;
    requestsApi.markSeen(id).catch(() => undefined);
  }, [data?.mine?.status, id]);

  // She got the shift (this screen opened again later): it's on her calendar.
  const won = data?.request?.status === 'filled' && data.request.filled_by === uid;
  useEffect(() => {
    if (won) router.replace('/sitter/calendar');
  }, [won]);

  const [busy, setBusy] = useState('');
  const [err, setErr] = useState('');
  const [choice, setChoice] = useState<'offer' | 'all' | null>(null);

  const req = data?.request;
  if (!req || !data?.mine)
    return (
      <Screen header={<RequestHeader title="Shift request" back={backOr('/sitter')} />}>
        <ErrorText>{error || (data ? 'This request isn’t here anymore.' : '')}</ErrorText>
      </Screen>
    );

  const mine = data.mine;
  const status = effectiveStatus(req, now);
  const win = requestWindow(req);
  const famName = sitterLinks.find((l) => l.family_id === req.family_id)?.family.name ?? 'The family';
  const stripe = familyColor(sitterLinks, req.family_id).dot;
  const parent = firstName(data.parents?.find((p) => p.id === req.created_by)?.full_name);

  async function run(key: string, fn: () => Promise<{ result: string } | void>) {
    setBusy(key);
    setErr('');
    try {
      const res = await fn();
      if (res && res.result === 'booked') return router.replace('/sitter/calendar');
      await reload();
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      // The family changed its house rules since she agreed: send her to them (S42) instead of a dead end.
      if (/house rules/i.test(msg)) {
        Alert.alert(`Agree to ${famName.replace(/^The /, 'the ')}’s house rules first`, 'They changed since you last agreed. Read them, agree, then accept the shift.', [
          { text: 'Not now', style: 'cancel' },
          { text: 'Read house rules', onPress: () => router.push(`/sitter/rules/${req!.family_id}`) },
        ]);
      } else {
        setErr(msg.startsWith('already booked then') ? 'You’re already booked at that time.' : msg.charAt(0).toUpperCase() + msg.slice(1));
      }
    } finally {
      setBusy('');
    }
  }
  const decline = () => run('decline', () => requestsApi.decline(req.id));

  // ---------------------------------------------------------------- S34 / S34b: closed for her
  const closed = closedCopy(status, mine.status, req.first_to_accept, req.filled_by === uid);
  if (req.filled_by === uid && status === 'filled') return null;
  if (closed)
    return (
      <Screen
        gap={14}
        header={<RequestHeader title="Shift request" back={backOr('/sitter')} />}
        footer={
          <View style={{ flexDirection: 'row' }}>
            <PillButton label="Back to Today" onPress={() => router.navigate('/sitter')} />
          </View>
        }>
        <View style={st.closed}>
          <View style={st.closedIcon}>
            <Icon name="users" size={36} tint={color.ink2} />
          </View>
          <Text style={st.closedTitle}>{closed.title}</Text>
          <Text style={st.closedText}>{closed.text}</Text>
        </View>
        <View style={[st.card, { flexDirection: 'row', overflow: 'hidden', opacity: 0.6 }]}>
          <View style={{ width: 6, backgroundColor: stripe }} />
          <View style={{ paddingVertical: 14, paddingHorizontal: 16, gap: 4, flexShrink: 1 }}>
            <Text style={[st.strong16, { textDecorationLine: 'line-through' }]}>{famName}</Text>
            <Text style={st.sub14}>{windowLabel(win)}</Text>
          </View>
        </View>
        <Pressable accessibilityRole="button" onPress={() => router.push('/sitter/availability')} style={[st.card, st.fresh]}>
          <View style={st.freshIcon}>
            <Icon name="calendar" size={22} />
          </View>
          <View style={{ flexGrow: 1, flexShrink: 1 }}>
            <Text style={st.bold15}>Keep your availability fresh</Text>
            <Text style={st.sub13}>Families see when you’re free, so you get asked first</Text>
          </View>
          <Icon name="chevron-right" size={20} tint={color.ink2} />
        </Pressable>
      </Screen>
    );

  const fit = calendarFit(win, data.off ?? [], data.shifts ?? []);
  const kidsLine = (data.kids ?? []).map((k) => kidAge(k.name, k.birthdate, now));
  const where = data.place ? `at ${data.place.name}` : 'at their home';
  const rate = data.rate != null ? `$${Number(data.rate).toFixed(Number(data.rate) % 1 ? 2 : 0)} / hr` : '';
  const left = <Pill label={timeLeft(req.expires_at, now, true)} kind="warn" />;
  const note = req.note ? (
    <View style={[st.card, { paddingVertical: 14, paddingHorizontal: 16, gap: 6 }]}>
      <Text style={st.label}>NOTE FROM {parent.toUpperCase()}</Text>
      <Text style={st.noteText}>“{req.note}”</Text>
    </View>
  ) : null;

  // ---------------------------------------------------------------- S33c: she said yes / offered, the family picks
  if (mine.status === 'accepted' || mine.status === 'offered')
    return (
      <Screen
        gap={12}
        header={<RequestHeader title="Shift request" back={backOr('/sitter')} right={left} />}
        footer={
          <View style={{ flexDirection: 'row' }}>
            <PillButton label="Back to Today" onPress={() => router.navigate('/sitter')} />
          </View>
        }>
        <RequestCard famName={famName} stripe={stripe} win={win} kids={kidsLine} where={where} rate={rate} />
        <View style={st.info}>
          <Icon name="users" size={22} tint={color.primaryStrong} />
          <Text style={st.infoText}>
            <Text style={st.infoBold}>{mine.status === 'offered' ? `You offered ${spanText(new Date(mine.offer_starts_at!), new Date(mine.offer_ends_at!))}.` : 'You said yes.'}</Text> The family picks who gets it. We’ll let you know.
          </Text>
        </View>
        {note}
        <ErrorText>{err}</ErrorText>
      </Screen>
    );

  // ---------------------------------------------------------------- S20 / S20b: overlaps her time off
  if (fit.kind === 'time_off') {
    const pick = choice ?? (fit.offer ? 'offer' : 'all');
    const plan = [...new Set(itemsForShift(data.care ?? [], win.start, win.end, req.kid_ids).map((x) => x.item.title))].slice(0, 3).join(', ');
    const send = () =>
      pick === 'offer' && fit.offer ? run('send', () => requestsApi.offer(req.id, fit.offer!.start, fit.offer!.end)) : run('send', () => requestsApi.accept(req.id, fit.clear));
    return (
      <Screen
        gap={12}
        header={<RequestHeader title="Shift request" back={backOr('/sitter')} right={left} />}
        footer={
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <PillButton kind="outline" label="Decline" busy={busy === 'decline'} onPress={decline} />
            <PillButton label="Send answer" busy={busy === 'send'} onPress={send} />
          </View>
        }>
        <ErrorText>{err}</ErrorText>
        <View style={[st.card, { padding: 16, gap: 4 }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: stripe }} />
            <Text style={st.semi14}>{famName}</Text>
          </View>
          <Text style={st.bigDay}>{win.start.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</Text>
          <Text style={st.bigTime}>
            {spanText(win.start, win.end)} · {hoursText(win)}
          </Text>
          <View style={{ marginTop: 8 }}>
            <Row label="Kids" value={kidsLine.map((k) => k.replace(',', '')).join(', ') || '—'} line={!!plan || !!rate} />
            {plan ? <Row label="Plan" value={plan} line={!!rate} /> : null}
            {rate ? <Row label="Pay" value={rate} /> : null}
          </View>
        </View>
        <OverlapBox fit={fit} win={win} />
        {note}
        <Text style={st.label}>YOUR ANSWER</Text>
        <View style={{ gap: 8 }}>
          {fit.offer ? (
            <Option on={pick === 'offer'} onPress={() => setChoice('offer')} icon="clock" tint={color.primaryTint} ink={color.primary} title={`Offer ${spanText(fit.offer.start, fit.offer.end)} only`} sub="The family can accept or look elsewhere" />
          ) : null}
          <Option on={pick === 'all'} onPress={() => setChoice('all')} icon="check" tint={color.okTint} ink={color.okInk} title="Accept all and cancel my time off" sub={`${req.first_to_accept ? 'Books' : 'Offers'} the full ${hoursText(win).replace(' hrs', ' hours').replace(' hr', ' hour')}`} />
        </View>
      </Screen>
    );
  }

  // ---------------------------------------------------------------- S33 / S33b
  return (
    <Screen
      gap={12}
      header={<RequestHeader title="Shift request" back={backOr('/sitter')} right={left} />}
      footer={
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <PillButton kind="outline" label="Decline" busy={busy === 'decline'} onPress={decline} />
          {/* Migration 27: she can't hold two shifts at once, so a clash can only be declined. */}
          <PillButton label="Accept shift" busy={busy === 'accept'} disabled={fit.kind === 'shift'} onPress={() => run('accept', () => requestsApi.accept(req.id))} />
        </View>
      }>
      <ErrorText>{err}</ErrorText>
      <RequestCard famName={famName} stripe={stripe} win={win} kids={kidsLine} where={where} rate={rate} />
      <View style={st.info}>
        <Icon name="users" size={22} tint={color.primaryStrong} />
        <Text style={st.infoText}>
          <Text style={st.infoBold}>Sent to a few sitters.</Text> {req.first_to_accept ? 'The first to accept gets the shift. If someone beats you to it, we’ll let you know.' : 'The family picks from who says yes. We’ll let you know.'}
        </Text>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        {fit.kind === 'shift' ? <Pill label="You’re already booked then" kind="warn" /> : <Pill label="Fits your calendar" kind="ok" />}
        <Text style={[st.sub13, { flexShrink: 1 }]}>
          {fit.kind === 'shift'
            ? `${(sitterLinks.find((l) => l.family_id === fit.shift.family_id)?.family.name ?? 'Another family').replace(/^The /, '')} · ${spanText(new Date(fit.shift.starts_at), new Date(fit.shift.ends_at))}`
            : fitsSub(win)}
        </Text>
      </View>
      {note}
      <Text accessibilityRole="link" onPress={() => router.push(`/sitter/family/${req.family_id}`)} style={st.link}>
        See the care plan
      </Text>
    </Screen>
  );
}

/** S34 / S34b: why the request is closed for her, or null while she can still answer. */
function closedCopy(status: string, mine: string, firstToAccept: boolean, won: boolean): { title: string; text: string } | null {
  if (won) return null;
  if (status === 'filled' || mine === 'filled')
    return { title: 'This shift was filled', text: firstToAccept ? 'Another sitter accepted first. Nothing for you to do, and it doesn’t count against you.' : 'The family booked another sitter. Nothing for you to do, and it doesn’t count against you.' };
  if (status === 'cancelled') return { title: 'This request was cancelled', text: 'The family doesn’t need someone anymore. Nothing for you to do.' };
  if (status === 'expired') return { title: 'This request expired', text: 'It closed before anyone took it. Nothing for you to do, and it doesn’t count against you.' };
  if (mine === 'passed') return { title: 'The family passed on your offer', text: 'They’re looking for someone for the whole time. Nothing for you to do.' };
  if (mine === 'declined') return { title: 'You declined this shift', text: 'Thanks for answering. The family can ask someone else.' };
  return null;
}

function RequestCard({ famName, stripe, win, kids, where, rate }: { famName: string; stripe: string; win: { start: Date; end: Date }; kids: string[]; where: string; rate: string }) {
  return (
    <View style={[st.card, { flexDirection: 'row', overflow: 'hidden' }]}>
      <View style={{ width: 6, backgroundColor: stripe }} />
      <View style={{ padding: 16, gap: 8, flexShrink: 1, flexGrow: 1 }}>
        <Text style={st.family}>{famName}</Text>
        <Text style={st.strong16}>{windowLabel(win)}</Text>
        <Text style={st.sub14}>{[...kids, where].join(' · ')}</Text>
        <Text style={st.sub14}>{[hoursText(win), rate].filter(Boolean).join(' · ')}</Text>
      </View>
    </View>
  );
}

function OverlapBox({ fit, win }: { fit: Extract<CalendarFit, { kind: 'time_off' }>; win: { start: Date; end: Date } }) {
  return (
    <View style={st.warnBox}>
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <Icon name="alert-triangle" size={22} tint={color.warnInk} />
        <Text style={st.warnText}>
          <Text style={{ fontFamily: font.bodyBold, color: color.warnInk }}>Overlaps your time off, {spanText(fit.off.start, fit.off.end)}.</Text> The family only saw “unavailable”.
        </Text>
      </View>
      <View style={st.barRow}>
        {overlapBar(win, fit.off).map((p, i) =>
          p.kind === 'free' ? (
            <View key={i} style={[st.barPart, { flexGrow: p.grow, backgroundColor: '#DCE8FA' }]}>
              <Text style={[st.barText, { color: '#1F4E9A' }]}>{p.label}</Text>
            </View>
          ) : (
            <View key={i} style={[st.barPart, { flexGrow: p.grow }]}>
              <Hatch a="#E2E7ED" b={color.warnTint} stripe={6} />
              <Text style={[st.barText, { color: color.warnInk }]} numberOfLines={1}>
                {p.label}
              </Text>
            </View>
          ),
        )}
      </View>
    </View>
  );
}

function Option({ on, onPress, icon, tint, ink, title, sub }: { on: boolean; onPress: () => void; icon: 'clock' | 'check'; tint: string; ink: string; title: string; sub: string }) {
  return (
    <Pressable accessibilityRole="radio" accessibilityState={{ selected: on }} onPress={onPress} style={[st.option, on ? { borderWidth: 2, borderColor: color.primary } : { borderWidth: 2, borderColor: 'transparent' }]}>
      <View style={[st.optionIcon, { backgroundColor: tint }]}>
        <Icon name={icon} size={22} tint={ink} />
      </View>
      <View style={{ flexShrink: 1 }}>
        <Text style={st.bold15}>{title}</Text>
        <Text style={st.sub13}>{sub}</Text>
      </View>
    </Pressable>
  );
}

function Row({ label, value, line }: { label: string; value: string; line?: boolean }) {
  return (
    <View style={[st.row, line && st.line]}>
      <Text style={st.rowLabel}>{label}</Text>
      <Text style={st.rowValue}>{value}</Text>
    </View>
  );
}

// Values from wireframes S33, S20 and S34.
const st = StyleSheet.create({
  card: { backgroundColor: '#FFFFFF', borderRadius: 24, ...cardShadow },
  family: { fontFamily: font.display, fontSize: 20, color: color.ink, marginVertical: -4.02 },
  strong16: { fontFamily: font.bodyBold, fontSize: 16, color: color.ink },
  sub14: { fontFamily: font.body, fontSize: 14, color: color.ink2 },
  sub13: { fontFamily: font.body, fontSize: 13, color: color.ink2 },
  semi14: { fontFamily: font.bodySemi, fontSize: 14, color: color.ink },
  bold15: { fontFamily: font.bodyBold, fontSize: 15, color: color.ink },
  info: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, paddingVertical: 12, paddingHorizontal: 14, backgroundColor: color.primaryTint, borderRadius: 16 },
  infoText: { flexShrink: 1, fontFamily: font.body, fontSize: 14, lineHeight: 20, color: color.primaryStrong },
  infoBold: { fontFamily: font.bodyBold, fontSize: 14, lineHeight: 20, color: color.primaryStrong },
  label: { fontFamily: font.bodyBold, fontSize: 13, color: color.ink2, letterSpacing: 0.6 },
  noteText: { fontFamily: font.body, fontSize: 15, lineHeight: 22, color: color.ink },
  link: { fontFamily: font.bodySemi, fontSize: 14, color: color.primary, textDecorationLine: 'underline', alignSelf: 'flex-start' },
  bigDay: { fontFamily: font.display, fontSize: 26, lineHeight: 32, color: color.ink, marginTop: 4 },
  bigTime: { fontFamily: font.displayBold, fontSize: 20, color: color.ink2, marginVertical: -4.02 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', minHeight: 46, gap: 12 },
  line: { borderBottomWidth: 1, borderBottomColor: color.divider },
  rowLabel: { fontFamily: font.body, fontSize: 15, color: color.ink2 },
  rowValue: { flexShrink: 1, fontFamily: font.bodySemi, fontSize: 15, color: color.ink, textAlign: 'right' },
  warnBox: { gap: 10, padding: 14, backgroundColor: color.warnTint, borderRadius: 16 },
  warnText: { flexShrink: 1, fontFamily: font.body, fontSize: 14, lineHeight: 20, color: color.ink },
  barRow: { flexDirection: 'row', height: 30, borderRadius: 8, overflow: 'hidden' },
  barPart: { flexBasis: 0, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  barText: { fontFamily: font.bodyBold, fontSize: 11 },
  option: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, paddingHorizontal: 14, backgroundColor: '#FFFFFF', borderRadius: 24, ...cardShadow },
  optionIcon: { width: 36, height: 36, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  closed: { alignItems: 'center', gap: 10, paddingTop: 36 },
  closedIcon: { width: 76, height: 76, borderRadius: 38, backgroundColor: color.muted, alignItems: 'center', justifyContent: 'center' },
  closedTitle: { fontFamily: font.display, fontSize: 26, lineHeight: 30, color: color.ink, textAlign: 'center' },
  closedText: { maxWidth: 300, fontFamily: font.body, fontSize: 15, lineHeight: 22, color: color.ink2, textAlign: 'center' },
  fresh: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  freshIcon: { width: 40, height: 40, borderRadius: 14, backgroundColor: color.primaryTint, alignItems: 'center', justifyContent: 'center' },
});
