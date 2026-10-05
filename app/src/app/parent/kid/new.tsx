import { router } from 'expo-router';
import { useState } from 'react';

import { Button, ErrorText, Field, Screen } from '@/components/ui';
import { useSession } from '@/lib/session';
import { errorText, supabase } from '@/lib/supabase';

export default function NewKid() {
  const { family } = useSession();
  const [name, setName] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [avoid, setAvoid] = useState('');
  const [notes, setNotes] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const validDate = !birthdate || /^\d{4}-\d{2}-\d{2}$/.test(birthdate);

  async function save() {
    setBusy(true);
    setErr('');
    const { error } = await supabase.from('kids').insert({ family_id: family!.id, name: name.trim(), birthdate: birthdate || null, avoid_foods: avoid.trim(), notes: notes.trim() });
    setBusy(false);
    if (error) return setErr(errorText(error));
    router.back();
  }

  return (
    <Screen title="Add a child" back footer={<Button label="Save" onPress={save} busy={busy} disabled={name.trim().length < 1 || !validDate} />}>
      <Field label="Name" value={name} onChangeText={setName} placeholder="Ava" />
      <Field label="Birthday" value={birthdate} onChangeText={setBirthdate} placeholder="YYYY-MM-DD" hint={validDate ? 'Optional. Used for age-based suggestions.' : 'Use the format 2019-04-21'} />
      <Field label="Foods to avoid" value={avoid} onChangeText={setAvoid} placeholder="Peanuts, shellfish" hint="Shown to the sitter on every shift." />
      <Field label="Notes for the sitter" value={notes} onChangeText={setNotes} placeholder="What calms her, bedtime routine…" multiline />
      <ErrorText>{err}</ErrorText>
    </Screen>
  );
}
