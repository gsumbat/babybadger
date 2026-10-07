import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Hatch } from '@/components/calendar';
import { openPool } from '@/components/pool';
import { Text } from '@/components/Text';
import { ErrorText, Icon, Screen } from '@/components/ui';
import { addDays, dayKey, fromKey, sameDay, weekOf, weekTitle } from '@/lib/calendar-logic';
import { useQuery } from '@/lib/data';
import { firstName } from '@/lib/format';
import { cellKind, daySummary, poolData, SLOTS, slotTitle, slotWindow, statusFor, weekStart, type CellKind, type DaySlot } from '@/lib/pool';
import { askable } from '@/lib/pool-requests';
import { useSession } from '@/lib/session';
import { cardShadow, color, font } from '@/theme';

// Wireframe P43 Who's free, from app/src/wireframes/P43.tsx. Opened from P54's "This week" chip and P42's Week button
// (?week=YYYY-MM-DD the Monday, &day=YYYY-MM-DD the selected day, &slot=morning|afternoon|evening). ‹ › move a week.
// Mornings (8 AM – 12 PM) / Afternoons (12 – 5 PM) / Evenings (6 – 10 PM, the default) pick the window; each cell is the
// sitter's status for it from lib/pool-logic: Free (check), Part of it (½), Busy (dash: booked with this family, no hours
// that day or none set), Away (hatched: a day off). Tapping a day or a cell selects the day; the card under the grid
// ("Saturday evening · 2 free · 1 until 9:00 PM · 2 not free") opens P42 for it, as does tapping the selected day again.
// A sitter's name opens P11. Past days (and a slot that's over today) are dimmed and can't be picked.
// "Ask for Saturday evening" opens P45 for the selected day's window (only when someone in the pool is free or partly
// free then). Left out: the tab bar (pushed screen, like P42).
export default function PoolWeek() {
  const params = useLocalSearchParams<{ week?: string; day?: string; slot?: string }>();
  const { family } = useSession();
  const fid = family!.id;
  const [now] = useState(() => new Date());
  const monday = useMemo(() => weekStart(params.week, now), [params.week, now]);
  const days = weekOf(monday);
  const [slot, setSlot] = useState<DaySlot>(params.slot === 'morning' || params.slot === 'afternoon' ? params.slot : 'evening');
  const [picked, setPicked] = useState<Date>(() => (params.day ? fromKey(params.day) : now));

  const { data, error } = useQuery(() => poolData(fid), [fid]);
  const active = (data?.sitters ?? []).filter((s) => s.status === 'active');

  const windows = days.map((d) => slotWindow(d, slot, now));
  const open = (i: number) => windows[i] !== null;
  // The selected day: the picked one when it's in this week and still open, else the first open day.
  let sel = days.findIndex((d) => sameDay(d, picked));
  if (sel < 0 || !open(sel)) sel = windows.findIndex((w) => w);
  const selWin = sel >= 0 ? windows[sel] : null;

  const cell = (sitterId: string, i: number): CellKind | null => {
    const w = windows[i];
    return w && data ? cellKind(statusFor(data, sitterId, w)) : null;
  };

  function tap(i: number) {
    if (!open(i)) return;
    if (i === sel && windows[i]) openPool(windows[i]!);
    else setPicked(days[i]);
  }
  // ‹ › keep the selected weekday (Sat 10 -> Sat 17).
  function move(n: number) {
    const next = addDays(monday, 7 * n);
    const day = addDays(sel >= 0 ? days[sel] : monday, 7 * n);
    router.setParams({ week: dayKey(next), day: dayKey(day) });
    setPicked(day);
  }
  const canGoBack = +monday > +weekOf(now)[0];
  const canAsk = !!selWin && !!data && active.some((s) => askable(statusFor(data, s.sitter_id, selWin)));

  return (
    <Screen
      gap={12}
      footer={
        canAsk && selWin ? (
          <Pressable accessibilityRole="button" onPress={() => router.push({ pathname: '/parent/pool-ask', params: { start: selWin.start.toISOString(), end: selWin.end.toISOString() } })} style={st.askBtn}>
            <Text style={st.askText}>Ask for {slotTitle(days[sel], slot)}</Text>
          </Pressable>
        ) : undefined
      }
      header={
        <View style={st.header}>
          <Pressable accessibilityRole="button" accessibilityLabel="Back" onPress={() => (router.canGoBack() ? router.back() : router.replace('/parent/sitters'))} style={st.back}>
            <Icon name="chevron-left" size={22} tint={color.ink} strokeWidth={2} />
          </Pressable>
          <View style={{ flexGrow: 1, flexShrink: 1, minWidth: 0 }}>
            <Text style={st.title}>Who’s free</Text>
            <Text style={st.headSub}>Your pool · {weekTitle(days)}</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 8, flexShrink: 0 }}>
            <Pressable accessibilityRole="button" accessibilityLabel="Previous week" accessibilityState={{ disabled: !canGoBack }} disabled={!canGoBack} onPress={() => move(-1)} style={[st.arrow, !canGoBack && { opacity: 0.4 }]}>
              <Icon name="chevron-left" size={18} tint={color.ink} strokeWidth={2.2} />
            </Pressable>
            <Pressable accessibilityRole="button" accessibilityLabel="Next week" onPress={() => move(1)} style={st.arrow}>
              <Icon name="chevron-right" size={18} tint={color.ink} strokeWidth={2.2} />
            </Pressable>
          </View>
        </View>
      }>
      <ErrorText>{error}</ErrorText>

      <View style={st.switch}>
        {(Object.keys(SLOTS) as DaySlot[]).map((k) => {
          const on = k === slot;
          return (
            <Pressable key={k} accessibilityRole="button" accessibilityState={{ selected: on }} onPress={() => setSlot(k)} style={[st.switchItem, on && { backgroundColor: '#FFFFFF' }]}>
              <Text style={on ? st.switchOn : st.switchOff}>{SLOTS[k].label}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={st.grid}>
        <View style={st.gridRow}>
          <View style={st.nameCol} />
          {days.map((d, i) => {
            const on = i === sel;
            return (
              <Pressable key={i} accessibilityRole="button" accessibilityState={{ selected: on, disabled: !open(i) }} disabled={!open(i)} onPress={() => tap(i)} style={[st.dayHead, !open(i) && { opacity: 0.4 }]}>
                <Text style={[st.dow, on && { color: color.primary, fontFamily: font.bodyBold }]}>{d.toLocaleDateString('en-US', { weekday: 'short' })}</Text>
                <Text style={[st.dnum, on && { color: color.primary }]}>{d.getDate()}</Text>
              </Pressable>
            );
          })}
        </View>
        {active.map((s, r) => (
          <View key={s.sitter_id} style={[st.gridRow, { alignItems: 'center' }]}>
            <Pressable accessibilityRole="button" onPress={() => router.push({ pathname: '/parent/sitter/[id]', params: { id: s.sitter_id } })} style={[st.nameCol, st.name]}>
              <View style={[st.avatar, { backgroundColor: AVATAR[(data?.sitters.indexOf(s) ?? r) % AVATAR.length] }]}>
                <Text style={st.avatarText}>{(s.profile?.full_name || '?')[0].toUpperCase()}</Text>
              </View>
              <Text style={st.nameText} numberOfLines={1}>
                {firstName(s.profile?.full_name)}
              </Text>
            </Pressable>
            {days.map((d, i) => (
              <Pressable key={i} accessibilityRole="button" accessibilityLabel={`${firstName(s.profile?.full_name)}, ${d.toLocaleDateString('en-US', { weekday: 'long' })}`} disabled={!open(i)} onPress={() => tap(i)} style={{ flex: 1, minWidth: 0 }}>
                <Cell kind={cell(s.sitter_id, i)} selected={i === sel} />
              </Pressable>
            ))}
          </View>
        ))}
        {data && !active.length ? <Text style={st.sub}>No sitters in your pool have signed yet.</Text> : null}
      </View>

      <View style={st.legend}>
        {LEGEND.map(([k, label]) => (
          <View key={k} style={st.legendItem}>
            <View style={{ width: 18 }}>
              <Cell kind={k} small />
            </View>
            <Text style={st.legendText}>{label}</Text>
          </View>
        ))}
      </View>

      {selWin && data && active.length ? (
        <Pressable accessibilityRole="button" onPress={() => openPool(selWin)} style={st.card}>
          <View style={st.cardIcon}>
            <Icon name="users" size={22} />
          </View>
          <View style={{ flexGrow: 1, flexShrink: 1 }}>
            <Text style={st.cardTitle}>{slotTitle(days[sel], slot)}</Text>
            <Text style={st.sub}>
              {daySummary(
                active.map((s) => statusFor(data, s.sitter_id, selWin)),
                selWin,
              )}
            </Text>
          </View>
          <Icon name="chevron-right" size={20} tint={color.ink2} />
        </Pressable>
      ) : null}
      {data && sel < 0 ? <Text style={st.sub}>This week is over. Use › to see next week.</Text> : null}

      <Text style={st.note}>Sitters set their own availability in their app. You only see free or busy, never where they are booked.</Text>
    </Screen>
  );
}

const LEGEND: [CellKind, string][] = [
  ['free', 'Free'],
  ['part', 'Part of it'],
  ['busy', 'Busy'],
  ['away', 'Away'],
];

/** One P43 cell (also the legend swatch, 14 px tall). null = past day or a slot that's over. */
function Cell({ kind, selected, small }: { kind: CellKind | null; selected?: boolean; small?: boolean }) {
  const h = small ? 14 : 34;
  return (
    <View style={[st.cell, { height: h }, kind === 'free' && { backgroundColor: color.primaryTint }, kind === 'busy' && { backgroundColor: color.muted }, !kind && { backgroundColor: color.canvas }, selected && st.cellOn]}>
      {kind === 'part' ? (
        <View style={[StyleSheet.absoluteFill, { flexDirection: 'row' }]}>
          <View style={{ flex: 1, backgroundColor: color.primaryTint }} />
          <View style={{ flex: 1, backgroundColor: color.muted }} />
        </View>
      ) : null}
      {kind === 'away' ? <Hatch a={color.muted} b="#FFFFFF" stripe={4.5} /> : null}
      {kind === 'free' ? <Icon name="check" size={16} tint={color.primaryStrong} strokeWidth={2.4} /> : null}
      {kind === 'part' ? <Text style={st.half}>½</Text> : null}
      {kind === 'busy' ? <View style={st.dash} /> : null}
    </View>
  );
}

// Same avatar colors as the Sitters tab (P54) and P42, by the sitter's place in the pool.
const AVATAR = [color.primary, '#5E7F6A', '#8A6A4E', '#6F6194', '#5F6D74'];

// Values from wireframe P43 (header 8 at the bottom + Screen's 4 = the wireframe's 8 + main's 4).
const st = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingTop: 16, paddingHorizontal: 20, paddingBottom: 8 },
  back: { width: 44, height: 44, borderRadius: 22, borderWidth: 1, borderColor: color.line, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  title: { fontFamily: font.display, fontSize: 22, color: color.ink, marginVertical: -4.62 },
  headSub: { fontFamily: font.body, fontSize: 13, color: color.ink2 },
  arrow: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: color.line, alignItems: 'center', justifyContent: 'center' },
  switch: { flexDirection: 'row', gap: 4, padding: 4, backgroundColor: color.muted, borderRadius: 999 },
  switchItem: { flex: 1, minWidth: 0, height: 34, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  switchOn: { fontFamily: font.bodyBold, fontSize: 13, color: color.ink },
  switchOff: { fontFamily: font.bodyMedium, fontSize: 13, color: color.ink2 },
  grid: { gap: 10, paddingVertical: 14, paddingHorizontal: 12, backgroundColor: '#FFFFFF', borderRadius: 24, ...cardShadow },
  gridRow: { flexDirection: 'row', gap: 5 },
  nameCol: { width: 92, flexShrink: 0 },
  dayHead: { flex: 1, minWidth: 0, alignItems: 'center' },
  dow: { fontFamily: font.body, fontSize: 11, color: color.ink2 },
  dnum: { fontFamily: font.bodyBold, fontSize: 14, color: color.ink },
  name: { flexDirection: 'row', alignItems: 'center', gap: 6, minWidth: 0 },
  avatar: { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  avatarText: { fontFamily: font.displayBold, fontSize: 11, color: '#FFFFFF' },
  nameText: { flexShrink: 1, fontFamily: font.bodySemi, fontSize: 13, color: color.ink },
  cell: { borderRadius: 10, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  cellOn: { borderWidth: 2, borderColor: color.primary },
  half: { fontFamily: font.bodyBold, fontSize: 10, color: color.primaryStrong },
  dash: { width: 10, height: 2, borderRadius: 1, backgroundColor: '#9AA6B2' },
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendText: { fontFamily: font.body, fontSize: 12, color: color.ink2 },
  card: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, backgroundColor: '#FFFFFF', borderRadius: 24, ...cardShadow },
  cardIcon: { width: 40, height: 40, borderRadius: 14, backgroundColor: color.primaryTint, alignItems: 'center', justifyContent: 'center' },
  cardTitle: { fontFamily: font.bodyBold, fontSize: 15, color: color.ink },
  sub: { fontFamily: font.body, fontSize: 13, color: color.ink2 },
  note: { fontFamily: font.body, fontSize: 13, lineHeight: 19, color: color.ink2 },
  askBtn: { height: 52, borderRadius: 999, backgroundColor: color.primary, alignItems: 'center', justifyContent: 'center' },
  askText: { fontFamily: font.displayBold, fontSize: 17, color: '#FFFFFF' },
});
