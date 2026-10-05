import { router } from 'expo-router';
import { useState } from 'react';
import { Share, Text, View } from 'react-native';

import { Banner, Button, ErrorText, Field, Screen, T } from '@/components/ui';
import { inviteMessage } from '@/lib/format';
import { useSession } from '@/lib/session';
import { errorText, supabase } from '@/lib/supabase';
import { color, font } from '@/theme';

export default function Invite() {
  const { family } = useSession();
  const [name, setName] = useState('');
  const [code, setCode] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  async function create() {
    setBusy(true);
    setErr('');
    const { data, error } = await supabase.rpc('create_invite', { p_family: family!.id, p_sitter_name: name.trim() });
    setBusy(false);
    if (error) return setErr(errorText(error));
    setCode(data as string);
  }

  if (code)
    return (
      <Screen
        title="Invite ready"
        back
        footer={
          <>
            <Button label="Send by text or email" icon="share" onPress={() => Share.share({ message: inviteMessage(family!.name, code) })} />
            <Button label="Done" kind="ghost" onPress={() => router.back()} />
          </>
        }>
        <T>Give {name.trim() || 'your sitter'} this code:</T>
        <View style={{ backgroundColor: '#FFFFFF', borderRadius: 24, paddingVertical: 28, alignItems: 'center' }}>
          <Text style={{ fontFamily: font.display, fontSize: 48, letterSpacing: 10, color: color.primaryStrong }}>{code}</Text>
        </View>
        <T variant="muted">Single use, expires in 7 days. When she joins she reviews your family, then signs the location notice. You’ll see her as Active once she has.</T>
      </Screen>
    );

  return (
    <Screen title="Invite a sitter" back footer={<Button label="Create invite" onPress={create} busy={busy} disabled={name.trim().length < 2} />}>
      <Field label="Sitter’s name" value={name} onChangeText={setName} placeholder="Maya" autoComplete="name" />
      <Banner icon="shield">She sees your family and kids only after accepting. Her location is shared only while she’s clocked in.</Banner>
      <ErrorText>{err}</ErrorText>
    </Screen>
  );
}
