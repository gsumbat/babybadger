import { router } from 'expo-router';
import { useState } from 'react';

import { Button, ErrorText, Field, Screen } from '@/components/ui';
import { useSession } from '@/lib/session';
import { errorText, supabase } from '@/lib/supabase';

export default function Join() {
  const { profile, refresh } = useSession();
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  async function join() {
    setBusy(true);
    setErr('');
    const { data, error } = await supabase.rpc('accept_invite', { p_code: code.trim(), p_your_name: profile?.full_name ?? '' });
    setBusy(false);
    if (error) return setErr(errorText(error));
    await refresh();
    router.replace(`/sitter/consent/${data as string}`);
  }

  return (
    <Screen title="Join another family" back footer={<Button label="Join" onPress={join} busy={busy} disabled={code.trim().length !== 6} />}>
      <Field label="Invite code" value={code} onChangeText={setCode} keyboardType="number-pad" maxLength={6} placeholder="6 digits" />
      <ErrorText>{err}</ErrorText>
    </Screen>
  );
}
