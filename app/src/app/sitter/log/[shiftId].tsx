import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';

import { BoxChoice, Button, Chip, ChoicePill, ErrorText, Field, Icon, type IconName, Label, Screen, Segmented, SheetHeader, T } from '@/components/ui';
import { AmountWheel } from '@/components/AmountWheel';
import { amountChoices, amountText, bottleTaskDetails, convertAmount, DEFAULT_AMOUNT, loggedAt, planBottle, planLine } from '@/lib/bottle';
import { BOTTLE_UNITS, MILKS } from '@/lib/care-plan';
import { api, useQuery, useShiftLive } from '@/lib/data';
import { pronouns } from '@/lib/kid-profile';
import { DIAPER_LABELS } from '@/lib/shift-logic';
import { firstName, timeOf } from '@/lib/format';
import { useSession } from '@/lib/session';
import { errorText, supabase } from '@/lib/supabase';
import type { BottleUnit, LogKind } from '@/lib/types';
import { color, font } from '@/theme';
import { Text, TextInput } from '@/components/Text';
import { TimeField, TimeWheel } from '@/components/TimeField';

const cap = (x: string) => x[0].toUpperCase() + x.slice(1);
const opts = (xs: string[]) => xs.map((x) => ({ value: x, label: cap(x) }));
// S5b: Bottle first in the meal segment.
const MEALS = ['bottle', 'snack', 'breakfast', 'lunch', 'dinner'];
const KINDS: { kind: LogKind; label: string; icon: IconName }[] = [
  { kind: 'food', label: 'Food', icon: 'coffee' },
  { kind: 'nap', label: 'Nap', icon: 'moon' },
  { kind: 'activity', label: 'Activity', icon: 'play-circle' },
  { kind: 'photo', label: 'Photo', icon: 'camera' },
  { kind: 'diaper', label: 'Diaper', icon: 'droplet' },
  { kind: 'note', label: 'Note', icon: 'file-text' },
];

const TITLES: Record<LogKind, string> = { food: 'Log food', nap: 'Log a nap', activity: 'Log an activity', diaper: 'Diaper or potty', note: 'Add a note', photo: 'Photo update', incident: 'Log an incident' }; // incidents have their own screen (S24)

function Choice({ label, options, value, onChange, labels }: { label: string; options: string[]; value: string; onChange: (v: string) => void; labels?: Record<string, string> }) {
  return (
    <View style={{ gap: 8 }}>
      {/* A question in the form, like "Who" and "How much?" beside it: no section gap. */}
      <Label first>{label}</Label>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {options.map((o) => <Chip key={o} label={labels?.[o] ?? cap(o)} on={value === o} onPress={() => onChange(o)} />)}
      </View>
    </View>
  );
}

/** A new photo's storage path in the shift's folder. */
function photoPath(shiftId: string) {
  return `${shiftId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`;
}

/** "1 h 25 min" between two typed times like "3:45 PM" and "5:10 PM" (wireframe S45, under Woke up). */
function napLength(from?: string, to?: string) {
  const mins = (t?: string) => {
    const m = t?.trim().match(/^(\d{1,2}):(\d{2})\s*([AP]M)?$/i);
    if (!m) return null;
    let h = +m[1] % 12;
    if (m[3]?.toUpperCase() === 'PM' || (!m[3] && +m[1] === 12)) h += 12;
    if (!m[3] && +m[1] > 12) h = +m[1];
    return h * 60 + +m[2];
  };
  const a = mins(from);
  const b = mins(to);
  if (a === null || b === null) return '';
  const d = (b - a + 1440) % 1440;
  if (!d) return '';
  return d >= 60 ? `${Math.floor(d / 60)} h ${d % 60} min` : `${d} min`;
}

// ?kind=food&bottle=1&kidId=&taskId= opens straight on a bottle for one kid (S4m "Confirm" on a planned bottle task);
// saving it also ticks the task.
export default function AddLog() {
  const params = useLocalSearchParams<{ shiftId: string; kind: LogKind | 'more'; bottle?: string; kidId?: string; taskId?: string }>();
  const { shiftId, kind: k, taskId } = params;
  const [picked, setPicked] = useState<LogKind | null>(null);
  const kind = (picked ?? (k === 'more' ? null : k) ?? null) as LogKind | null;
  const { session } = useSession();
  const { bundle } = useShiftLive(shiftId);
  const kids = bundle?.kids ?? [];
  const fid = bundle?.shift.family_id;
  // The parent's bottle plan (care_items, sitters may read them) and her first name for "From Jen’s plan".
  const { data: careItems } = useQuery(() => (fid ? api.careItems(fid).catch(() => []) : Promise.resolve([])), [fid]);
  const { data: parents } = useQuery(() => (fid ? api.familyParents(fid).catch(() => []) : Promise.resolve([])), [fid]);

  const [who, setWho] = useState<string[]>(params.kidId ? [params.kidId] : []);
  // meal '' = not picked yet: Bottle when the kid has a planned bottle, else Snack. Bottle extras ('' = from the plan):
  // milk, bottle_amount, bottle_unit; bottle_at is the S5b time.
  const [f, setF] = useState<Record<string, string>>({
    meal: params.bottle === '1' ? 'bottle' : '', amount: 'all', how: 'easily', duration: '30 min', diaper: 'wet', potty: '', category: 'good news',
    started_at: timeOf(new Date()), bottle_at: timeOf(new Date()), milk: '', bottle_amount: '', bottle_unit: '',
  });
  const [asleep, setAsleep] = useState(false);
  const [photo, setPhoto] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const set = (key: string) => (v: string) => setF((x) => ({ ...x, [key]: v }));

  // S5b bottle: one kid (the picked one, the only one, or the first with a planned bottle) and her planned bottle closest
  // to now, or to the task's time. A task line's own amount and milk come first.
  const task = taskId ? bundle?.tasks.find((t) => t.id === taskId) : undefined;
  const planAt = task?.due_at ? new Date(task.due_at) : new Date();
  const planFor = (id: string | null | undefined) => planBottle(careItems ?? [], id, planAt);
  const bottleKid = who.length === 1 ? who[0] : kids.length === 1 ? kids[0].id : (kids.find((x) => planFor(x.id))?.id ?? kids[0]?.id ?? null);
  const plan = planFor(bottleKid);
  const meal = f.meal || (plan ? 'bottle' : 'snack');
  const isBottle = kind === 'food' && meal === 'bottle';
  const fromTask = task ? bottleTaskDetails(task.title) : {};
  const baseUnit: BottleUnit = fromTask.amount ? (fromTask.unit ?? 'oz') : (plan?.details.unit ?? 'oz');
  const unit: BottleUnit = f.bottle_unit === 'oz' || f.bottle_unit === 'ml' ? f.bottle_unit : baseUnit;
  const base = fromTask.amount ?? plan?.details.amount;
  const bottleAmount = f.bottle_amount ? Number(f.bottle_amount) : base ? convertAmount(base, baseUnit, unit) : DEFAULT_AMOUNT[unit];
  const milk = f.milk || fromTask.milk || plan?.details.milk || 'formula';
  const bottleKidRow = kids.find((x) => x.id === bottleKid);
  const parentName = parents?.[0]?.full_name?.trim() ? firstName(parents[0].full_name) : '';

  const allKids = kids.map((x) => x.id);
  const chosen = isBottle && !who.length && bottleKid ? [bottleKid] : who.length ? who : allKids;
  const whoValue = chosen.length === 1 && (who.length || isBottle) ? chosen[0] : 'all';
  // Another kid has another plan: her bottle extras start from it again (the meal stays as shown).
  const pickKid = (id: string) => {
    setWho([id]);
    setF((x) => ({ ...x, meal: x.meal || meal, milk: '', bottle_amount: '', bottle_unit: '' }));
  };
  const pickUnit = (u: BottleUnit) => setF((x) => ({ ...x, bottle_unit: u, bottle_amount: String(convertAmount(bottleAmount, unit, u)) }));

  async function pick(camera: boolean) {
    const perm = camera ? await ImagePicker.requestCameraPermissionsAsync() : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return setErr('Allow camera or photos access in Settings to add a photo.');
    const res = camera
      ? await ImagePicker.launchCameraAsync({ quality: 0.6, allowsEditing: true })
      : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.6, allowsEditing: true });
    if (!res.canceled) setPhoto(res.assets[0]);
  }

  async function save() {
    setBusy(true);
    setErr('');
    try {
      let photo_path: string | null = null;
      if (photo && !isBottle) {
        photo_path = photoPath(shiftId);
        const body = await (await fetch(photo.uri)).arrayBuffer();
        const up = await supabase.storage.from('shift-photos').upload(photo_path, body, { contentType: 'image/jpeg' });
        if (up.error) throw up.error;
      }
      const data: Record<string, string> = {};
      // A bottle also saves `what` ("4 oz formula") so the parents' push (migration 15) reads it; task_id ties it to S4m.
      const vals: Record<string, string> = isBottle
        ? { ...f, meal, milk, bottle_amount: amountText(bottleAmount), bottle_unit: unit, what: `${amountText(bottleAmount)} ${unit} ${milk}`, task_id: taskId ?? '' }
        : { ...f, meal };
      const keep = {
        food: isBottle ? ['meal', 'milk', 'bottle_amount', 'bottle_unit', 'amount', 'what', 'task_id'] : ['meal', 'what', 'amount'],
        nap: ['started_at', 'ended_at', 'how', 'note'],
        activity: ['what', 'duration', 'note'],
        diaper: ['diaper', 'potty', 'note'],
        note: ['category', 'text'],
        photo: ['caption'],
        incident: ['type', 'where', 'text'],
      }[kind!];
      for (const key of keep) if (vals[key]) data[key] = vals[key];
      const when = isBottle ? { happened_at: loggedAt(f.bottle_at).toISOString() } : {};
      const { error } = await supabase.from('logs').insert({ shift_id: shiftId, author_id: session!.user.id, kind, kid_ids: chosen, data, photo_path, urgent: false, ...when });
      if (error) throw error;
      // The planned bottle it confirms is done (same call as the task checkbox); the log is saved either way.
      if (isBottle && taskId) {
        const { error: e } = await supabase.rpc('set_task_done', { p_task: taskId, p_done: true });
        if (e) Alert.alert('Couldn’t tick the task', errorText(e));
      }
      router.back();
    } catch (e) {
      setErr(errorText(e));
    } finally {
      setBusy(false);
    }
  }

  const valid =
    (kind === 'food' && (isBottle || !!f.what?.trim())) ||
    kind === 'nap' ||
    (kind === 'activity' && !!f.what?.trim()) ||
    kind === 'diaper' ||
    (kind === 'note' && !!f.text?.trim()) ||
    (kind === 'photo' && !!photo);

  // Wireframe S44: "Add a log" chooser, two rows of three. Left out until built (needs house rules): the
  // "The Lees asked for…" line, DUE badges and "See what's due".
  if (!kind)
    return (
      <Screen bleedTop bg={color.surface} gap={14} header={<SheetHeader title="Add a log" />}>
        <View style={{ gap: 10 }}>
          {[KINDS.slice(0, 3), KINDS.slice(3)].map((row) => (
            <View key={row[0].kind} style={{ flexDirection: 'row', gap: 10 }}>
              {row.map((x) => (
                <Pressable key={x.kind} accessibilityRole="button" onPress={() => setPicked(x.kind)} style={({ pressed }) => [st.kindTile, pressed && { opacity: 0.85 }]}>
                  <Icon name={x.icon} size={28} tint={color.primary} />
                  <Text style={st.kindText}>{x.label}</Text>
                </Pressable>
              ))}
            </View>
          ))}
        </View>
      </Screen>
    );

  // Wireframes S5 (food, 16 between groups, semibold labels), S45 (nap, 14, bold labels), S46-S49.
  const q = kind === 'nap' ? [st.q, { fontFamily: font.bodyBold }] : st.q;
  return (
    <Screen
      bleedTop
      bg={color.surface}
      gap={kind === 'food' ? 16 : kind === 'nap' ? 14 : undefined}
      header={<SheetHeader title={isBottle ? 'Log a bottle' : TITLES[kind]} />}
      footer={<Button label={kind === 'photo' ? 'Send to the parents' : 'Save and notify parents'} onPress={save} busy={busy} disabled={!valid} />}>
      {kids.length > 1 && (
        <View style={{ gap: 8 }}>
          <Text style={q}>Who</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {kids.map((kid) => (
              <ChoicePill key={kid.id} label={kid.name} tint={color.accentTint} on={whoValue === kid.id} onPress={() => pickKid(kid.id)} />
            ))}
            {/* A bottle is one kid's (her own plan). */}
            {isBottle ? null : <ChoicePill label={kids.length === 2 ? 'Both' : 'All'} tint={color.accentTint} on={whoValue === 'all'} onPress={() => setWho([])} />}
          </View>
        </View>
      )}

      {kind === 'food' && (
        <Segmented square options={opts(MEALS)} value={meal} onChange={set('meal')} />
      )}

      {/* S5b: the plan's bottle, ready to confirm. */}
      {isBottle && (
        <>
          {plan ? (
            <View style={st.plan}>
              <Text style={st.planText}>
                <Text style={st.planBold}>From {parentName ? `${parentName}’s` : 'the'} plan: </Text>
                {planLine(plan)}
              </Text>
            </View>
          ) : null}
          <View style={{ gap: 8 }}>
            <Text style={st.q}>Milk</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {MILKS.map((m) => (
                <ChoicePill key={m.value} label={m.label} on={milk === m.value} onPress={() => set('milk')(m.value)} />
              ))}
            </View>
          </View>
          <View style={{ gap: 8 }}>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <AmountWheel label="Amount" values={amountChoices(unit)} value={bottleAmount} onChange={(v) => set('bottle_amount')(String(v))} format={(v) => `${amountText(v)} ${unit}`} />
              <TimeField label="Time" value={f.bottle_at ?? ''} onChange={set('bottle_at')} />
            </View>
            <View style={{ width: 120 }}>
              <Segmented square options={BOTTLE_UNITS} value={unit} onChange={pickUnit} />
            </View>
          </View>
          <View style={{ gap: 8 }}>
            <Text style={st.q}>How much did {pronouns(bottleKidRow?.gender).subj} drink?</Text>
            <BoxChoice options={opts(['none', 'some', 'most', 'all'])} value={f.amount} onChange={set('amount')} />
          </View>
        </>
      )}

      {kind === 'food' && !isBottle && (
        <>
          <Field label="What did they eat?" value={f.what ?? ''} onChangeText={set('what')} placeholder="Apple slices, crackers" />
          <View style={{ gap: 8 }}>
            <Text style={st.q}>How much?</Text>
            <BoxChoice options={opts(['none', 'some', 'most', 'all'])} value={f.amount} onChange={set('amount')} />
          </View>
          {photo ? (
            <Image source={{ uri: photo.uri }} style={{ height: 160, borderRadius: 18 }} contentFit="cover" />
          ) : (
            <Pressable accessibilityRole="button" onPress={() => pick(true)} style={st.addPhoto}>
              <Icon name="camera" size={22} />
              <Text style={st.addPhotoText}>Add a photo</Text>
            </Pressable>
          )}
        </>
      )}

      {kind === 'nap' && (
        <>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <TimeWheel
              title="Fell asleep"
              value={f.started_at ?? ''}
              onChange={set('started_at')}
              style={st.timeBox}
              fallback={
                <View style={st.timeBox}>
                  <Text style={st.timeLabel}>Fell asleep</Text>
                  <TextInput value={f.started_at ?? ''} onChangeText={set('started_at')} style={st.timeValue} />
                </View>
              }>
              <Text style={st.timeLabel}>Fell asleep</Text>
              <Text style={st.timeValue}>{f.started_at ?? ''}</Text>
            </TimeWheel>
            {!asleep && (
              <TimeWheel
                title="Woke up"
                value={f.ended_at ?? ''}
                onChange={set('ended_at')}
                style={st.timeBox}
                fallback={
                  <View style={st.timeBox}>
                    <Text style={st.timeLabel}>Woke up</Text>
                    <TextInput value={f.ended_at ?? ''} onChangeText={set('ended_at')} placeholder={timeOf(new Date())} placeholderTextColor={color.quiet} style={st.timeValue} />
                    {napLength(f.started_at, f.ended_at) ? <Text style={st.timeSub}>{napLength(f.started_at, f.ended_at)}</Text> : null}
                  </View>
                }>
                <Text style={st.timeLabel}>Woke up</Text>
                <Text style={[st.timeValue, !f.ended_at && { color: color.quiet }]}>{f.ended_at || timeOf(new Date())}</Text>
                {napLength(f.started_at, f.ended_at) ? <Text style={st.timeSub}>{napLength(f.started_at, f.ended_at)}</Text> : null}
              </TimeWheel>
            )}
          </View>
          {/* S45 switch: 50×30 track, 24 knob. */}
          <Pressable
            accessibilityRole="switch"
            accessibilityState={{ checked: asleep }}
            onPress={() => {
              setAsleep(!asleep);
              if (!asleep) set('ended_at')('');
            }}
            style={st.switchRow}>
            <View style={{ flexShrink: 1 }}>
              <Text style={st.switchTitle}>Still sleeping</Text>
              <Text style={st.switchSub}>Log the start now, the end later</Text>
            </View>
            <View style={[st.track, asleep && { backgroundColor: color.primary }]}>
              <View style={[st.knob, asleep ? { right: 3 } : { left: 3 }]} />
            </View>
          </Pressable>
          <View style={{ gap: 8 }}>
            <Text style={q}>How did it go?</Text>
            <BoxChoice options={opts(['easily', 'took a while', 'woke up upset'])} value={f.how} onChange={set('how')} />
          </View>
          <View style={{ gap: 6 }}>
            <Text style={q}>Note (optional)</Text>
            <TextInput value={f.note ?? ''} onChangeText={set('note')} multiline style={st.napNote} />
          </View>
        </>
      )}

      {kind === 'activity' && (
        <>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {['park', 'reading', 'drawing', 'homework', 'games', 'bath'].map((a) => <Chip key={a} label={a} on={f.what === a} onPress={() => set('what')(a)} />)}
          </View>
          <Field label="Or type it" value={f.what ?? ''} onChangeText={set('what')} />
          <Choice label="How long?" options={['15 min', '30 min', '1 h', 'longer']} value={f.duration} onChange={set('duration')} />
          <Field label="A line for the parents" value={f.note ?? ''} onChangeText={set('note')} multiline />
        </>
      )}

      {kind === 'diaper' && (
        <>
          {/* S48: shown as #1 / #2 / Both / Dry, stored as wet / dirty / both / dry. */}
          <Choice label="Diaper" options={['wet', 'dirty', 'both', 'dry']} labels={DIAPER_LABELS} value={f.diaper} onChange={set('diaper')} />
          <Choice label="Potty try" options={['not today', 'tried', 'success!']} value={f.potty} onChange={set('potty')} />
          <Field label="Anything unusual?" value={f.note ?? ''} onChangeText={set('note')} placeholder="Rash, etc." />
        </>
      )}

      {kind === 'note' && (
        <>
          <Choice label="What kind?" options={['good news', 'behavior', 'health', 'question']} value={f.category} onChange={set('category')} />
          <Field label="Note" value={f.text ?? ''} onChangeText={set('text')} multiline />
        </>
      )}

      {kind === 'photo' && (
        <>
          {photo ? (
            <Image source={{ uri: photo.uri }} style={{ height: 240, borderRadius: 18 }} contentFit="cover" />
          ) : (
            <View style={{ height: 200, borderRadius: 18, backgroundColor: color.primaryTint, alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="camera" size={40} tint={color.primaryStrong} />
            </View>
          )}
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Button label="Camera" icon="camera" kind="tonal" style={{ flex: 1 }} onPress={() => pick(true)} />
            <Button label="Library" icon="image" kind="tonal" style={{ flex: 1 }} onPress={() => pick(false)} />
          </View>
          <Field label="Caption" value={f.caption ?? ''} onChangeText={set('caption')} />
          <T variant="small">Only the parents see it. It isn’t saved to your camera roll.</T>
        </>
      )}

      <ErrorText>{err}</ErrorText>
    </Screen>
  );
}

const st = StyleSheet.create({
  q: { fontFamily: font.bodySemi, fontSize: 14, color: color.ink },
  // S5b plan line
  plan: { paddingVertical: 10, paddingHorizontal: 14, backgroundColor: color.primaryTint, borderRadius: 12 },
  planText: { fontFamily: font.body, fontSize: 14, lineHeight: 20, color: color.ink },
  planBold: { fontFamily: font.bodyBold, color: color.primaryStrong },
  kindTile: { flexGrow: 1, flexShrink: 1, flexBasis: 0, minWidth: 0, height: 92, borderRadius: 20, backgroundColor: color.primaryTint, alignItems: 'center', justifyContent: 'center', gap: 8 },
  kindText: { fontFamily: font.displayBold, fontSize: 16, color: color.primaryStrong },
  addPhoto: { height: 64, borderRadius: 999, borderWidth: 2, borderStyle: 'dashed', borderColor: '#C9D3DD', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  addPhotoText: { fontFamily: font.displayBold, fontSize: 15, color: color.primary },
  timeBox: { flexGrow: 1, flexShrink: 1, flexBasis: 0, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 12, borderWidth: 1, borderColor: color.lineStrong },
  timeLabel: { fontFamily: font.bodyBold, fontSize: 12, color: color.ink2 },
  timeValue: { fontFamily: font.display, fontSize: 20, color: color.ink, padding: 0 },
  timeSub: { fontFamily: font.body, fontSize: 12, color: color.ink2 },
  // S45 values
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 44 },
  switchTitle: { fontFamily: font.bodySemi, fontSize: 15, color: color.ink },
  switchSub: { fontFamily: font.body, fontSize: 12, color: color.ink2 },
  track: { width: 50, height: 30, borderRadius: 15, backgroundColor: color.lineStrong, flexShrink: 0 },
  knob: { position: 'absolute', top: 3, width: 24, height: 24, borderRadius: 12, backgroundColor: '#FFFFFF' },
  napNote: { minHeight: 50, paddingVertical: 12, paddingHorizontal: 14, borderRadius: 12, borderWidth: 1, borderColor: color.lineStrong, fontFamily: font.body, fontSize: 16, lineHeight: 22, color: color.ink, textAlignVertical: 'top' },
});
