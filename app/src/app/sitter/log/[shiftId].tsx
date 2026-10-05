import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { Button, Chip, ErrorText, Field, Icon, Label, Screen, T } from '@/components/ui';
import { useShiftLive } from '@/lib/data';
import { timeOf } from '@/lib/format';
import { useSession } from '@/lib/session';
import { errorText, supabase } from '@/lib/supabase';
import type { LogKind } from '@/lib/types';
import { color } from '@/theme';

const TITLES: Record<LogKind, string> = { food: 'Log food', nap: 'Log a nap', activity: 'Log an activity', diaper: 'Diaper or potty', note: 'Add a note', photo: 'Photo update' };

function Choice({ label, options, value, onChange }: { label: string; options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <View style={{ gap: 8 }}>
      <Label>{label}</Label>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {options.map((o) => <Chip key={o} label={o} on={value === o} onPress={() => onChange(o)} />)}
      </View>
    </View>
  );
}

export default function AddLog() {
  const { shiftId, kind: k } = useLocalSearchParams<{ shiftId: string; kind: LogKind }>();
  const kind = (k ?? 'note') as LogKind;
  const { session } = useSession();
  const { bundle } = useShiftLive(shiftId);
  const kids = bundle?.kids ?? [];

  const [who, setWho] = useState<string[]>([]);
  const [f, setF] = useState<Record<string, string>>({
    meal: 'snack', amount: 'all', how: 'easily', duration: '30 min', diaper: 'wet', potty: '', category: 'good news',
    started_at: timeOf(new Date()),
  });
  const [urgent, setUrgent] = useState(false);
  const [photo, setPhoto] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const set = (key: string) => (v: string) => setF((x) => ({ ...x, [key]: v }));

  const allKids = kids.map((x) => x.id);
  const chosen = who.length ? who : allKids;

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
      if (photo) {
        photo_path = `${shiftId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`;
        const body = await (await fetch(photo.uri)).arrayBuffer();
        const up = await supabase.storage.from('shift-photos').upload(photo_path, body, { contentType: 'image/jpeg' });
        if (up.error) throw up.error;
      }
      const data: Record<string, string> = {};
      const keep = {
        food: ['meal', 'what', 'amount'],
        nap: ['started_at', 'ended_at', 'how', 'note'],
        activity: ['what', 'duration', 'note'],
        diaper: ['diaper', 'potty', 'note'],
        note: ['category', 'text'],
        photo: ['caption'],
      }[kind];
      for (const key of keep) if (f[key]) data[key] = f[key];
      const { error } = await supabase.from('logs').insert({ shift_id: shiftId, author_id: session!.user.id, kind, kid_ids: chosen, data, photo_path, urgent });
      if (error) throw error;
      router.back();
    } catch (e) {
      setErr(errorText(e));
    } finally {
      setBusy(false);
    }
  }

  const valid =
    (kind === 'food' && !!f.what?.trim()) ||
    kind === 'nap' ||
    (kind === 'activity' && !!f.what?.trim()) ||
    kind === 'diaper' ||
    (kind === 'note' && !!f.text?.trim()) ||
    (kind === 'photo' && !!photo);

  return (
    <Screen title={TITLES[kind]} back footer={<Button label={kind === 'photo' ? 'Send to the parents' : 'Save and notify parents'} onPress={save} busy={busy} disabled={!valid} />}>
      {kids.length > 1 && (
        <View style={{ gap: 8 }}>
          <Label>Who</Label>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {kids.map((kid) => (
              <Chip key={kid.id} label={kid.name} on={chosen.includes(kid.id)} onPress={() => setWho((ids) => { const base = ids.length ? ids : allKids; return base.includes(kid.id) ? base.filter((x) => x !== kid.id) : [...base, kid.id]; })} />
            ))}
          </View>
        </View>
      )}

      {kind === 'food' && (
        <>
          <Choice label="Meal" options={['snack', 'breakfast', 'lunch', 'dinner']} value={f.meal} onChange={set('meal')} />
          <Field label="What did they eat?" value={f.what ?? ''} onChangeText={set('what')} placeholder="Apple slices, crackers" />
          <Choice label="How much?" options={['none', 'some', 'most', 'all']} value={f.amount} onChange={set('amount')} />
        </>
      )}

      {kind === 'nap' && (
        <>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ flex: 1 }}><Field label="Fell asleep" value={f.started_at ?? ''} onChangeText={set('started_at')} /></View>
            <View style={{ flex: 1 }}><Field label="Woke up" value={f.ended_at ?? ''} onChangeText={set('ended_at')} placeholder="Still sleeping" /></View>
          </View>
          <Choice label="How did it go?" options={['easily', 'took a while', 'woke up upset']} value={f.how} onChange={set('how')} />
          <Field label="Note (optional)" value={f.note ?? ''} onChangeText={set('note')} />
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
          <Choice label="Diaper" options={['wet', 'dirty', 'both', 'dry']} value={f.diaper} onChange={set('diaper')} />
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

      <Pressable accessibilityRole="switch" accessibilityState={{ checked: urgent }} onPress={() => setUrgent((u) => !u)} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6 }}>
        <Icon name={urgent ? 'check-square' : 'square'} tint={urgent ? color.primary : color.lineStrong} size={22} />
        <View style={{ flex: 1 }}>
          <T variant="strong">Needs the parents’ attention</T>
          <T variant="small">Highlights it in their log</T>
        </View>
      </Pressable>
      <ErrorText>{err}</ErrorText>
    </Screen>
  );
}
