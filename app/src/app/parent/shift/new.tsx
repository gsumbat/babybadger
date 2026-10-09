import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Avatar, Banner, Button, Chip, DrawerHeader, ErrorText, Label, Screen, T } from '@/components/ui';
import { bookingApi, bookingWarning, dayWindows, defaultUntil, maxUntil, repeatDays, repeatSummary, sendRequestLabel, seriesWarning, WEEKDAY_LETTERS, weekdayName } from '@/lib/booking';
import { dayKey } from '@/lib/calendar-logic';
import { shiftTaskGroups, shiftTaskLines } from '@/lib/care-plan';
import { api, useQuery } from '@/lib/data';
import { firstName } from '@/lib/format';
import { familyRulesState } from '@/lib/house-rules';
import { defaultHomeFor, homesOf, mainHome, placesApi } from '@/lib/places';
import { poolData, statusFor, timeText } from '@/lib/pool';
import { spanText } from '@/lib/pool-requests-logic';
import { parseTimeOnDay } from '@/lib/shift-logic';
import { useRequirePlan } from '@/lib/billing';
import { useSession } from '@/lib/session';
import { color, font } from '@/theme';
import { KidDot, kidChipTone, ToggleRow } from '@/components/bits';
import { DateField } from '@/components/DateField';
import { Text } from '@/components/Text';
import { TimeField } from '@/components/TimeField';

function nextDays(n: number) {
  return Array.from({ length: n }, (_, i) => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + i);
    return d;
  });
}

// Wireframe P6d Book a shift: a drawer (formSheet) over the screen it was opened from, with the grey grab line and no
// back button; swipe it down to close. Sitter chips plus "See who's free" (P42 Sitter pool), the day, Starts / Ends
// (wheels), Repeat, Kids, Where (only with two or more homes, E2w) and Send request. There's no tasks box: the
// shift's tasks come from the kids' days (P20k), the care plan items that fall inside the shift, listed read-only
// under "From their days"; after booking they can be changed on the shift (P5e).
// Booking is a request the sitter accepts (migration 35): "Send request" asks her, and her yes books the shift with
// those tasks; the drawer then opens the waiting request (P46). P6e Repeat: day buttons, Until (date wheel, at most
// 6 months, 60 dates) and "12 shifts · Mon, Wed, Fri · until Nov 13"; each date gets the tasks from its own day's
// plan; the sitter answers the whole series at once (S33s). P6g: when the pool's hours, days off or this family's
// shifts say she isn't free (lib/pool-logic), an amber card: "Maya is unavailable 7:00 – 10:00 PM" + why, with
// "Book 6:00 – 7:00 PM" (only when part of it is free) and "Ask anyway"; for a series "Maya is busy on 2 of 12 dates"
// with "Skip those dates" / "Ask anyway".
export default function NewShift() {
  // No plan (billing on): P36 instead (P40 "New bookings and care plan edits" pause).
  useRequirePlan();
  const { family } = useSession();
  const fid = family!.id;
  const { data } = useQuery(async () => {
    // care_items arrives with migration 06; until it's run booking just starts with no tasks.
    // places arrives with migration 16; until it's run there's no "Where" row and shifts are at the main home.
    const [all, kids, care, places] = await Promise.all([api.familySitters(fid), api.kids(fid), api.careItems(fid).catch(() => []), placesApi.list(fid).catch(() => [])]);
    const sitters = all.filter((s) => s.status === 'active');
    // House rules gate (migration 09): sitters who haven't agreed to the current Must rules can't be booked yet.
    const { pending } = await familyRulesState(fid, sitters.map((s) => s.sitter_id));
    return { sitters, kids, care, pending, places };
  }, [fid]);
  // Hours, days off and this family's shifts for the P6g warning; no warning when they can't be read.
  const { data: pool } = useQuery(() => poolData(fid).catch(() => null), [fid]);

  // Optional prefill (from P42 Sitter pool): ?sitter=<id>&day=YYYY-MM-DD&start=6:00 PM&end=10:00 PM. Without them the
  // screen starts as before: first sitter who agreed to the house rules, today, 3:00 – 7:00 PM.
  const prefill = useLocalSearchParams<{ sitter?: string; day?: string; start?: string; end?: string }>();
  const days = useMemo(() => nextDays(7), []);
  const [sitterId, setSitterId] = useState<string | undefined>(prefill.sitter || undefined);
  const [day, setDay] = useState(() => Math.max(0, days.findIndex((d) => dayKey(d) === prefill.day)));
  const [start, setStart] = useState(prefill.start || '3:00 PM');
  const [end, setEnd] = useState(prefill.end || '7:00 PM');
  const [kidIds, setKidIds] = useState<string[]>([]);
  const [placeId, setPlaceId] = useState<string>();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  // P6e Repeat: the picked weekdays (null = the first date's), Until ('' = 4 weeks out), dates skipped from P6g.
  const [repeat, setRepeat] = useState(false);
  const [weekdays, setWeekdays] = useState<number[] | null>(null);
  const [until, setUntil] = useState('');
  const [skipped, setSkipped] = useState<string[]>([]);

  const startAt = parseTimeOnDay(start, days[day]);
  let endAt = parseTimeOnDay(end, days[day]);
  if (startAt && endAt && endAt <= startAt) endAt = new Date(+endAt + 24 * 3600_000); // overnight
  const picked = sitterId && data?.sitters.some((s) => s.sitter_id === sitterId) ? sitterId : undefined;
  const chosenSitter = picked ?? (data?.sitters.find((s) => !data.pending.includes(s.sitter_id)) ?? data?.sitters[0])?.sitter_id;
  const notAgreed = !!chosenSitter && !!data?.pending.includes(chosenSitter);
  // Only the kids this sitter's invite covers (P23; kid_ids null = every kid). Migration 11 adds the column.
  const sitterKidIds = (data?.sitters.find((s) => s.sitter_id === chosenSitter) as { kid_ids?: string[] | null } | undefined)?.kid_ids;
  const allowedKids = (data?.kids ?? []).filter((k) => !sitterKidIds?.length || sitterKidIds.includes(k.id));
  const shiftKidIds = kidIds.length ? kidIds.filter((id) => allowedKids.some((k) => k.id === id)) : allowedKids.map((k) => k.id);
  // The dates asked for: the chosen day, or with Repeat every picked weekday through Until (minus skipped dates).
  const first = days[day];
  const onDays = weekdays ?? [first.getDay()];
  const untilKey = until || defaultUntil(first);
  const dates = repeat ? repeatDays(first, onDays, untilKey).filter((d) => !skipped.includes(dayKey(d))) : [first];
  const windows = dayWindows(dates, start, end) ?? [];
  const valid = !!chosenSitter && !notAgreed && !!startAt && !!endAt && windows.length > 0;
  const sitterName = firstName(data?.sitters.find((s) => s.sitter_id === chosenSitter)?.profile?.full_name);
  // P6g: is she free (the same status the pool shows)?
  const statuses = pool && chosenSitter ? windows.map((w) => statusFor(pool, chosenSitter, w)) : [];
  const warning = !repeat && statuses[0] && windows[0] ? bookingWarning(statuses[0], windows[0], sitterName) : null;
  const seriesWarn = repeat && statuses.length ? seriesWarning(statuses, windows, sitterName) : null;
  // The kids' days (P20k): care plan items that fall inside the shift become its tasks. On the screen, one group per
  // kid (her badge and name), then the family's ("Everyone").
  const groups = data && startAt && endAt ? shiftTaskGroups(data.care, startAt, endAt, shiftKidIds) : [];
  // Where (nP14): only when the kids live in more than one home. Until the parent picks, the home whose days
  // include the shift's day (and its kids), else the main home. place_id null means the main home, so it's only
  // sent for another home (keeps booking working before migration 16 runs).
  const homes = homesOf(data?.places ?? []);
  const main = mainHome(data?.places ?? []);
  const homeId = homes.length > 1 ? (placeId ?? defaultHomeFor(homes, days[day], shiftKidIds)?.id) : undefined;

  // Each date's tasks come from that date's plan (the first date's are the ones listed below).
  const kidName = (id: string) => data?.kids.find((k) => k.id === id)?.name;
  async function send() {
    if (!valid || !data) return;
    setBusy(true);
    setErr('');
    try {
      const res = await bookingApi.create({
        sitterId: chosenSitter!,
        windows: windows.map((w) => ({ ...w, tasks: shiftTaskLines(data.care, w.start, w.end, shiftKidIds, kidName) })),
        kidIds: shiftKidIds,
        placeId: homeId && homeId !== main?.id ? homeId : null,
      });
      // Where it waits: P46 ("Waiting for Maya"); a series opens on its first date.
      router.replace({ pathname: '/parent/request/[id]', params: { id: res.request_ids[0] } });
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  // Same rule as the locked step on Home (P4a): kids first, so the sitter has their safety info (P19).
  if (data && data.kids.length === 0)
    return (
      <Screen bleedTop bg={color.surface} header={<DrawerHeader title="Book a shift" />} footer={<Button label="Add a child" onPress={() => router.replace('/parent/kid/new')} />}>
        <Banner kind="warn" icon="user-x">Add your kids first. The sitter sees their food to avoid and allergies on every shift.</Banner>
      </Screen>
    );

  if (data && data.sitters.length === 0)
    return (
      <Screen bleedTop bg={color.surface} header={<DrawerHeader title="Book a shift" />} footer={<Button label="Invite a sitter" onPress={() => router.replace('/parent/invite')} />}>
        <Banner kind="warn" icon="user-x">You need an active sitter first. Invite one; she becomes active after signing your location notice.</Banner>
      </Screen>
    );

  return (
    <Screen
      bleedTop
      bg={color.surface}
      header={<DrawerHeader title="Book a shift" sub={`${repeat ? 'Starting ' : ''}${(dates[0] ?? first).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}`} />}
      footer={<Button label={sendRequestLabel(windows.length)} onPress={send} busy={busy} disabled={!valid} />}>
      <Label first>Sitter</Label>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {data?.sitters.map((s) => {
          const on = chosenSitter === s.sitter_id;
          return (
            <Pressable key={s.sitter_id} accessibilityRole="radio" accessibilityState={{ selected: on }} onPress={() => setSitterId(s.sitter_id)} style={[st.person, on && st.personOn]}>
              <Avatar name={s.profile?.full_name || '?'} size={30} />
              <Text style={st.personText}>{firstName(s.profile?.full_name)}</Text>
            </Pressable>
          );
        })}
        <Pressable accessibilityRole="button" onPress={() => {
            // Close the drawer first so the pool opens as a normal screen, not on top of the sheet.
            router.back();
            router.push('/parent/pool');
          }}
          style={st.free}>
          <Text style={st.freeText}>See who’s free</Text>
        </Pressable>
      </View>
      {notAgreed && (
        <Banner kind="warn" icon="user-x">
          {firstName(data?.sitters.find((s) => s.sitter_id === chosenSitter)?.profile?.full_name)} hasn’t agreed to your house rules yet. You can book her once she agrees in the app.
        </Banner>
      )}
      <Label>Day</Label>
      <View style={{ flexDirection: 'row', gap: 4 }}>
        {days.slice(0, 7).map((d, i) => (
          <Pressable
            key={i}
            accessibilityRole="radio"
            accessibilityState={{ selected: day === i }}
            onPress={() => {
              setDay(i);
              setWeekdays(null);
              setSkipped([]);
            }}
            style={[st.day, day === i && st.dayOn]}>
            <Text style={[st.dow, day === i && { color: '#FFFFFF' }]}>{d.toLocaleDateString('en-US', { weekday: 'short' })}</Text>
            <Text style={[st.num, day === i && { color: '#FFFFFF' }]}>{d.getDate()}</Text>
          </Pressable>
        ))}
      </View>
      <View style={{ flexDirection: 'row', gap: 12 }}>
        <TimeField label="Starts" value={start} onChange={setStart} placeholder="3:00 PM" />
        <TimeField label="Ends" value={end} onChange={setEnd} placeholder="7:00 PM" warn={!!warning} />
      </View>
      {(!startAt || !endAt) && <T variant="small">Type times like 3:00 PM or 15:00.</T>}
      {warning ? (
        <View style={st.warnCard}>
          <Text style={st.warnTitle}>{warning.title}</Text>
          <Text style={st.warnSub}>{warning.sub}</Text>
          <View style={st.warnPills}>
            {warning.offer ? (
              <Pressable
                accessibilityRole="button"
                onPress={() => {
                  setStart(timeText(warning.offer!.start));
                  setEnd(timeText(warning.offer!.end));
                }}
                style={st.warnPill}>
                <Text style={st.warnPillText}>Book {spanText(warning.offer.start, warning.offer.end)}</Text>
              </Pressable>
            ) : null}
            <Pressable accessibilityRole="button" disabled={busy || !valid} onPress={send} style={st.warnPill}>
              <Text style={st.warnPillText}>Ask anyway</Text>
            </Pressable>
          </View>
        </View>
      ) : null}
      <View style={st.repeat}>
        <ToggleRow
          label="Repeat"
          sub={repeat ? 'Every week on these days' : 'Book the same time on other days'}
          value={repeat}
          onChange={(v) => {
            setRepeat(v);
            setSkipped([]);
          }}
          last
        />
      </View>
      {repeat ? (
        <>
          <View style={st.weekRow}>
            {WEEKDAY_LETTERS.map((letter, n) => {
              const on = onDays.includes(n);
              return (
                <Pressable
                  key={n}
                  accessibilityRole="checkbox"
                  accessibilityLabel={weekdayName(n)}
                  accessibilityState={{ checked: on }}
                  onPress={() => setWeekdays(on ? onDays.filter((x) => x !== n) : [...onDays, n])}
                  style={[st.weekDay, on && st.weekDayOn]}>
                  <Text style={[st.weekLetter, on && { color: '#FFFFFF' }]}>{letter}</Text>
                </Pressable>
              );
            })}
          </View>
          <View style={{ flexDirection: 'row' }}>
            <DateField label="Until" value={untilKey} onChange={(v) => setUntil(v)} />
          </View>
          {untilKey > maxUntil(first) ? <T variant="small">Up to 6 months ahead: the last date is the one 6 months out.</T> : null}
          <View style={st.summary}>
            <Text style={st.summaryText}>
              <Text style={st.summaryCount}>{repeatSummary(dates).count}</Text> · {repeatSummary(dates).rest}
            </Text>
          </View>
          {seriesWarn ? (
            <View style={st.warnCard}>
              <Text style={st.warnTitle}>{seriesWarn.title}</Text>
              <Text style={st.warnSub}>{seriesWarn.sub}</Text>
              <View style={st.warnPills}>
                <Pressable accessibilityRole="button" onPress={() => setSkipped([...skipped, ...seriesWarn.keys])} style={st.warnPill}>
                  <Text style={st.warnPillText}>Skip those dates</Text>
                </Pressable>
                <Pressable accessibilityRole="button" disabled={busy || !valid} onPress={send} style={st.warnPill}>
                  <Text style={st.warnPillText}>Ask anyway</Text>
                </Pressable>
              </View>
            </View>
          ) : null}
        </>
      ) : null}
      {!!allowedKids.length && (
        <>
          <Label>Kids</Label>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {allowedKids.map((k) => (
              <Chip key={k.id} label={k.name} on={shiftKidIds.includes(k.id)} tone={kidChipTone(k)} lead={<KidDot kid={k} size={20} />} onPress={() => setKidIds(shiftKidIds.includes(k.id) ? shiftKidIds.filter((x) => x !== k.id) : [...shiftKidIds, k.id])} />
            ))}
          </View>
        </>
      )}
      {homes.length > 1 && (
        <>
          <Label>Where</Label>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {homes.map((h) => (
              <Chip key={h.id} label={h.name} on={homeId === h.id} onPress={() => setPlaceId(h.id)} />
            ))}
          </View>
        </>
      )}
      <Label>From their days</Label>
      {repeat ? <Text style={st.eachNote}>Each date gets the tasks from that day’s plan. First date shown.</Text> : null}
      {groups.length ? (
        <View style={{ gap: 10 }}>
          {groups.map((g) => {
            const kid = data?.kids.find((k) => k.id === g.kidId);
            return (
              <View key={g.kidId ?? 'all'} style={st.group}>
                <View style={st.groupHead}>
                  {kid ? <KidDot kid={kid} size={26} /> : null}
                  <Text style={st.groupName}>{kid ? kid.name : 'Everyone'}</Text>
                </View>
                {g.rows.map((r, i) => (
                  <View key={i} style={[st.taskRow, st.taskLine]}>
                    <Text style={st.taskTime}>{r.time}</Text>
                    <Text style={st.task}>{r.title}</Text>
                  </View>
                ))}
              </View>
            );
          })}
        </View>
      ) : (
        <T variant="small">Nothing from the kids’ days falls in this time. You can add tasks on the shift once it’s booked.</T>
      )}
      <ErrorText>{err}</ErrorText>
    </Screen>
  );
}

const st = StyleSheet.create({
  person: { height: 44, paddingLeft: 6, paddingRight: 14, borderRadius: 999, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: color.line },
  personOn: { borderWidth: 2, borderColor: color.primary, backgroundColor: color.primaryTint },
  // P6 "See who's free": a tinted pill next to the sitters, opens the sitter pool (P42).
  free: { height: 44, paddingHorizontal: 14, borderRadius: 999, justifyContent: 'center', backgroundColor: color.primaryTint, borderWidth: 1, borderColor: color.line },
  freeText: { fontFamily: font.bodySemi, fontSize: 15, color: color.primary },
  // "From their days": one card per kid (badge + name), rows 48 tall with a light line between them.
  group: { paddingHorizontal: 14, backgroundColor: color.canvas, borderRadius: 16 },
  groupHead: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingTop: 12, paddingBottom: 8 },
  groupName: { fontFamily: font.bodyBold, fontSize: 15, color: color.ink },
  taskRow: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 48 },
  taskLine: { borderTopWidth: 1, borderTopColor: color.divider },
  taskTime: { width: 44, fontFamily: font.bodySemi, fontSize: 14, color: color.ink2 },
  task: { flex: 1, fontFamily: font.body, fontSize: 15, color: color.ink },
  personText: { fontFamily: font.bodySemi, fontSize: 15, color: color.ink },
  day: { flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: 14, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: color.line, gap: 2 },
  dayOn: { backgroundColor: color.primary, borderColor: color.primary },
  // Day labels match the P6b / S6 week strip.
  dow: { fontFamily: font.body, fontSize: 12, color: '#5F6D74' },
  num: { fontFamily: font.displayBold, fontSize: 17, color: color.ink, marginVertical: -3.62 },
  // P6g: amber card, radius 14, white 40 px pills.
  warnCard: { gap: 4, padding: 14, backgroundColor: color.warnTint, borderRadius: 14 },
  warnTitle: { fontFamily: font.bodyBold, fontSize: 15, color: color.warnInk },
  warnSub: { fontFamily: font.body, fontSize: 13, color: color.ink2 },
  warnPills: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 6 },
  warnPill: { height: 40, paddingHorizontal: 14, borderRadius: 999, justifyContent: 'center', backgroundColor: '#FFFFFF' },
  warnPillText: { fontFamily: font.bodySemi, fontSize: 14, color: color.ink },
  // P6d / P6e Repeat: the switch row, 7 round 40 px day buttons, the primary-tint summary line.
  repeat: { paddingHorizontal: 14, backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: color.line },
  weekRow: { flexDirection: 'row', justifyContent: 'space-between' },
  weekDay: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: color.line },
  weekDayOn: { backgroundColor: color.primary, borderColor: color.primary },
  weekLetter: { fontFamily: font.bodyBold, fontSize: 15, color: color.ink },
  summary: { paddingVertical: 10, paddingHorizontal: 14, backgroundColor: color.primaryTint, borderRadius: 14 },
  summaryText: { fontFamily: font.body, fontSize: 14, color: color.primaryStrong },
  summaryCount: { fontFamily: font.bodyBold, fontSize: 14, color: color.primaryStrong },
  eachNote: { fontFamily: font.body, fontSize: 13, color: color.ink2 },
});
