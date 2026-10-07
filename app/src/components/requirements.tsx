// Pieces shared by the sitter requirements screens (wireframes P7a, P28–P32, S27): the requirement icon tile, the
// Must / Nice / Off control, the Warn me / Block booking control and the status pill. Icons are copied from the
// wireframe HTML.
import { Pressable, StyleSheet, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { ICON_TINT, type ReqChoice, type ReqIcon, type RequirementMode } from '@/lib/requirements';
import { color, font } from '@/theme';
import { Text } from '@/components/Text';

const PATHS: Record<ReqIcon | 'rules' | 'warn' | 'check' | 'chevron' | 'plus', string> = {
  shield: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M8.5 12l2.5 2.5 4.5-4.5"/>',
  heart: '<path d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.2a4.3 4.3 0 0 1 7.5 2.6C19.5 15.4 12 20 12 20z"/><path d="M12 10v5M9.5 12.5h5"/>',
  baby: '<circle cx="12" cy="8" r="4"/><path d="M5 21c0-4 3-7 7-7s7 3 7 7"/><path d="M10.5 8h0M13.5 8h0"/>',
  car: '<path d="M4 16v-4l2-5h12l2 5v4z"/><circle cx="7.5" cy="16.5" r="1.8"/><circle cx="16.5" cy="16.5" r="1.8"/>',
  drop: '<path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z"/>',
  nosmoke: '<circle cx="12" cy="12" r="9"/><path d="M5.6 5.6l12.8 12.8M7 13h6M16 13h1"/>',
  dog: '<path d="M5 9l-1.5-4L7 6.5M19 9l1.5-4L17 6.5"/><path d="M6 9.5c0-2.5 2.7-4 6-4s6 1.5 6 4V14a6 6 0 0 1-12 0z"/><path d="M10 12h0M14 12h0M11 15.5h2"/>',
  doc: '<path d="M6 3h9l4 4v14H6z"/><path d="M9.5 12h6M9.5 16h6M9.5 8h3"/>',
  rules: '<path d="M6 3h9l4 4v14H6z"/><path d="M9.5 12h6M9.5 16h6M9.5 8h3"/>',
  warn: '<path d="M12 3l9.5 17h-19z"/><path d="M12 10v4M12 17.5h0"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  chevron: '<path d="M9 6l6 6-6 6"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
};

export function reqSvg(name: keyof typeof PATHS, stroke: string, width = 1.8) {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="${stroke}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round">${PATHS[name]}</svg>`;
}

/** Tinted square with the requirement's icon: 38 (P7a), 32 (P29), 30 (P28 / P32), 36 (S27). Radius 14, icon 22. */
export function ReqTile({ icon, size }: { icon: ReqIcon; size: number }) {
  const [bg, stroke] = ICON_TINT[icon];
  return (
    <View style={[st.tile, { width: size, height: size, backgroundColor: bg }]}>
      <SvgXml xml={reqSvg(icon, stroke)} width={22} height={22} style={{ flexShrink: 0 }} />
    </View>
  );
}

export function ReqSection({ label, style }: { label: string; style?: object }) {
  return <Text style={[st.section, style]}>{label}</Text>;
}

/** P29 / P30 / P31 Must / Nice / Off: 138 wide; Must on = blue, Nice on = white with blue text, Off on = white. */
export function LevelSeg({ value, onChange, label }: { value: ReqChoice; onChange: (v: ReqChoice) => void; label?: string }) {
  return (
    <View style={st.levelSeg} accessibilityLabel={label}>
      {(['must', 'prefer', 'off'] as const).map((v) => {
        const on = v === value;
        return (
          <Pressable
            key={v}
            accessibilityRole="button"
            accessibilityState={{ selected: on }}
            onPress={() => onChange(v)}
            style={[st.levelItem, on && { backgroundColor: v === 'must' ? color.primary : '#FFFFFF' }]}>
            <Text style={[st.levelText, on && { fontFamily: font.bodyBold, color: v === 'must' ? '#FFFFFF' : v === 'prefer' ? color.primary : color.ink2 }]}>
              {v === 'must' ? 'Must' : v === 'prefer' ? 'Nice' : 'Off'}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/** P7a / P32 "If a sitter is missing one": Warn me / Block booking (radius 12, 34 high items). */
export function ModeSeg({ value, onChange }: { value: RequirementMode; onChange: (v: RequirementMode) => void }) {
  return <TwoSeg options={[{ value: 'warn', label: 'Warn me' }, { value: 'block', label: 'Block booking' }]} value={value} onChange={onChange} />;
}

export function TwoSeg<V extends string>({ options, value, onChange }: { options: { value: V; label: string }[]; value: V; onChange: (v: V) => void }) {
  return (
    <View style={st.modeSeg}>
      {options.map((o) => {
        const on = o.value === value;
        return (
          <Pressable key={o.value} accessibilityRole="button" accessibilityState={{ selected: on }} onPress={() => onChange(o.value)} style={[st.modeItem, on && { backgroundColor: '#FFFFFF' }]}>
            <Text style={[st.modeText, on && st.modeTextOn]} numberOfLines={1}>
              {o.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/** 26-high status pill with a dot (S27 "You have it" / "Confirm" / "Nice to have"; P32 counts). */
export function DotPill({ label, kind }: { label: string; kind: 'ok' | 'info' | 'muted' | 'warn' | 'bad' }) {
  const [bg, fg, dot] = {
    ok: [color.okTint, color.okInk, color.ok],
    info: [color.primaryTint, color.primaryStrong, color.primary],
    muted: [color.muted, color.ink2, '#8A979D'],
    warn: [color.warnTint, color.warnInk, color.warn],
    bad: [color.badTint, color.badInk, color.bad],
  }[kind];
  return (
    <View style={[st.pill, { backgroundColor: bg }]}>
      <View style={[st.pillDot, { backgroundColor: dot }]} />
      <Text style={[st.pillText, { color: fg }]}>{label}</Text>
    </View>
  );
}

/** P7a switch: 50×30 track, 24 knob. */
export function Toggle({ value }: { value: boolean }) {
  return (
    <View style={[st.track, { backgroundColor: value ? color.primary : color.lineStrong }]}>
      <View style={[st.knob, value ? { right: 3 } : { left: 3 }]} />
    </View>
  );
}

const st = StyleSheet.create({
  tile: { borderRadius: 14, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  section: { fontFamily: font.bodyBold, fontSize: 13, color: color.ink2, letterSpacing: 0.6 },
  levelSeg: { flexDirection: 'row', gap: 2, width: 138, flexShrink: 0, padding: 3, backgroundColor: color.muted, borderRadius: 10 },
  levelItem: { flexGrow: 1, flexShrink: 1, flexBasis: 0, minWidth: 0, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  levelText: { fontFamily: font.bodySemi, fontSize: 12, color: '#5F6D74' },
  modeSeg: { flexDirection: 'row', gap: 4, padding: 4, backgroundColor: color.muted, borderRadius: 12 },
  modeItem: { flexGrow: 1, flexShrink: 1, flexBasis: 0, minWidth: 0, height: 34, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  modeText: { fontFamily: font.bodyMedium, fontSize: 13, color: color.ink2 },
  modeTextOn: { fontFamily: font.bodyBold, color: color.ink },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 6, height: 26, flexShrink: 0, paddingHorizontal: 10, borderRadius: 999 },
  pillDot: { width: 7, height: 7, borderRadius: 4 },
  pillText: { fontFamily: font.bodyBold, fontSize: 12 },
  track: { width: 50, height: 30, borderRadius: 15, flexShrink: 0 },
  knob: { position: 'absolute', top: 3, width: 24, height: 24, borderRadius: 12, backgroundColor: '#FFFFFF' },
});
