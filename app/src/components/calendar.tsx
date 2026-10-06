// Calendar views shared by the parent and sitter Calendar tabs, translated from wireframes P6a / P6b / P6c (parent:
// Day / Week / Month) and S6a / S6 / S6c (sitter). The tab screens own the selected date and the view, so switching
// views keeps the date (P6 logic note).
import { type ReactNode, useId } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Svg, { Defs, Pattern, Rect } from 'react-native-svg';

import { type CalendarView, type DateRange, bookingSlot, dayWindow, hourOf, inRanges, monthGrid, sameDay, shiftsOn, weekOf } from '@/lib/calendar-logic';
import { timeOf } from '@/lib/format';
import type { Shift, Task } from '@/lib/types';
import { cardShadow, color, font } from '@/theme';

import { Icon } from './ui';
import { Text } from '@/components/Text';

const PILL: Record<Shift['status'], { label: string; bg: string; fg: string; bar: string }> = {
  active: { label: 'On shift', bg: color.okTint, fg: color.okInk, bar: color.ok },
  scheduled: { label: 'Confirmed', bg: color.okTint, fg: color.okInk, bar: color.primary }, // P6b, P4b: a booked shift reads "Confirmed" in green
  completed: { label: 'Done', bg: color.muted, fg: color.ink2, bar: color.primary },
  cancelled: { label: 'Cancelled', bg: color.badTint, fg: color.badInk, bar: color.bad },
};

export type PillLook = { label: string; bg: string; fg: string; dot?: string };

/** The status pill a parent sees on a shift (P6a / P6b / P6c). */
export function statusPill(s: Shift): PillLook {
  const p = PILL[s.status];
  return { label: p.label, bg: p.bg, fg: p.fg, dot: s.status === 'active' ? color.ok : undefined };
}

/** "3:00 – 7:00 PM": the shared AM/PM written once, as the wireframes do. */
export function spanText(s: Pick<Shift, 'starts_at' | 'ends_at'>) {
  const a = timeOf(s.starts_at);
  const b = timeOf(s.ends_at);
  const same = a.slice(-2) === b.slice(-2);
  return `${same ? a.replace(/\s?[AP]M$/i, '') : a} – ${b}`;
}

// ---------------------------------------------------------------- header (title row, Day/Week/Month, date nav)

/** P6a–c / S6a–c header: "Calendar" + the right button, the Day / Week / Month switch, then the date nav. */
export function CalendarHeader({ right, view, onView, title, sub, onPrev, onNext, unit }: { right: ReactNode; view: CalendarView; onView: (v: CalendarView) => void; title: string; sub: string; onPrev: () => void; onNext: () => void; unit: string }) {
  return (
    <View style={st.head}>
      <View style={st.titleRow}>
        <Text style={st.title}>Calendar</Text>
        {right}
      </View>
      <View style={st.switch}>
        {(['day', 'week', 'month'] as const).map((v) => {
          const on = v === view;
          return (
            <Pressable key={v} accessibilityRole="button" accessibilityState={{ selected: on }} onPress={() => onView(v)} style={[st.switchItem, on && { backgroundColor: '#FFFFFF' }]}>
              <Text style={on ? st.switchOn : st.switchOff}>{v === 'day' ? 'Day' : v === 'week' ? 'Week' : 'Month'}</Text>
            </Pressable>
          );
        })}
      </View>
      <View style={st.nav}>
        <Pressable accessibilityRole="button" accessibilityLabel={`Previous ${unit}`} onPress={onPrev} style={st.arrow}>
          <Icon name="chevron-left" size={18} tint={color.ink} strokeWidth={2.2} />
        </Pressable>
        <View style={{ flexGrow: 1, flexShrink: 1, alignItems: 'center' }}>
          <Text style={st.range}>{title}</Text>
          <Text style={st.rangeSub}>{sub}</Text>
        </View>
        <Pressable accessibilityRole="button" accessibilityLabel={`Next ${unit}`} onPress={onNext} style={st.arrow}>
          <Icon name="chevron-right" size={18} tint={color.ink} strokeWidth={2.2} />
        </Pressable>
      </View>
    </View>
  );
}

/** P6a–c "+ Book" (filled) and S6a–c "+ Time off" (tint) header buttons. */
export function HeaderButton({ label, onPress, tint }: { label: string; onPress: () => void; tint?: boolean }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={[st.headBtn, { backgroundColor: tint ? color.primaryTint : color.primary }]}>
      <Icon name="plus" size={16} tint={tint ? color.primary : '#FFFFFF'} strokeWidth={2.6} />
      <Text style={[st.headBtnText, { color: tint ? color.primary : '#FFFFFF' }]}>{label}</Text>
    </Pressable>
  );
}

// ---------------------------------------------------------------- hatching (time off: S6, S6c, P6c)

/** Diagonal stripes (the wireframes' repeating-linear-gradient), filling the parent. */
export function Hatch({ a, b, stripe }: { a: string; b: string; stripe: number }) {
  const id = `h${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  return (
    <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
      <Defs>
        <Pattern id={id} patternUnits="userSpaceOnUse" width={stripe * 2} height={stripe * 2} patternTransform="rotate(45)">
          <Rect x={0} y={0} width={stripe} height={stripe * 2} fill={a} />
          <Rect x={stripe} y={0} width={stripe} height={stripe * 2} fill={b} />
        </Pattern>
      </Defs>
      <Rect x={0} y={0} width="100%" height="100%" fill={`url(#${id})`} />
    </Svg>
  );
}

function LegendItem({ swatch, label }: { swatch: ReactNode; label: string }) {
  return (
    <View style={st.legendItem}>
      {swatch}
      <Text style={st.legendText}>{label}</Text>
    </View>
  );
}

// ---------------------------------------------------------------- week (P6b / S6)

export function WeekCalendar({
  shifts,
  day,
  onSelect,
  title,
  sub,
  onOpen,
  emptyText,
  onEmpty,
  offDays = [],
  offText,
  onOff,
}: {
  shifts: Shift[];
  day: Date;
  /** Tapping a day in the strip: parents select it (P6b), sitters open it in Day (S6). */
  onSelect: (d: Date) => void;
  title: (s: Shift) => string;
  sub?: (s: Shift) => string;
  onOpen: (s: Shift) => void;
  emptyText: string;
  onEmpty?: (day: Date) => void;
  /** Sitter time off: an empty day inside it reads "Time off · all day" (S6). */
  offDays?: DateRange[];
  offText?: string;
  onOff?: () => void;
}) {
  const days = weekOf(day);
  const live = shifts.filter((s) => s.status !== 'cancelled');

  return (
    <>
      <View style={st.strip}>
        {days.map((d) => {
          const on = sameDay(d, day);
          const has = live.some((s) => sameDay(new Date(s.starts_at), d));
          return (
            <Pressable key={d.toISOString()} accessibilityRole="button" accessibilityState={{ selected: on }} onPress={() => onSelect(d)} style={[st.cell, on && { backgroundColor: color.primary }]}>
              <Text style={[st.dow, on && { color: '#FFFFFF' }]}>{d.toLocaleDateString('en-US', { weekday: 'short' })}</Text>
              <Text style={[st.num, on && { color: '#FFFFFF' }]}>{d.getDate()}</Text>
              <View style={[st.dot, { backgroundColor: has ? (on ? '#FFFFFF' : color.primary) : 'transparent' }]} />
            </Pressable>
          );
        })}
      </View>

      {days.map((d) => {
        const list = shiftsOn(live, d);
        const selected = sameDay(d, day);
        const off = offText && inRanges(d, offDays);
        return (
          <View key={d.toISOString()} style={st.dayRow}>
            <View style={{ width: 56 }}>
              <Text style={st.dayDow}>{d.toLocaleDateString('en-US', { weekday: 'short' })}</Text>
              <Text style={st.dayNum}>{d.getDate()}</Text>
            </View>
            <View style={{ flexGrow: 1, flexShrink: 1, justifyContent: 'center', gap: 6 }}>
              {list.map((s) => {
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
              })}
              {!list.length && off ? (
                // S6: a day off is a plain outlined box that opens Availability (S11).
                <Pressable accessibilityRole="button" disabled={!onOff} onPress={onOff} style={st.offBox}>
                  <Text style={st.offText}>{offText}</Text>
                </Pressable>
              ) : null}
              {!list.length && !off ? (
                <Pressable accessibilityRole="button" disabled={!onEmpty} onPress={() => onEmpty?.(d)} style={st.empty}>
                  <Text style={st.emptyText}>
                    {emptyText}
                    {onEmpty ? <Text style={{ fontFamily: font.bodyBold, color: color.primary }}> · Book</Text> : null}
                  </Text>
                </Pressable>
              ) : null}
            </View>
          </View>
        );
      })}
    </>
  );
}

// ---------------------------------------------------------------- day (P6a / S6a)

export type BlockLook = { bg: string; border: string; borderWidth: number; subInk: string; dot: string };

const hourText = (h: number) => `${h % 12 || 12} ${h % 24 < 12 ? 'AM' : 'PM'}`;

export function DayCalendar({
  day,
  shifts,
  now,
  hourH,
  look,
  title,
  sub,
  pill,
  tasks = {},
  taskTimes,
  note,
  onOpen,
  book,
}: {
  day: Date;
  /** Every shift; the ones starting on `day` are drawn. */
  shifts: Shift[];
  now: Date;
  /** Pixels per hour: 56 in P6a, 52 in S6a. */
  hourH: number;
  look: (s: Shift) => BlockLook;
  title: (s: Shift) => string;
  sub: (s: Shift) => string;
  pill: (s: Shift) => PillLook | null;
  tasks?: Record<string, Task[]>;
  /** S6a starts each task line with its time ("3:15 Pick up Ava"); P6a doesn't. */
  taskTimes?: boolean;
  /** A line under the header when the shift has no timed tasks (S6a "Clock-in opens 7:15 PM at their door"). */
  note?: (s: Shift) => string;
  onOpen: (s: Shift) => void;
  /** P6a's dashed "+ Book a sitter for tonight" box in the next free slot. */
  book?: (slot: { from: number; to: number }) => { label: string; onPress: () => void };
}) {
  const list = shiftsOn(shifts, day);
  const win = dayWindow(list, day);
  const midnight = new Date(day);
  midnight.setHours(0, 0, 0, 0);
  const y = (h: number) => (h - win.from) * hourH;
  const height = (win.to - win.from) * hourH + 8;
  const hours = Array.from({ length: win.to - win.from + 1 }, (_, i) => win.from + i);
  const slot = book ? bookingSlot(list, day, win, now) : null;
  const booking = slot && book ? book(slot) : null;
  const nowH = hourOf(now);
  const showNow = sameDay(day, now) && nowH >= win.from && nowH <= win.to;

  return (
    <View style={{ height, marginTop: 10 }}>
      {hours.map((h) => (
        <View key={h} style={[st.hourRow, { top: y(h) }]}>
          <View style={{ width: 40, marginTop: -8 }}>
            <Text style={st.hourText}>{hourText(h)}</Text>
          </View>
          <View style={st.hourLine} />
        </View>
      ))}

      {list.map((s) => {
        const start = (+new Date(s.starts_at) - +midnight) / 36e5;
        const end = (+new Date(s.ends_at) - +midnight) / 36e5;
        const h = Math.max(hourH / 2, (Math.min(end, win.to) - start) * hourH);
        const lk = look(s);
        const p = pill(s);
        const timed = (tasks[s.id] ?? []).filter((t) => t.due_at).sort((a, b) => a.due_at!.localeCompare(b.due_at!));
        let prev = 30;
        const lines = timed
          .map((t) => {
            const top = Math.max((+new Date(t.due_at!) - +new Date(s.starts_at)) / 36e5 * hourH, prev + 24, 56);
            prev = top;
            return { t, top };
          })
          .filter((l) => l.top <= h - 20);
        const extra = !lines.length ? note?.(s) : '';
        return (
          <Pressable key={s.id} accessibilityRole="button" onPress={() => onOpen(s)} style={[st.block, { top: y(start), height: h, backgroundColor: lk.bg, borderColor: lk.border, borderWidth: lk.borderWidth }]}>
            <View style={st.blockHead}>
              <View style={{ flexShrink: 1 }}>
                <Text style={st.blockTitle} numberOfLines={1}>
                  {title(s)} · {spanText(s)}
                </Text>
                {sub(s) ? (
                  <Text style={[st.blockSub, { color: lk.subInk }]} numberOfLines={1}>
                    {sub(s)}
                  </Text>
                ) : null}
              </View>
              {p ? (
                <View style={[st.blockPill, { backgroundColor: p.bg }]}>
                  {p.dot ? <View style={[st.pillDot, { backgroundColor: p.dot }]} /> : null}
                  <Text style={[st.blockPillText, { color: p.fg }]}>{p.label}</Text>
                </View>
              ) : null}
            </View>
            {extra ? <Text style={st.blockNote}>{extra}</Text> : null}
            {lines.map(({ t, top }) => (
              <View key={t.id} style={[st.taskLine, { top }]}>
                <View style={[st.taskDot, { backgroundColor: lk.dot }]} />
                <Text style={st.taskText} numberOfLines={1}>
                  {taskTimes ? `${timeOf(t.due_at!).replace(/\s?[AP]M$/i, '')} ` : ''}
                  {t.title}
                </Text>
              </View>
            ))}
          </Pressable>
        );
      })}

      {showNow ? (
        <View style={[st.nowRow, { top: y(nowH) - 5 }]} pointerEvents="none">
          <View style={st.nowDot} />
          <View style={st.nowLine} />
        </View>
      ) : null}

      {booking && slot ? (
        <Pressable accessibilityRole="button" onPress={booking.onPress} style={[st.bookBox, { top: y(slot.from) + 6, height: Math.min((slot.to - slot.from) * hourH, height - y(slot.from) - 6) }]}>
          <Text style={st.bookText}>{booking.label}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

// ---------------------------------------------------------------- month (P6c / S6c)

export function MonthCalendar({
  variant,
  day,
  today,
  shifts,
  off,
  dots,
  onOpenDay,
}: {
  variant: 'parent' | 'sitter';
  day: Date;
  today: Date;
  shifts: Shift[];
  /** Days drawn hatched: parents see their sitters' time off (P6c), sitters their own (S6c). */
  off: DateRange[];
  /** Dot colors for a day: one per family for sitters (S6c), one "Booked" dot for parents (P6c). */
  dots: (list: Shift[]) => string[];
  /** Tapping a day opens it in Day (P6 / S6 logic notes). */
  onOpenDay: (d: Date) => void;
}) {
  const weeks = monthGrid(day);
  const sitter = variant === 'sitter';
  const m = day.getMonth();
  const grid = (
    <>
      <View style={{ flexDirection: 'row', gap: sitter ? 0 : 2 }}>
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((l, i) => (
          <View key={i} style={{ flex: 1, minWidth: 0 }}>
            <Text style={[st.letter, { fontFamily: sitter ? font.bodyBold : font.bodySemi }]}>{l}</Text>
          </View>
        ))}
      </View>
      <View style={{ gap: sitter ? 4 : 2 }}>
        {weeks.map((w) => (
          <View key={w[0].toISOString()} style={{ flexDirection: 'row', gap: sitter ? 4 : 2 }}>
            {w.map((d) => {
              const inMonth = d.getMonth() === m;
              const sel = inMonth && sameDay(d, day);
              const isToday = sameDay(d, today);
              const isOff = inMonth && inRanges(d, off);
              const colors = dots(shiftsOn(shifts, d)).slice(0, 3);
              if (!inMonth)
                return (
                  <View key={d.toISOString()} style={[sitter ? st.mCellS : st.mCellP, { borderWidth: 0 }]}>
                    <Text style={[st.mNum, { color: sitter ? '#B4BEC2' : '#7F8C91' }]}>{d.getDate()}</Text>
                    {!sitter && colors.length ? <View style={[st.mDotP, { backgroundColor: '#9AA8AE' }]} /> : null}
                  </View>
                );
              return (
                <Pressable
                  key={d.toISOString()}
                  accessibilityRole="button"
                  accessibilityState={{ selected: sel }}
                  accessibilityLabel={d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                  onPress={() => onOpenDay(d)}
                  style={[
                    sitter ? st.mCellS : st.mCellP,
                    sitter && !isOff && { backgroundColor: '#FFFFFF' },
                    !sitter && { borderWidth: 0 },
                    isToday && !sel && { borderWidth: 2, borderColor: color.primary },
                    sel && { backgroundColor: color.primary, borderWidth: 0 },
                  ]}>
                  {isOff && !sel ? <Hatch a="#EEF1F4" b="#F3F5F8" stripe={4} /> : null}
                  <Text
                    style={[
                      st.mNum,
                      sitter ? { fontFamily: font.bodySemi, color: isOff ? '#5F6D74' : color.ink } : { color: color.ink },
                      (sel || (isToday && !sitter)) && { fontFamily: font.bodyBold },
                      sel && { color: '#FFFFFF' },
                    ]}>
                    {d.getDate()}
                  </Text>
                  {sitter ? (
                    <View style={{ flexDirection: 'row', gap: 3 }}>
                      {colors.map((c, i) => (
                        <View key={i} style={[st.mDotS, { backgroundColor: c }, sel && cardShadow]} />
                      ))}
                    </View>
                  ) : colors.length ? (
                    <View style={[st.mDotP, { backgroundColor: sel ? '#FFFFFF' : colors[0] }]} />
                  ) : null}
                </Pressable>
              );
            })}
          </View>
        ))}
      </View>
    </>
  );
  // P6c draws the grid on a white card; S6c puts white day cells straight on the canvas.
  return sitter ? <View>{grid}</View> : <View style={st.monthCard}>{grid}</View>;
}

/** Month legend (P6c "Booked · Maya away", S6c "Lee · Ortiz · Off"). */
export function MonthLegend({ items, offLabel, sitter }: { items: { color: string; label: string }[]; offLabel: string[]; sitter?: boolean }) {
  if (!items.length && !offLabel.length) return null;
  const size = sitter ? 9 : 8;
  return (
    <View style={st.legend}>
      {items.map((i) => (
        <LegendItem key={i.label} label={i.label} swatch={<View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: i.color }} />} />
      ))}
      {offLabel.map((l) => (
        <LegendItem
          key={l}
          label={l}
          swatch={
            <View style={{ width: sitter ? 12 : 14, height: sitter ? 9 : 10, borderRadius: 3, overflow: 'hidden' }}>
              {sitter ? <Hatch a="#C3CCD5" b="#EEF1F4" stripe={2} /> : <Hatch a="#E6EAEF" b="#F3F5F8" stripe={3} />}
            </View>
          }
        />
      ))}
    </View>
  );
}

/** P6c's card under the month for a shift on the selected day ("Sat, Oct 3 · Maya · 6:00 – 7:00 PM · Waiting"). */
export function DayShiftCard({ shift, title, pill, onPress }: { shift: Shift; title: string; pill: PillLook; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={st.dayCard}>
      <View style={{ flexShrink: 1 }}>
        <Text style={st.dayCardDate}>{new Date(shift.starts_at).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</Text>
        <Text style={st.dayCardTitle}>
          {title} · {spanText(shift)}
        </Text>
      </View>
      <View style={[st.dayCardPill, { backgroundColor: pill.bg }]}>
        <Text style={[st.dayCardPillText, { color: pill.fg }]}>{pill.label}</Text>
      </View>
    </Pressable>
  );
}

// Values from wireframes P6a / P6b / P6c and S6 / S6a / S6c.
const st = StyleSheet.create({
  // Header: 20 top, 10 bottom in the wireframes; Screen's content adds 4, so 6 here.
  head: { gap: 12, paddingTop: 20, paddingHorizontal: 20, paddingBottom: 6 },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { flexShrink: 1, fontFamily: font.display, fontSize: 24, color: color.ink },
  headBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, height: 40, paddingHorizontal: 14, borderRadius: 999 },
  headBtnText: { fontFamily: font.displayBold, fontSize: 15 },
  switch: { flexDirection: 'row', gap: 4, padding: 4, backgroundColor: color.muted, borderRadius: 12 },
  switchItem: { flex: 1, minWidth: 0, height: 38, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  switchOn: { fontFamily: font.displayBold, fontSize: 16, color: color.ink },
  switchOff: { fontFamily: font.bodyMedium, fontSize: 15, color: color.ink2 },
  nav: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  arrow: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: color.line, alignItems: 'center', justifyContent: 'center' },
  range: { fontFamily: font.displayBold, fontSize: 18, color: color.ink, marginVertical: -3.42 },
  rangeSub: { fontFamily: font.body, fontSize: 13, color: color.ink2, textAlign: 'center' },

  // Week
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
  offBox: { height: 40, borderRadius: 14, borderWidth: 1, borderColor: color.line, justifyContent: 'center', paddingHorizontal: 12 },
  offText: { fontFamily: font.bodySemi, fontSize: 13, color: color.ink2 },

  // Day
  hourRow: { position: 'absolute', left: 0, right: 0, flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  hourText: { fontFamily: font.body, fontSize: 12, color: '#5F6D74', textAlign: 'right' },
  hourLine: { flexGrow: 1, height: 1, backgroundColor: '#DDE3EA' },
  block: { position: 'absolute', left: 52, right: 0, borderRadius: 16, overflow: 'hidden' },
  blockHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, paddingVertical: 8, paddingHorizontal: 12 },
  blockTitle: { fontFamily: font.displayBold, fontSize: 16, color: color.ink, marginVertical: -2.82 },
  blockSub: { fontFamily: font.body, fontSize: 12 },
  blockPill: { flexDirection: 'row', alignSelf: 'flex-start', alignItems: 'center', gap: 5, height: 24, paddingHorizontal: 8, borderRadius: 999, flexShrink: 0 },
  pillDot: { width: 7, height: 7, borderRadius: 4 },
  blockPillText: { fontFamily: font.bodyBold, fontSize: 12 },
  blockNote: { paddingHorizontal: 12, fontFamily: font.body, fontSize: 12, color: color.ink2 },
  taskLine: { position: 'absolute', left: 12, right: 12, flexDirection: 'row', alignItems: 'center', gap: 8 },
  taskDot: { width: 6, height: 6, borderRadius: 3 },
  taskText: { flexShrink: 1, fontFamily: font.bodySemi, fontSize: 13, color: color.ink },
  nowRow: { position: 'absolute', left: 44, right: 0, flexDirection: 'row', alignItems: 'center' },
  nowDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: color.bad },
  nowLine: { flexGrow: 1, height: 2, backgroundColor: color.bad },
  bookBox: { position: 'absolute', left: 52, right: 0, borderRadius: 16, borderWidth: 2, borderStyle: 'dashed', borderColor: '#C9D3DD', alignItems: 'center', justifyContent: 'center' },
  bookText: { fontFamily: font.displayBold, fontSize: 15, color: color.primary },

  // Month
  monthCard: { gap: 4, paddingVertical: 10, paddingHorizontal: 8, backgroundColor: '#FFFFFF', borderRadius: 24, ...cardShadow },
  letter: { fontSize: 12, color: '#5F6D74', textAlign: 'center' },
  mCellP: { flex: 1, minWidth: 0, height: 52, paddingTop: 6, alignItems: 'center', borderRadius: 12, overflow: 'hidden' },
  mCellS: { flex: 1, minWidth: 0, height: 54, paddingTop: 6, alignItems: 'center', gap: 6, borderRadius: 10, borderWidth: 1, borderColor: color.divider, overflow: 'hidden' },
  mNum: { fontFamily: font.body, fontSize: 14 },
  mDotP: { width: 6, height: 6, marginTop: 4, borderRadius: 3 },
  mDotS: { width: 7, height: 7, borderRadius: 4 },
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendText: { fontFamily: font.body, fontSize: 12, color: color.ink2 },
  dayCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, paddingVertical: 10, paddingHorizontal: 14, backgroundColor: '#FFFFFF', borderRadius: 24, ...cardShadow },
  dayCardDate: { fontFamily: font.body, fontSize: 13, color: color.ink2 },
  dayCardTitle: { fontFamily: font.bodySemi, fontSize: 15, color: color.ink },
  dayCardPill: { alignSelf: 'flex-start', height: 24, paddingHorizontal: 8, borderRadius: 999, justifyContent: 'center' },
  dayCardPillText: { fontFamily: font.bodyBold, fontSize: 12 },
});
