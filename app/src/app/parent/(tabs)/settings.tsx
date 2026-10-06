import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { SetRow, ToggleRow } from '@/components/bits';
import { Card, ErrorText, Screen } from '@/components/ui';
import { api, useQuery } from '@/lib/data';
import { firstName } from '@/lib/format';
import { rulesApi, rulesLabel } from '@/lib/house-rules';
import { placesApi, placesCountLabel } from '@/lib/places';
import { useSession } from '@/lib/session';
import { supabase } from '@/lib/supabase';
import { color, font } from '@/theme';
import { Text } from '@/components/Text';

// Wireframe P12b (settings · account; supersedes P12): grouped settings rows, account, sign out.
// Homes and places opens P56. Left out until built: Arrivals and departures, Off-plan and help alerts, Subscription;
// Kids and devices has no detail screen yet (P13), so its row doesn't open anything.
export default function Settings() {
  const { family, profile, session, signOut, refresh } = useSession();
  const [logAlerts, setLogAlerts] = useState(profile?.alert_logs ?? true);
  const [saveErr, setSaveErr] = useState('');
  async function toggleLogAlerts(on: boolean) {
    setLogAlerts(on);
    setSaveErr('');
    const { error: e } = await supabase.from('profiles').update({ alert_logs: on }).eq('id', profile!.id);
    if (e) {
      setLogAlerts(!on);
      setSaveErr('Couldn’t save. Try again.');
    } else void refresh();
  }
  const fid = family!.id;
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
  const parents = (data?.parents ?? []).map((p) => firstName(p.full_name)).join(', ') || firstName(profile?.full_name);
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
        <SetRow label="Parents" value={parents} />
        <SetRow label="Kids and devices" value={kids || 'None yet'} />
        <SetRow label="Sitters" value={sitters || 'None yet'} onPress={() => router.navigate('/parent/sitters')} />
        <SetRow label="Homes and places" value={placesCountLabel(data?.places ?? [])} onPress={() => router.push('/parent/places')} />
        <SetRow label="House rules" value={rulesLabel(data?.rules.length ?? 0)} onPress={() => router.push('/parent/rules')} last />
      </Card>

      <Text style={[st.section, { marginTop: 2 }]}>ALERTS</Text>
      <Card style={st.card}>
        <ToggleRow label="Food and tasks" sub="Each entry the sitter logs" value={logAlerts} onChange={toggleLogAlerts} last />
      </Card>
      <ErrorText>{saveErr}</ErrorText>

      <Text style={[st.section, { marginTop: 2 }]}>PRIVACY</Text>
      <Card style={st.card}>
        <SetRow label="Consent records" value={`${signed} signed`} />
        <SetRow label="Keep location history" value="[RETENTION]" last />
      </Card>

      <Text style={[st.section, { marginTop: 2 }]}>ACCOUNT</Text>
      <Card style={st.card}>
        <SetRow label="Name" value={profile?.full_name ?? ''} />
        <SetRow label="Email" value={session?.user.email ?? ''} last />
      </Card>
      <Pressable accessibilityRole="button" onPress={signOut} style={({ pressed }) => [st.signOut, pressed && { opacity: 0.8 }]}>
        <Text style={st.signOutText}>Sign out</Text>
      </Pressable>
      <Text style={st.note}>Alerts to this phone stop until you sign in again.</Text>
    </Screen>
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
});
