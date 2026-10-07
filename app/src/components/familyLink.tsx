import Head from 'expo-router/head';
import { type ReactNode } from 'react';
import { Linking, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { InviteAccessFields, type InviteChoicesState } from '@/components/InviteAccess';
import { Text } from '@/components/Text';
import { Button, ErrorText, Icon, Screen, type IconName } from '@/components/ui';
import { TRIAL_DAYS } from '@/lib/billing-logic';
import { familyClosedCopy, familyLandingTitle, familyLinkAppUrl, sitterShort, type FamilyLinkPreview } from '@/lib/family-links';
import { storeButton } from '@/lib/invite-links';
import { cardShadow, color, font } from '@/theme';

// Wireframes S0f Family link (babybadger.app/f/<token>, a sitter's invite to a family she already sits for) and P3d
// Connect with Maya. The route is app/f/[token].tsx.

/** S0f link preview tags (iMessage, WhatsApp…). Static, like InviteHead: the sitter's name would need a server. */
export function FamilyLinkHead() {
  return (
    <Head>
      <title>Your sitter invited you to BabyBadger</title>
      <meta name="description" content="See your sitter’s shifts with your kids. You choose what she can see." />
      <meta property="og:title" content="Your sitter invited you to BabyBadger" />
      <meta property="og:description" content="See your sitter’s shifts with your kids. You choose what she can see." />
      <meta property="og:site_name" content="BabyBadger" />
      <meta property="og:type" content="website" />
      <meta property="og:image" content="https://babybadger.app/og.png" />
    </Head>
  );
}

/** S0f page frame: the wireframe's 390 px column (24 px top, 16 gap), centred on wide screens. */
export function FamilyPage({ children }: { children: ReactNode }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={st.page}>
      <View style={[st.column, { paddingTop: 24 + insets.top, paddingBottom: Math.max(16, insets.bottom) }]}>
        <Text style={st.word}>BabyBadger</Text>
        {children}
      </View>
    </View>
  );
}

/** S0f / P3d sitter card: her initials, "Maya R.", a sub-line, and the Saved pill on S0f. */
export function SitterLinkCard({ preview, title, sub, saved, big }: { preview: FamilyLinkPreview; title: string; sub: string; saved?: boolean; big?: boolean }) {
  const size = big ? 44 : 36;
  return (
    <View style={st.card}>
      <View style={[st.face, { width: size, height: size, borderRadius: size / 2 }]}>
        <Text style={[st.faceText, big && { fontSize: 18 }]}>{preview.initials || preview.sitter_first?.[0]?.toUpperCase() || 'S'}</Text>
      </View>
      <View style={{ flexGrow: 1, flexShrink: 1, minWidth: 0 }}>
        <Text style={big ? st.cardTitleBig : st.cardTitle}>{title}</Text>
        <Text style={big ? st.cardSubBig : st.cardSub}>{sub}</Text>
      </View>
      {saved ? (
        <View style={st.pill}>
          <View style={st.pillDot} />
          <Text style={st.pillText}>Saved</Text>
        </View>
      ) : null}
    </View>
  );
}

export function Bullet({ icon, children }: { icon: IconName; children: string }) {
  return (
    <View style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
      <Icon name={icon} size={20} tint={color.primary} />
      <Text style={st.bullet}>{children}</Text>
    </View>
  );
}

/**
 * S0f: what babybadger.app/f/<token> shows (web, and the app signed out). Start free trial goes to parent sign-up;
 * "I already have BabyBadger" opens the app on the web, or sign-in in the app. The link stays saved meanwhile.
 */
export function FamilyLanding({ token, preview, onStart, onHaveApp }: { token: string; preview: FamilyLinkPreview | undefined; onStart: () => void; onHaveApp?: () => void }) {
  const p = preview ?? { status: 'unknown' as const };
  const closed = familyClosedCopy(p.status);
  if (closed) return <FamilyClosed title={closed.title} body={closed.body} />;
  const ios = storeButton('ios');
  const android = storeButton('android');
  const name = p.sitter_first?.trim() || 'Your sitter';
  return (
    <FamilyPage>
      <View style={{ gap: 6 }}>
        <Text style={st.h1}>{preview ? familyLandingTitle(p) : ' '}</Text>
        <Text style={st.lead}>{name === 'Your sitter' ? 'Your sitter uses BabyBadger.' : 'She’s your sitter.'} See her shifts with your kids: when she clocks in, what they ate, how the day went.</Text>
      </View>
      {preview ? <SitterLinkCard preview={p} title={sitterShort(p)} sub={p.sitter_first ? 'Your sitter · invite saved' : 'Invite saved'} saved /> : <View style={[st.card, { height: 60 }]} />}
      <View style={{ gap: 10 }}>
        <Bullet icon="lock">You stay in control: you choose which kids and what she can do.</Bullet>
        <Bullet icon="eye">Her location shows only while she’s clocked in.</Bullet>
        <Bullet icon="clock">{`Free for ${TRIAL_DAYS} days. Cancel anytime.`}</Bullet>
      </View>
      <Button label="Start free trial" onPress={onStart} />
      <Store label={ios.label} url={ios.url} />
      <Store label={android.label} url={android.url} />
      <Text accessibilityRole="link" style={st.link} onPress={onHaveApp ?? (() => void Linking.openURL(familyLinkAppUrl(token)).catch(() => {}))}>
        I already have BabyBadger
      </Text>
      <View style={{ flexGrow: 1 }} />
      <Text style={st.foot}>{name === 'Your sitter' ? 'Your sitter sent you this link herself.' : `${name} sent you this link herself.`} Your invite works for 30 days.</Text>
    </FamilyPage>
  );
}

/** S0f store button: 48 px, the muted "Coming soon to …" box until the store link is set. */
export function Store({ label, url }: { label: string; url: string | null }) {
  if (!url)
    return (
      <View accessibilityRole="text" style={[st.store, { backgroundColor: color.muted }]}>
        <Text style={[st.storeText, { color: color.ink2 }]}>{label}</Text>
      </View>
    );
  return (
    <Pressable accessibilityRole="link" onPress={() => void Linking.openURL(url)} style={[st.store, { backgroundColor: color.primaryTint }]}>
      <Text style={[st.storeText, { color: color.primary }]}>{label}</Text>
    </Pressable>
  );
}

/** A family link that can't be used, or that isn't for this person (a sitter). */
export function FamilyClosed({ title, body, action }: { title: string; body: string; action?: { label: string; onPress: () => void } }) {
  return (
    <FamilyPage>
      <View style={{ gap: 6 }}>
        <Text style={st.h1}>{title}</Text>
        <Text style={st.lead}>{body}</Text>
      </View>
      <View style={{ flexGrow: 1 }} />
      {action ? <Button label={action.label} onPress={action.onPress} /> : null}
    </FamilyPage>
  );
}

/** P3d Connect with Maya: P23's choices under her card; Connect makes her invite, Not now leaves it for later. */
export function ConnectSitter({
  preview,
  choices,
  parentNames,
  busy,
  err,
  onConnect,
  onNotNow,
  onBack,
}: {
  preview: FamilyLinkPreview;
  choices: InviteChoicesState;
  parentNames: string;
  busy: boolean;
  err: string;
  onConnect: () => void;
  onNotNow: () => void;
  onBack: () => void;
}) {
  const first = preview.sitter_first?.trim() || 'your sitter';
  return (
    <Screen
      title={`Connect with ${first}`}
      back
      onBack={onBack}
      gap={12}
      footer={
        <View style={{ gap: 10, marginTop: -4 }}>
          <Button label={`Connect with ${first}`} onPress={onConnect} busy={busy} disabled={!choices.ready} />
          <Text accessibilityRole="link" style={st.notNow} onPress={onNotNow}>
            Not now
          </Text>
        </View>
      }>
      <SitterLinkCard big preview={preview} title={`${sitterShort(preview)} invited you`} sub="She sees only what you choose, after she accepts and signs." />
      <InviteAccessFields c={choices} parentNames={parentNames} />
      <ErrorText>{err}</ErrorText>
    </Screen>
  );
}

// Values from wireframes S0f and P3d.
const st = StyleSheet.create({
  page: { flex: 1, backgroundColor: color.canvas, alignItems: 'center' },
  column: { flex: 1, width: '100%', maxWidth: 480, paddingHorizontal: 20, gap: 16 },
  word: { fontFamily: font.display, fontSize: 22, color: color.ink, marginVertical: -4.62 },
  h1: { fontFamily: font.display, fontSize: 28, lineHeight: 34, color: color.ink },
  lead: { fontFamily: font.body, fontSize: 15, lineHeight: 22, color: color.ink2 },
  card: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, paddingHorizontal: 14, backgroundColor: '#FFFFFF', borderRadius: 24, ...cardShadow },
  face: { backgroundColor: color.primary, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  faceText: { fontFamily: font.displayBold, fontSize: 16, color: '#FFFFFF' },
  cardTitle: { fontFamily: font.bodyBold, fontSize: 14, color: color.ink },
  cardSub: { fontFamily: font.body, fontSize: 12, color: color.ink2 },
  cardTitleBig: { fontFamily: font.bodyBold, fontSize: 15, color: color.ink },
  cardSubBig: { fontFamily: font.body, fontSize: 13, lineHeight: 18, color: color.ink2 },
  pill: { height: 26, paddingHorizontal: 10, borderRadius: 999, backgroundColor: color.okTint, flexDirection: 'row', alignItems: 'center', gap: 6, flexShrink: 0 },
  pillDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: color.ok },
  pillText: { fontFamily: font.bodyBold, fontSize: 12, color: color.okInk },
  bullet: { flexShrink: 1, fontFamily: font.body, fontSize: 14, lineHeight: 20, color: color.ink },
  store: { height: 48, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  storeText: { fontFamily: font.displayBold, fontSize: 15 },
  link: { fontFamily: font.bodySemi, fontSize: 15, color: color.primary, textAlign: 'center', textDecorationLine: 'underline' },
  foot: { fontFamily: font.body, fontSize: 12, lineHeight: 17, color: color.ink2, textAlign: 'center' },
  notNow: { fontFamily: font.bodySemi, fontSize: 15, color: color.primary, textAlign: 'center', textDecorationLine: 'underline' },
});
