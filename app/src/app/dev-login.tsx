import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { Text } from '@/components/Text';
import { Button, ErrorText, Screen } from '@/components/ui';
import { supabase } from '@/lib/supabase';

// Development only (guarded by __DEV__ in _layout): signs in the test parent or sitter from .env.local so screens
// can be checked against their wireframes without an email code. Never part of a store build.
const ACCOUNTS = {
  parent: { email: process.env.EXPO_PUBLIC_DEV_PARENT_EMAIL, password: process.env.EXPO_PUBLIC_DEV_PARENT_PASSWORD },
  sitter: { email: process.env.EXPO_PUBLIC_DEV_SITTER_EMAIL, password: process.env.EXPO_PUBLIC_DEV_SITTER_PASSWORD },
};

export default function DevLogin() {
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState<string>();

  async function go(who: keyof typeof ACCOUNTS) {
    const a = ACCOUNTS[who];
    if (!a.email || !a.password) return setErr('Add the test accounts to .env.local first.');
    setBusy(who);
    setErr('');
    await supabase.auth.signOut();
    const { error } = await supabase.auth.signInWithPassword({ email: a.email, password: a.password });
    setBusy(undefined);
    if (error) return setErr(error.message);
    router.replace('/');
  }

  return (
    <Screen title="Test sign-in" back>
      <View style={{ gap: 12 }}>
        <Text>Development only.</Text>
        <Button label="Sign in as test parent" onPress={() => go('parent')} busy={busy === 'parent'} />
        <Button label="Sign in as test sitter" kind="tonal" onPress={() => go('sitter')} busy={busy === 'sitter'} />
        <ErrorText>{err}</ErrorText>
      </View>
    </Screen>
  );
}
