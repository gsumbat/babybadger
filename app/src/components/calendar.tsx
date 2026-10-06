// Week calendar shared by the parent and sitter Calendar tabs, translated from wireframe P6b (S6 is the same layout).
// Left out until built: the Day and Month views.
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { timeOf } from '@/lib/format';
import type { Shift } from '@/lib/types';
import { cardShadow, color, font } from '@/theme';

import { Icon } from './ui';

const sameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString();
const short = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

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

const PILL: Record<Shift['status'], { label: string; bg: string; fg: string; bar: string }> = {
  active: { label: 'On shift', bg: color.okTint, fg: color.okInk, bar: color.ok },
  scheduled: { label: 'Booked', bg: color.primaryTint, fg: color.primaryStrong, bar: color.primary },
  completed: { label: 'Done', bg: color.muted, fg: color.ink2, bar: color.primary },
  cancelled: { label: 'Cancelled', bg: color.badTint, fg: color.badInk, bar: color.bad },
};

export function WeekCalendar({
  shifts,
  title,
  sub,
  onOpen,
  emptyText,
  onEmpty,
}: {
  shifts: Shift[];
  title: (s: Shift) => string;
  sub?: (s: Shift) => string;
  onOpen: (s: Shift) => void;
  emptyText: string;
  onEmpty?: (day: Date) => void;
}) {
  const [day, setDay] = useState(() => new Date());
  const days = weekOf(day);
  const today = new Date();
  const live = shifts.filter((s) => s.status !== 'cancelled');
  const inWeek = live.filter((s) => days.some((d) => sameDay(d, new Date(s.starts_at))));
  const isThisWeek = days.some((d) => sameDay(d, today));
  const move = (n: number) => {
    const x = new Date(day);
    x.setDate(x.getDate() + n);
    setDay(x);
  };

  return (
    <>
      <View style={st.weekNav}>
        <Pressable accessibilityRole="button" accessibilityLabel="Previous week" onPress={() => move(-7)} style={st.arrow}>
          <Icon name="chevron-left" size={20} tint={color.ink} />
        </Pressable>
        <View style={{ flexGrow: 1, alignItems: 'center' }}>
          <Text style={st.range}>
            {short(days[0])} – {days[6].getMonth() === days[0].getMonth() ? days[6].getDate() : short(days[6])}
          </Text>
          <Text style={st.rangeSub}>
            {isThisWeek ? 'This week' : 'Week'} · {inWeek.length} {inWeek.length === 1 ? 'shift' : 'shifts'} booked
          </Text>
        </View>
        <Pressable accessibilityRole="button" accessibilityLabel="Next week" onPress={() => move(7)} style={st.arrow}>
          <Icon name="chevron-right" size={20} tint={color.ink} />
        </Pressable>
      </View>

      <View style={st.strip}>
        {days.map((d) => {
          const on = sameDay(d, day);
          const has = live.some((s) => sameDay(new Date(s.starts_at), d));
          return (
            <Pressable key={d.toISOString()} accessibilityRole="button" accessibilityState={{ selected: on }} onPress={() => setDay(d)} style={[st.cell, on && { backgroundColor: color.primary }]}>
              <Text style={[st.dow, on && { color: '#FFFFFF' }]}>{d.toLocaleDateString('en-US', { weekday: 'short' })}</Text>
              <Text style={[st.num, on && { color: '#FFFFFF' }]}>{d.getDate()}</Text>
              <View style={[st.dot, { backgroundColor: has ? (on ? '#FFFFFF' : color.primary) : 'transparent' }]} />
            </Pressable>
          );
        })}
      </View>

      {days.map((d) => {
        const list = live.filter((s) => sameDay(new Date(s.starts_at), d));
        const selected = sameDay(d, day);
        return (
          <View key={d.toISOString()} style={st.dayRow}>
            <View style={{ width: 56 }}>
              <Text style={st.dayDow}>{d.toLocaleDateString('en-US', { weekday: 'short' })}</Text>
              <Text style={st.dayNum}>{d.getDate()}</Text>
            </View>
            <View style={{ flexGrow: 1, flexShrink: 1, justifyContent: 'center', gap: 6 }}>
              {list.length ? (
                list.map((s) => {
                  const p = PILL[s.status];
                  return (
                    <Pressable key={s.id} accessibilityRole="button" onPress={() => onOpen(s)} style={[st.shift, selected && { borderWidth: 2, borderColor: color.primary }]}>
                      <View style={{ width: 5, backgroundColor: p.bar }} />
                      <View style={st.shiftBody}>
                        <View style={{ flexShrink: 1 }}>
                          <Text style={st.shiftTitle}>
                            {title(s)} · {timeOf(s.starts_at).replace(/\s?[AP]M$/i, '')} – {timeOf(s.ends_at)}
                          </Text>
                          {sub?.(s) ? <Text style={st.shiftSub}>{sub(s)}</Text> : null}
                        </View>
                        <View style={[st.pill, { backgroundColor: p.bg }]}>
                          <Text style={[st.pillText, { color: p.fg }]}>{p.label}</Text>
                        </View>
                      </View>
                    </Pressable>
                  );
                })
              ) : (
                <Pressable accessibilityRole="button" disabled={!onEmpty} onPress={() => onEmpty?.(d)} style={st.empty}>
                  <Text style={st.emptyText}>
                    {emptyText}
                    {onEmpty ? <Text style={{ fontFamily: font.bodyBold, color: color.primary }}> · Book</Text> : null}
                  </Text>
                </Pressable>
              )}
            </View>
          </View>
        );
      })}
    </>
  );
}

// Values from wireframe P6b.
const st = StyleSheet.create({
  weekNav: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  arrow: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: color.line, alignItems: 'center', justifyContent: 'center' },
  range: { fontFamily: font.displayBold, fontSize: 18, color: color.ink, marginVertical: -3.42 },
  rangeSub: { fontFamily: font.body, fontSize: 13, color: color.ink2 },
  strip: { flexDirection: 'row', gap: 2, padding: 4, backgroundColor: '#FFFFFF', borderRadius: 24, ...cardShadow },
  cell: { flex: 1, alignItems: 'center', gap: 3, paddingVertical: 6, borderRadius: 12 },
  dow: { fontFamily: font.body, fontSize: 12, color: '#5F6D74' },
  num: { fontFamily: font.displayBold, fontSize: 17, color: color.ink, marginVertical: -3.62 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  dayRow: { flexDirection: 'row', alignItems: 'stretch', gap: 10, minHeight: 52 },
  dayDow: { fontFamily: font.bodyMedium, fontSize: 12, color: '#5F6D74' },
  dayNum: { fontFamily: font.display, fontSize: 20, color: color.ink, marginVertical: -4.02 },
  shift: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderRadius: 14, borderWidth: 1, borderColor: color.line, overflow: 'hidden' },
  shiftBody: { flexGrow: 1, flexShrink: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, paddingVertical: 8, paddingHorizontal: 12 },
  shiftTitle: { fontFamily: font.bodySemi, fontSize: 14, color: color.ink },
  shiftSub: { fontFamily: font.body, fontSize: 12, color: color.ink2 },
  pill: { height: 22, paddingHorizontal: 8, borderRadius: 999, justifyContent: 'center' },
  pillText: { fontFamily: font.bodyBold, fontSize: 11 },
  empty: { minHeight: 40, borderRadius: 14, borderWidth: 1.5, borderStyle: 'dashed', borderColor: color.lineStrong, justifyContent: 'center', paddingHorizontal: 12 },
  emptyText: { fontFamily: font.body, fontSize: 13, color: color.ink2 },
});
