// GENERATED from wireframe P0-SignIn.dc.html by tools/wf2rn/convert.py. Do not edit by hand:
// regenerate, then copy into the real screen and bind data there.
import { Image } from 'expo-image';
import { Text, TextInput, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { cardShadow, font } from '@/theme';

const CHECK = '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7" fill="none" stroke="#FFFFFF" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

const SVG = [
  
];

/** Sign in */
export default function WF_P0() {
  return (
    <View style={{ flex: 1, backgroundColor: "#F3F5F8", flexDirection: "column", overflow: "hidden" }}>
      <View style={{ flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6, height: 330, flexShrink: 0, paddingTop: 40, backgroundColor: "#47698A", borderBottomRightRadius: 32, borderBottomLeftRadius: 32 }}>
        <Image source={require('@/assets/images/badger-mascot.png')} style={{ flexShrink: 0, width: 140, height: 171 }} contentFit="contain" />
        <Text style={{ fontFamily: font.display, fontSize: 34, color: "#FFFFFF", marginVertical: -10.23 }}>BabyBadger</Text>
      </View>
      <View style={{ flexDirection: "column", gap: 14, flexGrow: 1, paddingTop: 24, paddingRight: 24, paddingBottom: 0, paddingLeft: 24 }}>
        <Text style={{ fontFamily: font.display, fontSize: 28, color: "#1B2328", marginVertical: -5.43 }}>Welcome back</Text>
        <Text style={{ fontFamily: font.body, fontSize: 16, color: "#4B5960", lineHeight: 23, marginTop: -8 }}>Sign in with your email. We’ll send you a code, no password needed.</Text>
        <View style={{ flexDirection: "column", gap: 6 }}>
          <View style={{}}><Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#1B2328" }}>Email</Text></View>
          <TextInput placeholder="you@example.com" defaultValue="jen@example.com" placeholderTextColor="#6B7980" style={{ height: 50, paddingTop: 0, paddingRight: 14, paddingBottom: 0, paddingLeft: 14, backgroundColor: "#FFFFFF", borderRadius: 8, borderWidth: 1.0, borderColor: "#C3CCD5", fontFamily: font.body, fontSize: 16, color: "#1B2328" }} />
        </View>
      </View>
      <View style={{ flexDirection: "column", gap: 14, paddingTop: 16, paddingRight: 24, paddingBottom: 32, paddingLeft: 24 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", height: 54, backgroundColor: "#47698A", borderRadius: 999 }}>{/* -> P0b-SignInCode.dc.html */}
          <Text style={{ fontFamily: font.displayBold, fontSize: 17, color: "#FFFFFF" }}>Send me a code</Text>
        </View>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <View style={{ flexShrink: 1 }}><Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#47698A", textDecorationLine: "underline" }}>I already have a code</Text></View>
          <View style={{ flexShrink: 1 }}><Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#47698A", textDecorationLine: "underline" }}>New here? Get started</Text></View>
        </View>
      </View>
    </View>
  );
}
