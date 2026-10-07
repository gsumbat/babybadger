// What a family sees of a sitter, shared by P11 (parent's sitter profile) and S19 (the sitter's own preview):
// the two-column credential badges and the SPEAKS chips. Badges and dates only, never documents.
import { StyleSheet, View } from 'react-native';

import { CIcon, CredTile, credTileKey } from '@/components/credentials';
import { Text } from '@/components/Text';
import { Pill } from '@/components/ui';
import { credentialState, levelLabel, monthDay, monthYear, shortExpiry, sortLanguages, toDay, type Credential, type SitterLanguage } from '@/lib/credentials';
import { color, font } from '@/theme';

const SHORT: Record<string, string> = { first_aid: 'CPR + First Aid', background: 'Background', drivers_license: 'Driver' };

/** One credential: tile, short name with a green check (amber clock when it runs out within 30 days), date line. */
export function CredBadge({ c }: { c: Credential }) {
  const key = credTileKey(c);
  const soon = credentialState(c) === 'expiring';
  const sub =
    c.kind === 'background_check'
      ? c.verified_at
        ? `Checked ${monthYear(toDay(new Date(c.verified_at)))}`
        : ''
      : soon && c.expires_on
        ? `Expires ${monthDay(c.expires_on)}`
        : c.expires_on
          ? `Until ${shortExpiry(c.expires_on)}`
          : (c.issuer ?? '');
  return (
    <View style={{ flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
      <CredTile which={key} box={36} />
      <View style={{ flexGrow: 1, flexShrink: 1, minWidth: 0 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Text style={st.badgeName} numberOfLines={1}>
            {SHORT[key] ?? c.title}
          </Text>
          {soon ? <CIcon name="clock" size={16} tint={color.warn} /> : <CIcon name="check" size={16} tint={color.ok} />}
        </View>
        {sub ? (
          <Text style={[st.badgeSub, soon && { fontFamily: font.bodySemi, color: color.warnInk }]} numberOfLines={1}>
            {sub}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

/** The badges two to a row (gap 12 down, 10 across); "No verified credentials yet." when there are none. */
export function CredGrid({ creds }: { creds: Credential[] }) {
  if (!creds.length) return <Text style={st.none}>No verified credentials yet.</Text>;
  const pairs: Credential[][] = [];
  for (let i = 0; i < creds.length; i += 2) pairs.push(creds.slice(i, i + 2));
  return (
    <View style={{ gap: 12 }}>
      {pairs.map((pair, i) => (
        <View key={i} style={{ flexDirection: 'row', gap: 10 }}>
          {pair.map((c) => (
            <CredBadge key={c.id} c={c} />
          ))}
          {pair.length === 1 ? <View style={{ flex: 1 }} /> : null}
        </View>
      ))}
    </View>
  );
}

/** SPEAKS + "English · native" chips; nothing when she lists no languages. */
export function SpeaksBlock({ langs }: { langs: SitterLanguage[] }) {
  if (!langs.length) return null;
  return (
    <View style={{ gap: 6 }}>
      <Text style={st.label}>SPEAKS</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
        {sortLanguages(langs).map((l) => (
          <Pill key={l.language} label={`${l.language} · ${levelLabel(l.level).toLowerCase()}`} kind="muted" />
        ))}
      </View>
    </View>
  );
}

// Values from wireframes P11 / S19.
export const profileStyles = StyleSheet.create({
  label: { fontFamily: font.bodyBold, fontSize: 13, color: color.ink2, letterSpacing: 0.6 },
});
const st = StyleSheet.create({
  none: { fontFamily: font.body, fontSize: 14, color: color.ink2 },
  badgeName: { fontFamily: font.bodyBold, fontSize: 14, color: color.ink, flexShrink: 1 },
  badgeSub: { fontFamily: font.body, fontSize: 12, color: color.ink2 },
  label: profileStyles.label,
});
