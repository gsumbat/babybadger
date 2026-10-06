import { type ReactNode, useState } from 'react';
import { Modal, Platform, Pressable, type StyleProp, StyleSheet, TurboModuleRegistry, View, type ViewStyle } from 'react-native';

import { Text, TextInput } from '@/components/Text';
import { Icon } from '@/components/ui';
import { color, font } from '@/theme';

// Every time input in the app goes through this field (rule in CLAUDE.md): it looks like the wireframes' time
// dropdown (P20a: 48px box, 8px radius, chevron) and opens the phone's own time wheel (hour, minute, AM/PM).
// The value is text like "7:00 PM" ('' = no time), so screens keep their existing parsing.
//
// The wheel is native (@react-native-community/datetimepicker). On a build made before it was added, and on the
// web preview, the field falls back to typing so nothing breaks.

// iOS draws the wheel as a native view (RNDateTimePicker), so there is no module to look up; every iOS build since
// Oct 6 2026 includes it. Android opens a native dialog through the RNCTimePicker module, which we can check for.
const hasWheel = Platform.OS === 'ios' || (Platform.OS === 'android' && TurboModuleRegistry.get('RNCTimePicker') != null);

type WheelProps = {
  /** Title on the wheel sheet, e.g. "Starts". */
  title: string;
  value: string;
  onChange: (text: string) => void;
  /** Minutes between choices on the wheel. */
  step?: number;
  /** Shown when the native wheel isn't available (older build, web): normally a TextInput. */
  fallback: ReactNode;
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
};

/** Makes any box open the time wheel. Use TimeField for the standard dropdown look; screens whose wireframe draws the
 * time differently (S45 nap times) wrap their own box in this. */
export function TimeWheel({ title, value, onChange, step = 5, fallback, style, children }: WheelProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(new Date());

  if (!hasWheel) return <>{fallback}</>;

  // Loaded only when the native wheel exists: importing it on an older build would crash.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const picker = require('@react-native-community/datetimepicker') as typeof import('@react-native-community/datetimepicker');

  function start() {
    const d = toDate(value);
    if (Platform.OS === 'android') {
      picker.DateTimePickerAndroid.open({ mode: 'time', value: d, is24Hour: false, minuteInterval: step as 5, onChange: (e, picked) => e.type === 'set' && picked && onChange(toText(picked)) });
      return;
    }
    setDraft(d);
    setOpen(true);
  }

  return (
    <>
      <Pressable accessibilityRole="button" accessibilityLabel={`${title}, ${value || 'no time set'}`} onPress={start} style={style}>
        {children}
      </Pressable>
      {Platform.OS === 'ios' ? (
        <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
          <Pressable style={st.scrim} onPress={() => setOpen(false)} />
          <View style={st.sheet}>
            {/* Same header pattern as P20a: Cancel · title · Done. */}
            <View style={st.sheetHead}>
              <Text style={st.sheetBtn} onPress={() => setOpen(false)}>
                Cancel
              </Text>
              <Text style={st.sheetTitle}>{title}</Text>
              <Text
                style={[st.sheetBtn, { fontFamily: font.bodyBold, textAlign: 'right' }]}
                onPress={() => {
                  onChange(toText(draft));
                  setOpen(false);
                }}>
                Done
              </Text>
            </View>
            <picker.default mode="time" display="spinner" value={draft} minuteInterval={step as 5} onChange={(_, d) => d && setDraft(d)} themeVariant="light" style={{ alignSelf: 'stretch' }} />
            {value ? (
              <Text
                style={st.clear}
                onPress={() => {
                  onChange('');
                  setOpen(false);
                }}>
                No time
              </Text>
            ) : null}
          </View>
        </Modal>
      ) : null}
    </>
  );
}

type Props = { label: string; value: string; onChange: (text: string) => void; placeholder?: string; step?: number };

/** The standard time input: label over the wireframe's dropdown box (P20a), opening the time wheel. */
export function TimeField({ label, value, onChange, placeholder = 'Set a time', step }: Props) {
  return (
    <View style={st.wrap}>
      <Text style={st.label}>{label}</Text>
      <TimeWheel
        title={label}
        value={value}
        onChange={onChange}
        step={step}
        style={st.box}
        fallback={<TextInput value={value} onChangeText={onChange} placeholder={placeholder} placeholderTextColor={color.quiet} autoCorrect={false} style={[st.box, st.typed]} />}>
        <Text style={[st.value, !value && { color: color.quiet }]}>{value || placeholder}</Text>
        <Icon name="chevron-down" size={18} tint={color.ink2} strokeWidth={2} />
      </TimeWheel>
    </View>
  );
}

/** "7:00 PM" → today at 7:00 PM; empty or unreadable → the next round half hour. */
function toDate(text: string): Date {
  const m = text.trim().match(/^(\d{1,2})(?::(\d{2}))?\s*([ap])\.?m?\.?$/i) ?? text.trim().match(/^(\d{1,2}):(\d{2})$/);
  const d = new Date();
  d.setSeconds(0, 0);
  if (!m) {
    d.setMinutes(d.getMinutes() < 30 ? 30 : 60);
    return d;
  }
  let h = Number(m[1]) % (m[3] ? 12 : 24);
  if (m[3] && m[3].toLowerCase() === 'p') h += 12;
  d.setHours(h, Number(m[2] ?? 0));
  return d;
}

/** Date → "7:00 PM", the format the screens already parse. */
function toText(d: Date): string {
  const h = d.getHours();
  return `${h % 12 || 12}:${String(d.getMinutes()).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`;
}

// Box values from wireframe P20a (time selects).
const st = StyleSheet.create({
  wrap: { gap: 6, flex: 1, minWidth: 0 },
  label: { fontFamily: font.bodySemi, fontSize: 14, color: color.ink },
  box: { height: 48, borderWidth: 1, borderColor: '#C3CCD5', borderRadius: 8, backgroundColor: '#FFFFFF', paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  typed: { fontFamily: font.body, fontSize: 16, color: color.ink },
  value: { fontFamily: font.body, fontSize: 16, color: color.ink },
  scrim: { flex: 1, backgroundColor: 'rgba(27,35,40,0.35)' },
  sheet: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingBottom: 34, paddingHorizontal: 20 },
  sheetHead: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingTop: 16, paddingBottom: 8 },
  sheetBtn: { width: 60, fontFamily: font.bodySemi, fontSize: 15, color: color.primary },
  sheetTitle: { flex: 1, textAlign: 'center', fontFamily: font.displayBold, fontSize: 18, color: color.ink },
  clear: { alignSelf: 'center', paddingVertical: 10, fontFamily: font.bodySemi, fontSize: 15, color: color.badInk },
});
