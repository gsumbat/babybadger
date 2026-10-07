import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Modal, Platform, Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/Text';
import { TimeField } from '@/components/TimeField';
import { addDays, dayKey, sameDay, startOfDay } from '@/lib/calendar-logic';
import { timeText, windowFrom, type TimeWindow } from '@/lib/pool-logic';
import { color, font } from '@/theme';

// Shared by P54 (Sitters tab) and P42 (Sitter pool): opening the pool for a time window, the "Pick a time" sheet
// (canvas board P54d) and the "Coming soon" note for finding new sitters (P48 isn't built).

/** P42 for a time window. */
export function openPool(w: TimeWindow, replace = false) {
  const to = { pathname: '/parent/pool' as const, params: { start: w.start.toISOString(), end: w.end.toISOString() } };
  if (replace) router.setParams(to.params);
  else router.push(to);
}

/** P48 Find a sitter isn't built yet. */
export function findComingSoon() {
  const msg = 'Finding new sitters near you isn’t in the app yet.';
  if (Platform.OS === 'web') globalThis.alert?.(`Coming soon. ${msg}`);
  else Alert.alert('Coming soon', msg);
}

/** The next 7 days, today first (same strip as booking a shift). */
export function nextWeek(now = new Date()): Date[] {
  return Array.from({ length: 7 }, (_, i) => addDays(startOfDay(now), i));
}

/** "Pick a time" (canvas board P54d): a day in the next week and the start and end on the time wheel. */
export function PickTimeSheet({ visible, initial, onClose, onPick }: { visible: boolean; initial: TimeWindow; onClose: () => void; onPick: (w: TimeWindow) => void }) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      {/* Mounted only while open, so it starts from the current window each time. */}
      {visible ? <SheetBody initial={initial} onClose={onClose} onPick={onPick} /> : null}
    </Modal>
  );
}

function SheetBody({ initial, onClose, onPick }: { initial: TimeWindow; onClose: () => void; onPick: (w: TimeWindow) => void }) {
  const days = nextWeek();
  const startDay = days.findIndex((d) => sameDay(d, initial.start));
  const [day, setDay] = useState(startDay < 0 ? 0 : startDay);
  const [start, setStart] = useState(timeText(initial.start));
  const [end, setEnd] = useState(timeText(initial.end));
  const win = windowFrom(dayKey(days[day]), start, end);

  return (
    <View style={st.scrim}>
      <Pressable style={{ flex: 1 }} accessibilityLabel="Close" onPress={onClose} />
      <View accessibilityRole="none" style={st.sheet}>
        {/* Same header as the time wheel sheets (S11b, P20b): Cancel · title · Done. */}
        <View style={st.head}>
          <Text style={st.btn} onPress={onClose} accessibilityRole="button">
            Cancel
          </Text>
          <Text style={st.title}>Pick a time</Text>
          <Text
            accessibilityRole="button"
            style={[st.btn, { fontFamily: font.bodyBold, textAlign: 'right' }, !win && { color: color.quiet }]}
            onPress={() => win && onPick(win)}>
            Done
          </Text>
        </View>
        <View style={st.body}>
          <View style={{ flexDirection: 'row', gap: 4 }}>
            {days.map((d, i) => (
              <Pressable key={i} accessibilityRole="radio" accessibilityState={{ selected: day === i }} onPress={() => setDay(i)} style={[st.day, day === i && st.dayOn]}>
                <Text style={[st.dow, day === i && { color: '#FFFFFF' }]}>{d.toLocaleDateString('en-US', { weekday: 'short' })}</Text>
                <Text style={[st.num, day === i && { color: '#FFFFFF' }]}>{d.getDate()}</Text>
              </Pressable>
            ))}
          </View>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <TimeField label="Starts" value={start} onChange={setStart} placeholder="6:00 PM" />
            <TimeField label="Ends" value={end} onChange={setEnd} placeholder="10:00 PM" />
          </View>
        </View>
      </View>
    </View>
  );
}

// Sheet values from the time wheel sheets (S11b); the day strip and fields are the booking screen's (shift/new, P20a).
const st = StyleSheet.create({
  scrim: { flex: 1, backgroundColor: 'rgba(27,35,40,0.35)' },
  sheet: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingBottom: 34, paddingHorizontal: 20 },
  head: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingTop: 16, paddingBottom: 8 },
  btn: { width: 60, fontFamily: font.bodySemi, fontSize: 15, color: color.primary },
  title: { flex: 1, textAlign: 'center', fontFamily: font.displayBold, fontSize: 18, color: color.ink },
  body: { gap: 16, paddingTop: 8 },
  day: { flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: 14, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: color.line, gap: 2 },
  dayOn: { backgroundColor: color.primary, borderColor: color.primary },
  dow: { fontFamily: font.body, fontSize: 12, color: '#5F6D74' },
  num: { fontFamily: font.displayBold, fontSize: 17, color: color.ink, marginVertical: -3.62 },
});
