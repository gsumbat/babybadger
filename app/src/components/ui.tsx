import Feather from '@expo/vector-icons/Feather';
import { router } from 'expo-router';
import { useState, type ComponentProps, type ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
  type StyleProp,
  type TextInputProps,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { KeyboardAwareScrollView, KeyboardStickyView } from 'react-native-keyboard-controller';
import { SafeAreaView } from 'react-native-safe-area-context';

import { cardShadow, color, font, radius, space } from '@/theme';

// Height of the Previous / Next / Done bar shown above the keyboard (see app/_layout).
const KEYBOARD_TOOLBAR = 42;

export type IconName = ComponentProps<typeof Feather>['name'];

export function Icon({ name, size = 20, tint = color.primary }: { name: IconName; size?: number; tint?: string }) {
  return <Feather name={name} size={size} color={tint} />;
}

export function Screen({
  children,
  title,
  subtitle,
  back,
  right,
  scroll = true,
  footer,
  bg = color.canvas,
  step,
  onBack,
  header,
  bleedTop,
  caption,
}: {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  back?: boolean;
  right?: ReactNode;
  scroll?: boolean;
  footer?: ReactNode;
  bg?: string;
  /** Multi-step flow: "Add a child · 1 of 2", a progress bar and Cancel. */
  step?: { label: string; n: number; total: number; onCancel?: () => void };
  /** Override the back button (e.g. go to the previous step instead of leaving). */
  onBack?: () => void;
  /** Replace the standard header entirely (e.g. the Home greeting header). */
  header?: ReactNode;
  /** Let the header run under the status bar (Hero, active-shift banner). */
  bleedTop?: boolean;
  /** Small text next to the back button, with the title stacked below (wireframe S2). */
  caption?: string;
}) {
  const [footerH, setFooterH] = useState(0);
  const body = <View style={s.content}>{children}</View>;
  const backBtn = (
    <Pressable accessibilityRole="button" accessibilityLabel="Back" onPress={onBack ?? (() => router.back())} style={s.back}>
      <Icon name="chevron-left" size={22} tint={color.ink} />
    </Pressable>
  );
  const titleBlock = (size: 'back' | 'tab' | 'step') =>
    title || subtitle ? (
      <View style={{ flex: size === 'step' ? undefined : 1, minWidth: 0 }}>
        {title ? <Text style={[s.hTitle, size === 'back' && s.hTitleBack]}>{title}</Text> : null}
        {subtitle ? <Text style={s.subtitle}>{subtitle}</Text> : null}
      </View>
    ) : (
      <View style={{ flex: 1 }} />
    );
  return (
    <SafeAreaView style={[s.screen, { backgroundColor: bg }]} edges={bleedTop ? ['left', 'right'] : ['top', 'left', 'right']}>
      {header ??
        (step || caption ? (
          // Multi-step flows (wireframe P18): back + "Add a child · 1 of 2" + Cancel, progress bar, then the question.
          <View style={s.headerStack}>
            <View style={s.backRow}>
              {backBtn}
              <Text style={s.stepText} numberOfLines={1}>{step ? `${step.label} · ${step.n} of ${step.total}` : caption}</Text>
              {step?.onCancel ? (
                <Pressable accessibilityRole="button" onPress={step.onCancel} hitSlop={10}>
                  <Text style={s.cancel}>Cancel</Text>
                </Pressable>
              ) : null}
            </View>
            {step ? (
              <View style={s.progress}>
                <View style={[s.progressFill, { width: `${(step.n / step.total) * 100}%` }]} />
              </View>
            ) : null}
            {titleBlock('step')}
          </View>
        ) : back ? (
          <View style={s.header}>
            {backBtn}
            {titleBlock('back')}
            {right}
          </View>
        ) : title ? (
          <View style={[s.header, { paddingTop: 16 }]}>
            {titleBlock('tab')}
            {right}
          </View>
        ) : null)}
      {scroll ? (
        // Scrolls the focused field above the keyboard (and above the sticky footer), the standard iOS/Android form behavior.
        <KeyboardAwareScrollView
          bottomOffset={footerH + KEYBOARD_TOOLBAR + 16}
          contentContainerStyle={{ paddingBottom: 24 }}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive">
          {body}
        </KeyboardAwareScrollView>
      ) : (
        <View style={{ flex: 1 }}>{body}</View>
      )}
      {footer ? (
        // The main button rides up with the keyboard so Continue / Save stays reachable while typing.
        <KeyboardStickyView offset={{ closed: 0, opened: -KEYBOARD_TOOLBAR + 16 }}>
          <View style={[s.footer, { backgroundColor: bg }]} onLayout={(e) => setFooterH(e.nativeEvent.layout.height)}>
            {footer}
          </View>
        </KeyboardStickyView>
      ) : null}
    </SafeAreaView>
  );
}

export function Card({ children, style, onPress }: { children: ReactNode; style?: StyleProp<ViewStyle>; onPress?: () => void }) {
  if (onPress)
    return (
      <Pressable onPress={onPress} style={({ pressed }) => [s.card, style, pressed && { opacity: 0.85 }]}>
        {children}
      </Pressable>
    );
  return <View style={[s.card, style]}>{children}</View>;
}

export function Label({ children, right }: { children: string; right?: ReactNode }) {
  return (
    <View style={s.labelRow}>
      <Text style={s.label}>{children.toUpperCase()}</Text>
      {right}
    </View>
  );
}

export function T({ children, style, variant = 'body' }: { children: ReactNode; style?: StyleProp<TextStyle>; variant?: 'body' | 'muted' | 'strong' | 'title' | 'small' }) {
  return <Text style={[s[variant], style]}>{children}</Text>;
}

type ButtonKind = 'primary' | 'tonal' | 'outline' | 'secondary' | 'danger' | 'ghost';
export function Button({
  label,
  onPress,
  kind = 'primary',
  icon,
  busy,
  disabled,
  style,
}: {
  label: string;
  onPress?: () => void;
  kind?: ButtonKind;
  icon?: IconName;
  busy?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const st = btn[kind];
  const off = disabled || busy;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!off, busy: !!busy }}
      onPress={off ? undefined : onPress}
      style={({ pressed }) => [s.button, st.box, off && { opacity: 0.5 }, pressed && { opacity: 0.8 }, style]}>
      {busy ? <ActivityIndicator color={st.text.color} /> : icon ? <Icon name={icon} size={18} tint={st.text.color as string} /> : null}
      <Text style={[s.buttonText, st.text]}>{label}</Text>
    </Pressable>
  );
}

const btn: Record<ButtonKind, { box: ViewStyle; text: TextStyle }> = {
  primary: { box: { backgroundColor: color.primary }, text: { color: '#FFFFFF' } },
  tonal: { box: { backgroundColor: color.primaryTint }, text: { color: color.primary } },
  outline: { box: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: color.lineStrong }, text: { color: color.ink } },
  secondary: { box: { backgroundColor: '#FFFFFF', borderWidth: 1.5, borderColor: color.primary }, text: { color: color.primary } },
  danger: { box: { backgroundColor: color.bad }, text: { color: '#FFFFFF' } },
  ghost: { box: { backgroundColor: 'transparent' }, text: { color: color.primary } },
};

type PillKind = 'ok' | 'warn' | 'bad' | 'info' | 'muted';
const pillColors: Record<PillKind, [string, string, string]> = {
  ok: [color.okTint, color.okInk, color.ok],
  warn: [color.warnTint, color.warnInk, color.warn],
  bad: [color.badTint, color.badInk, color.bad],
  info: [color.primaryTint, color.primaryStrong, color.primary],
  muted: [color.muted, color.ink2, '#8A979D'],
};
export function Pill({ label, kind = 'ok' }: { label: string; kind?: PillKind }) {
  const [bg, fg, dot] = pillColors[kind];
  return (
    <View style={[s.pill, { backgroundColor: bg }]}>
      <View style={[s.dot, { backgroundColor: dot }]} />
      <Text style={[s.pillText, { color: fg }]}>{label}</Text>
    </View>
  );
}

export function Field({ label, hint, ...props }: TextInputProps & { label: string; hint?: string }) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={s.fieldLabel}>{label}</Text>
      <TextInput placeholderTextColor={color.quiet} {...props} style={[s.input, props.multiline && { minHeight: 90, textAlignVertical: 'top', paddingTop: 12 }, props.style]} />
      {hint ? <Text style={s.small}>{hint}</Text> : null}
    </View>
  );
}

export function Chip({ label, on, onPress }: { label: string; on?: boolean; onPress?: () => void }) {
  return (
    <Pressable accessibilityRole="button" accessibilityState={{ selected: !!on }} onPress={onPress} style={[s.chip, on ? s.chipOn : s.chipOff]}>
      {on ? <Icon name="check" size={14} tint={color.primaryStrong} /> : null}
      <Text style={[s.chipText, { color: on ? color.primaryStrong : color.ink }]}>{label}</Text>
    </Pressable>
  );
}

export function Avatar({ name, size = 44, bg = color.primary }: { name: string; size?: number; bg?: string }) {
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: bg, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ color: '#FFFFFF', fontFamily: font.displayBold, fontSize: size / 2.3 }}>{(name.trim()[0] || '?').toUpperCase()}</Text>
    </View>
  );
}

export function Row({ icon, left, title, sub, right, onPress, last }: { icon?: IconName; left?: ReactNode; title: string; sub?: string; right?: ReactNode; onPress?: () => void; last?: boolean }) {
  const inner = (
    <View style={[s.row, !last && s.rowLine]}>
      {left}
      {icon ? (
        <View style={s.rowIcon}>
          <Icon name={icon} size={18} />
        </View>
      ) : null}
      <View style={{ flex: 1 }}>
        <Text style={s.strong}>{title}</Text>
        {sub ? <Text style={s.small}>{sub}</Text> : null}
      </View>
      {right ?? (onPress ? <Icon name="chevron-right" size={18} tint={color.ink2} /> : null)}
    </View>
  );
  return onPress ? <Pressable onPress={onPress}>{inner}</Pressable> : inner;
}

export function Banner({ kind = 'info', icon = 'info', children }: { kind?: PillKind; icon?: IconName; children: ReactNode }) {
  const [bg, fg] = pillColors[kind];
  return (
    <View style={[s.banner, { backgroundColor: bg }]}>
      <Icon name={icon} size={18} tint={fg} />
      <Text style={[s.small, { color: color.ink, flex: 1, fontSize: 14, lineHeight: 20 }]}>{children}</Text>
    </View>
  );
}

export function Loading() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: color.canvas }}>
      <ActivityIndicator color={color.primary} />
    </View>
  );
}

export function ErrorText({ children }: { children?: string }) {
  if (!children) return null;
  return <Banner kind="bad" icon="alert-triangle">{children}</Banner>;
}

/** Home header from the wireframes: "Thursday afternoon" over the family / sitter name, initials on the right. */
export function HomeHeader({ eyebrow, title, initials, onAvatar }: { eyebrow: string; title: string; initials: string; onAvatar?: () => void }) {
  return (
    <View style={s.homeHeader}>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={s.eyebrow}>{eyebrow}</Text>
        <Text style={s.homeTitle} numberOfLines={1}>
          {title}
        </Text>
      </View>
      <Pressable accessibilityRole="button" accessibilityLabel="Account" onPress={onAvatar} style={s.initials}>
        <Text style={s.initialsText}>{initials}</Text>
      </Pressable>
    </View>
  );
}

export function initialsOf(name?: string | null) {
  const parts = (name || '').trim().split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] ?? '?') + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase();
}

/** "Thursday afternoon" */
export function dayPart(d = new Date()) {
  const h = d.getHours();
  const part = h < 12 ? 'morning' : h < 17 ? 'afternoon' : 'evening';
  return `${d.toLocaleDateString('en-US', { weekday: 'long' })} ${part}`;
}

export type Action = { icon: IconName; label: string; onPress?: () => void; dot?: boolean };
/** "What do you need?" / "Tools" grid: 4 tinted tiles per row. */
export function ActionGrid({ items }: { items: Action[] }) {
  const { width } = useWindowDimensions();
  const w = Math.floor((Math.min(width, 520) - space.xl * 2 - 24) / 4);
  return (
    <View style={s.grid}>
      {items.map((a) => (
        <Pressable key={a.label} accessibilityRole="button" onPress={a.onPress} style={({ pressed }) => [s.tile, { width: w }, pressed && { opacity: 0.8 }]}>
          <View>
            <Icon name={a.icon} size={22} tint={color.primaryStrong} />
            {a.dot ? <View style={s.tileDot} /> : null}
          </View>
          <Text style={s.tileText} numberOfLines={2}>
            {a.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

/** Pill-shaped segmented control (Day / Week / Month, Snack / Breakfast ...). */
export function Segmented<V extends string>({ options, value, onChange }: { options: { value: V; label: string }[]; value: V; onChange: (v: V) => void }) {
  return (
    <View style={s.seg}>
      {options.map((o) => {
        const on = o.value === value;
        return (
          <Pressable key={o.value} accessibilityRole="button" accessibilityState={{ selected: on }} onPress={() => onChange(o.value)} style={[s.segItem, on && s.segOn]}>
            <Text style={[s.segText, on && s.segTextOn]} numberOfLines={1}>
              {o.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/** Boxed choices in a row (None / Some / Most / All). */
export function BoxChoice<V extends string>({ options, value, onChange }: { options: { value: V; label: string }[]; value: V; onChange: (v: V) => void }) {
  return (
    <View style={{ flexDirection: 'row', gap: 8 }}>
      {options.map((o) => {
        const on = o.value === value;
        return (
          <Pressable key={o.value} accessibilityRole="button" accessibilityState={{ selected: on }} onPress={() => onChange(o.value)} style={[s.box, on && s.boxOn]}>
            <Text style={[s.segText, { color: on ? color.primaryStrong : color.ink }, on && { fontFamily: font.bodyBold }]}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/** Small number tile: "4/4 Tasks done". */
export function Stat({ value, label, tint = color.surface }: { value: string; label: string; tint?: string }) {
  return (
    <View style={[s.stat, { backgroundColor: tint }, tint === color.surface && cardShadow]}>
      <Text style={s.statValue}>{value}</Text>
      <Text style={s.small}>{label}</Text>
    </View>
  );
}

/** Title + round close button, for screens presented as a sheet (logs). */
export function SheetHeader({ title, onClose }: { title: string; onClose?: () => void }) {
  return (
    <View style={s.sheetHeader}>
      <Text style={[s.hTitle, { fontSize: 22, flex: 1 }]}>{title}</Text>
      <Pressable accessibilityRole="button" accessibilityLabel="Close" onPress={onClose ?? (() => router.back())} style={s.back}>
        <Icon name="x" size={18} tint={color.ink} />
      </Pressable>
    </View>
  );
}

/** Gray empty state with an icon, used for features that aren't built yet. */
export function Empty({ icon, title, children }: { icon: IconName; title: string; children?: ReactNode }) {
  return (
    <View style={{ alignItems: 'center', gap: 10, paddingVertical: 48, paddingHorizontal: 24 }}>
      <View style={[s.rowIcon, { width: 56, height: 56, borderRadius: 28 }]}>
        <Icon name={icon} size={26} />
      </View>
      <Text style={[s.title, { textAlign: 'center' }]}>{title}</Text>
      {children ? <Text style={[s.muted, { textAlign: 'center' }]}>{children}</Text> : null}
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: space.xl, paddingTop: 12, paddingBottom: 8 },
  back: { width: 44, height: 44, borderRadius: 22, borderWidth: 1, borderColor: color.line, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  // No lineHeight on Baloo titles: on iOS a lineHeight smaller than the font's natural height pushes the glyphs off-center.
  hTitle: { fontFamily: font.display, fontSize: 26, color: color.ink },
  hTitleBack: { fontSize: 22 },
  headerStack: { paddingHorizontal: space.xl, paddingTop: 8, paddingBottom: 8, gap: 14 },
  backRow: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 44 },
  stepText: { flex: 1, fontFamily: font.bodySemi, fontSize: 14, color: color.ink2 },
  cancel: { fontFamily: font.bodySemi, fontSize: 14, color: color.primary, textDecorationLine: 'underline' },
  progress: { height: 6, borderRadius: 3, backgroundColor: color.edge, overflow: 'hidden' },
  progressFill: { height: 6, borderRadius: 3, backgroundColor: color.primary },
  subtitle: { fontFamily: font.body, fontSize: 13, color: color.ink2 },
  content: { paddingHorizontal: space.xl, paddingTop: 4, gap: space.m },
  footer: { paddingHorizontal: space.xl, paddingTop: 8, paddingBottom: 24, gap: 8, backgroundColor: 'transparent' },
  card: { backgroundColor: color.surface, borderRadius: radius.card, padding: space.l, gap: space.s, ...cardShadow },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  label: { fontFamily: font.bodyBold, fontSize: 13, letterSpacing: 0.6, color: color.ink2 },
  body: { fontFamily: font.body, fontSize: 15, lineHeight: 21, color: color.ink },
  muted: { fontFamily: font.body, fontSize: 14, lineHeight: 20, color: color.ink2 },
  strong: { fontFamily: font.bodySemi, fontSize: 15, color: color.ink },
  title: { fontFamily: font.display, fontSize: 20, color: color.ink },
  small: { fontFamily: font.body, fontSize: 12, lineHeight: 16, color: color.ink2 },
  button: { height: 54, borderRadius: radius.pill, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingHorizontal: 18 },
  buttonText: { fontFamily: font.displayBold, fontSize: 17, includeFontPadding: false },
  pill: { height: 26, paddingHorizontal: 10, borderRadius: radius.pill, flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start' },
  dot: { width: 7, height: 7, borderRadius: 4 },
  pillText: { fontFamily: font.bodyBold, fontSize: 12 },
  fieldLabel: { fontFamily: font.bodyBold, fontSize: 13, color: color.ink2 },
  input: { minHeight: 50, borderWidth: 1, borderColor: color.lineStrong, borderRadius: radius.field, backgroundColor: '#FFFFFF', paddingHorizontal: 14, fontFamily: font.body, fontSize: 16, color: color.ink },
  chip: { minHeight: 36, paddingHorizontal: 12, borderRadius: radius.pill, flexDirection: 'row', alignItems: 'center', gap: 6 },
  chipOn: { backgroundColor: color.primaryTint, borderWidth: 1.5, borderColor: color.primary },
  chipOff: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: color.line },
  chipText: { fontFamily: font.bodySemi, fontSize: 14 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 56, paddingVertical: 6 },
  rowLine: { borderBottomWidth: 1, borderBottomColor: color.divider },
  rowIcon: { width: 36, height: 36, borderRadius: 12, backgroundColor: color.primaryTint, alignItems: 'center', justifyContent: 'center' },
  homeHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: space.xl, paddingTop: 16, paddingBottom: 12 },
  eyebrow: { fontFamily: font.body, fontSize: 14, color: color.ink2 },
  homeTitle: { fontFamily: font.display, fontSize: 24, color: color.ink },
  initials: { width: 44, height: 44, borderRadius: 22, backgroundColor: color.ink, alignItems: 'center', justifyContent: 'center' },
  initialsText: { fontFamily: font.bodyBold, fontSize: 15, color: '#FFFFFF' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tile: { height: 76, borderRadius: 18, backgroundColor: color.primaryTint, alignItems: 'center', justifyContent: 'center', gap: 5, paddingHorizontal: 4 },
  tileText: { fontFamily: font.bodyBold, fontSize: 12, lineHeight: 14, color: color.primaryStrong, textAlign: 'center' },
  tileDot: { position: 'absolute', right: -4, top: -2, width: 9, height: 9, borderRadius: 5, backgroundColor: '#D9822B' },
  seg: { flexDirection: 'row', gap: 4, backgroundColor: color.muted, borderRadius: radius.pill, padding: 4 },
  segItem: { flex: 1, height: 36, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  segOn: { backgroundColor: '#FFFFFF' },
  segText: { fontFamily: font.bodyMedium, fontSize: 14, color: color.ink2 },
  segTextOn: { fontFamily: font.bodyBold, color: color.ink },
  box: { flex: 1, height: 44, borderRadius: 12, borderWidth: 1, borderColor: color.line, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  boxOn: { borderWidth: 2, borderColor: color.primary, backgroundColor: color.primaryTint },
  stat: { flex: 1, borderRadius: 18, padding: 12, gap: 2 },
  statValue: { fontFamily: font.display, fontSize: 22, color: color.ink },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: space.xl, paddingTop: 20, paddingBottom: 8 },
  banner: { flexDirection: 'row', gap: 10, alignItems: 'flex-start', borderRadius: 16, padding: 12 },
});
