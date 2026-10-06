import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { RuleSection } from '@/components/houseRules';
import { Button, ErrorText, Field, Loading, Screen } from '@/components/ui';
import { api, useQuery } from '@/lib/data';
import { firstName } from '@/lib/format';
import { type HouseRule, type PhoneUse, type RuleStrength, detailTitle, isPhoneConduct, ownRule, PHONE_USES, ruleIconXml, rulesApi, withPhoneChoice } from '@/lib/house-rules';
import { useSession } from '@/lib/session';
import { cardShadow, color, font } from '@/theme';
import { Text } from '@/components/Text';

// Wireframe P76 Rule detail, from app/src/wireframes/P76.tsx (`?id=` a saved rule; no id = "+ Write your own rule").
// Only the phone rule has options (personal phone use, no social media, never post the kids); every other rule shows
// HOW STRICT and Save / Remove. A rule the parent writes herself gets a name field, which P76 doesn't draw.
// The "agreement, not tracking" box is about the phone, so it shows on the phone and social media rules.
// Not drawn: the remove confirm.
export default function RuleDetail() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { family } = useSession();
  const fid = family!.id;
  const { data, error } = useQuery(async () => {
    const [rule, parents] = await Promise.all([id ? rulesApi.rule(id) : Promise.resolve(null), api.familyParents(fid)]);
    return { rule, parents };
  }, [id, fid]);
  const [form, setForm] = useState<{ title: string; strength: RuleStrength; use: PhoneUse; noSocial: boolean; noPosts: boolean } | null>(null);
  const [busy, setBusy] = useState<'save' | 'remove'>();
  const [err, setErr] = useState('');

  useEffect(() => {
    if (!data || form) return;
    const r = data.rule;
    // fill the form once the rule has loaded
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setForm({ title: r?.title ?? '', strength: r?.strength ?? 'must', use: r?.options.use ?? 'emergencies', noSocial: !!r?.options.no_social, noPosts: !!r?.options.no_posts });
  }, [data, form]);

  if (!data || !form) return error ? <Screen title="House rule" back><ErrorText>{error}</ErrorText></Screen> : <Loading />;
  const rule: HouseRule | null = data.rule;
  const phone = rule?.key === 'phone';
  const parents = data.parents.map((p) => firstName(p.full_name)).join(' or ');

  async function save() {
    if (!form) return;
    setBusy('save');
    setErr('');
    try {
      if (!rule) {
        await rulesApi.add(fid, [ownRule(form.title, form.strength)]);
      } else if (phone) {
        const next = withPhoneChoice({ ...rule, strength: form.strength }, form.use);
        await rulesApi.update(rule.id, { strength: form.strength, title: next.title, sub: next.sub, options: { ...next.options, no_social: form.noSocial, no_posts: form.noPosts } });
      } else {
        await rulesApi.update(rule.id, { strength: form.strength });
      }
      router.back();
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(undefined);
    }
  }

  async function remove() {
    if (!rule) return;
    setBusy('remove');
    setErr('');
    try {
      await rulesApi.remove(rule.id);
      router.back();
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(undefined);
    }
  }

  return (
    <Screen
      title={rule ? detailTitle(rule) : 'Write your own rule'}
      subtitle="House rule"
      back
      gap={10}
      footer={
        <View style={{ gap: 2 }}>
          <Button label="Save rule" onPress={save} busy={busy === 'save'} disabled={!rule && !form.title.trim()} />
          {rule ? (
            <Pressable accessibilityRole="button" onPress={remove} disabled={!!busy} style={st.remove}>
              <Text style={st.removeText}>Remove rule</Text>
            </Pressable>
          ) : null}
        </View>
      }>
      {!rule && <Field label="Rule" value={form.title} onChangeText={(title) => setForm({ ...form, title })} maxLength={120} autoFocus />}
      {phone && (
        <>
          <RuleSection label="PERSONAL PHONE DURING A SHIFT" />
          <View style={st.card}>
            {PHONE_USES.map((u, i) => {
              const on = form.use === u.value;
              return (
                <Pressable key={u.value} accessibilityRole="radio" accessibilityState={{ selected: on }} onPress={() => setForm({ ...form, use: u.value })} style={[st.radioRow, i < PHONE_USES.length - 1 && st.line]}>
                  <View style={[st.radio, on && { borderColor: color.primary }]}>{on ? <View style={st.radioDot} /> : null}</View>
                  <View style={{ flexShrink: 1 }}>
                    <Text style={[st.radioTitle, on && { fontFamily: font.bodyBold }]}>{u.title}</Text>
                    <Text style={st.radioSub}>{u.sub.replace('{parents}', parents || 'us')}</Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
          <View style={st.card}>
            <Switch label="No social media on shift" sub="No scrolling Instagram, TikTok and similar" value={form.noSocial} onChange={(noSocial) => setForm({ ...form, noSocial })} />
            <Switch label="Never post photos of the kids" sub="Anywhere, even after the shift" value={form.noPosts} onChange={(noPosts) => setForm({ ...form, noPosts })} last />
          </View>
        </>
      )}
      <RuleSection label="HOW STRICT" />
      <View style={st.seg}>
        {(['must', 'prefer'] as const).map((v) => {
          const on = form.strength === v;
          return (
            <Pressable key={v} accessibilityRole="button" accessibilityState={{ selected: on }} onPress={() => setForm({ ...form, strength: v })} style={[st.segItem, on && { backgroundColor: '#FFFFFF' }]}>
              <Text style={[st.segText, on && st.segTextOn]}>{v === 'must' ? 'Must' : 'Prefer'}</Text>
            </Pressable>
          );
        })}
      </View>
      <View style={{ paddingHorizontal: 2 }}>
        <Text style={st.hint}>Must: sitters agree before booking. Prefer: shown as a wish, not a condition.</Text>
      </View>
      {rule && isPhoneConduct(rule) && (
        <View style={st.info}>
          <SvgXml xml={ruleIconXml('shield', color.primaryStrong)} width={20} height={20} />
          <Text style={st.infoText}>
            <Text style={st.infoBold}>This is an agreement, not tracking.</Text> BabyBadger doesn’t watch the sitter’s phone. She agrees once and sees it at the start of every shift.
          </Text>
        </View>
      )}
      <ErrorText>{err}</ErrorText>
    </Screen>
  );
}

/** P76 switch row: 54 high, 50×30 track. */
function Switch({ label, sub, value, onChange, last }: { label: string; sub: string; value: boolean; onChange: (v: boolean) => void; last?: boolean }) {
  return (
    <Pressable accessibilityRole="switch" accessibilityState={{ checked: value }} accessibilityLabel={label} onPress={() => onChange(!value)} style={[st.switchRow, !last && st.line]}>
      <View style={{ flexGrow: 1, flexShrink: 1 }}>
        <Text style={st.switchTitle}>{label}</Text>
        <Text style={st.radioSub}>{sub}</Text>
      </View>
      <View style={[st.track, { backgroundColor: value ? color.primary : color.lineStrong }]}>
        <View style={[st.knob, value ? { right: 3 } : { left: 3 }]} />
      </View>
    </Pressable>
  );
}

const st = StyleSheet.create({
  switchRow: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 54 },
  switchTitle: { fontFamily: font.bodySemi, fontSize: 15, color: color.ink },
  track: { width: 50, height: 30, flexShrink: 0, borderRadius: 15 },
  knob: { position: 'absolute', top: 3, width: 24, height: 24, borderRadius: 12, backgroundColor: '#FFFFFF' },
  card: { paddingHorizontal: 14, backgroundColor: '#FFFFFF', borderRadius: 24, ...cardShadow },
  line: { borderBottomWidth: 1, borderBottomColor: color.divider },
  radioRow: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 52 },
  radio: { width: 22, height: 22, flexShrink: 0, borderRadius: 11, borderWidth: 2, borderColor: color.lineStrong, alignItems: 'center', justifyContent: 'center' },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: color.primary },
  radioTitle: { fontFamily: font.bodyMedium, fontSize: 15, color: color.ink },
  radioSub: { fontFamily: font.body, fontSize: 12, color: color.ink2 },
  seg: { flexDirection: 'row', gap: 4, padding: 4, backgroundColor: color.muted, borderRadius: 999 },
  segItem: { flexGrow: 1, flexShrink: 1, flexBasis: 0, minWidth: 0, height: 34, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  segText: { fontFamily: font.bodyMedium, fontSize: 13, color: color.ink2 },
  segTextOn: { fontFamily: font.bodyBold, color: color.ink },
  hint: { fontFamily: font.body, fontSize: 12, color: color.ink2, lineHeight: 17 },
  info: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, paddingVertical: 12, paddingHorizontal: 14, backgroundColor: color.primaryTint, borderRadius: 16 },
  infoText: { fontFamily: font.body, fontSize: 13, color: color.ink, lineHeight: 18, flexShrink: 1 },
  infoBold: { fontFamily: font.bodyBold, color: color.primaryStrong },
  remove: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 38 },
  removeText: { fontFamily: font.bodySemi, fontSize: 14, color: color.badInk },
});
