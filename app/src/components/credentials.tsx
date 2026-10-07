import { useEffect, useState, type ReactNode } from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { Text } from '@/components/Text';
import { Pill } from '@/components/ui';
import { BADGE_LABEL, BADGE_PILL, choiceOf, credentialBadge, sitterFileUrl, type Credential } from '@/lib/credentials';
import { cardShadow, color, font } from '@/theme';

// Shared pieces of the profile and credentials screens (S13, S14, S15, S41, S18, P11). Icons are the wireframes' own
// SVG paths (24x24, stroke 1.8, round caps).

export const CRED_PATHS = {
  heartPlus: '<path d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.2a4.3 4.3 0 0 1 7.5 2.6C19.5 15.4 12 20 12 20z"/><path d="M12 10v5M9.5 12.5h5"/>',
  baby: '<circle cx="12" cy="8" r="4"/><path d="M5 21c0-4 3-7 7-7s7 3 7 7"/><path d="M10.5 8h0M13.5 8h0"/>',
  award: '<circle cx="12" cy="9" r="5.5"/><path d="M8.5 13.5L7 21l5-2.5 5 2.5-1.5-7.5"/>',
  drop: '<path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z"/>',
  hand: '<path d="M8 13V6a1.5 1.5 0 0 1 3 0v5M11 11V4.5a1.5 1.5 0 0 1 3 0V11M14 11V6a1.5 1.5 0 0 1 3 0v7c0 4-2.5 7-6 7s-5-2-6.5-4.5L3 12.5a1.5 1.5 0 0 1 2.5-1.5L8 13"/>',
  book: '<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 19V5"/>',
  car: '<path d="M4 16v-4l2-5h12l2 5v4z"/><circle cx="7.5" cy="16.5" r="1.8"/><circle cx="16.5" cy="16.5" r="1.8"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  shield: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M8.5 12l2.5 2.5 4.5-4.5"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z"/>',
  bell: '<path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z"/><path d="M10 20.5a2 2 0 0 0 4 0"/>',
  upload: '<path d="M12 16V4M7 9l5-5 5 5"/><path d="M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3"/>',
  eye: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/>',
  list: '<path d="M9 6h11M9 12h11M9 18h11M4.5 6h0M4.5 12h0M4.5 18h0"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  camera: '<path d="M4 8h3l2-2.5h6L17 8h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13.5 6.5l4 4"/>',
  chevron: '<path d="M9 6l6 6-6 6"/>',
  warn: '<path d="M12 3l9.5 17h-19z"/><path d="M12 10v4M12 17.5h0"/>',
} as const;
export type CredPath = keyof typeof CRED_PATHS;

export function CIcon({ name, size = 22, tint, width = 1.8 }: { name: CredPath; size?: number; tint: string; width?: number }) {
  const xml = `<svg viewBox="0 0 24 24" fill="none" stroke="${tint}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round">${CRED_PATHS[name]}</svg>`;
  return <SvgXml xml={xml} width={size} height={size} style={{ flexShrink: 0 }} />;
}

/** Icon, its color and its tile color for each S15 choice (and the background check / languages rows). */
const RED = { tint: color.bad, bg: color.badTint };
const BLUE = { tint: color.primary, bg: color.primaryTint };
export const CHOICE_ICON: Record<string, { icon: CredPath; tint: string; bg: string }> = {
  first_aid: { icon: 'heartPlus', ...RED },
  cpr_infant: { icon: 'baby', ...RED },
  newborn_care: { icon: 'award', ...BLUE },
  water_safety: { icon: 'drop', ...BLUE },
  special_needs: { icon: 'hand', ...BLUE },
  early_childhood: { icon: 'book', ...BLUE },
  drivers_license: { icon: 'car', ...BLUE },
  other: { icon: 'plus', tint: color.ink2, bg: color.muted },
  background: { icon: 'shield', ...BLUE },
  languages: { icon: 'globe', tint: color.warnInk, bg: color.accentTint },
};

/** Tinted rounded square with the choice's icon (S13 / S14 rows: 40 box, 14 radius, 22 icon). */
export function CredTile({ which, box = 40, size = 22, radius = 14 }: { which: string; box?: number; size?: number; radius?: number }) {
  const ic = CHOICE_ICON[which] ?? CHOICE_ICON.other;
  return (
    <View style={{ width: box, height: box, borderRadius: radius, backgroundColor: ic.bg, alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <CIcon name={ic.icon} size={size} tint={ic.tint} />
    </View>
  );
}

export function credTileKey(c: Credential) {
  return c.kind === 'background_check' ? 'background' : choiceOf(c).key;
}

export function CredPill({ c }: { c: Credential }) {
  const b = credentialBadge(c);
  // Wrapped so the row centers it (Pill pins itself to the top of its parent).
  return (
    <View>
      <Pill label={BADGE_LABEL[b]} kind={BADGE_PILL[b]} />
    </View>
  );
}

/** S13 / S14 list row: tile, title over a sub-line, pill on the right; 68 tall with a divider. */
export function CredRow({ tile, title, sub, right, onPress, last }: { tile: string; title: string; sub?: string; right?: ReactNode; onPress?: () => void; last?: boolean }) {
  return (
    <Pressable accessibilityRole="button" disabled={!onPress} onPress={onPress} style={({ pressed }) => [st.row, !last && st.line, pressed && { opacity: 0.8 }]}>
      <CredTile which={tile} />
      <View style={{ flexGrow: 1, flexShrink: 1, minWidth: 0 }}>
        <Text style={st.title} numberOfLines={1}>
          {title}
        </Text>
        {sub ? (
          <Text style={st.sub} numberOfLines={1}>
            {sub}
          </Text>
        ) : null}
      </View>
      {right ? <View>{right}</View> : null}
    </Pressable>
  );
}

/** The sitter's photo when she added one, else her first letter on blue (S13 72, S40 64, S39 60, P11 64). */
export function SitterAvatar({ name, photoPath, size, fontSize }: { name: string; photoPath?: string | null; size: number; fontSize: number }) {
  const [uri, setUri] = useState<string | null>(null);
  useEffect(() => {
    let live = true;
    sitterFileUrl(photoPath).then((u) => live && setUri(u));
    return () => {
      live = false;
    };
  }, [photoPath]);
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: color.primary, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
      {uri ? (
        <Image source={{ uri }} style={{ width: size, height: size }} />
      ) : (
        <Text style={{ fontFamily: font.display, fontSize, color: '#FFFFFF' }}>{(name.trim()[0] || '?').toUpperCase()}</Text>
      )}
    </View>
  );
}

/** On / off switch drawn in the wireframes (S11, S16): 50 x 30 track, 24 knob. */
export function Toggle({ on, onPress, label }: { on: boolean; onPress: () => void; label: string }) {
  return (
    <Pressable accessibilityRole="switch" accessibilityState={{ checked: on }} accessibilityLabel={label} onPress={onPress} hitSlop={8} style={[st.track, { backgroundColor: on ? color.primary : color.lineStrong }]}>
      <View style={[st.knob, on ? { right: 3 } : { left: 3 }]} />
    </Pressable>
  );
}

export const credStyles = StyleSheet.create({
  label: { fontFamily: font.bodyBold, fontSize: 13, color: color.ink2, letterSpacing: 0.6 },
  listCard: { paddingHorizontal: 16, backgroundColor: '#FFFFFF', borderRadius: 24, ...cardShadow },
  card: { paddingVertical: 14, paddingHorizontal: 16, backgroundColor: '#FFFFFF', borderRadius: 24, ...cardShadow },
  link: { fontFamily: font.bodySemi, fontSize: 14, color: color.primary, textDecorationLine: 'underline' },
});

const st = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 68 },
  line: { borderBottomWidth: 1, borderBottomColor: color.divider },
  title: { fontFamily: font.bodySemi, fontSize: 15, color: color.ink },
  sub: { fontFamily: font.body, fontSize: 13, color: color.ink2 },
  track: { width: 50, height: 30, borderRadius: 15, flexShrink: 0 },
  knob: { position: 'absolute', top: 3, width: 24, height: 24, borderRadius: 12, backgroundColor: '#FFFFFF' },
});
