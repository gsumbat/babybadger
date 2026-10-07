import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Modal, Platform, Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';

import { DateNav, MonthCalendar, ViewSwitch, WeekStrip } from '@/components/calendar';
import { Text } from '@/components/Text';
import { TimeField } from '@/components/TimeField';
import { dayKey, monthTitle, sameDay, startOfDay, weekOf, weekTitle } from '@/lib/calendar-logic';
import { isPastDay, pickerCanGoBack, pickerMove, timeText, windowFrom, type DaySlot, type TimeWindow } from '@/lib/pool-logic';
import { color, font } from '@/theme';

// Shared by P54 (Sitters tab), P42 (Sitter pool) and P43 (Who's free): opening the pool for a time window or a week,
// the "Pick a time" sheet (canvas boards P54d / P54f / P54g) and the "Coming soon" note for finding new sitters (P48 isn't built).

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

/** P43 for the week around a day. */
export function openPoolWeek(day: Date, slot?: DaySlot) {
  router.push({ pathname: '/parent/pool-week', params: { week: dayKey(weekOf(day)[0]), day: dayKey(day), ...(slot ? { slot } : {}) } });
}

type Tab = 'today' | 'week' | 'month';

/** "Pick a time" (canvas boards P54d Today, P54f Week, P54g Month): the Calendar's switch labelled Today / Week / Month,
 * then the start and end on the time wheel. Week is the Calendar's day strip, Month its month grid; past days can't be
 * picked. From P54 it starts on Today, 6:00 – 10:00 PM; from P42's Change it starts on the window shown there. */
export function PickTimeSheet({ visible, initial, onClose, onPick }: { visible: boolean; initial?: TimeWindow; onClose: () => void; onPick: (w: TimeWindow) => void }) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      {/* Mounted only while open, so it starts from the current window each time. */}
      {visible ? <SheetBody initial={initial} onClose={onClose} onPick={onPick} /> : null}
    </Modal>
  );
}

function SheetBody({ initial, onClose, onPick }: { initial?: TimeWindow; onClose: () => void; onPick: (w: TimeWindow) => void }) {
  const { height } = useWindowDimensions();
  const [now] = useState(() => new Date());
  const today = startOfDay(now);
  const fromInitial = initial && !isPastDay(initial.start, now) ? startOfDay(initial.start) : today;
  const [tab, setTab] = useState<Tab>(sameDay(fromInitial, today) ? 'today' : 'week');
  const [day, setDay] = useState(fromInitial);
  const [start, setStart] = useState(initial ? timeText(initial.start) : '6:00 PM');
  const [end, setEnd] = useState(initial ? timeText(initial.end) : '10:00 PM');
  const picked = tab === 'today' ? today : day;
  const win = windowFrom(dayKey(picked), start, end);
  const past = (d: Date) => isPastDay(d, now);
  const full = (d: Date) => d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  const unit = tab === 'month' ? 'month' : 'week';
  const back = tab !== 'today' && pickerCanGoBack(day, unit, now) ? () => setDay(pickerMove(day, unit, -1, now)) : undefined;
  const next = () => setDay(pickerMove(day, unit, 1, now));
  const thisWeek = sameDay(weekOf(day)[0], weekOf(today)[0]);
  const nav =
    tab === 'today'
      ? { title: 'Today', sub: full(today) }
      : tab === 'week'
        ? { title: weekTitle(weekOf(day)), sub: `${thisWeek ? 'This week · ' : ''}${full(day)}` }
        : { title: monthTitle(day), sub: full(day) };

  return (
    <View style={st.scrim}>
      <Pressable style={{ flex: 1 }} accessibilityLabel="Close" onPress={onClose} />
      <View accessibilityRole="none" style={[st.sheet, { height: Math.round(height * 0.88) }]}>
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
        <ScrollView style={{ flex: 1 }} contentContainerStyle={st.body} showsVerticalScrollIndicator={false}>
          <ViewSwitch
            options={[
              { key: 'today', label: 'Today' },
              { key: 'week', label: 'Week' },
              { key: 'month', label: 'Month' },
            ]}
            value={tab}
            onChange={(t) => {
              setTab(t);
              if (t !== 'today' && past(day)) setDay(today);
            }}
          />
          <DateNav title={nav.title} sub={nav.sub} unit={unit} onPrev={tab === 'today' ? undefined : back} onNext={tab === 'today' ? undefined : next} />
          {tab === 'week' ? <WeekStrip day={day} onSelect={setDay} disabled={past} /> : null}
          {tab === 'month' ? <MonthCalendar variant="parent" day={day} today={today} shifts={[]} off={[]} dots={() => []} onOpenDay={setDay} disabled={past} /> : null}
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <TimeField label="Starts" value={start} onChange={setStart} placeholder="6:00 PM" />
            <TimeField label="Ends" value={end} onChange={setEnd} placeholder="10:00 PM" />
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

// Sheet values from the time wheel sheets (S11b); the switch, nav, strip and month grid are the Calendar's (P6a–c).
const st = StyleSheet.create({
  scrim: { flex: 1, backgroundColor: 'rgba(27,35,40,0.35)' },
  sheet: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 20 },
  head: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingTop: 16, paddingBottom: 8 },
  btn: { width: 60, fontFamily: font.bodySemi, fontSize: 15, color: color.primary },
  title: { flex: 1, textAlign: 'center', fontFamily: font.displayBold, fontSize: 18, color: color.ink },
  body: { gap: 16, paddingTop: 8, paddingBottom: 34 },
});
