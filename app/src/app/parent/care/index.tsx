import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { KidDot } from '@/components/bits';
import { HelperNote } from '@/components/familyMembers';
import { ErrorText, Icon, Loading, Screen } from '@/components/ui';
import { api, useQuery } from '@/lib/data';
import { familyItems, itemLine, routineSummary, scheduleLabel, shortTime } from '@/lib/care-plan';
import { useSession } from '@/lib/session';
import { useCanManage } from '@/lib/use-family-role';
import type { CareItem, Kid } from '@/lib/types';
import { cardShadow, color, font } from '@/theme';
import { Text } from '@/components/Text';

// Wireframe P7 Care plan, from app/src/wireframes/P7.tsx. The family's plan, same model as a kid's day (P20k):
// KIDS' DAYS = one row per kid ("Ava’s day", her first items) that opens her day, where her own naps, meals, food to
// avoid and bedtime live; FAMILY TO-DOS = the whole-family items (no kid: "Tidy up toys", "Dinner"), in time order,
// which also show in every kid's day with the "Everyone" label. No tabs or kid chips (they made a second, different
// "Ava’s plan"). The Requirements pill opens P7a. Row titles carry the type's extras ("Tylenol · 5 ml").
// A read-only member (P7h) reads it: no Requirements pill, no "+ Add family to-do" (the note "Jen manages the care
// plan." instead), rows open the item read-only (P20v) and a kid's day read-only (P20h).
export default function CarePlan() {
  const { family } = useSession();
  const manage = useCanManage();
  const fid = family!.id;
  const { data, error } = useQuery(async () => {
    const [items, kids] = await Promise.all([api.careItems(fid), api.kids(fid)]);
    return { items, kids };
  }, [fid]);

  if (!data) return error ? <Screen title="Care plan" back><ErrorText>{error}</ErrorText></Screen> : <Loading />;
  const { items, kids } = data;
  const todos = familyItems(items);

  return (
    <Screen
      gap={10}
      header={
        <View style={st.head}>
          <Pressable accessibilityRole="button" accessibilityLabel="Back" onPress={() => router.back()} style={st.back}>
            <Icon name="chevron-left" size={22} tint={color.ink} strokeWidth={2} />
          </Pressable>
          <Text style={st.title} numberOfLines={1}>
            Care plan
          </Text>
          {manage ? (
            <Pressable accessibilityRole="button" onPress={() => router.push('/parent/requirements')} style={st.reqPill}>
              <SvgXml xml={SHIELD} width={16} height={16} style={{ flexShrink: 0 }} />
              <Text style={st.reqPillText}>Requirements</Text>
            </Pressable>
          ) : null}
        </View>
      }>
      <ErrorText>{error}</ErrorText>
      {kids.length ? (
        <>
          <Text style={st.label}>KIDS’ DAYS</Text>
          <KidDays kids={kids} items={items} manage={manage} />
        </>
      ) : null}

      <Text style={[st.label, { marginTop: 6 }]}>FAMILY TO-DOS</Text>
      {todos.length ? (
        <View style={st.card}>
          {todos.map((i, n) => (
            <ItemRow key={i.id} item={i} last={n === todos.length - 1} edit={manage} />
          ))}
        </View>
      ) : (
        <Text style={st.none}>{manage ? 'Things for whoever is with the kids, like “Tidy up toys”.' : 'No family to-dos yet.'}</Text>
      )}
      {manage ? (
        <Pressable accessibilityRole="button" onPress={() => router.push('/parent/care/item')} style={st.add}>
          <Text style={st.addText}>+ Add family to-do</Text>
        </Pressable>
      ) : (
        <HelperNote what="the care plan" />
      )}
    </Screen>
  );
}

function ItemRow({ item, last, edit }: { item: CareItem; last: boolean; edit: boolean }) {
  const sub = [scheduleLabel(item), item.how.split('\n')[0]].filter(Boolean).join(' · ');
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
        {sub ? (
          <Text style={st.rowSub} numberOfLines={1}>
            {sub}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

/** One row per kid: "Ava’s day" and her first items; opens her day (P20k). */
function KidDays({ kids, items, manage }: { kids: Kid[]; items: CareItem[]; manage: boolean }) {
  return (
    <View style={st.card}>
      {kids.map((k, n) => {
        const sub = routineSummary(items.filter((i) => i.kid_id === k.id)) || (manage ? 'Add naps, meals and bedtime' : 'Nothing set yet');
        return (
          <Pressable key={k.id} accessibilityRole="button" onPress={() => router.push(`/parent/kid/routine?kidId=${k.id}`)} style={[st.row, n < kids.length - 1 && st.rowLine]}>
            <KidDot kid={k} size={36} />
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

// P7 values. Header: 20 top, 12 bottom.
// P7's Requirements pill icon (plain shield, stroke 2).
const SHIELD = `<svg viewBox="0 0 24 24" fill="none" stroke="${color.primary}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/></svg>`;

const st = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingTop: 20, paddingHorizontal: 20, paddingBottom: 8 }, // + Screen's 4 content top = 12
  back: { width: 44, height: 44, flexShrink: 0, borderRadius: 22, borderWidth: 1, borderColor: color.line, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  title: { fontFamily: font.display, fontSize: 24, color: color.ink, flexGrow: 1, flexShrink: 1 },
  reqPill: { flexDirection: 'row', alignItems: 'center', gap: 6, height: 36, paddingHorizontal: 12, borderRadius: 999, backgroundColor: color.primaryTint },
  reqPillText: { fontFamily: font.bodyBold, fontSize: 14, color: color.primary },
  card: { backgroundColor: '#FFFFFF', borderRadius: 24, ...cardShadow },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, paddingHorizontal: 16 },
  rowLine: { borderBottomWidth: 1, borderBottomColor: color.divider },
  time: { fontFamily: font.bodySemi, fontSize: 14, color: color.ink2 },
  rowTitle: { fontFamily: font.bodySemi, fontSize: 15, color: color.ink },
  rowSub: { fontFamily: font.body, fontSize: 13, color: color.quiet },
  add: { height: 50, alignItems: 'center', justifyContent: 'center', borderRadius: 999, borderWidth: 2, borderColor: '#C9D3DD', borderStyle: 'dashed' },
  addText: { fontFamily: font.displayBold, fontSize: 16, color: color.primary },
  label: { fontFamily: font.bodyBold, fontSize: 13, letterSpacing: 0.6, color: color.ink2 },
  none: { fontFamily: font.body, fontSize: 14, color: color.ink2, textAlign: 'center', paddingVertical: 6 },
});
