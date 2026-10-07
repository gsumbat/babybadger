import { useEffect, useState } from 'react';

import { JoinCode } from '@/components/JoinCode';
import { Button, ErrorText, Field, Screen } from '@/components/ui';
import { markFamilySetup, peekSignupRole, rememberSignupRole } from '@/lib/home-route';
import { useSession } from '@/lib/session';
import { errorText, supabase } from '@/lib/supabase';

import { WelcomeView } from './welcome';

type Mode = 'choose' | 'parent' | 'sitter';

export default function Onboarding() {
  const { refresh, signOut, profile } = useSession();
  // A role tapped on P1 before signing in skips the chooser and goes straight to the form.
  const [mode, setMode] = useState<Mode>(() => peekSignupRole() ?? 'choose');
  const [name, setName] = useState(profile?.full_name ?? '');
  const [familyName, setFamilyName] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => rememberSignupRole(null), []);

  async function createFamily() {
    setBusy(true);
    setErr('');
    const { data, error } = await supabase.rpc('create_family', { p_family_name: familyName.trim(), p_your_name: name.trim() });
    setBusy(false);
    if (error) return setErr(errorText(error));
    // The new family goes through P2 (kids and home) first; the app's index route sends it there.
    markFamilySetup(data as string);
    await refresh();
  }

  if (mode === 'choose')
    // Wireframe P1, signed in without a role yet: the link signs out instead of signing in.
    return <WelcomeView onRole={setMode} link="Sign out" onLink={signOut} />;

  if (mode === 'parent')
    return (
      <Screen title="Set up your family" subtitle="You can add kids and invite your sitter next" back onBack={() => setMode('choose')} footer={<Button label="Continue" onPress={createFamily} busy={busy} disabled={name.trim().length < 2 || familyName.trim().length < 2} />}>
        <Field label="Your name" value={name} onChangeText={setName} placeholder="Jen Lee" autoComplete="name" />
        <Field label="Family name" value={familyName} onChangeText={setFamilyName} placeholder="The Lee family" hint="Sitters see this name." />
        <ErrorText>{err}</ErrorText>
      </Screen>
    );

  // Wireframe S51, same screen as Families › Join with a code.
  return <JoinCode onBack={() => setMode('choose')} />;
}
