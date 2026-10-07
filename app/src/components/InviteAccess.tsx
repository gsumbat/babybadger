import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { KidDot } from '@/components/bits';
import { Text } from '@/components/Text';
import { Field, Icon } from '@/components/ui';
import { kidIdsFor, PAY_OPTIONS, parseRate, type InviteChoices, type PaySchedule } from '@/lib/invites';
import type { Kid } from '@/lib/types';
import { cardShadow, color, font } from '@/theme';

// Wireframe P23's choices (who she looks after, what she can do, pay, sitter requirements), shared by P23 (parent/
// invite.tsx) and P3d Connect with Maya (app/f/[token].tsx). Every kid starts chosen and every switch on, as P23
// draws them. Left out until built: the trips sub-line ("School, soccer, park": saved places aren't built).

export function useInviteChoices(kids: Kid[] | undefined) {
  const [unpicked, setUnpicked] = useState<string[]>([]);
  const [canDrive, setCanDrive] = useState(true);
  const [canTrip, setCanTrip] = useState(true);
  const [canMessage, setCanMessage] = useState(true);
  const [rateText, setRateText] = useState('');
  const [pay, setPay] = useState<PaySchedule>('weekly');
  const allKidIds = (kids ?? []).map((k) => k.id);
  const picked = allKidIds.filter((id) => !unpicked.includes(id));
  const rate = parseRate(rateText);
  const choices = (): InviteChoices => ({ kid_ids: kidIdsFor(picked, allKidIds), can_drive: canDrive, can_trip: canTrip, can_message: canMessage, rate, pay_schedule: pay });
  return {
    kids: kids ?? [],
    picked,
    toggleKid: (id: string) => setUnpicked((u) => (u.includes(id) ? u.filter((x) => x !== id) : [...u, id])),
    canDrive,
    setCanDrive,
    canTrip,
    setCanTrip,
    canMessage,
    setCanMessage,
    rateText,
    setRateText,
    pay,
    setPay,
    rate,
    choices,
    /** P23 footer: needs one kid when the family has kids. */
    ready: !kids?.length || picked.length > 0,
  };
}

export type InviteChoicesState = ReturnType<typeof useInviteChoices>;

/** P23 body: WHO SHE’LL LOOK AFTER, WHAT SHE CAN DO, PAY and the Set sitter requirements link. */
export function InviteAccessFields({ c, parentNames }: { c: InviteChoicesState; parentNames: string }) {
  return (
    <>
      {c.kids.length ? (
        <>
          <Text style={st.section}>WHO SHE’LL LOOK AFTER</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {c.kids.map((k) => {
              const on = c.picked.includes(k.id);
              return (
                <Pressable key={k.id} accessibilityRole="checkbox" accessibilityState={{ checked: on }} onPress={() => c.toggleKid(k.id)} style={[st.kidChip, on && st.kidChipOn]}>
                  <KidDot kid={k} size={34} />
                  <Text style={st.kidChipText}>{on ? `✓ ${k.name}` : k.name}</Text>
                </Pressable>
              );
            })}
          </View>
        </>
      ) : null}
      <Text style={[st.section, { marginTop: 2 }]}>WHAT SHE CAN DO</Text>
      <View style={st.permCard}>
        <Perm label="Drive the kids" sub="Needs a verified driver’s license" value={c.canDrive} onChange={c.setCanDrive} />
        <Perm label="Start trips to saved places" value={c.canTrip} onChange={c.setCanTrip} />
        <Perm label="Message both parents" sub={parentNames || undefined} value={c.canMessage} onChange={c.setCanMessage} last />
      </View>
      <Text style={[st.section, { marginTop: 2 }]}>PAY</Text>
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Field label="Hourly rate" value={c.rateText} onChangeText={c.setRateText} keyboardType="decimal-pad" style={st.rateInput} />
        </View>
        <View style={{ flex: 1, minWidth: 0, gap: 6 }}>
          <Text style={st.payLabel}>Paid</Text>
          <View style={st.paySeg}>
            {PAY_OPTIONS.map((o) => {
              const on = o.value === c.pay;
              return (
                <Pressable key={o.value} accessibilityRole="button" accessibilityState={{ selected: on }} onPress={() => c.setPay(o.value)} style={[st.payItem, on && st.payItemOn]}>
                  <Text style={on ? st.payTextOn : st.payText}>{o.label}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>
      <Pressable accessibilityRole="button" onPress={() => router.push(`/parent/requirements/setup?from=invite&drive=${c.canDrive ? 1 : 0}`)} style={st.reqLink}>
        <Icon name="shield" size={22} tint={color.primaryStrong} />
        <Text style={st.reqText}>
          <Text style={st.reqBold}>Set sitter requirements.</Text> Choose what every sitter must have. They go with this invite.
        </Text>
        <Icon name="chevron-right" size={18} tint={color.primaryStrong} />
      </Pressable>
    </>
  );
}

/** P23 "What she can do" row: title, grey sub-line, 50×30 switch. Also the S12 / S13 "Be found later" switch track. */
export function Perm({ label, sub, value, onChange, last }: { label: string; sub?: string; value: boolean; onChange: (v: boolean) => void; last?: boolean }) {
  return (
    <Pressable accessibilityRole="switch" accessibilityState={{ checked: value }} accessibilityLabel={label} onPress={() => onChange(!value)} style={[st.perm, !last && st.line]}>
      <View style={{ flexShrink: 1 }}>
        <Text style={st.permTitle}>{label}</Text>
        {sub ? <Text style={st.permSub}>{sub}</Text> : null}
      </View>
      <SwitchTrack value={value} />
    </Pressable>
  );
}

/** The wireframes' 50×30 switch. */
export function SwitchTrack({ value }: { value: boolean }) {
  return (
    <View style={[st.track, { backgroundColor: value ? color.primary : color.lineStrong }]}>
      <View style={[st.knob, value ? { right: 3 } : { left: 3 }]} />
    </View>
  );
}

// Values from wireframe P23.
const st = StyleSheet.create({
  section: { fontFamily: font.bodyBold, fontSize: 13, color: color.ink2, letterSpacing: 0.6 },
  // Unchosen kids: the same chip without the tint, check and blue border (only the chosen state is drawn).
  kidChip: { height: 44, paddingLeft: 4, paddingRight: 14, borderRadius: 999, borderWidth: 2, borderColor: color.line, backgroundColor: '#FFFFFF', flexDirection: 'row', alignItems: 'center', gap: 8 },
  kidChipOn: { backgroundColor: color.primaryTint, borderColor: color.primary },
  kidChipText: { fontFamily: font.bodySemi, fontSize: 15, color: color.ink },
  permCard: { backgroundColor: '#FFFFFF', borderRadius: 24, paddingHorizontal: 16, ...cardShadow },
  perm: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, minHeight: 58 },
  line: { borderBottomWidth: 1, borderBottomColor: color.divider },
  permTitle: { fontFamily: font.bodySemi, fontSize: 15, color: color.ink },
  permSub: { fontFamily: font.body, fontSize: 13, color: color.ink2 },
  track: { width: 50, height: 30, borderRadius: 15, flexShrink: 0 },
  knob: { position: 'absolute', top: 3, width: 24, height: 24, borderRadius: 12, backgroundColor: '#FFFFFF' },
  rateInput: { minHeight: 48, height: 48, borderColor: color.lineStrong },
  payLabel: { fontFamily: font.bodySemi, fontSize: 14, color: color.ink },
  paySeg: { flexDirection: 'row', gap: 4, padding: 4, backgroundColor: color.muted, borderRadius: 12 },
  payItem: { flex: 1, minWidth: 0, height: 34, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  payItemOn: { backgroundColor: '#FFFFFF' },
  payText: { fontFamily: font.bodyMedium, fontSize: 13, color: color.ink2 },
  payTextOn: { fontFamily: font.bodyBold, fontSize: 13, color: color.ink },
  reqLink: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, paddingHorizontal: 14, backgroundColor: color.primaryTint, borderRadius: 14 },
  reqText: { flexGrow: 1, flexShrink: 1, fontFamily: font.body, fontSize: 14, lineHeight: 20, color: color.ink },
  reqBold: { fontFamily: font.bodyBold, color: color.primaryStrong },
});
