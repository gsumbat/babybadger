// GENERATED from wireframe P1-Welcome.dc.html by tools/wf2rn/convert.py. Do not edit by hand:
// regenerate, then copy into the real screen and bind data there.
import { Image } from 'expo-image';
import { Text, TextInput, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { cardShadow, font } from '@/theme';

const CHECK = '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7" fill="none" stroke="#FFFFFF" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

const SVG = [
  
];

/** Welcome */
export default function WF_P1() {
  return (
    <View style={{ flex: 1, backgroundColor: "#F3F5F8", flexDirection: "column", overflow: "hidden" }}>
      <View style={{ flexDirection: "column", height: 440, paddingTop: 56, paddingRight: 24, paddingBottom: 0, paddingLeft: 24, backgroundColor: "#47698A", borderBottomRightRadius: 32, borderBottomLeftRadius: 32, overflow: "hidden", flexShrink: 1, minHeight: 0 }}>
        <View style={{ flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, flexGrow: 1, paddingBottom: 28 }}>
          <Image source={require('@/assets/images/badger-mascot.png')} style={{ flexShrink: 0, width: 188, height: 230 }} contentFit="contain" />
          <Text numberOfLines={1} style={{ fontFamily: font.body, fontSize: 40, color: "#FFFFFF", marginVertical: -12.04, letterSpacing: 0 }}><Text style={{ fontFamily: font.display, fontSize: 40, color: "#FFFFFF", letterSpacing: 0 }}>BabyBadger</Text></Text>
        </View>
      </View>
      <View style={{ flexDirection: "column", gap: 10, flexGrow: 1, paddingTop: 28, paddingRight: 24, paddingBottom: 0, paddingLeft: 24 }}>
        <Text style={{ fontFamily: font.display, fontSize: 28, color: "#1B2328", lineHeight: 34 }}>Know how the day is going, even when you're away</Text>
        <Text style={{ fontFamily: font.body, fontSize: 16, color: "#4B5960", lineHeight: 23 }}>Your sitter clocks in and you see the shift: where they are, tasks done, meals eaten.</Text>
      </View>
      <View style={{ flexDirection: "column", gap: 10, paddingTop: 16, paddingRight: 24, paddingBottom: 32, paddingLeft: 24 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", height: 54, backgroundColor: "#47698A", borderRadius: 999 }}>{/* -> P2-AddKids.dc.html */}
          <Text style={{ fontFamily: font.displayBold, fontSize: 17, color: "#FFFFFF" }}>I'm a parent</Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", height: 54, backgroundColor: "#FFFFFF", borderRadius: 999, borderWidth: 1.5, borderColor: "#47698A" }}>{/* -> S0d-CreateAccount.dc.html */}
          <Text style={{ fontFamily: font.displayBold, fontSize: 17, color: "#47698A" }}>I'm a sitter</Text>
        </View>
        <View style={{ flexDirection: "row", justifyContent: "space-between", paddingTop: 6 }}>
          <View style={{ flexShrink: 1 }}><Text style={{ fontFamily: font.body, fontSize: 14, color: "#47698A", textDecorationLine: "underline" }}>I have a kid code</Text></View>
          <View style={{ flexShrink: 1 }}><Text style={{ fontFamily: font.body, fontSize: 14, color: "#47698A", textDecorationLine: "underline" }}>Sign in</Text></View>
        </View>
      </View>
    </View>
  );
}
