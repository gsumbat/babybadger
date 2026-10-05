import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { View } from 'react-native';

import { Banner, Button, Chip, ErrorText, Field, Label, Screen, T } from '@/components/ui';
import { api, useQuery } from '@/lib/data';
import { firstName } from '@/lib/format';
import { parseTimeOnDay } from '@/lib/shift-logic';
import { useSession } from '@/lib/session';
import { errorText, supabase } from '@/lib/supabase';

function nextDays(n: number) {
  return Array.from({ length: n }, (_, i) => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + i);
    return d;
  });
}

export default function NewShift() {
  const { family, session } = useSession();
  const fid = family!.id;
  const { data } = useQuery(async () => {
    const [sitters, kids] = await Promise.all([api.familySitters(fid), api.kids(fid)]);
    return { sitters: sitters.filter((s) => s.status === 'active'), kids };
  }, [fid]);

  const days = useMemo(() => nextDays(7), []);
  const [sitterId, setSitterId] = useState<string>();
  const [day, setDay] = useState(0);
  const [start, setStart] = useState('3:00 PM');
  const [end, setEnd] = useState('7:00 PM');
  const [kidIds, setKidIds] = useState<string[]>([]);
  const [tasks, setTasks] = useState('Pick up Ava at 3:15\nSnack\nDinner at 6');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const startAt = parseTimeOnDay(start, days[day]);
  let endAt = parseTimeOnDay(end, days[day]);
  if (startAt && endAt && endAt <= startAt) endAt = new Date(+endAt + 24 * 3600_000); // overnight
  const chosenSitter = sitterId ?? data?.sitters[0]?.sitter_id;
  const valid = !!chosenSitter && !!startAt && !!endAt;

  async function book() {
    if (!valid) return;
    setBusy(true);
    setErr('');
    const { data: shift, error } = await supabase
      .from('shifts')
      .insert({ family_id: fid, sitter_id: chosenSitter, starts_at: startAt!.toISOString(), ends_at: endAt!.toISOString(), created_by: session!.user.id })
      .select()
      .single();
    if (error) {
      setBusy(false);
      return setErr(errorText(error));
    }
    const kids = kidIds.length ? kidIds : (data?.kids ?? []).map((k) => k.id);
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
        {data?.sitters.map((s) => <Chip key={s.sitter_id} label={firstName(s.profile?.full_name)} on={chosenSitter === s.sitter_id} onPress={() => setSitterId(s.sitter_id)} />)}
      </View>
      <Label>Day</Label>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {days.map((d, i) => (
          <Chip key={i} label={i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString([], { weekday: 'short', day: 'numeric' })} on={day === i} onPress={() => setDay(i)} />
        ))}
      </View>
      <View style={{ flexDirection: 'row', gap: 12 }}>
        <View style={{ flex: 1 }}>
          <Field label="Starts" value={start} onChangeText={setStart} placeholder="3:00 PM" />
        </View>
        <View style={{ flex: 1 }}>
          <Field label="Ends" value={end} onChangeText={setEnd} placeholder="7:00 PM" />
        </View>
      </View>
      {(!startAt || !endAt) && <T variant="small">Type times like 3:00 PM or 15:00.</T>}
      {!!data?.kids.length && (
        <>
          <Label>Kids</Label>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {data.kids.map((k) => (
              <Chip key={k.id} label={k.name} on={kidIds.length === 0 || kidIds.includes(k.id)} onPress={() => setKidIds((ids) => (ids.includes(k.id) ? ids.filter((x) => x !== k.id) : [...(ids.length ? ids : data.kids.map((x) => x.id)).filter((x) => x !== k.id)]))} />
            ))}
          </View>
        </>
      )}
      <Field label="Tasks, one per line" value={tasks} onChangeText={setTasks} multiline />
      <ErrorText>{err}</ErrorText>
    </Screen>
  );
}
