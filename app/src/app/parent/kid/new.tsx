import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ChildAdded, ChildSitters, type AddedSummary } from '@/components/addChild';
import { Button, ErrorText, Field, Icon, Loading, Screen } from '@/components/ui';
import { api, useQuery } from '@/lib/data';
import { setupApi } from '@/lib/family-setup';
import { ageInMonths, ageLabel, isoToUS, KID_COLORS, maskUSDate, parseUSDate, suggestedFoods } from '@/lib/kid-profile';
import { useSession } from '@/lib/session';
import { errorText, supabase } from '@/lib/supabase';
import { cardShadow, color, font, radius, SECTION_GAP } from '@/theme';
import { Text, TextInput } from '@/components/Text';

// Wireframes P18 (who), P19 (keeping them safe), P21 (who looks after them) and P22 (all set). P19 saves the child;
// P21 then sets which sitters see them (it's skipped when the family has no sitters yet) and P22 sums up. The
// wireframes count P20 Routine as step 3 of 4; the routine isn't part of this flow (it opens from P55 / P7), so the
// counter reads "n of 3" (or "n of 2" without sitters).
// With ?id=<kid> the same two screens edit that child (opened from P55: Edit -> step 1, Care and safety -> step 2).
export default function NewKid() {
  const { family } = useSession();
  const params = useLocalSearchParams<{ id?: string; step?: string }>();
  const editId = params.id;
  const startStep: 1 | 2 = params.step === '2' ? 2 : 1;
  const [step, setStep] = useState<1 | 2 | 3 | 'done'>(startStep);
  const [loaded, setLoaded] = useState(!editId);
  // The new child's id once P19 saved it (going back from P21 and on again updates the same row).
  const [savedId, setSavedId] = useState<string | null>(null);
  const [summary, setSummary] = useState<AddedSummary | null>(null);
  // Sitters decide whether P21 is a step at all. Before migration 11 runs there are no kid lists; P21 still shows.
  const { data: sitters } = useQuery(() => (editId ? Promise.resolve([]) : setupApi.sitters(family!.id).catch(() => [])), [family!.id, editId]);
  const hasSitters = !!sitters?.length;
  const total = hasSitters ? 3 : 2;

  const [name, setName] = useState('');
  const [tint, setTint] = useState<string>(KID_COLORS[0]);
  // Until the parent taps a color, it follows the gender: pink for a girl, blue for a boy.
  const [tintPicked, setTintPicked] = useState(false);
  const [birthday, setBirthday] = useState('');
  const [callsYou, setCallsYou] = useState('');
  const [gender, setGender] = useState<'girl' | 'boy' | null>(null);

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

  // Edit mode: load the child and fill every field.
  useEffect(() => {
    if (!editId) return;
    let live = true;
    api
      .kid(editId)
      .then((k) => {
        if (!live) return;
        const saved = k.avoid_foods ? k.avoid_foods.split(',').map((f) => f.trim()).filter(Boolean) : [];
        const suggested = suggestedFoods(k.birthdate ? ageInMonths(k.birthdate) : null);
        setName(k.name);
        setTint(k.color || KID_COLORS[0]);
        setTintPicked(!!k.color);
        setBirthday(isoToUS(k.birthdate));
        setCallsYou(k.calls_you ?? '');
        setGender(k.gender ?? null);
        setFoods(saved);
        setCustom(saved.filter((f) => !suggested.includes(f)));
        setAllergies(k.allergies ?? '');
        setHealth(k.health_notes ?? '');
        setPediatrician(k.pediatrician ?? '');
        setComfort(k.comfort_item ?? '');
        setLoaded(true);
      })
      .catch((e: unknown) => {
        if (!live) return;
        setErr(e instanceof Error ? e.message : String(e));
        setLoaded(true);
      });
    return () => {
      live = false;
    };
  }, [editId]);

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
    const fields = {
      name: first,
      birthdate: iso,
      color: tint,
      calls_you: callsYou.trim(),
      gender,
      avoid_foods: foods.join(', '),
      allergies: allergies.trim(),
      health_notes: health.trim(),
      pediatrician: pediatrician.trim(),
      comfort_item: comfort.trim(),
    };
    if (editId) {
      const { error } = await supabase.from('kids').update(fields).eq('id', editId);
      setBusy(false);
      if (error) return setErr(errorText(error));
      return router.back();
    }
    const { data: row, error } = savedId
      ? await supabase.from('kids').update(fields).eq('id', savedId).select('id').single()
      : await supabase.from('kids').insert({ ...fields, family_id: family!.id, notes: '' }).select('id').single();
    setBusy(false);
    if (error) return setErr(errorText(error));
    const id = (row as { id: string }).id;
    setSavedId(id);
    if (hasSitters) setStep(3);
    else {
      setSummary({ kidId: id, told: [], sees: [], shifts: 0 });
      setStep('done');
    }
  }

  const cancel = () => router.back();
  if (!loaded) return <Loading />;

  // P18/P19 header: back, "Add a child · n of 2", Cancel, progress bar. The title sits in the content, as in the
  // wireframes; the extra 4 px of bottom padding makes up the wireframe's 8 px content top (Screen's is 4).
  // Edit mode (P18e / P19e): back + title, no step counter or progress; each screen saves on its own.
  const editHeader = (title: string) => (
    <View style={st.editHeader}>
      <Pressable accessibilityRole="button" accessibilityLabel="Back" onPress={cancel} style={st.back}>
        <Icon name="chevron-left" size={22} tint={color.ink} strokeWidth={2} />
      </Pressable>
      <Text style={st.editTitle} numberOfLines={1}>
        {title}
      </Text>
    </View>
  );

  const header = (n: 1 | 2 | 3) => (
    <View style={st.header}>
      <View style={st.backRow}>
        <Pressable accessibilityRole="button" accessibilityLabel="Back" onPress={n === 1 || startStep === 2 ? cancel : () => setStep(n === 3 ? 2 : 1)} style={st.back}>
          <Icon name="chevron-left" size={22} tint={color.ink} strokeWidth={2} />
        </Pressable>
        <Text style={st.stepText} numberOfLines={1}>
          Add a child · {n} of {total}
        </Text>
        <Pressable accessibilityRole="button" onPress={cancel} hitSlop={10}>
          <Text style={st.cancel}>Cancel</Text>
        </Pressable>
      </View>
      <View style={st.progress}>
        <View style={[st.progressFill, { width: `${(n / total) * 100}%` }]} />
      </View>
    </View>
  );

  // P22: the child is in; Done closes the flow (P13 Kids and devices isn't built).
  if (step === 'done' && summary) return <ChildAdded name={first} summary={summary} />;

  // P21: which sitters see the new child, tell them, add them to booked shifts.
  if (step === 3 && savedId)
    return (
      <ChildSitters
        header={header(3)}
        kidId={savedId}
        name={first}
        sitters={sitters ?? []}
        onDone={(s) => {
          setSummary(s);
          setStep('done');
        }}
      />
    );

  if (step === 1)
    return (
      <Screen
        header={editId ? editHeader(`Edit ${first || 'child'}`) : header(1)}
        gap={14}
        footer={
          editId ? (
            <Button label="Save" onPress={save} busy={busy} disabled={!first || (dateTyped && !iso) || (birthday.length > 0 && !dateTyped)} />
          ) : (
            <Button label="Continue" onPress={() => setStep(2)} disabled={!first || (dateTyped && !iso) || (birthday.length > 0 && !dateTyped)} />
          )
        }>
        {editId ? null : <Text style={st.title18}>Who is joining the family?</Text>}
        <View style={st.avatarRow}>
          <View style={[st.avatar, { backgroundColor: tint }]}>
            <Text style={[st.avatarText, tint !== KID_COLORS[0] && { color: '#FFFFFF' }]}>{(first[0] || '?').toUpperCase()}</Text>
          </View>
          <View style={{ flexShrink: 1 }}>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              {KID_COLORS.map((c) => (
                <Pressable key={c} accessibilityRole="radio" accessibilityState={{ selected: c === tint }} accessibilityLabel={`Color ${c}`} onPress={() => {
                  setTint(c);
                  setTintPicked(true);
                }} style={[st.swatchRing, c === tint && { borderColor: color.primaryStrong }]}>
                  <View style={[st.swatch, { backgroundColor: c }]} />
                </Pressable>
              ))}
            </View>
          </View>
        </View>

        <Field label="First name" value={name} onChangeText={setName} placeholder="Mia" autoCapitalize="words" autoFocus style={st.input18} />

        {/* P18 Gender (optional): tap the chosen one again to clear it. */}
        <View style={{ gap: 6 }}>
          <Text style={st.fieldLabel}>Gender (optional)</Text>
          <View accessibilityRole="radiogroup" style={st.genderSeg}>
            {(['girl', 'boy'] as const).map((g) => {
              const on = gender === g;
              return (
                <Pressable key={g} accessibilityRole="radio" accessibilityState={{ checked: on }} onPress={() => {
                    const next = on ? null : g;
                    setGender(next);
                    if (!tintPicked) setTint(next === 'boy' ? KID_COLORS[1] : KID_COLORS[0]);
                  }} style={[st.genderItem, on && { backgroundColor: '#FFFFFF' }]}>
                  <Text style={[st.genderText, on && { fontFamily: font.bodyBold, color: color.ink }]}>{g === 'girl' ? 'Girl' : 'Boy'}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={{ flexDirection: 'row', gap: 10 }}>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Field label="Birthday" value={birthday} onChangeText={(t) => setBirthday(maskUSDate(t))} placeholder="MM/DD/YYYY" keyboardType="number-pad" maxLength={10} style={st.input18} />
          </View>
          <View style={{ flex: 1, minWidth: 0, gap: 6 }}>
            <Text style={st.fieldLabel}>Age</Text>
            <View style={st.ageBox}>
              <Text style={st.ageText}>{iso ? ageLabel(iso) : '—'}</Text>
            </View>
          </View>
        </View>
        {dateTyped && !iso ? <ErrorText>That date doesn’t look right. Use month/day/year, like 09/14/2025.</ErrorText> : null}

        <Field label={`What does ${first || 'your child'} call you? (optional)`} value={callsYou} onChangeText={setCallsYou} placeholder="Mama, Dada" style={st.input18} />
      </Screen>
    );

  return (
    <Screen header={editId ? editHeader(`Keeping ${kid} safe`) : header(2)} footer={<Button label={editId ? 'Save' : hasSitters ? 'Continue' : `Add ${first}`} onPress={save} busy={busy} disabled={!first} />}>
      <View style={{ gap: 4 }}>
        {editId ? null : <Text style={st.title19}>Keeping {kid} safe</Text>}
        <Text style={st.lead}>Sitters see this on every shift. Red items show at the top.</Text>
      </View>
      <Text style={[st.section, { marginTop: SECTION_GAP }]}>FOOD TO AVOID</Text>
      <View style={st.chips}>
        {options.map((f) => {
          const on = foods.includes(f);
          return (
            <Pressable key={f} accessibilityRole="button" accessibilityState={{ selected: on }} onPress={() => toggleFood(f)} style={[st.chip, on ? st.chipOn : st.chipOff]}>
              <Text style={[st.chipText, on && { color: color.badInk }]}>{on ? `✓ ${f}` : f}</Text>
            </Pressable>
          );
        })}
        {!adding && (
          <Pressable accessibilityRole="button" onPress={() => setAdding(true)} style={[st.chip, st.chipOff]}>
            <Text style={st.chipText}>+ Add</Text>
          </Pressable>
        )}
      </View>
      {adding && (
        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
          <TextInput value={newFood} onChangeText={setNewFood} placeholder="Another food" placeholderTextColor={color.quiet} autoFocus onSubmitEditing={addFood} returnKeyType="done" style={[st.inlineInput, { flex: 1 }]} />
          <Button label="Add" kind="tonal" style={{ height: 50 }} onPress={addFood} />
        </View>
      )}

      <Field label="Allergies" value={allergies} onChangeText={setAllergies} placeholder="Allergies, if any" style={st.input19} />
      <Field label="Medicine and health notes" value={health} onChangeText={setHealth} placeholder="What a sitter should know, and what to do" multiline style={st.input19} />

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
  // P18 Gender segmented control: 4px track, 40 high choices, white when chosen.
  genderSeg: { flexDirection: 'row', gap: 4, padding: 4, borderRadius: 12, backgroundColor: color.muted },
  genderItem: { flex: 1, height: 40, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  genderText: { fontFamily: font.bodyMedium, fontSize: 15, color: color.ink2 },
  // P18e / P19e header: same as P3b / P55 (16 / 20 / 8; Screen's content adds 4, so 4 here).
  editHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingTop: 16, paddingHorizontal: 20, paddingBottom: 4 },
  editTitle: { fontFamily: font.display, fontSize: 22, color: color.ink, marginVertical: -4.62, flexGrow: 1, flexShrink: 1 },
  // P18/P19 header
  header: { paddingTop: 16, paddingHorizontal: 20, paddingBottom: 12, gap: 14 },
  backRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  back: { width: 44, height: 44, borderRadius: 22, borderWidth: 1, borderColor: color.line, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  stepText: { flexGrow: 1, flexShrink: 1, fontFamily: font.bodySemi, fontSize: 14, color: color.ink2 },
  cancel: { fontFamily: font.bodySemi, fontSize: 14, color: color.primary, textDecorationLine: 'underline' },
  progress: { height: 6, borderRadius: 3, backgroundColor: '#DDE3EA', overflow: 'hidden' },
  progressFill: { height: 6, backgroundColor: color.primary },
  // P18 values
  title18: { fontFamily: font.display, fontSize: 26, lineHeight: 32, color: color.ink },
  avatarRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  avatar: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderStyle: 'dashed', borderColor: '#D5DCE4' },
  avatarText: { fontFamily: font.display, fontSize: 32, color: color.ink },
  // The ring hangs 3 px outside each 32 px swatch so the swatches keep P18's 10 px spacing.
  swatchRing: { width: 38, height: 38, margin: -3, borderRadius: 19, borderWidth: 2, borderColor: 'transparent', alignItems: 'center', justifyContent: 'center' },
  swatch: { width: 32, height: 32, borderRadius: 16 },
  // P18 inputs: 48 high, no fill.
  input18: { minHeight: 48, height: 48, backgroundColor: 'transparent' },
  fieldLabel: { fontFamily: font.bodySemi, fontSize: 14, color: color.ink },
  ageBox: { height: 48, borderRadius: 8, backgroundColor: color.muted, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14 },
  ageText: { fontFamily: font.displayBold, fontSize: 18, color: color.ink },
  // P19 values
  title19: { fontFamily: font.display, fontSize: 26, color: color.ink, marginVertical: -4.83 },
  lead: { fontFamily: font.body, fontSize: 15, lineHeight: 22, color: color.ink2 },
  section: { fontFamily: font.bodyBold, fontSize: 13, letterSpacing: 0.6, color: color.ink2 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { height: 40, paddingHorizontal: 14, borderRadius: radius.pill, flexDirection: 'row', alignItems: 'center' },
  // Chosen foods read as danger (P19): the red of the food-to-avoid card.
  chipOn: { backgroundColor: color.badTint, borderWidth: 1.5, borderColor: color.bad },
  chipOff: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: color.line },
  chipText: { fontFamily: font.bodySemi, fontSize: 14, color: color.ink },
  // P19 inputs: 12 px vertical padding, 15/21 text (one line = 45 high).
  input19: { minHeight: 45, paddingVertical: 12, fontSize: 15, lineHeight: 21 },
  inlineInput: { minHeight: 50, borderWidth: 1, borderColor: color.lineStrong, borderRadius: radius.field, backgroundColor: '#FFFFFF', paddingHorizontal: 14, fontFamily: font.body, fontSize: 16, color: color.ink },
  card: { backgroundColor: color.surface, borderRadius: radius.card, paddingHorizontal: 16, ...cardShadow },
  cardRow: { flexDirection: 'row', alignItems: 'center', minHeight: 50, gap: 12 },
  cardLine: { borderBottomWidth: 1, borderBottomColor: color.divider },
  cardLabel: { fontFamily: font.body, fontSize: 15, color: color.ink },
  cardInput: { flex: 1, textAlign: 'right', fontFamily: font.body, fontSize: 15, color: color.ink2, minHeight: 44 },
});
