import Feather from '@expo/vector-icons/Feather';
import { router } from 'expo-router';
import type { ComponentProps, ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { cardShadow, color, font, radius, space } from '@/theme';

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
}: {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  back?: boolean;
  right?: ReactNode;
  scroll?: boolean;
  footer?: ReactNode;
  bg?: string;
}) {
  const body = <View style={s.content}>{children}</View>;
  return (
    <SafeAreaView style={[s.screen, { backgroundColor: bg }]} edges={['top', 'left', 'right']}>
      {(title || back) && (
        <View style={s.header}>
          {back && (
            <Pressable accessibilityRole="button" accessibilityLabel="Back" onPress={() => router.back()} style={s.back}>
              <Icon name="chevron-left" size={22} tint={color.ink} />
            </Pressable>
          )}
          <View style={{ flex: 1 }}>
            {title ? <Text style={s.hTitle}>{title}</Text> : null}
            {subtitle ? <Text style={s.subtitle}>{subtitle}</Text> : null}
          </View>
          {right}
        </View>
      )}
      {scroll ? (
        <ScrollView contentContainerStyle={{ paddingBottom: 24 }} keyboardShouldPersistTaps="handled">
          {body}
        </ScrollView>
      ) : (
        <View style={{ flex: 1 }}>{body}</View>
      )}
      {footer ? <View style={s.footer}>{footer}</View> : null}
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

type ButtonKind = 'primary' | 'tonal' | 'outline' | 'danger' | 'ghost';
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

export function Row({ icon, title, sub, right, onPress, last }: { icon?: IconName; title: string; sub?: string; right?: ReactNode; onPress?: () => void; last?: boolean }) {
  const inner = (
    <View style={[s.row, !last && s.rowLine]}>
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

const s = StyleSheet.create({
  screen: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: space.xl, paddingTop: 8, paddingBottom: 8 },
  back: { width: 44, height: 44, borderRadius: 22, borderWidth: 1, borderColor: color.line, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  hTitle: { fontFamily: font.display, fontSize: 24, lineHeight: 30, color: color.ink },
  subtitle: { fontFamily: font.body, fontSize: 13, color: color.ink2 },
  content: { paddingHorizontal: space.xl, paddingTop: 4, gap: space.m },
  footer: { paddingHorizontal: space.xl, paddingTop: 8, paddingBottom: 24, gap: 8, backgroundColor: 'transparent' },
  card: { backgroundColor: color.surface, borderRadius: radius.card, padding: space.l, gap: space.s, ...cardShadow },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  label: { fontFamily: font.bodyBold, fontSize: 13, letterSpacing: 0.6, color: color.ink2 },
  body: { fontFamily: font.body, fontSize: 15, lineHeight: 21, color: color.ink },
  muted: { fontFamily: font.body, fontSize: 14, lineHeight: 20, color: color.ink2 },
  strong: { fontFamily: font.bodySemi, fontSize: 15, color: color.ink },
  title: { fontFamily: font.display, fontSize: 20, lineHeight: 24, color: color.ink },
  small: { fontFamily: font.body, fontSize: 12, lineHeight: 16, color: color.ink2 },
  button: { height: 54, borderRadius: radius.pill, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingHorizontal: 18 },
  buttonText: { fontFamily: font.displayBold, fontSize: 17 },
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
  banner: { flexDirection: 'row', gap: 10, alignItems: 'flex-start', borderRadius: 16, padding: 12 },
});
