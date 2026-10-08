import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { AskSheet, ReqStatusCard } from '@/components/requirementRequests';
import { ModeSeg, ReqSection, ReqTile, reqSvg, Toggle } from '@/components/requirements';
import { Button, ErrorText, Loading, Screen } from '@/components/ui';
import { api, useQuery } from '@/lib/data';
import { firstName } from '@/lib/format';
import { progressLine, requirementRequestsApi, type FamilyReqRow } from '@/lib/requirement-requests-api';
import {
  catalogueDraft,
  catalogueItem,
  isLanguage,
  LANGUAGE_SUGGESTIONS,
  languageDraft,
  languageOf,
  LIST_KEYS,
  meetsLine,
  MIGRATION_20_TEXT,
  needsMigration20,
  putDraft,
  reqIcon,
  requirementsApi,
  requirementsOrMissing,
  requirementStatus,
  reqTitle,
  reviewSub,
  toDrafts,
  youngestUnder1,
  youngestUnder5,
  type ReqDraft,
  type RequirementMode,
} from '@/lib/requirements';
import { useSession } from '@/lib/session';
import { errorText } from '@/lib/supabase';
import { cardShadow, color, font } from '@/theme';
import { Text, TextInput } from '@/components/Text';

// Wireframe P7a Sitter requirements, from app/src/wireframes/P7a.tsx. Opened from the Care plan's Requirements pill
// (P7) and Home's Requirements tile (P4b); the same data as the P28–P32 flow, in one screen. Switches turn a
// requirement on (as Must) or off; language chips add a "Speaks …" nice-to-have; Save writes everything.
// Not drawn: rows for Non-smoker and the parent's own requirements (shown under the five switches when the P29 flow
// added them), the "+ Add" language field, the line for a sitter who is missing one, the line with no sitters yet.
// Scrolled down (P79d, migration 31): BY SITTER, each active sitter's status per requirement (the P11 card), her name
// opens P11, a shared row opens P79b, "Ask Maya" opens P79. Hidden before migration 31 or with no sitters.
export default function SitterRequirements() {
  const { family } = useSession();
  const fid = family!.id;
  const [askFor, setAskFor] = useState<{ id: string; name: string; rows: FamilyReqRow[] } | null>(null);
  const { data, error, reload } = useQuery(async () => {
    const [{ saved, missing }, kids, mode, sitters] = await Promise.all([
      requirementsOrMissing(fid),
      api.kids(fid),
      requirementsApi.mode(fid).catch(() => 'warn' as RequirementMode),
      api.familySitters(fid),
    ]);
    const active = sitters.filter((s) => s.status === 'active');
    const lines = await Promise.all(active.map(async (s) => meetsLine(firstName(s.profile?.full_name), await requirementStatus(fid, s.sitter_id))));
    const bySitter = await Promise.all(
      active.map(async (s) => ({
        id: s.sitter_id,
        full: s.profile?.full_name || 'Sitter',
        rows: await requirementRequestsApi.forSitter(fid, s.sitter_id).catch((): FamilyReqRow[] => []),
      })),
    );
    return { saved, missing, kids, mode, lines: lines.filter(Boolean), bySitter: bySitter.filter((b) => b.rows.length) };
  }, [fid]);
  const [drafts, setDrafts] = useState<ReqDraft[] | null>(null);
  const [mode, setMode] = useState<RequirementMode>('warn');
  const [adding, setAdding] = useState(false);
  const [lang, setLang] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (!data || drafts) return;
    // fill the form once the list has loaded
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDrafts(toDrafts(data.saved));
    setMode(data.mode);
  }, [data, drafts]);

  if (error && !data) return <Screen title="Sitter requirements" back><ErrorText>{needsMigration20(error) ? MIGRATION_20_TEXT : error}</ErrorText></Screen>;
  if (!data || !drafts) return <Loading />;

  const young = youngestUnder5(data.kids);
  const baby = youngestUnder1(data.kids);
  const extra = drafts.filter((d) => !LIST_KEYS.includes(d.key) && !isLanguage(d.key));
  const langs = drafts.filter((d) => isLanguage(d.key));
  // English and Spanish always first, in that order; other languages the parent added follow.
  const chips = [...LANGUAGE_SUGGESTIONS, ...langs.map((d) => languageOf(d)).filter((l) => !LANGUAGE_SUGGESTIONS.some((x) => x.toLowerCase() === l.toLowerCase()))];

  function toggle(key: string) {
    setDrafts((ds) => (ds!.some((d) => d.key === key) ? ds!.filter((d) => d.key !== key) : [...ds!, catalogueDraft(key)]));
  }
  function toggleLang(language: string) {
    setDrafts((ds) => {
      const has = ds!.find((d) => isLanguage(d.key) && languageOf(d).toLowerCase() === language.toLowerCase());
      return has ? putDraft(ds!, has.ref, null) : [...ds!, languageDraft(language)];
    });
  }
  function addLang() {
    const l = lang.trim().replace(/\s+/g, ' ');
    if (l && !langs.some((d) => languageOf(d).toLowerCase() === l.toLowerCase())) toggleLang(l.charAt(0).toUpperCase() + l.slice(1));
    setLang('');
    setAdding(false);
  }

  async function save() {
    setBusy(true);
    setErr('');
    try {
      await requirementsApi.save(fid, data!.saved, drafts!);
      if (mode !== data!.mode) await requirementsApi.setMode(fid, mode);
      router.back();
    } catch (e) {
      setErr(needsMigration20(e) ? MIGRATION_20_TEXT : errorText(e));
    } finally {
      setBusy(false);
    }
  }

  const rows = [
    ...LIST_KEYS.map((key) => {
      const c = catalogueItem(key)!;
      return { key, ref: key, on: drafts.some((d) => d.key === key), title: c.listTitle ?? c.title, sub: c.listSub, icon: c.icon, hint: key === 'cpr_infant' && young ? `Suggested · ${young.kid.name} is under 5` : key === 'vaccination' && baby ? `Suggested · ${baby.name} is under 1` : '' };
    }),
    ...extra.map((d) => ({ key: d.key, ref: d.ref, on: true, title: reqTitle(d), sub: reviewSub(d, data.kids), icon: reqIcon(d), hint: '' })),
  ];

  return (
    <Screen title="Sitter requirements" back gap={10} footer={<Button label="Save" onPress={save} busy={busy} style={{ marginTop: -4 }} />}>
      <Text style={st.lead}>Choose what every sitter for your family must have. Sitters see your list before accepting a shift.</Text>
      {data.missing ? <ErrorText>{MIGRATION_20_TEXT}</ErrorText> : null}
      <View style={st.card}>
        {rows.map((r, i) => (
          <Pressable
            key={r.ref}
            accessibilityRole="switch"
            accessibilityState={{ checked: r.on }}
            accessibilityLabel={r.title}
            onPress={() => (LIST_KEYS.includes(r.key) ? toggle(r.key) : setDrafts((ds) => putDraft(ds!, r.ref, null)))}
            style={[st.row, i < rows.length - 1 && st.line]}>
            <ReqTile icon={r.icon} size={38} />
            <View style={st.rowText}>
              <Text style={st.rowTitle}>{r.title}</Text>
              {r.sub ? <Text style={st.rowSub}>{r.sub}</Text> : null}
              {r.hint ? <Text style={st.hint}>{r.hint}</Text> : null}
            </View>
            <Toggle value={r.on} />
          </Pressable>
        ))}
      </View>
      <ReqSection label="PREFERRED LANGUAGE" />
      <View style={st.chips}>
        {chips.map((l) => {
          const on = langs.some((d) => languageOf(d) === l);
          return (
            <Pressable key={l} accessibilityRole="checkbox" accessibilityState={{ checked: on }} onPress={() => toggleLang(l)} style={[st.chip, on && st.chipOn]}>
              <Text style={[st.chipText, on && { color: color.primary }]}>{on ? `✓ ${l}` : l}</Text>
            </Pressable>
          );
        })}
        {adding ? (
          <TextInput
            value={lang}
            onChangeText={setLang}
            onSubmitEditing={addLang}
            onBlur={addLang}
            placeholder="Language"
            placeholderTextColor={color.quiet}
            autoFocus
            autoCapitalize="words"
            returnKeyType="done"
            maxLength={40}
            style={[st.chip, st.chipInput]}
          />
        ) : (
          <Pressable accessibilityRole="button" onPress={() => setAdding(true)} style={st.chip}>
            <Text style={st.chipText}>+ Add</Text>
          </Pressable>
        )}
      </View>
      <ReqSection label="IF A SITTER IS MISSING ONE" />
      <ModeSeg value={mode} onChange={setMode} />
      {data.lines.map((l) => (
        <Text key={l} style={st.note}>
          {l}
        </Text>
      ))}
      {data.bySitter.length ? (
        <>
          <ReqSection label="BY SITTER" style={{ marginTop: 4 }} />
          <Text style={st.lead2}>Ask a sitter to share what she has. It counts once you say it looks good.</Text>
          {data.bySitter.map((b) => {
            const name = firstName(b.full);
            return (
              <ReqStatusCard
                key={b.id}
                rows={b.rows}
                name={name}
                canAsk
                onAsk={() => setAskFor({ id: b.id, name, rows: b.rows })}
                onOpen={(rid) => router.push({ pathname: '/parent/shared/[id]', params: { id: rid } })}
                head={
                  <Pressable accessibilityRole="button" onPress={() => router.push({ pathname: '/parent/sitter/[id]', params: { id: b.id } })} style={st.sitterHead}>
                    <View style={st.sitterDot}>
                      <Text style={st.sitterInitial}>{(name[0] || '?').toUpperCase()}</Text>
                    </View>
                    <View style={{ flexGrow: 1, flexShrink: 1, minWidth: 0 }}>
                      <Text style={st.sitterName}>{name}</Text>
                      <Text style={st.sitterMeta}>{progressLine(b.rows)}</Text>
                    </View>
                    <SvgXml xml={reqSvg('chevron', color.ink2)} width={18} height={18} style={{ flexShrink: 0 }} />
                  </Pressable>
                }
              />
            );
          })}
          {askFor ? (
            <AskSheet open onClose={() => setAskFor(null)} familyId={fid} sitterId={askFor.id} name={askFor.name} rows={askFor.rows} onSent={reload} />
          ) : null}
        </>
      ) : null}
      <Pressable accessibilityRole="button" onPress={() => router.push('/parent/rules')} style={st.rules}>
        <SvgXml xml={reqSvg('rules', color.primaryStrong)} width={20} height={20} style={{ flexShrink: 0 }} />
        <Text style={st.rulesText}>
          <Text style={st.rulesBold}>House rules</Text> · logs, phone use, visitors, screen time
        </Text>
        <SvgXml xml={reqSvg('chevron', color.primary)} width={18} height={18} style={{ flexShrink: 0 }} />
      </Pressable>
      <ErrorText>{err}</ErrorText>
    </Screen>
  );
}

// Values from wireframe P7a.
const st = StyleSheet.create({
  lead: { fontFamily: font.body, fontSize: 15, lineHeight: 22, color: color.ink2 },
  card: { paddingHorizontal: 16, backgroundColor: '#FFFFFF', borderRadius: 24, ...cardShadow },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 60 },
  line: { borderBottomWidth: 1, borderBottomColor: color.divider },
  rowText: { flexGrow: 1, flexShrink: 1, minWidth: 0 },
  rowTitle: { fontFamily: font.bodySemi, fontSize: 15, color: color.ink },
  rowSub: { fontFamily: font.body, fontSize: 13, color: color.ink2 },
  hint: { fontFamily: font.bodyBold, fontSize: 12, color: color.primary },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { height: 40, paddingHorizontal: 14, borderRadius: 999, borderWidth: 1, borderColor: color.line, backgroundColor: '#FFFFFF', justifyContent: 'center' },
  chipOn: { backgroundColor: color.primaryTint, borderWidth: 1.5, borderColor: color.primary },
  chipText: { fontFamily: font.bodySemi, fontSize: 14, color: color.ink },
  chipInput: { minWidth: 120, fontFamily: font.bodySemi, fontSize: 14, color: color.ink, borderColor: color.primary },
  note: { fontFamily: font.body, fontSize: 13, lineHeight: 18, color: color.ink2 },
  // P79d
  lead2: { fontFamily: font.body, fontSize: 14, lineHeight: 20, color: color.ink2 },
  sitterHead: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingBottom: 4 },
  sitterDot: { width: 32, height: 32, borderRadius: 16, backgroundColor: color.primary, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  sitterInitial: { fontFamily: font.display, fontSize: 16, color: '#FFFFFF' },
  sitterName: { fontFamily: font.bodyBold, fontSize: 16, color: color.ink },
  sitterMeta: { fontFamily: font.body, fontSize: 12, color: color.ink2 },
  rules: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, paddingHorizontal: 14, backgroundColor: color.primaryTint, borderRadius: 14 },
  rulesText: { flexGrow: 1, flexShrink: 1, fontFamily: font.body, fontSize: 13, lineHeight: 18, color: color.ink },
  rulesBold: { fontFamily: font.bodyBold, color: color.primaryStrong },
});
