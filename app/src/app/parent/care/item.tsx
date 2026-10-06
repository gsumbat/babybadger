import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Platform, Pressable, StyleSheet, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { careIconXml } from '@/components/care';
import { ErrorText, Loading, Screen, Segmented } from '@/components/ui';
import { api } from '@/lib/data';
import { BOTTLE_UNITS, CARE_TYPES, cleanDetails, DAY_LETTERS, EVERY_DAY, formatTime, hasDay, isCareType, itemTitle, MILKS, parseAmount, parseTime, repeatChoices, repeatLabel, toggleDay, typeLabel } from '@/lib/care-plan';
import { useSession } from '@/lib/session';
import type { BottleUnit, CareType, Milk } from '@/lib/types';
import { color, font } from '@/theme';
import { Text, TextInput } from '@/components/Text';
import { SelectField } from '@/components/SelectField';
import { TimeField } from '@/components/TimeField';

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const NAMED: CareType[] = ['activity', 'other'];
// Meal items are named by which meal, picked like the sitter's Log food sheet (S5) but in day order (P20d).
const MEALS = ['Breakfast', 'Lunch', 'Snack', 'Dinner'];
// "How often" segment labels (P20 shows the result as "Every 3 hrs").
const OFTEN: Record<string, string> = { '': 'Once', '120': 'Every 2 h', '180': 'Every 3 h', '240': 'Every 4 h', '360': 'Every 6 h', '480': 'Every 8 h' };
// Diaper items (P20f): plain diaper checks, or potty breaks for a kid in potty training.
const POTTY = [
  { value: 'diapers', label: 'Diapers' },
  { value: 'potty', label: 'Potty training' },
];
const parseEvery = (v: string | undefined) => {
  const n = Number(v);
  return Number.isInteger(n) && n >= 30 && n <= 720 ? n : null;
};

// Wireframe P20a Routine item, from app/src/wireframes/P20a.tsx. Opened from P20 (a kid's day, ?kidId=) and P7
// (whole-family task). ?id= edits; ?type=, ?title= and ?every= prefill (P20's suggestions). Left out until built: the
// "Remind the sitter" and "Sitter logs it" switches. Not in the wireframe: the Name field for Activity / Other
// (P7's rows have names like "Pick up Ava") and "Ends" as the second time label for types other than Bedtime.
// "How often" (Once / Every 2-4 h) makes P20's "Every 3 hrs" repeats; with a repeat the second time reads "Until".
// Each type shows only what it needs: Bottle adds Amount + Unit (oz / ml) and Milk; Diaper (P20f) "Diapers or potty"; Medicine
// (P20g) "Which medicine" (the title) and Dose, with Once / Every 4-8 h; Meal, Nap, Bedtime, Activity and Other have
// no "How often" (saved as once).
export default function CareItemScreen() {
  const { family } = useSession();
  const params = useLocalSearchParams<{ id?: string; kidId?: string; type?: string; title?: string; every?: string }>();
  const editId = params.id;

  const [loaded, setLoaded] = useState(!editId);
  const [kidId, setKidId] = useState<string | null>(params.kidId || null);
  const [kidName, setKidName] = useState('');
  const [type, setType] = useState<CareType>(isCareType(params.type) ? params.type : 'other');
  const [title, setTitle] = useState(params.title ?? '');
  const [starts, setStarts] = useState('');
  const [ends, setEnds] = useState('');
  const [days, setDays] = useState(EVERY_DAY);
  const [every, setEvery] = useState<number | null>(parseEvery(params.every));
  // Whether the saved row has the column yet (migration 08); a one-off item then saves without it.
  const [hadEvery, setHadEvery] = useState(false);
  const [savedEvery, setSavedEvery] = useState<number | null>(null);
  // Per-type extras (details): typed amount and its unit, milk, potty, dose. Whether the saved row has any, to clear them.
  const [amount, setAmount] = useState('');
  const [unit, setUnit] = useState<BottleUnit>('oz');
  const [milk, setMilk] = useState<Milk | ''>('');
  const [potty, setPotty] = useState(false);
  const [dose, setDose] = useState('');
  const [hadDetails, setHadDetails] = useState(false);
  const [how, setHow] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  // Edit mode: load the item, and the kid's name for "Remove from Mia's day".
  useEffect(() => {
    if (!editId) return;
    let live = true;
    (async () => {
      try {
        const it = await api.careItem(editId);
        if (!live) return;
        setKidId(it.kid_id);
        setType(it.type);
        setTitle(it.title);
        setStarts(formatTime(it.starts));
        setEnds(formatTime(it.ends));
        setDays(it.days);
        setEvery(it.every_minutes ?? null);
        setHadEvery(it.every_minutes != null);
        setSavedEvery(it.every_minutes ?? null);
        const d = cleanDetails(it.type, it.details);
        setAmount(d.amount ? String(d.amount) : '');
        setUnit(d.unit ?? 'oz');
        setMilk(d.milk ?? '');
        setPotty(!!d.potty);
        setDose(d.dose ?? '');
        setHadDetails(Object.keys(it.details).length > 0);
        setHow(it.how);
        if (it.kid_id) {
          const k = await api.kid(it.kid_id);
          if (live) setKidName(k.name);
        }
      } catch (e) {
        if (live) setErr(e instanceof Error ? e.message : String(e));
      } finally {
        if (live) setLoaded(true);
      }
    })();
    return () => {
      live = false;
    };
  }, [editId]);

  const named = NAMED.includes(type);
  const startsAt = starts.trim() ? parseTime(starts) : null;
  const endsAt = ends.trim() ? parseTime(ends) : null;
  const badTime = (!!starts.trim() && !startsAt) || (!!ends.trim() && !endsAt);
  const bottleAmount = parseAmount(amount, unit);
  const choices = repeatChoices(type);
  const showOften = choices.length > 0;
  // Types without "How often" are saved as once.
  const everyMinutes = showOften ? every : null;

  function pickType(t: CareType) {
    if (t === type) return;
    // A name belongs to Activity / Other (kept between them), Meal (which meal) and Medicine (which medicine); other
    // types show the type name.
    if (t === 'meal') setTitle(MEALS.includes(title) ? title : '');
    else if (!(NAMED.includes(t) && NAMED.includes(type))) setTitle('');
    // An interval the new type doesn't offer resets to once, unless it's the item's saved one.
    if (every && !repeatChoices(t).includes(every) && every !== savedEvery) setEvery(null);
    setType(t);
  }

  async function save() {
    if (busy) return;
    if (badTime) return setErr('Type times like 3:00 PM or 15:00.');
    if (type === 'bottle' && bottleAmount === undefined) return setErr('Type the amount, like 4 or 120.');
    setBusy(true);
    setErr('');
    // Only the chosen type's extras are saved; the rest are dropped. A diaper item is named by its potty setting.
    const details = cleanDetails(type, { amount: bottleAmount ?? undefined, unit, milk: milk || undefined, potty, dose });
    const fields = { kid_id: kidId, type, title: type === 'diaper' ? '' : title.trim(), starts: startsAt, ends: endsAt, days, every_minutes: everyMinutes, details, how: how.trim() };
    try {
      if (editId) await api.updateCareItem(editId, fields, { every_minutes: hadEvery, details: hadDetails });
      else await api.createCareItem(family!.id, fields);
      router.back();
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
      setBusy(false);
    }
  }

  function remove() {
    if (!editId) return;
    const go = async () => {
      try {
        await api.deleteCareItem(editId);
        router.back();
      } catch (e) {
        setErr(e instanceof Error ? e.message : String(e));
      }
    };
    const question = `Remove ${itemTitle({ title, type, details: { potty } })}?`;
    if (Platform.OS === 'web') {
      if (globalThis.confirm?.(question)) go();
      return;
    }
    Alert.alert(question, undefined, [{ text: 'Keep it', style: 'cancel' }, { text: 'Remove', style: 'destructive', onPress: go }]);
  }

  if (!loaded) return <Loading />;
  // A saved interval that isn't one of the choices (90 min) stays as a fifth option so it isn't lost.
  const oftenValues = every && !choices.includes(every) ? [...choices, every] : choices;
  const oftenOptions = oftenValues.map((m) => ({ value: String(m ?? ''), label: OFTEN[String(m ?? '')] ?? repeatLabel(m) }));

  return (
    <Screen
      gap={12}
      header={
        <View style={st.head}>
          <Pressable accessibilityRole="button" onPress={() => router.back()} hitSlop={10} style={{ width: 60, flexShrink: 1 }}>
            <Text style={st.cancel}>Cancel</Text>
          </Pressable>
          <Text style={st.title} numberOfLines={1}>
            {typeLabel(type)}
          </Text>
          <Pressable accessibilityRole="button" onPress={save} disabled={busy} hitSlop={10} style={{ width: 60, flexShrink: 1 }}>
            <Text style={[st.save, busy && { opacity: 0.5 }]}>Save</Text>
          </Pressable>
        </View>
      }>
      <ErrorText>{err}</ErrorText>
      <Text style={st.label}>TYPE</Text>
      <View style={{ gap: 8 }}>
        {[CARE_TYPES.slice(0, 4), CARE_TYPES.slice(4)].map((row, r) => (
          <View key={r} style={{ flexDirection: 'row', gap: 8 }}>
            {row.map((t) => {
              const on = t.type === type;
              return (
                <Pressable key={t.type} accessibilityRole="radio" accessibilityState={{ selected: on }} onPress={() => pickType(t.type)} style={[st.type, on && st.typeOn]}>
                  <SvgXml xml={careIconXml(t.type, on ? color.primary : color.ink2)} width={22} height={22} style={{ flexShrink: 0 }} />
                  <Text style={[st.typeText, on && { color: color.primary }]}>{t.label}</Text>
                </Pressable>
              );
            })}
          </View>
        ))}
      </View>

      {type === 'meal' ? (
        <View style={{ gap: 6 }}>
          <Text style={st.fieldLabel}>Which meal</Text>
          <Segmented square options={MEALS.map((m) => ({ value: m, label: m }))} value={title} onChange={setTitle} />
        </View>
      ) : null}

      {named ? (
        <View style={{ gap: 6 }}>
          <Text style={st.fieldLabel}>Name</Text>
          <TextInput value={title} onChangeText={setTitle} placeholderTextColor={color.quiet} style={st.input} />
        </View>
      ) : null}

      {type === 'bottle' ? (
        <>
          {/* Amount and its unit on one row; the unit is a dropdown (oz by default). */}
          <View style={st.row}>
            <View style={st.half}>
              <Text style={st.fieldLabel}>Amount</Text>
              <TextInput value={amount} onChangeText={setAmount} keyboardType="decimal-pad" placeholder="4" placeholderTextColor={color.quiet} accessibilityLabel="Amount" style={st.input} />
            </View>
            <SelectField label="Unit" value={unit} options={BOTTLE_UNITS} onChange={setUnit} style={st.unitSelect} />
          </View>
          <View style={{ gap: 6 }}>
            <Text style={st.fieldLabel}>Milk</Text>
            <Segmented square options={MILKS} value={milk} onChange={setMilk} />
          </View>
        </>
      ) : null}

      {type === 'diaper' ? (
        <View style={{ gap: 6 }}>
          <Text style={st.fieldLabel}>Diapers or potty</Text>
          <Segmented square options={POTTY} value={potty ? 'potty' : 'diapers'} onChange={(v) => setPotty(v === 'potty')} />
          <Text style={st.hint}>The sitter logs #1 or #2 at each change.</Text>
        </View>
      ) : null}

      {type === 'medicine' ? (
        <>
          <View style={{ gap: 6 }}>
            <Text style={st.fieldLabel}>Which medicine</Text>
            <TextInput value={title} onChangeText={setTitle} placeholderTextColor={color.quiet} style={st.input} />
          </View>
          <View style={{ gap: 6 }}>
            <Text style={st.fieldLabel}>Dose</Text>
            <TextInput value={dose} onChangeText={setDose} placeholder="5 ml" placeholderTextColor={color.quiet} style={st.input} />
          </View>
        </>
      ) : null}

      <View style={{ flexDirection: 'row', gap: 10 }}>
        <TimeField label="Starts" value={starts} onChange={setStarts} placeholder="7:00 PM" />
        <TimeField label={everyMinutes ? 'Until' : type === 'bedtime' ? 'Lights out by' : 'Ends'} value={ends} onChange={setEnds} placeholder={everyMinutes ? 'End of shift' : '7:30 PM'} />
      </View>

      {showOften ? (
        <View style={{ gap: 6 }}>
          <Text style={st.fieldLabel}>How often</Text>
          <Segmented square options={oftenOptions} value={String(every ?? '')} onChange={(v) => setEvery(v ? Number(v) : null)} />
        </View>
      ) : null}

      <View style={{ gap: 6 }}>
        <Text style={st.fieldLabel}>Repeats</Text>
        <View style={{ flexDirection: 'row', gap: 6 }}>
          {DAY_LETTERS.map((d, i) => {
            const on = hasDay(days, i);
            return (
              <Pressable key={i} accessibilityRole="checkbox" accessibilityLabel={DAY_NAMES[i]} accessibilityState={{ checked: on }} onPress={() => setDays((m) => toggleDay(m, i))} style={[st.day, on ? st.dayOn : st.dayOff]}>
                <Text style={[st.dayText, { color: on ? '#FFFFFF' : color.ink }]}>{d}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={{ gap: 6 }}>
        <Text style={st.fieldLabel}>How to do it</Text>
        <TextInput value={how} onChangeText={setHow} multiline style={st.area} />
      </View>

      {editId ? (
        <Pressable accessibilityRole="button" onPress={remove} style={st.remove}>
          <Text style={st.removeText}>{kidId ? (kidName ? `Remove from ${kidName}’s day` : 'Remove') : 'Remove from care plan'}</Text>
        </Pressable>
      ) : null}
    </Screen>
  );
}

// P20a values. The header's 8 bottom + 2 here = the wireframe's 6 content top (Screen adds 4).
const st = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingTop: 16, paddingHorizontal: 20, paddingBottom: 10 },
  cancel: { fontFamily: font.bodySemi, fontSize: 15, color: color.primary, textDecorationLine: 'underline' },
  title: { fontFamily: font.display, fontSize: 20, color: color.ink, textAlign: 'center', flexGrow: 1, flexShrink: 1 },
  save: { fontFamily: font.bodyBold, fontSize: 15, color: color.primary, textAlign: 'right', textDecorationLine: 'underline' },
  label: { fontFamily: font.bodyBold, fontSize: 13, color: color.ink2, letterSpacing: 0.6 },
  type: { flex: 1, minWidth: 0, height: 64, alignItems: 'center', justifyContent: 'center', gap: 4, backgroundColor: '#FFFFFF', borderRadius: 999, borderWidth: 1, borderColor: color.line },
  typeOn: { backgroundColor: color.primaryTint, borderWidth: 2, borderColor: color.primary },
  typeText: { fontFamily: font.bodySemi, fontSize: 12, color: color.ink },
  half: { flex: 1, minWidth: 0, gap: 6 },
  fieldLabel: { fontFamily: font.bodySemi, fontSize: 14, color: color.ink },
  input: { height: 48, paddingHorizontal: 14, backgroundColor: '#FFFFFF', borderRadius: 8, borderWidth: 1, borderColor: color.lineStrong, fontFamily: font.body, fontSize: 16, color: color.ink },
  // Bottle: Amount (flex) beside the Unit dropdown (fixed width).
  row: { flexDirection: 'row', gap: 10 },
  unitSelect: { width: 112 },
  hint: { fontFamily: font.body, fontSize: 13, color: '#4B5960', lineHeight: 18 },
  day: { flex: 1, minWidth: 0, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  dayOn: { backgroundColor: color.primary },
  // Off days aren't drawn in P20a (every day is on); white with the field border.
  dayOff: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: color.lineStrong },
  dayText: { fontFamily: font.bodyBold, fontSize: 14 },
  // rows="3": 3 x 21 line height + 24 padding.
  area: { minHeight: 87, paddingVertical: 12, paddingHorizontal: 14, backgroundColor: '#FFFFFF', borderRadius: 8, borderWidth: 1, borderColor: color.lineStrong, fontFamily: font.body, fontSize: 15, lineHeight: 21, color: color.ink, textAlignVertical: 'top' },
  remove: { height: 40, alignItems: 'center', justifyContent: 'center' },
  removeText: { fontFamily: font.bodySemi, fontSize: 15, color: color.badInk },
});
