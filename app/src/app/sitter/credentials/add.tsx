import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';

import { CHOICE_ICON, CIcon } from '@/components/credentials';
import { DateField } from '@/components/DateField';
import { Text, TextInput } from '@/components/Text';
import { Button, ErrorText, Screen } from '@/components/ui';
import { CERT_CHOICES, choiceOf, credentialApi, sitterFileUrl, uploadCard, type CertChoice } from '@/lib/credentials';
import { requestErrorText, requirementRequestsApi } from '@/lib/requirement-requests-api';
import { useSession } from '@/lib/session';
import { errorText } from '@/lib/supabase';
import { color, font } from '@/theme';

// Wireframe S15 Add a certification, from app/src/wireframes/S15.tsx. Opened from S14 "Add a certification", and with
// ?id= from S41 "Upload renewed card" / S18 "Upload new card" (same form, filled in; saving a new card or new dates
// ?share=<request> from S53b "Add a new card" (migration 31: the tile of that kind is picked; Save shares it with the
// family that asked, then goes back to S53). The card photo comes from the phone's library and goes to a private
// folder: only she can read it, and a family only once she shares it with them (S53b). Dates open the date wheel.
// Not drawn: the "Name" field when "Other" is picked, the empty upload box before a photo is added, and PDF upload
// (no document picker in the app yet: photos only). "Issued by" is typed (the wireframe's chevron implies a list of
// issuers that isn't designed yet). The wireframe's "photo is clear" check isn't built.
export default function AddCert() {
  const { session } = useSession();
  const uid = session!.user.id;
  const { id, share, kind } = useLocalSearchParams<{ id?: string; share?: string; kind?: string }>();
  const [choice, setChoice] = useState<CertChoice | null>(() => (!id && kind ? (CERT_CHOICES.find((c) => c.kind === (kind === 'cpr_child' ? 'first_aid' : kind)) ?? null) : null));
  const [other, setOther] = useState('');
  const [issuer, setIssuer] = useState('');
  const [issued, setIssued] = useState('');
  const [expires, setExpires] = useState('');
  const [savedPath, setSavedPath] = useState<string | null>(null);
  const [savedUrl, setSavedUrl] = useState<string | null>(null);
  const [photo, setPhoto] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (!id) return;
    credentialApi
      .get(id)
      .then(async (c) => {
        const ch = choiceOf(c);
        setChoice(ch);
        if (ch.key === 'other') setOther(c.title);
        setIssuer(c.issuer ?? '');
        setIssued(c.issued_on ?? '');
        setExpires(c.expires_on ?? '');
        setSavedPath(c.file_path);
        setSavedUrl(await sitterFileUrl(c.file_path));
      })
      .catch((e) => setErr(errorText(e)));
  }, [id]);

  async function pick() {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return setErr('Allow photos access in Settings to add the card.');
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.7 });
    if (!res.canceled) setPhoto(res.assets[0]);
  }

  async function submit() {
    if (!choice) return setErr('Pick what it is.');
    const title = choice.key === 'other' ? other.trim() : choice.label;
    if (!title) return setErr('Add the certification’s name.');
    if (issued && expires && expires < issued) return setErr('It has to expire after it was issued.');
    setBusy(true);
    setErr('');
    try {
      const file_path = photo ? await uploadCard(uid, photo.uri) : savedPath;
      const fields = { kind: choice.kind, title, issuer: issuer.trim() || null, issued_on: issued || null, expires_on: expires || null, file_path };
      const saved = id ? await credentialApi.update(id, fields) : await credentialApi.add(uid, fields);
      if (share) {
        await requirementRequestsApi.share(share, saved.id, '');
        return router.dismissTo('/sitter/requests');
      }
      router.dismissTo('/sitter/credentials');
    } catch (e) {
      setErr(share ? requestErrorText(e) : errorText(e));
    } finally {
      setBusy(false);
    }
  }

  const fileName = photo ? (photo.fileName ?? 'card-photo.jpg') : savedPath ? savedPath.split('/').pop()!.replace(/^\d+-/, '') : '';
  const thumb = photo?.uri ?? savedUrl;

  return (
    <Screen back title="Add a certification" gap={12} footer={<Button label={share ? 'Save and share' : 'Save'} busy={busy} onPress={submit} />}>
      <Text style={st.label}>WHAT IS IT?</Text>
      <View style={{ gap: 8 }}>
        {[CERT_CHOICES.slice(0, 3), CERT_CHOICES.slice(3, 6), CERT_CHOICES.slice(6)].map((row, r) => (
          <View key={r} style={{ flexDirection: 'row', gap: 8 }}>
            {row.map((c) => {
              const on = choice?.key === c.key;
              const ic = CHOICE_ICON[c.key];
              return (
                <Pressable key={c.key} accessibilityRole="button" accessibilityState={{ selected: on }} onPress={() => setChoice(c)} style={[st.tile, on && st.tileOn]}>
                  <View style={[st.tileIcon, { backgroundColor: on ? '#FFFFFF' : ic.bg }]}>
                    <CIcon name={ic.icon} tint={ic.tint} />
                  </View>
                  <Text style={st.tileText}>{c.label}</Text>
                </Pressable>
              );
            })}
          </View>
        ))}
      </View>

      {choice?.key === 'other' ? (
        <View style={{ gap: 6 }}>
          <Text style={st.fieldLabel}>Name</Text>
          <TextInput value={other} onChangeText={setOther} maxLength={80} placeholder="What is the certification?" placeholderTextColor={color.quiet} style={st.input} />
        </View>
      ) : null}

      <View style={{ gap: 6 }}>
        <Text style={st.fieldLabel}>Issued by</Text>
        <TextInput value={issuer} onChangeText={setIssuer} maxLength={120} placeholder="American Red Cross" placeholderTextColor={color.quiet} style={st.input} />
      </View>

      <View style={{ flexDirection: 'row', gap: 10 }}>
        <DateField label="Issued" value={issued} onChange={setIssued} />
        <DateField label="Expires" value={expires} onChange={setExpires} />
      </View>

      <Pressable accessibilityRole="button" accessibilityLabel={thumb ? 'Replace the card photo' : 'Add a photo of the card'} onPress={pick} style={st.upload}>
        <View style={st.thumb}>{thumb ? <Image source={{ uri: thumb }} style={{ width: 56, height: 40 }} /> : null}</View>
        <View style={{ flexGrow: 1, flexShrink: 1 }}>
          <Text style={st.fileName} numberOfLines={1}>
            {fileName || 'Add a photo of the card'}
          </Text>
          {photo ? <Text style={st.fileOk}>Ready to upload</Text> : savedPath ? <Text style={st.fileOk}>Uploaded</Text> : null}
        </View>
        <Text style={st.replace}>{thumb ? 'Replace' : 'Add'}</Text>
      </Pressable>

      <Text style={st.note}>Only you see this card. A family sees it only if you share it with them when they ask.</Text>
      <ErrorText>{err}</ErrorText>
    </Screen>
  );
}

// Values from wireframe S15.
const st = StyleSheet.create({
  label: { fontFamily: font.bodyBold, fontSize: 13, color: color.ink2, letterSpacing: 0.6 },
  tile: { flexGrow: 1, flexShrink: 1, flexBasis: 0, minWidth: 0, minHeight: 80, gap: 6, padding: 10, backgroundColor: '#FFFFFF', borderRadius: 14, borderWidth: 1, borderColor: color.line },
  tileOn: { backgroundColor: color.primaryTint, borderWidth: 2, borderColor: color.primary, padding: 9 },
  tileIcon: { width: 32, height: 32, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  tileText: { fontFamily: font.bodySemi, fontSize: 13, lineHeight: 16, color: color.ink },
  fieldLabel: { fontFamily: font.bodySemi, fontSize: 14, color: color.ink },
  input: { height: 48, paddingHorizontal: 14, backgroundColor: '#FFFFFF', borderRadius: 8, borderWidth: 1, borderColor: color.lineStrong, fontFamily: font.body, fontSize: 16, color: color.ink },
  upload: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, backgroundColor: '#FFFFFF', borderRadius: 14, borderWidth: 2, borderColor: '#C9D3DD', borderStyle: 'dashed' },
  thumb: { width: 56, height: 40, borderRadius: 6, borderWidth: 1, borderColor: color.line, overflow: 'hidden', flexShrink: 0 },
  fileName: { fontFamily: font.bodySemi, fontSize: 14, color: color.ink },
  fileOk: { fontFamily: font.body, fontSize: 13, color: color.okInk },
  replace: { fontFamily: font.bodySemi, fontSize: 14, color: color.primary, textDecorationLine: 'underline' },
  note: { fontFamily: font.body, fontSize: 13, lineHeight: 18, color: color.ink2 },
});
