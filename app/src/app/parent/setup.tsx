import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { KidDot } from '@/components/bits';
import { Button, ErrorText, Icon, Screen } from '@/components/ui';
import { api, useQuery } from '@/lib/data';
import { markFamilySetup } from '@/lib/home-route';
import { ageInMonths, ageLabel } from '@/lib/kid-profile';
import { DEFAULT_RADIUS_FT, geocode, mainHome, placesApi } from '@/lib/places';
import { useSession } from '@/lib/session';
import { errorText } from '@/lib/supabase';
import type { Kid } from '@/lib/types';
import { cardShadow, color, font } from '@/theme';
import { Text, TextInput } from '@/components/Text';

// Wireframe P2 AddKids, translated from app/src/wireframes/P2.tsx. Shown once, right after a new parent creates the
// family (onboarding marks it; see lib/home-route). Existing parents never see it.
// Step counter: P2 is "Step 1 of 3" as drawn; it continues to P3 Invite, which reads "Step 2 of 3" when it comes from
// here (P3 keeps "Step 4 of 5" when it opens from Home's setup list, P4a); step 3 is booking the first shift from
// Home. Back and "Skip for now" on P3 land on Home.
// The kids rows open P55; "Add another child" opens the add-a-child flow (P18 → P19 → P21 → P22). The home address
// becomes the family's main home (P56/P57's clock-in zone), looked up on the map on a phone; "Add a second home"
// saves it first, then opens P58.
// Left out: the school line under a kid ("school: Lincoln Elementary"; no school stored), address suggestions while
// typing (P58 has them). Not drawn: no kids yet ("Add a child", Continue waits for one), the saved-address error.
function kidLine(k: Kid) {
  // "Age 7" from 2 years on (as P2 draws it); months below that ("Age 14 months").
  const m = k.birthdate ? ageInMonths(k.birthdate) : null;
  const age = m == null ? '' : m >= 24 ? `Age ${Math.floor(m / 12)}` : `Age ${ageLabel(k.birthdate)}`;
  return [age, k.avoid_foods ? 'food to avoid set' : ''].filter(Boolean).join(' · ');
}

export default function FamilySetup() {
  const { family } = useSession();
  const fid = family!.id;
  const { data, error } = useQuery(async () => {
    // places arrives with migration 16; until it's run the address just isn't saved.
    const [kids, places] = await Promise.all([api.kids(fid), placesApi.list(fid).catch(() => null)]);
    return { kids, places };
  }, [fid]);
  const home = data?.places ? mainHome(data.places) : undefined;
  const [address, setAddress] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  // Coming back to P2 (e.g. after P58): show the saved main home's address.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (home?.address && !address) setAddress(home.address);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [home?.id]);

  /** Saves the typed address as the main home (new or changed). False when it couldn't be saved. */
  async function saveHome() {
    const a = address.trim();
    if (!a || (home && home.address === a)) return true;
    try {
      const at = await geocode(a);
      if (home) await placesApi.upsert(fid, { ...toInput(home), address: a, lat: at?.lat ?? null, lng: at?.lng ?? null }, home.id);
      else
        await placesApi.upsert(fid, {
          kind: 'home',
          name: 'Home',
          address: a,
          lat: at?.lat ?? null,
          lng: at?.lng ?? null,
          radius_ft: DEFAULT_RADIUS_FT,
          kid_ids: null,
          days: null,
          is_main: true,
          show_address: true,
          notes: null,
        });
      return true;
    } catch (e) {
      setErr(errorText(e));
      return false;
    }
  }

  async function secondHome() {
    setBusy(true);
    setErr('');
    const ok = await saveHome();
    setBusy(false);
    if (ok) router.push('/parent/places/new?kind=home');
  }

  async function next() {
    setBusy(true);
    setErr('');
    const ok = await saveHome();
    setBusy(false);
    if (!ok) return;
    markFamilySetup(null);
    router.replace('/parent');
    router.push('/parent/invite?from=onboarding');
  }

  function leave() {
    markFamilySetup(null);
    router.replace('/parent');
  }

  const kids = data?.kids ?? [];
  return (
    <Screen
      gap={14}
      header={
        // P2 header: back, "Step 1 of 3", 33% bar. The extra bottom padding makes up the wireframe's 12 px content top.
        <View style={st.header}>
          <View style={st.backRow}>
            <Pressable accessibilityRole="button" accessibilityLabel="Back" onPress={leave} style={st.back}>
              <Icon name="chevron-left" size={22} tint={color.ink} strokeWidth={2} />
            </Pressable>
            <Text style={st.stepText}>Step 1 of 3</Text>
          </View>
          <View style={st.progress}>
            <View style={st.progressFill} />
          </View>
        </View>
      }
      footer={<Button label="Continue" onPress={next} busy={busy} disabled={!kids.length} />}>
      <ErrorText>{error}</ErrorText>
      <Text style={st.title}>Who are we looking after?</Text>
      {kids.length ? (
        <View style={st.card}>
          {kids.map((k, i) => (
            <Pressable key={k.id} accessibilityRole="button" onPress={() => router.push(`/parent/kid/${k.id}`)} style={[st.kidRow, i < kids.length - 1 && st.line]}>
              <KidDot kid={k} size={48} />
              <View style={{ flexGrow: 1, flexShrink: 1 }}>
                <Text style={st.kidName}>{k.name}</Text>
                {kidLine(k) ? <Text style={st.kidSub}>{kidLine(k)}</Text> : null}
              </View>
              <Icon name="chevron-right" size={22} tint={color.quiet} strokeWidth={2} />
            </Pressable>
          ))}
        </View>
      ) : null}
      <Pressable accessibilityRole="button" onPress={() => router.push('/parent/kid/new')} style={st.addKid}>
        <Icon name="plus" size={20} strokeWidth={2} />
        <Text style={st.addKidText}>{kids.length ? 'Add another child' : 'Add a child'}</Text>
      </Pressable>

      <View style={{ gap: 6, marginTop: 8 }}>
        <Text style={st.fieldLabel}>Home address</Text>
        <TextInput
          value={address}
          onChangeText={setAddress}
          placeholder="Start typing your address"
          placeholderTextColor={color.quiet}
          autoComplete="street-address"
          textContentType="fullStreetAddress"
          style={st.input}
        />
        <Text style={st.hint}>Your sitter can clock in only when they’re here, so you know the shift really started.</Text>
        <Pressable accessibilityRole="button" onPress={secondHome} disabled={busy} style={st.secondHome}>
          <Icon name="plus" size={18} strokeWidth={2.2} />
          <Text style={st.secondHomeText}>Add a second home</Text>
        </Pressable>
      </View>
      <ErrorText>{err}</ErrorText>
    </Screen>
  );
}

function toInput(p: NonNullable<ReturnType<typeof mainHome>>) {
  const { kind, name, address, lat, lng, radius_ft, kid_ids, days, is_main, show_address, notes } = p;
  return { kind, name, address, lat, lng, radius_ft, kid_ids, days, is_main, show_address, notes };
}

// Values from wireframe P2.
const st = StyleSheet.create({
  header: { paddingTop: 16, paddingHorizontal: 20, paddingBottom: 16, gap: 14 },
  backRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  back: { width: 44, height: 44, borderRadius: 22, borderWidth: 1, borderColor: color.line, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  stepText: { flexShrink: 1, fontFamily: font.bodySemi, fontSize: 14, color: color.ink2 },
  progress: { height: 6, borderRadius: 3, backgroundColor: '#DDE3EA', overflow: 'hidden' },
  progressFill: { width: '33%', height: 6, backgroundColor: color.primary },
  title: { fontFamily: font.display, fontSize: 26, color: color.ink, marginVertical: -4.83 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 24, ...cardShadow },
  kidRow: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14, paddingHorizontal: 16 },
  line: { borderBottomWidth: 1, borderBottomColor: color.divider },
  kidName: { fontFamily: font.displayBold, fontSize: 17, color: color.ink },
  kidSub: { fontFamily: font.body, fontSize: 14, color: color.ink2 },
  addKid: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: 52, borderRadius: 999, borderWidth: 2, borderColor: '#C9D3DD', borderStyle: 'dashed' },
  addKidText: { fontFamily: font.displayBold, fontSize: 16, color: color.primary },
  fieldLabel: { fontFamily: font.bodySemi, fontSize: 14, color: color.ink },
  input: { height: 50, paddingHorizontal: 14, backgroundColor: '#FFFFFF', borderRadius: 8, borderWidth: 1, borderColor: color.lineStrong, fontFamily: font.body, fontSize: 16, color: color.ink },
  hint: { fontFamily: font.body, fontSize: 13, lineHeight: 18, color: color.ink2 },
  secondHome: { flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 44 },
  secondHomeText: { fontFamily: font.bodyBold, fontSize: 15, color: color.primary },
});
