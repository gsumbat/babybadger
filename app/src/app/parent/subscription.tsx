import { Redirect, router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/Text';
import { ErrorText, Pill, Screen, initialsOf } from '@/components/ui';
import { manageSubscription, openPortal, planLine, planTitle, statePill, usePlan } from '@/lib/billing';
import { api, useQuery } from '@/lib/data';
import { firstName } from '@/lib/format';
import { useSession } from '@/lib/session';
import { cardShadow, color, font } from '@/theme';

// Wireframes P39 Manage subscription (active), P39b (free trial), P39c (canceled, runs to the period end),
// P39d (paused). Opens from Settings › Subscription and the P40 Home banner. Receipts, the payment method and
// switching to yearly open Stripe's billing portal in the browser. "Cancel subscription" opens P41.
export default function Subscription() {
  const { family, profile } = useSession();
  const plan = usePlan();
  const fid = family!.id;
  const [busy, setBusy] = useState('');
  const [err, setErr] = useState('');
  const { data } = useQuery(async () => {
    const [parents, sitters] = await Promise.all([api.familyParents(fid), api.familySitters(fid)]);
    return { parents, sitters };
  }, [fid]);

  if (plan.enabled && plan.loaded && (plan.state === 'none' || plan.state === 'ended')) return <Redirect href="/parent/plans" />;

  const sub = plan.sub;
  const pill = statePill(plan.state);
  const payer = sub?.payer_id ?? profile?.id;
  const parents = [...(data?.parents ?? [])].sort((a, b) => (a.id === payer ? -1 : b.id === payer ? 1 : 0));
  const sitter = data?.sitters.find((s) => s.status === 'active');
  const sitterName = sitter ? firstName(sitter.profile?.full_name) : '';

  async function run(key: string, fn: () => Promise<void>) {
    setBusy(key);
    setErr('');
    try {
      await fn();
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Something went wrong. Try again.');
    } finally {
      setBusy('');
    }
  }
  const portal = (flow?: 'payment_method_update') => run(flow ?? 'portal', () => openPortal(fid, flow));

  const footer =
    plan.state === 'canceling' || plan.state === 'paused' ? (
      <Pressable accessibilityRole="button" onPress={() => run('resume', () => manageSubscription(fid, 'resume'))} style={({ pressed }) => [st.keep, pressed && { opacity: 0.85 }]}>
        {busy === 'resume' ? <ActivityIndicator color={color.primary} /> : <Text style={st.keepText}>{plan.state === 'paused' ? 'Resume now' : 'Keep my plan'}</Text>}
      </Pressable>
    ) : (
      <Pressable accessibilityRole="button" onPress={() => router.push('/parent/cancel')} style={st.cancel}>
        <Text style={st.cancelText}>Cancel subscription</Text>
      </Pressable>
    );

  return (
    <Screen back title="Subscription" right={<Pill label={pill.label} kind={pill.kind} />} gap={12} footer={footer}>
      <View style={st.planCard}>
        <View style={{ flexShrink: 1 }}>
          <Text style={st.planSmall}>BabyBadger Family</Text>
          <Text style={st.planTitle}>{planTitle(sub?.plan)}</Text>
          <Text style={st.planLine}>{planLine(sub)}</Text>
        </View>
        <View style={st.logo}>
          <Text style={st.logoText}>BabyBadger</Text>
        </View>
      </View>
      {sub?.plan === 'monthly' && (plan.state === 'active' || plan.state === 'trialing') ? (
        <Pressable accessibilityRole="button" onPress={() => portal()} style={st.switch}>
          <Text style={st.switchText}>
            <Text style={{ fontFamily: font.bodyBold }}>Switch to yearly</Text> and save 20%. Unused days count toward it.
          </Text>
          <Text style={st.switchLink}>Switch</Text>
        </Pressable>
      ) : null}
      <ErrorText>{err}</ErrorText>
      <Text style={st.section}>WHO’S COVERED</Text>
      <View style={[st.card, { paddingHorizontal: 16 }]}>
        {parents.map((p) => (
          <View key={p.id} style={[st.person, st.line]}>
            <View style={[st.avatar, { backgroundColor: color.ink }]}>
              <Text style={st.avatarText}>{initialsOf(p.full_name)}</Text>
            </View>
            <View style={{ flexGrow: 1, flexShrink: 1 }}>
              <Text style={st.name}>{firstName(p.full_name)}</Text>
              <Text style={st.sub12}>{p.id === payer ? 'Pays for the plan' : 'Parent · included'}</Text>
            </View>
            {p.id === payer ? <Pill label="Owner" kind="info" /> : null}
          </View>
        ))}
        <View style={st.person}>
          <View style={[st.avatar, { backgroundColor: color.primary }]}>
            <Text style={st.avatarText}>{(sitterName[0] || 'S').toUpperCase()}</Text>
          </View>
          <View style={{ flexGrow: 1, flexShrink: 1 }}>
            <Text style={st.name}>{sitterName ? `${sitterName} and any sitter` : 'Any sitter'}</Text>
            <Text style={st.sub12}>Always free for sitters</Text>
          </View>
        </View>
      </View>
      <View style={[st.card, { paddingHorizontal: 16 }]}>
        <Pressable accessibilityRole="button" onPress={() => portal()} style={[st.row, st.line]}>
          <Text style={st.rowLabel}>Billing history</Text>
          {busy === 'portal' ? <ActivityIndicator color={color.primary} /> : <Text style={st.rowLink}>Receipts ›</Text>}
        </Pressable>
        <Pressable accessibilityRole="button" onPress={() => portal('payment_method_update')} style={st.row}>
          <Text style={st.rowLabel}>Payment method</Text>
          {busy === 'payment_method_update' ? <ActivityIndicator color={color.primary} /> : <Text style={st.rowLink}>Manage ›</Text>}
        </Pressable>
      </View>
    </Screen>
  );
}

// Values from wireframe P39.
const st = StyleSheet.create({
  planCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: color.primary, borderRadius: 20 },
  planSmall: { fontFamily: font.body, fontSize: 13, color: '#FFFFFF', opacity: 0.85 },
  planTitle: { fontFamily: font.display, fontSize: 24, color: '#FFFFFF', marginVertical: -4.22 },
  planLine: { fontFamily: font.body, fontSize: 13, color: '#FFFFFF', opacity: 0.9 },
  logo: { width: 52, height: 52, borderRadius: 14, backgroundColor: color.primary, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  logoText: { fontFamily: font.display, fontSize: 8.3, color: '#FFFFFF' },
  switch: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, paddingHorizontal: 14, backgroundColor: color.accentTint, borderRadius: 14 },
  switchText: { fontFamily: font.body, fontSize: 14, lineHeight: 20, color: color.ink, flexGrow: 1, flexShrink: 1 },
  switchLink: { fontFamily: font.bodyBold, fontSize: 14, color: 'rgb(20, 90, 107)' },
  section: { fontFamily: font.bodyBold, fontSize: 13, color: color.ink2, letterSpacing: 0.6 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 24, ...cardShadow },
  person: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 56 },
  line: { borderBottomWidth: 1, borderBottomColor: color.divider },
  avatar: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontFamily: font.displayBold, fontSize: 16, color: '#FFFFFF' },
  name: { fontFamily: font.bodySemi, fontSize: 15, color: color.ink },
  sub12: { fontFamily: font.body, fontSize: 12, color: color.ink2 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, minHeight: 48 },
  rowLabel: { fontFamily: font.body, fontSize: 15, color: color.ink },
  rowLink: { fontFamily: font.bodySemi, fontSize: 15, color: color.primary, textDecorationLine: 'underline' },
  cancel: { height: 44, alignItems: 'center', justifyContent: 'center' },
  cancelText: { fontFamily: font.bodySemi, fontSize: 15, color: color.badInk },
  keep: { height: 50, borderRadius: 999, backgroundColor: color.primaryTint, alignItems: 'center', justifyContent: 'center' },
  keepText: { fontFamily: font.displayBold, fontSize: 17, color: color.primary },
});
