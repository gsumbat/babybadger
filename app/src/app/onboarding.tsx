import { useState } from 'react';
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Hero } from '@/components/Hero';

import { Button, ErrorText, Field, Screen, T } from '@/components/ui';
import { useSession } from '@/lib/session';
import { errorText, supabase } from '@/lib/supabase';
import { color, font } from '@/theme';

type Mode = 'choose' | 'parent' | 'sitter';

export default function Onboarding() {
  const { refresh, signOut, profile } = useSession();
  const [mode, setMode] = useState<Mode>('choose');
  const [name, setName] = useState(profile?.full_name ?? '');
  const [familyName, setFamilyName] = useState('');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const insets = useSafeAreaInsets();

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
    // Wireframe P1.
    return (
      <View style={{ flex: 1, backgroundColor: color.canvas }}>
        <Hero height={440} />
        <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 28, gap: 10 }}>{/* wireframe P1 */}
          <Text style={{ fontFamily: font.display, fontSize: 28, lineHeight: 34, color: color.ink }}>Know how the day is going, even when you’re away</Text>
          <Text style={{ fontFamily: font.body, fontSize: 16, lineHeight: 23, color: color.ink2 }}>Your sitter clocks in and you see the shift: where they are, tasks done, meals eaten.</Text>
        </View>
        <View style={{ paddingHorizontal: 24, paddingBottom: Math.max(insets.bottom, 16) + 8, gap: 10 }}>
          <Button label="I’m a parent" onPress={() => setMode('parent')} />
          <Button label="I’m a sitter" kind="secondary" onPress={() => setMode('sitter')} />
          <Text style={{ fontFamily: font.body, fontSize: 14, color: color.primary, textDecorationLine: 'underline', alignSelf: 'flex-end', paddingTop: 6 }} onPress={signOut}>
            Sign out
          </Text>
        </View>
      </View>
    );

  if (mode === 'parent')
    return (
      <Screen title="Set up your family" subtitle="You can add kids and invite your sitter next" back onBack={() => setMode('choose')} footer={<Button label="Continue" onPress={createFamily} busy={busy} disabled={name.trim().length < 2 || familyName.trim().length < 2} />}>
        <Field label="Your name" value={name} onChangeText={setName} placeholder="Jen Lee" autoComplete="name" />
        <Field label="Family name" value={familyName} onChangeText={setFamilyName} placeholder="The Lee family" hint="Sitters see this name." />
        <ErrorText>{err}</ErrorText>
      </Screen>
    );

  return (
    <Screen title="Join a family" subtitle="Use the code the parent sent you" back onBack={() => setMode('choose')} footer={<Button label="See my invite" onPress={join} busy={busy} disabled={name.trim().length < 2 || code.trim().length !== 6} />}>
      <Field label="Your full name" value={name} onChangeText={setName} placeholder="Maya Rodriguez" autoComplete="name" />
      <Field label="Invite code" value={code} onChangeText={setCode} placeholder="6 digits" keyboardType="number-pad" maxLength={6} hint="Ask the parent for the code from their invite." />
      <T variant="muted">Next you’ll read and sign the family’s location notice. Your location is shared only while you’re clocked in.</T>
      <ErrorText>{err}</ErrorText>
    </Screen>
  );
}
