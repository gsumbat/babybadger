import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { KidDot } from '@/components/bits';
import { HelperNote } from '@/components/familyMembers';
import { ErrorText, Icon, Loading, Screen } from '@/components/ui';
import { api, useQuery } from '@/lib/data';
import { ageLabel, kidWeek, pronouns } from '@/lib/kid-profile';
import { useCanManage } from '@/lib/use-family-role';
import { cardShadow, color, font } from '@/theme';
import { Text } from '@/components/Text';

// Icons from wireframe P55.
const PENCIL = '<svg viewBox="0 0 24 24" fill="none" stroke="#47698A" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13.5 6.5l4 4"/></svg>';
const LIST = '<svg viewBox="0 0 24 24" fill="none" stroke="#47698A" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6h11M9 12h11M9 18h11M4.5 6h0M4.5 12h0M4.5 18h0"/></svg>';
const PIN = '<svg viewBox="0 0 24 24" fill="none" stroke="#47698A" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-7-6-7-11a7 7 0 0 1 14 0c0 5-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/></svg>';
const CHAT = '<svg viewBox="0 0 24 24" fill="none" stroke="#47698A" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5h16v11H9l-5 4z"/></svg>';
const HEART_PLUS = '<svg viewBox="0 0 24 24" fill="none" stroke="#4B5960" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.2a4.3 4.3 0 0 1 7.5 2.6C19.5 15.4 12 20 12 20z"/><path d="M12 10v5M9.5 12.5h5"/></svg>';

// Wireframe P55 Child profile, from app/src/wireframes/P55.tsx. Left out until built: grade and school, the
// kid's location line, and the phone and Who looks after rows. See on map / Message Ava show greyed out (not
// tappable): they need the kid's own phone, which comes after phase 1 (P55z). The plan tile reads "Her plan" / "His plan" from the optional gender, "Plan" without one,
// and opens her day (P20k): her routine and the family's to-dos in one timeline. No separate Routine row (it
// opened the same day).
// The HER REPORT card (this week's shift count and her last shift, as plain text) is the one way into her reports:
// the whole card opens Ava’s report (P5h, /parent/kid/report), where every shift of hers is listed.
// A read-only member (P55h) reads it: no Edit, Care and safety opens the read-only view (P19v) instead of the editor
// (P19e), the plan tile opens the day read-only (P20h), and the note "Jen manages Ava’s profile." at the end.
export default function KidProfile() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const manage = useCanManage();
  const { data, error } = useQuery(async () => {
    const [kid, shifts] = await Promise.all([api.kid(id), api.kidShifts(id)]);
    return { kid, week: kidWeek(shifts) };
  }, [id]);

  if (!data) return error ? <Screen title="" back><ErrorText>{error}</ErrorText></Screen> : <Loading />;
  const { kid, week } = data;
  const rest = [kid.avoid_foods && `Avoid ${kid.avoid_foods}.`, kid.health_notes].filter(Boolean).join(' ');

  return (
    <Screen
      gap={12}
      header={
        <View style={st.head}>
          <Pressable accessibilityRole="button" accessibilityLabel="Back" onPress={() => router.back()} style={st.back}>
            <Icon name="chevron-left" size={22} tint={color.ink} strokeWidth={2} />
          </Pressable>
          <Text style={st.headTitle} numberOfLines={1}>
            {kid.name}
          </Text>
          {manage ? (
            <Pressable accessibilityRole="button" onPress={() => router.push(`/parent/kid/new?id=${kid.id}&step=1`)} style={st.edit}>
              <SvgXml xml={PENCIL} width={16} height={16} style={{ flexShrink: 0 }} />
              <Text style={st.editText}>Edit</Text>
            </Pressable>
          ) : null}
        </View>
      }>
      <ErrorText>{error}</ErrorText>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
        <KidDot kid={kid} size={64} />
        <View style={{ flexDirection: 'column', gap: 4, flexShrink: 1 }}>
          <Text style={st.name}>{kid.name}</Text>
          {kid.birthdate ? <Text style={st.age}>{ageLabel(kid.birthdate)}</Text> : null}
        </View>
      </View>

      <View style={{ flexDirection: 'row', gap: 8 }}>
        <View accessibilityRole="button" accessibilityState={{ disabled: true }} accessibilityHint="Coming later" style={[st.tile, st.tileOff]}>
          <SvgXml xml={PIN} width={20} height={20} style={{ flexShrink: 0 }} />
          <Text style={st.tileText}>See on map</Text>
        </View>
        <View accessibilityRole="button" accessibilityState={{ disabled: true }} accessibilityHint="Coming later" style={[st.tile, st.tileOff]}>
          <SvgXml xml={CHAT} width={20} height={20} style={{ flexShrink: 0 }} />
          <Text style={st.tileText} numberOfLines={1}>
            Message {kid.name}
          </Text>
        </View>
        <Pressable accessibilityRole="button" onPress={() => router.push(`/parent/kid/routine?kidId=${kid.id}`)} style={st.tile}>
          <SvgXml xml={LIST} width={20} height={20} style={{ flexShrink: 0 }} />
          <Text style={st.tileText}>{kid.gender ? `${pronouns(kid.gender).poss[0].toUpperCase()}${pronouns(kid.gender).poss.slice(1)} plan` : 'Plan'}</Text>
        </Pressable>
      </View>

      {kid.allergies || rest ? (
        <View style={st.note}>
          <SvgXml xml={HEART_PLUS} width={20} height={20} style={{ flexShrink: 0 }} />
          <Text style={st.noteText}>
            {kid.allergies ? <Text style={{ fontFamily: font.bodyBold }}>Allergic to {kid.allergies}.</Text> : null}
            {kid.allergies && rest ? ' ' : ''}
            {rest}
          </Text>
        </View>
      ) : null}

      <View style={st.listCard}>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push(manage ? `/parent/kid/new?id=${kid.id}&step=2` : `/parent/kid/care?id=${kid.id}`)}
          style={st.listRow}>
            <View style={st.listIcon}>
              <Icon name="shield" size={20} tint={color.primary} />
            </View>
            <View style={{ flexDirection: 'column', minWidth: 0, flexGrow: 1, flexShrink: 1 }}>
              <Text style={st.rowTitle}>Care and safety</Text>
              <Text style={st.rowSub}>Pediatrician, medicines, what calms {pronouns(kid.gender).obj}</Text>
            </View>
            <Icon name="chevron-right" size={18} tint={color.ink2} />
        </Pressable>
      </View>

      {/* One way into her reports: the whole card opens Ava’s report (P5h), where every shift of hers lives. */}
      <Pressable accessibilityRole="button" accessibilityLabel={reportTitle(kid.gender)} onPress={() => router.push(`/parent/kid/report?kidId=${kid.id}&range=week`)} style={({ pressed }) => [st.weekCard, pressed && { opacity: 0.85 }]}>
        <View style={st.weekRow}>
          <Text style={st.label}>{reportTitle(kid.gender).toUpperCase()}</Text>
          <Icon name="chevron-right" size={18} tint={color.ink2} />
        </View>
        <View style={st.weekRow}>
          <Text style={st.weekText}>Shifts with a sitter this week</Text>
          <Text style={[st.weekText, { fontFamily: font.bodyBold }]}>{week.count}</Text>
        </View>
        {week.last ? (
          <View style={st.weekRow}>
            <Text style={st.weekText}>Last shift</Text>
            <Text style={[st.weekText, { fontFamily: font.bodyBold }]}>{new Date(week.last.starts_at).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</Text>
          </View>
        ) : null}
      </Pressable>
      <HelperNote what={`${kid.name}’s profile`} />
    </Screen>
  );
}

/** THIS WEEK header link: "Her report ›" / "His report ›", "Report ›" without a gender. */
/** "Her report" / "His report" / "Report". */
function reportTitle(gender: Parameters<typeof pronouns>[0]) {
  return gender ? `${pronouns(gender).poss[0].toUpperCase()}${pronouns(gender).poss.slice(1)} report` : 'Report';
}

// P55 values
const st = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingTop: 16, paddingHorizontal: 20, paddingBottom: 4 }, // + 4 content top = 8
  back: { width: 44, height: 44, borderRadius: 22, borderWidth: 1, borderColor: color.line, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  headTitle: { fontFamily: font.display, fontSize: 22, color: color.ink, marginVertical: -4.62, flexGrow: 1, flexShrink: 1 },
  // Centred in the header like the wireframe (the converter's flex-start comes from inline-flex, not the design).
  edit: { flexDirection: 'row', alignItems: 'center', gap: 4, height: 36, paddingHorizontal: 12, backgroundColor: color.primaryTint, borderRadius: 999, flexShrink: 1 },
  editText: { fontFamily: font.bodyBold, fontSize: 14, color: color.primary },
  name: { fontFamily: font.display, fontSize: 22, color: color.ink, marginVertical: -5.62 },
  // Age on its own line in P55's sub-line style (Figtree 13, #4B5960).
  age: { fontFamily: font.body, fontSize: 13, color: color.ink2 },
  note: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, paddingHorizontal: 14, backgroundColor: color.muted, borderRadius: 16 },
  noteText: { fontFamily: font.body, fontSize: 13, color: color.ink, lineHeight: 18, flexShrink: 1 },
  listCard: { paddingHorizontal: 14, backgroundColor: '#FFFFFF', borderRadius: 24, ...cardShadow },
  // 58 tall as drawn; the vertical padding only shows when a long line wraps.
  listRow: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 58, paddingVertical: 8 },
  // "See on map / Message / Her plan" tiles: a third of the row each.
  tile: { flex: 1, minWidth: 0, height: 64, borderRadius: 18, backgroundColor: color.primaryTint, alignItems: 'center', justifyContent: 'center', gap: 4 },
  tileOff: { opacity: 0.4 },
  tileText: { fontFamily: font.bodyBold, fontSize: 12, color: color.primaryStrong },
  listIcon: { width: 36, height: 36, flexShrink: 0, borderRadius: 12, backgroundColor: color.primaryTint, alignItems: 'center', justifyContent: 'center' },
  rowTitle: { fontFamily: font.bodySemi, fontSize: 15, color: color.ink },
  rowSub: { fontFamily: font.body, fontSize: 13, color: color.ink2 },
  weekCard: { gap: 8, padding: 14, backgroundColor: '#FFFFFF', borderRadius: 24, ...cardShadow },
  label: { fontFamily: font.bodyBold, fontSize: 13, color: color.ink2, letterSpacing: 0.6 },
  weekRow: { flexDirection: 'row', justifyContent: 'space-between' },
  weekText: { fontFamily: font.body, fontSize: 14, color: color.ink, flexShrink: 1 },
});
