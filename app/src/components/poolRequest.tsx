import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Text } from '@/components/Text';
import { Icon, type IconName } from '@/components/ui';
import { api, useQuery } from '@/lib/data';
import { firstName } from '@/lib/format';
import { parentRowSub, requestRowTitle, requestWindow, requestsApi, type PillKind } from '@/lib/pool-requests';
import { cardShadow, color, font, SECTION_GAP } from '@/theme';

// Pieces shared by the Ask your pool screens (P45 Ask, P46 Request out, P47 Booked, S33 / S20 Shift request, S34
// Filled). Values from those wireframes.

/** Back button + Baloo title (+ a sub line, + something on the right). */
export function RequestHeader({ title, sub, right, back }: { title: string; sub?: string; right?: ReactNode; back: () => void }) {
  return (
    <View style={st.header}>
      <Pressable accessibilityRole="button" accessibilityLabel="Back" onPress={back} style={st.back}>
        <Icon name="chevron-left" size={22} tint={color.ink} strokeWidth={2} />
      </Pressable>
      <View style={{ flexGrow: 1, flexShrink: 1, minWidth: 0 }}>
        <Text style={st.title}>{title}</Text>
        {sub ? <Text style={st.headSub}>{sub}</Text> : null}
      </View>
      {right}
    </View>
  );
}

/** Back to the screen before, or `fallback` when the screen was opened from a push. */
export const backOr = (fallback: string) => () => (router.canGoBack() ? router.back() : router.replace(fallback as never));

const PILLS: Record<PillKind, { bg: string; dot: string; ink: string }> = {
  muted: { bg: color.muted, dot: '#8A979D', ink: color.ink2 },
  primary: { bg: color.primaryTint, dot: color.primary, ink: color.primaryStrong },
  ok: { bg: color.okTint, dot: color.ok, ink: color.okInk },
  warn: { bg: color.warnTint, dot: color.warn, ink: color.warnInk },
};

export function Pill({ label, kind }: { label: string; kind: PillKind }) {
  const p = PILLS[kind];
  return (
    <View style={[st.pill, { backgroundColor: p.bg }]}>
      <View style={[st.pillDot, { backgroundColor: p.dot }]} />
      <Text style={[st.pillText, { color: p.ink }]}>{label}</Text>
    </View>
  );
}

export function Initial({ name, bg, size = 40 }: { name: string; bg: string; size?: number }) {
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: bg, alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <Text style={{ fontFamily: font.displayBold, fontSize: size >= 40 ? 17 : 16, color: '#FFFFFF' }}>{(name || '?')[0].toUpperCase()}</Text>
    </View>
  );
}

type Kind = 'primary' | 'tint' | 'outline' | 'danger';

/** The wireframes' 54 px pill buttons: primary (blue), tint (light blue), outline (Decline), danger (Cancel request). */
export function PillButton({ label, onPress, kind = 'primary', icon, busy, disabled, style, height = 54 }: { label: string; onPress: () => void; kind?: Kind; icon?: IconName; busy?: boolean; disabled?: boolean; style?: StyleProp<ViewStyle>; height?: number }) {
  const ink = kind === 'primary' ? '#FFFFFF' : kind === 'tint' ? color.primary : kind === 'danger' ? color.badInk : color.ink;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled || !!busy }}
      disabled={disabled || busy}
      onPress={onPress}
      style={[st.btn, { height }, BTN[kind], disabled && { opacity: 0.5 }, style]}>
      {busy ? <ActivityIndicator color={ink} /> : icon ? <Icon name={icon} size={20} tint={ink} /> : null}
      <Text style={[st.btnText, { color: ink }]}>{label}</Text>
    </Pressable>
  );
}

const BTN: Record<Kind, ViewStyle> = {
  primary: { backgroundColor: color.primary },
  tint: { backgroundColor: color.primaryTint },
  outline: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: color.lineStrong },
  danger: { backgroundColor: 'transparent' },
};

/** Parent Home "Needs you" (P4b "Sat 6–7 PM request · Waiting for Maya to answer"): the family's open pool requests,
 * each opening P46. Nothing before migration 25 runs. */
export function ParentRequestsNeedYou({ familyId }: { familyId: string }) {
  const { data } = useQuery(async () => {
    const [open, sitters] = await Promise.all([requestsApi.openForFamily(familyId).catch(() => []), api.familySitters(familyId).catch(() => [])]);
    return open.map(({ request, asked }) => ({
      request,
      sub: parentRowSub(asked.map((a) => ({ ...a, name: firstName(sitters.find((s) => s.sitter_id === a.sitter_id)?.profile?.full_name) }))),
    }));
  }, [familyId]);
  if (!data?.length) return null;
  return (
    <>
      <Text style={[st.needLabel, { marginTop: SECTION_GAP }]}>NEEDS YOU</Text>
      <View style={st.needCard}>
        {data.map(({ request, sub }, i) => (
          <RequestRow key={request.id} title={requestRowTitle(requestWindow(request))} sub={sub} last={i === data.length - 1} onPress={() => router.push({ pathname: '/parent/request/[id]', params: { id: request.id } })} />
        ))}
      </View>
    </>
  );
}

/** One "Needs you" row for a request (P4b's row: calendar tile, title, sub, chevron). */
/** `sitter`: the S3 list's row (54 high, 20 px icon, set line heights) instead of P4b's (60 high, 22 px icon). */
export function RequestRow({ title, sub, last, onPress, sitter }: { title: string; sub: string; last?: boolean; onPress: () => void; sitter?: boolean }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={[st.needRow, sitter && { minHeight: 54 }, !last && { borderBottomWidth: 1, borderBottomColor: color.divider }]}>
      <View style={[st.needIcon, sitter && { borderRadius: 12 }]}>
        <Icon name="calendar" size={sitter ? 20 : 22} />
      </View>
      <View style={{ flexGrow: 1, flexShrink: 1, minWidth: 0 }}>
        <Text style={[st.needTitle, sitter && { lineHeight: 19 }]}>{title}</Text>
        <Text style={[st.needSub, sitter && { lineHeight: 16 }]} numberOfLines={1}>
          {sub}
        </Text>
      </View>
      <Icon name="chevron-right" size={18} tint={color.ink2} />
    </Pressable>
  );
}

/** Same avatar colors as the Sitters tab (P54), P42 and P43, by the sitter's place in the pool. */
export const AVATAR = [color.primary, '#5E7F6A', '#8A6A4E', '#6F6194', '#5F6D74'];

export const st = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingTop: 16, paddingHorizontal: 20, paddingBottom: 8 },
  back: { width: 44, height: 44, borderRadius: 22, borderWidth: 1, borderColor: color.line, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  title: { fontFamily: font.display, fontSize: 22, color: color.ink, marginVertical: -4.62 },
  headSub: { fontFamily: font.body, fontSize: 13, color: color.ink2 },
  pill: { flexShrink: 0, height: 26, paddingHorizontal: 10, borderRadius: 999, flexDirection: 'row', alignItems: 'center', gap: 6 },
  pillDot: { width: 7, height: 7, borderRadius: 4 },
  pillText: { fontFamily: font.bodyBold, fontSize: 12 },
  btn: { flexGrow: 1, flexBasis: 0, borderRadius: 999, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  btnText: { fontFamily: font.displayBold, fontSize: 17 },
  needLabel: { fontFamily: font.bodyBold, fontSize: 13, color: color.ink2, letterSpacing: 0.6 },
  needCard: { paddingHorizontal: 14, backgroundColor: '#FFFFFF', borderRadius: 24, ...cardShadow },
  needRow: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 60 },
  needIcon: { width: 36, height: 36, borderRadius: 14, backgroundColor: color.primaryTint, alignItems: 'center', justifyContent: 'center' },
  needTitle: { fontFamily: font.bodySemi, fontSize: 15, color: color.ink },
  needSub: { fontFamily: font.body, fontSize: 12, color: color.ink2 },
});
