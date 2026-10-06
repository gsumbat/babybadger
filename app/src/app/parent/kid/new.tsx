import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Button, Chip, ErrorText, Field, Icon, Label, Screen, T } from '@/components/ui';
import { ageInMonths, ageLabel, KID_COLORS, maskUSDate, parseUSDate, suggestedFoods } from '@/lib/kid-profile';
import { useSession } from '@/lib/session';
import { errorText, supabase } from '@/lib/supabase';
import { cardShadow, color, font, radius } from '@/theme';

// Wireframes P18 (who) and P19 (keeping them safe). Routine (P20) and sitter access (P21) come with house rules.
export default function NewKid() {
  const { family } = useSession();
  const [step, setStep] = useState<1 | 2>(1);

  const [name, setName] = useState('');
  const [tint, setTint] = useState<string>(KID_COLORS[0]);
  const [birthday, setBirthday] = useState('');
  const [callsYou, setCallsYou] = useState('');

  const [foods, setFoods] = useState<string[]>([]);
  const [custom, setCustom] = useState<string[]>([]);
  const [adding, setAdding] = useState(false);
  const [newFood, setNewFood] = useState('');
  const [allergies, setAllergies] = useState('');
  const [health, setHealth] = useState('');
  const [pediatrician, setPediatrician] = useState('');
  const [comfort, setComfort] = useState('');

  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const first = name.trim();
  const iso = parseUSDate(birthday);
  const dateTyped = birthday.length === 10;
  const months = iso ? ageInMonths(iso) : null;
  const kid = first || 'your child';
  const options = [...suggestedFoods(months), ...custom];

  const toggleFood = (f: string) => setFoods((cur) => (cur.includes(f) ? cur.filter((x) => x !== f) : [...cur, f]));
  function addFood() {
    const f = newFood.trim();
    if (f && !options.some((o) => o.toLowerCase() === f.toLowerCase())) setCustom((c) => [...c, f]);
    if (f) setFoods((cur) => (cur.includes(f) ? cur : [...cur, f]));
    setNewFood('');
    setAdding(false);
  }

  async function save() {
    setBusy(true);
    setErr('');
    const { error } = await supabase.from('kids').insert({
      family_id: family!.id,
      name: first,
      birthdate: iso,
      color: tint,
      calls_you: callsYou.trim(),
      avoid_foods: foods.join(', '),
      allergies: allergies.trim(),
      health_notes: health.trim(),
      pediatrician: pediatrician.trim(),
      comfort_item: comfort.trim(),
      notes: '',
    });
    setBusy(false);
    if (error) return setErr(errorText(error));
    router.back();
  }

  const cancel = () => router.back();

  if (step === 1)
    return (
      <Screen
        step={{ label: 'Add a child', n: 1, total: 2, onCancel: cancel }}
        title="Who is joining the family?"
        footer={<Button label="Continue" onPress={() => setStep(2)} disabled={!first || (dateTyped && !iso) || (birthday.length > 0 && !dateTyped)} />}>
        <View style={st.avatarRow}>
          <View style={[st.avatar, { backgroundColor: tint }]}>
            <Text style={[st.avatarText, tint !== KID_COLORS[0] && { color: '#FFFFFF' }]}>{(first[0] || '?').toUpperCase()}</Text>
          </View>
          <View style={{ gap: 10, flex: 1 }}>
            <Text style={st.colorHint}>Color for {kid}</Text>
            <View style={{ flexDirection: 'row', gap: 6 }}>
              {KID_COLORS.map((c) => (
                <Pressable key={c} accessibilityRole="radio" accessibilityState={{ selected: c === tint }} accessibilityLabel={`Color ${c}`} onPress={() => setTint(c)} style={[st.swatchRing, c === tint && { borderColor: color.primaryStrong }]}>
                  <View style={[st.swatch, { backgroundColor: c }]} />
                </Pressable>
              ))}
            </View>
          </View>
        </View>

        <Field label="First name" value={name} onChangeText={setName} placeholder="Mia" autoCapitalize="words" autoFocus />

        <View style={{ flexDirection: 'row', gap: 12 }}>
          <View style={{ flex: 1 }}>
            <Field label="Birthday" value={birthday} onChangeText={(t) => setBirthday(maskUSDate(t))} placeholder="MM/DD/YYYY" keyboardType="number-pad" maxLength={10} />
          </View>
          <View style={{ flex: 1, gap: 6 }}>
            <Text style={st.fieldLabel}>Age</Text>
            <View style={st.ageBox}>
              <Text style={st.ageText}>{iso ? ageLabel(iso) : '—'}</Text>
            </View>
          </View>
        </View>
        {dateTyped && !iso ? <ErrorText>That date doesn’t look right. Use month/day/year, like 09/14/2025.</ErrorText> : <T variant="small">Optional. We use it to suggest foods to avoid and care for this age.</T>}

        <Field label={`What does ${first || 'your child'} call you? (optional)`} value={callsYou} onChangeText={setCallsYou} placeholder="Mama, Dada" />
      </Screen>
    );

  return (
    <Screen
      step={{ label: 'Add a child', n: 2, total: 2, onCancel: cancel }}
      onBack={() => setStep(1)}
      title={`Keeping ${kid} safe`}
      subtitle="Sitters see this on every shift. Red items show at the top."
      footer={<Button label={`Add ${first}`} onPress={save} busy={busy} />}>
      <Label>Food to avoid</Label>
      <View style={st.chips}>
        {options.map((f) => (
          <Chip key={f} label={f} on={foods.includes(f)} onPress={() => toggleFood(f)} />
        ))}
        {!adding && (
          <Pressable accessibilityRole="button" onPress={() => setAdding(true)} style={st.addChip}>
            <Icon name="plus" size={14} tint={color.ink} />
            <Text style={st.addChipText}>Add</Text>
          </Pressable>
        )}
      </View>
      {adding && (
        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
          <TextInput value={newFood} onChangeText={setNewFood} placeholder="Another food" placeholderTextColor={color.quiet} autoFocus onSubmitEditing={addFood} returnKeyType="done" style={[st.inlineInput, { flex: 1 }]} />
          <Button label="Add" kind="tonal" style={{ height: 50 }} onPress={addFood} />
        </View>
      )}
      {months !== null ? <T variant="small">Suggestions are for age {ageLabel(iso)}. Tap to add.</T> : null}

      <Field label="Allergies" value={allergies} onChangeText={setAllergies} placeholder="Allergies, if any" />
      <Field label="Medicine and health notes" value={health} onChangeText={setHealth} placeholder="What a sitter should know, and what to do" multiline />

      <View style={st.card}>
        <View style={[st.cardRow, st.cardLine]}>
          <Text style={st.cardLabel}>Pediatrician</Text>
          <TextInput value={pediatrician} onChangeText={setPediatrician} placeholder="Name and phone" placeholderTextColor={color.quiet} style={st.cardInput} />
        </View>
        <View style={st.cardRow}>
          <Text style={st.cardLabel}>Comfort item</Text>
          <TextInput value={comfort} onChangeText={setComfort} placeholder="Blue bunny" placeholderTextColor={color.quiet} style={st.cardInput} />
        </View>
      </View>
      <ErrorText>{err}</ErrorText>
    </Screen>
  );
}

const st = StyleSheet.create({
  avatarRow: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 4 },
  // P18 values
  avatar: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderStyle: 'dashed', borderColor: '#D5DCE4' },
  colorHint: { fontFamily: font.bodySemi, fontSize: 15, color: color.ink2 },
  avatarText: { fontFamily: font.display, fontSize: 32, color: color.ink },
  swatchRing: { width: 38, height: 38, borderRadius: 19, borderWidth: 2, borderColor: 'transparent', alignItems: 'center', justifyContent: 'center' },
  swatch: { width: 32, height: 32, borderRadius: 16 },
  fieldLabel: { fontFamily: font.bodyBold, fontSize: 13, color: color.ink2 },
  ageBox: { minHeight: 50, borderRadius: radius.field, backgroundColor: color.muted, justifyContent: 'center', paddingHorizontal: 14 },
  ageText: { fontFamily: font.bodyBold, fontSize: 16, color: color.ink },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  addChip: { minHeight: 36, paddingHorizontal: 12, borderRadius: radius.pill, flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: color.line },
  addChipText: { fontFamily: font.bodySemi, fontSize: 14, color: color.ink },
  inlineInput: { minHeight: 50, borderWidth: 1, borderColor: color.lineStrong, borderRadius: radius.field, backgroundColor: '#FFFFFF', paddingHorizontal: 14, fontFamily: font.body, fontSize: 16, color: color.ink },
  card: { backgroundColor: color.surface, borderRadius: radius.card, paddingHorizontal: 16, ...cardShadow },
  cardRow: { flexDirection: 'row', alignItems: 'center', minHeight: 54, gap: 12 },
  cardLine: { borderBottomWidth: 1, borderBottomColor: color.divider },
  cardLabel: { fontFamily: font.body, fontSize: 15, color: color.ink },
  cardInput: { flex: 1, textAlign: 'right', fontFamily: font.body, fontSize: 15, color: color.ink2, minHeight: 44 },
});
