// Calendar pieces shared by the parent and sitter Calendar tabs (wireframes P6b, S6).
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { dayOf, timeOf } from '@/lib/format';
import type { Shift } from '@/lib/types';
import { cardShadow, color, font, radius } from '@/theme';

import { Icon, Label, Pill, T } from './ui';

const sameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString();

function weekOf(d: Date) {
  const start = new Date(d);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7)); // Monday
  return Array.from({ length: 7 }, (_, i) => {
    const x = new Date(start);
    x.setDate(start.getDate() + i);
    return x;
  });
}

export function WeekStrip({ day, onDay, shifts }: { day: Date; onDay: (d: Date) => void; shifts: Shift[] }) {
  const days = weekOf(day);
  const today = new Date();
  const shift = (n: number) => {
    const x = new Date(day);
    x.setDate(x.getDate() + n);
    onDay(x);
  };
  return (
    <View style={st.wrap}>
      <View style={st.monthRow}>
        <Pressable accessibilityLabel="Previous week" onPress={() => shift(-7)} style={st.arrow}>
          <Icon name="chevron-left" size={18} tint={color.ink} />
        </Pressable>
        <Text style={st.month}>{day.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</Text>
        <Pressable accessibilityLabel="Next week" onPress={() => shift(7)} style={st.arrow}>
          <Icon name="chevron-right" size={18} tint={color.ink} />
        </Pressable>
      </View>
      <View style={st.days}>
        {days.map((d) => {
          const on = sameDay(d, day);
          const has = shifts.some((s) => s.status !== 'cancelled' && sameDay(new Date(s.starts_at), d));
          return (
            <Pressable key={d.toISOString()} accessibilityRole="button" accessibilityState={{ selected: on }} onPress={() => onDay(d)} style={[st.day, on && st.dayOn, !on && sameDay(d, today) && st.dayToday]}>
              <Text style={[st.dow, on && { color: '#FFFFFF' }]}>{d.toLocaleDateString('en-US', { weekday: 'short' })}</Text>
              <Text style={[st.num, on && { color: '#FFFFFF' }]}>{d.getDate()}</Text>
              <View style={[st.dot, { backgroundColor: has ? (on ? '#FFFFFF' : color.primary) : 'transparent' }]} />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const PILL: Record<Shift['status'], { label: string; kind: 'ok' | 'info' | 'muted' | 'bad' }> = {
  active: { label: 'On shift', kind: 'ok' },
  scheduled: { label: 'Booked', kind: 'info' },
  completed: { label: 'Done', kind: 'muted' },
  cancelled: { label: 'Cancelled', kind: 'bad' },
};

export function ShiftList({ shifts, day, title, onOpen, empty }: { shifts: Shift[]; day: Date; title: (s: Shift) => string; onOpen: (s: Shift) => void; empty: string }) {
  const now = new Date();
  const onDay = shifts.filter((s) => sameDay(new Date(s.starts_at), day));
  const later = shifts.filter((s) => (s.status === 'scheduled' || s.status === 'active') && new Date(s.ends_at) > now && !sameDay(new Date(s.starts_at), day)).slice(0, 8);
  const row = (s: Shift, showDay: boolean) => (
    <Pressable key={s.id} onPress={() => onOpen(s)} style={({ pressed }) => [st.shift, pressed && { opacity: 0.85 }]}>
      <View style={{ flex: 1 }}>
        <Text style={st.shiftTitle}>{showDay ? `${dayOf(s.starts_at)} · ${title(s)}` : title(s)}</Text>
        <T variant="muted">
          {timeOf(s.starts_at)} – {timeOf(s.ends_at)}
        </T>
      </View>
      <Pill {...PILL[s.status]} />
    </Pressable>
  );
  return (
    <>
      <Label>{day.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</Label>
      {onDay.length ? onDay.map((s) => row(s, false)) : <T variant="muted">{empty}</T>}
      {later.length > 0 && (
        <>
          <Label>Coming up</Label>
          {later.map((s) => row(s, true))}
        </>
      )}
    </>
  );
}

const st = StyleSheet.create({
  wrap: { gap: 8 },
  monthRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  arrow: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: color.line, alignItems: 'center', justifyContent: 'center' },
  month: { fontFamily: font.bodyBold, fontSize: 15, color: color.ink },
  days: { flexDirection: 'row', gap: 4 },
  day: { flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: 14, gap: 2 },
  dayOn: { backgroundColor: color.primary },
  dayToday: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: color.line },
  dow: { fontFamily: font.body, fontSize: 12, color: color.ink2 },
  num: { fontFamily: font.bodyBold, fontSize: 17, color: color.ink },
  dot: { width: 5, height: 5, borderRadius: 3 },
  shift: { backgroundColor: color.surface, borderRadius: radius.card, padding: 14, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 12, ...cardShadow },
  shiftTitle: { fontFamily: font.bodyBold, fontSize: 15, color: color.ink },
});
