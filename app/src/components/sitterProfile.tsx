// What a family sees of a sitter, shared by P11 (parent's sitter profile) and S19 (the sitter's own preview): the
// SPEAKS chips from her profile. Her cards are private; a family sees one only after she shares it (P11 "What Maya
// shared with you", components/requirementRequests SharedCard).
import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/Text';
import { Pill } from '@/components/ui';
import { levelLabel, sortLanguages, type SitterLanguage } from '@/lib/credentials';
import { color, font } from '@/theme';

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
  label: profileStyles.label,
});
