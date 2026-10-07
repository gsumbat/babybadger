import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, Linking, Platform, Pressable, StyleSheet, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { BILLING_SVG } from '@/components/billing';
import { Text } from '@/components/Text';
import { ErrorText, Screen } from '@/components/ui';
import { accessEnds, CANCEL_REASONS, DATA_KEPT_MONTHS, manageSubscription, PAUSE_MONTHS, pauseLabel, shortDate, SUPPORT_EMAIL, usePlan } from '@/lib/billing';
import { useSession } from '@/lib/session';
import { cardShadow, color, font } from '@/theme';

// Wireframe P41 Cancel or pause (from P39 "Cancel subscription"). Cancel runs the billing-manage function: the plan
// stops at the end of the period (or the trial) and the reason goes to Stripe as cancellation feedback.
// "Pause instead?" (paid plans only, not during the trial) pauses billing for 1, 2 or 3 months (Stripe
// pause_collection); the plan is paused for that time (P40's lists). Refund: "Contact us" opens an email.
export default function Cancel() {
  const { family } = useSession();
  const plan = usePlan();
  const fid = family!.id;
  const [reason, setReason] = useState('');
  const [months, setMonths] = useState<number>(2);
  const [busy, setBusy] = useState('');
  const [err, setErr] = useState('');
  const canPause = plan.state === 'active';

  async function run(key: 'cancel' | 'pause') {
    setBusy(key);
    setErr('');
    try {
      await manageSubscription(fid, key, key === 'pause' ? { months } : { reason });
      router.back();
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Something went wrong. Try again.');
    } finally {
      setBusy('');
    }
  }
  function confirmCancel() {
    const until = shortDate(accessEnds(plan.sub));
    const msg = until ? `You keep full access until ${until}.` : 'Your plan won’t renew.';
    if (Platform.OS === 'web') {
      if (globalThis.confirm?.(`Cancel subscription? ${msg}`)) void run('cancel');
      return;
    }
    Alert.alert('Cancel subscription?', msg, [
      { text: 'Keep my plan', style: 'cancel' },
      { text: 'Cancel subscription', style: 'destructive', onPress: () => void run('cancel') },
    ]);
  }

  return (
    <Screen
      back
      title="Cancel subscription"
      gap={12}
      footer={
        <View style={{ gap: 6 }}>
          <Pressable accessibilityRole="button" onPress={() => router.back()} style={({ pressed }) => [st.keep, pressed && { opacity: 0.85 }]}>
            <Text style={st.keepText}>Keep my plan</Text>
          </Pressable>
          <Pressable accessibilityRole="button" onPress={busy ? undefined : confirmCancel} style={st.cancel}>
            {busy === 'cancel' ? <ActivityIndicator color={color.badInk} /> : <Text style={st.cancelText}>Cancel subscription</Text>}
          </Pressable>
        </View>
      }>
      <Text style={st.lead}>Can you tell us why? It helps us make BabyBadger better.</Text>
      <View style={st.chips}>
        {CANCEL_REASONS.map((r) => {
          const on = reason === r;
          return (
            <Pressable key={r} accessibilityRole="button" accessibilityState={{ selected: on }} onPress={() => setReason(on ? '' : r)} style={[st.chip, on ? st.chipOn : st.chipOff]}>
              <Text style={[st.chipText, on && { color: color.primary }]}>{on ? `✓ ${r}` : r}</Text>
            </Pressable>
          );
        })}
      </View>
      {canPause ? (
        <View style={st.pause}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={st.pauseIcon}>
              <SvgXml xml={BILLING_SVG.pause} width={22} height={22} />
            </View>
            <View style={{ flexShrink: 1 }}>
              <Text style={st.pauseTitle}>Pause instead?</Text>
              <Text style={st.pauseSub}>Stop paying for 1–3 months, keep everything set up</Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {PAUSE_MONTHS.map((m) => (
              <Pressable key={m} accessibilityRole="radio" accessibilityState={{ checked: months === m }} onPress={() => setMonths(m)} style={[st.month, months === m && { backgroundColor: color.primary }]}>
                <Text style={[st.monthText, months === m && { color: '#FFFFFF' }]}>{m === 1 ? '1 month' : `${m} months`}</Text>
              </Pressable>
            ))}
          </View>
          <Pressable accessibilityRole="button" onPress={busy ? undefined : () => void run('pause')} style={({ pressed }) => [st.pauseBtn, pressed && { opacity: 0.85 }]}>
            {busy === 'pause' ? <ActivityIndicator color="#FFFFFF" /> : <Text style={st.pauseBtnText}>{pauseLabel(months)}</Text>}
          </Pressable>
        </View>
      ) : null}
      <ErrorText>{err}</ErrorText>
      <Text style={st.section}>IF YOU CANCEL</Text>
      <View style={st.card}>
        <Row label="Full access until" value={shortDate(accessEnds(plan.sub)) || '–'} />
        <Row label="Sitters" value="Keep their free accounts" />
        <Row label="Your data" value={`Kept ${DATA_KEPT_MONTHS} months`} />
        <Row label="Refund" value="Contact us" link onPress={() => void Linking.openURL(`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent('BabyBadger refund')}`)} last />
      </View>
    </Screen>
  );
}

function Row({ label, value, link, onPress, last }: { label: string; value: string; link?: boolean; onPress?: () => void; last?: boolean }) {
  return (
    <View style={[st.row, !last && st.line]}>
      <Text style={st.rowLabel}>{label}</Text>
      <Text onPress={onPress} accessibilityRole={link ? 'link' : undefined} style={[st.rowValue, link && { color: color.primary, textDecorationLine: 'underline' }]}>
        {value}
      </Text>
    </View>
  );
}

// Values from wireframe P41.
const st = StyleSheet.create({
  lead: { fontFamily: font.body, fontSize: 15, lineHeight: 22, color: color.ink2 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { height: 40, paddingHorizontal: 14, borderRadius: 999, justifyContent: 'center' },
  chipOff: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: color.line },
  chipOn: { backgroundColor: color.primaryTint, borderWidth: 1.5, borderColor: color.primary },
  chipText: { fontFamily: font.bodySemi, fontSize: 14, color: color.ink },
  pause: { gap: 10, paddingVertical: 14, paddingHorizontal: 16, backgroundColor: color.primaryTint, borderRadius: 16 },
  pauseIcon: { width: 40, height: 40, borderRadius: 14, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  pauseTitle: { fontFamily: font.bodyBold, fontSize: 16, color: color.ink },
  pauseSub: { fontFamily: font.body, fontSize: 13, color: color.primaryStrong },
  month: { flex: 1, height: 36, borderRadius: 999, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  monthText: { fontFamily: font.bodySemi, fontSize: 14, color: color.ink },
  pauseBtn: { height: 46, borderRadius: 999, backgroundColor: color.primary, alignItems: 'center', justifyContent: 'center' },
  pauseBtnText: { fontFamily: font.displayBold, fontSize: 17, color: '#FFFFFF' },
  section: { fontFamily: font.bodyBold, fontSize: 13, color: color.ink2, letterSpacing: 0.6 },
  card: { paddingHorizontal: 16, backgroundColor: '#FFFFFF', borderRadius: 24, ...cardShadow },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, minHeight: 48 },
  line: { borderBottomWidth: 1, borderBottomColor: color.divider },
  rowLabel: { fontFamily: font.body, fontSize: 15, color: color.ink },
  rowValue: { fontFamily: font.bodySemi, fontSize: 15, color: color.ink, textAlign: 'right', flexShrink: 1 },
  keep: { height: 50, borderRadius: 999, backgroundColor: color.primaryTint, alignItems: 'center', justifyContent: 'center' },
  keepText: { fontFamily: font.displayBold, fontSize: 17, color: color.primary },
  cancel: { height: 40, alignItems: 'center', justifyContent: 'center' },
  cancelText: { fontFamily: font.bodySemi, fontSize: 15, color: color.badInk },
});
