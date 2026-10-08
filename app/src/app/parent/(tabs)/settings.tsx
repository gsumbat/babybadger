import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { SetRow, ToggleRow } from '@/components/bits';
import { Sheet } from '@/components/timing';
import { Card, ErrorText, Screen } from '@/components/ui';
import { settingsValue, usePlan } from '@/lib/billing';
import { api, useQuery } from '@/lib/data';
import { membersRowValue } from '@/lib/family-members';
import { firstName } from '@/lib/format';
import { rulesApi, rulesLabel } from '@/lib/house-rules';
import { placesApi, placesCountLabel } from '@/lib/places';
import { useSession } from '@/lib/session';
import { errorText, supabase } from '@/lib/supabase';
import { color, font } from '@/theme';
import { Text, TextInput } from '@/components/Text';

// Wireframe P12b (settings · account; supersedes P12): grouped settings rows, account, sign out.
// Family members opens P78 ("Jen, Dan · 2 of 4 seats", migration 30). Sitters opens P27, Homes and places P56, House rules P74,
// Kids and devices P13k (the kids list; devices there are Coming soon). Rows whose screens aren't built show their value and
// don't open anything: Consent records. Subscription: with billing on (EXPO_PUBLIC_BILLING=1)
// it reads the plan ("Free trial · ends Nov 6", "Family · monthly", "Payment issue", "Start free trial") and opens
// P39, or P36 when the family has no plan; with billing off it reads "Coming soon" and opens nothing. Alerts: "Arrivals and departures" is profiles.alert_arrivals (migration 21; trip alerts skip a
// parent who turned it off), "Food and tasks" is alert_logs, "Off-plan and help alerts" is always on (a label).
// Only the owner (migration 32) sees Subscription: the family's plan covers everyone else. A read-only member's
// Sitters row doesn't open P27. ACCOUNT › Phone (migration 33; hidden until it runs) opens the P12p sheet: her own
// number, which her family's members and the sitters who signed the notice see on S10 (Text / Call).
export default function Settings() {
  const { family, profile, session, signOut, refresh, familyRole, isOwner } = useSession();
  const plan = usePlan();
  const [logAlerts, setLogAlerts] = useState(profile?.alert_logs ?? true);
  const [arrivals, setArrivals] = useState(profile?.alert_arrivals ?? true);
  const [saveErr, setSaveErr] = useState('');
  async function savePref(field: 'alert_logs' | 'alert_arrivals', on: boolean, set: (v: boolean) => void) {
    set(on);
    setSaveErr('');
    const { error: e } = await supabase.from('profiles').update({ [field]: on }).eq('id', profile!.id);
    if (e) {
      set(!on);
      setSaveErr('Couldn’t save. Try again.');
    } else void refresh();
  }
  const fid = family!.id;
  // Her own phone (migration 33): { ok: false } before it runs, and the row stays hidden.
  const { data: phone, reload: reloadPhone } = useQuery(() => api.myPhone().then((p) => ({ ok: true, phone: p })).catch(() => ({ ok: false, phone: null as string | null })), [profile?.id]);
  const [phoneOpen, setPhoneOpen] = useState(false);
  const { data, error } = useQuery(async () => {
    // house_rules arrives with migration 09, places with 16; until they're run the rows read "None yet".
    const [kids, sitters, parents, rules, places] = await Promise.all([
      api.kids(fid),
      api.familySitters(fid),
      api.familyParents(fid),
      rulesApi.rules(fid).catch(() => []),
      placesApi.list(fid).catch(() => []),
    ]);
    return { kids, sitters, parents, rules, places };
  }, [fid]);
  const members = membersRowValue(data?.parents.length ? data.parents.map((p) => p.full_name) : [profile?.full_name ?? '']);
  const kids = (data?.kids ?? []).map((k) => k.name).join(', ');
  const sitterLinks = data?.sitters ?? [];
  const sitters = sitterLinks.map((s) => firstName(s.profile?.full_name)).join(', ');
  const signed = sitterLinks.filter((s) => s.status === 'active').length;

  return (
    <Screen
      gap={8}
      header={
        <View style={st.header}>
          <Text style={st.title}>Settings</Text>
        </View>
      }>
      <ErrorText>{error}</ErrorText>
      <Text style={st.section}>FAMILY</Text>
      <Card style={st.card}>
        <SetRow label="Family members" value={members} onPress={() => router.push('/parent/members')} />
        <SetRow label="Kids and devices" value={kids || 'None yet'} onPress={() => router.push('/parent/kids')} />
        <SetRow label="Sitters" value={sitters || 'None yet'} onPress={familyRole === 'helper' ? undefined : () => router.push('/parent/sitter-list')} />
        <SetRow label="Homes and places" value={placesCountLabel(data?.places ?? [])} onPress={() => router.push('/parent/places')} />
        <SetRow label="House rules" value={rulesLabel(data?.rules.length ?? 0)} onPress={() => router.push('/parent/rules')} last />
      </Card>

      <Text style={[st.section, { marginTop: 2 }]}>ALERTS</Text>
      <Card style={st.card}>
        <ToggleRow label="Arrivals and departures" sub="Trips to saved places" value={arrivals} onChange={(on) => savePref('alert_arrivals', on, setArrivals)} />
        <ToggleRow label="Food and tasks" sub="Each entry the sitter logs" value={logAlerts} onChange={(on) => savePref('alert_logs', on, setLogAlerts)} />
        <View style={st.alwaysRow}>
          <View style={{ flexShrink: 1 }}>
            <Text style={st.rowLabel}>Off-plan and help alerts</Text>
            <Text style={st.rowSub}>Always on for safety</Text>
          </View>
          <View style={st.always}>
            <Text style={st.alwaysText}>Always</Text>
          </View>
        </View>
      </Card>
      <ErrorText>{saveErr}</ErrorText>

      <Text style={[st.section, { marginTop: 2 }]}>PRIVACY</Text>
      <Card style={st.card}>
        <SetRow label="Consent records" value={`${signed} signed`} />
        <SetRow label="Keep location history" value="[RETENTION]" last={!isOwner} />
        {!isOwner ? null : plan.enabled ? (
          <SetRow
            label="Subscription"
            value={plan.loaded ? settingsValue(plan.sub) : ''}
            onPress={() => router.push(plan.state === 'none' || plan.state === 'ended' ? '/parent/plans?from=settings' : '/parent/subscription')}
            last
          />
        ) : (
          <SetRow label="Subscription" value="Coming soon" last />
        )}
      </Card>

      <Text style={[st.section, { marginTop: 2 }]}>ACCOUNT</Text>
      <Card style={st.card}>
        <SetRow label="Name" value={profile?.full_name ?? ''} />
        {phone?.ok ? <SetRow label="Phone" value={phone.phone || 'Add'} onPress={() => setPhoneOpen(true)} /> : null}
        <SetRow label="Email" value={session?.user.email ?? ''} last />
      </Card>
      <Pressable accessibilityRole="button" onPress={signOut} style={({ pressed }) => [st.signOut, pressed && { opacity: 0.8 }]}>
        <Text style={st.signOutText}>Sign out</Text>
      </Pressable>
      <Text style={st.note}>Alerts to this phone stop until you sign in again.</Text>
      {phone?.ok ? <PhoneSheet open={phoneOpen} current={phone.phone} onClose={() => setPhoneOpen(false)} onSaved={reloadPhone} /> : null}
    </Screen>
  );
}

/** Wireframe P12p "Your phone" (app/src/wireframes/P12p.tsx): the number, Save, and Remove my number when one is saved.
 * The database checks the format (7 to 15 digits). */
function PhoneSheet({ open, current, onClose, onSaved }: { open: boolean; current: string | null; onClose: () => void; onSaved: () => void }) {
  const [value, setValue] = useState(current ?? '');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [wasOpen, setWasOpen] = useState(open);
  // Start from the saved number each time the sheet opens.
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setValue(current ?? '');
      setErr('');
    }
  }
  async function save(next: string) {
    setBusy(true);
    setErr('');
    try {
      await api.setMyPhone(next);
      onSaved();
      onClose();
    } catch (e) {
      setErr(errorText(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <Sheet open={open} onClose={onClose}>
      <View style={{ gap: 2 }}>
        <Text style={st.sheetTitle}>Your phone</Text>
        <Text style={st.sheetSub}>Your sitters can call or text you from the family page. Only sitters who signed your notice and your family members see it.</Text>
      </View>
      <View style={{ gap: 6 }}>
        <Text style={st.fieldLabel}>Phone number</Text>
        <TextInput value={value} onChangeText={setValue} keyboardType="phone-pad" textContentType="telephoneNumber" autoComplete="tel" maxLength={30} placeholder="(813) 555-0142" placeholderTextColor={color.quiet} style={st.input} />
      </View>
      <ErrorText>{err}</ErrorText>
      <Pressable accessibilityRole="button" accessibilityState={{ busy }} onPress={busy ? undefined : () => save(value)} style={({ pressed }) => [st.save, pressed && { opacity: 0.85 }]}>
        {busy ? <ActivityIndicator color="#FFFFFF" /> : <Text style={st.saveText}>Save</Text>}
      </Pressable>
      {current ? (
        <Pressable accessibilityRole="button" onPress={busy ? undefined : () => save('')} style={st.remove}>
          <Text style={st.removeText}>Remove my number</Text>
        </Pressable>
      ) : null}
    </Sheet>
  );
}

const st = StyleSheet.create({
  header: { paddingTop: 20, paddingHorizontal: 20, paddingBottom: 12 },
  title: { fontFamily: font.display, fontSize: 24, color: color.ink },
  section: { fontFamily: font.bodyBold, fontSize: 13, color: color.ink2, letterSpacing: 0.6 },
  card: { paddingVertical: 4, paddingHorizontal: 16, gap: 0 },
  // P12b sign out: white pill, 1.5 px line-strong border, red label.
  signOut: { height: 54, marginTop: 8, borderRadius: 999, borderWidth: 1.5, borderColor: color.lineStrong, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  signOutText: { fontFamily: font.displayBold, fontSize: 17, color: color.badInk, includeFontPadding: false },
  note: { fontFamily: font.body, fontSize: 13, color: color.ink2, textAlign: 'center' },
  // P12b "Off-plan and help alerts": label row with a grey "Always" pill instead of a switch.
  alwaysRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 56, gap: 8 },
  rowLabel: { fontFamily: font.body, fontSize: 15, color: color.ink },
  rowSub: { fontFamily: font.body, fontSize: 13, color: '#5F6D74' },
  always: { height: 26, paddingHorizontal: 10, borderRadius: 999, backgroundColor: color.muted, justifyContent: 'center' },
  alwaysText: { fontFamily: font.bodyBold, fontSize: 12, color: color.ink2 },
  // P12p values
  sheetTitle: { fontFamily: font.display, fontSize: 24, color: color.ink },
  sheetSub: { fontFamily: font.body, fontSize: 14, lineHeight: 20, color: color.ink2 },
  fieldLabel: { fontFamily: font.bodySemi, fontSize: 14, color: color.ink },
  input: { height: 52, paddingHorizontal: 14, borderRadius: 8, borderWidth: 1, borderColor: color.lineStrong, fontFamily: font.body, fontSize: 16, color: color.ink },
  save: { height: 54, borderRadius: 999, backgroundColor: color.primary, alignItems: 'center', justifyContent: 'center' },
  saveText: { fontFamily: font.displayBold, fontSize: 17, color: '#FFFFFF' },
  remove: { height: 40, alignItems: 'center', justifyContent: 'center' },
  removeText: { fontFamily: font.bodySemi, fontSize: 15, color: color.badInk },
});
