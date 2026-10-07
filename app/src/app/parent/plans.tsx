import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { BILLING_SVG } from '@/components/billing';
import { Text } from '@/components/Text';
import { ErrorText, Screen } from '@/components/ui';
import { hasPlan, PRICES, planState, plansButton, plansFooter, plansIntro, refreshPlan, startCheckout, usePlan, type Plan } from '@/lib/billing';
import { useSession } from '@/lib/session';
import { cardShadow, color, font } from '@/theme';

// Wireframe P36 Plans (P36b when the family already used its trial: no trial copy, "Subscribe"). Opens from
// Settings › Subscription, the "See plans" lock on the live map (P4l), booking or care plan edits without a plan, and
// once after first-run setup. "Start free trial" opens Stripe Checkout in the browser (P37), then P38 on success.
// "Restore purchase" is gone: the plan belongs to the family's account, not the phone.
const FEATURES: { icon: keyof typeof BILLING_SVG; title: string; sub?: string }[] = [
  { icon: 'map', title: 'Live map while the sitter is on shift' },
  { icon: 'trip', title: 'Trips with arrival alerts' },
  { icon: 'report', title: 'Care plan and shift reports' },
  { icon: 'phone', title: 'Kids’ phones and tablets' },
  { icon: 'people', title: 'Both parents, unlimited sitters', sub: 'Sitters always use BabyBadger free' },
];

export default function Plans() {
  const { family } = useSession();
  const plan = usePlan();
  const [choice, setChoice] = useState<Plan>('yearly');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const hadTrial = !!plan.sub?.had_trial;

  async function start() {
    if (!plan.enabled) {
      Alert.alert('BabyBadger Family', 'Coming soon.');
      return;
    }
    setBusy(true);
    setErr('');
    try {
      const result = await startCheckout(family!.id, choice);
      if (result === 'success' || result === 'closed') {
        const sub = await refreshPlan(family!.id);
        if (hasPlan(sub)) {
          router.replace(planState(sub) === 'trialing' ? '/parent/trial-started' : '/parent/subscription');
          return;
        }
        if (result === 'success') setErr('Payment received. Your plan shows up here in a moment.');
      }
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Couldn’t open checkout. Try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen
      gap={12}
      header={
        <View style={st.header}>
          <Pressable accessibilityRole="button" accessibilityLabel="Close" onPress={() => (router.canGoBack() ? router.back() : router.replace('/parent'))} style={st.close}>
            <SvgXml xml={BILLING_SVG.close} width={18} height={18} />
          </Pressable>
        </View>
      }
      footer={
        <View style={{ gap: 6 }}>
          <Pressable accessibilityRole="button" accessibilityState={{ busy }} onPress={busy ? undefined : start} style={({ pressed }) => [st.cta, (pressed || busy) && { opacity: 0.85 }]}>
            {busy ? <ActivityIndicator color="#FFFFFF" /> : <Text style={st.ctaText}>{plansButton(hadTrial)}</Text>}
          </Pressable>
          <Text style={st.foot}>{plansFooter(choice, hadTrial)}</Text>
        </View>
      }>
      <View style={{ gap: 4 }}>
        <Text style={st.title}>Know they’re okay, every shift</Text>
        <Text style={st.intro}>{plansIntro(hadTrial)}</Text>
      </View>
      <View style={st.features}>
        {FEATURES.map((f) => (
          <View key={f.title} style={st.feature}>
            <View style={st.featureIcon}>
              <SvgXml xml={BILLING_SVG[f.icon]} width={22} height={22} />
            </View>
            <View style={{ flexShrink: 1 }}>
              <Text style={st.featureTitle}>{f.title}</Text>
              {f.sub ? <Text style={st.sub12}>{f.sub}</Text> : null}
            </View>
          </View>
        ))}
      </View>
      <PlanOption plan="yearly" on={choice === 'yearly'} onPress={() => setChoice('yearly')} />
      <PlanOption plan="monthly" on={choice === 'monthly'} onPress={() => setChoice('monthly')} />
      <ErrorText>{err}</ErrorText>
    </Screen>
  );
}

function PlanOption({ plan, on, onPress }: { plan: Plan; on: boolean; onPress: () => void }) {
  const p = PRICES[plan];
  return (
    <Pressable accessibilityRole="radio" accessibilityState={{ checked: on }} onPress={onPress} style={[st.option, on ? st.optionOn : st.optionOff]}>
      {plan === 'yearly' ? (
        <View style={st.save}>
          <Text style={st.saveText}>SAVE 20%</Text>
        </View>
      ) : null}
      <View style={[st.radio, { borderColor: on ? color.primary : color.lineStrong }]}>{on ? <View style={st.radioDot} /> : null}</View>
      <View style={{ flexGrow: 1, flexShrink: 1 }}>
        <Text style={st.optionTitle}>{plan === 'yearly' ? 'Yearly' : 'Monthly'}</Text>
        <Text style={st.sub12}>{p.note}</Text>
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <Text style={st.price}>{p.amount}</Text>
        <Text style={st.sub12}>{p.per}</Text>
      </View>
    </Pressable>
  );
}

// Values from wireframe P36.
const st = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'flex-end', paddingTop: 16, paddingHorizontal: 20 },
  close: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: color.line, alignItems: 'center', justifyContent: 'center' },
  title: { fontFamily: font.display, fontSize: 28, lineHeight: 34, color: color.ink },
  intro: { fontFamily: font.body, fontSize: 15, color: color.ink2 },
  features: { paddingVertical: 6, paddingHorizontal: 14, backgroundColor: '#FFFFFF', borderRadius: 24, ...cardShadow },
  feature: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 40 },
  featureIcon: { width: 32, height: 32, borderRadius: 14, backgroundColor: color.primaryTint, alignItems: 'center', justifyContent: 'center' },
  featureTitle: { fontFamily: font.bodySemi, fontSize: 14, color: color.ink },
  sub12: { fontFamily: font.body, fontSize: 12, color: color.ink2 },
  option: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  optionOn: { backgroundColor: color.primaryTint, borderRadius: 16, borderWidth: 2, borderColor: color.primary },
  optionOff: { backgroundColor: '#FFFFFF', borderRadius: 24, ...cardShadow },
  save: { position: 'absolute', right: 12, top: -11, height: 22, paddingHorizontal: 10, borderRadius: 999, backgroundColor: color.accent, justifyContent: 'center' },
  saveText: { fontFamily: font.bodyBold, fontSize: 11, color: color.ink },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: color.primary },
  optionTitle: { fontFamily: font.bodyBold, fontSize: 16, color: color.ink },
  price: { fontFamily: font.display, fontSize: 20, color: color.ink, marginVertical: -5.02 },
  cta: { height: 54, borderRadius: 999, backgroundColor: color.primary, alignItems: 'center', justifyContent: 'center' },
  ctaText: { fontFamily: font.displayBold, fontSize: 17, color: '#FFFFFF' },
  foot: { fontFamily: font.body, fontSize: 12, lineHeight: 16, color: color.ink2, textAlign: 'center' },
});
