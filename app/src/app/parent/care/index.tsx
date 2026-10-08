import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { KidDot } from '@/components/bits';
import { HelperNote } from '@/components/familyMembers';
import { Chip, ErrorText, Icon, Loading, Screen } from '@/components/ui';
import { api, useQuery } from '@/lib/data';
import { avoidKids, isEveryone, isFood, itemLine, itemTitle, planAdd, planItems, planKidId, planKids, planTitle, scheduleLabel, shortTime, sortItems, type PlanTab } from '@/lib/care-plan';
import { useSession } from '@/lib/session';
import { useCanManage } from '@/lib/use-family-role';
import type { CareItem, Kid } from '@/lib/types';
import { cardShadow, color, font } from '@/theme';
import { Text } from '@/components/Text';

const TABS: { value: PlanTab; label: string }[] = [
  { value: 'tasks', label: 'Tasks' },
  { value: 'meals', label: 'Meals' },
  { value: 'routines', label: 'Routines' },
];

// Wireframe P7 Care plan, from app/src/wireframes/P7.tsx. Tasks = whole-family items (not food); Meals = meals and
// bottles (family and kids); Routines = one row per kid -> P20. The Requirements pill opens P7a. Left out until built: the
// "Weekday after school" template row with its Templates link, and the "Trip" tags. Row titles carry the type's
// extras ("Bottle · 4 oz formula", "Tylenol · 5 ml").
// A read-only member (P7h) reads it: no Requirements pill, no "+ Add task" (the note "Jen manages the care plan."
// instead), rows open the whole item read-only (P20v) instead of the editor (P20a); Routines rows open the kid's day
// read-only (P20h).
// Kid filter (P7k / P7m / P7r): All · Ava · Leo chips under the tabs (only with two or more kids), ?kidId= preselects
// (P55's "Her plan"). A kid: the title reads "Ava’s plan", family rows carry "Everyone", Tasks adds her own non-food
// items, Meals her meals and bottles, Routines only her row; new items are pre-assigned to her. Food to avoid shows
// on Meals only (P7m), for the selected kid. The add button reads "+ Add meal" on Meals; Routines has none.
export default function CarePlan() {
  const { family } = useSession();
  const manage = useCanManage();
  const fid = family!.id;
  const { data, error } = useQuery(async () => {
    const [items, kids] = await Promise.all([api.careItems(fid), api.kids(fid)]);
    return { items: sortItems(items), kids };
  }, [fid]);
  const params = useLocalSearchParams<{ kidId?: string }>();
  const [tab, setTab] = useState<PlanTab>('tasks');

  if (!data) return error ? <Screen title="Care plan" back><ErrorText>{error}</ErrorText></Screen> : <Loading />;
  const { items, kids } = data;
  const kidId = planKidId(kids, params.kidId);
  const kidName = (id: string | null) => kids.find((k) => k.id === id)?.name;
  const shown = planItems(items, tab, kidId);
  const avoid = avoidKids(kids, tab, kidId);
  const add = manage ? planAdd(tab, kidId) : null;
  // setParams keeps the choice in the route, so back / forward and deep links land on the same kid.
  const pick = (id: string | null) => router.setParams({ kidId: id ?? undefined });

  return (
    <Screen
      gap={10}
      header={
        <View style={st.head}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Pressable accessibilityRole="button" accessibilityLabel="Back" onPress={() => router.back()} style={st.back}>
              <Icon name="chevron-left" size={22} tint={color.ink} strokeWidth={2} />
            </Pressable>
            <Text style={st.title} numberOfLines={1}>
              {planTitle(kidName(kidId))}
            </Text>
            {manage ? (
              <Pressable accessibilityRole="button" onPress={() => router.push('/parent/requirements')} style={st.reqPill}>
                <SvgXml xml={SHIELD} width={16} height={16} style={{ flexShrink: 0 }} />
                <Text style={st.reqPillText}>Requirements</Text>
              </Pressable>
            ) : null}
          </View>
          <View style={st.seg}>
            {TABS.map((t) => {
              const on = t.value === tab;
              return (
                <Pressable key={t.value} accessibilityRole="button" accessibilityState={{ selected: on }} onPress={() => setTab(t.value)} style={[st.segItem, on && { backgroundColor: '#FFFFFF' }]}>
                  <Text style={[st.segText, on && st.segTextOn]}>{t.label}</Text>
                </Pressable>
              );
            })}
          </View>
          {kids.length > 1 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={st.chips} contentContainerStyle={st.chipRow}>
              <Chip label="All" on={!kidId} onPress={() => pick(null)} />
              {kids.map((k) => (
                <Chip key={k.id} label={k.name} on={k.id === kidId} onPress={() => pick(k.id)} lead={<KidDot kid={k} size={20} />} />
              ))}
            </ScrollView>
          ) : null}
        </View>
      }>
      <ErrorText>{error}</ErrorText>
      {avoid.map((k) => (
        <View key={k.id} style={st.avoid}>
          <Text style={st.avoidTitle}>{k.name} · food to avoid</Text>
          <Text style={st.avoidText}>{k.avoid_foods}</Text>
        </View>
      ))}

      {tab === 'routines' ? (
        kids.length ? <Routines kids={planKids(kids, kidId)} items={items} manage={manage} /> : null
      ) : (
        <>
          {shown.length ? (
            <View style={st.card}>
              {shown.map((i, n) => (
                <ItemRow key={i.id} item={i} kid={kidId ? undefined : kidName(i.kid_id)} everyone={isEveryone(i, kidId)} last={n === shown.length - 1} edit={manage} />
              ))}
            </View>
          ) : null}
          {add ? (
            <Pressable accessibilityRole="button" onPress={() => router.push(add.href)} style={st.add}>
              <Text style={st.addText}>{add.label}</Text>
            </Pressable>
          ) : manage ? null : (
            <>
              {shown.length ? null : <Text style={st.none}>{tab === 'meals' ? 'No meals in the plan yet.' : 'No tasks in the plan yet.'}</Text>}
              <HelperNote what="the care plan" />
            </>
          )}
        </>
      )}
    </Screen>
  );
}

function ItemRow({ item, kid, everyone, last, edit }: { item: CareItem; kid?: string; everyone: boolean; last: boolean; edit: boolean }) {
  const sub = [scheduleLabel(item), kid, item.how.split('\n')[0]].filter(Boolean).join(' · ');
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => router.push(edit ? `/parent/care/item?id=${item.id}` : `/parent/care/view?id=${item.id}`)}
      style={[st.row, !last && st.rowLine]}>
      <View style={{ width: 44, flexShrink: 1 }}>
        <Text style={st.time}>{shortTime(item.starts)}</Text>
      </View>
      <View style={{ flexDirection: 'column', flexGrow: 1, flexShrink: 1 }}>
        <Text style={st.rowTitle}>{itemLine(item)}</Text>
        <Text style={st.rowSub} numberOfLines={1}>
          {sub}
        </Text>
      </View>
      {everyone ? (
        <View style={st.everyone}>
          <Text style={st.everyoneText}>Everyone</Text>
        </View>
      ) : null}
      {isFood(item.type) ? (
        <View style={st.tag}>
          <Text style={st.tagText}>Food</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

/** One row per kid: "Mia’s day", then how many items and the first few. */
function Routines({ kids, items, manage }: { kids: Kid[]; items: CareItem[]; manage: boolean }) {
  return (
    <View style={st.card}>
      {kids.map((k, n) => {
        const mine = items.filter((i) => i.kid_id === k.id);
        const first = mine.slice(0, 3).map(itemTitle).join(', ');
        const sub = mine.length ? `${mine.length} ${mine.length === 1 ? 'item' : 'items'} · ${first}` : manage ? 'Add naps, meals and bedtime' : 'Nothing set yet';
        return (
          <Pressable key={k.id} accessibilityRole="button" onPress={() => router.push(`/parent/kid/routine?kidId=${k.id}`)} style={[st.row, n < kids.length - 1 && st.rowLine]}>
            <View style={{ flexDirection: 'column', flexGrow: 1, flexShrink: 1 }}>
              <Text style={st.rowTitle}>{k.name}’s day</Text>
              <Text style={st.rowSub} numberOfLines={1}>
                {sub}
              </Text>
            </View>
            <Icon name="chevron-right" size={18} tint={color.ink2} />
          </Pressable>
        );
      })}
    </View>
  );
}

// P7 values. Header: 20 top, 12 bottom, 14 between the title row and the segmented control.
// P7's Requirements pill icon (plain shield, stroke 2).
const SHIELD = `<svg viewBox="0 0 24 24" fill="none" stroke="${color.primary}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/></svg>`;

const st = StyleSheet.create({
  head: { gap: 14, paddingTop: 20, paddingHorizontal: 20, paddingBottom: 8 }, // + Screen's 4 content top = 12
  back: { width: 44, height: 44, flexShrink: 0, borderRadius: 22, borderWidth: 1, borderColor: color.line, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  title: { fontFamily: font.display, fontSize: 24, color: color.ink, flexGrow: 1, flexShrink: 1 },
  reqPill: { flexDirection: 'row', alignItems: 'center', gap: 6, height: 36, paddingHorizontal: 12, borderRadius: 999, backgroundColor: color.primaryTint },
  reqPillText: { fontFamily: font.bodyBold, fontSize: 14, color: color.primary },
  seg: { flexDirection: 'row', gap: 4, padding: 4, backgroundColor: color.muted, borderRadius: 12 },
  segItem: { flex: 1, minWidth: 0, height: 38, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  segText: { fontFamily: font.bodyMedium, fontSize: 15, color: color.ink2 },
  segTextOn: { fontFamily: font.bodyBold, color: color.ink },
  avoid: { gap: 2, paddingVertical: 12, paddingHorizontal: 14, backgroundColor: color.badTint, borderRadius: 12 },
  avoidTitle: { fontFamily: font.bodyBold, fontSize: 14, color: color.badInk },
  avoidText: { fontFamily: font.body, fontSize: 14, color: '#6E2215' },
  card: { backgroundColor: '#FFFFFF', borderRadius: 24, ...cardShadow },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, paddingHorizontal: 16 },
  rowLine: { borderBottomWidth: 1, borderBottomColor: color.divider },
  time: { fontFamily: font.bodySemi, fontSize: 14, color: color.ink2 },
  rowTitle: { fontFamily: font.bodySemi, fontSize: 15, color: color.ink },
  rowSub: { fontFamily: font.body, fontSize: 13, color: color.quiet },
  tag: { alignSelf: 'flex-start', height: 24, paddingHorizontal: 8, justifyContent: 'center', backgroundColor: color.accentTint, borderRadius: 999, flexShrink: 0 },
  tagText: { fontFamily: font.bodyBold, fontSize: 12, color: color.ink },
  // P7k: the small grey "Everyone" label on a whole-family row while one kid is selected.
  everyone: { alignSelf: 'flex-start', height: 24, paddingHorizontal: 8, justifyContent: 'center', backgroundColor: color.muted, borderRadius: 999, flexShrink: 0 },
  everyoneText: { fontFamily: font.bodyBold, fontSize: 12, color: color.ink2 },
  // P7 kid chips under the tabs, edge to edge so a long row scrolls past the gutter.
  chips: { marginHorizontal: -20, marginTop: -4 },
  chipRow: { gap: 8, paddingHorizontal: 20 },
  add: { height: 50, alignItems: 'center', justifyContent: 'center', borderRadius: 999, borderWidth: 2, borderColor: '#C9D3DD', borderStyle: 'dashed' },
  addText: { fontFamily: font.displayBold, fontSize: 16, color: color.primary },
  none: { fontFamily: font.body, fontSize: 14, color: color.ink2, textAlign: 'center', paddingVertical: 6 },
});
