import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, Linking, Platform, Pressable, StyleSheet, View } from 'react-native';

import { CIcon, CredPill, CredTile, credTileKey } from '@/components/credentials';
import { Text } from '@/components/Text';
import { Button, ErrorText, Loading, Screen } from '@/components/ui';
import { credentialApi, credentialState, daysUntil, longDate, monthDay, monthYear, needsMigration19, MIGRATION_19_TEXT, sitterFileUrl, toDay } from '@/lib/credentials';
import { useQuery } from '@/lib/data';
import { errorText } from '@/lib/supabase';
import { cardShadow, color, font } from '@/theme';

// Wireframe S41 Certification detail, from app/src/wireframes/S41.tsx. Opened from a certificate row on S13 / S14.
// "Upload renewed card" opens S15 filled in; "View" opens the card photo (only she can read it); "Remove" asks first.
// Left out until built: the card number row (not stored), "WHO NEEDS IT" (family requirements, built separately),
// "Find a class". Not drawn: the banner once it has expired, a certificate without a card photo, the remove confirm.
export default function CertDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: c, error } = useQuery(() => credentialApi.get(id), [id]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  if (!c) return error ? <Screen back title="Certification"><ErrorText>{needsMigration19(error) ? MIGRATION_19_TEXT : error}</ErrorText></Screen> : <Loading />;

  const state = credentialState(c);
  const left = c.expires_on ? daysUntil(c.expires_on) : 0;

  async function view() {
    const url = await sitterFileUrl(c!.file_path);
    if (url) Linking.openURL(url);
    else setErr('Could not open the card photo.');
  }

  async function remove() {
    setBusy(true);
    try {
      await credentialApi.remove(c!);
      router.back();
    } catch (e) {
      setErr(errorText(e));
      setBusy(false);
    }
  }

  function confirmRemove() {
    const q = `Remove ${c!.title}?`;
    if (Platform.OS === 'web') {
      if (globalThis.confirm?.(q)) remove();
      return;
    }
    Alert.alert(q, 'The badge comes off your profile.', [
      { text: 'Keep it', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: remove },
    ]);
  }

  return (
    <Screen
      back
      title={c.title}
      subtitle="Certification"
      gap={10}
      footer={
        <>
          <Button label="Upload renewed card" icon="upload" onPress={() => router.push({ pathname: '/sitter/credentials/add', params: { id: c.id } })} />
          <Pressable accessibilityRole="button" onPress={confirmRemove} disabled={busy} style={st.remove}>
            <Text style={st.removeText}>Remove</Text>
          </Pressable>
        </>
      }>
      {c.expires_on && (state === 'expiring' || state === 'expired') ? (
        <View style={[st.banner, state === 'expired' && { backgroundColor: color.badTint }]}>
          <CIcon name="bell" size={20} tint={state === 'expired' ? color.badInk : color.warnInk} />
          <Text style={st.bannerText}>
            {state === 'expired' ? (
              <>
                <Text style={[st.bannerBold, { color: color.badInk }]}>Expired {monthDay(c.expires_on)}.</Text> Upload your renewed card to get the Verified badge back.
              </>
            ) : (
              <>
                <Text style={st.bannerBold}>
                  Expires {monthDay(c.expires_on)}, in {left} {left === 1 ? 'day' : 'days'}.
                </Text>{' '}
                Upload your renewed card before then to keep the Verified badge.
              </>
            )}
          </Text>
        </View>
      ) : null}

      <View style={st.photo}>
        <CredTile which={credTileKey(c)} box={44} radius={22} />
        <View style={{ flexGrow: 1, flexShrink: 1 }}>
          <Text style={st.photoTitle}>{c.title}</Text>
          <Text style={st.photoSub}>{c.file_path ? `Card photo · uploaded ${monthYear(toDay(new Date(c.updated_at ?? c.created_at)))}` : 'No card photo yet'}</Text>
        </View>
        {c.file_path ? (
          <Pressable accessibilityRole="link" onPress={view} hitSlop={8}>
            <Text style={st.view}>View</Text>
          </Pressable>
        ) : null}
      </View>

      <View style={st.card}>
        {[
          ['Issued by', c.issuer ?? ''],
          ['Valid', c.issued_on && c.expires_on ? `${longDate(c.issued_on)} – ${longDate(c.expires_on)}` : c.expires_on ? `Until ${longDate(c.expires_on)}` : c.issued_on ? `Since ${longDate(c.issued_on)}` : ''],
        ]
          .filter(([, v]) => v)
          .map(([k, v]) => (
            <View key={k} style={[st.row, st.line]}>
              <Text style={st.key}>{k}</Text>
              <Text style={st.value}>{v}</Text>
            </View>
          ))}
        <View style={st.row}>
          <Text style={st.key}>Status</Text>
          <CredPill c={c} />
        </View>
      </View>

      <View style={{ paddingHorizontal: 4 }}>
        <Text style={st.foot}>If it expires, the badge comes off your profile and families who require it are told you need to renew.</Text>
      </View>
      <ErrorText>{err}</ErrorText>
    </Screen>
  );
}

// Values from wireframe S41.
const st = StyleSheet.create({
  banner: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, paddingVertical: 12, paddingHorizontal: 14, backgroundColor: color.warnTint, borderRadius: 16 },
  bannerText: { flexShrink: 1, fontFamily: font.body, fontSize: 13, lineHeight: 18, color: color.ink },
  bannerBold: { fontFamily: font.bodyBold, fontSize: 13, lineHeight: 18, color: color.warnInk },
  photo: { flexDirection: 'row', alignItems: 'center', gap: 14, height: 96, paddingHorizontal: 16, borderRadius: 14, borderWidth: 1, borderColor: color.line },
  photoTitle: { fontFamily: font.bodyBold, fontSize: 14, color: color.ink },
  photoSub: { fontFamily: font.body, fontSize: 12, color: color.ink2 },
  view: { fontFamily: font.bodyBold, fontSize: 13, color: color.primary, textDecorationLine: 'underline' },
  card: { paddingHorizontal: 14, backgroundColor: '#FFFFFF', borderRadius: 24, ...cardShadow },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, minHeight: 44 },
  line: { borderBottomWidth: 1, borderBottomColor: color.divider },
  key: { fontFamily: font.body, fontSize: 14, color: color.ink2, flexShrink: 0 },
  value: { fontFamily: font.bodySemi, fontSize: 14, color: color.ink, flexShrink: 1, textAlign: 'right' },
  foot: { fontFamily: font.body, fontSize: 12, lineHeight: 17, color: color.ink2 },
  remove: { height: 46, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  removeText: { fontFamily: font.displayBold, fontSize: 17, color: color.badInk },
});
