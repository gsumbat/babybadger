import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { Text } from '@/components/Text';
import { graceEnds, longDate, usePlan } from '@/lib/billing';
import { color, font } from '@/theme';

// Icons from the billing wireframes (P36, P40, P41, P4l).
export const BILLING_SVG = {
  close: '<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18" fill="none" stroke="#1B2328" stroke-width="2.2" stroke-linecap="round"/></svg>',
  map: '<svg viewBox="0 0 24 24" fill="none" stroke="#47698A" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 4L3 6.5v13.5l6-2.5 6 2.5 6-2.5V4l-6 2.5z"/><path d="M9 4v13.5M15 6.5V20"/></svg>',
  trip: '<svg viewBox="0 0 24 24" fill="none" stroke="#47698A" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="18" r="2.5"/><circle cx="18" cy="6" r="2.5"/><path d="M8.5 18H15a3 3 0 0 0 0-6H9a3 3 0 0 1 0-6h6.5"/></svg>',
  report: '<svg viewBox="0 0 24 24" fill="none" stroke="#47698A" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4M9 12h6M9 16h6"/></svg>',
  phone: '<svg viewBox="0 0 24 24" fill="none" stroke="#47698A" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="7" y="2.5" width="10" height="19" rx="2.5"/><path d="M11 18.5h2"/></svg>',
  people: '<svg viewBox="0 0 24 24" fill="none" stroke="#47698A" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c0-3.5 3-5.5 6.5-5.5s6.5 2 6.5 5.5M16 4.8a3.5 3.5 0 0 1 0 6.4M18.5 14.8c1.8.7 3 2.3 3 4.7"/></svg>',
  warn: '<svg viewBox="0 0 24 24" fill="none" stroke="#7A4E0E" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l9.5 17h-19z"/><path d="M12 10v4M12 17.5h0"/></svg>',
  pause: '<svg viewBox="0 0 24 24" fill="none" stroke="#47698A" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M10 9v6M14 9v6"/></svg>',
  lock: '<svg viewBox="0 0 24 24" fill="none" stroke="#47698A" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>',
};

/** P40: Home banner while a payment failed and the grace period runs. Renders nothing otherwise. */
export function PaymentIssueBanner() {
  const plan = usePlan();
  if (!plan.enabled || plan.state !== 'past_due' || !plan.hasPlan) return null;
  return (
    <View style={st.issue}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <SvgXml xml={BILLING_SVG.warn} width={22} height={22} style={{ flexShrink: 0 }} />
        <Text style={st.issueTitle}>Payment didn’t go through</Text>
      </View>
      <Text style={st.issueText}>
        Everything keeps working until <Text style={{ fontFamily: font.bodyBold }}>{longDate(graceEnds(plan.sub))}</Text> while we retry your card. Update your card to avoid a pause.
      </Text>
      <Pressable accessibilityRole="button" onPress={() => router.push('/parent/subscription')} style={({ pressed }) => [st.issueBtn, pressed && { opacity: 0.85 }]}>
        <Text style={st.issueBtnText}>Update payment</Text>
      </Pressable>
    </View>
  );
}

/** P4l: the live map's place when the family has no plan (P40 "Paused: live map and trips"). */
export function LockedMap({ height = 220 }: { height?: number }) {
  const plan = usePlan();
  return (
    <View style={[st.locked, { height }]}>
      <View style={st.lockCircle}>
        <SvgXml xml={BILLING_SVG.lock} width={22} height={22} />
      </View>
      <Text style={st.lockTitle}>{plan.sub?.had_trial ? 'Resubscribe to see the live map' : 'Start your free trial to see the live map'}</Text>
      <Text style={st.lockSub}>Messages, help alerts and past reports keep working.</Text>
      <Pressable accessibilityRole="button" onPress={() => router.push('/parent/plans')} style={({ pressed }) => [st.lockBtn, pressed && { opacity: 0.85 }]}>
        <Text style={st.lockBtnText}>See plans</Text>
      </Pressable>
    </View>
  );
}

// Values from wireframes P40 and P4l.
const st = StyleSheet.create({
  issue: { gap: 8, paddingVertical: 14, paddingHorizontal: 16, backgroundColor: color.warnTint, borderRadius: 16 },
  issueTitle: { fontFamily: font.bodyBold, fontSize: 15, color: color.warnInk },
  issueText: { fontFamily: font.body, fontSize: 14, lineHeight: 20, color: color.ink },
  issueBtn: { height: 46, borderRadius: 999, backgroundColor: color.primary, alignItems: 'center', justifyContent: 'center' },
  issueBtnText: { fontFamily: font.displayBold, fontSize: 17, color: '#FFFFFF' },
  locked: { backgroundColor: '#EEF1F4', alignItems: 'center', justifyContent: 'center', gap: 8, paddingHorizontal: 28 },
  lockCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  lockTitle: { fontFamily: font.bodyBold, fontSize: 15, color: color.ink, textAlign: 'center' },
  lockSub: { fontFamily: font.body, fontSize: 13, lineHeight: 18, color: color.ink2, textAlign: 'center' },
  lockBtn: { height: 40, paddingHorizontal: 18, marginTop: 4, borderRadius: 999, backgroundColor: color.primary, alignItems: 'center', justifyContent: 'center' },
  lockBtnText: { fontFamily: font.displayBold, fontSize: 15, color: '#FFFFFF' },
});
