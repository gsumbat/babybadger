import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { RuleCard, RuleRow, RuleSection } from '@/components/houseRules';
import { Button, ErrorText, Loading, Screen } from '@/components/ui';
import { api, useQuery, useShiftLive } from '@/lib/data';
import { firstName } from '@/lib/format';
import { ruleIcon, ruleIconXml, rulesApi, shiftRuleRows, sitterLine, sortRules } from '@/lib/house-rules';
import { useSession } from '@/lib/session';
import { cardShadow, color, font } from '@/theme';
import { Text } from '@/components/Text';

const BELL = '<svg viewBox="0 0 24 24" fill="none" stroke="#7A4E0E" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z"/><path d="M10 20.5a2 2 0 0 0 4 0"/></svg>';
const DONE = '<svg viewBox="0 0 24 24" fill="none" stroke="#1B6B3D" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';

// Wireframe S43 Today's house rules, from app/src/wireframes/S43.tsx, opened from the House rules strip on S4.
// LOGS: one row per log rule, Done once this shift has that log (from the logs table), Log now opens the log sheet;
// the photo rule is due again when the last photo is older than its interval. REMEMBER: the other rules.
// Left out until built: the kids' screen time card and its timer (the screen time rule is listed under REMEMBER),
// care-plan times on log rows ("Dinner · At 6:00 · Later", "Started around 3:45?").
export default function ShiftRules() {
  const { shiftId } = useLocalSearchParams<{ shiftId: string }>();
  const { sitterLinks } = useSession();
  const { bundle, error } = useShiftLive(shiftId);
  const fid = bundle?.shift.family_id;
  const { data, error: rulesError } = useQuery(async () => {
    if (!fid) return null;
    const [rules, parents] = await Promise.all([rulesApi.rules(fid), api.familyParents(fid)]);
    return { rules, parents };
  }, [fid]);
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(t);
  }, []);

  if (!bundle || !data) return error || rulesError ? <Screen title="Today’s house rules" back><ErrorText>{error || rulesError}</ErrorText></Screen> : <Loading />;
  const { shift, logs, kids } = bundle;
  const family = (sitterLinks.find((l) => l.family_id === shift.family_id)?.family.name ?? 'Family').replace(/^The /, '');
  const parent = firstName(data.parents[0]?.full_name) || 'The family';
  const rows = shiftRuleRows(data.rules, logs, kids, shift.clock_in_at, now);
  const due = rows.filter((r) => r.state === 'due').length;
  const remember = sortRules(data.rules.filter((r) => r.category !== 'logs'));
  const until = new Date(shift.ends_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }).replace(/\s?[AP]M$/i, '');
  const open = shift.status === 'active';

  return (
    <Screen
      title="Today’s house rules"
      subtitle={`${family} · on shift until ${until}`}
      back
      gap={8}
      footer={<Button kind="tonal" label="Back to shift" onPress={() => router.back()} />}>
      {due > 0 && (
        <View style={st.due}>
          <SvgXml xml={BELL} width={20} height={20} style={{ flexShrink: 0 }} />
          <Text style={st.dueText}>
            <Text style={st.dueBold}>{due === 1 ? '1 log due.' : `${due} logs due.`}</Text> {parent} sees them in real time and in the shift report.
          </Text>
        </View>
      )}
      {rows.length > 0 && (
        <>
          <RuleSection first={due === 0} label="LOGS" />
          <View style={st.card}>
            {rows.map((r, i) => (
              <View key={r.rule.id} style={[st.logRow, i < rows.length - 1 && st.line]}>
                <SvgXml xml={ruleIconXml(ruleIcon(r.rule), color.primary)} width={20} height={20} style={{ flexShrink: 0 }} />
                <View style={{ flexGrow: 1, flexShrink: 1 }}>
                  <Text style={st.logTitle}>{r.title}</Text>
                  {r.sub ? <Text style={st.logSub}>{r.sub}</Text> : null}
                </View>
                {r.state === 'done' ? (
                  <View style={st.done}>
                    <SvgXml xml={DONE} width={14} height={14} style={{ flexShrink: 0 }} />
                    <Text style={st.doneText}>Done</Text>
                  </View>
                ) : r.state === 'due' && open ? (
                  <Pressable accessibilityRole="button" onPress={() => router.push({ pathname: '/sitter/log/[shiftId]', params: { shiftId: shift.id, kind: r.kind } })} style={st.logNow}>
                    <Text style={st.logNowText}>Log now</Text>
                  </Pressable>
                ) : (
                  <Text style={st.later}>Later</Text>
                )}
              </View>
            ))}
          </View>
        </>
      )}
      {remember.length > 0 && (
        <>
          <RuleSection first={due === 0 && !rows.length} label="REMEMBER" />
          <RuleCard>
            {remember.map((r, n) => {
              const line = sitterLine(r);
              return <RuleRow key={r.id} icon={ruleIcon(r)} title={line.title} sub={line.sub} strength={r.strength} last={n === remember.length - 1} />;
            })}
          </RuleCard>
        </>
      )}
    </Screen>
  );
}

const st = StyleSheet.create({
  due: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, paddingHorizontal: 14, backgroundColor: color.warnTint, borderRadius: 14 },
  dueText: { fontFamily: font.body, fontSize: 13, color: color.ink, lineHeight: 18, flexShrink: 1 },
  dueBold: { fontFamily: font.bodyBold, color: color.warnInk },
  card: { paddingHorizontal: 14, backgroundColor: '#FFFFFF', borderRadius: 24, ...cardShadow },
  line: { borderBottomWidth: 1, borderBottomColor: color.divider },
  logRow: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 52 },
  logTitle: { fontFamily: font.bodySemi, fontSize: 14, color: color.ink },
  logSub: { fontFamily: font.body, fontSize: 12, color: color.ink2 },
  done: { flexDirection: 'row', alignItems: 'center', gap: 4, height: 26, paddingHorizontal: 10, backgroundColor: color.okTint, borderRadius: 999, flexShrink: 1 },
  doneText: { fontFamily: font.bodyBold, fontSize: 12, color: color.okInk },
  logNow: { flexDirection: 'row', alignItems: 'center', height: 34, paddingHorizontal: 14, backgroundColor: color.primary, borderRadius: 999, flexShrink: 1 },
  logNowText: { fontFamily: font.bodyBold, fontSize: 13, color: '#FFFFFF' },
  later: { fontFamily: font.bodyBold, fontSize: 12, color: color.ink2, flexShrink: 1 },
});
