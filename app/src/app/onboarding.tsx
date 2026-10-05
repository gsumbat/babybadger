import { useState } from 'react';
import { View } from 'react-native';

import { Button, Card, ErrorText, Field, Icon, Screen, T } from '@/components/ui';
import { useSession } from '@/lib/session';
import { errorText, supabase } from '@/lib/supabase';
import { color } from '@/theme';

type Mode = 'choose' | 'parent' | 'sitter';

export default function Onboarding() {
  const { refresh, signOut, profile } = useSession();
  const [mode, setMode] = useState<Mode>('choose');
  const [name, setName] = useState(profile?.full_name ?? '');
  const [familyName, setFamilyName] = useState('');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  async function createFamily() {
    setBusy(true);
    setErr('');
    const { error } = await supabase.rpc('create_family', { p_family_name: familyName.trim(), p_your_name: name.trim() });
    setBusy(false);
    if (error) return setErr(errorText(error));
    await refresh();
  }

  async function join() {
    setBusy(true);
    setErr('');
    const { error } = await supabase.rpc('accept_invite', { p_code: code.trim(), p_your_name: name.trim() });
    setBusy(false);
    if (error) return setErr(errorText(error));
    await refresh();
  }

  if (mode === 'choose')
    return (
      <Screen title="Welcome" subtitle="How will you use BabyBadger?" footer={<Button label="Sign out" kind="ghost" onPress={signOut} />}>
        <Card onPress={() => setMode('parent')} style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <Icon name="home" size={28} />
          <View style={{ flex: 1 }}>
            <T variant="title">I’m a parent</T>
            <T variant="muted">Set up your family, invite your sitter, book shifts.</T>
          </View>
        </Card>
        <Card onPress={() => setMode('sitter')} style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <Icon name="heart" size={28} tint={color.badInk} />
          <View style={{ flex: 1 }}>
            <T variant="title">I’m a sitter</T>
            <T variant="muted">Join a family with the 6-digit code they sent you.</T>
          </View>
        </Card>
      </Screen>
    );

  if (mode === 'parent')
    return (
      <Screen title="Your family" back={false} footer={<><Button label="Create family" onPress={createFamily} busy={busy} disabled={name.trim().length < 2 || familyName.trim().length < 2} /><Button label="Back" kind="ghost" onPress={() => setMode('choose')} /></>}>
        <Field label="Your name" value={name} onChangeText={setName} placeholder="Jen Lee" autoComplete="name" />
        <Field label="Family name" value={familyName} onChangeText={setFamilyName} placeholder="The Lee family" hint="Sitters see this name." />
        <ErrorText>{err}</ErrorText>
      </Screen>
    );

  return (
    <Screen title="Join a family" footer={<><Button label="Join" onPress={join} busy={busy} disabled={name.trim().length < 2 || code.trim().length !== 6} /><Button label="Back" kind="ghost" onPress={() => setMode('choose')} /></>}>
      <Field label="Your full name" value={name} onChangeText={setName} placeholder="Maya Rodriguez" autoComplete="name" />
      <Field label="Invite code" value={code} onChangeText={setCode} placeholder="6 digits" keyboardType="number-pad" maxLength={6} hint="Ask the parent for the code from their invite." />
      <T variant="muted">Next you’ll read and sign the family’s location notice. Your location is shared only while you’re clocked in.</T>
      <ErrorText>{err}</ErrorText>
    </Screen>
  );
}
