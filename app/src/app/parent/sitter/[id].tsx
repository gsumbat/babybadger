import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, Platform, Pressable, StyleSheet, View } from 'react-native';

import { CIcon, CredTile, credTileKey, SitterAvatar } from '@/components/credentials';
import { Text } from '@/components/Text';
import { Button, ErrorText, Loading, Pill, Screen } from '@/components/ui';
import { formatHours, hoursOf } from '@/lib/calendar-logic';
import { certificates, credentialState, levelLabel, monthDay, monthYear, shortExpiry, shortName, sitterBundle, sortLanguages, toDay, type Credential } from '@/lib/credentials';
import { api, useQuery } from '@/lib/data';
import { dayOf } from '@/lib/format';
import { requirementStatus } from '@/lib/requirements';
import { useSession } from '@/lib/session';
import { errorText, supabase } from '@/lib/supabase';
import { cardShadow, color, font } from '@/theme';

// Wireframe P11 Sitter profile, from app/src/wireframes/P11.tsx. Opened from an active sitter on the Sitters tab (P54).
// What a parent sees of a sitter: badges and dates only, never documents (nP7a). Credentials show only while they
// count (verified and not expired; "Expires Oct 22" in amber within 30 days); the background check reads "Checked
// <month>". The requirements banner (lib/requirements, migration 20) opens P7a; hidden when the family has none.
// Left out until built: "Monitoring notice · View copy", "Can pick up from", the "Maya has been reminded." line (no
// reminders are sent yet), a sitter-specific booking (Book a shift opens the usual booking screen).
// Not drawn: the banner when she meets them all with nothing expiring (green) or is missing some, "Not signed" for
// location consent, no credentials yet, the remove confirm.
export default function SitterProfile() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { family } = useSession();
  const fid = family!.id;
  const { data, error } = useQuery(async () => {
    const [sitters, shifts, bundle, req, consent] = await Promise.all([
      api.familySitters(fid),
      api.familyShifts(fid),
      sitterBundle(id),
      requirementStatus(fid, id),
      supabase.from('consents').select('signed_at').eq('family_id', fid).eq('sitter_id', id).order('signed_at', { ascending: false }).limit(1),
    ]);
    return { link: sitters.find((s) => s.sitter_id === id), shifts: shifts.filter((s) => s.sitter_id === id), bundle, req, signedAt: (consent.data?.[0]?.signed_at as string | undefined) ?? null };
  }, [fid, id]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  if (!data) return error ? <Screen back title="Sitter"><ErrorText>{error}</ErrorText></Screen> : <Loading />;

  const full = data.link?.profile?.full_name || 'Sitter';
  const name = shortName(full) || full;
  const first = full.split(/\s+/)[0];
  const done = data.shifts.filter((s) => s.status === 'completed');
  const last = [...done].sort((a, b) => b.starts_at.localeCompare(a.starts_at))[0];
  const rate = (data.link as { rate?: number | null } | undefined)?.rate;
  const stats = [`${done.length} ${done.length === 1 ? 'shift' : 'shifts'}`, `${formatHours(hoursOf(done))} hrs`, rate != null ? `$${Number(rate).toFixed(Number(rate) % 1 ? 2 : 0)} / hr` : ''].filter(Boolean).join(' · ');
  const shown = data.bundle.creds.filter((c) => c.verified_at && credentialState(c) !== 'expired');
  // Background check first, then the certificates (P11 order: CPR + First Aid, Background, Infant CPR, Driver).
  const ordered = [...certificates(shown).slice(0, 1), ...shown.filter((c) => c.kind === 'background_check'), ...certificates(shown).slice(1)];
  const pairs: Credential[][] = [];
  for (let i = 0; i < ordered.length; i += 2) pairs.push(ordered.slice(i, i + 2));
  const req = data.req;
  const soon = req.expiring[0];

  async function remove() {
    setBusy(true);
    try {
      const { error: e } = await supabase.from('family_sitters').update({ status: 'removed' }).eq('family_id', fid).eq('sitter_id', id);
      if (e) throw e;
      router.back();
    } catch (e) {
      setErr(errorText(e));
      setBusy(false);
    }
  }
  function confirmRemove() {
    const q = `Remove ${first} from your family?`;
    if (Platform.OS === 'web') {
      if (globalThis.confirm?.(q)) remove();
      return;
    }
    Alert.alert(q, 'She can’t be booked and stops seeing your family.', [
      { text: 'Keep', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: remove },
    ]);
  }

  return (
    <Screen
      back
      title={name}
      gap={12}
      footer={
        <>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Button label="Message" kind="tonal" onPress={() => router.push('/parent/messages')} style={st.half} />
            <Button label="Book a shift" onPress={() => router.push('/parent/shift/new')} style={st.half} />
          </View>
          <Pressable accessibilityRole="button" onPress={confirmRemove} disabled={busy} style={st.removeRow}>
            <Text style={st.remove}>Remove {first} from your family</Text>
          </Pressable>
        </>
      }>
      <ErrorText>{err}</ErrorText>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
        <SitterAvatar name={full} photoPath={data.bundle.profile?.photo_path} size={64} fontSize={28} />
        <View style={{ gap: 2, flexShrink: 1 }}>
          {data.link?.joined_at ? <Text style={st.meta}>Sitting for you since {monthYear(toDay(new Date(data.link.joined_at)))}</Text> : null}
          <Text style={st.meta}>{stats}</Text>
        </View>
      </View>

      {req.total ? (
        <Pressable accessibilityRole="button" onPress={() => router.push('/parent/requirements')} style={[st.banner, req.allMet && !soon && { backgroundColor: color.okTint }]}>
          <CIcon name="warn" tint={req.allMet && !soon ? color.okInk : color.warnInk} />
          <View style={{ flexGrow: 1, flexShrink: 1 }}>
            <Text style={[st.bannerTitle, req.allMet && !soon && { color: color.okInk }]}>
              {req.allMet ? `Meets all ${req.total} of your requirements` : `Meets ${req.met} of ${req.total} of your requirements`}
            </Text>
            {!req.allMet ? (
              <Text style={st.bannerText}>Missing: {req.missing.join(', ')}.</Text>
            ) : soon ? (
              <Text style={st.bannerText}>
                One expires soon: {soon.title} on {monthDay(soon.on)}.
              </Text>
            ) : null}
          </View>
          <CIcon name="chevron" size={18} tint={req.allMet && !soon ? color.okInk : color.warnInk} />
        </Pressable>
      ) : null}

      <View style={st.card}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={st.cardTitle}>Credentials</Text>
          <Text style={st.checked}>Checked by BabyBadger</Text>
        </View>
        {pairs.length ? (
          <View style={{ gap: 12 }}>
            {pairs.map((pair, i) => (
              <View key={i} style={{ flexDirection: 'row', gap: 10 }}>
                {pair.map((c) => (
                  <Badge key={c.id} c={c} />
                ))}
                {pair.length === 1 ? <View style={{ flex: 1 }} /> : null}
              </View>
            ))}
          </View>
        ) : (
          <Text style={st.none}>No verified credentials yet.</Text>
        )}
        {data.bundle.langs.length ? (
          <View style={{ gap: 6 }}>
            <Text style={st.label}>SPEAKS</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
              {sortLanguages(data.bundle.langs).map((l) => (
                <Pill key={l.language} label={`${l.language} · ${levelLabel(l.level).toLowerCase()}`} kind="muted" />
              ))}
            </View>
          </View>
        ) : null}
      </View>

      <View style={st.list}>
        <View style={[st.row, last && st.line]}>
          <Text style={st.rowKey}>Location consent</Text>
          <View>{data.signedAt ? <Pill label={`Signed ${monthDay(toDay(new Date(data.signedAt)))}`} kind="ok" /> : <Pill label="Not signed" kind="warn" />}</View>
        </View>
        {last ? (
          <View style={st.row}>
            <Text style={st.rowKey}>Last shift</Text>
            <Pressable accessibilityRole="link" onPress={() => router.push({ pathname: '/parent/shift/[id]', params: { id: last.id } })} hitSlop={6} style={{ flexShrink: 1 }}>
              <Text style={st.link}>{dayOf(last.starts_at)} report</Text>
            </Pressable>
          </View>
        ) : null}
      </View>
    </Screen>
  );
}

const SHORT: Record<string, string> = { first_aid: 'CPR + First Aid', background: 'Background', drivers_license: 'Driver' };

/** One P11 credential: tile, short name with a green check (amber clock when it runs out within 30 days), date line. */
function Badge({ c }: { c: Credential }) {
  const key = credTileKey(c);
  const soon = credentialState(c) === 'expiring';
  const sub =
    c.kind === 'background_check'
      ? c.verified_at
        ? `Checked ${monthYear(toDay(new Date(c.verified_at)))}`
        : ''
      : soon && c.expires_on
        ? `Expires ${monthDay(c.expires_on)}`
        : c.expires_on
          ? `Until ${shortExpiry(c.expires_on)}`
          : (c.issuer ?? '');
  return (
    <View style={{ flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
      <CredTile which={key} box={36} />
      <View style={{ flexGrow: 1, flexShrink: 1, minWidth: 0 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Text style={st.badgeName} numberOfLines={1}>
            {SHORT[key] ?? c.title}
          </Text>
          {soon ? <CIcon name="clock" size={16} tint={color.warn} /> : <CIcon name="check" size={16} tint={color.ok} />}
        </View>
        {sub ? (
          <Text style={[st.badgeSub, soon && { fontFamily: font.bodySemi, color: color.warnInk }]} numberOfLines={1}>
            {sub}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

// Values from wireframe P11.
const st = StyleSheet.create({
  meta: { fontFamily: font.body, fontSize: 14, color: color.ink2 },
  banner: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, paddingHorizontal: 14, backgroundColor: color.warnTint, borderRadius: 14 },
  bannerTitle: { fontFamily: font.bodyBold, fontSize: 14, color: color.warnInk },
  bannerText: { fontFamily: font.body, fontSize: 13, lineHeight: 18, color: color.ink },
  card: { gap: 14, padding: 16, backgroundColor: '#FFFFFF', borderRadius: 24, ...cardShadow },
  cardTitle: { fontFamily: font.displayBold, fontSize: 18, color: color.ink, flexShrink: 1 },
  checked: { fontFamily: font.body, fontSize: 12, color: color.ink2, flexShrink: 1 },
  none: { fontFamily: font.body, fontSize: 14, color: color.ink2 },
  badgeName: { fontFamily: font.bodyBold, fontSize: 14, color: color.ink, flexShrink: 1 },
  badgeSub: { fontFamily: font.body, fontSize: 12, color: color.ink2 },
  label: { fontFamily: font.bodyBold, fontSize: 13, color: color.ink2, letterSpacing: 0.6 },
  list: { paddingHorizontal: 16, backgroundColor: '#FFFFFF', borderRadius: 24, ...cardShadow },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, minHeight: 48 },
  line: { borderBottomWidth: 1, borderBottomColor: color.divider },
  rowKey: { fontFamily: font.body, fontSize: 15, color: color.ink, flexShrink: 1 },
  link: { fontFamily: font.bodySemi, fontSize: 15, color: color.primary, textDecorationLine: 'underline' },
  half: { flexGrow: 1, flexBasis: 0, height: 50 },
  removeRow: { height: 36, alignItems: 'center', justifyContent: 'center' },
  remove: { fontFamily: font.bodySemi, fontSize: 14, color: color.badInk },
});
