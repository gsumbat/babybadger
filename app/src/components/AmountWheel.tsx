import { useRef, useState } from 'react';
import { Modal, type NativeScrollEvent, type NativeSyntheticEvent, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Text } from '@/components/Text';
import { Icon } from '@/components/ui';
import { color, font } from '@/theme';

// S5b "Amount": the same dropdown box as TimeField (P20a, 48px, chevron) opening a wheel of amounts on a bottom sheet
// with Cancel · title · Done, like the time wheel's iOS sheet. Drawn in JS (a snapping list) so it works on every build
// and on the web preview; tapping a row picks it too.

const ROW = 40;
const SHOWN = 5;

type Props = {
  label: string;
  /** The wheel's values in order (lib/bottle amountChoices). */
  values: number[];
  value: number;
  onChange: (v: number) => void;
  /** "4 oz": how a value reads in the box and on the wheel. */
  format: (v: number) => string;
};

export function AmountWheel({ label, values, value, onChange, format }: Props) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(value);
  const list = useRef<ScrollView>(null);
  const index = Math.max(0, values.indexOf(value));

  const settle = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const i = Math.min(values.length - 1, Math.max(0, Math.round(e.nativeEvent.contentOffset.y / ROW)));
    setDraft(values[i]);
  };

  return (
    <View style={st.wrap}>
      <Text style={st.label}>{label}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${label}, ${format(value)}`}
        onPress={() => {
          setDraft(value);
          setOpen(true);
        }}
        style={st.box}>
        <Text style={st.value}>{format(value)}</Text>
        <Icon name="chevron-down" size={18} tint={color.ink2} strokeWidth={2} />
      </Pressable>
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
                onChange(draft);
                setOpen(false);
              }}>
              Done
            </Text>
          </View>
          <View style={{ height: ROW * SHOWN }}>
            {/* The band behind the middle row marks the pick. */}
            <View pointerEvents="none" style={st.band} />
            <ScrollView
              ref={list}
              showsVerticalScrollIndicator={false}
              snapToInterval={ROW}
              decelerationRate="fast"
              contentOffset={{ x: 0, y: index * ROW }}
              contentContainerStyle={{ paddingVertical: ROW * Math.floor(SHOWN / 2) }}
              onMomentumScrollEnd={settle}
              onScrollEndDrag={settle}>
              {values.map((v, i) => (
                <Pressable
                  key={v}
                  accessibilityRole="button"
                  onPress={() => {
                    setDraft(v);
                    list.current?.scrollTo({ y: i * ROW, animated: true });
                  }}
                  style={st.row}>
                  <Text style={[st.rowText, v === draft && st.rowOn]}>{format(v)}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// Box values from wireframe P20a (same as TimeField); sheet as TimeWheel's.
const st = StyleSheet.create({
  wrap: { gap: 6, flex: 1, minWidth: 0 },
  label: { fontFamily: font.bodySemi, fontSize: 14, color: color.ink },
  box: { height: 48, borderWidth: 1, borderColor: '#C3CCD5', borderRadius: 8, backgroundColor: '#FFFFFF', paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  value: { fontFamily: font.body, fontSize: 16, color: color.ink },
  scrim: { flex: 1, backgroundColor: 'rgba(27,35,40,0.35)' },
  sheet: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingBottom: 34, paddingHorizontal: 20 },
  sheetHead: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingTop: 16, paddingBottom: 8 },
  sheetBtn: { width: 60, fontFamily: font.bodySemi, fontSize: 15, color: color.primary },
  sheetTitle: { flex: 1, textAlign: 'center', fontFamily: font.displayBold, fontSize: 18, color: color.ink },
  band: { position: 'absolute', left: 0, right: 0, top: ROW * Math.floor(SHOWN / 2), height: ROW, borderRadius: 10, backgroundColor: color.primaryTint },
  row: { height: ROW, alignItems: 'center', justifyContent: 'center' },
  rowText: { fontFamily: font.body, fontSize: 20, color: color.ink2 },
  rowOn: { fontFamily: font.bodyBold, color: color.ink },
});
