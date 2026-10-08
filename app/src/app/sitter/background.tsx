import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { CIcon, CredTile } from '@/components/credentials';
import { DateField } from '@/components/DateField';
import { DotPill } from '@/components/requirements';
import { reqReqStyles } from '@/components/requirementRequests';
import { Text, TextInput } from '@/components/Text';
import { Button, ErrorText, Loading, Screen } from '@/components/ui';
import { backgroundCheck, credentialApi, sitterBundle, uploadReport } from '@/lib/credentials';
import { useQuery } from '@/lib/data';
import { isPdf, requestErrorText, requirementRequestsApi } from '@/lib/requirement-requests-api';
import { useSession } from '@/lib/session';
import { errorText } from '@/lib/supabase';
import { cardShadow, color, font } from '@/theme';

type Picked = { uri: string; name: string; pdf: boolean };

// Wireframe S17d Background check (phase 1), from app/src/wireframes/S17d.tsx. Opened from Me (S39), S13, S14 and S53b
// (?share=<request>: Save shares it with the family that asked, then back to S53). BabyBadger runs no check in phase 1:
// she uploads a report she already has (PDF or photo, who ran it, the report's date), stored as her background_check
// credential in her private folder; a family reads it only once she shares it (migration 31). "Run one in the app" is
// Coming soon. The provider flow (S17 / S17b / S17c) stays on the canvas for later.
// Not drawn: no report yet (the empty upload box), the banner without a request.
export default function Background() {
  const { session } = useSession();
  const uid = session!.user.id;
  const { share } = useLocalSearchParams<{ share?: string }>();
  const { data } = useQuery(async () => {
    const [bundle, groups] = await Promise.all([sitterBundle(uid), requirementRequestsApi.mine()]);
    const ask = groups.flatMap((g) => g.requests.map((q) => ({ q, family: g.family_name }))).find((x) => x.q.req_key === 'background_check' && (x.q.id === share || x.q.status === 'asked'));
    return { bundle, ask };
  }, [uid, share]);
  const [file, setFile] = useState<Picked | null>(null);
  const [issuer, setIssuer] = useState('');
  const [issued, setIssued] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const mine = data ? backgroundCheck(data.bundle.creds) : null;
  useEffect(() => {
    if (!mine) return;
    // fill the form with the report she saved before
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIssuer((v) => v || mine.issuer || '');
    setIssued((v) => v || mine.issued_on || '');
  }, [mine]);
  if (!data) return <Loading />;

  const fam = data.ask?.family.replace(/^The /, 'the ');
  const sharing = !!share && !!data.ask;

  async function pickPdf() {
    const res = await DocumentPicker.getDocumentAsync({ type: 'application/pdf', copyToCacheDirectory: true });
    if (!res.canceled) setFile({ uri: res.assets[0].uri, name: res.assets[0].name, pdf: true });
  }
  async function pickPhoto() {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return setErr('Allow photos access in Settings to add the report.');
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.7 });
    if (!res.canceled) setFile({ uri: res.assets[0].uri, name: res.assets[0].fileName ?? 'report-photo.jpg', pdf: false });
  }

  async function save() {
    if (!file && !mine?.file_path) return setErr('Add the report: a PDF or a photo.');
    setBusy(true);
    setErr('');
    try {
      const file_path = file ? await uploadReport(uid, file.uri, file.pdf) : mine!.file_path;
      const fields = { kind: 'background_check' as const, title: 'Background check', issuer: issuer.trim() || null, issued_on: issued || null, expires_on: null, file_path };
      const saved = mine && !mine.verified_at ? await credentialApi.update(mine.id, fields) : await credentialApi.add(uid, fields);
      if (sharing) {
        await requirementRequestsApi.share(data!.ask!.q.id, saved.id, '');
        return router.dismissTo('/sitter/requests');
      }
      router.back();
    } catch (e) {
      setErr(sharing ? requestErrorText(e) : errorText(e));
    } finally {
      setBusy(false);
    }
  }

  const name = file?.name ?? (mine?.file_path ? (isPdf(mine.file_path) ? 'background-report.pdf' : 'report-photo.jpg') : '');

  return (
    <Screen back title="Background check" gap={12} footer={<Button label={sharing ? `Save and share with ${fam}` : 'Save'} busy={busy} onPress={save} />}>
      {data.ask ? (
        <Pressable accessibilityRole="button" onPress={() => router.push('/sitter/requests')} style={st.banner}>
          <CIcon name="shield" tint={color.warnInk} />
          <Text style={st.bannerText}>
            <Text style={st.bannerBold}>{data.ask.family} asked for one.</Text> Any check from the last 12 months.
          </Text>
        </Pressable>
      ) : null}

      <Text style={reqReqStyles.label}>UPLOAD A REPORT I HAVE</Text>
      <View style={st.card}>
        <View style={st.upload}>
          <View style={st.thumb}>
            <CIcon name="list" tint={color.ink2} />
          </View>
          <View style={{ flexGrow: 1, flexShrink: 1 }}>
            <Text style={st.fileName} numberOfLines={1}>
              {name || 'Add a PDF or a photo'}
            </Text>
            {file ? <Text style={st.fileOk}>Ready to upload</Text> : mine?.file_path ? <Text style={st.fileOk}>Uploaded</Text> : null}
          </View>
        </View>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Pressable accessibilityRole="button" onPress={pickPdf} style={st.pick}>
            <CIcon name="list" size={18} tint={color.primary} />
            <Text style={st.pickText}>PDF</Text>
          </Pressable>
          <Pressable accessibilityRole="button" onPress={pickPhoto} style={st.pick}>
            <CIcon name="upload" size={18} tint={color.primary} />
            <Text style={st.pickText}>Photo</Text>
          </Pressable>
        </View>
        <View style={{ gap: 6 }}>
          <Text style={st.fieldLabel}>Who ran it</Text>
          <TextInput value={issuer} onChangeText={setIssuer} maxLength={120} placeholder="Checkr" placeholderTextColor={color.quiet} style={st.input} />
        </View>
        <View style={{ flexDirection: 'row' }}>
          <DateField label="Date of the report" value={issued} onChange={setIssued} />
        </View>
      </View>

      <Text style={[reqReqStyles.label, { marginTop: 2 }]}>RUN ONE IN THE APP</Text>
      <View style={[st.card, st.soon]} accessibilityState={{ disabled: true }}>
        <CredTile which="background" />
        <View style={{ flexGrow: 1, flexShrink: 1, minWidth: 0 }}>
          <Text style={st.soonTitle}>Run a check with BabyBadger</Text>
          <Text style={st.soonSub}>Through a partner, with your OK</Text>
        </View>
        <View>
          <DotPill label="Coming soon" kind="muted" />
        </View>
      </View>
      <Text style={reqReqStyles.small}>Only you see your report. A family sees it only when you share it with them.</Text>
      <ErrorText>{err}</ErrorText>
    </Screen>
  );
}

// Values from wireframe S17d.
const st = StyleSheet.create({
  banner: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, paddingHorizontal: 14, backgroundColor: color.warnTint, borderRadius: 14 },
  bannerText: { flexGrow: 1, flexShrink: 1, fontFamily: font.body, fontSize: 14, lineHeight: 20, color: color.ink },
  bannerBold: { fontFamily: font.bodyBold, color: color.warnInk },
  card: { gap: 12, padding: 16, backgroundColor: '#FFFFFF', borderRadius: 24, ...cardShadow },
  upload: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 14, borderWidth: 2, borderColor: '#C9D3DD', borderStyle: 'dashed' },
  thumb: { width: 56, height: 40, borderRadius: 6, borderWidth: 1, borderColor: color.line, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  fileName: { fontFamily: font.bodySemi, fontSize: 14, color: color.ink },
  fileOk: { fontFamily: font.body, fontSize: 13, color: color.okInk },
  pick: { flexGrow: 1, flexBasis: 0, height: 44, borderRadius: 999, backgroundColor: color.primaryTint, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  pickText: { fontFamily: font.displayBold, fontSize: 16, color: color.primary },
  fieldLabel: { fontFamily: font.bodySemi, fontSize: 14, color: color.ink },
  input: { height: 48, paddingHorizontal: 14, backgroundColor: '#FFFFFF', borderRadius: 8, borderWidth: 1, borderColor: color.lineStrong, fontFamily: font.body, fontSize: 16, color: color.ink },
  soon: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, opacity: 0.55 },
  soonTitle: { fontFamily: font.bodySemi, fontSize: 15, color: color.ink },
  soonSub: { fontFamily: font.body, fontSize: 13, color: color.ink2 },
});
