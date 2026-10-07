// GENERATED from wireframe P37-Purchase.dc.html by tools/wf2rn/convert.py. Do not edit by hand:
// regenerate, then copy into the real screen and bind data there.
import { Text, TextInput, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { cardShadow, font } from '@/theme';

const CHECK = '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7" fill="none" stroke="#FFFFFF" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

const SVG = [
  "<svg width=\"14\" height=\"14\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #4B5960; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round\"><rect x=\"5\" y=\"11\" width=\"14\" height=\"10\" rx=\"2\"></rect><path d=\"M8 11V8a4 4 0 0 1 8 0v3\"></path></svg>"
];

/** Stripe checkout */
export default function WF_P37() {
  return (
    <View style={{ flex: 1, backgroundColor: "#F3F5F8", flexDirection: "column", overflow: "hidden" }}>
      <View style={{ flexDirection: "column", gap: 10, paddingTop: 20, paddingRight: 20, paddingBottom: 20, paddingLeft: 20, opacity: 0.35 }}>
        <Text style={{ fontFamily: font.display, fontSize: 24, color: "#1B2328" }}>Know they’re okay, every shift</Text>
        <View style={{ height: 200, backgroundColor: "#FFFFFF", borderRadius: 24, flexDirection: "column", ...cardShadow }}>
        </View>
        <View style={{ height: 70, backgroundColor: "#FFFFFF", borderRadius: 24, flexDirection: "column", ...cardShadow }}>
        </View>
      </View>
      <View style={{ backgroundColor: "rgba(27,35,40,0.5)", position: "absolute", top: 0, left: 0, right: 0, bottom: 0, flexDirection: "column" }}>
      </View>
      <View style={{ flexDirection: "column", top: 44, left: 0, right: 0, bottom: 0, backgroundColor: "#FAFBFB", borderTopLeftRadius: 16, borderTopRightRadius: 16, position: "absolute", overflow: "hidden", flexShrink: 1, minHeight: 0 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12, height: 52, flexShrink: 0, paddingTop: 0, paddingRight: 16, paddingBottom: 0, paddingLeft: 16, backgroundColor: "#FFFFFF", borderBottomWidth: 1.0, borderBottomColor: "#E6EAEF" }}>
          <View style={{ flexShrink: 1 }}><Text style={{ fontFamily: font.bodySemi, fontSize: 15, color: "#47698A" }}>Done</Text></View>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, height: 32, flexGrow: 1, backgroundColor: "#EEF1F4", borderRadius: 10, flexShrink: 1 }}>
            <SvgXml xml={SVG[0]} width={14} height={14} />
            <Text style={{ fontFamily: font.body, fontSize: 13, color: "#4B5960" }}>checkout.stripe.com</Text>
          </View>
          <View style={{ width: 38, flexShrink: 0, flexDirection: "column" }}>
          </View>
        </View>
        <View style={{ flexDirection: "column", gap: 14, flexGrow: 1, paddingTop: 18, paddingRight: 18, paddingBottom: 18, paddingLeft: 18, marginTop: 12, marginRight: 12, marginBottom: 12, marginLeft: 12, borderRadius: 20, borderWidth: 2.0, borderColor: "#9AA8AE", borderStyle: "dashed" }}>
          <View style={{ flexDirection: "row", alignSelf: "flex-start", alignItems: "center", height: 26, paddingTop: 0, paddingRight: 10, paddingBottom: 0, paddingLeft: 10, backgroundColor: "#1B2328", borderRadius: 999 }}>
            <Text style={{ fontFamily: font.bodyBold, fontSize: 12, color: "#FFFFFF" }}>Stripe Checkout · in the browser</Text>
          </View>
          <View style={{ flexDirection: "column", gap: 2 }}>
            <Text style={{ fontFamily: font.body, fontSize: 13, color: "#4B5960" }}>Try BabyBadger Family</Text>
            <Text style={{ fontFamily: font.display, fontSize: 24, color: "#1B2328", marginVertical: -4.22 }}>30 days free</Text>
            <Text style={{ fontFamily: font.body, fontSize: 13, color: "#4B5960" }}>Then $119.88 per year starting Nov 6</Text>
          </View>
          <View style={{ flexDirection: "column", gap: 8 }}>
            <View style={{ flexDirection: "row", alignItems: "center", height: 44, paddingTop: 0, paddingRight: 12, paddingBottom: 0, paddingLeft: 12, backgroundColor: "#FFFFFF", borderRadius: 10, borderWidth: 1.0, borderColor: "#DDE3EA" }}>
              <View style={{ width: "45%", height: 12, backgroundColor: "#DDE3EA", borderRadius: 6, flexShrink: 1 }}>
              </View>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", height: 44, paddingTop: 0, paddingRight: 12, paddingBottom: 0, paddingLeft: 12, backgroundColor: "#FFFFFF", borderRadius: 10, borderWidth: 1.0, borderColor: "#DDE3EA" }}>
              <View style={{ width: "70%", height: 12, backgroundColor: "#DDE3EA", borderRadius: 6, flexShrink: 1 }}>
              </View>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", height: 44, paddingTop: 0, paddingRight: 12, paddingBottom: 0, paddingLeft: 12, backgroundColor: "#FFFFFF", borderRadius: 10, borderWidth: 1.0, borderColor: "#DDE3EA" }}>
              <View style={{ width: "55%", height: 12, backgroundColor: "#DDE3EA", borderRadius: 6, flexShrink: 1 }}>
              </View>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", height: 44, paddingTop: 0, paddingRight: 12, paddingBottom: 0, paddingLeft: 12, backgroundColor: "#FFFFFF", borderRadius: 10, borderWidth: 1.0, borderColor: "#DDE3EA" }}>
              <View style={{ width: "30%", height: 12, backgroundColor: "#DDE3EA", borderRadius: 6, flexShrink: 1 }}>
              </View>
            </View>
          </View>
          <Text style={{ fontFamily: font.body, fontSize: 13, color: "#4B5960", lineHeight: 18 }}>Not designed by us: Stripe shows the price, trial terms, card form and Apple Pay or Google Pay. We only design what comes before and after. Done closes the page and goes back to the plans; nothing is charged.</Text>
          <View style={{ flexGrow: 1, flexDirection: "column" }}>
          </View>
          <View style={{ flexDirection: "row" }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 50, flexGrow: 1, flexBasis: 0, backgroundColor: "#FFFFFF", borderRadius: 999, borderWidth: 1.0, borderColor: "#C3CCD5", flexShrink: 1 }}>{/* -> P38-TrialStarted.dc.html */}
              <Text style={{ fontFamily: font.displayBold, fontSize: 17, color: "#1B2328" }}>Simulate: trial started</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}
