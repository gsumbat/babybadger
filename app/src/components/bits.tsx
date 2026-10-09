// Small pieces shared by parent and sitter screens (wireframe patterns).
import { Pressable, StyleSheet, View } from 'react-native';

import { ageLabel, safetyLine } from '@/lib/kid-profile';
import { timeOf } from '@/lib/format';
import type { Kid, Task } from '@/lib/types';
import { cardShadow, color, font, radius } from '@/theme';

import { Icon } from './ui';
import { Text } from '@/components/Text';

export function Progress({ value, total, tint = color.primary }: { value: number; total: number; tint?: string }) {
  return (
    <View style={st.track}>
      <View style={[st.fill, { width: `${total ? Math.min(100, (value / total) * 100) : 0}%`, backgroundColor: tint }]} />
    </View>
  );
}

/** Red "Leo · food to avoid" box shown at the top for parents and sitters. */
export function SafetyBox({ kids }: { kids: Kid[] }) {
  const lines = kids.map(safetyLine).filter(Boolean) as string[];
  if (!lines.length) return null;
  return (
    <View style={st.safety}>
      {lines.map((l) => {
        const [name, ...rest] = l.split(' · ');
        return (
          <Text key={l} style={st.safetyText}>
            <Text style={{ fontFamily: font.bodyBold }}>{name} · </Text>
            {rest.join(' · ')}
          </Text>
        );
      })}
    </View>
  );
}

// Small kid circles in the wireframes (P4b, P5, S10) use the deeper shade of the kid's color with a white letter.
const DEEP: Record<string, string> = { '#E8B9BE': '#B86A82', '#C3B5E0': '#8676B3', '#9DB8E8': '#4F7CC4', '#F2C08A': '#C27C2C', '#9ED3B4': '#3E9466' };
export function kidShade(c?: string) {
  return (c && DEEP[c.toUpperCase()]) || c || '#B86A82';
}

/** A girl's badge is always pink; otherwise the kid's own color. */
export function kidBadge(kid: Pick<Kid, 'color'> & { gender?: Kid['gender'] }) {
  return kid.gender === 'girl' ? '#B86A82' : kidShade(kid.color);
}

export function KidDot({ kid, size = 36 }: { kid: Pick<Kid, 'name' | 'color'> & { gender?: Kid['gender'] }; size?: number }) {
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: kidBadge(kid), alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontFamily: font.displayBold, fontSize: Math.round(size / 2.25), color: '#FFFFFF' }}>{kid.name[0]?.toUpperCase()}</Text>
    </View>
  );
}

export function kidSub(k: Kid) {
  return [k.birthdate && ageLabel(k.birthdate), k.avoid_foods && `avoid ${k.avoid_foods}`, k.allergies && `allergic to ${k.allergies}`].filter(Boolean).join(' · ');
}

/** Task rows: square checkbox (sitter, tappable) or round check (parent, read-only). */
export function TaskRows({ tasks, onToggle, round }: { tasks: Task[]; onToggle?: (t: Task) => void; round?: boolean }) {
  return (
    <View>
      {tasks.map((t, i) => {
        const done = !!t.done_at;
        const box = round ? (
          <Icon name={done ? 'check-circle' : 'circle'} size={22} tint={done ? color.ok : color.lineStrong} />
        ) : done ? (
          <View style={[st.check, st.checkOn]}>
            <Icon name="check" size={18} tint="#FFFFFF" />
          </View>
        ) : (
          <View style={st.check} />
        );
        const row = (
          <View style={[st.taskRow, i < tasks.length - 1 && st.line]}>
            {box}
            <View style={{ flex: 1 }}>
              <Text style={[st.taskTitle, done && st.taskDone]}>{t.title}</Text>
              {done ? <Text style={st.small}>Done {timeOf(t.done_at!)}</Text> : null}
            </View>
          </View>
        );
        return onToggle ? (
          <Pressable key={t.id} accessibilityRole="checkbox" accessibilityState={{ checked: done }} onPress={() => onToggle(t)}>
            {row}
          </Pressable>
        ) : (
          <View key={t.id}>{row}</View>
        );
      })}
    </View>
  );
}

export function SetRow({ label, value, onPress, last }: { label: string; value?: string; onPress?: () => void; last?: boolean }) {
  const inner = (
    <View style={[sr.row, !last && sr.line]}>
      <Text style={sr.label}>{label}</Text>
      <Text style={sr.value} numberOfLines={1}>
        {value}
        {onPress ? ' ›' : ''}
      </Text>
    </View>
  );
  return onPress ? (
    <Pressable accessibilityRole="button" onPress={onPress}>
      {inner}
    </Pressable>
  ) : (
    inner
  );
}

/** Settings row with a switch, from wireframe P12 › Alerts (50×30 track, 24 knob). */
export function ToggleRow({ label, sub, value, onChange, last }: { label: string; sub?: string; value: boolean; onChange: (v: boolean) => void; last?: boolean }) {
  return (
    <Pressable accessibilityRole="switch" accessibilityState={{ checked: value }} accessibilityLabel={label} onPress={() => onChange(!value)} style={[sr.row, { minHeight: 56, justifyContent: 'space-between' }, !last && sr.line]}>
      <View style={{ flexShrink: 1 }}>
        <Text style={sr.label}>{label}</Text>
        {sub ? <Text style={sr.sub}>{sub}</Text> : null}
      </View>
      <View style={[sr.track, { backgroundColor: value ? color.primary : '#C3CCD5' }]}>
        <View style={[sr.knob, value ? { right: 3 } : { left: 3 }]} />
      </View>
    </Pressable>
  );
}

const sr = StyleSheet.create({
  sub: { fontFamily: font.body, fontSize: 13, color: '#5F6D74' },
  track: { width: 50, height: 30, borderRadius: 15, flexShrink: 0 },
  knob: { position: 'absolute', top: 3, width: 24, height: 24, borderRadius: 12, backgroundColor: '#FFFFFF' },
  row: { flexDirection: 'row', alignItems: 'center', minHeight: 52, gap: 8 },
  line: { borderBottomWidth: 1, borderBottomColor: color.divider },
  label: { fontFamily: font.body, fontSize: 15, color: color.ink },
  value: { flex: 1, textAlign: 'right', fontFamily: font.body, fontSize: 15, color: color.ink2 },
});

export const cardStyle = { backgroundColor: color.surface, borderRadius: radius.card, ...cardShadow } as const;

const st = StyleSheet.create({
  track: { height: 6, borderRadius: 3, backgroundColor: color.edge, overflow: 'hidden' },
  fill: { height: 6, borderRadius: 3 },
  safety: { backgroundColor: color.badTint, borderRadius: 16, paddingHorizontal: 14, paddingVertical: 10, gap: 2 },
  safetyText: { fontFamily: font.body, fontSize: 14, color: color.badInk },
  check: { width: 26, height: 26, borderRadius: 8, borderWidth: 2, borderColor: color.lineStrong, alignItems: 'center', justifyContent: 'center' },
  checkOn: { backgroundColor: color.primary, borderColor: color.primary },
  taskRow: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 54, paddingVertical: 8 },
  line: { borderBottomWidth: 1, borderBottomColor: color.divider },
  taskTitle: { fontFamily: font.body, fontSize: 15, color: color.ink },
  taskDone: { color: color.quiet, textDecorationLine: 'line-through' },
  small: { fontFamily: font.body, fontSize: 12, color: color.ink2 },
});
