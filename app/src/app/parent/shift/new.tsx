import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Avatar, Banner, Button, Chip, ErrorText, Field, Label, Screen, T } from '@/components/ui';
import { dayKey } from '@/lib/calendar-logic';
import { shiftTaskLines } from '@/lib/care-plan';
import { api, useQuery } from '@/lib/data';
import { firstName } from '@/lib/format';
import { familyRulesState } from '@/lib/house-rules';
import { defaultHomeFor, homesOf, mainHome, placesApi } from '@/lib/places';
import { parseTimeOnDay } from '@/lib/shift-logic';
import { useRequirePlan } from '@/lib/billing';
import { useSession } from '@/lib/session';
import { errorText, supabase } from '@/lib/supabase';
import { color, font } from '@/theme';
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

export default function NewShift() {
  // No plan (billing on): P36 instead (P40 "New bookings and care plan edits" pause).
  useRequirePlan();
  const { family, session } = useSession();
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
  // Until the parent types in it, the tasks box follows the care plan items that fall inside the shift.
  const [typed, setTyped] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

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
  const valid = !!chosenSitter && !notAgreed && !!startAt && !!endAt;
  const planned = data && startAt && endAt ? shiftTaskLines(data.care, startAt, endAt, shiftKidIds, (id) => data.kids.find((k) => k.id === id)?.name).join('\n') : '';
  const tasks = typed ?? planned;
  // Where (nP14): only when the kids live in more than one home. Until the parent picks, the home whose days
  // include the shift's day (and its kids), else the main home. place_id null means the main home, so it's only
  // sent for another home (keeps booking working before migration 16 runs).
  const homes = homesOf(data?.places ?? []);
  const main = mainHome(data?.places ?? []);
  const homeId = homes.length > 1 ? (placeId ?? defaultHomeFor(homes, days[day], shiftKidIds)?.id) : undefined;

  async function book() {
    if (!valid) return;
    setBusy(true);
    setErr('');
    const { data: shift, error } = await supabase
      .from('shifts')
      .insert({
        family_id: fid,
        sitter_id: chosenSitter,
        starts_at: startAt!.toISOString(),
        ends_at: endAt!.toISOString(),
        created_by: session!.user.id,
        ...(homeId && homeId !== main?.id ? { place_id: homeId } : {}),
      })
      .select()
      .single();
    if (error) {
      setBusy(false);
      return setErr(errorText(error));
    }
    const kids = shiftKidIds;
    const taskRows = tasks.split('\n').map((t) => t.trim()).filter(Boolean).map((title, position) => ({ shift_id: shift.id, title, position }));
    const results = await Promise.all([
      kids.length ? supabase.from('shift_kids').insert(kids.map((kid_id) => ({ shift_id: shift.id, kid_id }))) : Promise.resolve({ error: null }),
      taskRows.length ? supabase.from('shift_tasks').insert(taskRows) : Promise.resolve({ error: null }),
    ]);
    setBusy(false);
    const e2 = results.find((r) => r.error)?.error;
    if (e2) return setErr(errorText(e2));
    router.replace(`/parent/shift/${shift.id}`);
  }

  // Same rule as the locked step on Home (P4a): kids first, so the sitter has their safety info (P19).
  if (data && data.kids.length === 0)
    return (
      <Screen title="Book a shift" back footer={<Button label="Add a child" onPress={() => router.replace('/parent/kid/new')} />}>
        <Banner kind="warn" icon="user-x">Add your kids first. The sitter sees their food to avoid and allergies on every shift.</Banner>
      </Screen>
    );

  if (data && data.sitters.length === 0)
    return (
      <Screen title="Book a shift" back footer={<Button label="Invite a sitter" onPress={() => router.replace('/parent/invite')} />}>
        <Banner kind="warn" icon="user-x">You need an active sitter first. Invite one; she becomes active after signing your location notice.</Banner>
      </Screen>
    );

  return (
    <Screen title="Book a shift" back footer={<Button label="Book shift" onPress={book} busy={busy} disabled={!valid} />}>
      <Label>Sitter</Label>
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
      </View>
      {notAgreed && (
        <Banner kind="warn" icon="user-x">
          {firstName(data?.sitters.find((s) => s.sitter_id === chosenSitter)?.profile?.full_name)} hasn’t agreed to your house rules yet. You can book her once she agrees in the app.
        </Banner>
      )}
      <Label>Day</Label>
      <View style={{ flexDirection: 'row', gap: 4 }}>
        {days.slice(0, 7).map((d, i) => (
          <Pressable key={i} accessibilityRole="radio" accessibilityState={{ selected: day === i }} onPress={() => setDay(i)} style={[st.day, day === i && st.dayOn]}>
            <Text style={[st.dow, day === i && { color: '#FFFFFF' }]}>{d.toLocaleDateString('en-US', { weekday: 'short' })}</Text>
            <Text style={[st.num, day === i && { color: '#FFFFFF' }]}>{d.getDate()}</Text>
          </Pressable>
        ))}
      </View>
      <View style={{ flexDirection: 'row', gap: 12 }}>
        <TimeField label="Starts" value={start} onChange={setStart} placeholder="3:00 PM" />
        <TimeField label="Ends" value={end} onChange={setEnd} placeholder="7:00 PM" />
      </View>
      {(!startAt || !endAt) && <T variant="small">Type times like 3:00 PM or 15:00.</T>}
      {!!allowedKids.length && (
        <>
          <Label>Kids</Label>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {allowedKids.map((k) => (
              <Chip key={k.id} label={k.name} on={shiftKidIds.includes(k.id)} onPress={() => setKidIds(shiftKidIds.includes(k.id) ? shiftKidIds.filter((x) => x !== k.id) : [...shiftKidIds, k.id])} />
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
      <Field label="Tasks, one per line" value={tasks} onChangeText={setTyped} placeholder={'Pick up Ava at 3:15\nSnack\nDinner at 6'} multiline />
      <ErrorText>{err}</ErrorText>
    </Screen>
  );
}

const st = StyleSheet.create({
  person: { height: 44, paddingLeft: 6, paddingRight: 14, borderRadius: 999, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: color.line },
  personOn: { borderWidth: 2, borderColor: color.primary, backgroundColor: color.primaryTint },
  personText: { fontFamily: font.bodySemi, fontSize: 15, color: color.ink },
  day: { flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: 14, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: color.line, gap: 2 },
  dayOn: { backgroundColor: color.primary, borderColor: color.primary },
  // Day labels match the P6b / S6 week strip.
  dow: { fontFamily: font.body, fontSize: 12, color: '#5F6D74' },
  num: { fontFamily: font.displayBold, fontSize: 17, color: color.ink, marginVertical: -3.62 },
});
