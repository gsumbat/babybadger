import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Alert, Platform, Pressable, StyleSheet, View } from 'react-native';

import { shortName } from '@/components/addChild';
import { AVATAR, backOr, Initial, Pill, PillButton, RequestHeader } from '@/components/poolRequest';
import { Text } from '@/components/Text';
import { ErrorText, Icon, Screen } from '@/components/ui';
import { shiftDayDetails } from '@/lib/availability';
import { api, useQuery } from '@/lib/data';
import { firstName } from '@/lib/format';
import { windowLabel } from '@/lib/pool';
import { askedRow, effectiveStatus, elapsedShare, requestsApi, requestWindow, shiftNumberText, toldNote, useRequestLive, waitingCard, type AskedSitter } from '@/lib/pool-requests';
import { useSession } from '@/lib/session';
import { cardShadow, color, font } from '@/theme';

// Wireframes P46 Request out and P47 Booked (app/src/wireframes/P46.tsx, P47.tsx), for one pool request
// (/parent/request/<id>, opened after P45 "Send", from Home's Needs you row and from the pushes).
// Open: "Waiting on 2 sitters", "First to accept gets it · 11 h 52 m left" and a bar for the time gone by; SENT TO lists
// each sitter with Sent ("Delivered 3:41 PM") / Seen ("Seen 2 min ago") / Said yes / Offer / Declined (rows open P11).
// A sitter's S20 offer of part of the time shows "Accept offer" / "Look elsewhere" under her row (canvas P46b); with
// "First to accept" off, a yes shows "Book Maya" (canvas P46c). "Ask more sitters" -> P45 for this request; "Cancel
// request" asks first. Expired / cancelled: canvas P46d with "Ask again". Filled: P47 "Priya took the shift" with the
// shift's kids, "Message Priya" (P10) and Done (Calendar). Updates live (Realtime) and every 30 s for the countdown.
// Left out: "Your calendar shows Saturday as Pending until then" (the calendar doesn't show requests yet).
export default function RequestScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { family } = useSession();
  const fid = family!.id;
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(t);
  }, []);

  const { data, error, reload } = useQuery(async () => {
    await requestsApi.expireDue();
    const [{ request, asked }, sitters] = await Promise.all([requestsApi.get(id), api.familySitters(fid)]);
    let booked: { shifts: Awaited<ReturnType<typeof api.familyShifts>>; kids: string[] } | null = null;
    if (request?.status === 'filled' && request.shift_id) {
      const [shifts, details] = await Promise.all([api.familyShifts(fid), shiftDayDetails([request.shift_id])]);
      booked = { shifts, kids: details.kids[request.shift_id] ?? [] };
    }
    return { request, asked, sitters, booked };
  }, [id, fid]);
  const live = useCallback(() => {
    reload();
  }, [reload]);
  useRequestLive(id, live);

  const [busy, setBusy] = useState('');
  const [err, setErr] = useState('');
  async function act(key: string, fn: () => Promise<unknown>) {
    setBusy(key);
    setErr('');
    try {
      await fn();
      await reload();
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy('');
    }
  }

  const req = data?.request;
  const person = (sid: string) => data?.sitters.find((s) => s.sitter_id === sid);
  const nameOf = (sid: string) => person(sid)?.profile?.full_name || 'Sitter';
  const colorOf = (sid: string) => {
    const i = data?.sitters.findIndex((s) => s.sitter_id === sid) ?? -1;
    return AVATAR[(i < 0 ? 0 : i) % AVATAR.length];
  };

  if (!req)
    return (
      <Screen header={<RequestHeader title="Request out" back={backOr('/parent/sitters')} />}>
        <ErrorText>{error || (data ? 'This request isn’t here anymore.' : '')}</ErrorText>
      </Screen>
    );

  const status = effectiveStatus(req, now);
  const win = requestWindow(req);

  // ---------------------------------------------------------------- P47 Booked
  if (status === 'filled' && req.filled_by) {
    const sid = req.filled_by;
    const shift = data?.booked?.shifts.find((s) => s.id === req.shift_id);
    const hers = (data?.booked?.shifts ?? []).filter((s) => s.sitter_id === sid && s.status !== 'cancelled');
    const nth = shift ? hers.findIndex((s) => s.id === shift.id) + 1 : 1;
    const told = (data?.asked ?? []).filter((a) => a.status === 'filled').map((a) => firstName(nameOf(a.sitter_id)));
    const first = firstName(nameOf(sid));
    return (
      <Screen
        gap={14}
        footer={
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <PillButton kind="tint" label={`Message ${first}`} onPress={() => router.push(`/parent/thread/${sid}`)} />
            <PillButton label="Done" onPress={() => router.navigate('/parent/calendar')} />
          </View>
        }>
        <View style={st.booked}>
          <View style={st.bigCheck}>
            <Icon name="check" size={44} tint={color.ok} strokeWidth={2.4} />
          </View>
          <Text style={st.h1}>{first} took the shift</Text>
          <Text style={st.when}>{windowLabel(shift ? { start: new Date(shift.starts_at), end: new Date(shift.ends_at) } : win)}</Text>
        </View>
        <View style={[st.card, { paddingVertical: 4, paddingHorizontal: 16 }]}>
          <View style={[st.row, { minHeight: 64 }, st.line]}>
            <Initial name={nameOf(sid)} bg={colorOf(sid)} />
            <View style={{ flexGrow: 1, flexShrink: 1 }}>
              <Text style={st.name}>{shortName(nameOf(sid))}</Text>
              <Text style={st.sub}>{shiftNumberText(nth)}</Text>
            </View>
            <Pill label="Confirmed" kind="ok" />
          </View>
          <Detail label="Kids" value={(data?.booked?.kids ?? []).join(', ') || '—'} line />
          <Detail label="Care plan" value={`Shared with ${first}`} line />
          <Detail label="Location sharing" value="Starts when she clocks in" />
        </View>
        {told.length ? <Text style={st.told}>{toldNote(told)}</Text> : null}
        <ErrorText>{error}</ErrorText>
      </Screen>
    );
  }

  // ---------------------------------------------------------------- P46 Request out (and P46d closed)
  const open = status === 'open';
  const card = open
    ? waitingCard(req, data?.asked ?? [], now)
    : status === 'expired'
      ? { title: 'Request expired', sub: 'No one accepted in time' }
      : { title: 'Request cancelled', sub: 'The sitters can’t take it anymore' };
  const askAgain = +win.start > +now;

  function cancel() {
    const go = () => act('cancel', () => requestsApi.cancel(req!.id));
    const msg = 'The sitters you asked can’t take it anymore.';
    if (Platform.OS === 'web') {
      if (globalThis.confirm?.(`Cancel this request? ${msg}`)) go();
    } else Alert.alert('Cancel this request?', msg, [{ text: 'Keep it', style: 'cancel' }, { text: 'Cancel request', style: 'destructive', onPress: go }]);
  }

  return (
    <Screen
      gap={12}
      header={<RequestHeader title="Request out" sub={windowLabel(win)} back={backOr('/parent/calendar')} />}
      footer={
        open ? (
          <View style={{ gap: 6 }}>
            <View style={{ flexDirection: 'row' }}>
              <PillButton kind="tint" label="Ask more sitters" onPress={() => router.push({ pathname: '/parent/pool-ask', params: { request: req.id } })} />
            </View>
            <View style={{ flexDirection: 'row' }}>
              <PillButton kind="danger" height={46} label="Cancel request" busy={busy === 'cancel'} onPress={cancel} />
            </View>
          </View>
        ) : askAgain ? (
          <View style={{ flexDirection: 'row' }}>
            <PillButton kind="tint" label="Ask again" onPress={() => router.replace({ pathname: '/parent/pool-ask', params: { start: win.start.toISOString(), end: win.end.toISOString() } })} />
          </View>
        ) : undefined
      }>
      <ErrorText>{error || err}</ErrorText>

      <View style={[st.status, !open && { backgroundColor: color.muted }]}>
        <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
          <View style={st.statusIcon}>
            <Icon name="clock" size={24} tint={open ? color.primary : color.ink2} />
          </View>
          <View style={{ flexShrink: 1 }}>
            <Text style={[st.statusTitle, !open && { color: color.ink }]}>{card.title}</Text>
            <Text style={[st.statusSub, !open && { color: color.ink2 }]}>{card.sub}</Text>
          </View>
        </View>
        {open ? (
          <View style={st.bar}>
            <View style={[st.barFill, { width: `${Math.max(2, Math.round(elapsedShare(req.created_at, req.expires_at, now) * 100))}%` }]} />
          </View>
        ) : null}
      </View>

      <Text style={st.label}>SENT TO</Text>
      <View style={st.card}>
        {(data?.asked ?? []).map((a, i, all) => (
          <AskedRow
            key={a.sitter_id}
            a={a}
            name={nameOf(a.sitter_id)}
            color={colorOf(a.sitter_id)}
            now={now}
            last={i === all.length - 1}
            open={open}
            pick={!req.first_to_accept}
            busy={busy}
            onBook={() => act(`book-${a.sitter_id}`, () => requestsApi.book(req.id, a.sitter_id))}
            onPass={() => act(`pass-${a.sitter_id}`, () => requestsApi.passOffer(req.id, a.sitter_id))}
          />
        ))}
      </View>

      {open ? (
        <View style={st.bell}>
          <Icon name="bell" size={20} tint={color.ink2} />
          <Text style={st.bellText}>We’ll tell you the moment someone accepts.</Text>
        </View>
      ) : null}
    </Screen>
  );
}

function AskedRow({ a, name, color: bg, now, last, open, pick, busy, onBook, onPass }: { a: AskedSitter; name: string; color: string; now: Date; last: boolean; open: boolean; pick: boolean; busy: string; onBook: () => void; onPass: () => void }) {
  const row = askedRow(a, now);
  const offer = open && a.status === 'offered';
  const yes = open && pick && a.status === 'accepted';
  return (
    <View style={!last && st.line}>
      <Pressable accessibilityRole="button" onPress={() => router.push({ pathname: '/parent/sitter/[id]', params: { id: a.sitter_id } })} style={[st.row, { minHeight: 62 }]}>
        <Initial name={name} bg={bg} />
        <View style={{ flexGrow: 1, flexShrink: 1, minWidth: 0 }}>
          <Text style={st.name}>{shortName(name)}</Text>
          <Text style={st.sub}>{row.sub}</Text>
        </View>
        <Pill label={row.pill} kind={row.kind} />
      </Pressable>
      {offer || yes ? (
        <View style={st.actions}>
          {offer ? <PillButton kind="outline" height={40} label="Look elsewhere" busy={busy === `pass-${a.sitter_id}`} onPress={onPass} style={st.small} /> : null}
          <PillButton height={40} label={offer ? 'Accept offer' : `Book ${firstName(name)}`} busy={busy === `book-${a.sitter_id}`} onPress={onBook} style={st.small} />
        </View>
      ) : null}
    </View>
  );
}

function Detail({ label, value, line }: { label: string; value: string; line?: boolean }) {
  return (
    <View style={[st.detail, line && st.line]}>
      <Text style={st.detailLabel}>{label}</Text>
      <Text style={st.detailValue}>{value}</Text>
    </View>
  );
}

// Values from wireframes P46 and P47.
const st = StyleSheet.create({
  status: { gap: 10, padding: 18, backgroundColor: color.primaryTint, borderRadius: 24 },
  statusIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  statusTitle: { fontFamily: font.display, fontSize: 20, lineHeight: 24, color: color.primaryStrong },
  statusSub: { fontFamily: font.body, fontSize: 14, color: color.primaryStrong },
  bar: { height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.7)', overflow: 'hidden' },
  barFill: { height: '100%', backgroundColor: color.primary },
  label: { fontFamily: font.bodyBold, fontSize: 13, color: color.ink2, letterSpacing: 0.6 },
  card: { paddingHorizontal: 14, backgroundColor: '#FFFFFF', borderRadius: 24, ...cardShadow },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  line: { borderBottomWidth: 1, borderBottomColor: color.divider },
  name: { fontFamily: font.bodySemi, fontSize: 15, color: color.ink },
  sub: { fontFamily: font.body, fontSize: 13, color: color.ink2 },
  actions: { flexDirection: 'row', gap: 8, paddingBottom: 12, paddingLeft: 52 },
  small: { flexGrow: 1 },
  bell: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  bellText: { flexShrink: 1, fontFamily: font.body, fontSize: 14, lineHeight: 20, color: color.ink2 },
  booked: { alignItems: 'center', gap: 10, paddingTop: 40, paddingBottom: 6 },
  bigCheck: { width: 84, height: 84, borderRadius: 42, backgroundColor: color.okTint, alignItems: 'center', justifyContent: 'center' },
  h1: { fontFamily: font.display, fontSize: 28, lineHeight: 32, color: color.ink, textAlign: 'center' },
  when: { fontFamily: font.body, fontSize: 15, color: color.ink2 },
  detail: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', minHeight: 48, gap: 12 },
  detailLabel: { fontFamily: font.body, fontSize: 15, color: color.ink },
  detailValue: { flexShrink: 1, fontFamily: font.body, fontSize: 15, color: color.ink2, textAlign: 'right' },
  told: { paddingVertical: 12, paddingHorizontal: 14, backgroundColor: color.muted, borderRadius: 16, fontFamily: font.body, fontSize: 14, lineHeight: 20, color: color.ink2, overflow: 'hidden' },
});
