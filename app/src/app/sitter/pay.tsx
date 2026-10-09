import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Platform, Pressable, StyleSheet, View } from 'react-native';

import { ErrorText, Icon, Screen } from '@/components/ui';
import { useQuery } from '@/lib/data';
import { dayOf, timeOf } from '@/lib/format';
import { dollars, familyShort, familyTitle, hoursBig, hoursShort, payApi, payFor, periodLabel, periodRange, plural, type PayPeriod } from '@/lib/pay';
import { useSession } from '@/lib/session';
import { cardShadow, color, font, SECTION_GAP } from '@/theme';
import { Text } from '@/components/Text';

// Wireframe S7 Pay ("Hours and pay", from S39 Me › Money), translated from app/src/wireframes/S7.tsx.
// Hours are the clocked-in time of finished shifts that started in the week (Mon–Sun) or month; pay is those hours
// times the family's hourly rate (family_sitters.rate, set on the invite, P23). A family with no rate earns $0.
// Left out until built: approving hours (P5) — every family row reads "Waiting" until a parent can approve; Stripe
// payouts (S28) and invoices (S31 / S32): the "Get paid in the app" card, "Invoice the Lees" and "Invoices" say
// "Coming soon". Not drawn: the back button (S7 is drawn with the tab bar; here it opens from Me), no finished shifts
// in the period ("No finished shifts yet." in the timesheet card, no family rows, no invoice button).
const STRIPES = ['#2F6FD6', '#D9822B', '#8676B3']; // S50 family colors, in join order

function comingSoon() {
  const msg = 'Payouts and invoices aren’t in the app yet.';
  if (Platform.OS === 'web') globalThis.alert?.(msg);
  else Alert.alert('Coming soon', msg);
}

/** "3:02 – 7:04 PM": the start drops AM/PM when both ends share it. */
function span(start: string, end: string) {
  const [a, b] = [timeOf(start), timeOf(end)];
  const ap = (t: string) => t.match(/\s?([AP]M)$/i)?.[1];
  return ap(a) && ap(a) === ap(b) ? `${a.replace(/\s?[AP]M$/i, '')} – ${b}` : `${a} – ${b}`;
}

export default function Pay() {
  const { session, sitterLinks } = useSession();
  const uid = session!.user.id;
  const [period, setPeriod] = useState<PayPeriod>('week');
  const { data, error } = useQuery(() => payApi.load(uid), [uid]);

  const range = periodRange(period);
  const pay = data ? payFor(data.shifts, data.rates, range) : null;
  const links = [...sitterLinks].sort((a, b) => +new Date(a.joined_at) - +new Date(b.joined_at));
  const famName = (id: string) => links.find((l) => l.family_id === id)?.family.name ?? 'Family';
  const stripe = (id: string) => STRIPES[Math.max(0, links.findIndex((l) => l.family_id === id)) % STRIPES.length];
  const top = pay ? [...pay.families].sort((a, b) => b.minutes - a.minutes)[0] : undefined;

  return (
    <Screen
      gap={12}
      header={
        <View style={st.header}>
          <View style={st.titleRow}>
            <Pressable accessibilityRole="button" accessibilityLabel="Back" onPress={() => router.back()} style={st.back}>
              <Icon name="chevron-left" size={22} tint={color.ink} strokeWidth={2} />
            </Pressable>
            <Text style={st.title}>Hours and pay</Text>
          </View>
          <View accessibilityRole="tablist" style={st.seg}>
            {(
              [
                ['week', 'This week'],
                ['month', 'This month'],
              ] as const
            ).map(([v, label]) => {
              const on = period === v;
              return (
                <Pressable key={v} accessibilityRole="tab" accessibilityState={{ selected: on }} onPress={() => setPeriod(v)} style={[st.segItem, on && st.segOn]}>
                  <Text style={on ? st.segTextOn : st.segText}>{label}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      }>
      <ErrorText>{error}</ErrorText>
      <View style={st.total}>
        <View style={{ flexShrink: 1 }}>
          <Text style={st.totalSmall}>{periodLabel(range)}</Text>
          <Text style={st.totalBig}>{hoursBig(pay?.minutes ?? 0)}</Text>
        </View>
        <View style={{ alignItems: 'flex-end', flexShrink: 1 }}>
          <Text style={st.totalSmall}>Earned</Text>
          <Text style={st.earned}>{dollars(pay?.earned ?? 0)}</Text>
        </View>
      </View>

      {pay?.families.length ? (
        <View style={st.card}>
          {pay.families.map((f, i) => (
            <View key={f.family_id} style={[st.famRow, i < pay.families.length - 1 && st.line]}>
              <View style={[st.dot, { backgroundColor: stripe(f.family_id) }]} />
              <View style={{ flexGrow: 1, flexShrink: 1 }}>
                <Text style={st.famName}>{familyTitle(famName(f.family_id))}</Text>
                <Text style={st.sub13}>
                  {hoursShort(f.minutes)} · {f.rate == null ? 'no rate set' : `${dollars(f.rate)}/hr`}
                </Text>
              </View>
              <View style={st.waitPill}>
                <Text style={st.waitText}>Waiting</Text>
              </View>
            </View>
          ))}
        </View>
      ) : null}

      <Pressable accessibilityRole="button" onPress={comingSoon} style={st.banner}>
        <Text style={st.bannerText}>
          <Text style={st.bannerBold}>Get paid in the app.</Text> Connect a bank with Stripe to invoice families.
        </Text>
        <Text style={st.setUp}>Set up ›</Text>
      </Pressable>

      <View style={{ flexDirection: 'row', gap: 10 }}>
        {top ? (
          <Pressable accessibilityRole="button" onPress={comingSoon} style={[st.btn, { backgroundColor: color.primary }]}>
            <Text style={[st.btnText, { color: '#FFFFFF' }]} numberOfLines={1}>
              Invoice the {plural(familyShort(famName(top.family_id)))}
            </Text>
          </Pressable>
        ) : null}
        <Pressable accessibilityRole="button" onPress={comingSoon} style={[st.btn, { backgroundColor: color.primaryTint }]}>
          <Text style={[st.btnText, { color: color.primary }]}>Invoices</Text>
        </Pressable>
      </View>

      <Text style={[st.section, { marginTop: SECTION_GAP }]}>TIMESHEET</Text>
      <View style={[st.card, { paddingVertical: 4, paddingHorizontal: 16 }]}>
        {pay?.shifts.length ? (
          pay.shifts.map((s, i) => (
            <View key={s.id} style={[st.sheetRow, i < pay.shifts.length - 1 && st.line]}>
              <Text style={st.sheetDay}>
                {dayOf(s.clock_in_at!)} · {familyShort(famName(s.family_id))}
              </Text>
              <Text style={st.sheetTime}>{span(s.clock_in_at!, s.clock_out_at!)}</Text>
            </View>
          ))
        ) : (
          <View style={st.sheetRow}>
            <Text style={st.sheetTime}>{data ? 'No finished shifts yet.' : ''}</Text>
          </View>
        )}
      </View>
    </Screen>
  );
}

// Values from wireframe S7. The header keeps 8 at the bottom: the wireframe has 12 and Screen's content adds 4.
const st = StyleSheet.create({
  header: { paddingTop: 16, paddingHorizontal: 20, paddingBottom: 8, gap: 14 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  back: { width: 44, height: 44, borderRadius: 22, borderWidth: 1, borderColor: color.line, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  title: { flexShrink: 1, fontFamily: font.display, fontSize: 24, color: color.ink },
  seg: { flexDirection: 'row', gap: 4, padding: 4, backgroundColor: color.muted, borderRadius: 12 },
  segItem: { flex: 1, minWidth: 0, height: 38, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  segOn: { backgroundColor: '#FFFFFF' },
  segText: { fontFamily: font.body, fontSize: 15, color: color.ink2 },
  segTextOn: { fontFamily: font.bodyBold, fontSize: 15, color: color.ink },
  total: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', paddingVertical: 18, paddingHorizontal: 16, backgroundColor: color.primary, borderRadius: 20 },
  totalSmall: { fontFamily: font.body, fontSize: 13, color: '#FFFFFF', opacity: 0.85 },
  totalBig: { fontFamily: font.display, fontSize: 32, color: '#FFFFFF', marginVertical: -6.63 },
  earned: { fontFamily: font.display, fontSize: 20, color: '#FFFFFF' },
  card: { backgroundColor: '#FFFFFF', borderRadius: 24, ...cardShadow },
  famRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, paddingHorizontal: 16 },
  line: { borderBottomWidth: 1, borderBottomColor: color.divider },
  dot: { width: 10, height: 10, borderRadius: 5 },
  famName: { fontFamily: font.bodySemi, fontSize: 16, color: color.ink },
  sub13: { fontFamily: font.body, fontSize: 13, color: color.ink2 },
  waitPill: { height: 26, paddingHorizontal: 10, borderRadius: 999, backgroundColor: color.warnTint, justifyContent: 'center' },
  waitText: { fontFamily: font.bodyBold, fontSize: 12, color: color.warnInk },
  banner: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12, paddingHorizontal: 14, backgroundColor: color.warnTint, borderRadius: 14 },
  bannerText: { flexGrow: 1, flexShrink: 1, fontFamily: font.body, fontSize: 14, lineHeight: 20, color: color.ink },
  bannerBold: { fontFamily: font.bodyBold, color: color.warnInk },
  setUp: { flexShrink: 0, fontFamily: font.bodyBold, fontSize: 14, color: color.primary },
  btn: { flex: 1, height: 52, borderRadius: 999, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8 },
  btnText: { fontFamily: font.displayBold, fontSize: 16 },
  section: { fontFamily: font.bodyBold, fontSize: 13, color: color.ink2, letterSpacing: 0.6 },
  sheetRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 8, paddingVertical: 12 },
  sheetDay: { flexShrink: 1, fontFamily: font.body, fontSize: 14, color: color.ink },
  sheetTime: { flexShrink: 1, fontFamily: font.body, fontSize: 14, color: color.ink2 },
});
