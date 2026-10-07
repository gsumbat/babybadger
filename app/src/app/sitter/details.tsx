import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View, type TextInputProps } from 'react-native';

import { CIcon, SitterAvatar } from '@/components/credentials';
import { Text, TextInput } from '@/components/Text';
import { Button, ErrorText, Loading, Screen } from '@/components/ui';
import { BIO_MAX, shortName, sitterBundle, sitterProfileApi, uploadPhoto } from '@/lib/credentials';
import { useQuery } from '@/lib/data';
import { useSession } from '@/lib/session';
import { errorText } from '@/lib/supabase';
import { cardShadow, color, font } from '@/theme';

// Wireframe S40 Personal details, from app/src/wireframes/S40.tsx. Opened from Me (S39) and S13 "Edit details and photo".
// "Change photo" picks a photo from the library and saves it right away (families she's linked to can see it).
// Left out until built: the mobile number's "Verified" pill (no SMS check yet) and changing the email (it's the
// sign-in address, shown read-only).
export default function Details() {
  const { session, profile, refresh } = useSession();
  const uid = session!.user.id;
  const { data, reload } = useQuery(() => sitterBundle(uid), [uid]);
  const [edit, setEdit] = useState<{ name?: string; phone?: string; area?: string; bio?: string }>({});
  const [busy, setBusy] = useState(false);
  const [photoBusy, setPhotoBusy] = useState(false);
  const [err, setErr] = useState('');
  if (!data) return <Loading />;

  const p = data.profile;
  const name = edit.name ?? profile?.full_name ?? '';
  const phone = edit.phone ?? p?.phone ?? '';
  const area = edit.area ?? p?.home_area ?? '';
  const bio = edit.bio ?? p?.bio ?? '';

  async function changePhoto() {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return setErr('Allow photos access in Settings to add a photo.');
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.6, allowsEditing: true, aspect: [1, 1] });
    if (res.canceled) return;
    setPhotoBusy(true);
    setErr('');
    try {
      const path = await uploadPhoto(uid, res.assets[0].uri);
      await sitterProfileApi.save(uid, { photo_path: path });
      await reload();
    } catch (e) {
      setErr(errorText(e));
    } finally {
      setPhotoBusy(false);
    }
  }

  async function save() {
    if (!name.trim()) return setErr('Add your name.');
    setBusy(true);
    setErr('');
    try {
      if (name.trim() !== (profile?.full_name ?? '')) await sitterProfileApi.setName(uid, name.trim());
      await sitterProfileApi.save(uid, { phone: phone.trim() || null, home_area: area.trim() || null, bio: bio.trim() || null });
      await refresh();
      router.back();
    } catch (e) {
      setErr(errorText(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen back title="Personal details" gap={10} footer={<Button label="Save changes" busy={busy} onPress={save} />}>
      <ErrorText>{data.error || err}</ErrorText>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
        <Pressable accessibilityRole="button" accessibilityLabel="Change photo" onPress={changePhoto} disabled={photoBusy}>
          <SitterAvatar name={name || 'You'} photoPath={p?.photo_path} size={64} fontSize={28} />
          <View style={st.camera}>
            <CIcon name="camera" size={15} tint={color.primary} width={2} />
          </View>
        </Pressable>
        <View style={{ flexShrink: 1 }}>
          <Pressable accessibilityRole="button" onPress={changePhoto} disabled={photoBusy} hitSlop={6}>
            <Text style={st.photoLink}>{photoBusy ? 'Uploading…' : 'Change photo'}</Text>
          </Pressable>
          <Text style={st.hint}>A clear face photo. Families see it.</Text>
        </View>
      </View>

      <Box label="Name" value={name} onChangeText={(t) => setEdit((e) => ({ ...e, name: t }))} autoComplete="name" textContentType="name" hint={name.trim() ? `Families see “${shortName(name)}” until they book you` : undefined} />
      <Box label="Mobile" value={phone} onChangeText={(t) => setEdit((e) => ({ ...e, phone: t }))} keyboardType="phone-pad" autoComplete="tel" textContentType="telephoneNumber" maxLength={30} />
      <View style={{ gap: 5 }}>
        <Text style={st.label}>Email</Text>
        <View style={st.box}>
          <Text style={st.value}>{session?.user.email ?? ''}</Text>
        </View>
      </View>
      <Box label="Home area" value={area} onChangeText={(t) => setEdit((e) => ({ ...e, area: t }))} maxLength={80} placeholder="Neighborhood, city" hint="Only your area is shown, never your address" />
      <Box label="About me" value={bio} onChangeText={(t) => setEdit((e) => ({ ...e, bio: t }))} multiline maxLength={BIO_MAX} hint={`${bio.length} / ${BIO_MAX}`} />
    </Screen>
  );
}

/** S40 field: bold label, 48-high box with 14 radius, small hint under it. */
function Box({ label, hint, multiline, ...props }: TextInputProps & { label: string; hint?: string }) {
  return (
    <View style={{ gap: 5 }}>
      <Text style={st.label}>{label}</Text>
      <TextInput placeholderTextColor={color.quiet} multiline={multiline} {...props} style={[st.box, st.value, multiline && { minHeight: 92, textAlignVertical: 'top' }]} />
      {hint ? <Text style={st.hint}>{hint}</Text> : null}
    </View>
  );
}

// Values from wireframe S40.
const st = StyleSheet.create({
  camera: { position: 'absolute', right: -2, bottom: -2, width: 26, height: 26, borderRadius: 13, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', ...cardShadow },
  photoLink: { fontFamily: font.bodyBold, fontSize: 14, color: color.primary, textDecorationLine: 'underline' },
  hint: { fontFamily: font.body, fontSize: 12, color: color.ink2 },
  label: { fontFamily: font.bodyBold, fontSize: 13, color: color.ink2 },
  box: { minHeight: 48, paddingVertical: 10, paddingHorizontal: 14, backgroundColor: '#FFFFFF', borderRadius: 14, borderWidth: 1, borderColor: color.lineStrong, justifyContent: 'center' },
  value: { fontFamily: font.body, fontSize: 15, lineHeight: 21, color: color.ink },
});
