import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SvgXml } from 'react-native-svg';

import { DotPill, LevelSeg, ModeSeg, ReqSection, ReqTile, reqSvg, TwoSeg } from '@/components/requirements';
import { Button, ErrorText, Field, Loading, Screen } from '@/components/ui';
import { api, useQuery } from '@/lib/data';
import {
  CATALOGUE,
  catalogueDraft,
  catalogueItem,
  choiceOf,
  CUSTOM_SUGGESTIONS,
  customDraft,
  DEFAULT_DRIVING,
  DRIVE_ITEMS,
  isLanguage,
  MIGRATION_20_TEXT,
  modeNote,
  needsMigration20,
  putDraft,
  recommended,
  reqIcon,
  requirementsApi,
  requirementsOrMissing,
  reqTitle,
  reviewRows,
  reviewSub,
  seatLabel,
  setChoice,
  startDrafts,
  basedOnLine,
  toDrafts,
  type DriveItem,
  type ReqChoice,
  type ReqDraft,
  type ReqProof,
  type RequirementMode,
} from '@/lib/requirements';
import { useSession } from '@/lib/session';
import { errorText } from '@/lib/supabase';
import type { Kid } from '@/lib/types';
import { cardShadow, color, font, SECTION_GAP } from '@/theme';
import { Text } from '@/components/Text';

// Wireframes P28 Requirements start, P29 builder, P30 detail (Driving), P31 add your own, P32 review, from
// app/src/wireframes/P28–P32.tsx. Opened from the invite (P23 "Set sitter requirements", `?from=invite&drive=1|0`):
// the first time it starts at P28; once the family has requirements it opens on P29 with them. Nothing is saved until
// P32's "Save and continue invite" (or Save), which goes back to the invite. Design note: "requirements are per
// family"; with Block booking a sitter missing a must-have can't be booked (migration 20).
// Not drawn: a language row on P29 appears only once one was picked on P7a; the parent's own requirements show on
// P29 as rows that open P31 to edit (footer "Save requirement"; Off removes it); P32 with nothing on, and its note for
// "Warn me".
type Step = 'start' | 'builder' | 'driving' | 'custom' | 'review';

export default function RequirementsSetup() {
  const { from, drive } = useLocalSearchParams<{ from?: string; drive?: string }>();
  const fromInvite = from === 'invite';
  const canDrive = drive === '1';
  const { family } = useSession();
  const fid = family!.id;
  const { data, error } = useQuery(async () => {
    const [{ saved, missing }, kids, mode] = await Promise.all([requirementsOrMissing(fid), api.kids(fid), requirementsApi.mode(fid).catch(() => 'warn' as RequirementMode)]);
    return { saved, missing, kids, mode };
  }, [fid]);
  const [step, setStep] = useState<Step>('start');
  const [opened, setOpened] = useState<Step>('start');
  const [start, setStart] = useState<'recommended' | 'blank'>('recommended');
  const [drafts, setDrafts] = useState<ReqDraft[] | null>(null);
  const [mode, setMode] = useState<RequirementMode>('warn');
  const [customRef, setCustomRef] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (!data || drafts) return;
    // start from what's saved once it has loaded
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDrafts(toDrafts(data.saved));
    setMode(data.mode);
    const first: Step = data.saved.length ? 'builder' : 'start';
    setStep(first);
    setOpened(first);
  }, [data, drafts]);

  if (error && !data) return <Screen title="Sitter requirements" back><ErrorText>{needsMigration20(error) ? MIGRATION_20_TEXT : error}</ErrorText></Screen>;
  if (!data || !drafts) return <Loading />;
  const kids = data.kids;
  const banner = data.missing ? <ErrorText>{MIGRATION_20_TEXT}</ErrorText> : null;

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

  if (step === 'start')
    return (
      <Start
        kids={kids}
        banner={banner}
        canDrive={canDrive}
        fromInvite={fromInvite}
        choice={start}
        onChoice={setStart}
        onNext={() => {
          setDrafts(startDrafts(start, kids, canDrive));
          setStep('builder');
        }}
      />
    );

  if (step === 'driving') {
    const d = drafts.find((x) => x.key === 'drivers_license');
    return (
      <Driving
        draft={d ?? { ...catalogueDraft('drivers_license'), level: 'must' }}
        on={!!d}
        kids={kids}
        onCancel={() => setStep('builder')}
        onDone={(next, level) => {
          setDrafts((ds) => (level === 'off' ? ds!.filter((x) => x.key !== 'drivers_license') : putDraft(ds!.filter((x) => x.key !== 'drivers_license' || x.ref === next.ref), next.ref, { ...next, level })));
          setStep('builder');
        }}
      />
    );
  }

  if (step === 'custom') {
    const editing = customRef ? drafts.find((d) => d.ref === customRef) ?? null : null;
    return (
      <Custom
        draft={editing}
        onBack={() => setStep('builder')}
        onDone={(next) => {
          setDrafts((ds) => (next ? putDraft(ds!, next.ref, next) : editing ? putDraft(ds!, editing.ref, null) : ds!));
          setStep('builder');
        }}
      />
    );
  }

  if (step === 'review') {
    const must = reviewRows(drafts, 'must', kids);
    const nice = reviewRows(drafts, 'prefer', kids);
    const mustCount = drafts.filter((d) => d.level === 'must').length;
    const niceCount = drafts.filter((d) => d.level === 'prefer').length;
    return (
      <Screen
        title="Your sitter requirements"
        step={{ label: 'Sitter requirements', n: 4, total: 4 }}
        onBack={() => setStep('builder')}
        gap={12}
        footer={<Button label={fromInvite ? 'Save and continue invite' : 'Save'} onPress={save} busy={busy} style={{ marginTop: -4 }} />}>
        <View style={st.reviewCard}>
          {must.length ? <ReviewGroup title="Must have" count={mustCount} kind="info" rows={must} /> : null}
          {must.length && nice.length ? <View style={st.divider} /> : null}
          {nice.length ? <ReviewGroup title="Nice to have" count={niceCount} kind="muted" rows={nice} /> : null}
          {!must.length && !nice.length ? <Text style={st.note}>No requirements. Every sitter you invite can be booked.</Text> : null}
        </View>
        <ReqSection label="IF A SITTER IS MISSING A MUST-HAVE" style={{ marginTop: SECTION_GAP }} />
        <ModeSeg value={mode} onChange={setMode} />
        <Text style={st.note}>{modeNote(mode)}</Text>
        <ErrorText>{err}</ErrorText>
      </Screen>
    );
  }

  // P29
  const safety = CATALOGUE.filter((c) => c.section === 'safety');
  const skills: { ref: string; key: string; title: string; sub: string; choice: ReqChoice; open?: () => void; make?: () => ReqDraft }[] = [
    { ref: 'drivers_license', key: 'drivers_license', title: 'Driving ›', sub: catalogueItem('drivers_license')!.sub, choice: choiceOf(drafts, 'drivers_license'), open: () => setStep('driving') },
    ...drafts.filter((d) => isLanguage(d.key)).map((d) => ({ ref: d.ref, key: d.key, title: reqTitle(d), sub: 'Any level', choice: d.level as ReqChoice })),
    { ref: 'non_smoker', key: 'non_smoker', title: 'Non-smoker', sub: catalogueItem('non_smoker')!.sub, choice: choiceOf(drafts, 'non_smoker') },
    ...drafts
      .filter((d) => d.key === 'custom')
      .map((d) => ({
        ref: d.ref,
        key: d.key,
        title: `${d.title} ›`,
        sub: reviewSub(d, kids),
        choice: d.level as ReqChoice,
        open: () => {
          setCustomRef(d.ref);
          setStep('custom');
        },
      })),
  ];
  const choose = (ref: string, key: string, c: ReqChoice) =>
    setDrafts((ds) => {
      if (key === 'custom' || isLanguage(key)) {
        const d = ds!.find((x) => x.ref === ref)!;
        return c === 'off' ? putDraft(ds!, ref, null) : putDraft(ds!, ref, { ...d, level: c });
      }
      return setChoice(ds!, key, c);
    });

  return (
    <Screen
      title="Must have or nice to have?"
      step={{ label: 'Sitter requirements', n: 2, total: 4 }}
      onBack={() => (opened === 'start' ? setStep('start') : router.back())}
      gap={10}
      footer={<Button label="Continue" onPress={() => setStep('review')} style={{ marginTop: -4 }} />}>
      {banner}
      <Text style={st.note}>
        <Text style={st.bold}>Must</Text> is checked before booking. <Text style={st.bold}>Nice</Text> helps you compare.
      </Text>
      <ReqSection label="SAFETY" style={{ marginTop: SECTION_GAP }} />
      <View style={st.builderCard}>
        {safety.map((c, i) => (
          <BuilderRow key={c.key} icon={c.icon} title={c.title} sub={c.sub} choice={choiceOf(drafts, c.key)} onChoice={(v) => choose(c.key, c.key, v)} last={i === safety.length - 1} />
        ))}
      </View>
      <ReqSection label="SKILLS AND LIFESTYLE" style={{ marginTop: SECTION_GAP }} />
      <View style={st.builderCard}>
        {skills.map((r, i) => (
          <BuilderRow
            key={r.ref}
            icon={reqIcon({ key: r.key, title: r.title })}
            title={r.title}
            sub={r.sub}
            choice={r.choice}
            onChoice={(v) => (r.key === 'drivers_license' && v !== 'off' && r.choice === 'off' ? setDrafts((ds) => [...ds!, { ...catalogueDraft('drivers_license'), level: v }]) : choose(r.ref, r.key, v))}
            onOpen={r.open}
            last={i === skills.length - 1}
          />
        ))}
      </View>
      <Pressable
        accessibilityRole="button"
        onPress={() => {
          setCustomRef(null);
          setStep('custom');
        }}
        style={st.addOwn}>
        <SvgXml xml={reqSvg('plus', color.primary, 2.2)} width={20} height={20} />
        <Text style={st.addOwnText}>Add your own</Text>
      </Pressable>
    </Screen>
  );
}

// ---------------------------------------------------------------- P28
function Start({ kids, banner, canDrive, fromInvite, choice, onChoice, onNext }: { kids: Kid[]; banner: ReactNode; canDrive: boolean; fromInvite: boolean; choice: 'recommended' | 'blank'; onChoice: (c: 'recommended' | 'blank') => void; onNext: () => void }) {
  const recs = recommended(kids, canDrive);
  const rec = choice === 'recommended';
  return (
    <Screen title="What should every sitter have?" step={{ label: 'Sitter requirements', n: 1, total: 4 }} gap={14} footer={<Button label="Continue" onPress={onNext} style={{ marginTop: -4 }} />}>
      <Text style={[st.lead, { marginTop: -10 }]}>Set it once. It applies to every sitter you invite now and later.</Text>
      {banner}
      <Pressable accessibilityRole="radio" accessibilityState={{ selected: rec }} onPress={() => onChoice('recommended')} style={[st.option, rec ? st.optionOn : st.optionOff]}>
        <View style={st.optionHead}>
          <Radio on={rec} />
          <View style={{ flexShrink: 1, gap: 2 }}>
            <Text style={st.optionTitle}>Recommended for your family</Text>
            <Text style={st.optionSub}>{basedOnLine(kids, fromInvite)}</Text>
          </View>
        </View>
        <View style={{ gap: 10, paddingLeft: 34 }}>
          {recs.map((r) => {
            const c = catalogueItem(r.key)!;
            return (
              <View key={r.key} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <ReqTile icon={c.icon} size={30} />
                <Text style={st.recTitle}>{c.listTitle ?? c.title}</Text>
                <Text style={st.recWhy}>{r.why}</Text>
              </View>
            );
          })}
        </View>
      </Pressable>
      <Pressable accessibilityRole="radio" accessibilityState={{ selected: !rec }} onPress={() => onChoice('blank')} style={[st.option, !rec ? st.optionOn : st.optionOff]}>
        <View style={st.optionHead}>
          <Radio on={!rec} />
          <View style={{ flexShrink: 1, gap: 2 }}>
            <Text style={st.optionTitle}>Build my own</Text>
            <Text style={st.optionSub}>Start with nothing and pick each one</Text>
          </View>
        </View>
      </Pressable>
      <Text style={st.note}>You can change anything on the next screen.</Text>
    </Screen>
  );
}

function Radio({ on }: { on: boolean }) {
  return <View style={[st.radio, on && { borderColor: color.primary }]}>{on ? <View style={st.radioDot} /> : null}</View>;
}

// ---------------------------------------------------------------- P29 row
function BuilderRow({ icon, title, sub, choice, onChoice, onOpen, last }: { icon: ReturnType<typeof reqIcon>; title: string; sub: string; choice: ReqChoice; onChoice: (c: ReqChoice) => void; onOpen?: () => void; last?: boolean }) {
  return (
    <View style={[st.builderRow, !last && st.line]}>
      <ReqTile icon={icon} size={32} />
      <View style={{ flexGrow: 1, flexShrink: 1, minWidth: 0 }}>
        {onOpen ? (
          <Pressable accessibilityRole="button" onPress={onOpen} hitSlop={6}>
            <Text style={st.rowTitle}>{title}</Text>
          </Pressable>
        ) : (
          <Text style={st.rowTitle}>{title}</Text>
        )}
        {sub ? <Text style={st.rowSub}>{sub}</Text> : null}
      </View>
      <LevelSeg value={choice} onChange={onChoice} label={title} />
    </View>
  );
}

// ---------------------------------------------------------------- P30
function Driving({ draft, on, kids, onCancel, onDone }: { draft: ReqDraft; on: boolean; kids: Kid[]; onCancel: () => void; onDone: (d: ReqDraft, level: ReqChoice) => void }) {
  const [level, setLevel] = useState<ReqChoice>(on ? draft.level : 'off');
  const [applies, setApplies] = useState(draft.details.applies ?? 'car_trips');
  const [items, setItems] = useState<DriveItem[]>(draft.details.items ?? DEFAULT_DRIVING.items!);
  const [riding, setRiding] = useState<string[]>(draft.details.kid_ids ?? kids.map((k) => k.id));
  const toggleItem = (v: DriveItem) => setItems((xs) => (xs.includes(v) ? xs.filter((x) => x !== v) : [...xs, v]));
  const toggleKid = (id: string) => setRiding((xs) => (xs.includes(id) ? xs.filter((x) => x !== id) : [...xs, id]));
  const done = () => {
    const all = kids.every((k) => riding.includes(k.id));
    const order = DRIVE_ITEMS.map((i) => i.value).filter((v) => items.includes(v));
    onDone({ ...draft, details: { applies, items: order, kid_ids: all ? null : kids.filter((k) => riding.includes(k.id)).map((k) => k.id) } }, level);
  };
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: color.canvas }} edges={['top', 'left', 'right', 'bottom']}>
      <View style={st.sheetHead}>
        <Pressable accessibilityRole="button" onPress={onCancel} hitSlop={8} style={{ width: 60 }}>
          <Text style={st.headLink}>Cancel</Text>
        </Pressable>
        <Text style={st.sheetTitle}>Driving</Text>
        <Pressable accessibilityRole="button" onPress={done} hitSlop={8} style={{ width: 60, alignItems: 'flex-end' }}>
          <Text style={[st.headLink, { fontFamily: font.bodyBold }]}>Done</Text>
        </Pressable>
      </View>
      <View style={st.sheetBody}>
        <View style={st.levelRow}>
          <ReqSection label="LEVEL" />
          <LevelSeg value={level} onChange={setLevel} label="Level" />
        </View>
        <ReqSection label="WHEN IT APPLIES" />
        <TwoSeg options={[{ value: 'car_trips' as const, label: 'Only shifts with car trips' }, { value: 'every' as const, label: 'Every shift' }]} value={applies} onChange={setApplies} />
        <ReqSection label="SITTER MUST HAVE" />
        <View style={st.checkCard}>
          {DRIVE_ITEMS.map((i) => {
            const checked = items.includes(i.value);
            return (
              <Pressable key={i.value} accessibilityRole="checkbox" accessibilityState={{ checked }} onPress={() => toggleItem(i.value)} style={st.checkRow}>
                <View style={[st.box, checked ? st.boxOn : st.boxOff]}>{checked ? <SvgXml xml={reqSvg('check', '#FFFFFF', 2.8)} width={16} height={16} /> : null}</View>
                <Text style={st.checkText}>{i.label}</Text>
              </Pressable>
            );
          })}
        </View>
        {kids.length ? (
          <>
            <ReqSection label="WHICH KIDS RIDE" />
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {kids.map((k) => {
                const kOn = riding.includes(k.id);
                return (
                  <Pressable key={k.id} accessibilityRole="checkbox" accessibilityState={{ checked: kOn }} onPress={() => toggleKid(k.id)} style={[st.chip, kOn && st.chipOn]}>
                    <Text style={[st.chipText, kOn && { color: color.primary }]}>{kOn ? `✓ ${seatLabel(k)}` : seatLabel(k)}</Text>
                  </Pressable>
                );
              })}
            </View>
          </>
        ) : null}
        <View style={st.info}>
          <SvgXml xml={reqSvg('car', color.primaryStrong)} width={22} height={22} style={{ flexShrink: 0 }} />
          <Text style={st.infoText}>
            <Text style={st.infoBold}>BabyBadger doesn’t check these.</Text> She shares her license and record, and you decide if they look good. She confirms car seat skill herself.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

// ---------------------------------------------------------------- P31
function Custom({ draft, onBack, onDone }: { draft: ReqDraft | null; onBack: () => void; onDone: (d: ReqDraft | null) => void }) {
  const [title, setTitle] = useState(draft?.title ?? '');
  const [why, setWhy] = useState(draft?.details.why ?? '');
  const [proof, setProof] = useState<ReqProof>(draft?.details.proof === 'document' ? 'document' : 'self');
  const [level, setLevel] = useState<ReqChoice>(draft?.level ?? 'prefer');
  const done = () => {
    if (level === 'off') return onDone(null);
    const next = customDraft(title, why, proof, level);
    onDone(draft ? { ...next, ref: draft.ref, id: draft.id } : next);
  };
  const proofs: { value: ReqProof; title: string; sub: string }[] = [
    { value: 'self', title: 'She confirms Yes', sub: 'Shows as “self-confirmed” on her profile' },
    { value: 'document', title: 'She uploads a document', sub: 'A certificate or letter you review' },
  ];
  return (
    <Screen
      title="Add your own"
      back
      onBack={onBack}
      gap={12}
      footer={<Button label={draft ? 'Save requirement' : 'Add requirement'} onPress={done} disabled={level !== 'off' && !title.trim()} style={{ marginTop: -4 }} />}>
      <Text style={st.h1}>Something specific to your home?</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {CUSTOM_SUGGESTIONS.map((s) => {
          const on = title.trim().toLowerCase() === s.toLowerCase();
          return (
            <Pressable key={s} accessibilityRole="button" accessibilityState={{ selected: on }} onPress={() => setTitle(s)} style={[st.chip, on && st.chipOn]}>
              <Text style={[st.chipText, on && { color: color.primary }]}>{on ? `✓ ${s}` : s}</Text>
            </Pressable>
          );
        })}
      </View>
      <Field label="Requirement" value={title} onChangeText={setTitle} maxLength={120} style={{ minHeight: 48, height: 48 }} />
      <Field label="Why it matters (sitter sees this)" value={why} onChangeText={setWhy} multiline maxLength={300} style={{ minHeight: 66, fontSize: 15, lineHeight: 21, paddingBottom: 12 }} />
      <ReqSection label="HOW SHE SHOWS IT" style={{ marginTop: SECTION_GAP }} />
      <View style={{ gap: 8 }}>
        {proofs.map((p) => {
          const on = proof === p.value;
          return (
            <Pressable key={p.value} accessibilityRole="radio" accessibilityState={{ selected: on }} onPress={() => setProof(p.value)} style={[st.proof, on ? st.proofOn : st.proofOff]}>
              <Text style={st.proofTitle}>{p.title}</Text>
              <Text style={st.proofSub}>{p.sub}</Text>
            </Pressable>
          );
        })}
      </View>
      <View style={st.levelRow}>
        <Text style={st.levelLabel}>Level</Text>
        <LevelSeg value={level} onChange={setLevel} label="Level" />
      </View>
    </Screen>
  );
}

// ---------------------------------------------------------------- P32 group
function ReviewGroup({ title, count, kind, rows }: { title: string; count: number; kind: 'info' | 'muted'; rows: ReturnType<typeof reviewRows> }) {
  return (
    <>
      <View style={st.groupHead}>
        <Text style={st.groupTitle}>{title}</Text>
        <DotPill label={String(count)} kind={kind} />
      </View>
      {rows.map((r) => (
        <View key={r.refs.join()} style={st.reviewRow}>
          <ReqTile icon={r.icon} size={30} />
          <View style={{ flexShrink: 1 }}>
            <Text style={st.reviewTitle}>{r.title}</Text>
            {r.sub ? <Text style={st.rowSub}>{r.sub}</Text> : null}
          </View>
        </View>
      ))}
    </>
  );
}

// Values from wireframes P28–P32.
const st = StyleSheet.create({
  lead: { fontFamily: font.body, fontSize: 15, lineHeight: 22, color: color.ink2 },
  note: { fontFamily: font.body, fontSize: 13, lineHeight: 18, color: color.ink2 },
  bold: { fontFamily: font.bodyBold },
  h1: { fontFamily: font.display, fontSize: 26, lineHeight: 32, color: color.ink },
  // P28
  option: { paddingVertical: 14, paddingHorizontal: 16, gap: 10, backgroundColor: '#FFFFFF' },
  optionOn: { borderWidth: 2, borderColor: color.primary, borderRadius: 18 },
  optionOff: { borderRadius: 24, ...cardShadow },
  optionHead: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  optionTitle: { fontFamily: font.bodyBold, fontSize: 16, color: color.ink },
  optionSub: { fontFamily: font.body, fontSize: 13, lineHeight: 18, color: color.ink2 },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: color.lineStrong, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: color.primary },
  recTitle: { flexGrow: 1, flexShrink: 1, fontFamily: font.bodySemi, fontSize: 14, color: color.ink },
  recWhy: { fontFamily: font.body, fontSize: 12, color: color.ink2, textAlign: 'right' },
  // P29
  builderCard: { paddingHorizontal: 14, backgroundColor: '#FFFFFF', borderRadius: 24, ...cardShadow },
  builderRow: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 54, paddingVertical: 3 },
  line: { borderBottomWidth: 1, borderBottomColor: color.divider },
  rowTitle: { fontFamily: font.bodySemi, fontSize: 15, color: color.ink },
  rowSub: { fontFamily: font.body, fontSize: 12, lineHeight: 16, color: color.ink2 },
  addOwn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: 46, borderRadius: 999, borderWidth: 2, borderColor: '#C9D3DD', borderStyle: 'dashed' },
  addOwnText: { fontFamily: font.displayBold, fontSize: 16, color: color.primary },
  // P30
  sheetHead: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingTop: 16, paddingHorizontal: 20, paddingBottom: 8 },
  sheetTitle: { flexGrow: 1, flexShrink: 1, textAlign: 'center', fontFamily: font.display, fontSize: 20, color: color.ink },
  headLink: { fontFamily: font.bodySemi, fontSize: 15, color: color.primary },
  sheetBody: { paddingTop: 6, paddingHorizontal: 20, paddingBottom: 12, gap: 12 },
  levelRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  levelLabel: { fontFamily: font.bodySemi, fontSize: 15, color: color.ink, flexShrink: 1 },
  checkCard: { paddingVertical: 4, paddingHorizontal: 16, backgroundColor: '#FFFFFF', borderRadius: 24, ...cardShadow },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 44 },
  box: { width: 24, height: 24, borderRadius: 6, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  boxOn: { backgroundColor: color.primary },
  boxOff: { borderWidth: 2, borderColor: color.lineStrong },
  checkText: { fontFamily: font.body, fontSize: 15, color: color.ink, flexShrink: 1 },
  chip: { height: 40, paddingHorizontal: 14, borderRadius: 999, borderWidth: 1, borderColor: color.line, backgroundColor: '#FFFFFF', justifyContent: 'center' },
  chipOn: { backgroundColor: color.primaryTint, borderWidth: 1.5, borderColor: color.primary },
  chipText: { fontFamily: font.bodySemi, fontSize: 14, color: color.ink },
  info: { flexDirection: 'row', gap: 12, paddingVertical: 12, paddingHorizontal: 14, backgroundColor: color.primaryTint, borderRadius: 14 },
  infoText: { flexShrink: 1, fontFamily: font.body, fontSize: 14, lineHeight: 20, color: color.ink },
  infoBold: { fontFamily: font.bodyBold, color: color.primaryStrong },
  // P31
  proof: { gap: 2, paddingVertical: 12, paddingHorizontal: 14, borderRadius: 14 },
  proofOn: { backgroundColor: color.primaryTint, borderWidth: 2, borderColor: color.primary },
  proofOff: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: color.line },
  proofTitle: { fontFamily: font.bodyBold, fontSize: 15, color: color.ink },
  proofSub: { fontFamily: font.body, fontSize: 13, color: color.ink2 },
  // P32
  reviewCard: { gap: 4, paddingVertical: 12, paddingHorizontal: 16, backgroundColor: '#FFFFFF', borderRadius: 24, ...cardShadow },
  groupHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  groupTitle: { fontFamily: font.displayBold, fontSize: 17, color: color.ink, flexShrink: 1 },
  reviewRow: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 40 },
  reviewTitle: { fontFamily: font.bodySemi, fontSize: 14, color: color.ink },
  divider: { height: 1, marginVertical: 6, backgroundColor: color.muted },
});
