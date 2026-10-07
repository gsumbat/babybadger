import { useState } from 'react';
import { Modal, Platform, Pressable, StyleSheet, TurboModuleRegistry, View } from 'react-native';

import { Text, TextInput } from '@/components/Text';
import { fromUsDate, parseDay, toDay, usDate } from '@/lib/credentials-logic';
import { color, font } from '@/theme';

// Date input that opens the phone's date wheel, the date twin of TimeField (same sheet: Cancel · title · Done).
// The value is 'YYYY-MM-DD' ('' = none) and shows as MM/DD/YYYY. Box values from wireframe S15 (Issued / Expires):
// 48 high, 8 radius, #C3CCD5 border, 16 text. On the web preview and builds without the native module, the date is
// typed (MM/DD/YYYY), like the TimeField fallback.

// Same native-module check as TimeField / S11: iOS always has the wheel; Android opens a dialog when the module is there.
const hasDateWheel = Platform.OS === 'ios' || (Platform.OS === 'android' && TurboModuleRegistry.get('RNCDatePicker') != null);

type Props = { label: string; value: string; onChange: (day: string) => void; placeholder?: string };

export function DateField({ label, value, onChange, placeholder = 'MM/DD/YYYY' }: Props) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(new Date());
  const [typed, setTyped] = useState<string | null>(null);

  if (!hasDateWheel) {
    // Typed fallback: keeps what's typed until it's a real date, then hands it up.
    const text = typed ?? usDate(value || null);
    return (
      <View style={st.wrap}>
        <Text style={st.label}>{label}</Text>
        <TextInput
          value={text}
          onChangeText={(t) => {
            setTyped(t);
            if (!t.trim()) onChange('');
            else {
              const day = fromUsDate(t);
              if (day) onChange(day);
            }
          }}
          placeholder={placeholder}
          placeholderTextColor={color.quiet}
          keyboardType="numbers-and-punctuation"
          autoCorrect={false}
          style={[st.box, st.value]}
        />
      </View>
    );
  }

  // Loaded only when the native wheel exists: importing it on an older build would crash.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const picker = require('@react-native-community/datetimepicker') as typeof import('@react-native-community/datetimepicker');

  function start() {
    const d = value ? parseDay(value) : new Date();
    if (Platform.OS === 'android') {
      picker.DateTimePickerAndroid.open({ mode: 'date', value: d, onChange: (e, picked) => e.type === 'set' && picked && onChange(toDay(picked)) });
      return;
    }
    setDraft(d);
    setOpen(true);
  }

  return (
    <View style={st.wrap}>
      <Text style={st.label}>{label}</Text>
      <Pressable accessibilityRole="button" accessibilityLabel={`${label}, ${value ? usDate(value) : 'no date set'}`} onPress={start} style={st.box}>
        <Text style={[st.value, !value && { color: color.quiet }]}>{value ? usDate(value) : placeholder}</Text>
      </Pressable>
      {Platform.OS === 'ios' ? (
        <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
          <Pressable style={st.scrim} onPress={() => setOpen(false)} />
          <View style={st.sheet}>
            <View style={st.sheetHead}>
              <Text style={st.sheetBtn} onPress={() => setOpen(false)}>
                Cancel
              </Text>
              <Text style={st.sheetTitle}>{label}</Text>
              <Text
                style={[st.sheetBtn, { fontFamily: font.bodyBold, textAlign: 'right' }]}
                onPress={() => {
                  onChange(toDay(draft));
                  setOpen(false);
                }}>
                Done
              </Text>
            </View>
            <picker.default mode="date" display="spinner" value={draft} onChange={(_, d) => d && setDraft(d)} themeVariant="light" style={{ alignSelf: 'stretch' }} />
            {value ? (
              <Text
                style={st.clear}
                onPress={() => {
                  onChange('');
                  setOpen(false);
                }}>
                No date
              </Text>
            ) : null}
          </View>
        </Modal>
      ) : null}
    </View>
  );
}

const st = StyleSheet.create({
  wrap: { gap: 6, flexGrow: 1, flexShrink: 1, flexBasis: 0, minWidth: 0 },
  label: { fontFamily: font.bodySemi, fontSize: 14, color: color.ink },
  box: { height: 48, minWidth: 0, borderWidth: 1, borderColor: '#C3CCD5', borderRadius: 8, paddingHorizontal: 14, justifyContent: 'center' },
  value: { fontFamily: font.body, fontSize: 16, color: color.ink },
  scrim: { flex: 1, backgroundColor: 'rgba(27,35,40,0.35)' },
  sheet: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingBottom: 34, paddingHorizontal: 20 },
  sheetHead: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingTop: 16, paddingBottom: 8 },
  sheetBtn: { width: 60, fontFamily: font.bodySemi, fontSize: 15, color: color.primary },
  sheetTitle: { flex: 1, textAlign: 'center', fontFamily: font.displayBold, fontSize: 18, color: color.ink },
  clear: { alignSelf: 'center', paddingVertical: 10, fontFamily: font.bodySemi, fontSize: 15, color: color.badInk },
});
