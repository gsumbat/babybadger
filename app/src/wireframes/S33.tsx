// GENERATED from wireframe S33-PoolRequest.dc.html by tools/wf2rn/convert.py. Do not edit by hand:
// regenerate, then copy into the real screen and bind data there.
import { Text, TextInput, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { cardShadow, font } from '@/theme';

const CHECK = '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7" fill="none" stroke="#FFFFFF" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

const SVG = [
  "<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" style=\"fill: none; stroke: #1B2328; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M15 6l-6 6 6 6\"></path></svg>",
  "<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #34526E; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><circle cx=\"9\" cy=\"8\" r=\"3.5\"></circle><path d=\"M2.5 20c0-3.5 3-5.5 6.5-5.5s6.5 2 6.5 5.5M16 4.8a3.5 3.5 0 0 1 0 6.4M18.5 14.8c1.8.7 3 2.3 3 4.7\"></path></svg>"
];

/** Shift request from your pool */
export default function WF_S33() {
  return (
    <View style={{ flex: 1, backgroundColor: "#F3F5F8", flexDirection: "column", overflow: "hidden" }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingTop: 16, paddingRight: 20, paddingBottom: 8, paddingLeft: 20 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 44, height: 44, flexShrink: 0, backgroundColor: "#FFFFFF", borderRadius: 22, borderWidth: 1.0, borderColor: "#E6EAEF" }}>{/* -> S3-Today.dc.html */}
          <SvgXml xml={SVG[0]} width={22} height={22} />
        </View>
        <Text style={{ fontFamily: font.display, fontSize: 22, color: "#1B2328", marginVertical: -4.62, flexGrow: 1, flexShrink: 1 }}>Shift request</Text>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6, height: 26, flexShrink: 0, paddingTop: 0, paddingRight: 10, paddingBottom: 0, paddingLeft: 10, backgroundColor: "#F6E3C6", borderRadius: 999 }}>
          <View style={{ width: 7, height: 7, backgroundColor: "#B7791F", borderRadius: 4, flexShrink: 1, flexDirection: "column" }}>
          </View>
          <Text style={{ fontFamily: font.bodyBold, fontSize: 12, color: "#7A4E0E" }}>11 h left</Text>
        </View>
      </View>
      <View style={{ flexDirection: "column", gap: 12, flexGrow: 1, paddingTop: 4, paddingRight: 20, paddingBottom: 12, paddingLeft: 20 }}>
        <View style={{ flexDirection: "row", backgroundColor: "#FFFFFF", borderRadius: 24, overflow: "hidden", flexShrink: 1, minHeight: 0, ...cardShadow }}>
          <View style={{ width: 6, flexShrink: 0, backgroundColor: "#2F6FD6", flexDirection: "column" }}>
          </View>
          <View style={{ flexDirection: "column", gap: 8, flexGrow: 1, paddingTop: 16, paddingRight: 16, paddingBottom: 16, paddingLeft: 16, flexShrink: 1 }}>
            <Text style={{ fontFamily: font.display, fontSize: 20, color: "#1B2328", marginVertical: -4.02 }}>The Lee family</Text>
            <Text style={{ fontFamily: font.bodyBold, fontSize: 16, color: "#1B2328" }}>Sat, Oct 10 · 6:00 – 10:00 PM</Text>
            <Text style={{ fontFamily: font.body, fontSize: 14, color: "#4B5960" }}>Ava, 7 · Leo, 4 · at their home</Text>
            <Text style={{ fontFamily: font.body, fontSize: 14, color: "#4B5960" }}>4 hrs · [RATE] / hr</Text>
          </View>
        </View>
        <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 10, paddingTop: 12, paddingRight: 14, paddingBottom: 12, paddingLeft: 14, backgroundColor: "#DCE7F1", borderRadius: 16 }}>
          <SvgXml xml={SVG[1]} width={22} height={22} />
          <Text style={{ fontFamily: font.body, fontSize: 14, color: "#34526E", lineHeight: 20, flexShrink: 1 }}><Text style={{ fontFamily: font.bodyBold, fontSize: 14, color: "#34526E", lineHeight: 20 }}>Sent to a few sitters.</Text> The first to accept gets the shift. If someone beats you to it, we'll let you know.</Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6, height: 26, flexShrink: 0, paddingTop: 0, paddingRight: 10, paddingBottom: 0, paddingLeft: 10, backgroundColor: "#DCEEE3", borderRadius: 999 }}>
            <View style={{ width: 7, height: 7, backgroundColor: "#1F8A4D", borderRadius: 4, flexShrink: 1, flexDirection: "column" }}>
            </View>
            <Text style={{ fontFamily: font.bodyBold, fontSize: 12, color: "#1B6B3D" }}>Fits your calendar</Text>
          </View>
          <Text style={{ fontFamily: font.body, fontSize: 13, color: "#4B5960", flexShrink: 1 }}>Nothing else that evening</Text>
        </View>
        <View style={{ flexDirection: "column", gap: 6, paddingTop: 14, paddingRight: 16, paddingBottom: 14, paddingLeft: 16, backgroundColor: "#FFFFFF", borderRadius: 24, ...cardShadow }}>
          <Text style={{ fontFamily: font.bodyBold, fontSize: 13, color: "#4B5960", letterSpacing: 0.6 }}>NOTE FROM JEN</Text>
          <Text style={{ fontFamily: font.body, fontSize: 15, color: "#1B2328", lineHeight: 22 }}>"Date night. Kids in bed by 8, pizza in the fridge."</Text>
        </View>
        <View style={{}}><Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#47698A", textDecorationLine: "underline" }}>See the care plan</Text></View>
        <View style={{ flexDirection: "row", gap: 10, marginTop: "auto" }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 54, flexGrow: 1, flexBasis: 0, backgroundColor: "#FFFFFF", borderRadius: 999, borderWidth: 1.0, borderColor: "#C3CCD5", flexShrink: 1 }}>{/* -> S3-Today.dc.html */}
            <Text style={{ fontFamily: font.displayBold, fontSize: 17, color: "#1B2328" }}>Decline</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 54, flexGrow: 1, flexBasis: 0, backgroundColor: "#47698A", borderRadius: 999, flexShrink: 1 }}>{/* -> S6-Calendar.dc.html */}
            <Text style={{ fontFamily: font.displayBold, fontSize: 17, color: "#FFFFFF" }}>Accept shift</Text>
          </View>
        </View>
        <View style={{ alignSelf: "center" }}><Text style={{ fontFamily: font.body, fontSize: 12, color: "#4B5960", textDecorationLine: "underline" }}>Prototype: someone else accepted</Text></View>
      </View>
    </View>
  );
}
