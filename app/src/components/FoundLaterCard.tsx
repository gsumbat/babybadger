import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { SwitchTrack } from '@/components/InviteAccess';
import { Text } from '@/components/Text';
import { ErrorText } from '@/components/ui';
import { FOUND_LATER, foundLaterBody } from '@/lib/family-links';
import { foundLaterApi } from '@/lib/family-referrals';
import { cardShadow, color, font } from '@/theme';

/**
 * "Be found by new families later" (wireframes S12 / S12b Privacy, S13 / S13c My profile). Consent only: off by
 * default, nothing changes today (no marketplace in phase 1). Only the sitter reads or changes it (migration 29);
 * before migration 29 the switch shows off and says the database needs the update when tapped.
 */
export function FoundLaterCard() {
  const [on, setOn] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  useEffect(() => {
    let live = true;
    foundLaterApi.get().then((r) => live && setOn(r.on));
    return () => {
      live = false;
    };
  }, []);

  async function toggle() {
    const next = !on;
    setOn(next);
    setBusy(true);
    setErr('');
    try {
      setOn((await foundLaterApi.set(next)).on);
    } catch (e) {
      setOn(!next);
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <View style={st.card}>
      <Pressable accessibilityRole="switch" accessibilityState={{ checked: on, disabled: busy }} accessibilityLabel={FOUND_LATER.title} disabled={busy} onPress={toggle} style={st.top}>
        <Text style={st.title}>{FOUND_LATER.title}</Text>
        <SwitchTrack value={on} />
      </Pressable>
      <Text style={st.body}>{foundLaterBody(on)}</Text>
      <ErrorText>{err}</ErrorText>
    </View>
  );
}

// Values from wireframes S12 / S13 (the card).
const st = StyleSheet.create({
  card: { gap: 8, paddingVertical: 14, paddingHorizontal: 16, backgroundColor: '#FFFFFF', borderRadius: 24, ...cardShadow },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  title: { flexShrink: 1, fontFamily: font.bodyBold, fontSize: 15, color: color.ink },
  body: { fontFamily: font.body, fontSize: 13, lineHeight: 18, color: color.ink2 },
});
