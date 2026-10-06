// S21 Running late (sitter sheet over Today), S25 Parent asks to extend (card on the sitter's active shift) and the
// parent's "stay longer" sheet (no wireframe yet: it reuses S21's sheet layout). Values come from the wireframes'
// generated layouts (app/src/wireframes/S21.tsx, S25.tsx).
import { type ReactNode, useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, View } from 'react-native';

import { Text, TextInput } from '@/components/Text';
import { TimeWheel } from '@/components/TimeField';
import { timeOf } from '@/lib/format';
import { type ShiftExtension, timingApi } from '@/lib/shift-timing';
import {
  LATE_CHOICES,
  clock,
  customEnd,
  extendOptions,
  extensionChoices,
  extraPay,
  familyShort,
  firstTimedTask,
  isAtRisk,
  latestSafeEnd,
  minutesLabel,
  requestQuestion,
  riskLine,
  taskPhrase,
  validExtension,
} from '@/lib/shift-timing-logic';
import { errorText } from '@/lib/supabase';
import type { Shift, Task } from '@/lib/types';
import { cardShadow, color, font } from '@/theme';

/** P4c's "On my way" walking icon, used for the parents' late notice line. */
export const WALK_ICON =
  '<svg viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="13" cy="4.5" r="2"/><path d="M10 21l2-6 3 3v3M8 12l3-4 3 2 3 1M11 8l-1 5"/></svg>';

/** S21 / S25 chip: 40 high; chosen = tint, 1.5 primary border and a check. */
function TimeChip({ label, on, onPress }: { label: string; on: boolean; onPress?: () => void }) {
  return (
    <Pressable accessibilityRole="button" accessibilityState={{ selected: on }} onPress={onPress} style={[st.chip, on && st.chipOn]}>
      <Text style={[st.chipText, on && { color: color.primary }]}>{on ? `✓ ${label}` : label}</Text>
    </Pressable>
  );
}

/** S21's bottom sheet: dimmed screen behind, white sheet with a grabber. */
function Sheet({ open, onClose, children }: { open: boolean; onClose: () => void; children: ReactNode }) {
  return (
    <Modal visible={open} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <Pressable accessibilityLabel="Close" style={st.scrim} onPress={onClose} />
        <View style={st.sheet}>
          <View style={st.grabber} />
          {children}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function NoteField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={st.noteLabel}>Note (optional)</Text>
      <TextInput value={value} onChangeText={onChange} multiline maxLength={500} placeholderTextColor={color.quiet} style={st.note} />
    </View>
  );
}

function PrimaryButton({ label, onPress, busy, disabled }: { label: string; onPress: () => void; busy?: boolean; disabled?: boolean }) {
  const off = busy || disabled;
  return (
    <Pressable accessibilityRole="button" accessibilityState={{ disabled: !!off, busy: !!busy }} onPress={off ? undefined : onPress} style={({ pressed }) => [st.primary, disabled && { opacity: 0.5 }, pressed && { opacity: 0.85 }]}>
      {busy ? <ActivityIndicator color="#FFFFFF" /> : <Text style={st.primaryText}>{label}</Text>}
    </Pressable>
  );
}

/** S21 Running late. The distance card is left out (needs the family's address and places). */
export function RunningLateSheet({ open, onClose, onCancelled, shift, family, tasks }: { open: boolean; onClose: () => void; onCancelled: () => void; shift: Shift; family: string; tasks: Task[] }) {
  const [late, setLate] = useState<number>();
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const fam = familyShort(family);
  const task = firstTimedTask(tasks);
  const risk = !!late && isAtRisk(shift.starts_at, late, task);

  async function send() {
    if (!late) return;
    setBusy(true);
    try {
      await timingApi.reportLate(shift.id, late, note, risk && task ? riskLine(task) : '');
      onClose();
    } catch (e) {
      Alert.alert('Couldn’t send', errorText(e));
    } finally {
      setBusy(false);
    }
  }

  function cantMakeIt() {
    Alert.alert('Cancel your shift?', `The ${fam} gets an urgent alert.`, [
      { text: 'Keep it', style: 'cancel' },
      {
        text: 'Cancel shift',
        style: 'destructive',
        onPress: async () => {
          try {
            await timingApi.cancelMyShift(shift.id, note);
            onClose();
            onCancelled();
          } catch (e) {
            Alert.alert('Couldn’t cancel', errorText(e));
          }
        },
      },
    ]);
  }

  return (
    <Sheet open={open} onClose={onClose}>
      <View style={{ gap: 2 }}>
        <Text style={st.title}>Running late?</Text>
        <Text style={st.sub}>{[fam, `shift starts ${timeOf(shift.starts_at)}`, task ? `${taskPhrase(task.title)} at ${clock(task.due_at!)}` : ''].filter(Boolean).join(' · ')}</Text>
      </View>
      <Text style={st.label}>HOW LATE</Text>
      <View style={st.chips}>
        {LATE_CHOICES.map((m) => (
          <TimeChip key={m} label={`${m} min`} on={late === m} onPress={() => setLate(m)} />
        ))}
      </View>
      <NoteField value={note} onChange={setNote} />
      {risk && task ? (
        <View style={st.warn}>
          <Text style={st.warnText}>
            <Text style={st.warnBold}>{riskLine(task)}</Text> Parents get this flagged so they can cover it.
          </Text>
        </View>
      ) : null}
      <View style={{ flexDirection: 'row' }}>
        <PrimaryButton label={`Tell the ${fam}`} onPress={send} busy={busy} disabled={!late} />
      </View>
      <Pressable accessibilityRole="button" onPress={cantMakeIt} style={st.danger}>
        <Text style={st.dangerText}>{"I can't make it today"}</Text>
      </Pressable>
    </Sheet>
  );
}

/** Parent's "Ask Maya to stay longer?" (not drawn yet: S21's sheet with end-time chips, a note and one button). */
export function AskToStaySheet({ open, onClose, shift, sitter }: { open: boolean; onClose: () => void; shift: Shift; sitter: string }) {
  const [until, setUntil] = useState<number>();
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const options = extendOptions(shift.ends_at);

  async function send() {
    if (until == null) return;
    setBusy(true);
    try {
      await timingApi.requestExtension(shift.id, new Date(until), note);
      setNote('');
      setUntil(undefined);
      onClose();
    } catch (e) {
      Alert.alert('Couldn’t send', errorText(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Sheet open={open} onClose={onClose}>
      <View style={{ gap: 2 }}>
        <Text style={st.title}>Ask {sitter} to stay longer?</Text>
        <Text style={st.sub}>Shift ends at {timeOf(shift.ends_at)}</Text>
      </View>
      <Text style={st.label}>NEW END TIME</Text>
      <View style={st.chips}>
        {options.map((d) => (
          <TimeChip key={+d} label={`Until ${clock(d)}`} on={until === +d} onPress={() => setUntil(+d)} />
        ))}
      </View>
      <NoteField value={note} onChange={setNote} />
      <View style={{ flexDirection: 'row' }}>
        <PrimaryButton label="Send request" onPress={send} busy={busy} disabled={until == null} />
      </View>
    </Sheet>
  );
}

/** S25 card on the sitter's active shift. `next` = her next shift that day (for the "Tight" warning). */
export function ExtendRequestCard({ request, shift, parentName, rate, next, nextFamily, onAnswered }: { request: ShiftExtension; shift: Shift; parentName: string; rate: number | null; next?: Shift; nextFamily: string; onAnswered: () => void }) {
  const safe = next ? latestSafeEnd(next) : undefined;
  const choices = extensionChoices(shift.ends_at, request.new_ends_at, safe);
  const [pick, setPick] = useState<number | 'custom'>(+choices[0]);
  const [custom, setCustom] = useState('');
  const [busy, setBusy] = useState<'yes' | 'no'>();
  const asked = (+new Date(request.new_ends_at) - +new Date(shift.ends_at)) / 60_000;
  const pay = extraPay(rate, asked);
  const tight = !!safe && +new Date(request.new_ends_at) > +safe;
  const until = pick === 'custom' ? customEnd(custom, shift.ends_at) : new Date(pick);

  async function answer(accept: boolean) {
    if (accept && (!until || !validExtension(shift.ends_at, until))) return Alert.alert('Pick a later time', `Choose a time after ${timeOf(shift.ends_at)}.`);
    setBusy(accept ? 'yes' : 'no');
    try {
      await timingApi.answerExtension(request.id, accept, accept ? until! : undefined);
      onAnswered();
    } catch (e) {
      Alert.alert('Couldn’t answer', errorText(e));
    } finally {
      setBusy(undefined);
    }
  }

  const rows: [string, string][] = [
    ['New end time', timeOf(request.new_ends_at)],
    ['Extra time', minutesLabel(asked)],
    ...(pay ? [['Extra pay', pay] as [string, string]] : []),
  ];
  return (
    <View style={st.card}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <View style={st.avatar}>
          <Text style={st.avatarText}>{(parentName[0] || '?').toUpperCase()}</Text>
        </View>
        <View style={{ flexShrink: 1 }}>
          <Text style={st.who}>
            {parentName} · {timeOf(request.created_at)}
          </Text>
          <Text style={st.ends}>Shift ends at {timeOf(shift.ends_at)}</Text>
        </View>
      </View>
      <Text style={st.question}>{requestQuestion(request.note, request.new_ends_at)}</Text>
      <View style={st.rows}>
        {rows.map(([k, v], i) => (
          <View key={k} style={[st.row, i < rows.length - 1 && st.rowLine]}>
            <Text style={st.rowKey}>{k}</Text>
            <Text style={st.rowVal}>{v}</Text>
          </View>
        ))}
      </View>
      {tight && next && safe ? (
        <View style={st.warn}>
          <Text style={st.warnText}>
            <Text style={st.warnBold}>Tight:</Text> your {familyShort(nextFamily).replace(/\s+family$/i, '')} shift starts {timeOf(next.starts_at)}. Staying past {clock(safe)} makes you late there.
          </Text>
        </View>
      ) : null}
      <View style={st.chips}>
        {choices.map((d) => (
          <TimeChip key={+d} label={`Until ${clock(d)}`} on={pick === +d} onPress={() => setPick(+d)} />
        ))}
        <TimeWheel
          title="Stay until"
          value={custom}
          step={5}
          onChange={(t) => {
            setCustom(t);
            setPick('custom');
          }}
          fallback={<TextInput value={custom} onFocus={() => setPick('custom')} onChangeText={setCustom} placeholder="Custom" placeholderTextColor={color.ink} autoCorrect={false} style={[st.chip, pick === 'custom' && st.chipOn, st.chipText, { minWidth: 90 }]} />}
          style={[st.chip, pick === 'custom' && st.chipOn]}>
          <Text style={[st.chipText, pick === 'custom' && { color: color.primary }]}>{pick === 'custom' ? '✓ Custom' : 'Custom'}</Text>
        </TimeWheel>
      </View>
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <Pressable accessibilityRole="button" onPress={busy ? undefined : () => answer(false)} style={st.outline}>
          {busy === 'no' ? <ActivityIndicator color={color.ink} /> : <Text style={st.outlineText}>Can’t stay</Text>}
        </Pressable>
        <PrimaryButton label={until ? `Stay till ${clock(until)}` : 'Stay'} onPress={() => answer(true)} busy={busy === 'yes'} disabled={busy === 'no'} />
      </View>
    </View>
  );
}

// Values from wireframes S21 and S25.
const st = StyleSheet.create({
  scrim: { flex: 1, backgroundColor: 'rgba(27,35,40,0.45)' },
  sheet: { gap: 14, paddingTop: 12, paddingHorizontal: 20, paddingBottom: 32, backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  grabber: { alignSelf: 'center', width: 40, height: 5, borderRadius: 3, backgroundColor: '#C3CCD5' },
  title: { fontFamily: font.display, fontSize: 24, color: color.ink },
  sub: { fontFamily: font.body, fontSize: 14, color: color.ink2 },
  label: { fontFamily: font.bodyBold, fontSize: 13, color: color.ink2, letterSpacing: 0.6 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { height: 40, paddingHorizontal: 14, borderRadius: 999, borderWidth: 1, borderColor: color.line, backgroundColor: '#FFFFFF', flexDirection: 'row', alignItems: 'center' },
  chipOn: { backgroundColor: color.primaryTint, borderWidth: 1.5, borderColor: color.primary },
  chipText: { fontFamily: font.bodySemi, fontSize: 14, color: color.ink },
  noteLabel: { fontFamily: font.bodySemi, fontSize: 14, color: color.ink },
  // S21 textarea: 2 rows of 15px text, 12/14 padding.
  note: { minHeight: 68, paddingVertical: 12, paddingHorizontal: 14, borderRadius: 8, borderWidth: 1, borderColor: color.lineStrong, fontFamily: font.body, fontSize: 15, color: color.ink, textAlignVertical: 'top' },
  warn: { paddingVertical: 10, paddingHorizontal: 14, backgroundColor: color.warnTint, borderRadius: 12 },
  warnText: { fontFamily: font.body, fontSize: 13, lineHeight: 18, color: '#5C4310' },
  warnBold: { fontFamily: font.bodyBold, color: color.warnInk },
  primary: { flexGrow: 1, flexBasis: 0, height: 54, borderRadius: 999, backgroundColor: color.primary, alignItems: 'center', justifyContent: 'center' },
  primaryText: { fontFamily: font.displayBold, fontSize: 17, color: '#FFFFFF' },
  danger: { height: 40, alignItems: 'center', justifyContent: 'center' },
  dangerText: { fontFamily: font.bodySemi, fontSize: 15, color: color.badInk },
  // S25
  card: { gap: 14, padding: 18, backgroundColor: '#FFFFFF', borderRadius: 24, borderWidth: 2, borderColor: color.primary, ...cardShadow },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: color.ink, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontFamily: font.display, fontSize: 21, color: '#FFFFFF' },
  who: { fontFamily: font.bodyBold, fontSize: 15, color: color.ink },
  ends: { fontFamily: font.body, fontSize: 13, color: color.ink2 },
  question: { fontFamily: font.display, fontSize: 22, lineHeight: 28, color: color.ink },
  rows: { paddingVertical: 4, paddingHorizontal: 14, backgroundColor: color.canvas, borderRadius: 12 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 46 },
  rowLine: { borderBottomWidth: 1, borderBottomColor: color.divider },
  rowKey: { fontFamily: font.body, fontSize: 15, color: color.ink2, flexShrink: 1 },
  rowVal: { fontFamily: font.bodySemi, fontSize: 15, color: color.ink, textAlign: 'right', flexShrink: 1 },
  outline: { flexGrow: 1, flexBasis: 0, height: 54, borderRadius: 999, borderWidth: 1, borderColor: color.lineStrong, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  outlineText: { fontFamily: font.displayBold, fontSize: 17, color: color.ink },
});
