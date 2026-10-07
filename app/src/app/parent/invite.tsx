import * as Clipboard from 'expo-clipboard';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Linking, Pressable, Share, StyleSheet, View } from 'react-native';

import { InviteAccessFields, useInviteChoices } from '@/components/InviteAccess';
import { Button, ErrorText, Field, Icon, Screen } from '@/components/ui';
import { api, useQuery } from '@/lib/data';
import { firstName } from '@/lib/format';
import { emailOk, firstWord, inviteMailto, inviteSubject, inviteText, inviteUrl } from '@/lib/invite-links';
import { inviteApi, payLine } from '@/lib/invites';
import { ageLabel } from '@/lib/kid-profile';
import { useSession } from '@/lib/session';
import { errorText } from '@/lib/supabase';
import { cardShadow, color, font } from '@/theme';
import { Text } from '@/components/Text';

// Wireframes P3 (invite your sitter, from the Home setup list), P3b (invite a sitter, from anywhere else), P23 (who
// she looks after, what she can do, pay) and P24 (review and send). Home setup opens this with ?from=setup.
// Sending (or emailing) the invite opens P25 (invite/[id]).
// P3/P3b's Mobile number is an optional Email for now (sign-in is by email; migration 28): an existing sitter with that
// email gets the invite as a push (S0e). P24 shares the S0a text: babybadger.app/i/<token> plus the code as a fallback.
type Step = 'name' | 'access' | 'review';

export default function Invite() {
  const { from } = useLocalSearchParams<{ from?: string }>();
  // ?from=onboarding: straight after P2 (first-run family setup), "Step 2 of 3". ?from=setup: Home's list, "Step 4 of 5".
  const fromOnboarding = from === 'onboarding';
  const fromSetup = from === 'setup' || fromOnboarding;
  const { family, profile } = useSession();
  const { data } = useQuery(async () => {
    const [kids, parents] = await Promise.all([api.kids(family!.id), api.familyParents(family!.id)]);
    return { kids, parents };
  }, [family!.id]);
  const kids = data?.kids;
  const [step, setStep] = useState<Step>('name');
  const [copied, setCopied] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  // P23 choices (components/InviteAccess). Every kid starts chosen and every switch on, as the wireframe draws them.
  const c = useInviteChoices(kids);
  const [invite, setInvite] = useState<{ id: string; code: string; token: string | null } | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const first = name.trim().split(/\s+/)[0] || 'Your sitter';
  const chosenKids = (kids ?? []).filter((k) => c.picked.includes(k.id));
  const { rate, pay } = c;

  async function review() {
    setBusy(true);
    setErr('');
    const choices = c.choices();
    try {
      const inv = invite ?? (await inviteApi.create(family!.id, name.trim(), choices));
      if (invite) await inviteApi.update(invite.id, name.trim(), choices);
      else setInvite(inv);
      await inviteApi.setEmail(inv.id, email);
      setStep('review');
    } catch (e) {
      setErr(errorText(e));
    } finally {
      setBusy(false);
    }
  }

  // Wireframe P24. Send by text opens the share sheet with the S0a text (it goes from the parent's own phone), Email a
  // mailto with the same text, Copy link the babybadger.app/i/<token> link. Each marks the invite sent (an existing
  // sitter with the email gets her push then).
  if (step === 'review' && invite) {
    const { code, token } = invite;
    const to = email.trim();
    const msg = inviteText({ sitter: first === 'Your sitter' ? '' : first, parent: firstWord(profile?.full_name), kids: chosenKids.map((k) => k.name), code, token });
    const pending = () => router.replace({ pathname: '/parent/invite/[id]', params: { id: invite.id } });
    const sent = () => inviteApi.sent(invite.id).catch(() => {});
    const pill = payLine(rate, pay);
    return (
      <Screen
        title="Review and send"
        back
        onBack={() => setStep('access')}
        gap={12}
        footer={
          <View style={{ gap: 8, marginTop: -4 }}>
            <Pressable
              accessibilityRole="button"
              onPress={async () => {
                const r = await Share.share({ message: msg });
                if (r.action === Share.sharedAction) {
                  await sent();
                  pending();
                }
              }}
              style={st.sendBtn}>
              <Text style={st.sendText}>Send by text</Text>
            </Pressable>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Pressable
                accessibilityRole="button"
                onPress={async () => {
                  await Linking.openURL(inviteMailto(to || null, inviteSubject(family!.name), msg)).catch(() => {});
                  await sent();
                  pending();
                }}
                style={st.tonalBtn}>
                <Text style={st.tonalText}>Email</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                onPress={async () => {
                  await Clipboard.setStringAsync(token ? inviteUrl(token) : msg);
                  setCopied(true);
                  await sent();
                }}
                style={st.tonalBtn}>
                <Text style={st.tonalText}>{copied ? 'Copied' : 'Copy link'}</Text>
              </Pressable>
            </View>
          </View>
        }>
        <Text style={st.muted14}>{first} will see this:</Text>
        <View style={st.preview}>
          <Text style={st.previewTitle}>
            {firstName(profile?.full_name)} invited you to sit for {family!.name.replace(/^The /, 'the ')}
          </Text>
          {chosenKids.length || pill ? (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
              {chosenKids.map((k) => (
                <View key={k.id} style={st.kidPill}>
                  <View style={st.kidPillDot} />
                  <Text style={st.kidPillText}>
                    {k.name}
                    {k.birthdate ? `, ${ageLabel(k.birthdate)}` : ''}
                  </Text>
                </View>
              ))}
              {pill ? (
                <View style={st.kidPill}>
                  <View style={st.kidPillDot} />
                  <Text style={st.kidPillText}>{pill}</Text>
                </View>
              ) : null}
            </View>
          ) : null}
          <Text style={st.note13}>You’ll share location only while clocked in.</Text>
        </View>
        <View style={st.facts}>
          <View style={[st.fact, st.line]}>
            <Text style={st.factKey}>To</Text>
            <Text style={[st.factVal, { flexShrink: 1, textAlign: 'right' }]} numberOfLines={1}>
              {to ? `${first} · ${to}` : name.trim()}
            </Text>
          </View>
          <View style={st.fact}>
            <Text style={st.factKey}>Link works</Text>
            <Text style={st.factVal}>7 days, once</Text>
          </View>
        </View>
        <Text style={st.note13}>
          {first} opens the link and confirms her email with a 6-digit code. Or she enters code {code} in the app.
        </Text>
      </Screen>
    );
  }

  // Wireframe P23 (app/src/wireframes/P23.tsx). "Set sitter requirements" opens P28–P32 (requirements are per
  // family: the flow saves them for the family, then comes back here). Left out until built: the
  // trips sub-line ("School, soccer, park": saved places aren't built).
  if (step === 'access') {
    const parentNames = (data?.parents ?? []).map((p) => firstName(p.full_name)).join(' and ');
    return (
      <Screen
        title={`Invite ${first}`}
        back
        onBack={() => setStep('name')}
        gap={12}
        footer={<Button label="Review invite" onPress={review} busy={busy} disabled={!c.ready} style={{ marginTop: -4 }} />}>
        <InviteAccessFields c={c} parentNames={parentNames} />
        <ErrorText>{err}</ErrorText>
      </Screen>
    );
  }

  const info = (
    <View style={st.info}>
      <Icon name="shield" size={24} tint={color.primary} />
      <View style={{ flexShrink: 1, gap: 4 }}>
        <Text style={st.infoTitle}>{first} will be asked to agree to</Text>
        <Text style={st.infoBody}>Sharing location only while clocked in, and a monitoring notice you both keep a copy of.</Text>
      </View>
    </View>
  );
  const nameField = (
    <>
      <Field label="Name" value={name} onChangeText={setName} placeholder="Maya" autoComplete="name" autoCapitalize="words" autoFocus />
      <Field
        label="Email (optional)"
        value={email}
        onChangeText={setEmail}
        placeholder="maya@example.com"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="email"
        hint={emailOk(email) ? undefined : 'Check the email.'}
      />
    </>
  );
  const footer = (
    // P3/P3b footer: 12 px above, 10 px gap (Screen's footer has 8 and 8).
    <View style={{ gap: 10, marginTop: 4 }}>
      <Button label="Continue" onPress={() => setStep('access')} disabled={name.trim().length < 2 || !emailOk(email)} />
      <Text style={st.next}>Next: choose what {name.trim() ? first : 'she'} can do and her rate</Text>
    </View>
  );

  // Wireframe P3b: the standard back header ("Invite a sitter"), no step count, progress or skip.
  if (!fromSetup) {
    return (
      <Screen title="Invite a sitter" back gap={14} footer={footer}>
        {/* Wireframe content starts 12 px under the header; Screen's starts 4 px down. */}
        <Text style={[st.lead, { marginTop: 8 }]}>Someone you already know and trust.</Text>
        {nameField}
        {info}
        <ErrorText>{err}</ErrorText>
      </Screen>
    );
  }

  return (
    <Screen
      gap={14}
      header={
        // P3 header: back, "Step 4 of 5" (the invite is step 4 of the P4a setup list; "Step 2 of 3" after P2), Skip for now, 80% (67%) progress bar. The extra bottom padding makes up the
        // wireframe's 12 px above the title (Screen's content starts 4 px down).
        <View style={st.header}>
          <View style={st.backRow}>
            <Pressable accessibilityRole="button" accessibilityLabel="Back" onPress={() => router.back()} style={st.back}>
              <Icon name="chevron-left" size={22} tint={color.ink} strokeWidth={2} />
            </Pressable>
            <Text style={st.stepText}>{fromOnboarding ? 'Step 2 of 3' : 'Step 4 of 5'}</Text>
            <Pressable accessibilityRole="button" onPress={() => router.back()} hitSlop={10} style={{ marginLeft: 'auto' }}>
              <Text style={st.skip}>Skip for now</Text>
            </Pressable>
          </View>
          <View style={st.progress}>
            <View style={[st.progressFill, fromOnboarding && { width: '67%' }]} />
          </View>
        </View>
      }
      footer={footer}>
      <Text style={st.title}>Invite your sitter</Text>
      <Text style={[st.lead, { marginTop: -6 }]}>Someone you already know and trust. Finding new sitters comes later.</Text>
      {nameField}
      {info}
      <ErrorText>{err}</ErrorText>
    </Screen>
  );
}

const st = StyleSheet.create({
  // P3 values
  header: { paddingTop: 16, paddingHorizontal: 20, paddingBottom: 16, gap: 14 },
  backRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  back: { width: 44, height: 44, borderRadius: 22, borderWidth: 1, borderColor: color.line, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  stepText: { flexShrink: 1, fontFamily: font.bodySemi, fontSize: 14, color: color.ink2 }, // P3: no flex-grow, Skip sits right after it
  skip: { fontFamily: font.bodySemi, fontSize: 15, color: color.primary, textDecorationLine: 'underline' },
  progress: { height: 6, borderRadius: 3, backgroundColor: '#DDE3EA', overflow: 'hidden' },
  progressFill: { width: '80%', height: 6, backgroundColor: color.primary },
  title: { fontFamily: font.display, fontSize: 26, color: color.ink, marginVertical: -4.83 },
  lead: { fontFamily: font.body, fontSize: 15, lineHeight: 22, color: color.ink2 },
  next: { fontFamily: font.body, fontSize: 13, color: color.ink2, textAlign: 'center' },
  // P24 values
  muted14: { fontFamily: font.body, fontSize: 14, color: color.ink2 },
  preview: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 16, gap: 10, ...cardShadow },
  previewTitle: { fontFamily: font.display, fontSize: 20, lineHeight: 24, color: color.ink },
  kidPill: { height: 26, paddingHorizontal: 10, borderRadius: 999, backgroundColor: color.muted, flexDirection: 'row', alignItems: 'center', gap: 6 },
  kidPillDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#8A979D' },
  kidPillText: { fontFamily: font.bodyBold, fontSize: 12, color: color.ink2 },
  note13: { fontFamily: font.body, fontSize: 13, lineHeight: 18, color: color.ink2 },
  factKey: { fontFamily: font.body, fontSize: 15, color: color.ink },
  factVal: { fontFamily: font.bodySemi, fontSize: 15, color: color.ink },
  sendBtn: { height: 54, borderRadius: 999, backgroundColor: color.primary, alignItems: 'center', justifyContent: 'center' },
  sendText: { fontFamily: font.displayBold, fontSize: 17, color: '#FFFFFF' },
  tonalBtn: { flex: 1, height: 48, borderRadius: 999, backgroundColor: color.primaryTint, alignItems: 'center', justifyContent: 'center' },
  tonalText: { fontFamily: font.displayBold, fontSize: 17, color: color.primary },
  facts: { backgroundColor: '#FFFFFF', borderRadius: 24, paddingHorizontal: 16, ...cardShadow },
  fact: { flexDirection: 'row', justifyContent: 'space-between', minHeight: 48, alignItems: 'center', gap: 12 },
  line: { borderBottomWidth: 1, borderBottomColor: color.divider },
  info: { flexDirection: 'row', gap: 12, backgroundColor: color.primaryTint, borderRadius: 16, padding: 16 },
  infoTitle: { fontFamily: font.bodyBold, fontSize: 15, color: color.primaryStrong },
  infoBody: { fontFamily: font.body, fontSize: 14, lineHeight: 20, color: color.ink },
});
