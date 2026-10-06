import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { KidDot, kidSub, SetRow, ToggleRow } from '@/components/bits';
import { Button, Card, ErrorText, Label, Screen, T } from '@/components/ui';
import { api, useQuery } from '@/lib/data';
import { firstName } from '@/lib/format';
import { useSession } from '@/lib/session';
import { supabase } from '@/lib/supabase';
import { color, font } from '@/theme';

// Wireframe P12: grouped settings rows.
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
    const [kids, sitters] = await Promise.all([api.kids(fid), api.familySitters(fid)]);
    return { kids, sitters };
  }, [fid]);
  const kids = data?.kids ?? [];
  const sitters = (data?.sitters ?? []).map((s) => firstName(s.profile?.full_name)).join(', ');

  return (
    <Screen title="Settings" gap={8}>
      <ErrorText>{error}</ErrorText>
      <Label>Family</Label>
      <Card style={{ paddingVertical: 0 }}>
        <SetRow label="Family name" value={family!.name} />
        <SetRow label="Parents" value={firstName(profile?.full_name)} />
        <SetRow label="Sitters" value={sitters || 'None yet'} onPress={() => router.navigate('/parent/sitters')} last />
      </Card>

      <Label right={<Text style={st.link} onPress={() => router.push('/parent/kid/new')}>Add</Text>}>Kids</Label>
      <Card style={{ paddingVertical: 4 }}>
        {kids.length ? (
          kids.map((k, i) => (
            <View key={k.id} style={[st.kid, i < kids.length - 1 && st.line]}>
              <KidDot kid={k} />
              <View style={{ flex: 1 }}>
                <T variant="strong">{k.name}</T>
                {kidSub(k) ? <T variant="small">{kidSub(k)}</T> : null}
              </View>
            </View>
          ))
        ) : (
          <SetRow label="Add your first child" onPress={() => router.push('/parent/kid/new')} last />
        )}
      </Card>

      {/* P12 › Alerts. Left out until built: arrivals and departures (places), off-plan and help alerts. */}
      <Label>Alerts</Label>
      <Card style={{ paddingVertical: 4 }}>
        <ToggleRow label="Food and tasks" sub="Each entry the sitter logs" value={logAlerts} onChange={toggleLogAlerts} last />
      </Card>
      <ErrorText>{saveErr}</ErrorText>

      <Label>Privacy</Label>
      <Card style={{ paddingVertical: 0 }}>
        <SetRow label="Location sharing" value="Only while clocked in" />
        <SetRow label="Who sees it" value="Parents in this family" last />
      </Card>

      <Label>Account</Label>
      <Card style={{ paddingVertical: 0 }}>
        <SetRow label={profile?.full_name || 'You'} value={session?.user.email ?? ''} last />
      </Card>
      <Button label="Sign out" kind="outline" onPress={signOut} />
    </Screen>
  );
}

const st = StyleSheet.create({
  line: { borderBottomWidth: 1, borderBottomColor: color.divider },
  kid: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 60 },
  link: { fontFamily: font.bodySemi, fontSize: 14, color: color.primary },
});
