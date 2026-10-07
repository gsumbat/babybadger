import Head from 'expo-router/head';
import { Linking, StyleSheet, View } from 'react-native';

import { Bullet, FamilyClosed, FamilyPage, Store } from '@/components/familyLink';
import { Text } from '@/components/Text';
import { Button, ErrorText, Screen } from '@/components/ui';
import { familyPhrase, memberClosedCopy, memberLandingTitle, memberLinkAppUrl, roleLabel, type MemberLinkDetails, type MemberLinkPreview } from '@/lib/family-members';
import { namesLine, storeButton } from '@/lib/invite-links';
import { cardShadow, color, font } from '@/theme';

// Wireframes M0 Family member link (babybadger.app/m/<token>, web and the app signed out) and P78d Join the family (in
// the app, signed in). The route is app/m/[token].tsx.

/** M0 link preview tags (iMessage, WhatsApp…). Static, like InviteHead: the family's name would need a server. */
export function MemberLinkHead() {
  return (
    <Head>
      <title>You’re invited to a family on BabyBadger</title>
      <meta name="description" content="See the kids’ schedule, the sitter’s updates and photos, and message the sitter." />
      <meta property="og:title" content="You’re invited to a family on BabyBadger" />
      <meta property="og:description" content="See the kids’ schedule, the sitter’s updates and photos, and message the sitter." />
      <meta property="og:site_name" content="BabyBadger" />
      <meta property="og:type" content="website" />
      <meta property="og:image" content="https://babybadger.app/og.png" />
    </Head>
  );
}

/** M0 / P78d family card: the inviter's initial, the family name, a sub-line and a pill. */
function FamilyCard({ letter, title, sub, pill, pillKind = 'ok', big }: { letter: string; title: string; sub: string; pill?: string; pillKind?: 'ok' | 'muted' | 'info'; big?: boolean }) {
  const size = big ? 44 : 36;
  const tones = { ok: [color.okTint, color.okInk, color.ok], muted: [color.muted, color.ink2, '#8A979D'], info: [color.primaryTint, color.primaryStrong, color.primary] }[pillKind];
  return (
    <View style={[st.card, big && { paddingVertical: 14, paddingHorizontal: 16 }]}>
      <View style={[st.face, { width: size, height: size, borderRadius: size / 2 }]}>
        <Text style={[st.faceText, big && { fontSize: 18 }]}>{letter}</Text>
      </View>
      <View style={{ flexGrow: 1, flexShrink: 1, minWidth: 0 }}>
        <Text style={big ? st.cardTitleBig : st.cardTitle}>{title}</Text>
        <Text style={big ? st.cardSubBig : st.cardSub}>{sub}</Text>
      </View>
      {pill ? (
        <View style={[st.pill, { backgroundColor: tones[0] }]}>
          <View style={[st.pillDot, { backgroundColor: tones[2] }]} />
          <Text style={[st.pillText, { color: tones[1] }]}>{pill}</Text>
        </View>
      ) : null}
    </View>
  );
}

/**
 * M0: what babybadger.app/m/<token> shows (web, and the app signed out). "Join the Lee family" keeps the link on the
 * device and goes to sign-in (new people create their account there); "I already have BabyBadger" opens the app on the
 * web, or sign-in in the app. Shows only the family name and the inviter's first name.
 */
export function MemberLanding({ token, preview, onJoin, onHaveApp }: { token: string; preview: MemberLinkPreview | undefined; onJoin: () => void; onHaveApp?: () => void }) {
  const p = preview ?? { status: 'unknown' as const };
  const closed = memberClosedCopy(p.status);
  if (closed) return <FamilyClosed title={closed.title} body={closed.body} />;
  const ios = storeButton('ios');
  const android = storeButton('android');
  const who = p.invited_by?.trim() || '';
  const fam = p.family_name?.trim() || 'The family';
  return (
    <FamilyPage>
      <View style={{ gap: 6 }}>
        <Text style={st.h1}>{preview ? memberLandingTitle(p) : ' '}</Text>
        <Text style={st.lead}>See the kids’ schedule, the sitter’s updates and photos, and message the sitter.</Text>
      </View>
      {preview ? <FamilyCard letter={(who[0] ?? fam[0] ?? 'F').toUpperCase()} title={fam} sub={who ? `From ${who} · invite saved` : 'Invite saved'} pill="Saved" /> : <View style={[st.card, { height: 60 }]} />}
      <View style={{ gap: 10 }}>
        <Bullet icon="lock">{`Only the people ${who || 'a parent'} adds can join. Up to 4 per family.`}</Bullet>
        <Bullet icon="clock">Covered by the family’s plan. Nothing to pay.</Bullet>
      </View>
      <Button label={`Join ${familyPhrase(p.family_name)}`} onPress={onJoin} />
      <Store label={ios.label} url={ios.url} />
      <Store label={android.label} url={android.url} />
      <Text accessibilityRole="link" style={st.link} onPress={onHaveApp ?? (() => void Linking.openURL(memberLinkAppUrl(token)).catch(() => {}))}>
        I already have BabyBadger
      </Text>
      <View style={{ flexGrow: 1 }} />
      <Text style={st.foot}>{who ? `${who} sent you this link.` : 'A parent sent you this link.'} It works for 7 days.</Text>
    </FamilyPage>
  );
}

/** P78d Join the Lee family (signed in): the role, what they'll see, Join / Not now. */
export function JoinFamily({ d, busy, err, onJoin, onNotNow, onBack }: { d: MemberLinkDetails; busy: boolean; err: string; onJoin: () => void; onNotNow: () => void; onBack: () => void }) {
  const fam = familyPhrase(d.family_name);
  const who = d.invited_by?.trim() || 'A parent';
  const kids = namesLine(d.kids ?? []);
  const helper = d.role === 'helper';
  const kidsLine = kids || 'the kids';
  return (
    <Screen
      title={`Join ${fam}`}
      back
      onBack={onBack}
      gap={16}
      footer={
        <View style={{ gap: 8, marginTop: -4 }}>
          <Button label={`Join ${fam}`} onPress={onJoin} busy={busy} />
          <Text accessibilityRole="link" style={st.notNow} onPress={onNotNow}>
            Not now
          </Text>
        </View>
      }>
      <Text style={st.leadApp}>{`${who} added you as ${helper ? 'a family helper' : 'a parent'}.`}</Text>
      <FamilyCard big letter={(who[0] ?? 'F').toUpperCase()} title={d.family_name?.trim() || 'The family'} sub={`${kids ? `${kids} · ` : ''}from ${who}`} pill={roleLabel(d.role)} pillKind={helper ? 'muted' : 'info'} />
      <View style={{ gap: 10 }}>
        <Bullet icon="eye">{`See ${kidsLine}’s schedule, the live shift and the sitter’s updates.`}</Bullet>
        <Bullet icon="message-square">Message the sitter.</Bullet>
        {helper ? <Bullet icon="lock">{`${who} and the other parents manage sitters, pay and the plan.`}</Bullet> : <Bullet icon="users">Book shifts, invite sitters and manage the plan.</Bullet>}
        <Bullet icon="clock">Covered by the family’s plan. Nothing to pay.</Bullet>
      </View>
      <ErrorText>{err}</ErrorText>
    </Screen>
  );
}

// Values from wireframes M0 (S0f's page) and P78d.
const st = StyleSheet.create({
  h1: { fontFamily: font.display, fontSize: 28, lineHeight: 34, color: color.ink },
  lead: { fontFamily: font.body, fontSize: 15, lineHeight: 22, color: color.ink2 },
  leadApp: { fontFamily: font.body, fontSize: 15, lineHeight: 22, color: color.ink2 },
  card: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, paddingHorizontal: 14, backgroundColor: '#FFFFFF', borderRadius: 24, ...cardShadow },
  face: { backgroundColor: color.primary, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  faceText: { fontFamily: font.displayBold, fontSize: 16, color: '#FFFFFF' },
  cardTitle: { fontFamily: font.bodyBold, fontSize: 14, color: color.ink },
  cardSub: { fontFamily: font.body, fontSize: 12, color: color.ink2 },
  cardTitleBig: { fontFamily: font.bodyBold, fontSize: 15, color: color.ink },
  cardSubBig: { fontFamily: font.body, fontSize: 13, lineHeight: 18, color: color.ink2 },
  pill: { height: 26, paddingHorizontal: 10, borderRadius: 999, flexDirection: 'row', alignItems: 'center', gap: 6, flexShrink: 0 },
  pillDot: { width: 7, height: 7, borderRadius: 4 },
  pillText: { fontFamily: font.bodyBold, fontSize: 12 },
  link: { fontFamily: font.bodySemi, fontSize: 15, color: color.primary, textAlign: 'center', textDecorationLine: 'underline' },
  foot: { fontFamily: font.body, fontSize: 12, lineHeight: 17, color: color.ink2, textAlign: 'center' },
  notNow: { fontFamily: font.bodySemi, fontSize: 15, color: color.primary, textAlign: 'center', textDecorationLine: 'underline' },
});
