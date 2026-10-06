import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { Button, ErrorText, Loading, Screen } from '@/components/ui';
import { useQuery } from '@/lib/data';
import { CATALOGUE, CHIP_SECTIONS, chipRule, rulesApi } from '@/lib/house-rules';
import { useSession } from '@/lib/session';
import { color, font } from '@/theme';
import { Text } from '@/components/Text';

const CHECK = '<svg viewBox="0 0 24 24" fill="none" stroke="#34526E" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
const PLUS = '<svg viewBox="0 0 24 24" fill="none" stroke="#4B5960" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>';

// Wireframe P75 Add rules, from app/src/wireframes/P75.tsx: the most-chosen rules as chips in P75's sections.
// Rules the family already has show as picked and stay picked (remove one on P76). New picks are added with the
// strength most parents give them; the button counts the new picks.
export default function AddRules() {
  const { family } = useSession();
  const fid = family!.id;
  const { data, error } = useQuery(() => rulesApi.rules(fid), [fid]);
  const [picked, setPicked] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  if (!data) return error ? <Screen title="Add rules" back><ErrorText>{error}</ErrorText></Screen> : <Loading />;
  const have = new Set(data.map((r) => r.key).filter(Boolean));

  async function add() {
    setBusy(true);
    setErr('');
    try {
      await rulesApi.add(fid, picked.map(chipRule));
      router.back();
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  const n = picked.length;
  return (
    <Screen
      title="Add rules"
      subtitle="Most chosen by parents"
      back
      gap={24}
      footer={<Button label={n === 0 ? 'Add rules' : n === 1 ? 'Add 1 rule' : `Add ${n} rules`} onPress={add} busy={busy} disabled={!n} />}>
      {CHIP_SECTIONS.map((s) => (
        <View key={s.category} style={{ gap: 8 }}>
          <Text style={st.label}>{s.label}</Text>
          <View style={st.chips}>
            {CATALOGUE.filter((c) => c.category === s.category).map((c) => {
              const on = have.has(c.key) || picked.includes(c.key);
              const toggle = have.has(c.key) ? undefined : () => setPicked((p) => (p.includes(c.key) ? p.filter((k) => k !== c.key) : [...p, c.key]));
              return (
                <Pressable key={c.key} accessibilityRole="checkbox" accessibilityState={{ checked: on, disabled: have.has(c.key) }} onPress={toggle} style={[st.chip, on ? st.chipOn : st.chipOff]}>
                  <SvgXml xml={on ? CHECK : PLUS} width={16} height={16} style={{ flexShrink: 0 }} />
                  <Text style={[st.chipText, { color: on ? color.primaryStrong : color.ink }]}>{c.chip}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      ))}
      <Pressable accessibilityRole="button" onPress={() => router.push('/parent/rules/rule')} style={st.own}>
        <Text style={st.ownText}>+ Write your own rule</Text>
      </Pressable>
      <ErrorText>{err}</ErrorText>
    </Screen>
  );
}

const st = StyleSheet.create({
  label: { fontFamily: font.bodyBold, fontSize: 13, color: color.ink2, letterSpacing: 0.6 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: { flexDirection: 'row', alignSelf: 'flex-start', alignItems: 'center', gap: 6, height: 40, paddingHorizontal: 14, borderRadius: 999, flexShrink: 1 },
  chipOn: { backgroundColor: color.primaryTint, borderWidth: 1.5, borderColor: color.primary },
  chipOff: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: color.line },
  chipText: { fontFamily: font.bodySemi, fontSize: 14 },
  // Same dashed button as "+ Add rules" on P74.
  own: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 46, borderRadius: 999, borderWidth: 2, borderColor: '#C9D3DD', borderStyle: 'dashed' },
  ownText: { fontFamily: font.displayBold, fontSize: 16, color: color.primary },
});
