import { router } from 'expo-router';
import { type ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { Text } from '@/components/Text';
import { Icon } from '@/components/ui';
import { initials, ROLE_OPTIONS, roleLabel, type MemberRole } from '@/lib/family-members';
import { cardShadow, color, font } from '@/theme';

// Shared pieces of the Family members screens (wireframes P78, P78f, P78b, P78s, P78c, P78e). Values from the boards
// (P78's rows and info card are P27's).

/** P78 avatar colors: you in ink, the others in order. Invites are grey. */
const MEMBER_COLORS = ['#47698A', '#B86A82', '#8676B3', '#5F6D74'];
export function memberColor(index: number, me: boolean) {
  return me ? color.ink : MEMBER_COLORS[index % MEMBER_COLORS.length];
}
export const INVITE_COLOR = '#5F6D74';

export function MemberAvatar({ name, bg, size = 44 }: { name: string; bg: string; size?: number }) {
  const letters = initials(name);
  return (
    <View style={[st.avatar, { width: size, height: size, borderRadius: size / 2, backgroundColor: bg }]}>
      <Text style={[st.avatarText, size > 44 && { fontSize: 22 }]}>{letters}</Text>
    </View>
  );
}

const PILL = {
  info: [color.primaryTint, color.primary, color.primaryStrong],
  muted: [color.muted, '#8A979D', color.ink2],
  warn: [color.warnTint, color.warn, color.warnInk],
  ok: [color.okTint, color.ok, color.okInk],
} as const;

export function MemberPill({ kind, label }: { kind: keyof typeof PILL; label: string }) {
  const [bg, dot, ink] = PILL[kind];
  return (
    <View style={[st.pill, { backgroundColor: bg }]}>
      <View style={[st.pillDot, { backgroundColor: dot }]} />
      <Text style={[st.pillText, { color: ink }]}>{label}</Text>
    </View>
  );
}

/** "Parent" (blue) / "Family helper" (grey). */
export function RolePill({ role }: { role: MemberRole }) {
  return <MemberPill kind={role === 'parent' ? 'info' : 'muted'} label={roleLabel(role)} />;
}

/** P78b / P78c ROLE: two radio cards with their one-line explanations. */
export function RoleCards({ value, onChange, disabled }: { value: MemberRole; onChange: (r: MemberRole) => void; disabled?: boolean }) {
  return (
    <View accessibilityRole="radiogroup" accessibilityLabel="Role" style={{ gap: 8 }}>
      {ROLE_OPTIONS.map((o) => {
        const on = o.value === value;
        return (
          <Pressable
            key={o.value}
            accessibilityRole="radio"
            accessibilityState={{ checked: on, disabled }}
            disabled={disabled}
            onPress={() => onChange(o.value)}
            style={[st.roleCard, on ? st.roleOn : st.roleOff, disabled && !on && { opacity: 0.6 }]}>
            <View style={[st.radio, { borderColor: on ? color.primary : color.lineStrong }]}>{on ? <View style={st.radioDot} /> : null}</View>
            <View style={{ flexGrow: 1, flexShrink: 1, minWidth: 0, gap: 2 }}>
              <Text style={st.roleTitle}>{o.label}</Text>
              <Text style={st.roleSub}>{o.sub}</Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const USERS =
  '<svg viewBox="0 0 24 24" fill="none" stroke="#34526E" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c0-3.5 3-5.5 6.5-5.5s6.5 2 6.5 5.5M16 4.8a3.5 3.5 0 0 1 0 6.4M18.5 14.8c1.8.7 3 2.3 3 4.7"/></svg>';

/** P78 / P4m blue note with the people icon. */
export function MembersNote({ children }: { children: string }) {
  return (
    <View style={st.info}>
      <SvgXml xml={USERS} width={22} height={22} />
      <Text style={st.infoText}>{children}</Text>
    </View>
  );
}

/** P78 header: back button + Baloo title (P27's). */
export function BackHeader({ title, onBack }: { title: string; onBack?: () => void }) {
  return (
    <View style={st.header}>
      <Pressable accessibilityRole="button" accessibilityLabel="Back" onPress={onBack ?? (() => router.back())} style={st.back}>
        <Icon name="chevron-left" size={22} tint={color.ink} strokeWidth={2} />
      </Pressable>
      <Text style={st.title} numberOfLines={1}>
        {title}
      </Text>
    </View>
  );
}

/** P78c / P78e red outlined button (P12b's Sign out). */
export function DangerButton({ label, onPress, busy }: { label: string; onPress: () => void; busy?: boolean }) {
  return (
    <Pressable accessibilityRole="button" disabled={busy} onPress={onPress} style={({ pressed }) => [st.danger, (pressed || busy) && { opacity: 0.7 }]}>
      <Text style={st.dangerText}>{label}</Text>
    </Pressable>
  );
}

/** A white card with rows (P27 / P78). */
export function RowsCard({ children }: { children: ReactNode }) {
  return <View style={st.card}>{children}</View>;
}

export const memberStyles = StyleSheet.create({
  section: { fontFamily: font.bodyBold, fontSize: 13, color: color.ink2, letterSpacing: 0.6 },
  lead: { fontFamily: font.body, fontSize: 15, lineHeight: 22, color: color.ink2 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 68 },
  rowText: { flexGrow: 1, flexShrink: 1, minWidth: 0 },
  line: { borderBottomWidth: 1, borderBottomColor: color.divider },
  name: { fontFamily: font.bodySemi, fontSize: 16, color: color.ink },
  sub: { fontFamily: font.body, fontSize: 13, color: color.ink2 },
  actions: { flexDirection: 'row', gap: 8, paddingBottom: 12, paddingLeft: 56 },
  action: { height: 34, paddingHorizontal: 12, borderRadius: 999, flexDirection: 'row', alignItems: 'center' },
  actionText: { fontFamily: font.bodyBold, fontSize: 13 },
  primaryBtn: { height: 54, borderRadius: 999, backgroundColor: color.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  primaryText: { fontFamily: font.displayBold, fontSize: 17, color: '#FFFFFF' },
  tonalBtn: { flex: 1, height: 48, borderRadius: 999, backgroundColor: color.primaryTint, alignItems: 'center', justifyContent: 'center' },
  tonalText: { fontFamily: font.displayBold, fontSize: 17, color: color.primary },
  note13: { fontFamily: font.body, fontSize: 13, lineHeight: 18, color: color.ink2 },
  fullNote: { fontFamily: font.body, fontSize: 14, lineHeight: 20, color: color.ink2, textAlign: 'center' },
  profileCard: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, backgroundColor: '#FFFFFF', borderRadius: 24, ...cardShadow },
  profileName: { fontFamily: font.display, fontSize: 20, lineHeight: 24, color: color.ink },
  profileSub: { fontFamily: font.body, fontSize: 14, color: color.ink2 },
  profileJoined: { fontFamily: font.body, fontSize: 12, color: '#5F6D74' },
});

const st = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingTop: 16, paddingHorizontal: 20, paddingBottom: 8 },
  back: { width: 44, height: 44, borderRadius: 22, borderWidth: 1, borderColor: color.line, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  title: { flexGrow: 1, flexShrink: 1, fontFamily: font.display, fontSize: 22, color: color.ink },
  card: { paddingHorizontal: 16, backgroundColor: '#FFFFFF', borderRadius: 24, ...cardShadow },
  avatar: { alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  avatarText: { fontFamily: font.displayBold, fontSize: 19, color: '#FFFFFF' },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 6, height: 26, paddingHorizontal: 10, borderRadius: 999, flexShrink: 0 },
  pillDot: { width: 7, height: 7, borderRadius: 4 },
  pillText: { fontFamily: font.bodyBold, fontSize: 12 },
  roleCard: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, paddingHorizontal: 14, borderRadius: 16, backgroundColor: '#FFFFFF' },
  roleOn: { borderWidth: 2, borderColor: color.primary },
  roleOff: { borderWidth: 1, borderColor: color.line, margin: 1 },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: color.primary },
  roleTitle: { fontFamily: font.bodyBold, fontSize: 15, color: color.ink },
  roleSub: { fontFamily: font.body, fontSize: 13, lineHeight: 18, color: color.ink2 },
  info: { flexDirection: 'row', gap: 12, paddingVertical: 12, paddingHorizontal: 14, backgroundColor: color.primaryTint, borderRadius: 14 },
  infoText: { flexShrink: 1, fontFamily: font.body, fontSize: 13, lineHeight: 18, color: color.ink },
  danger: { flex: 1, height: 54, borderRadius: 999, borderWidth: 1.5, borderColor: color.lineStrong, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  dangerText: { fontFamily: font.displayBold, fontSize: 17, color: color.badInk, includeFontPadding: false },
});
