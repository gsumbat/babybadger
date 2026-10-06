import { useState } from 'react';
import { ActionSheetIOS, Alert, Modal, Platform, Pressable, type StyleProp, StyleSheet, View, type ViewStyle } from 'react-native';

import { Text } from '@/components/Text';
import { Icon } from '@/components/ui';
import { color, font } from '@/theme';

// Every dropdown in the app goes through this field (rule in CLAUDE.md): the wireframes' select box (P20a: 48px box,
// 8px radius, value + chevron, same look as TimeField). Pressing it opens the phone's own chooser: an action sheet
// on iOS, an alert with one button per option on Android. Android alerts show at most three buttons, so longer lists
// (and the web preview, where Alert does nothing) get a simple list sheet instead.

export type SelectOption<T extends string = string> = { value: T; label: string };

type Props<T extends string> = {
  label: string;
  value: T | '';
  options: SelectOption<T>[];
  onChange: (value: T) => void;
  /** Shown in the box when nothing is chosen. */
  placeholder?: string;
  /** On the outer wrapper (label + box), e.g. a fixed width. */
  style?: StyleProp<ViewStyle>;
};

/** Label over the wireframe's select box; opens the phone's chooser. */
export function SelectField<T extends string>({ label, value, options, onChange, placeholder = 'Choose', style }: Props<T>) {
  const [open, setOpen] = useState(false);
  const current = options.find((o) => o.value === value)?.label ?? '';

  function start() {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions({ title: label, options: [...options.map((o) => o.label), 'Cancel'], cancelButtonIndex: options.length }, (i) => {
        if (i < options.length) onChange(options[i].value);
      });
      return;
    }
    // Android shows at most three alert buttons: the options plus Cancel must fit.
    if (Platform.OS === 'android' && options.length <= 2) {
      Alert.alert(label, undefined, [...options.map((o) => ({ text: o.label, onPress: () => onChange(o.value) })), { text: 'Cancel', style: 'cancel' as const }], { cancelable: true });
      return;
    }
    setOpen(true);
  }

  return (
    <View style={[st.wrap, style]}>
      <Text style={st.label}>{label}</Text>
      <Pressable accessibilityRole="button" accessibilityLabel={`${label}, ${current || placeholder}`} onPress={start} style={st.box}>
        <Text style={[st.value, !current && { color: color.quiet }]} numberOfLines={1}>
          {current || placeholder}
        </Text>
        <Icon name="chevron-down" size={18} tint={color.ink2} strokeWidth={2} />
      </Pressable>
      {Platform.OS !== 'ios' ? (
        <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
          <Pressable style={st.scrim} onPress={() => setOpen(false)} />
          <View style={st.sheet}>
            <Text style={st.sheetTitle}>{label}</Text>
            {options.map((o) => (
              <Pressable
                key={o.value}
                accessibilityRole="button"
                accessibilityState={{ selected: o.value === value }}
                onPress={() => {
                  onChange(o.value);
                  setOpen(false);
                }}
                style={st.option}>
                <Text style={[st.optionText, o.value === value && { fontFamily: font.bodyBold, color: color.primary }]}>{o.label}</Text>
              </Pressable>
            ))}
            <Pressable accessibilityRole="button" onPress={() => setOpen(false)} style={st.option}>
              <Text style={st.cancel}>Cancel</Text>
            </Pressable>
          </View>
        </Modal>
      ) : null}
    </View>
  );
}

// Box values from wireframe P20a (same as TimeField's box).
const st = StyleSheet.create({
  wrap: { gap: 6, minWidth: 0 },
  label: { fontFamily: font.bodySemi, fontSize: 14, color: color.ink },
  box: { height: 48, borderWidth: 1, borderColor: '#C3CCD5', borderRadius: 8, backgroundColor: '#FFFFFF', paddingHorizontal: 14, gap: 6, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  value: { flexShrink: 1, fontFamily: font.body, fontSize: 16, color: color.ink },
  scrim: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(27,35,40,0.35)' },
  sheet: { position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingTop: 16, paddingBottom: 34, paddingHorizontal: 20 },
  sheetTitle: { textAlign: 'center', fontFamily: font.displayBold, fontSize: 18, color: color.ink, paddingBottom: 8 },
  option: { height: 48, alignItems: 'center', justifyContent: 'center' },
  optionText: { fontFamily: font.body, fontSize: 16, color: color.ink },
  cancel: { fontFamily: font.bodySemi, fontSize: 15, color: color.ink2 },
});
