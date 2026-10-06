import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { RuleCard, RuleRow, RuleSection } from '@/components/houseRules';
import { Button, ErrorText, Loading, Screen } from '@/components/ui';
import { api, useQuery } from '@/lib/data';
import { firstName } from '@/lib/format';
import { familyPossessive, groupRules, ruleIcon, rulesApi, rulesCount, sitterLine } from '@/lib/house-rules';
import { useSession } from '@/lib/session';
import { color, font } from '@/theme';
import { Text } from '@/components/Text';

const CHECK = '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7" fill="none" stroke="#FFFFFF" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

// Wireframe S42 House rules (the sitter reads and agrees), from app/src/wireframes/S42.tsx. Shown before the S2
// notice when the family has Must rules (`?next=consent`, like the canvas flow S42 -> S2), from Home's "Needs you"
// when the family changed its Must rules, and when clock-in is refused for them. "Ask Jen about a rule" opens Messages.
export default function SitterHouseRules() {
  const { familyId, next } = useLocalSearchParams<{ familyId: string; next?: string }>();
  const { session, sitterLinks } = useSession();
  const uid = session!.user.id;
  const familyName = sitterLinks.find((l) => l.family_id === familyId)?.family.name ?? 'The family';
  const { data, error } = useQuery(async () => {
    const [rules, parents] = await Promise.all([rulesApi.rules(familyId!), api.familyParents(familyId!)]);
    return { rules, parents };
  }, [familyId]);
  const [agree, setAgree] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  if (!data) return error ? <Screen title="House rules" back><ErrorText>{error}</ErrorText></Screen> : <Loading />;
  const names = familyPossessive(familyName);
  const parent = firstName(data.parents[0]?.full_name) || 'the family';
  const sections = groupRules(data.rules);
  const count = rulesCount(data.rules);

  async function accept() {
    setBusy(true);
    setErr('');
    try {
      await rulesApi.agree(familyId!, uid);
      if (next === 'consent') router.replace(`/sitter/consent/${familyId}?rules=1`);
      else router.back();
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen
      title={`${names.title} house rules`}
      subtitle="Read before your first shift"
      back
      gap={8}
      footer={
        <View style={{ gap: 2 }}>
          <Button label="Agree and continue" onPress={accept} busy={busy} disabled={!agree} />
          <Pressable accessibilityRole="button" onPress={() => router.push(`/sitter/messages?family=${familyId}`)} style={st.ask}>
            <Text style={st.askText}>Ask {parent} about a rule</Text>
          </Pressable>
        </View>
      }>
      {count ? (
        <View style={st.intro}>
          <Text style={st.introText}>
            <Text style={st.introBold}>{count}</Text> Logs take a tap in the app; you’ll get reminders during the shift.
          </Text>
        </View>
      ) : null}
      {sections.map((s) => (
        <View key={s.label} style={{ gap: 8 }}>
          <RuleSection label={s.label} />
          <RuleCard>
            {s.rules.map((r, n) => {
              const line = sitterLine(r);
              return <RuleRow key={r.id} compact icon={ruleIcon(r)} title={line.title} sub={line.sub} strength={r.strength} last={n === s.rules.length - 1} />;
            })}
          </RuleCard>
        </View>
      ))}
      <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: agree }} onPress={() => setAgree((a) => !a)} style={st.agreeRow}>
        <View style={[st.check, agree && st.checkOn]}>{agree ? <SvgXml xml={CHECK} width={18} height={18} style={{ flexShrink: 0 }} /> : null}</View>
        <Text style={st.agree}>I’ve read {names.line} house rules and agree to the must-dos</Text>
      </Pressable>
      <ErrorText>{err}</ErrorText>
    </Screen>
  );
}

const st = StyleSheet.create({
  intro: { paddingVertical: 10, paddingHorizontal: 14, backgroundColor: color.primaryTint, borderRadius: 14 },
  introText: { fontFamily: font.body, fontSize: 13, color: color.ink, lineHeight: 18 },
  introBold: { fontFamily: font.bodyBold, color: color.primaryStrong },
  agreeRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginTop: 2 },
  check: { width: 26, height: 26, flexShrink: 0, borderRadius: 8, borderWidth: 2, borderColor: color.lineStrong, alignItems: 'center', justifyContent: 'center' },
  checkOn: { backgroundColor: color.primary, borderColor: color.primary },
  agree: { fontFamily: font.body, fontSize: 14, color: color.ink, lineHeight: 20, flexShrink: 1 },
  ask: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 36 },
  askText: { fontFamily: font.bodyBold, fontSize: 14, color: color.primary, textDecorationLine: 'underline' },
});
