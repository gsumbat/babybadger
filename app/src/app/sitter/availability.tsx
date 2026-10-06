import { router } from 'expo-router';
import { useState } from 'react';
import { Modal, Platform, Pressable, StyleSheet, TurboModuleRegistry, View } from 'react-native';

import { Text, TextInput } from '@/components/Text';
import { TimeWheel } from '@/components/TimeField';
import { Button, ErrorText, Screen } from '@/components/ui';
import { type DayHours, WEEKDAY_SHORT, availabilityApi, fromDayHours, hoursLabel, toDayHours, upcomingTimeOff } from '@/lib/availability';
import { dayKey, rangeLabel } from '@/lib/calendar-logic';
import { useQuery } from '@/lib/data';
import { useSession } from '@/lib/session';
import { errorText } from '@/lib/supabase';
import { cardShadow, color, font } from '@/theme';

// Wireframe S11, translated from its HTML (app/src/wireframes/S11.tsx). Opened from the Calendar's "Time off" button
// (S6 / S6a / S6c), Home's Availability and Time off tools (S3 / S3b / S3d) and Me (S39).
// Each day's hours open the phone's time wheel (start and end separately). "+ Add" picks the first and last day off on
// the phone's date wheel and saves right away. Left out until built: a reason next to "Unavailable" (S11 "(class)"),
// editing or removing time off (no wireframe yet), and auto-declining requests (requests aren't built).

// Same native-module check as TimeField: iOS always has the wheel; Android opens a dialog when the module is there.
const hasDateWheel = Platform.OS === 'ios' || (Platform.OS === 'android' && TurboModuleRegistry.get('RNCDatePicker') != null);

export default function Availability() {
  const { session } = useSession();
  const uid = session!.user.id;
  const { data, error, reload } = useQuery(async () => {
    const [rows, off] = await Promise.all([availabilityApi.mine(uid), availabilityApi.myTimeOff(uid)]);
    return { rows, off };
  }, [uid]);
  const [edited, setEdited] = useState<DayHours[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [picking, setPicking] = useState<null | { step: 'first' | 'last'; first?: Date }>(null);
  const [draft, setDraft] = useState(new Date());

  const hours = edited ?? (data ? toDayHours(data.rows) : null);
  const setDay = (weekday: number, patch: Partial<DayHours>) => setEdited((hours ?? []).map((d) => (d.weekday === weekday ? { ...d, ...patch } : d)));
  const off = upcomingTimeOff(data?.off ?? [], dayKey(new Date()));

  async function save() {
    if (!hours) return;
    const rows = fromDayHours(hours, uid);
    if (!rows) return setErr('Each day’s end time has to be after its start.');
    setBusy(true);
    setErr('');
    try {
      await availabilityApi.save(uid, rows);
      router.back();
    } catch (e) {
      setErr(errorText(e));
    } finally {
      setBusy(false);
    }
  }

  async function addOff(first: Date, last: Date) {
    setPicking(null);
    const [a, b] = +last < +first ? [last, first] : [first, last];
    try {
      setErr('');
      await availabilityApi.addTimeOff(uid, { starts: dayKey(a), ends: dayKey(b) });
      await reload();
    } catch (e) {
      setErr(errorText(e));
    }
  }

  function startAdd() {
    const today = new Date();
    if (!hasDateWheel) {
      // Web preview / older builds: type the dates.
      const ask = (q: string) => globalThis.prompt?.(q) ?? null;
      const a = ask('First day off (MM/DD/YYYY)');
      const b = a ? ask('Last day off (MM/DD/YYYY)') || a : null;
      const parse = (t: string | null) => {
        const m = t?.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
        return m ? new Date(Number(m[3]), Number(m[1]) - 1, Number(m[2])) : null;
      };
      const [x, y] = [parse(a), parse(b)];
      if (x && y) addOff(x, y);
      else if (a) setErr('Type dates like 10/16/2026.');
      return;
    }
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const picker = require('@react-native-community/datetimepicker') as typeof import('@react-native-community/datetimepicker');
    if (Platform.OS === 'android') {
      picker.DateTimePickerAndroid.open({
        mode: 'date',
        value: today,
        minimumDate: today,
        onChange: (e, first) => {
          if (e.type !== 'set' || !first) return;
          picker.DateTimePickerAndroid.open({ mode: 'date', value: first, minimumDate: first, onChange: (e2, last) => e2.type === 'set' && last && addOff(first, last) });
        },
      });
      return;
    }
    setDraft(today);
    setPicking({ step: 'first' });
  }

  return (
    <Screen back title="Availability" gap={12} footer={<Button label="Save availability" busy={busy} disabled={!hours} onPress={save} />}>
      <Text style={st.intro}>Families can request shifts only inside these hours. Booked shifts block the time for everyone else.</Text>
      <ErrorText>{error || err}</ErrorText>

      <View style={st.card}>
        {(hours ?? []).map((d, i) => {
          const label = hoursLabel(d.starts, d.ends);
          const [startShown] = label.split(' – ');
          return (
            <View key={d.weekday} style={[st.row, i < 6 && st.line]}>
              <View style={{ width: 48 }}>
                <Text style={st.day}>{WEEKDAY_SHORT[d.weekday]}</Text>
              </View>
              <View style={{ flexGrow: 1, flexShrink: 1, flexDirection: 'row', alignItems: 'center' }}>
                {d.on ? (
                  <>
                    <TimeWheel title={`${WEEKDAY_SHORT[d.weekday]} starts`} value={d.starts} onChange={(t) => t && setDay(d.weekday, { starts: t })} fallback={<Typed value={d.starts} onChange={(t) => setDay(d.weekday, { starts: t })} />}>
                      <Text style={st.hours}>{startShown}</Text>
                    </TimeWheel>
                    <Text style={st.hours}> – </Text>
                    <TimeWheel title={`${WEEKDAY_SHORT[d.weekday]} ends`} value={d.ends} onChange={(t) => t && setDay(d.weekday, { ends: t })} fallback={<Typed value={d.ends} onChange={(t) => setDay(d.weekday, { ends: t })} />}>
                      <Text style={st.hours}>{d.ends}</Text>
                    </TimeWheel>
                  </>
                ) : (
                  <Text style={[st.hours, { color: '#5F6D74' }]}>Unavailable</Text>
                )}
              </View>
              <Pressable accessibilityRole="switch" accessibilityState={{ checked: d.on }} accessibilityLabel={`Available ${WEEKDAY_SHORT[d.weekday]}`} onPress={() => setDay(d.weekday, { on: !d.on })} hitSlop={8} style={[st.track, { backgroundColor: d.on ? color.primary : color.lineStrong }]}>
                <View style={[st.knob, d.on ? { right: 3 } : { left: 3 }]} />
              </Pressable>
            </View>
          );
        })}
      </View>

      <View style={st.offCard}>
        <View style={{ flexShrink: 1 }}>
          <Text style={st.offTitle}>Time off</Text>
          <Text style={st.offSub}>{off.length ? `${off.map((r) => rangeLabel(r)).join(', ')} · requests auto-declined` : 'None planned'}</Text>
        </View>
        <Pressable accessibilityRole="button" accessibilityLabel="Add time off" onPress={startAdd} style={st.add}>
          <Text style={st.addText}>+ Add</Text>
        </Pressable>
      </View>

      <View style={st.info}>
        <Text style={st.infoText}>Families see only &quot;available&quot; or &quot;unavailable&quot;. They never see which family booked you.</Text>
      </View>

      {Platform.OS === 'ios' && hasDateWheel ? (
        <DateSheet
          open={!!picking}
          title={picking?.step === 'last' ? 'Last day off' : 'First day off'}
          value={draft}
          min={picking?.first ?? new Date()}
          onChange={setDraft}
          onCancel={() => setPicking(null)}
          onDone={() => {
            if (picking?.step === 'first') {
              setPicking({ step: 'last', first: draft });
            } else if (picking?.first) addOff(picking.first, draft);
          }}
        />
      ) : null}
    </Screen>
  );
}

/** Web preview / older builds: the time is typed (same fallback as TimeField). */
function Typed({ value, onChange }: { value: string; onChange: (t: string) => void }) {
  return <TextInput value={value} onChangeText={onChange} autoCorrect={false} style={[st.hours, { minWidth: 72, paddingVertical: 4 }]} />;
}

/** iOS date wheel in the same sheet as TimeWheel (Cancel · title · Done). */
function DateSheet({ open, title, value, min, onChange, onCancel, onDone }: { open: boolean; title: string; value: Date; min: Date; onChange: (d: Date) => void; onCancel: () => void; onDone: () => void }) {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const picker = require('@react-native-community/datetimepicker') as typeof import('@react-native-community/datetimepicker');
  return (
    <Modal visible={open} transparent animationType="slide" onRequestClose={onCancel}>
      <Pressable style={st.scrim} onPress={onCancel} />
      <View style={st.sheet}>
        <View style={st.sheetHead}>
          <Text style={st.sheetBtn} onPress={onCancel}>
            Cancel
          </Text>
          <Text style={st.sheetTitle}>{title}</Text>
          <Text style={[st.sheetBtn, { fontFamily: font.bodyBold, textAlign: 'right' }]} onPress={onDone}>
            Done
          </Text>
        </View>
        <picker.default mode="date" display="spinner" value={value} minimumDate={min} onChange={(_, d) => d && onChange(d)} themeVariant="light" style={{ alignSelf: 'stretch' }} />
      </View>
    </Modal>
  );
}

// Values from wireframe S11.
const st = StyleSheet.create({
  intro: { fontFamily: font.body, fontSize: 15, lineHeight: 22, color: color.ink2 },
  card: { paddingVertical: 4, paddingHorizontal: 16, backgroundColor: '#FFFFFF', borderRadius: 24, ...cardShadow },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 56 },
  line: { borderBottomWidth: 1, borderBottomColor: color.divider },
  day: { fontFamily: font.bodySemi, fontSize: 15, color: color.ink },
  hours: { fontFamily: font.body, fontSize: 15, color: color.ink },
  track: { width: 50, height: 30, borderRadius: 15, flexShrink: 0 },
  knob: { position: 'absolute', top: 3, width: 24, height: 24, borderRadius: 12, backgroundColor: '#FFFFFF' },
  offCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, paddingVertical: 14, paddingHorizontal: 16, backgroundColor: '#FFFFFF', borderRadius: 24, ...cardShadow },
  offTitle: { fontFamily: font.bodySemi, fontSize: 15, color: color.ink },
  offSub: { fontFamily: font.body, fontSize: 13, color: '#5F6D74' },
  add: { height: 40, paddingHorizontal: 14, borderRadius: 999, backgroundColor: color.primaryTint, justifyContent: 'center' },
  addText: { fontFamily: font.bodyBold, fontSize: 14, color: color.primary },
  info: { paddingVertical: 12, paddingHorizontal: 14, backgroundColor: color.primaryTint, borderRadius: 12 },
  infoText: { fontFamily: font.body, fontSize: 14, lineHeight: 20, color: color.primaryStrong },
  scrim: { flex: 1, backgroundColor: 'rgba(27,35,40,0.35)' },
  sheet: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingBottom: 34, paddingHorizontal: 20 },
  sheetHead: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingTop: 16, paddingBottom: 8 },
  sheetBtn: { width: 60, fontFamily: font.bodySemi, fontSize: 15, color: color.primary },
  sheetTitle: { flex: 1, textAlign: 'center', fontFamily: font.displayBold, fontSize: 18, color: color.ink },
});
