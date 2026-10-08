import * as WebBrowser from 'expo-web-browser';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { DotPill, reqSvg } from '@/components/requirements';
import { BigButton, NoteSheet, Quote, reqReqStyles } from '@/components/requirementRequests';
import { Text } from '@/components/Text';
import { ErrorText, Loading, Screen } from '@/components/ui';
import { CIcon } from '@/components/credentials';
import { sitterFileUrl } from '@/lib/credentials';
import { useQuery } from '@/lib/data';
import { firstName } from '@/lib/format';
import {
  decidesLine,
  isPdf,
  parentState,
  requestErrorText,
  requirementRequestsApi,
  shortDay,
  STATE_LABEL,
  STATE_PILL,
  usDate,
} from '@/lib/requirement-requests-api';
import { supabase } from '@/lib/supabase';
import { useCanManage, useParentNames } from '@/lib/use-family-role';
import { cardShadow, color, font } from '@/theme';

// Wireframes P79b What Maya shared (parent) and P79c (read-only access), from app/src/wireframes/P79b.tsx /
// P79c.tsx. Opened from P11 / P79d (a shared or looked-at row) and the "Maya shared CPR and First Aid" push
// (/parent/shared/<request id>). The card photo or PDF comes from storage through a signed link; the database lets the
// family read it only while she shares it with them (migration 31). Looks good -> met; Ask again opens P79e.
// Not drawn: the screen after Looks good (it shows "Jen said it looks good" without buttons), a missing file.
export default function SharedDoc() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const parent = useCanManage();
  const parents = useParentNames();
  const { data, error, reload } = useQuery(async () => {
    const q = await requirementRequestsApi.get(id);
    if (!q) throw new Error('This request isn’t there anymore.');
    const [rows, who] = await Promise.all([
      requirementRequestsApi.forSitter(q.family_id, q.sitter_id),
      supabase.from('profiles').select('full_name').eq('id', q.sitter_id).maybeSingle(),
    ]);
    const row = rows.find((r) => r.request?.id === id);
    if (!row) throw new Error('This request isn’t there anymore.');
    return { row, name: firstName((who.data as { full_name?: string } | null)?.full_name) || 'Your sitter' };
  }, [id]);
  const [url, setUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [again, setAgain] = useState(false);
  const [err, setErr] = useState('');
  const path = data?.row.request?.credential?.file_path ?? null;
  useEffect(() => {
    let live = true;
    sitterFileUrl(path).then((u) => live && setUrl(u));
    return () => {
      live = false;
    };
  }, [path]);

  if (!data) return error ? <Screen back title="Shared"><ErrorText>{error}</ErrorText></Screen> : <Loading />;
  const { row, name } = data;
  const q = row.request!;
  const c = q.credential;
  const s = parentState(row);
  const canReview = parent && q.status === 'shared';

  async function looksGood() {
    setBusy(true);
    setErr('');
    try {
      await requirementRequestsApi.review(q.id, true);
      router.back();
    } catch (e) {
      setErr(requestErrorText(e));
    } finally {
      setBusy(false);
    }
  }

  const details = c
    ? ([
        ['Issued by', c.issuer ?? ''],
        ['Issued', usDate(c.issued_on)],
        [s === 'expired' ? 'Expired' : 'Expires', usDate(c.expires_on)],
      ].filter(([, v]) => v) as [string, string][])
    : [];

  return (
    <Screen
      back
      title={row.title}
      gap={12}
      footer={
        canReview ? (
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <BigButton label="Ask again" tonal onPress={() => setAgain(true)} />
            <BigButton label="Looks good" onPress={looksGood} busy={busy} />
          </View>
        ) : undefined
      }>
      <View style={st.top}>
        <Text style={st.by}>
          Shared by {name}
          {q.shared_at ? ` · ${shortDay(q.shared_at)}` : ''}
        </Text>
        <View>
          <DotPill label={STATE_LABEL[s]} kind={STATE_PILL[s]} />
        </View>
      </View>

      {c ? (
        isPdf(path) ? (
          <Pressable accessibilityRole="button" disabled={!url} onPress={() => url && WebBrowser.openBrowserAsync(url)} style={st.pdf}>
            <SvgXml xml={reqSvg('doc', color.primary)} width={28} height={28} />
            <View style={{ flexGrow: 1, flexShrink: 1 }}>
              <Text style={st.pdfName} numberOfLines={1}>
                {path?.split('/').pop()?.replace(/^\d+-[a-z0-9]+-?/, '') || 'report.pdf'}
              </Text>
              <Text style={st.pdfSub}>{url ? 'Tap to open the PDF' : 'Can’t open it right now'}</Text>
            </View>
          </Pressable>
        ) : (
          <View style={st.photo}>{url ? <Image source={{ uri: url }} style={st.img} resizeMode="contain" /> : <Text style={st.pdfSub}>{path ? 'Loading the photo…' : 'No photo was added.'}</Text>}</View>
        )
      ) : (
        <View style={st.confirm}>
          <CIcon name="check" tint={color.ok} width={2.6} />
          <Text style={st.confirmText}>{name} confirmed it for your family.</Text>
        </View>
      )}

      {details.length ? (
        <View style={st.list}>
          {details.map(([k, v], i) => (
            <View key={k} style={[st.row, i < details.length - 1 && st.line]}>
              <Text style={st.key}>{k}</Text>
              <Text style={st.val}>{v}</Text>
            </View>
          ))}
        </View>
      ) : null}

      {q.sitter_note ? <Quote who={`${name}’s note`} text={q.sitter_note} /> : null}

      {q.status === 'met' && q.reviewed_by ? <Text style={reqReqStyles.small}>{q.reviewed_by} said it looks good{q.reviewed_at ? ` on ${shortDay(q.reviewed_at)}` : ''}.</Text> : null}

      <View style={reqReqStyles.info}>
        <CIcon name="eye" tint={color.primaryStrong} />
        {parent ? (
          <Text style={reqReqStyles.infoText}>
            <Text style={reqReqStyles.infoBold}>BabyBadger doesn’t check cards.</Text> Look at the name and the dates. When it looks right to you, tap Looks good.
          </Text>
        ) : (
          <Text style={reqReqStyles.infoText}>
            <Text style={reqReqStyles.infoBold}>You can look at it.</Text> Only family members with full access say it looks good or asks {name} again.
          </Text>
        )}
      </View>
      {!parent ? <Text style={[reqReqStyles.small, { textAlign: 'center' }]}>{decidesLine(parents)}</Text> : null}
      <ErrorText>{err}</ErrorText>

      <NoteSheet
        open={again}
        onClose={() => setAgain(false)}
        title={`Ask ${name} again?`}
        sub={`${row.title} goes back to Asked. Tell her what you need.`}
        label={`Note for ${name}`}
        placeholder="The photo is blurry. Can you send a clearer one?"
        button={`Ask ${name} again`}
        onSend={async (note) => {
          await requirementRequestsApi.review(q.id, false, note);
          await reload();
          router.back();
        }}
      />
    </Screen>
  );
}

// Values from wireframe P79b.
const st = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  by: { fontFamily: font.body, fontSize: 14, color: color.ink2, flexShrink: 1 },
  photo: { height: 220, borderRadius: 16, backgroundColor: color.muted, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  img: { width: '100%', height: '100%' },
  pdf: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, backgroundColor: '#FFFFFF', borderRadius: 16, ...cardShadow },
  pdfName: { fontFamily: font.bodySemi, fontSize: 15, color: color.ink },
  pdfSub: { fontFamily: font.body, fontSize: 13, color: color.ink2 },
  confirm: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, backgroundColor: color.okTint, borderRadius: 16 },
  confirmText: { flexShrink: 1, fontFamily: font.bodySemi, fontSize: 15, color: color.okInk },
  list: { paddingHorizontal: 16, backgroundColor: '#FFFFFF', borderRadius: 24, ...cardShadow },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, minHeight: 46 },
  line: { borderBottomWidth: 1, borderBottomColor: color.divider },
  key: { fontFamily: font.body, fontSize: 15, color: color.ink2 },
  val: { fontFamily: font.bodySemi, fontSize: 15, color: color.ink, textAlign: 'right', flexShrink: 1 },
});
