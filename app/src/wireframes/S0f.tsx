// GENERATED from wireframe S0f-FamilyLink.dc.html by tools/wf2rn/convert.py. Do not edit by hand:
// regenerate, then copy into the real screen and bind data there.
import { Text, TextInput, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { cardShadow, font } from '@/theme';

const CHECK = '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7" fill="none" stroke="#FFFFFF" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

const SVG = [
  "<svg width=\"14\" height=\"14\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #4B5960; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z\"></path><path d=\"M8.5 12l2.5 2.5 4.5-4.5\"></path></svg>",
  "<svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #47698A; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><rect x=\"5\" y=\"11\" width=\"14\" height=\"10\" rx=\"2\"></rect><path d=\"M8 11V8a4 4 0 0 1 8 0v3\"></path></svg>",
  "<svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #47698A; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z\"></path><circle cx=\"12\" cy=\"12\" r=\"3\"></circle></svg>",
  "<svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #47698A; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><circle cx=\"12\" cy=\"12\" r=\"9\"></circle><path d=\"M12 7v5l3 2\"></path></svg>"
];

/** Family link */
export default function WF_S0f() {
  return (
    <View style={{ flex: 1, backgroundColor: "#F3F5F8", flexDirection: "column", overflow: "hidden" }}>
      <View style={{ paddingTop: 12, paddingRight: 14, paddingBottom: 8, paddingLeft: 14, backgroundColor: "#FFFFFF", borderBottomWidth: 1.0, borderBottomColor: "#E6EAEF", flexDirection: "column" }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, height: 34, backgroundColor: "#E8ECF1", borderRadius: 10 }}>
          <SvgXml xml={SVG[0]} width={14} height={14} />
          <Text style={{ fontFamily: font.body, fontSize: 13, color: "#1B2328" }}>babybadger.app/f/•••••</Text>
        </View>
      </View>
      <View style={{ flexDirection: "column", gap: 16, flexGrow: 1, paddingTop: 24, paddingRight: 20, paddingBottom: 16, paddingLeft: 20 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <Text style={{ fontFamily: font.body, fontSize: 22, color: "#1B2328", flexShrink: 1 }}><Text style={{ fontFamily: font.display, fontSize: 22, color: "#1B2328" }}>BabyBadger</Text></Text>
        </View>
        <View style={{ flexDirection: "column", gap: 6 }}>
          <Text style={{ fontFamily: font.display, fontSize: 28, color: "#1B2328", lineHeight: 34 }}>Maya invited you to BabyBadger</Text>
          <Text style={{ fontFamily: font.body, fontSize: 15, color: "#4B5960", lineHeight: 22 }}>She’s your sitter. See her shifts with your kids: when she clocks in, what they ate, how the day went.</Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingTop: 12, paddingRight: 14, paddingBottom: 12, paddingLeft: 14, backgroundColor: "#FFFFFF", borderRadius: 24, ...cardShadow }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 36, height: 36, flexShrink: 0, backgroundColor: "#47698A", borderRadius: 18 }}>
            <Text style={{ fontFamily: font.displayBold, fontSize: 16, color: "#FFFFFF" }}>MR</Text>
          </View>
          <View style={{ flexDirection: "column", flexGrow: 1, flexShrink: 1 }}>
            <Text style={{ fontFamily: font.bodyBold, fontSize: 14, color: "#1B2328" }}>Maya R.</Text>
            <Text style={{ fontFamily: font.body, fontSize: 12, color: "#4B5960" }}>Your sitter · invite saved</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6, height: 26, flexShrink: 0, paddingTop: 0, paddingRight: 10, paddingBottom: 0, paddingLeft: 10, backgroundColor: "#DCEEE3", borderRadius: 999 }}>
            <View style={{ width: 7, height: 7, backgroundColor: "#1F8A4D", borderRadius: 4, flexShrink: 1, flexDirection: "column" }}>
            </View>
            <Text style={{ fontFamily: font.bodyBold, fontSize: 12, color: "#1B6B3D" }}>Saved</Text>
          </View>
        </View>
        <View style={{ flexDirection: "column", gap: 10 }}>
          <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 12 }}>
            <SvgXml xml={SVG[1]} width={20} height={20} />
            <Text style={{ fontFamily: font.body, fontSize: 14, color: "#1B2328", lineHeight: 20, flexShrink: 1 }}>You stay in control: you choose which kids and what she can do.</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 12 }}>
            <SvgXml xml={SVG[2]} width={20} height={20} />
            <Text style={{ fontFamily: font.body, fontSize: 14, color: "#1B2328", lineHeight: 20, flexShrink: 1 }}>Her location shows only while she’s clocked in.</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 12 }}>
            <SvgXml xml={SVG[3]} width={20} height={20} />
            <Text style={{ fontFamily: font.body, fontSize: 14, color: "#1B2328", lineHeight: 20, flexShrink: 1 }}>Free for 30 days. Cancel anytime.</Text>
          </View>
        </View>
        <View style={{ flexDirection: "row" }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 54, flexGrow: 1, flexBasis: 0, backgroundColor: "#47698A", borderRadius: 999, flexShrink: 1 }}>{/* -> P0-SignIn.dc.html */}
            <Text style={{ fontFamily: font.displayBold, fontSize: 17, color: "#FFFFFF" }}>Start free trial</Text>
          </View>
        </View>
        <View style={{ flexDirection: "row", gap: 10 }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 48, flexGrow: 1, flexBasis: 0, backgroundColor: "#E8ECF1", borderRadius: 999, flexShrink: 1 }}>
            <Text style={{ fontFamily: font.displayBold, fontSize: 15, color: "#4B5960" }}>Coming soon to the App Store</Text>
          </View>
        </View>
        <View style={{ flexDirection: "row", gap: 10 }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 48, flexGrow: 1, flexBasis: 0, backgroundColor: "#E8ECF1", borderRadius: 999, flexShrink: 1 }}>
            <Text style={{ fontFamily: font.displayBold, fontSize: 15, color: "#4B5960" }}>Coming soon to Google Play</Text>
          </View>
        </View>
        <View style={{}}><Text style={{ fontFamily: font.bodySemi, fontSize: 15, color: "#47698A", textAlign: "center", textDecorationLine: "underline" }}>I already have BabyBadger</Text></View>
        <View style={{ flexGrow: 1, flexDirection: "column" }}>
        </View>
        <Text style={{ fontFamily: font.body, fontSize: 12, color: "#4B5960", lineHeight: 17, textAlign: "center" }}>Maya sent you this link herself. Your invite works for 30 days.</Text>
      </View>
    </View>
  );
}
