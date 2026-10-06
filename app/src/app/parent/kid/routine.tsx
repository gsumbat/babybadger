import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { CareIcon } from '@/components/care';
import { ErrorText, Loading, Screen } from '@/components/ui';
import { api, useQuery } from '@/lib/data';
import { daysLabel, detailLabel, EVERY_DAY, formatTime, itemTitle, repeatLabel, scheduleLabel, sortItems, suggestedLabel, suggestedRoutine } from '@/lib/care-plan';
import { ageInMonths } from '@/lib/kid-profile';
import type { CareType } from '@/lib/types';
import { cardShadow, color, font } from '@/theme';
import { Text } from '@/components/Text';

// Icons from wireframe P20.
const MORE = '<svg viewBox="0 0 24 24" fill="none" stroke="#4B5960" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="5" cy="12" r="1.2"/><circle cx="12" cy="12" r="1.2"/><circle cx="19" cy="12" r="1.2"/></svg>';
const PLUS = '<svg viewBox="0 0 24 24" fill="none" stroke="#47698A" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>';

type Row = { key: string; type: CareType; title: string; detail: string; starts: string | null; ends: string | null; days: number; every: number | null; open: () => void };

// Wireframe P20 Routine, from app/src/wireframes/P20.tsx, opened from the kid profile (P55) with a plain back header
// instead of the Add-a-child step header. Left out: the Places row and the "Set a time ... to continue" footer
// (it belongs to Add a child). "Suggested" lists the saved items plus age suggestions not yet added (not saved;
// tapping one opens P20a prefilled); "Start blank" lists only what is saved. A repeating item shows its start chip
// (or an "Every 2 hrs" chip with no start time) and "Every 3 hrs" where the days go. Bottle and medicine extras
// follow the days ("Every 3 hrs · 4 oz formula").
export default function KidRoutine() {
  const { kidId } = useLocalSearchParams<{ kidId: string }>();
  const { data, error } = useQuery(async () => {
    const [kid, items] = await Promise.all([api.kid(kidId), api.kidCareItems(kidId)]);
    return { kid, items: sortItems(items) };
  }, [kidId]);
  const [mode, setMode] = useState<'suggested' | 'blank'>();

  if (!data) return error ? <Screen back><ErrorText>{error}</ErrorText></Screen> : <Loading />;
  const { kid, items } = data;
  const months = kid.birthdate ? ageInMonths(kid.birthdate) : null;
  // A kid with nothing saved starts on the suggestions; one with a routine starts on what's saved.
  const seg = mode ?? (items.length ? 'blank' : 'suggested');
  const add = (q: string) => router.push(`/parent/care/item?kidId=${kid.id}${q}`);

  const rows: Row[] = items.map((i) => ({ key: i.id, type: i.type, title: itemTitle(i), detail: detailLabel(i), starts: i.starts, ends: i.ends, days: i.days, every: i.every_minutes ?? null, open: () => router.push(`/parent/care/item?id=${i.id}`) }));
  if (seg === 'suggested') {
    const have = new Set(items.map((i) => itemTitle(i).toLowerCase()));
    for (const s of suggestedRoutine(months))
      if (!have.has(s.title.toLowerCase()))
        rows.push({ key: `s-${s.title}`, type: s.type, title: s.title, detail: '', starts: null, ends: null, days: EVERY_DAY, every: s.every_minutes ?? null, open: () => add(`&type=${s.type}&title=${encodeURIComponent(s.title)}${s.every_minutes ? `&every=${s.every_minutes}` : ''}`) });
  }

  return (
    <Screen back gap={8}>
      <ErrorText>{error}</ErrorText>
      <Text style={st.title}>{kid.name}’s day</Text>
      <View style={st.seg}>
        <View style={{ flexDirection: 'row', gap: 4 }}>
          {(
            [
              ['suggested', suggestedLabel(months)],
              ['blank', 'Start blank'],
            ] as const
          ).map(([v, label]) => {
            const on = seg === v;
            return (
              <Pressable key={v} accessibilityRole="button" accessibilityState={{ selected: on }} onPress={() => setMode(v)} style={[st.segItem, on && { backgroundColor: '#FFFFFF' }]}>
                <Text style={[st.segText, on && st.segTextOn]} numberOfLines={1}>
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
      <Text style={st.hint}>Tap a time to change it, or ••• for more details.</Text>
      {rows.length ? (
        <View style={st.card}>
          {rows.map((r, i) => (
            <View key={r.key} style={[st.row, i < rows.length - 1 && st.rowLine]}>
              <CareIcon type={r.type} />
              <View style={{ flexDirection: 'column', gap: 4, minWidth: 0, flexGrow: 1, flexShrink: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Text style={st.rowTitle}>{r.title}</Text>
                  <Pressable accessibilityRole="button" accessibilityLabel={`More about ${r.title}`} onPress={r.open} hitSlop={8} style={st.more}>
                    <SvgXml xml={MORE} width={20} height={20} />
                  </Pressable>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
                  {r.every && !r.starts ? (
                    // A repeat with no start time runs from the start of the shift (P20's "Every 2 hrs" chip).
                    <Pressable accessibilityRole="button" onPress={r.open} style={st.chip}>
                      <Text style={st.chipText}>{repeatLabel(r.every)}</Text>
                    </Pressable>
                  ) : r.starts ? (
                    <>
                      <Pressable accessibilityRole="button" onPress={r.open} style={st.chip}>
                        <Text style={st.chipText}>{formatTime(r.starts)}</Text>
                      </Pressable>
                      {r.ends && !r.every ? (
                        <>
                          <Text style={st.sub}>to</Text>
                          <Pressable accessibilityRole="button" onPress={r.open} style={st.chip}>
                            <Text style={st.chipText}>{formatTime(r.ends)}</Text>
                          </Pressable>
                        </>
                      ) : null}
                    </>
                  ) : (
                    <Pressable accessibilityRole="button" onPress={r.open} style={st.setTime}>
                      <Text style={st.setTimeText}>Set a time</Text>
                    </Pressable>
                  )}
                  {(() => {
                    const when = r.every && !r.starts ? ((r.days & EVERY_DAY) !== EVERY_DAY ? daysLabel(r.days) : '') : scheduleLabel({ days: r.days, every_minutes: r.every });
                    const sub = [when, r.detail].filter(Boolean).join(' · ');
                    return sub ? <Text style={[st.sub, { marginLeft: 4 }]}>{sub}</Text> : null;
                  })()}
                </View>
              </View>
            </View>
          ))}
        </View>
      ) : null}
      <Pressable accessibilityRole="button" onPress={() => add('')} style={st.add}>
        <SvgXml xml={PLUS} width={20} height={20} />
        <Text style={st.addText}>Add to {kid.name}’s day</Text>
      </Pressable>
    </Screen>
  );
}

// P20 values
const st = StyleSheet.create({
  title: { fontFamily: font.display, fontSize: 26, color: color.ink, marginVertical: -4.83 },
  seg: { padding: 4, backgroundColor: color.muted, borderRadius: 12 },
  segItem: { flex: 1, minWidth: 0, height: 34, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  segText: { fontFamily: font.bodyMedium, fontSize: 13, color: color.ink2 },
  segTextOn: { fontFamily: font.bodyBold, color: color.ink },
  hint: { fontFamily: font.body, fontSize: 13, color: color.ink2, lineHeight: 18 },
  card: { paddingHorizontal: 14, backgroundColor: '#FFFFFF', borderRadius: 24, ...cardShadow },
  row: { flexDirection: 'row', gap: 12, paddingVertical: 9 },
  rowLine: { borderBottomWidth: 1, borderBottomColor: color.divider },
  rowTitle: { fontFamily: font.bodyBold, fontSize: 15, color: color.ink, flexShrink: 1 },
  more: { width: 28, height: 28, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  chip: { height: 34, paddingHorizontal: 10, justifyContent: 'center', backgroundColor: '#FFFFFF', borderRadius: 8, borderWidth: 1, borderColor: color.lineStrong },
  chipText: { fontFamily: font.bodySemi, fontSize: 14, color: color.ink },
  setTime: { height: 34, paddingHorizontal: 10, justifyContent: 'center', backgroundColor: '#F7ECED', borderRadius: 8, borderWidth: 1.5, borderColor: color.warn, borderStyle: 'dashed' },
  setTimeText: { fontFamily: font.bodySemi, fontSize: 14, color: color.warnInk },
  sub: { fontFamily: font.body, fontSize: 13, color: color.ink2, flexShrink: 1 },
  add: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: 46, borderRadius: 999, borderWidth: 2, borderColor: '#C9D3DD', borderStyle: 'dashed' },
  addText: { fontFamily: font.displayBold, fontSize: 16, color: color.primary },
});
