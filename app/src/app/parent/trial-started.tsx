import { Image } from 'expo-image';
import { Redirect, router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ToggleRow } from '@/components/bits';
import { Text } from '@/components/Text';
import { ErrorText, Screen } from '@/components/ui';
import { setTrialReminder, trialTimeline, usePlan } from '@/lib/billing';
import { api, useQuery } from '@/lib/data';
import { firstName } from '@/lib/format';
import { useSession } from '@/lib/session';
import { cardShadow, color, font } from '@/theme';

// Wireframe P38 Trial started (after Stripe Checkout succeeds). Dates come from the trial on the family's plan
// (30 days). "Remind me before it ends" = family_subscriptions.remind_trial (the webhook pushes 3 days before;
// Stripe's own email reminder is set in the Stripe dashboard). The "<name> is covered too" card shows only when the
// family has a second parent; its "Invite him in Settings › Parents" sentence is left out (no co-parent invite yet).
export default function TrialStarted() {
  const { family, profile } = useSession();
  const plan = usePlan();
  const t = trialTimeline(plan.sub?.trial_ends_at);
  const [remind, setRemind] = useState(plan.sub?.remind_trial ?? true);
  const [err, setErr] = useState('');
  const { data: parents } = useQuery(() => api.familyParents(family!.id), [family!.id]);
  const other = (parents ?? []).find((p) => p.id !== profile?.id);

  // Reached without a trial (a resubscribe, or the return link opened later): the plan screen instead.
  if (plan.enabled && plan.loaded && plan.sub && plan.state !== 'trialing') return <Redirect href="/parent/subscription" />;

  async function toggle(on: boolean) {
    setRemind(on);
    setErr('');
    try {
      await setTrialReminder(family!.id, on);
    } catch {
      setRemind(!on);
      setErr('Couldn’t save. Try again.');
    }
  }

  return (
    <Screen
      gap={16}
      header={<View style={{ height: 64 }} />}
      footer={
        <Pressable accessibilityRole="button" onPress={() => router.replace('/parent')} style={({ pressed }) => [st.cta, pressed && { opacity: 0.85 }]}>
          <Text style={st.ctaText}>Continue setup</Text>
        </Pressable>
      }>
      <View style={{ alignItems: 'center', gap: 12 }}>
        <Image source={require('@/assets/images/badger-celebrate.png')} style={{ width: 171, height: 170 }} contentFit="contain" accessibilityLabel="BabyBadger celebrating" />
        <Text style={st.title}>Your free trial is on</Text>
        <Text style={st.lead}>
          Everything is unlocked until <Text style={{ fontFamily: font.bodyBold, color: color.ink }}>{t.endsLong}</Text>.
        </Text>
      </View>
      <View style={[st.card, { gap: 10 }]}>
        <View style={st.track}>
          <View style={[st.fill, { width: `${t.progress * 100}%` }]} />
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={st.sub12}>Today</Text>
          <Text style={st.sub12}>Reminder {t.reminder}</Text>
          <Text style={st.sub12}>First charge {t.firstCharge}</Text>
        </View>
      </View>
      <View style={[st.card, { paddingVertical: 0 }]}>
        <ToggleRow label="Remind me before it ends" sub="Push, 3 days before" value={remind} onChange={toggle} last />
      </View>
      <ErrorText>{err}</ErrorText>
      {other ? (
        <View style={st.note}>
          <Text style={st.noteText}>
            <Text style={{ fontFamily: font.bodyBold, color: color.primaryStrong }}>{firstName(other.full_name)} is covered too.</Text> One plan for your household.
          </Text>
        </View>
      ) : null}
    </Screen>
  );
}

// Values from wireframe P38.
const st = StyleSheet.create({
  title: { fontFamily: font.display, fontSize: 28, color: color.ink, marginVertical: -5.43, textAlign: 'center' },
  lead: { fontFamily: font.body, fontSize: 15, lineHeight: 22, color: color.ink2, textAlign: 'center' },
  card: { paddingVertical: 14, paddingHorizontal: 16, backgroundColor: '#FFFFFF', borderRadius: 24, ...cardShadow },
  track: { flexDirection: 'row', height: 10, borderRadius: 5, overflow: 'hidden', backgroundColor: color.muted },
  fill: { backgroundColor: color.primary },
  sub12: { fontFamily: font.body, fontSize: 12, color: color.ink2 },
  note: { paddingVertical: 12, paddingHorizontal: 14, backgroundColor: color.primaryTint, borderRadius: 14 },
  noteText: { fontFamily: font.body, fontSize: 14, lineHeight: 20, color: color.ink },
  cta: { height: 54, borderRadius: 999, backgroundColor: color.primary, alignItems: 'center', justifyContent: 'center' },
  ctaText: { fontFamily: font.displayBold, fontSize: 17, color: '#FFFFFF' },
});
