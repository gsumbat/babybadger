import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { CareIcon } from '@/components/care';
import { HelperNote } from '@/components/familyMembers';
import { ErrorText, Loading, Screen } from '@/components/ui';
import { api, useQuery } from '@/lib/data';
import { daysLabel, detailLabel, EVERY_DAY, formatTime, itemTitle, kidDayItems, repeatLabel, scheduleLabel } from '@/lib/care-plan';
import { useSession } from '@/lib/session';
import type { CareType } from '@/lib/types';
import { useCanManage } from '@/lib/use-family-role';
import { cardShadow, color, font } from '@/theme';
import { Text } from '@/components/Text';

// Icons from wireframe P20.
const MORE = '<svg viewBox="0 0 24 24" fill="none" stroke="#4B5960" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="5" cy="12" r="1.2"/><circle cx="12" cy="12" r="1.2"/><circle cx="19" cy="12" r="1.2"/></svg>';
const PLUS = '<svg viewBox="0 0 24 24" fill="none" stroke="#47698A" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>';

type Row = { key: string; type: CareType; title: string; detail: string; starts: string | null; ends: string | null; days: number; every: number | null; everyone?: boolean; open?: () => void };

// Wireframe P20 Routine, from app/src/wireframes/P20.tsx, opened from the kid profile's "Her plan" (P55) with the title in the back header ("‹ Ava’s day")
// instead of the Add-a-child step header. Left out: the Places row and the "Set a time ... to continue" footer
// (it belongs to Add a child), and the Suggested / Start blank switch (dropped: it only listed what is saved, plus
// age suggestions that "+ Add to Ava's day" covers). A repeating item shows its start chip
// (or an "Every 2 hrs" chip with no start time) and "Every 3 hrs" where the days go. Bottle and medicine extras
// follow the days ("Every 3 hrs · 4 oz formula").
// A family helper (P20h) reads the saved day only: no hint, no •••, times as plain
// text (no "Set a time"), no "Add to Ava's day"; the note "Jen manages Ava’s day." instead.
// It is her whole plan in one timeline (P20k): her own items and the whole-family ones ("Everyone" label, e.g.
// "Pick up from school"), in time order, with her food to avoid on top. The family Care plan (P7) keeps its
// Tasks / Meals / Routines tabs.
export default function KidRoutine() {
  const { kidId } = useLocalSearchParams<{ kidId: string }>();
  const fid = useSession().family!.id;
  const { data, error } = useQuery(async () => {
    const [kid, items] = await Promise.all([api.kid(kidId), api.careItems(fid)]);
    return { kid, items: kidDayItems(items, kidId) };
  }, [kidId, fid]);
  const manage = useCanManage();

  if (!data) return error ? <Screen back><ErrorText>{error}</ErrorText></Screen> : <Loading />;
  const { kid, items } = data;
  const add = (q: string) => router.push(`/parent/care/item?kidId=${kid.id}${q}`);

  const rows: Row[] = items.map((i) => ({ key: i.id, type: i.type, title: itemTitle(i), detail: detailLabel(i), starts: i.starts, ends: i.ends, days: i.days, every: i.every_minutes ?? null, everyone: i.kid_id === null, open: manage ? () => router.push(`/parent/care/item?id=${i.id}`) : undefined }));

  return (
    <Screen back title={`${kid.name}’s day`} gap={8}>
      <ErrorText>{error}</ErrorText>
      {kid.avoid_foods.trim() ? (
        <View style={st.avoid}>
          <Text style={st.avoidTitle}>Food to avoid</Text>
          <Text style={st.avoidText}>{kid.avoid_foods}</Text>
        </View>
      ) : null}
      {manage ? <Text style={st.hint}>Her routine and the family’s to-dos, in one day. Tap ••• to change one.</Text> : null}
      {rows.length ? (
        <View style={st.card}>
          {rows.map((r, i) => (
            <View key={r.key} style={[st.row, i < rows.length - 1 && st.rowLine]}>
              <CareIcon type={r.type} />
              <View style={{ flexDirection: 'column', gap: 4, minWidth: 0, flexGrow: 1, flexShrink: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Text style={st.rowTitle}>{r.title}</Text>
                  {r.everyone ? (
                    <View style={st.everyone}>
                      <Text style={st.everyoneText}>Everyone</Text>
                    </View>
                  ) : null}
                  <View style={{ flexGrow: 1 }} />
                  {r.open ? (
                    <Pressable accessibilityRole="button" accessibilityLabel={`More about ${r.title}`} onPress={r.open} hitSlop={8} style={st.more}>
                      <SvgXml xml={MORE} width={20} height={20} style={{ flexShrink: 0 }} />
                    </Pressable>
                  ) : null}
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
                  {r.every && !r.starts ? (
                    // A repeat with no start time runs from the start of the shift (P20's "Every 2 hrs" chip).
                    <Pressable accessibilityRole="button" disabled={!r.open} onPress={r.open} style={st.chip}>
                      <Text style={st.chipText}>{repeatLabel(r.every)}</Text>
                    </Pressable>
                  ) : r.starts ? (
                    <>
                      <Pressable accessibilityRole="button" disabled={!r.open} onPress={r.open} style={st.chip}>
                        <Text style={st.chipText}>{formatTime(r.starts)}</Text>
                      </Pressable>
                      {r.ends && !r.every ? (
                        <>
                          <Text style={st.sub}>to</Text>
                          <Pressable accessibilityRole="button" disabled={!r.open} onPress={r.open} style={st.chip}>
                            <Text style={st.chipText}>{formatTime(r.ends)}</Text>
                          </Pressable>
                        </>
                      ) : null}
                    </>
                  ) : r.open ? (
                    <Pressable accessibilityRole="button" onPress={r.open} style={st.setTime}>
                      <Text style={st.setTimeText}>Set a time</Text>
                    </Pressable>
                  ) : (
                    <Text style={st.sub}>Any time</Text>
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
      ) : manage ? null : (
        <Text style={st.hint}>Nothing set for {kid.name}’s day yet.</Text>
      )}
      {manage ? (
        <Pressable accessibilityRole="button" onPress={() => add('')} style={st.add}>
          <SvgXml xml={PLUS} width={20} height={20} style={{ flexShrink: 0 }} />
          <Text style={st.addText}>Add to {kid.name}’s day</Text>
        </Pressable>
      ) : (
        <HelperNote what={`${kid.name}’s day`} />
      )}
    </Screen>
  );
}

// P20 values
const st = StyleSheet.create({
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
  // P20k: food to avoid on top (same card as P7m) and the grey "Everyone" label on whole-family rows.
  avoid: { gap: 2, paddingVertical: 12, paddingHorizontal: 14, backgroundColor: color.badTint, borderRadius: 12 },
  avoidTitle: { fontFamily: font.bodyBold, fontSize: 14, color: color.badInk },
  avoidText: { fontFamily: font.body, fontSize: 14, color: '#6E2215' },
  everyone: { height: 22, paddingHorizontal: 8, justifyContent: 'center', backgroundColor: color.muted, borderRadius: 999, flexShrink: 0 },
  everyoneText: { fontFamily: font.bodyBold, fontSize: 12, color: color.ink2 },
});
